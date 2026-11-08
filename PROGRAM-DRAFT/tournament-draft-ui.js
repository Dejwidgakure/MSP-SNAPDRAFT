/* MSP SNAPDRAFT — System Turniejowy V1 / PATCH 2
   Only Arena's post-draft preview, frozen roster and archive export.
   Does not mutate draft picks, outcomes, archived records or historical scoring.
*/
(function(root){
  'use strict';
  const VERSION='1.2.0-hotfix-ab1';
  const FORMAT='single_elimination';
  const rosterOf=names=>Array.isArray(names)?names.map(x=>String(x??'').trim()):[];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  let state={enabled:false,players:[],bracket:null,revealCompleted:false};
  let revealRunning=false;
  let revealTimers=[];
  function stopReveal(){
    revealTimers.forEach(id=>root.clearTimeout?.(id));
    revealTimers=[];
    revealRunning=false;
  }
  function revealButton(){return document.getElementById('sdRevealTournamentBtn');}
  function updateRevealButton(){
    const button=revealButton();
    if(!button)return;
    const available=Boolean(state.enabled&&state.bracket);
    button.hidden=!available;
    button.disabled=revealRunning;
    button.textContent=revealRunning?'✨ ODKRYWANIE DRABINKI…':state.revealCompleted?'🏆 POKAŻ DRABINKĘ':'🎲 LOSUJ DRABINKĘ';
    button.onclick=revealBracket;
  }

  function getEngine(){
    if(!root.DraftTournamentEngine?.buildBracket) throw new Error('Brakuje tournament-engine.js (Patch 1).');
    return root.DraftTournamentEngine;
  }
  function sameRoster(a,b){
    return a.length===b.length&&a.every((name,i)=>name===b[i]);
  }
  function getPanel(){return document.getElementById('sdTournamentPreview');}
  function setFinishSubtitle(){
    const subtitle=document.querySelector('#draftFinishPanel .draft-finish-subtitle');
    if(subtitle){
      if(!subtitle.dataset.tournamentOriginal)subtitle.dataset.tournamentOriginal=subtitle.textContent;
      subtitle.textContent=state.enabled&&state.bracket
        ? (state.revealCompleted?'🏆 Drabinka odkryta! Pary czekają poniżej.':'🎲 Możesz teraz wylosować drabinkę!')
        : subtitle.dataset.tournamentOriginal;
    }
    // Swap only the end-of-draft artwork; do not change the actual tournament state.
    const finishJeff=document.querySelector('#draftFinishPanel .draft-finish-jeff');
    if(finishJeff){
      if(!finishJeff.dataset.tournamentOriginalSrc){
        finishJeff.dataset.tournamentOriginalSrc=finishJeff.getAttribute('src')||'draft-assets/finishjeff.png';
      }
      const isTournament=Boolean(state.enabled&&state.bracket);
      const target=isTournament
        ? '../assets/tournament/jeff_tournament_logo.webp'
        : finishJeff.dataset.tournamentOriginalSrc;
      if(finishJeff.getAttribute('src')!==target)finishJeff.setAttribute('src',target);
      finishJeff.classList.toggle('sdt-finish-tournament',isTournament);
      finishJeff.alt=isTournament?'Jeff — gospodarz turnieju':'Finish Jeff';
    }
    updateRevealButton();
  }
  function seedOnce(){
    if(root.crypto?.getRandomValues){
      const data=new Uint32Array(4);
      root.crypto.getRandomValues(data);
      return 'tournament-'+Array.from(data,n=>n.toString(16).padStart(8,'0')).join('');
    }
    // Fallback for offline / file:// environments; still generated only once.
    return `tournament-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  }
  const nameFor=slot=>{
    if(!slot)return 'Do ustalenia';
    if(slot.type==='player')return slot.name;
    const link=String(slot.fixtureId||'');
    const kind=slot.type==='loser'?'Przegrany':'Zwycięzca';
    return `${kind} ${link}`;
  };
  const groupLabels=[['preliminary','RUNDA KWALIFIKACYJNA'],['quarterfinal','ĆWIERĆFINAŁY'],['semifinal','PÓŁFINAŁY'],['third_place','MECZ O 3. MIEJSCE'],['final','FINAŁ']];
  function render(){
    const el=getPanel();
    setFinishSubtitle();
    if(!el)return;
    if(!state.enabled||!state.bracket){el.hidden=true;el.innerHTML='';return;}
    if(!state.revealCompleted&&!revealRunning){el.hidden=true;el.innerHTML='';return;}
    const bracket=state.bracket;
    const concealed=revealRunning;
    el.hidden=false;
    const rounds=groupLabels.map(([round,label])=>{
      const matches=bracket.fixtures.filter(f=>f.round===round);
      if(!matches.length)return '';
      return `<div class="sdt-round"><h4>${esc(label)}</h4>${matches.map(match=>`
        <article class="sdt-match ${concealed?'is-concealed':''}" data-fixture-id="${esc(match.id)}"><small>✦ ${esc(match.id)}</small>
          ${match.slots.map(slot=>`<div class="sdt-player ${!concealed&&slot.type!=='player'?'sdt-await':''}">${concealed?'✦  ? ? ?  ✦':esc(nameFor(slot))}</div>`).join('')}
        </article>`).join('')}</div>`;
    }).join('');
    const byeText=bracket.byes.length?`<div class="sdt-byes ${concealed?'is-concealed':''}"><b>WOLNE LOSY · +20 pkt draftowych</b><div>${bracket.byes.map(x=>esc(x.name)).join(' · ')}</div></div>`:'';
    el.innerHTML=`<div class="sdt-head"><div class="sdt-head-main"><img class="sdt-header-jeff" src="../assets/tournament/jeff_tournament_logo.webp" alt="Jeff — gospodarz turnieju" decoding="async"><div class="sdt-head-copy"><span class="sdt-kicker">✦ MSP SNAPDRAFT • CEREMONIA LOSOWANIA</span><h3>🏆 DRABINKA TURNIEJOWA</h3><p>Wylosowane miejsca są stałe. Kolejne rundy wskazują zwycięzców i przegranych wcześniejszych spotkań.</p><span class="sdt-reveal-progress" role="status" aria-live="polite">${concealed?'✨ ODKRYWANIE PAR…':'✦ LOSOWANIE ZAKOŃCZONE'}</span></div></div><span class="sdt-label">${bracket.size} GRACZY · ${bracket.fixtures.length} MECZÓW</span></div>
       <div class="sdt-rounds">${rounds}</div>${byeText}<div class="sdt-arena-window" aria-hidden="true"></div>
       <p class="sdt-note">Punkty Draftowe: standardowe wyniki + 20 za wolny los + bonus fazowy 60 pkt. Wpisywanie wyników odbywa się w Kronikach Draftowych.</p>`;
  }
  function revealBracket(){
    if(!state.enabled||!state.bracket) return false;
    const panel=getPanel();
    if(state.revealCompleted){panel?.scrollIntoView?.({behavior:'smooth',block:'start'});return true;}
    if(revealRunning)return false;
    stopReveal();
    revealRunning=true;
    render();
    panel?.scrollIntoView?.({behavior:'smooth',block:'start'});
    const fixtureNodes=Array.from(panel?.querySelectorAll?.('.sdt-match')||[]);
    const fixtureMap=new Map(state.bracket.fixtures.map(f=>[f.id,f]));
    const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    // 2.35 s per pair: glowing frame -> first player -> second player -> next pair.
    // All timers are cosmetic; the frozen bracket and seed never change.
    const step=reduced?0:2350;
    const schedule=(callback,ms)=>{
      const id=root.setTimeout?.(callback,ms);
      if(id!==undefined)revealTimers.push(id);
    };
    fixtureNodes.forEach((node,index)=>{
      const fixture=fixtureMap.get(node.dataset.fixtureId);
      if(!fixture)return;
      const base=index*step;
      schedule(()=>{
        if(!revealRunning)return;
        node.classList.remove('is-concealed');
        node.classList.add('is-unveiling');
      },base+(reduced?0:220));
      fixture.slots.forEach((slot,slotIndex)=>{
        schedule(()=>{
          if(!revealRunning)return;
          const target=node.querySelectorAll('.sdt-player')[slotIndex];
          if(!target)return;
          target.textContent=nameFor(slot);
          target.classList.toggle('sdt-await',slot.type!=='player');
          target.classList.add('is-unveiled');
        },base+(reduced?0:slotIndex===0?620:1460));
      });
      schedule(()=>{
        if(!revealRunning)return;
        node.classList.remove('is-unveiling');
        node.classList.add('is-revealed');
        const progress=panel?.querySelector('.sdt-reveal-progress');
        if(progress)progress.textContent=`✨ ODKRYTO ${index+1} / ${fixtureNodes.length} MECZÓW`;
      },base+(reduced?0:2140));
    });
    schedule(()=>{
      if(!revealRunning)return;
      const byes=panel?.querySelector('.sdt-byes');
      byes?.classList.remove('is-concealed');
      byes?.classList.add('is-revealed');
      state.revealCompleted=true;
      stopReveal();
      const progress=panel?.querySelector('.sdt-reveal-progress');
      if(progress)progress.textContent='🏆 DRABINKA ODKRYTA!';
      setFinishSubtitle();
    },fixtureNodes.length*step+(reduced?5:150));
    return true;
  }
  function isSessionLocked(){return state.players.length>0;}
  function beginDraft({enabled=false,players=[]}={}){
    const roster=rosterOf(players);
    if(enabled && (![8,10,12].includes(roster.length)||new Set(roster).size!==roster.length||roster.some(x=>!x))){
      throw new Error('System turniejowy wymaga 8, 10 lub 12 unikalnych nazw graczy.');
    }
    stopReveal();
    state={enabled:Boolean(enabled),players:roster,bracket:null,revealCompleted:false};
    const toggle=document.getElementById('enableTournamentFormat');
    if(toggle){toggle.checked=state.enabled;toggle.disabled=true;}
    render();
  }
  function onDraftFinished(names){
    if(!state.enabled){render();return null;}
    const roster=rosterOf(names);
    if(!sameRoster(roster,state.players)){
      showError('Lista graczy zmieniła się po starcie draftu. Nie losuję innej drabinki automatycznie.');
      return null;
    }
    if(!state.bracket){
      try{
        state.bracket=getEngine().buildBracket(state.players,seedOnce());
      }catch(error){showError(error.message);return null;}
    }
    render();
    return clone(state.bracket);
  }
  function showError(message){
    const el=getPanel();
    if(el){el.hidden=false;el.innerHTML=`<p class="sdt-error">🏆 ${esc(message)}</p>`;}
    console.error('[SNAPDRAFT TOURNAMENT]',message);
  }
  function getExportData(names){
    if(!state.enabled)return null;
    if(!state.bracket)throw new Error('Drabinka nie została jeszcze wylosowana.');
    const roster=rosterOf(names);
    if(!sameRoster(roster,state.players))throw new Error('Niezgodny skład uczestników turnieju.');
    const format={id:FORMAT,version:1,name:'System turniejowy',bonusScheme:'milestones60_v1',thirdPlaceMatch:true};
    const draft={players:roster.map(name=>({name,deck:[]})),playersCount:roster.length,status:'active',scoring:{system:'standard25'},competitionFormat:format,tournament:state.bracket,matches:[]};
    const verdict=getEngine().validateBracket(draft);
    if(!verdict.valid)throw new Error(`Silnik nie zaakceptował drabinki: ${verdict.warnings.map(x=>x.code).join(', ')}`);
    return {competitionFormat:format,tournament:clone(state.bracket)};
  }
  function exportState(){return clone(state);}
  function restoreState(payload,players,draftFinished){
    const roster=rosterOf(players);
    stopReveal();
    if(!payload||!payload.enabled){state={enabled:false,players:roster,bracket:null,revealCompleted:false};
      const toggle=document.getElementById('enableTournamentFormat');if(toggle){toggle.checked=false;toggle.disabled=roster.length>0;}
      render();return;}
    if(!sameRoster(roster,rosterOf(payload.players))){
      state={enabled:true,players:rosterOf(payload.players),bracket:payload.bracket?clone(payload.bracket):null,revealCompleted:Boolean(payload.revealCompleted)};
      showError('Snapshot turnieju nie zgadza się z przywracaną listą graczy.');
      return;
    }
    state={enabled:true,players:roster,bracket:payload.bracket?clone(payload.bracket):null,revealCompleted:Boolean(payload.revealCompleted)};
    const toggle=document.getElementById('enableTournamentFormat');if(toggle){toggle.checked=true;toggle.disabled=true;}
    if(draftFinished&&!state.bracket){showError('Snapshot pochodzi z zakończonego draftu, ale nie zawiera drabinki. Wymagana jest weryfikacja danych.');return;}
    render();
    if(draftFinished){const container=document.getElementById('exportDraftContainer');if(container)container.style.display='block';}
  }
  root.SnapdraftTournamentUI={VERSION,beginDraft,onDraftFinished,render,revealBracket,getExportData,exportState,restoreState,isSessionLocked};
})(typeof window!=='undefined'?window:globalThis);
