// ==============================================
// 🌌 SAVE & STEAL – COSMIC 8.0 / VAULT REWORK
// Visual/UI rework only: core SAVE → STEAL rules stay unchanged.
// ==============================================

let savedCards = {};
let stealOrder = [];
let stealMap = {};
let pendingSteals = [];
let currentStealIndex = 0;
let currentSavePlayerIndex = 0;
let saveStealResolveTimer = null;
let saveStealSession = null;

function getEconomyExtraSavedIds(playerIndex){
    const ids=window.EconomyEngine?.getExtensionState?.(Number(playerIndex),"save_steal_extra_saved_ids",[])||[];
    return new Set((Array.isArray(ids)?ids:[]).map(value=>String(value||"")).filter(Boolean));
}

function isEconomyExtraSavedCard(playerIndex,card){
    const id=String(card?.instanceId||"");
    return Boolean(id&&getEconomyExtraSavedIds(playerIndex).has(id));
}

function sstEscapeHTML(value){
    return String(value ?? "").replace(/[&<>'"]/g, char=>({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        "'":"&#39;",
        '"':"&quot;"
    }[char]));
}

function sstPlayerName(index){
    return sstEscapeHTML(players?.[index] ?? `Gracz ${Number(index)+1}`);
}

function sstCardMarkup(card,{selected=false,protectedState="",protectedLabel="",disabled=false}={}){
    const isSkill=Boolean(window.SkillCardVisual?.isSkill?.(card));
    const classes=["sst-card-face"];
    if(selected) classes.push("is-selected");
    if(protectedState) classes.push("is-protected",`is-protected-${protectedState}`);
    if(disabled) classes.push("is-disabled");

    const power=isSkill ? "✦" : sstEscapeHTML(card?.power ?? "?");
    const safeName=sstEscapeHTML(card?.name ?? "Nieznana karta");
    const safeCost=sstEscapeHTML(card?.cost ?? "?");
    const shield=protectedState ? `
        <span class="sst-shield" aria-hidden="true">
            <span class="sst-shield-core">✦</span>
            <span class="sst-shield-label">${sstEscapeHTML(protectedLabel||"CHRONIONA")}</span>
        </span>
    ` : "";

    return `
        <span class="${classes.join(" ")}">
            <span class="sst-card-orb sst-card-cost">${safeCost}</span>
            <span class="sst-card-name">${safeName}</span>
            <span class="sst-card-orb sst-card-power">${power}</span>
            <span class="sst-card-stars" aria-hidden="true"></span>
            ${shield}
        </span>
    `;
}

function sstProtectionForSteal(victim,card,cardIndex){
    if(savedCards[victim] === cardIndex){
        return {type:"save",label:"SAVE"};
    }
    if(isEconomyExtraSavedCard(victim,card)){
        return {type:"shop",label:"EXTRA SAVE"};
    }
    if(window.GrootUI?.isProtectedCard?.(card,"steal")){
        return {type:"groot",label:"OCHRONA"};
    }
    if(window.EconomyEngine?.isPlayerCardProtected?.(victim,card)){
        return {type:"economy",label:"OCHRONA"};
    }
    return null;
}

function sstSetFooter({hint="",label="",disabled=false,onClick=null,showButton=true}={}){
    const hintEl=document.getElementById("sstFooterHint");
    const btn=document.getElementById("cosmicNextBtn");
    if(hintEl) hintEl.textContent=hint;
    if(!btn) return;

    btn.style.display=showButton ? "inline-flex" : "none";
    btn.disabled=Boolean(disabled);
    btn.textContent=label||"DALEJ";
    btn.onclick=typeof onClick === "function" ? onClick : null;
}

function sstPhaseIndex(phase){
    return phase === "save" ? 0 : phase === "steal" ? 1 : 2;
}

// ==============================
// 🌌 MODAL
// ==============================

function canStartSaveStealFlow(options={}){
    if(typeof document === "undefined") return false;
    if(document.getElementById("cosmicSaveStealModal")) return false;
    if(!Array.isArray(players) || players.length < 2) return false;
    if(!Array.isArray(decks) || decks.length < players.length) return false;

    // Natural SAVE always needs one selectable card per player. Extra Save cards
    // bought in Jeff's Cosmic Shop are already protected and cannot consume the
    // player's normal SAVE slot.
    return players.every((_name,playerIndex)=>{
        const deck=Array.isArray(decks[playerIndex]) ? decks[playerIndex] : [];
        return deck.some(card=>!isEconomyExtraSavedCard(playerIndex,card));
    });
}

function startSaveStealFlow(options={}){
    if(!canStartSaveStealFlow(options)) return false;

    const source=String(options.source||"post_draft");
    saveStealSession={
        source,
        anomalyId:options.anomalyId ? String(options.anomalyId) : null,
        onComplete:typeof options.onComplete === "function" ? options.onComplete : null
    };

    savedCards = {};
    stealOrder = [];
    stealMap = {};
    pendingSteals = [];
    currentStealIndex = 0;
    currentSavePlayerIndex = 0;

    if(saveStealResolveTimer){
        clearTimeout(saveStealResolveTimer);
        saveStealResolveTimer=null;
    }

    closeModal();

    const modal = document.createElement("div");
    modal.id = "cosmicSaveStealModal";
    modal.className = "save-phase";
    modal.dataset.source = source;
    if(saveStealSession.anomalyId) modal.dataset.anomalyId = saveStealSession.anomalyId;

    const eventEyebrow=source === "anomaly" ? "ANOMALIA • JEFF'S COSMIC EVENT" : "JEFF'S COSMIC EVENT";

    modal.innerHTML = `
        <div class="sstPhaseBackdrop sstPhaseBackdrop--base" aria-hidden="true"></div>
        <div class="sstPhaseBackdrop sstPhaseBackdrop--save" aria-hidden="true"></div>
        <div class="sstPhaseBackdrop sstPhaseBackdrop--steal" aria-hidden="true"></div>
        <div class="sstVignette" aria-hidden="true"></div>
        <div class="cosmicStarOverlay" aria-hidden="true"></div>

        <div class="cosmicPanel" role="dialog" aria-modal="true" aria-labelledby="sstTitle">
            <header class="sstHeader">
                <div class="sstEyebrow">${eventEyebrow}</div>
                <div id="sstTitle" class="cosmicTitle">SAVE &amp; STEAL</div>
                <div class="sstPhaseTrack" aria-label="Fazy Save & Steal">
                    <div class="sstPhasePill" data-phase="save"><span class="sstPhaseIcon">🛡</span><span>SAVE</span></div>
                    <div class="sstPhaseLine"></div>
                    <div class="sstPhasePill" data-phase="steal"><span class="sstPhaseIcon">◆</span><span>STEAL</span></div>
                    <div class="sstPhaseLine"></div>
                    <div class="sstPhasePill" data-phase="resolve"><span class="sstPhaseIcon">✦</span><span>TRANSFER</span></div>
                </div>
                <div id="sstSubtitle" class="sstSubtitle">Wybierz kartę, którą chcesz zabezpieczyć.</div>
            </header>

            <main id="cosmicBody" class="sstBody"></main>

            <div class="sstJeffHalo" aria-hidden="true"></div>
            <img id="saveStealJeff" src="draft-assets/jeff_save.webp" alt="" aria-hidden="true">

            <footer class="sstFooter">
                <div id="sstFooterHint" class="sstFooterHint"></div>
                <button id="cosmicNextBtn" class="cosmicBtn" type="button">DALEJ</button>
            </footer>
        </div>
    `;

    document.body.appendChild(modal);
    injectStyles();
    renderSavePhase(0);
    return true;
}

function openSaveStealModal(){
    const started=startSaveStealFlow({source:"post_draft"});
    if(!started&&typeof document!=="undefined"&&!document.getElementById("cosmicSaveStealModal")){
        // Defensive finalization fallback: if a malformed/empty deck state leaves no
        // legal SAVE selection, do not deadlock the post-draft chain.
        window.__saveStealCompleted=true;
        window.continuePostDraftAfterGrootGardens?.();
    }
    return started;
}

// ==============================
// 🛡 SAVE PHASE
// ==============================

function renderSavePhase(requestedPlayerIndex=currentSavePlayerIndex){
    setPhase("save");

    const body = document.getElementById("cosmicBody");
    if(!body) return;

    const maxIndex=Math.max(0,(players?.length||1)-1);
    currentSavePlayerIndex=Math.min(maxIndex,Math.max(0,Number(requestedPlayerIndex)||0));

    const pIndex=currentSavePlayerIndex;
    const player=players[pIndex];
    const playerDeck=Array.isArray(decks[pIndex]) ? decks[pIndex] : [];
    const selectedIndex=savedCards[pIndex];
    const selectedCard=Number.isInteger(selectedIndex) ? playerDeck[selectedIndex] : null;
    const completedCount=players.reduce((count,_name,index)=>count+(Number.isInteger(savedCards[index])?1:0),0);

    body.innerHTML = `
        <div class="sstSaveLayout">
            <aside class="sstPlayerPanel">
                <div class="sstPanelLabel">🛡 RYCERZE SKARBCA</div>
                <div class="sstPlayerRail" id="sstPlayerRail"></div>
                <div class="sstMiniLegend sstMiniLegend--save">
                    <span><i class="sstLegendDot sstLegendDot--save"></i> Naturalny SAVE</span>
                    <span><i class="sstLegendDot sstLegendDot--shop"></i> Jeff Shop Extra Save</span>
                </div>
            </aside>

            <section class="sstStage">
                <div class="sstStageTop">
                    <div>
                        <div class="sstStageKicker">CHRONI KARTĘ</div>
                        <h3>${sstEscapeHTML(player)}</h3>
                    </div>
                    <div class="sstProgressOrb"><strong>${completedCount}</strong><span>/${players.length}</span></div>
                </div>
                <div class="sstInstruction">Wskaż jedną kartę. Holograficzna tarcza oznacza, że nie będzie legalnym celem podczas STEAL.</div>
                <div class="sstCardGrid sstSaveGrid" id="sstSaveCardGrid"></div>
            </section>
        </div>
    `;

    const rail=document.getElementById("sstPlayerRail");
    players.forEach((name,index)=>{
        const chosenIndex=savedCards[index];
        const chosenCard=Number.isInteger(chosenIndex) ? decks[index]?.[chosenIndex] : null;
        const extraCount=(decks[index]||[]).filter(card=>isEconomyExtraSavedCard(index,card)).length;
        const tab=document.createElement("button");
        tab.type="button";
        tab.className="sstPlayerTab";
        if(index===pIndex) tab.classList.add("is-active");
        if(chosenCard) tab.classList.add("is-done");
        tab.innerHTML=`
            <span class="sstPlayerTabIndex">${index+1}</span>
            <span class="sstPlayerTabText">
                <strong>${sstEscapeHTML(name)}</strong>
                <small>${chosenCard ? `SAVE: ${sstEscapeHTML(chosenCard.name)}` : "Czeka na SAVE"}</small>
            </span>
            ${extraCount ? `<span class="sstExtraBadge" title="Dodatkowy Save z Jeff's Cosmic Shop">+${extraCount}</span>` : ""}
            <span class="sstPlayerTabStatus">${chosenCard ? "✓" : ""}</span>
        `;
        tab.onclick=()=>renderSavePhase(index);
        rail.appendChild(tab);
    });

    const grid=document.getElementById("sstSaveCardGrid");
    playerDeck.forEach((card,cIndex)=>{
        const shopSaved=isEconomyExtraSavedCard(pIndex,card);
        const isSelected=savedCards[pIndex]===cIndex;
        const btn=document.createElement("button");
        btn.type="button";
        btn.className="sstCardButton";
        btn.dataset.cardName=card?.name||"";
        if(shopSaved) btn.classList.add("is-shop-protected");
        if(isSelected) btn.classList.add("is-save-selected");
        btn.disabled=shopSaved;
        btn.title=shopSaved
            ? "Ta karta ma już Dodatkowy Save kupiony w Jeff's Cosmic Shop. Naturalny SAVE wykorzystaj na innej karcie."
            : (isSelected ? "Wybrana karta SAVE" : "Kliknij, aby zabezpieczyć tę kartę");
        btn.innerHTML=sstCardMarkup(card,{
            selected:isSelected,
            protectedState:shopSaved ? "shop" : (isSelected ? "save" : ""),
            protectedLabel:shopSaved ? "EXTRA SAVE" : (isSelected ? "SAVE" : ""),
            disabled:shopSaved
        });
        if(!shopSaved){
            btn.onclick=()=>{
                savedCards[pIndex]=cIndex;
                renderSavePhase(pIndex);
            };
        }
        grid.appendChild(btn);
    });

    const allReady=Object.keys(savedCards).length===players.length;
    const currentReady=Number.isInteger(savedCards[pIndex]);
    const nextUnready=players.findIndex((_name,index)=>!Number.isInteger(savedCards[index]));

    if(allReady){
        sstSetFooter({
            hint:"Wszystkie tarcze ustawione. Czas sprawdzić, kto okaże się najlepszym kosmicznym złodziejem.",
            label:"ROZPOCZNIJ STEAL",
            disabled:false,
            onClick:generateStealMap,
            showButton:true
        });
    }else{
        sstSetFooter({
            hint:selectedCard ? `${selectedCard.name} jest chroniona dla ${player}.` : `${player}: wybierz jedną kartę do SAVE.`,
            label:currentReady ? "NASTĘPNY GRACZ" : "WYBIERZ KARTĘ",
            disabled:!currentReady,
            onClick:()=>{
                if(nextUnready>=0) renderSavePhase(nextUnready);
            },
            showButton:true
        });
    }
}

// ==============================
// 🥷 STEAL MAP
// ==============================

function generateStealMap(){
    stealOrder = [...Array(players.length).keys()];
    stealOrder.sort(()=>Math.random()-0.5);

    stealMap = {};
    for(let i=0;i<stealOrder.length;i++){
        stealMap[stealOrder[i]] = stealOrder[(i+1)%stealOrder.length];
    }

    renderStealPhase();
}

function renderStealPhase(){
    currentStealIndex = 0;
    setPhase("steal");
    nextStealTurn();
}

function nextStealTurn(){
    if(currentStealIndex >= players.length){
        renderResolvePhase();
        return;
    }

    setPhase("steal");

    const thief = stealOrder[currentStealIndex];
    const victim = stealMap[thief];
    const body = document.getElementById("cosmicBody");
    if(!body) return;

    body.innerHTML = `
        <div class="sstStealLayout">
            <div class="sstHeistBanner sstHeistBanner--steal">
                <div class="sstHeistRole sstHeistRole--thief">
                    <span class="sstRoleLabel">ZŁODZIEJ</span>
                    <strong>${sstPlayerName(thief)}</strong>
                </div>
                <div class="sstHeistArrow">
                    <span>${currentStealIndex+1}/${players.length}</span>
                    <b>KRADNIE OD</b>
                    <i>➜</i>
                </div>
                <div class="sstHeistRole sstHeistRole--victim">
                    <span class="sstRoleLabel">SKARBIEC</span>
                    <strong>${sstPlayerName(victim)}</strong>
                </div>
            </div>

            <div class="sstStealHelp">◆ Wszystkie karty są widoczne. Holograficzne tarcze oznaczają cele wyłączone z kradzieży.</div>
            <div class="sstCardGrid sstStealGrid" id="sstStealGrid"></div>
        </div>
    `;

    const section=document.getElementById("sstStealGrid");
    let legalStealCount = 0;

    decks[victim].forEach((card, cIndex)=>{
        const protection=sstProtectionForSteal(victim,card,cIndex);
        const isProtected=Boolean(protection);
        if(!isProtected) legalStealCount++;

        const btn=document.createElement("button");
        btn.type="button";
        btn.className="sstCardButton sstStealCard";
        btn.dataset.cardName=card?.name||"";
        btn.disabled=isProtected;
        if(isProtected) btn.classList.add("is-blocked");
        btn.innerHTML=sstCardMarkup(card,{
            protectedState:protection?.type||"",
            protectedLabel:protection?.label||"",
            disabled:isProtected
        });

        if(isProtected){
            btn.title=protection.label === "SAVE"
                ? "Ta karta została zabezpieczona podczas fazy SAVE."
                : `${protection.label}: ta karta nie może zostać skradziona.`;
        }else{
            btn.title=`Ukradnij ${card?.name||"kartę"}`;
            btn.onclick=()=>{
                if(btn.disabled) return;
                btn.disabled=true;
                btn.classList.add("is-being-stolen");
                pendingSteals.push({
                    from: victim,
                    to: thief,
                    cardIndex: cIndex,
                    cardName: card?.name||"Karta"
                });
                sstSetFooter({
                    hint:`${players[thief]} przejmuje ${card?.name||"kartę"}…`,
                    showButton:false
                });
                setTimeout(()=>{
                    currentStealIndex++;
                    nextStealTurn();
                },260);
            };
        }

        section.appendChild(btn);
    });

    if(!legalStealCount){
        const empty=document.createElement("div");
        empty.className="sstNoTarget";
        empty.innerHTML=`
            <div class="sstNoTargetIcon">🛡</div>
            <strong>SKARBIEC ZABLOKOWANY</strong>
            <span>Wszystkie dostępne karty ${sstPlayerName(victim)} są chronione.</span>
        `;
        section.appendChild(empty);

        sstSetFooter({
            hint:`${players[thief]} nie ma legalnego celu do kradzieży.`,
            label:"POMIŃ TURĘ",
            disabled:false,
            onClick:()=>{
                currentStealIndex++;
                nextStealTurn();
            },
            showButton:true
        });
    }else{
        sstSetFooter({
            hint:`${players[thief]}: wybierz jedną niechronioną kartę ze skarbca ${players[victim]}.`,
            showButton:false
        });
    }
}

// ==============================
// ✦ RESOLVE / TRANSFER
// ==============================

function renderResolvePhase(){
    setPhase("resolve");

    const body=document.getElementById("cosmicBody");
    if(!body){
        applySteals();
        return;
    }

    const rows=pendingSteals.map(s=>`
        <div class="sstTransferRow">
            <span class="sstTransferPlayer">${sstPlayerName(s.to)}</span>
            <span class="sstTransferArrow">←</span>
            <span class="sstTransferCard">${sstEscapeHTML(s.cardName||decks[s.from]?.[s.cardIndex]?.name||"Karta")}</span>
            <span class="sstTransferFrom">ze skarbca ${sstPlayerName(s.from)}</span>
        </div>
    `).join("");

    body.innerHTML=`
        <div class="sstResolve">
            <div class="sstResolveSeal"><span>✦</span></div>
            <div class="sstResolveKicker">TRANSFER ŁUPÓW</div>
            <h3>Save &amp; Steal zakończony</h3>
            <div class="sstTransferList">
                ${rows || `<div class="sstTransferEmpty">Tym razem nikt nie zdołał wynieść łupu.</div>`}
            </div>
            <div class="sstResolvePulse"></div>
        </div>
    `;

    sstSetFooter({
        hint:"Aktualizuję decki i zamykam skarbiec…",
        showButton:false
    });

    if(saveStealResolveTimer) clearTimeout(saveStealResolveTimer);
    saveStealResolveTimer=setTimeout(()=>{
        saveStealResolveTimer=null;
        applySteals();
    },1150);
}

function applySteals(){
    const session=saveStealSession||{source:"post_draft",anomalyId:null,onComplete:null};
    const resolvedSteals=pendingSteals.map(item=>({...item}));

    pendingSteals.forEach(s=>{
        const card = decks[s.from][s.cardIndex];
        if(card) decks[s.to].push(card);
    });

    pendingSteals
        .sort((a,b)=>b.cardIndex-a.cardIndex)
        .forEach(s=>{
            if(decks[s.from]?.[s.cardIndex]) decks[s.from].splice(s.cardIndex,1);
        });

    closeModal();
    showDecks();
    saveStealSession=null;

    const result={
        source:session.source,
        anomalyId:session.anomalyId,
        stealCount:resolvedSteals.length,
        steals:resolvedSteals
    };

    if(session.source === "post_draft"){
        window.__saveStealCompleted = true;
        window.continuePostDraftAfterGrootGardens?.();
        return;
    }

    // Mid-draft anomaly flow resumes exactly where the anomaly runtime paused it.
    // It must NOT mark the normal post-draft Save & Steal as completed.
    session.onComplete?.(result);
}

function closeModal(){
    if(saveStealResolveTimer){
        clearTimeout(saveStealResolveTimer);
        saveStealResolveTimer=null;
    }
    const modal = document.getElementById("cosmicSaveStealModal");
    if(modal) modal.remove();
}

// ==============================
// 🌌 PHASE HANDLER
// ==============================

function setPhase(phase){
    const modal = document.getElementById("cosmicSaveStealModal");
    const jeff = document.getElementById("saveStealJeff");
    if(!modal) return;

    modal.classList.remove("save-phase","steal-phase","resolve-phase");
    modal.classList.add(`${phase}-phase`);

    if(jeff){
        if(phase === "save") jeff.src = "draft-assets/jeff_save.webp";
        if(phase === "steal" || phase === "resolve") jeff.src = "draft-assets/jeff_thief.webp";
    }

    const subtitles={
        save:"Wybierz kartę, którą chcesz zabezpieczyć.",
        steal:"Kosmiczny skok trwa — wybierz łup z niechronionych kart.",
        resolve:"Łupy zmieniają właścicieli."
    };
    const subtitle=document.getElementById("sstSubtitle");
    if(subtitle) subtitle.textContent=subtitles[phase]||"";

    const activeIndex=sstPhaseIndex(phase);
    modal.querySelectorAll(".sstPhasePill").forEach((pill,index)=>{
        pill.classList.toggle("is-active",index===activeIndex);
        pill.classList.toggle("is-done",index<activeIndex);
    });
    modal.querySelectorAll(".sstPhaseLine").forEach((line,index)=>{
        line.classList.toggle("is-done",index<activeIndex);
    });
}

// ==============================
// 🎨 COSMIC VAULT UI
// ==============================

function injectStyles(){
    if(document.getElementById("cosmicStyle")) return;

    const style = document.createElement("style");
    style.id = "cosmicStyle";
    style.textContent = `
#cosmicSaveStealModal{
    --sst-accent:#5fd8ff;
    --sst-accent-rgb:95,216,255;
    --sst-secondary:#8cf3ff;
    --sst-panel:rgba(5,17,39,.44);
    position:fixed!important;
    inset:0!important;
    z-index:99999!important;
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    overflow:hidden!important;
    isolation:isolate;
    background:#02050d;
    color:#fff;
    font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
#cosmicSaveStealModal.steal-phase{
    --sst-accent:#ff5c78;
    --sst-accent-rgb:255,92,120;
    --sst-secondary:#ffbf4f;
    --sst-panel:rgba(32,8,22,.44);
}
#cosmicSaveStealModal.resolve-phase{
    --sst-accent:#ff4f6e;
    --sst-accent-rgb:255,79,110;
    --sst-secondary:#ffc24c;
    --sst-panel:rgba(30,6,16,.48);
}
.sstPhaseBackdrop{
    position:absolute;
    inset:-2%;
    z-index:-5;
    opacity:0;
    background-position:center;
    background-size:cover;
    background-repeat:no-repeat;
    transform:scale(1.035);
    transition:opacity .52s ease,transform 1.1s ease;
    filter:saturate(1.06) contrast(1.02);
    pointer-events:none;
}
.sstPhaseBackdrop--base{background-image:url("draft-assets/save_steal_bg_base.webp")}
.sstPhaseBackdrop--save{background-image:url("draft-assets/save_steal_bg_save.webp")}
.sstPhaseBackdrop--steal{background-image:url("draft-assets/save_steal_bg_steal.webp")}
.save-phase .sstPhaseBackdrop--save,
.steal-phase .sstPhaseBackdrop--steal,
.resolve-phase .sstPhaseBackdrop--base{opacity:1;transform:scale(1)}
.sstVignette{
    position:absolute;
    inset:0;
    z-index:-3;
    pointer-events:none;
    background:
        radial-gradient(circle at 50% 44%,transparent 0 34%,rgba(2,4,16,.14) 67%,rgba(0,0,8,.54) 100%),
        linear-gradient(180deg,rgba(0,0,10,.10),transparent 20%,transparent 76%,rgba(0,0,8,.42));
}
.cosmicStarOverlay{
    position:absolute;
    inset:0;
    z-index:-2;
    pointer-events:none;
    opacity:.55;
    background-image:
        radial-gradient(circle at 12% 18%,rgba(255,255,255,.95) 0 1px,transparent 2px),
        radial-gradient(circle at 79% 14%,rgba(255,255,255,.9) 0 1px,transparent 2px),
        radial-gradient(circle at 92% 62%,rgba(var(--sst-accent-rgb),.9) 0 1px,transparent 2px),
        radial-gradient(circle at 27% 78%,rgba(var(--sst-accent-rgb),.8) 0 1px,transparent 2px);
    background-size:190px 190px,240px 240px,210px 210px,260px 260px;
    animation:sstStars 10s linear infinite;
}
@keyframes sstStars{to{background-position:190px 90px,-120px 120px,105px -110px,-130px -130px}}

.cosmicPanel{
    position:relative!important;
    z-index:3!important;
    width:min(1480px,calc(100vw - 48px))!important;
    height:min(900px,calc(100vh - 38px))!important;
    box-sizing:border-box!important;
    display:flex!important;
    flex-direction:column!important;
    overflow:hidden!important;
    padding:0!important;
    border-radius:30px!important;
    border:1px solid rgba(255,255,255,.34)!important;
    background:
        linear-gradient(135deg,rgba(var(--sst-accent-rgb),.18),transparent 28%),
        linear-gradient(180deg,var(--sst-panel),rgba(3,6,19,.44))!important;
    box-shadow:
        0 26px 85px rgba(0,0,0,.58),
        0 0 0 1px rgba(var(--sst-accent-rgb),.28) inset,
        0 0 64px rgba(var(--sst-accent-rgb),.26)!important;
    backdrop-filter:blur(2px) saturate(1.10)!important;
}
.cosmicPanel::before{
    content:"";
    position:absolute;
    inset:0;
    pointer-events:none;
    border-radius:inherit;
    background:
        linear-gradient(90deg,transparent,rgba(var(--sst-accent-rgb),.28),transparent) top/100% 1px no-repeat,
        radial-gradient(circle at 50% -10%,rgba(var(--sst-accent-rgb),.20),transparent 38%);
}
.cosmicPanel::after{
    content:"";
    position:absolute;
    inset:10px;
    border-radius:22px;
    pointer-events:none;
    border:1px solid rgba(var(--sst-accent-rgb),.18);
    box-shadow:0 0 0 1px rgba(255,255,255,.06) inset;
}
 .sstHeader{
    position:relative;
    flex:0 0 auto;
    display:flex;
    flex-direction:column;
    align-items:center;
    padding:12px 22px 8px;
    border-bottom:1px solid rgba(255,255,255,.11);
    background:linear-gradient(180deg,rgba(2,5,17,.58),rgba(2,5,17,.16));
}
.sstEyebrow{
    font-size:10px;
    font-weight:900;
    letter-spacing:.34em;
    color:rgba(255,255,255,.62);
    margin-bottom:2px;
}
.cosmicTitle{
    margin:0!important;
    text-align:center!important;
    font-size:clamp(30px,3vw,46px)!important;
    line-height:.95!important;
    font-weight:1000!important;
    letter-spacing:.08em;
    font-family:"Orbitron","Rajdhani",sans-serif!important;
    color:#fff!important;
    text-shadow:0 0 20px rgba(var(--sst-accent-rgb),.88),0 0 36px rgba(var(--sst-accent-rgb),.26),0 4px 18px rgba(0,0,0,.84)!important;
}
.sstSubtitle{
    min-height:18px;
    margin-top:5px;
    font-size:12px;
    font-weight:900;
    color:rgba(255,255,255,.88);
    text-shadow:0 1px 8px rgba(0,0,0,.55);
    text-align:center;
}
.sstPhaseTrack{
    display:flex;
    align-items:center;
    justify-content:center;
    width:min(560px,80vw);
    margin-top:8px;
}
.sstPhasePill{
    display:flex;
    align-items:center;
    gap:7px;
    padding:6px 10px;
    border-radius:999px;
    border:1px solid rgba(255,255,255,.14);
    background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(0,0,0,.24));
    color:rgba(255,255,255,.42);
    font-size:10px;
    font-weight:1000;
    letter-spacing:.1em;
    transition:.25s ease;
}
.sstPhasePill.is-active{
    color:#fff;
    border-color:rgba(var(--sst-accent-rgb),.78);
    background:rgba(var(--sst-accent-rgb),.16);
    box-shadow:0 0 18px rgba(var(--sst-accent-rgb),.32),0 0 0 1px rgba(var(--sst-accent-rgb),.15) inset;
}
.sstPhasePill.is-done{color:#f9feff;border-color:rgba(105,236,255,.46);background:rgba(63,214,255,.16)}
.steal-phase .sstPhasePill.is-active{border-color:rgba(255,92,120,.86);background:rgba(255,92,120,.18);box-shadow:0 0 18px rgba(255,92,120,.28),0 0 0 1px rgba(255,92,120,.15) inset;}
.sstPhaseIcon{font-size:13px;filter:drop-shadow(0 0 8px rgba(var(--sst-accent-rgb),.75))}
.sstPhaseLine{height:1px;flex:1;max-width:82px;background:rgba(255,255,255,.13)}
.sstPhaseLine.is-done{background:linear-gradient(90deg,#6cecff,#8af6c4)}

.sstBody{
    flex:1 1 auto!important;
    min-height:0!important;
    overflow:hidden!important;
    padding:12px 14px 14px!important;
}
.sstSaveLayout{
    height:100%;
    min-height:0;
    display:grid;
    grid-template-columns:230px minmax(0,1fr);
    gap:12px;
}
.sstPlayerPanel,
.sstStage,
.sstStealLayout{
    min-height:0;
    position:relative;
    z-index:1;
    border:1px solid rgba(255,255,255,.16);
    background:linear-gradient(180deg,rgba(3,8,24,.56),rgba(2,7,19,.38));
    border-radius:20px;
    box-shadow:0 18px 42px rgba(0,0,0,.26),0 0 0 1px rgba(var(--sst-accent-rgb),.14) inset;
}
.save-phase .sstPlayerPanel,
.save-phase .sstStage{border-color:rgba(95,216,255,.24);}
.steal-phase .sstStealLayout{border-color:rgba(255,92,120,.26);}
.sstPlayerPanel > *,
.sstStage > *,
.sstStealLayout > *{position:relative;z-index:4;}
.sstStage::before,
.sstStealLayout::before{
    content:"";
    position:absolute;
    inset:0;
    border-radius:inherit;
    pointer-events:none;
    opacity:.28;
}
.save-phase .sstStage::before{
    background:
        radial-gradient(circle at 18% 20%,rgba(95,216,255,.18),transparent 24%),
        radial-gradient(circle at 82% 14%,rgba(140,243,255,.16),transparent 22%),
        radial-gradient(circle at 50% 52%,rgba(95,216,255,.10),transparent 30%);
}
.save-phase .sstStage::after{
    content:"🛡  🛡  🛡";
    position:absolute;
    inset:auto 0 12px 0;
    text-align:center;
    font-size:18px;
    letter-spacing:18px;
    color:rgba(130,235,255,.23);
    pointer-events:none;
}
.steal-phase .sstStealLayout::before{
    background:
        radial-gradient(circle at 14% 18%,rgba(255,92,120,.18),transparent 24%),
        radial-gradient(circle at 84% 16%,rgba(255,191,79,.12),transparent 22%),
        radial-gradient(circle at 50% 56%,rgba(255,92,120,.08),transparent 28%);
}
.steal-phase .sstStealLayout::after{
    content:"◆  ◇  ◆  ◇";
    position:absolute;
    inset:auto 0 10px 0;
    text-align:center;
    font-size:15px;
    letter-spacing:16px;
    color:rgba(255,110,132,.28);
    pointer-events:none;
}
.sstPlayerPanel{
    display:flex;
    flex-direction:column;
    overflow:hidden;
    padding:14px;
    background:linear-gradient(180deg,rgba(5,12,32,.78),rgba(5,10,25,.62));
}
.sstPanelLabel,
.sstStageKicker,
.sstRoleLabel,
.sstResolveKicker{
    font-family:"Orbitron","Rajdhani",sans-serif;
    font-size:10px;
    font-weight:1000;
    letter-spacing:.17em;
    color:rgba(var(--sst-accent-rgb),.98);text-shadow:0 0 10px rgba(var(--sst-accent-rgb),.32);
}
.sstPlayerRail{
    display:flex;
    flex-direction:column;
    gap:8px;
    margin-top:10px;
    overflow:auto;
    padding-right:3px;
}
.sstPlayerTab{
    width:100%;
    display:grid;
    grid-template-columns:30px minmax(0,1fr) auto auto;
    align-items:center;
    gap:9px;
    padding:10px;
    border:1px solid rgba(255,255,255,.10);
    border-radius:13px;
    background:rgba(255,255,255,.045);
    color:#fff;
    text-align:left;
    cursor:pointer;
    transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease;
}
.sstPlayerTab:hover{transform:translateX(2px);border-color:rgba(var(--sst-accent-rgb),.52);background:rgba(var(--sst-accent-rgb),.12)}
.sstPlayerTab.is-active{border-color:rgba(var(--sst-accent-rgb),.82);background:rgba(var(--sst-accent-rgb),.18);box-shadow:0 0 20px rgba(var(--sst-accent-rgb),.18)}
.sstPlayerTab.is-done .sstPlayerTabIndex{background:linear-gradient(135deg,#56efc3,#66dcff);color:#06202c}
.sstPlayerTabIndex{
    display:grid;place-items:center;
    width:28px;height:28px;border-radius:50%;
    background:rgba(255,255,255,.08);
    font-size:11px;font-weight:1000;
}
.sstPlayerTabText{min-width:0;display:flex;flex-direction:column;gap:2px}
.sstPlayerTabText strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px;font-family:"Rajdhani","Orbitron",sans-serif;text-shadow:0 0 10px rgba(0,0,0,.4)}
.sstPlayerTabText small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#8cefff;font-size:10px;font-weight:900;text-shadow:0 0 10px rgba(95,216,255,.18)}
.sstPlayerTabStatus{font-weight:1000;color:#71f5cc}
.sstExtraBadge{padding:2px 6px;border-radius:999px;background:rgba(255,85,202,.14);border:1px solid rgba(255,85,202,.38);color:#ff9dea;font-size:9px;font-weight:1000}
.sstMiniLegend{margin-top:auto;padding-top:12px;display:flex;flex-direction:column;gap:5px;font-size:9px;color:rgba(255,255,255,.52)}
.sstMiniLegend span{display:flex;align-items:center;gap:6px}
.sstLegendDot{width:8px;height:8px;border-radius:50%;box-shadow:0 0 8px currentColor}
.sstLegendDot--save{background:#66e8ff;color:#66e8ff}.sstLegendDot--shop{background:#ff55ca;color:#ff55ca}

.sstStage{display:flex;flex-direction:column;overflow:hidden;padding:16px 16px 12px;background:linear-gradient(180deg,rgba(5,12,32,.68),rgba(5,10,25,.46));}
.sstStageTop{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 10px 9px;border-radius:18px;border:1px solid rgba(var(--sst-accent-rgb),.18);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));box-shadow:inset 0 0 18px rgba(var(--sst-accent-rgb),.08)}
.sstStageTop h3{margin:3px 0 0;font-size:clamp(18px,1.8vw,26px);line-height:1;font-weight:1000;text-shadow:0 0 18px rgba(var(--sst-accent-rgb),.34)}
.sstProgressOrb{flex:0 0 auto;width:48px;height:48px;border-radius:50%;display:flex;align-items:baseline;justify-content:center;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.14),rgba(var(--sst-accent-rgb),.12));border:1px solid rgba(var(--sst-accent-rgb),.38);box-shadow:0 0 24px rgba(var(--sst-accent-rgb),.16)}
.sstProgressOrb strong{font-size:22px}.sstProgressOrb span{font-size:10px;color:rgba(255,255,255,.55)}
.sstInstruction,.sstStealHelp{font-size:10px;color:rgba(255,255,255,.76);font-weight:800;padding:0 2px 8px}

.sstCardGrid{
    min-height:0;
    overflow:auto;
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(128px,1fr));
    align-content:start;
    gap:13px;
    padding:5px 7px 12px 3px;
}
.sstCardButton{
    appearance:none;
    position:relative;
    min-width:0;
    min-height:102px;
    padding:0;
    border:0;
    border-radius:15px;
    background:transparent;
    color:#fff;
    cursor:pointer;
    isolation:isolate;
    transition:transform .18s ease,filter .18s ease;
}
.sstCardButton:not(:disabled):hover{transform:translateY(-5px) scale(1.015);filter:brightness(1.1)}
.sstCardButton:focus-visible{outline:2px solid var(--sst-accent);outline-offset:3px}
.sstCardFace,.sst-card-face{
    position:absolute;
    inset:0;
    display:block;
    overflow:hidden;
    border-radius:15px;
    border:1px solid rgba(255,255,255,.18);
    background:
        radial-gradient(circle at 74% 16%,rgba(var(--sst-accent-rgb),.25),transparent 28%),
        radial-gradient(circle at 22% 82%,rgba(128,86,255,.18),transparent 32%),
        linear-gradient(155deg,rgba(13,27,57,.96),rgba(5,8,25,.96));
    box-shadow:0 9px 20px rgba(0,0,0,.34),0 0 0 1px rgba(var(--sst-accent-rgb),.06) inset;
}
.sst-card-face::before{
    content:"";position:absolute;inset:6px;border-radius:13px;border:1px solid rgba(255,255,255,.07);pointer-events:none;
}
.sst-card-face::after{
    content:"";position:absolute;left:-25%;top:-60%;width:36%;height:210%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);transform:rotate(18deg);opacity:0;transition:.28s ease;pointer-events:none;
}
.sstCardButton:not(:disabled):hover .sst-card-face::after{left:105%;opacity:1}
.sst-card-name{
    font-family:"Rajdhani","Orbitron",sans-serif;
    position:absolute;
    left:13px;right:13px;top:50%;
    transform:translateY(-50%);
    z-index:3;
    font-size:clamp(13px,1vw,17px);
    line-height:1.08;
    font-weight:1000;
    text-align:center;
    text-wrap:balance;
    letter-spacing:.02em;
    text-shadow:0 2px 10px rgba(0,0,0,.95),0 0 18px rgba(var(--sst-accent-rgb),.34),0 0 3px rgba(255,255,255,.22);
}
.sst-card-orb{
    position:absolute;
    z-index:5;
    width:30px;height:30px;
    display:grid;place-items:center;
    border-radius:50%;
    font-size:12px;font-weight:1000;font-family:"Orbitron","Rajdhani",sans-serif;
    border:2px solid rgba(255,255,255,.58);
    box-shadow:0 5px 12px rgba(0,0,0,.45),0 0 14px currentColor;
}
.sst-card-cost{left:8px;top:8px;background:radial-gradient(circle at 30% 25%,#86f6ff,#1177d8 67%,#032d74);color:#fff}
.sst-card-power{right:8px;bottom:8px;background:radial-gradient(circle at 30% 25%,#fff6a0,#ff9f24 62%,#9f3914);color:#fff}
.sst-card-stars{position:absolute;inset:0;opacity:.6;background-image:radial-gradient(circle at 20% 25%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 80% 32%,#fff 0 1px,transparent 1.5px),radial-gradient(circle at 65% 78%,rgba(var(--sst-accent-rgb),.9) 0 1px,transparent 1.5px);background-size:58px 58px,77px 77px,91px 91px}
.sstCardButton.is-save-selected .sst-card-face{border-color:#7cedff;box-shadow:0 0 0 2px rgba(124,237,255,.30),0 0 30px rgba(124,237,255,.52),0 9px 20px rgba(0,0,0,.4)}
.sstCardButton.is-shop-protected .sst-card-face{border-color:#ff8be2;box-shadow:0 0 0 2px rgba(255,139,226,.26),0 0 25px rgba(255,64,190,.38),0 9px 20px rgba(0,0,0,.4)}
.sstCardButton:disabled{cursor:not-allowed}
.sstCardButton.is-blocked .sst-card-face,.sstCardButton.is-shop-protected .sst-card-face{filter:saturate(.82) brightness(.84)}
.sst-card-face.is-protected{box-shadow:0 0 0 2px rgba(var(--sst-accent-rgb),.22),0 0 28px rgba(var(--sst-accent-rgb),.16),0 9px 20px rgba(0,0,0,.4);}
.sst-card-face.is-protected::after{content:"🛡";position:absolute;left:8px;bottom:8px;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.92),rgba(var(--sst-accent-rgb),.65));box-shadow:0 0 16px rgba(var(--sst-accent-rgb),.45);font-size:18px;opacity:.9;}
.steal-phase .sst-card-face.is-protected-save::after,.steal-phase .sst-card-face.is-protected-shop::after,.steal-phase .sst-card-face.is-protected-groot::after,.steal-phase .sst-card-face.is-protected-economy::after{content:"🎭";}

.sst-shield{
    position:absolute;
    z-index:9;
    right:8px;top:8px;
    width:88px;height:100px;
    transform:none;
    clip-path:polygon(50% 0,93% 15%,86% 65%,50% 100%,14% 65%,7% 15%);
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:2px;
    background:linear-gradient(155deg,rgba(255,255,255,.25),rgba(63,226,255,.24) 42%,rgba(14,72,132,.42));
    border:0;
    filter:drop-shadow(0 0 12px rgba(79,231,255,.72));
    pointer-events:none;
}
.sst-shield::before{
    content:"";position:absolute;inset:5px;clip-path:inherit;background:linear-gradient(155deg,rgba(255,255,255,.10),rgba(19,70,141,.46));box-shadow:0 0 0 1px rgba(154,245,255,.68) inset;
}
.sst-shield::after{
    content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 25%,rgba(255,255,255,.48) 45%,transparent 62%);transform:translateX(-120%);animation:sstShieldSweep 2.7s ease-in-out infinite;
}
@keyframes sstShieldSweep{0%,55%{transform:translateX(-130%)}80%,100%{transform:translateX(130%)}}
.sst-shield-core,.sst-shield-label{position:relative;z-index:2;text-shadow:0 0 8px currentColor}
.sst-shield-core{font-size:26px;color:#dffcff;text-shadow:0 0 16px #bff8ff}
.sst-shield-label{font-size:10px;font-weight:1000;letter-spacing:.08em;color:#fff;text-align:center;padding:0 6px;text-shadow:0 0 8px rgba(0,0,0,.7)}
.is-protected-shop .sst-shield,.is-shop-protected .sst-shield{background:linear-gradient(155deg,rgba(255,255,255,.22),rgba(255,87,211,.30),rgba(103,31,150,.44));filter:drop-shadow(0 0 12px rgba(255,77,208,.78))}
.is-protected-shop .sst-shield::before,.is-shop-protected .sst-shield::before{background:linear-gradient(155deg,rgba(255,255,255,.08),rgba(98,22,115,.52));box-shadow:0 0 0 1px rgba(255,160,231,.7) inset}
.is-protected-groot .sst-shield,.is-protected-economy .sst-shield{background:linear-gradient(155deg,rgba(255,255,255,.20),rgba(166,122,255,.30),rgba(57,32,129,.44));filter:drop-shadow(0 0 12px rgba(167,118,255,.74))}
.sst-card.is-disabled{opacity:.96}

.sstStealLayout{height:100%;display:flex;flex-direction:column;overflow:hidden;padding:14px;background:linear-gradient(180deg,rgba(28,10,23,.66),rgba(10,8,20,.44));}
.sstHeistBanner{
    display:grid;
    grid-template-columns:minmax(0,1fr) 220px minmax(0,1fr);
    align-items:stretch;
    gap:10px;
    margin-bottom:10px;
}
.sstHeistRole{display:flex;flex-direction:column;justify-content:center;min-width:0;padding:13px 16px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);position:relative;overflow:hidden}
.sstHeistRole::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:0 0 0 1px rgba(255,255,255,.06) inset;}
.sstHeistRole--thief{border-color:rgba(255,92,120,.56);background:linear-gradient(180deg,rgba(255,92,120,.16),rgba(255,92,120,.05));box-shadow:inset 0 0 28px rgba(255,92,120,.12)}
.sstHeistRole--thief .sstRoleLabel::before{content:"🎭 ";}
.sstHeistRole--victim{text-align:right;border-color:rgba(89,224,255,.44);background:linear-gradient(180deg,rgba(89,224,255,.12),rgba(89,224,255,.03));box-shadow:inset 0 0 28px rgba(89,224,255,.10)}
.sstHeistRole--victim .sstRoleLabel::before{content:"🛡 ";}
.sstHeistRole strong{font-size:clamp(22px,2.1vw,32px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:"Orbitron","Rajdhani",sans-serif;text-shadow:0 0 12px rgba(0,0,0,.45)}
.sstHeistArrow{display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,.66)}
.sstHeistArrow span{font-size:11px;font-weight:1000;color:rgba(255,255,255,.72);font-family:"Orbitron","Rajdhani",sans-serif;}
.sstHeistArrow b{font-size:16px;letter-spacing:.18em;color:#ff7d95;text-shadow:0 0 12px rgba(255,92,120,.42);font-family:"Orbitron","Rajdhani",sans-serif;}
.sstHeistArrow i{font-size:40px;font-style:normal;color:#ff5bea;text-shadow:0 0 18px #ff37dc}
.sstStealGrid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
.sstCardButton.is-being-stolen{z-index:20;animation:sstStealPick .28s ease both}
@keyframes sstStealPick{0%{transform:scale(1)}45%{transform:translateY(-12px) scale(1.05);filter:brightness(1.35) drop-shadow(0 0 20px #ff50df)}100%{transform:translateX(-20px) scale(.92);opacity:0}}
.sstNoTarget{grid-column:1/-1;min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:1px dashed rgba(108,236,255,.34);border-radius:15px;background:rgba(47,169,207,.07);color:rgba(255,255,255,.7);text-align:center}
.sstNoTargetIcon{font-size:36px;filter:drop-shadow(0 0 14px #63eaff)}
.sstNoTarget strong{font-size:16px;letter-spacing:.1em;color:#c9f8ff}.sstNoTarget span{font-size:11px}

.sstFooter{
    flex:0 0 auto;
    min-height:48px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:16px;
    padding:8px 14px;
    border-top:1px solid rgba(255,255,255,.10);
    background:linear-gradient(180deg,rgba(1,4,14,.26),rgba(1,4,14,.50));
}
.sstFooterHint{font-size:12px;font-weight:800;color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 8px rgba(0,0,0,.45)}
.cosmicBtn{
    flex:0 0 auto!important;
    margin:0!important;
    min-width:160px;
    min-height:36px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding:10px 20px!important;
    border:1px solid rgba(255,255,255,.28)!important;
    border-radius:999px!important;
    background:linear-gradient(135deg,rgba(var(--sst-accent-rgb),.90),rgba(var(--sst-accent-rgb),.46))!important;
    color:#fff!important;
    font-size:12px;
    font-family:"Orbitron","Rajdhani",sans-serif;
    font-weight:1000!important;
    letter-spacing:.08em;
    cursor:pointer!important;
    box-shadow:0 8px 20px rgba(0,0,0,.25),0 0 24px rgba(var(--sst-accent-rgb),.25)!important;
    transition:.18s ease;
}
.cosmicBtn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.12)}
.cosmicBtn:disabled{opacity:.38;cursor:not-allowed!important;filter:grayscale(.4)}

#saveStealJeff{
    position:absolute!important;
    z-index:3!important;
    pointer-events:none!important;
    width:auto!important;
    height:clamp(280px,38vh,440px)!important;
    object-fit:contain;
    filter:drop-shadow(0 18px 24px rgba(0,0,0,.48)) drop-shadow(0 0 30px rgba(var(--sst-accent-rgb),.42));
    opacity:1!important;
    transition:left .45s ease,right .45s ease,bottom .45s ease,transform .45s ease,opacity .35s ease!important;
}
.sstJeffHalo{
    position:absolute;
    z-index:2;
    width:420px;
    height:250px;
    border-radius:50%;
    pointer-events:none;
    background:radial-gradient(circle,rgba(var(--sst-accent-rgb),.34),rgba(var(--sst-accent-rgb),.08) 44%,transparent 72%);
    filter:blur(16px);
    transition:.45s ease;
}
.save-phase #saveStealJeff{left:50%!important;right:auto!important;bottom:-12px!important;transform:translateX(-50%)!important;animation:sstJeffSave 3.1s ease-in-out infinite!important}
.save-phase .sstJeffHalo{left:50%;transform:translateX(-50%);bottom:-38px}
.steal-phase #saveStealJeff{left:50%!important;right:auto!important;bottom:-16px!important;transform:translateX(-50%)!important;animation:sstJeffSteal 2.8s ease-in-out infinite!important}
.steal-phase .sstJeffHalo{left:50%;transform:translateX(-50%);bottom:-44px}
.resolve-phase #saveStealJeff{left:50%!important;right:auto!important;bottom:-14px!important;transform:translateX(-50%) rotate(2deg)!important;opacity:1!important;animation:sstJeffSave 3.1s ease-in-out infinite!important}
.resolve-phase .sstJeffHalo{left:50%;transform:translateX(-50%);bottom:-42px}
@keyframes sstJeffSave{0%,100%{translate:0 0}50%{translate:0 -9px}}
@keyframes sstJeffSteal{0%,100%{translate:0 0 rotate(-1deg)}50%{translate:4px -10px rotate(1deg)}}

.sstResolve{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;padding:10px 180px}
.sstResolveSeal{width:88px;height:88px;display:grid;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.26);background:radial-gradient(circle,rgba(255,255,255,.14),rgba(var(--sst-accent-rgb),.14));box-shadow:0 0 36px rgba(var(--sst-accent-rgb),.32);animation:sstResolveSeal 1.15s ease-in-out infinite alternate}
.sstResolveSeal span{font-size:38px;text-shadow:0 0 18px #fff;color:#fff}
@keyframes sstResolveSeal{to{transform:scale(1.06);box-shadow:0 0 58px rgba(var(--sst-accent-rgb),.48)}}
.sstResolveKicker{margin-top:14px}.sstResolve h3{margin:6px 0 16px;font-size:clamp(34px,3.8vw,58px);font-family:"Orbitron","Rajdhani",sans-serif;text-shadow:0 0 18px rgba(255,79,110,.26),0 0 28px rgba(255,79,110,.18)}
.sstTransferList{width:min(760px,100%);max-height:260px;overflow:auto;display:flex;flex-direction:column;gap:7px}
.sstTransferRow{display:grid;grid-template-columns:1fr 24px 1.25fr 1.2fr;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;border:1px solid rgba(255,79,110,.26);background:linear-gradient(180deg,rgba(255,79,110,.10),rgba(0,0,0,.22));font-size:12px;box-shadow:0 0 18px rgba(255,79,110,.08)}
.sstTransferPlayer{font-weight:1000;color:#c9f7ff;text-align:right}.sstTransferArrow{color:#ff96ed}.sstTransferCard{font-weight:1000;color:#fff}.sstTransferFrom{color:rgba(255,255,255,.44);text-align:left}
.sstTransferEmpty{padding:18px;border:1px dashed rgba(255,255,255,.18);border-radius:14px;color:rgba(255,255,255,.58)}
.sstResolvePulse{position:absolute;width:460px;height:460px;border-radius:50%;border:1px solid rgba(var(--sst-accent-rgb),.16);animation:sstResolvePulse 1.1s ease-out infinite;pointer-events:none}
@keyframes sstResolvePulse{0%{transform:scale(.45);opacity:.75}100%{transform:scale(1.2);opacity:0}}

.sstPlayerRail,.sstCardGrid,.sstTransferList{scrollbar-width:thin;scrollbar-color:rgba(var(--sst-accent-rgb),.48) rgba(255,255,255,.05)}
.sstPlayerRail::-webkit-scrollbar,.sstCardGrid::-webkit-scrollbar,.sstTransferList::-webkit-scrollbar{width:8px;height:8px}
.sstPlayerRail::-webkit-scrollbar-thumb,.sstCardGrid::-webkit-scrollbar-thumb,.sstTransferList::-webkit-scrollbar-thumb{background:rgba(var(--sst-accent-rgb),.42);border-radius:999px}


.save-phase .sstPanelLabel,.save-phase .sstStageKicker,.save-phase .sstRoleLabel,.save-phase .sstPlayerTabText strong{color:#9af5ff;text-shadow:0 0 10px rgba(95,216,255,.42);}
.steal-phase .sstPanelLabel,.steal-phase .sstStageKicker,.steal-phase .sstRoleLabel,.steal-phase .sstResolveKicker{color:#ff8b9c;text-shadow:0 0 10px rgba(255,92,120,.34);}
.save-phase .sstFooterHint{color:rgba(210,247,255,.76);}
.steal-phase .sstFooterHint{color:rgba(255,220,228,.78);}
.steal-phase .sstNoTarget{border-color:rgba(255,92,120,.38);background:rgba(255,92,120,.08);}
@media (max-width:1050px){
    .cosmicPanel{width:calc(100vw - 22px)!important;height:calc(100vh - 22px)!important}
    .sstBody{padding:12px!important}
    .sstSaveLayout{grid-template-columns:210px minmax(0,1fr);gap:12px}
    .sstCardGrid{grid-template-columns:repeat(auto-fit,minmax(122px,1fr));gap:8px}
    #saveStealJeff{height:clamp(140px,19vh,180px)!important;opacity:1!important}
    .sstResolve{padding-inline:100px}
}
@media (max-width:760px){
    .sstHeader{padding:12px 12px 10px}.sstEyebrow{display:none}.sstPhaseTrack{margin-top:8px}.sstSubtitle{font-size:11px;margin-top:6px}
    .sstSaveLayout{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
    .sstPlayerPanel{padding:8px}.sstPanelLabel,.sstMiniLegend{display:none}.sstPlayerRail{flex-direction:row;overflow-x:auto;overflow-y:hidden;margin:0}.sstPlayerTab{min-width:170px}
    .sstStage{padding:10px}.sstProgressOrb{width:46px;height:46px}.sstProgressOrb strong{font-size:18px}
    .sstHeistBanner{grid-template-columns:1fr 120px 1fr}.sstHeistRole{padding:8px}.sstHeistArrow b{font-size:11px}.sstHeistArrow i{font-size:28px}.sstHeistRole strong{font-size:16px}
    .sstCardGrid{grid-template-columns:repeat(auto-fit,minmax(110px,1fr))}.sstCardButton{min-height:100px}
    .sstFooter{min-height:54px;padding:8px 10px}.sstFooterHint{display:none}.cosmicBtn{width:100%;min-width:0}
    #saveStealJeff,.sstJeffHalo{display:none!important}
    .sstResolve{padding:10px}.sstTransferRow{grid-template-columns:1fr 20px 1fr}.sstTransferFrom{grid-column:1/-1;text-align:center}
}
@media (prefers-reduced-motion:reduce){
    #cosmicSaveStealModal *,#cosmicSaveStealModal *::before,#cosmicSaveStealModal *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
}
`;

    document.head.appendChild(style);
}

// Explicit reusable API for Black Hole Anomalies and future systems.
if(typeof window!=="undefined"){
    window.startSaveStealFlow=startSaveStealFlow;
    window.canStartSaveStealFlow=canStartSaveStealFlow;
    window.openSaveStealModal=openSaveStealModal;
}

