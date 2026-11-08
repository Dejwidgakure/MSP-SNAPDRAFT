/* MSP SnapDraft — Mister Fantastic / Elastyczność.
 * Minimalny moduł samowystarczalny. Nie modyfikuje innych supermocy.
 * Aktywacja: po pokazaniu zawartości świeżej paczki, przed pierwszym pickiem.
 * Efekt: +4 legalne karty, +4 picki właściciela, 4 tymczasowe sloty;
 * przed końcem draftu obowiązkowy wybór 12 z nadwyżki.
 */
(function (global) {
    'use strict';
    const POWER_ID = 'mister_fantastic';
    const EXTRA = 4;
    const NORMAL = 12;
    let adapter = null;
    let pendingFinish = null;
    let currentSelection = null;
    let stretching = false;
    let stretchToken = 0;
    let state = freshState();

    function freshState() {
        return {activated:false, finalized:false, ownerName:null, ownerIndex:-1,
            packNumber:null, extraPicks:EXTRA, addedCardIds:[], finalizing:false};
    }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function notify(type,title,description) {
        const fx = global.SuperpowerFeedback;
        if (fx && typeof fx[type] === 'function') fx[type](POWER_ID,title,description);
        else if (type !== 'success') global.alert?.(`${title}\n${description}`);
    }
    function configure(source) { adapter = source; return true; }
    function reset() {
        stretchToken++;
        stretching=false;
        state=freshState();pendingFinish=null;currentSelection=null;
        global.document?.getElementById('spxFantasticOverlay')?.remove();
        global.document?.getElementById('spxFantasticCast')?.remove();
        global.document?.getElementById('spxFantasticShield')?.remove();
        global.document?.body?.classList.remove('spx-fantastic-live','spx-fantastic-stretch-lock');
    }
    // Pure queue function: preserve every original turn, postpone first Fantastic turn
    // by one position and inject 4 extra turns without merging cards or skipping picks.
    function buildQueue(original,owner,extra=EXTRA) {
        if (!Array.isArray(original) || original.length<2 || !Number.isInteger(owner)) return null;
        const queue=original.slice();
        const first=queue.indexOf(owner);
        if (first<0 || first >= queue.length-1) return null;
        let nextOther=first+1;
        while (nextOther<queue.length && queue[nextOther]===owner) nextOther++;
        if (nextOther===queue.length) return null;
        // Move the next other player in front of the first Fantastic pick.
        // This guarantees exactly one-position delay even at the snake turn-around.
        const [displaced]=queue.splice(nextOther,1);
        queue.splice(first,0,displaced);
        const firstAfter=queue.indexOf(owner);
        let inserted=0;
        const start=firstAfter+1;
        // Spread out among non-owner turns where possible; no two inserted turns touch.
        while(inserted<extra) {
            const candidates=[];
            for(let i=start;i<=queue.length;i++){
                if(queue[i-1]===owner || (i<queue.length && queue[i]===owner)) continue;
                candidates.push(i);
            }
            if(!candidates.length) break;
            // Choose a gap closest to the next evenly spaced target.
            const spacing=(queue.length-start)/(extra+1);
            const jitter=(Math.random()-0.5)*Math.min(1.8,spacing);
            const target=start+spacing*(inserted+1)+jitter;
            const chosen=candidates.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a,candidates[0]);
            queue.splice(chosen,0,owner);
            inserted++;
        }
        // For small tables (especially 2 players), consecutive extra pick(s) are unavoidable.
        while(inserted<extra){queue.push(owner);inserted++;}
        return queue;
    }
    function getDeckLimit(playerIndex) {
        return state.activated && !state.finalized && playerIndex===state.ownerIndex
            ? NORMAL+EXTRA : NORMAL;
    }
    function hasPendingPicks(order,index,packNumber) {
        return state.activated && Number(packNumber)===Number(state.packNumber) &&
            Array.isArray(order) && order.slice(Number(index)+1).some(x=>x===state.ownerIndex);
    }
    function isStretching(){return stretching;}
    function isBusy(){return Boolean(state.finalizing || stretching);}
    function getLockReason(){
        return state.finalizing?'Fantastic musi wybrać końcowe 12 kart.'
            :stretching?'Mister Fantastic właśnie rozciąga paczkę.':'';
    }
    function isActivated(){return Boolean(state.activated);}
    function exportState(){return clone(state);}
    function restoreState(value){
        state = value && typeof value==='object' ? {
            ...freshState(), ...clone(value), finalizing:false
        } : freshState();
        pendingFinish=null;currentSelection=null;
        stretchToken++;stretching=false;
        global.document?.getElementById('spxFantasticCast')?.remove();
        global.document?.getElementById('spxFantasticShield')?.remove();
        global.document?.body?.classList.remove('spx-fantastic-stretch-lock');
        global.document?.getElementById('spxFantasticOverlay')?.remove();
        global.document?.body?.classList.toggle('spx-fantastic-live',Boolean(state.activated&&!state.finalized));
    }
    // Visual-only sequence. The gameplay mutation is committed before this runs;
    // state remains correct if the animation is interrupted or motion is reduced.
    function animatePackStretch(onReveal) {
        const doc=global.document;
        const pack=doc?.getElementById('pack');
        const body=doc?.body;
        const reveal=(()=>{let called=false;return ()=>{
            if(called)return;called=true;
            try{onReveal?.();}catch(error){global.console?.warn?.('Fantastic reveal:',error);}
        };})();
        if(!pack||!body) {reveal();return Promise.resolve();}
        doc.getElementById('spxFantasticCast')?.remove();
        doc.getElementById('spxFantasticShield')?.remove();
        const reduceMotion=Boolean(global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
        if(reduceMotion){reveal();return Promise.resolve();}

        const bounds=pack.getBoundingClientRect();
        const viewportW=Math.max(320,global.innerWidth||1024);
        const viewportH=Math.max(360,global.innerHeight||768);
        const armWidth=Math.min(850,Math.max(310,viewportW*.66));
        const armHeight=armWidth*450/2172;
        const destinationLeft=Math.max(-armWidth*.25,Math.min(viewportW-armWidth*.56,bounds.right-armWidth*.90));
        const desiredTop=bounds.top+Math.min(bounds.height*.5,170)-armHeight*.5;
        const top=Math.min(viewportH-armHeight-12,Math.max(12,desiredTop));
        const shield=doc.createElement('div');
        shield.id='spxFantasticShield';
        shield.className='spx-fantastic-activity-shield';
        body.appendChild(shield);
        const layer=doc.createElement('div');
        layer.id='spxFantasticCast';
        layer.className='spx-fantastic-cast';
        layer.setAttribute('aria-hidden','true');
        layer.style.left=`${destinationLeft}px`;
        layer.style.top=`${top}px`;
        layer.style.width=`${armWidth}px`;
        layer.style.height=`${armHeight}px`;
        layer.style.setProperty('--spx-arm-enter',`${-Math.min(viewportW,armWidth*1.16)}px`);
        layer.style.setProperty('--spx-arm-pull',`${Math.min(150,Math.max(54,viewportW*.11))}px`);
        const open=doc.createElement('img');
        open.className='spx-fantastic-cast-open';
        open.src='mister-fantastic-arm-open.webp';
        open.alt='';open.draggable=false;
        const fist=doc.createElement('img');
        fist.className='spx-fantastic-cast-fist';
        fist.src='mister-fantastic-arm-grab.webp';
        fist.alt='';fist.draggable=false;
        layer.append(open,fist);
        body.appendChild(layer);
        pack.classList.add('spx-fantastic-pack-stretching');
        return new Promise(resolve=>{
            const timerA=global.setTimeout?.(()=>{
                reveal();
                pack.classList.add('spx-fantastic-pack-extended');
            },1200);
            global.setTimeout?.(()=>{
                if(timerA)global.clearTimeout?.(timerA);
                layer.remove();
                shield.remove();
                pack.classList.remove('spx-fantastic-pack-stretching','spx-fantastic-pack-extended');
                reveal();resolve();
            },2120);
        });
    }

    function start(playerName) {
        if(!adapter) {notify('error','BRAK MOSTU DRAFTU','Moduł Mistera Fantastica nie został skonfigurowany.');return false;}
        const ready=adapter.getStatus?.()||{};
        const ownerIndex=(ready.players||[]).indexOf(playerName);
        const check=global.SuperpowerEngine?.canActivate?.(playerName,POWER_ID);
        if(!check?.ok){notify('warning','SUPER MOC NIEDOSTĘPNA',check?.reason||'Nie można aktywować.');return false;}
        if(state.activated){notify('warning','ELASTYCZNOŚĆ JUŻ AKTYWNA','Nie można rozciągnąć drugiej paczki.');return false;}
        if(stretching || ready.mode!=='classic' || ready.draftFinished || !ready.packIsOpen ||
            ready.packOpeningInProgress || ready.packEnding || ready.currentPickIndex!==0 ||
            !ready.packRevealComplete || ownerIndex<0 || !Array.isArray(ready.pack) || !Array.isArray(ready.queue)){
            notify('warning','WYBIERZ ODPOWIEDNI MOMENT','Poczekaj, aż paczka w pełni się otworzy. Elastyczność działa przed pierwszym pickiem.');
            return false;
        }
        if(global.BlackHoleAnomalies?.blocksSuperpowers?.()){
            notify('warning','AKTYWNA ANOMALIA','Ta anomalia blokuje aktywację Supermocy.');return false;
        }
        if(ready.pack.some(card=>card?.joker)){
            notify('warning','NIEZGODNA PACZKA','Wersja 1.0 rozciąga paczki zwykłe i Custom, bez Joker Packów.');return false;
        }
        // Only classic one-card residue is supported; fail closed with custom buffers.
        if(ready.pack.length!==ready.queue.length+1){
            notify('warning','NIESTANDARDOWY BUFOR PACZKI','Elastyczność wymaga paczki z dokładnie jedną kartą ponad liczbę picków.');
            return false;
        }
        const expanded=buildQueue(ready.queue,ownerIndex);
        if(!expanded || expanded.length!==ready.queue.length+EXTRA){
            notify('error','BŁĄD KOLEJKI','Nie udało się przygotować czterech dodatkowych picków.');return false;
        }
        const newCards=adapter.generateCards?.(EXTRA)||[];
        if(newCards.length!==EXTRA){
            notify('error','BRAK KART','Nie ma czterech legalnych kart do rozciągnięcia paczki.');return false;
        }
        const activated=global.SuperpowerEngine?.completeActivation?.(playerName,POWER_ID,{
            packNumber:ready.packNumber,firstPickDelayedBy:1,extraPicks:EXTRA,extraCards:EXTRA
        });
        if(!activated?.ok){notify('warning','AKTYWACJA ODRZUCONA',activated?.reason||'Spróbuj ponownie.');return false;}
        // Mark only the four fresh cards. Their display order stays at the tail;
        // ordinary cards continue using the canonical pack presentation sorter.
        newCards.forEach(card=>{card.misterFantasticExtraPack=ready.packNumber;});
        // Commit only after legal cards, queue and engine activation all succeeded.
        adapter.extendPack?.(newCards);
        adapter.replaceQueue?.(expanded);
        state={...freshState(),activated:true,ownerName:playerName,ownerIndex,
            packNumber:ready.packNumber,addedCardIds:newCards.map(card=>card.instanceId||card.name)};
        adapter.setStoredUsed?.(playerName);
        global.document?.body?.classList.add('spx-fantastic-live','spx-fantastic-stretch-lock');
        // Persist the committed gameplay state independently of the visual effect.
        adapter.captureSnapshot?.('mister_fantastic_activated');
        stretching=true;
        const ownToken=++stretchToken;
        let didReveal=false;
        const reveal=()=>{
            if(didReveal || ownToken!==stretchToken) return;
            didReveal=true;
            adapter.refresh?.();
        };
        Promise.resolve().then(()=>adapter.playStretchFx?.(reveal)).catch(error=>{
            global.console?.warn?.('Fantastic stretch visual fallback:',error);
        }).finally(()=>{
            if(ownToken!==stretchToken) return;
            reveal();
            stretching=false;
            global.document?.body?.classList.remove('spx-fantastic-stretch-lock');
        });
        global.DraftStateEngine?.log?.('mister_fantastic_elasticity_cast',{
            packNumber:ready.packNumber,pickIndex:0,reason:'mister_fantastic',
            data:{playerName,addedCardIds:state.addedCardIds,queue:expanded}
        });
        notify('success','ELASTYCZNOŚĆ!',`${playerName} rozciąga paczkę: +4 karty i +4 picki!`);
        return true;
    }
    function createFinalizationUI(deck){
        const overlay=global.document.createElement('div');
        overlay.id='spxFantasticOverlay';
        overlay.className='spx-fantastic-overlay';
        overlay.innerHTML=`<section class="spx-fantastic-shell" role="dialog" aria-modal="true" aria-labelledby="spxFantasticTitle">
            <header><span>↔️ ELASTYCZNOŚĆ DOBIEGA KOŃCA</span><h2 id="spxFantasticTitle">MISTER FANTASTIC — WYBIERZ FINALNE 12 KART</h2><p>Twoja rozciągnięta talia musi wrócić do standardowego rozmiaru przed zakończeniem draftu i Planetarną Rezerwą.</p></header>
            <div id="spxFantasticList" class="spx-fantastic-list"></div>
            <footer><strong id="spxFantasticCounter"></strong><button id="spxFantasticConfirm" type="button">ZATWIERDŹ DECK 12/12</button></footer>
        </section>`;
        const list=overlay.querySelector('#spxFantasticList');
        const limit=Math.min(NORMAL,deck.length);
        currentSelection=new Set(Array.from({length:limit},(_,i)=>i));
        deck.forEach((card,index)=>{
            const button=global.document.createElement('button');
            button.type='button';button.className='spx-fantastic-card';
            button.dataset.slot=String(index);
            const name=global.document.createElement('strong');
            name.textContent=card?.name||`Karta ${index+1}`;
            const stats=global.document.createElement('small');
            stats.textContent=`${card?.cost??'?'} / ${card?.power??'?'}`;
            button.append(name,stats);
            button.addEventListener('click',()=>{
                if(currentSelection.has(index)) currentSelection.delete(index);
                else if(currentSelection.size<NORMAL) currentSelection.add(index);
                updateSelection();
            });
            list.appendChild(button);
        });
        const confirm=overlay.querySelector('#spxFantasticConfirm');
        function updateSelection(){
            list.querySelectorAll('button').forEach((button,index)=>{
                button.classList.toggle('selected',currentSelection.has(index));
                button.setAttribute('aria-pressed',currentSelection.has(index)?'true':'false');
            });
            confirm.disabled=currentSelection.size!==NORMAL;
            overlay.querySelector('#spxFantasticCounter').textContent=`WYBRANO ${currentSelection.size}/${NORMAL}`;
        }
        confirm.addEventListener('click',()=>{
            const selected=[...currentSelection].sort((a,b)=>a-b);
            if(selected.length!==NORMAL) return;
            const now=adapter.getDeck?.(state.ownerIndex)||[];
            if(now.length!==deck.length){
                notify('error','DECK ULEGŁ ZMIANIE','Odświeżono listę, wybierz karty ponownie.');
                overlay.remove();state.finalizing=false;beginFinalization(pendingFinish);return;
            }
            const result=adapter.finalizeDeck?.(state.ownerIndex,selected);
            if(!result?.ok){notify('error','NIE UDAŁO SIĘ ZATWIERDZIĆ',result?.reason||'Spróbuj ponownie.');return;}
            overlay.remove();
            state.finalizing=false;state.finalized=true;
            global.document.body?.classList.remove('spx-fantastic-live');
            adapter.refresh?.();
            const cb=pendingFinish;pendingFinish=null;currentSelection=null;
            if(typeof cb==='function') cb();
        });
        updateSelection();
        global.document.body.appendChild(overlay);
        confirm.focus();
    }
    function beginFinalization(done){
        if(state.finalizing) return true;
        if(!state.activated||state.finalized) return false;
        const deck=adapter?.getDeck?.(state.ownerIndex)||[];
        if(deck.length<=NORMAL){state.finalized=true;return false;}
        pendingFinish=done;
        state.finalizing=true;
        createFinalizationUI(deck);
        return true;
    }
    global.MisterFantasticUI={configure,reset,start,buildQueue,getDeckLimit,
        hasPendingPicks,beginFinalization,exportState,restoreState,isBusy,isStretching,animatePackStretch,getLockReason,isActivated};
})(window);
