/* ============================================================
   MSP SNAPDRAFT — SETTINGS V2 FOUNDATION
   PATCH101B
   - canonical base-mode radio sync over legacy runtime toggles
   - live draftConfig v2 preview/export helper
   - blueprint tabs / tooltips / twist metadata
   ============================================================ */
(function(){
    "use strict";

    const VERSION="2.8.0-tournament-v1-patch2";
    let syncingMode=false;
    let tooltipOwner=null;

    const $=id=>document.getElementById(id);
    const checked=id=>Boolean($(id)?.checked);
    const value=id=>String($(id)?.value??"").trim();
    const numberValue=(id,fallback=0)=>{
        const n=Number($(id)?.value);
        return Number.isFinite(n)?n:fallback;
    };
    const anomalyChance=()=>{
        const selected=document.querySelector('input[name="blackHoleAnomalyChance"]:checked');
        const n=Number(selected?.value||0.10);
        if([0.10,0.25,0.30,0.55].includes(n)) return n;
        if(n===0.05) return 0.10;
        if(n===0.50) return 0.55;
        return 0.10;
    };

    function selectedModeId(){
        const selected=document.querySelector('input[name="settingsDraftMode"]:checked');
        if(selected) return selected.value;
        if(checked("enablePokerDraft")) return "poker";
        if(checked("enableGalacticCurrent")) return "galactic_current";
        return "classic";
    }

    function selectedGalacticVariant(){
        return document.querySelector('input[name="galacticCurrentVariant"]:checked')?.value||"rushing";
    }

    function modeDescriptor(){
        const id=selectedModeId();
        if(id==="poker") return {id,name:"Poker Draft",variant:null,variantName:null};
        if(id==="galactic_current"){
            const variant=selectedGalacticVariant();
            return {
                id,
                name:"Gwiezdny Prąd",
                variant,
                variantName:variant==="fading"?"Wygasające Gwiazdy":"Rwący Prąd"
            };
        }
        return {id:"classic",name:"Classic",variant:null,variantName:null};
    }

    function setLegacyToggle(el,next){
        if(!el||el.checked===next) return;
        el.checked=next;
        el.dispatchEvent(new Event("input",{bubbles:true}));
        el.dispatchEvent(new Event("change",{bubbles:true}));
    }

    function syncLegacyModeFromRadio(){
        if(syncingMode) return;
        syncingMode=true;
        try{
            const id=selectedModeId();
            setLegacyToggle($("enablePokerDraft"),id==="poker");
            setLegacyToggle($("enableGalacticCurrent"),id==="galactic_current");
            const variantPanel=$("galacticCurrentVariantPanel");
            if(variantPanel) variantPanel.hidden=id!=="galactic_current";
        }finally{
            syncingMode=false;
        }
        syncModeSpecificControls();
        renderSummary();
        try{ window.updateModePreview?.(); }catch(_){ }
    }

    function syncRadioFromLegacy(){
        if(syncingMode) return;
        syncingMode=true;
        try{
            let id="classic";
            if(checked("enablePokerDraft")) id="poker";
            else if(checked("enableGalacticCurrent")) id="galactic_current";
            const radio=document.querySelector(`input[name="settingsDraftMode"][value="${id}"]`);
            if(radio) radio.checked=true;
            const variantPanel=$("galacticCurrentVariantPanel");
            if(variantPanel) variantPanel.hidden=id!=="galactic_current";
        }finally{
            syncingMode=false;
        }
        syncModeSpecificControls();
        renderSummary();
    }

    const TOURNAMENT_SIZES=[8,10,12];
    function tournamentSizeValid(){return TOURNAMENT_SIZES.includes(numberValue("numPlayers",0));}
    function competitionConfig(){
        const enabled=checked("enableTournamentFormat");
        return enabled
            ? {id:"single_elimination",name:"System turniejowy",version:1,bonusScheme:"milestones60_v1",thirdPlaceMatch:true}
            : {id:"round_robin",name:"Każdy z każdym",version:1};
    }
    function updateTournamentAvailability(){
        const el=$("enableTournamentFormat");
        const card=el?.closest(".settingsV2SettingCard");
        const valid=tournamentSizeValid();
        if(!el) return;
        // Preserve the selected value when the player count changes temporarily:
        // validating before start rejects unsupported counts.
        card?.classList.toggle("is-not-applicable",!valid);
        const note=$("sdTournamentCountNote");
        if(note) note.textContent=valid
            ? `Dostępny dla ${numberValue("numPlayers")} graczy. Po drafcie losowanie drabinki.`
            : "Wybierz 8, 10 lub 12 graczy, aby uruchomić turniej.";
        el.setAttribute("aria-invalid",el.checked&&!valid?"true":"false");
        // The format is locked after START so the archive and snapshot stay aligned.
        el.disabled=Boolean(window.SnapdraftTournamentUI?.isSessionLocked?.())||(!valid&&!el.checked);
    }

    function extensionConfig(){
        return {
            superpowers:{enabled:checked("enableSuperpowers"),name:"Supermoce"},
            customPacks:{enabled:checked("enableCustomPacks"),name:"Custom Packi"},
            jokers:{enabled:checked("enableJokers"),name:"Jokery"},
            saveAndSteal:{enabled:checked("enableSaveSteal"),name:"Save & Steal"},
            economy:{enabled:checked("enableEconomy"),name:"Ekonomia Draftu"},
            bounties:{
                enabled:checked("enableBounties"),
                name:"Łowcy Nagród",
                requires:["economy"],
                rewardProfile:(document.querySelector('input[name="bountyRewardProfile"]:checked')?.value||"standard"),
                rewardProfileName:(document.querySelector('input[name="bountyRewardProfile"]:checked')?.value||"standard")==="gold_rush"?"Gorączka Złota":"Standardowe Łowy"
            },
            draftQuests:{enabled:checked("enableDraftQuests"),name:"Kosmiczne Questy",requires:["economy"]},
            galacticMarket:{enabled:checked("enableTradeMarket"),name:"Galaktyczny Targ",requires:["economy"]},
            mulligan:{enabled:checked("infoMulligan"),name:"Mulligan",execution:"operator_or_future_engine"},
            sideboard:{
                enabled:selectedModeId()!=="poker"&&checked("enablePlanetaryReserve"),
                name:"Planetarna Rezerwa",
                subtitle:"Sideboard",
                size:3,
                candidatePoolSize:12,
                version:1
            },
            blackHoleAnomalies:{
                enabled:selectedModeId()==="classic"&&checked("enableBlackHoleAnomalies"),
                name:"Anomalie Czarnej Dziury",
                chance:anomalyChance(),
                guarantee:$("blackHoleAnomalyGuarantee")?checked("blackHoleAnomalyGuarantee"):true,
                chaosPreset:anomalyChance()===0.55,
                incompatibleWith:["galactic_current","poker"],
                engineVersion:window.BlackHoleAnomalies?.VERSION||"1.1.0"
            }
        };
    }

    function specialSettingsConfig(){
        const timerSeconds=numberValue("turnTimerSeconds",0);
        const twistEnabled=checked("infoThemeTwists");
        const presetCard=value("infoPresetCard");
        return {
            draftFlow:{
                timer:{enabled:timerSeconds>0,seconds:timerSeconds},
                cerebroAutopilot:{enabled:checked("enableCerebro")},
                additionalPackBuffer:(()=>{
                    const extra=Math.min(2,Math.max(0,numberValue("packBufferSize",0)));
                    return {
                        enabled:extra>0,
                        extra,
                        base:1,
                        effective:1+extra,
                        appliesTo:"classic_pack_flow",
                        applicable:selectedModeId()==="classic"
                    };
                })()
            },
            poolRules:{
                bans:{enabled:checked("enableBans")},
                luckyCards:{enabled:checked("enableLuckyCards")},
                seriesFilters:{enabled:false,status:"planned"},
                tagFilters:{enabled:false,status:"planned"},
                poolProfile:{enabled:false,status:"planned",id:null,name:null}
            },
            deckFinalization:{
                presetCard:{enabled:Boolean(presetCard),card:presetCard||null,optional:true,replacementRatio:"1:1"},
                champions:{enabled:checked("infoChampions"),replacementPerPlayer:checked("infoChampions")?1:0,ignoresBans:true}
            },
            specialTwist:{
                enabled:twistEnabled,
                name:twistEnabled?(value("infoTwistName")||"Specjalny Twist"):null,
                description:twistEnabled?(value("infoTwistDescription")||""):null,
                execution:"operator_defined"
            }
        };
    }

    function getConfig(){
        return {
            schema:"msp-snapdraft/settings-v2",
            version:VERSION,
            draftMode:modeDescriptor(),
            competitionFormat:competitionConfig(),
            extensions:extensionConfig(),
            sideboard:{
                enabled:selectedModeId()!=="poker"&&checked("enablePlanetaryReserve"),
                size:3,
                candidatePoolSize:12,
                version:1
            },
            specialSettings:specialSettingsConfig()
        };
    }

    function activeExtensionNames(config){
        return Object.values(config.extensions||{}).filter(item=>item?.enabled).map(item=>item.name);
    }

    function activeSpecialNames(config){
        const out=[];
        const s=config.specialSettings||{};
        if(s.draftFlow?.timer?.enabled) out.push(`Timer ${s.draftFlow.timer.seconds}s`);
        if(s.draftFlow?.cerebroAutopilot?.enabled) out.push("Cerebro Autopilot");
        const extra=Number(s.draftFlow?.additionalPackBuffer?.extra||0);
        const effective=Number(s.draftFlow?.additionalPackBuffer?.effective||1+extra);
        if(s.draftFlow?.additionalPackBuffer?.applicable!==false && extra>0) out.push(`Bufor Paczki +${effective}`);
        if(s.poolRules?.bans?.enabled) out.push("Bany");
        if(s.poolRules?.luckyCards?.enabled) out.push("Lucky Cards");
        if(s.deckFinalization?.presetCard?.enabled) out.push(`Preset: ${s.deckFinalization.presetCard.card}`);
        if(s.deckFinalization?.champions?.enabled) out.push("Championy");
        if(s.specialTwist?.enabled) out.push(`Twist: ${s.specialTwist.name||"Specjalny"}`);
        if(config.competitionFormat?.id==="single_elimination") out.push("System turniejowy · 60 pkt/faza · BYE +20");
        return out;
    }

    function esc(value){
        return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));
    }

    function renderSummary(target){
        const box=target||$("modePreviewBox");
        if(!box) return;
        const config=getConfig();
        const mode=config.draftMode;
        const addons=activeExtensionNames(config).map(name=>{
            if(name!=="Łowcy Nagród") return name;
            const bounty=config.extensions?.bounties;
            return bounty?.enabled ? `${name} · ${bounty.rewardProfileName||"Standardowe Łowy"}` : name;
        });
        const specials=activeSpecialNames(config);
        const modeSub=mode.variantName?mode.variantName:"Bazowy protokół pickowania";
        box.innerHTML=`
            <section class="settingsV2SummarySection">
                <small>TRYB DRAFTOWANIA</small>
                <div class="settingsV2SummaryMode"><b>${esc(mode.name)}</b><span>${esc(modeSub)}</span></div>
            </section>
            <section class="settingsV2SummarySection">
                <small>ROZSZERZENIA</small>
                ${addons.length?`<div class="settingsV2SummaryChips">${addons.map(name=>`<span class="settingsV2SummaryChip is-addon">${esc(name)}</span>`).join("")}</div>`:`<span class="settingsV2SummaryMuted">Brak aktywnych addonów.</span>`}
            </section>
            <section class="settingsV2SummarySection">
                <small>USTAWIENIA SPECJALNE</small>
                ${specials.length?`<div class="settingsV2SummaryChips">${specials.map(name=>`<span class="settingsV2SummaryChip is-special">${esc(name)}</span>`).join("")}</div>`:`<span class="settingsV2SummaryMuted">Domyślne reguły SnapDrafta.</span>`}
            </section>`;
        updateNavCounts(config);
        window.dispatchEvent(new CustomEvent("snapdraft:settings-v2-change",{detail:{config}}));
    }

    function setTab(name){
        document.querySelectorAll("[data-settings-tab]").forEach(button=>{
            const active=button.dataset.settingsTab===name;
            button.classList.toggle("is-active",active);
            button.setAttribute("aria-selected",active?"true":"false");
        });
        document.querySelectorAll("[data-settings-pane]").forEach(pane=>{
            const active=pane.dataset.settingsPane===name;
            pane.hidden=!active;
            pane.classList.toggle("is-active",active);
        });
    }


    function syncModeSpecificControls(){
        const mode=selectedModeId();
        const buffer=$("packBufferSize");
        const bufferCard=buffer?.closest(".settingsV2SettingCard");
        if(buffer){
            buffer.disabled=mode!=="classic";
            bufferCard?.classList.toggle("is-not-applicable",mode!=="classic");
            if(mode!=="classic") buffer.title=mode==="galactic_current"
                ? "Bufor Paczki powiększa klasyczną paczkę, więc nie ma zastosowania w Gwiezdnym Prądzie."
                : "Dodatkowy Bufor Paczki dotyczy klasycznego przepływu paczek.";
            else buffer.removeAttribute("title");
        }
        const custom=$("enableCustomPacks");
        const customCard=custom?.closest(".settingsV2Card,.settingsV2SettingCard,.settingsV2ExtensionCard,.settingsV2AddonCard")||custom?.closest("label")?.parentElement;
        if(custom){
            const blocked=mode==="galactic_current";
            custom.disabled=blocked;
            customCard?.classList.toggle("is-not-applicable",blocked);
            if(blocked){
                custom.checked=false;
                custom.title="Custom Packi tworzą klasyczne paczki, dlatego nie mają zastosowania w Gwiezdnym Prądzie.";
            }else custom.removeAttribute("title");
        }
        const reserve=$("enablePlanetaryReserve");
        const reserveCard=reserve?.closest(".settingsV2SettingCard,.settingsV2ExtensionCard,.settingsV2AddonCard")||reserve?.closest("label")?.parentElement;
        if(reserve){
            const blocked=mode==="poker";
            reserve.disabled=blocked;
            reserveCard?.classList.toggle("is-not-applicable",blocked);
            if(blocked){
                reserve.checked=false;
                reserve.title="Planetarna Rezerwa V1 nie obsługuje legacy Poker Draftu.";
            }else reserve.removeAttribute("title");
        }
        const anomalies=$("enableBlackHoleAnomalies");
        const anomaliesCard=anomalies?.closest(".settingsV2Card")||null;
        if(anomalies){
            const blocked=mode!=="classic";
            anomalies.disabled=blocked;
            anomaliesCard?.classList.toggle("is-not-applicable",blocked);
            anomaliesCard?.classList.toggle("is-mode-blocked",blocked);
            if(blocked){
                anomalies.checked=false;
                anomalies.title="Anomalie Czarnej Dziury V1 działają wyłącznie w trybie Classic.";
                setDependencyBadge(anomaliesCard,"N/A • TYLKO CLASSIC","mode_blocked");
            }else{
                anomalies.removeAttribute("title");
                setDependencyBadge(anomaliesCard,"TYLKO CLASSIC","");
            }
        }
    }

    function toggleTwistFields(){
        const fields=document.querySelector("[data-settings-twist-fields]");
        if(fields) fields.hidden=!checked("infoThemeTwists");
    }

    function tooltipTextFor(target){
        const owner=target.closest?.("[data-settings-tooltip]")||target;
        return owner?.dataset?.settingsTooltip||"";
    }

    function positionTooltip(owner){
        const tooltip=$("settingsV2Tooltip");
        if(!tooltip||!owner) return;
        const rect=owner.getBoundingClientRect();
        const configurator=$("settingsV2Configurator")?.getBoundingClientRect();
        const width=Math.min(340,window.innerWidth-24);
        let left=(configurator?.right||window.innerWidth)-width-18;
        left=Math.max(12,Math.min(window.innerWidth-width-12,left));
        let top=Math.max(12,(configurator?.top||rect.top)+66);
        tooltip.style.width=`${width}px`;
        tooltip.style.left=`${left}px`;
        tooltip.style.top=`${top}px`;
        requestAnimationFrame(()=>{
            const tRect=tooltip.getBoundingClientRect();
            if(tRect.bottom>window.innerHeight-10){
                top=Math.max(10,window.innerHeight-tRect.height-12);
                tooltip.style.top=`${top}px`;
            }
        });
    }

    function showTooltip(owner){
        const tooltip=$("settingsV2Tooltip");
        const text=tooltipTextFor(owner);
        if(!tooltip||!text) return;
        // Keep the help card in the viewport even when the configurator lives
        // inside a transformed, vertically scrolled start panel.
        if(tooltip.parentElement!==document.body) document.body.appendChild(tooltip);
        tooltipOwner=owner;
        tooltip.textContent=text;
        tooltip.hidden=false;
        positionTooltip(owner);
    }

    function hideTooltip(owner){
        const tooltip=$("settingsV2Tooltip");
        if(!tooltip) return;
        if(owner&&tooltipOwner&&owner!==tooltipOwner) return;
        tooltip.hidden=true;
        tooltipOwner=null;
    }

    function bindTooltips(root){
        root.querySelectorAll("[data-settings-tooltip]").forEach(owner=>{
            const help=owner.querySelector(".settingsV2Help");
            owner.addEventListener("mouseenter",()=>showTooltip(owner));
            owner.addEventListener("mouseleave",()=>hideTooltip(owner));
            if(help){
                help.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();showTooltip(owner);});
                help.addEventListener("mouseenter",event=>{event.stopPropagation();showTooltip(owner);});
                help.addEventListener("focus",()=>showTooltip(owner));
                help.addEventListener("blur",()=>hideTooltip(owner));
                help.addEventListener("mousedown",event=>event.stopPropagation());
            }
        });
        window.addEventListener("scroll",()=>{if(tooltipOwner) positionTooltip(tooltipOwner);},{passive:true});
        window.addEventListener("resize",()=>{if(tooltipOwner) positionTooltip(tooltipOwner);},{passive:true});
    }


    function setChecked(id,next,{emit=true}={}){
        const el=$(id);
        if(!el) return;
        const value=Boolean(next);
        if(el.checked===value) return;
        el.checked=value;
        if(emit){
            el.dispatchEvent(new Event("input",{bubbles:true}));
            el.dispatchEvent(new Event("change",{bubbles:true}));
        }
    }

    function setValue(id,next,{emit=true}={}){
        const el=$(id);
        if(!el || next===undefined || next===null) return;
        const value=String(next);
        if(el.value===value) return;
        el.value=value;
        if(emit){
            el.dispatchEvent(new Event("input",{bubbles:true}));
            el.dispatchEvent(new Event("change",{bubbles:true}));
        }
    }

    /*
       Canonical restore bridge. This intentionally writes into the legacy controls
       because the current engines still read those IDs. Settings V2 remains the
       canonical schema while old runtime modules stay compatible.
    */
    function applyConfig(rawConfig,{emit=true}={}){
        if(!rawConfig || typeof rawConfig!=="object") return false;
        const config=rawConfig.draftConfigV2||rawConfig;
        if(!config || typeof config!=="object") return false;

        const modeId=config.draftMode?.id||"classic";
        syncingMode=true;
        try{
            const modeRadio=document.querySelector(`input[name="settingsDraftMode"][value="${modeId}"]`)
                || document.querySelector('input[name="settingsDraftMode"][value="classic"]');
            if(modeRadio) modeRadio.checked=true;
            setChecked("enablePokerDraft",modeId==="poker",{emit:false});
            setChecked("enableGalacticCurrent",modeId==="galactic_current",{emit:false});
            const variant=config.draftMode?.variant||"rushing";
            const variantRadio=document.querySelector(`input[name="galacticCurrentVariant"][value="${variant}"]`);
            if(variantRadio) variantRadio.checked=true;
        }finally{
            syncingMode=false;
        }

        const ext=config.extensions||{};
        setChecked("enableTournamentFormat",config.competitionFormat?.id==="single_elimination",{emit});
        updateTournamentAvailability();
        setChecked("enableSuperpowers",ext.superpowers?.enabled,{emit});
        setChecked("enableCustomPacks",ext.customPacks?.enabled,{emit});
        setChecked("enableJokers",ext.jokers?.enabled,{emit});
        setChecked("enableSaveSteal",ext.saveAndSteal?.enabled,{emit});
        const economyRequired=Boolean(ext.bounties?.enabled||ext.draftQuests?.enabled||ext.galacticMarket?.enabled);
        setChecked("enableEconomy",Boolean(ext.economy?.enabled||economyRequired),{emit});
        setChecked("enableBounties",ext.bounties?.enabled,{emit});
        const bountyProfile=ext.bounties?.rewardProfile || (ext.bounties&&Object.keys(ext.bounties).length?"gold_rush":"standard");
        const bountyProfileRadio=document.querySelector(`input[name="bountyRewardProfile"][value="${bountyProfile}"]`)
            || document.querySelector('input[name="bountyRewardProfile"][value="standard"]');
        if(bountyProfileRadio) bountyProfileRadio.checked=true;
        setChecked("enableDraftQuests",ext.draftQuests?.enabled,{emit});
        setChecked("enableTradeMarket",ext.galacticMarket?.enabled,{emit});
        setChecked("infoMulligan",ext.mulligan?.enabled,{emit});
        setChecked("enablePlanetaryReserve",modeId!=="poker"&&Boolean(config.sideboard?.enabled ?? ext.sideboard?.enabled),{emit});
        setChecked("enableBlackHoleAnomalies",modeId==="classic"&&Boolean(ext.blackHoleAnomalies?.enabled),{emit});
        const anomalyChanceValue=Number(ext.blackHoleAnomalies?.chance||0.10).toFixed(2);
        const anomalyChanceRadio=document.querySelector(`input[name="blackHoleAnomalyChance"][value="${anomalyChanceValue}"]`);
        if(anomalyChanceRadio) anomalyChanceRadio.checked=true;
        setChecked("blackHoleAnomalyGuarantee",ext.blackHoleAnomalies?.guarantee!==false,{emit:false});

        const special=config.specialSettings||{};
        setValue("turnTimerSeconds",special.draftFlow?.timer?.enabled?special.draftFlow?.timer?.seconds:0,{emit});
        setChecked("enableCerebro",special.draftFlow?.cerebroAutopilot?.enabled,{emit});
        const oldBuffer=Number(special.draftFlow?.packBuffer?.value||1);
        const extraBuffer=Number(special.draftFlow?.additionalPackBuffer?.extra ?? Math.max(0,oldBuffer-1));
        setValue("packBufferSize",Math.min(2,Math.max(0,extraBuffer)),{emit});
        setChecked("enableBans",special.poolRules?.bans?.enabled,{emit});
        setChecked("enableLuckyCards",special.poolRules?.luckyCards?.enabled,{emit});
        setValue("infoPresetCard",special.deckFinalization?.presetCard?.card||"",{emit});
        setChecked("infoChampions",special.deckFinalization?.champions?.enabled,{emit});
        setChecked("infoThemeTwists",special.specialTwist?.enabled,{emit});
        setValue("infoTwistName",special.specialTwist?.name||"",{emit:false});
        setValue("infoTwistDescription",special.specialTwist?.description||"",{emit:false});

        const variantPanel=$("galacticCurrentVariantPanel");
        if(variantPanel) variantPanel.hidden=modeId!=="galactic_current";
        syncModeSpecificControls();
        syncAddonDependencies();
        toggleTwistFields();
        renderSummary();
        return true;
    }

    function normalizedCardList(value){
        if(!Array.isArray(value)) return [];
        return value.map(item=>String(item||"").trim()).filter(Boolean);
    }

    function runtimeDetailHtml(rawConfig,details={}){
        const config=rawConfig?.draftConfigV2||rawConfig||getConfig();
        const special=config.specialSettings||{};
        const rows=[];
        const bans=normalizedCardList(details.bans ?? special.poolRules?.bans?.cards);
        const lucky=normalizedCardList(details.luckyCards ?? special.poolRules?.luckyCards?.cards);
        const preset=special.deckFinalization?.presetCard;
        const twist=special.specialTwist;

        if(special.poolRules?.bans?.enabled){
            rows.push(`<div class="settingsV2RuntimeDetail"><small>BANY</small><span>${bans.length?esc(bans.join(" · ")):"Brak wskazanych kart"}</span></div>`);
        }
        if(special.poolRules?.luckyCards?.enabled){
            rows.push(`<div class="settingsV2RuntimeDetail"><small>LUCKY CARDS</small><span>${lucky.length?esc(lucky.join(" · ")):"Aktywne"}</span></div>`);
        }
        if(preset?.enabled && preset.card){
            rows.push(`<div class="settingsV2RuntimeDetail"><small>PRESET CARD</small><span>${esc(preset.card)}</span></div>`);
        }
        if(twist?.enabled){
            const title=twist.name||"Specjalny Twist";
            rows.push(`<div class="settingsV2RuntimeDetail settingsV2RuntimeTwist"><small>SPECJALNY TWIST — ${esc(title)}</small>${twist.description?`<span>${esc(twist.description)}</span>`:""}</div>`);
        }
        return rows.join("");
    }

    // PATCH 2.5 — The archive contains only settings with historical meaning.
    // WARNING: getConfig(), applyConfig() and full draft snapshots are untouched.
    // `draftConfigV2` is intentionally retained for older archive consumers.
    function getArchiveConfig(details={}){
        const runtime=getConfig();
        const special=runtime.specialSettings||{};
        const luckyData=details.luckyCardsData||window.LuckyCards?.getExportData?.()||{};
        const bans=normalizedCardList(details.bans ?? special.poolRules?.bans?.cards);
        const luckyCards=normalizedCardList(details.luckyCards ?? luckyData.selected ?? special.poolRules?.luckyCards?.cards);
        const mode=runtime.draftMode||{};

        const draftMode={id:mode.id||"classic",name:mode.name||"Classic"};
        if(mode.variant) draftMode.variant=mode.variant;
        if(mode.variantName) draftMode.variantName=mode.variantName;

        const archive={
            schema:"msp-snapdraft/settings-v2",
            version:VERSION,
            draftMode,
            competitionFormat:{...runtime.competitionFormat}
        };

        const extensions={};
        Object.entries(runtime.extensions||{}).forEach(([key,item])=>{
            if(!item?.enabled) return;
            const entry={enabled:true,name:item.name||key};
            if(key==="bounties"){
                entry.rewardProfile=item.rewardProfile||"standard";
                entry.rewardProfileName=item.rewardProfileName||(entry.rewardProfile==="gold_rush"?"Gorączka Złota":"Standardowe Łowy");
            }
            if(key==="sideboard"){
                entry.size=Number(item.size)||3;
                entry.candidatePoolSize=Number(item.candidatePoolSize)||12;
            }
            if(key==="blackHoleAnomalies"){
                entry.chance=Number(item.chance)||0.10;
                entry.guarantee=item.guarantee!==false;
                if(item.chaosPreset)entry.chaosPreset=true;
            }
            extensions[key]=entry;
        });
        if(Object.keys(extensions).length) archive.extensions=extensions;
        if(runtime.sideboard?.enabled){
            archive.sideboard={enabled:true,size:Number(runtime.sideboard.size)||3,candidatePoolSize:Number(runtime.sideboard.candidatePoolSize)||12};
        }

        const specialSettings={};
        const draftFlow={};
        if(special.draftFlow?.timer?.enabled) draftFlow.timer={enabled:true};
        if(special.draftFlow?.cerebroAutopilot?.enabled) draftFlow.cerebroAutopilot={enabled:true};
        if(special.draftFlow?.additionalPackBuffer?.enabled){
            const extra=Math.max(0,Math.min(2,Number(special.draftFlow.additionalPackBuffer.extra)||0));
            draftFlow.additionalPackBuffer={enabled:true,extra,effective:1+extra};
        }
        if(Object.keys(draftFlow).length) specialSettings.draftFlow=draftFlow;

        const poolRules={};
        if(special.poolRules?.bans?.enabled) poolRules.bans={enabled:true,cards:bans};
        if(special.poolRules?.luckyCards?.enabled) poolRules.luckyCards={enabled:true,cards:luckyCards};
        for(const key of ["seriesFilters","tagFilters"]){
            const rule=special.poolRules?.[key];
            if(!rule?.enabled) continue;
            poolRules[key]={enabled:true};
            if(Array.isArray(rule.values))poolRules[key].values=[...rule.values];
        }
        if(special.poolRules?.poolProfile?.enabled){
            const profile=special.poolRules.poolProfile;
            poolRules.poolProfile={enabled:true};
            if(profile.id)poolRules.poolProfile.id=profile.id;
            if(profile.name)poolRules.poolProfile.name=profile.name;
        }
        if(Object.keys(poolRules).length) specialSettings.poolRules=poolRules;

        const deckFinalization={};
        if(special.deckFinalization?.presetCard?.enabled){
            deckFinalization.presetCard={enabled:true,card:special.deckFinalization.presetCard.card||null};
        }
        if(special.deckFinalization?.champions?.enabled)deckFinalization.champions={enabled:true};
        if(Object.keys(deckFinalization).length)specialSettings.deckFinalization=deckFinalization;

        if(special.specialTwist?.enabled){
            specialSettings.specialTwist={
                enabled:true,
                name:special.specialTwist.name||"Specjalny Twist",
                description:special.specialTwist.description||""
            };
        }
        if(Object.keys(specialSettings).length)archive.specialSettings=specialSettings;
        return archive;
    }

    function runtimeInfoHtml(rawConfig,details={}){
        const config=rawConfig?.draftConfigV2||rawConfig||getConfig();
        const mode=config.draftMode||{name:"Classic"};
        const extensions=Object.values(config.extensions||{}).filter(item=>item?.enabled);
        const special=config.specialSettings||{};

        const specialSettings=[];
        if(special.draftFlow?.timer?.enabled){
            const seconds=Number(special.draftFlow.timer.seconds)||0;
            specialSettings.push(seconds>0?`Timer ${seconds}s`:"Timer");
        }
        if(special.draftFlow?.cerebroAutopilot?.enabled) specialSettings.push("Cerebro Autopilot");
        const extraBuffer=Number(special.draftFlow?.additionalPackBuffer?.extra||0);
        if(special.draftFlow?.additionalPackBuffer?.applicable!==false && extraBuffer>0){
            specialSettings.push(`Bufor Paczki +${Number(special.draftFlow?.additionalPackBuffer?.effective||1+extraBuffer)}`);
        }
        if(special.poolRules?.bans?.enabled) specialSettings.push("Bany");
        if(special.poolRules?.luckyCards?.enabled) specialSettings.push("Lucky Cards");
        if(special.poolRules?.seriesFilters?.enabled) specialSettings.push("Filtr Series");
        if(special.poolRules?.tagFilters?.enabled) specialSettings.push("Filtr tagów");
        if(special.poolRules?.poolProfile?.enabled) specialSettings.push("Profil puli");
        if(special.deckFinalization?.presetCard?.enabled) specialSettings.push("Preset Card");
        if(special.deckFinalization?.champions?.enabled) specialSettings.push("Championy");
        if(special.specialTwist?.enabled) specialSettings.push("Specjalny Twist");
        if(config.competitionFormat?.id==="single_elimination") specialSettings.push("System turniejowy · 20 BYE · 60/faza");

        const chips=items=>items.length
            ? `<div class="settingsV2RuntimeChips">${items.map(item=>`<span>${esc(item)}</span>`).join("")}</div>`
            : `<span class="settingsV2RuntimeEmpty">—</span>`;

        return `<div class="settingsV2RuntimeInfo">
            <div class="settingsV2RuntimeMode"><small>TRYB DRAFTOWANIA</small><b>${esc(mode.name||"Classic")}</b>${mode.variantName?`<span>${esc(mode.variantName)}</span>`:""}</div>
            <div class="settingsV2RuntimeBlock"><small>ROZSZERZENIA</small>${chips(extensions.map(item=>{
                if(item.name==="Łowcy Nagród") return `${item.name} · ${item.rewardProfileName||"Standardowe Łowy"}`;
                if(item.name==="Anomalie Czarnej Dziury") return `${item.name} • ${Math.round(Number(item.chance||0.10)*100)}%${item.guarantee!==false?" • Gwarancja 1":""}`;
                return item.name;
            }))}</div>
            <div class="settingsV2RuntimeBlock"><small>USTAWIENIA SPECJALNE</small>${chips(specialSettings)}</div>
            ${runtimeDetailHtml(config,details)}
        </div>`;
    }

    function dependencyCardFor(id){
        return $(id)?.closest?.(".settingsV2Card")||null;
    }

    function setDependencyBadge(card,text,state=""){
        if(!card) return;
        let badge=card.querySelector(".settingsV2CardCopy em");
        const copy=card.querySelector(".settingsV2CardCopy");
        if(!badge && text && copy){
            badge=document.createElement("em");
            copy.appendChild(badge);
        }
        if(badge){
            badge.textContent=text||"";
            badge.hidden=!text;
        }
        card.dataset.dependencyState=state||"";
    }

    function syncAddonDependencies(){
        const economyOn=checked("enableEconomy");
        const modeId=selectedModeId();
        const pokerOn=modeId==="poker";
        const galacticOn=modeId==="galactic_current";
        const defs=[
            {id:"enableSuperpowers", economy:false, blocked:false},
            {id:"enableBounties", economy:true, blocked:pokerOn, blockedText:"NIEDOSTĘPNE W POKER DRAFT"},
            {id:"enableDraftQuests", economy:true, blocked:false},
            {id:"enableTradeMarket", economy:true, blocked:false}
        ];
        defs.forEach(def=>{
            const input=$(def.id);
            const card=dependencyCardFor(def.id);
            if(!input||!card) return;
            const missingEconomy=Boolean(def.economy&&!economyOn&&!def.blocked);
            const blocked=Boolean(def.blocked);
            input.disabled=blocked||missingEconomy;
            card.classList.toggle("is-requirement-missing",missingEconomy);
            card.classList.toggle("is-mode-blocked",blocked);
            if(blocked){
                if(input.checked){ input.checked=false; input.dispatchEvent(new Event("change",{bubbles:true})); }
                setDependencyBadge(card,def.blockedText||"NIEDOSTĘPNE DLA TEGO TRYBU","blocked");
            }else if(missingEconomy){
                setDependencyBadge(card,"WYMAGA ECONOMY • KLIKNIJ, ABY WŁĄCZYĆ","missing");
            }else if(def.economy){
                setDependencyBadge(card,input.checked?"ECONOMY • POŁĄCZONO":"WYMAGA ECONOMY","ready");
            }else{
                setDependencyBadge(card,"","ready");
            }
        });
        const bountyInput=$("enableBounties");
        const bountyProfilePanel=$("bountyRewardProfilePanel");
        if(bountyProfilePanel) bountyProfilePanel.hidden=!Boolean(bountyInput?.checked&&!bountyInput?.disabled);
    }

    function handleDependencyActivation(event){
        const card=event.target.closest?.(".settingsV2Card.is-requirement-missing");
        if(!card) return;
        const target=card.querySelector('input[type="checkbox"]');
        if(!target||!target.disabled) return;
        event.preventDefault();
        event.stopPropagation();
        const economy=$("enableEconomy");
        if(!economy) return;
        setChecked("enableEconomy",true,{emit:true});
        syncAddonDependencies();
        if(!target.disabled) setChecked(target.id,true,{emit:true});
        renderSummary();
        card.animate?.([
            {transform:"scale(.985)",filter:"brightness(.9)"},
            {transform:"scale(1.018)",filter:"brightness(1.18)"},
            {transform:"scale(1)",filter:"brightness(1)"}
        ],{duration:360,easing:"cubic-bezier(.2,.8,.2,1)"});
    }

    function countActiveByTab(config){
        const addonCount=Object.values(config.extensions||{}).filter(item=>item?.enabled).length;
        const s=config.specialSettings||{};
        let specialCount=0;
        if(s.draftFlow?.timer?.enabled) specialCount++;
        if(s.draftFlow?.cerebroAutopilot?.enabled) specialCount++;
        if(Number(s.draftFlow?.additionalPackBuffer?.extra||0)>0) specialCount++;
        if(s.poolRules?.bans?.enabled) specialCount++;
        if(s.poolRules?.luckyCards?.enabled) specialCount++;
        if(s.deckFinalization?.presetCard?.enabled) specialCount++;
        if(s.deckFinalization?.champions?.enabled) specialCount++;
        if(s.specialTwist?.enabled) specialCount++;
        if(config.competitionFormat?.id==="single_elimination") specialCount++;
        return {mode:1,extensions:addonCount,special:specialCount};
    }

    function updateNavCounts(config=getConfig()){
        const counts=countActiveByTab(config);
        document.querySelectorAll("[data-settings-tab]").forEach(btn=>{
            const key=btn.dataset.settingsTab;
            const count=counts[key]??0;
            btn.dataset.activeCount=String(count);
            btn.classList.toggle("has-active-settings",count>0);
        });
    }

    function validationErrors(config=getConfig()){
        const errors=[];
        if(!config?.draftMode?.id) errors.push({tab:"mode",message:"Wybierz Tryb draftowania."});
        const ext=config.extensions||{};
        ["bounties","draftQuests","galacticMarket"].forEach(key=>{
            if(ext[key]?.enabled&&!ext.economy?.enabled) errors.push({tab:"extensions",message:`${ext[key]?.name||key} wymaga włączonej Ekonomii Draftu.`});
        });
        if(config.draftMode?.id==="poker"&&ext.bounties?.enabled) errors.push({tab:"extensions",message:"Łowcy Nagród nie są obecnie dostępni w Poker Draft."});
        if(config.draftMode?.id!=="classic"&&ext.blackHoleAnomalies?.enabled) errors.push({tab:"extensions",message:"Anomalie Czarnej Dziury V1 działają wyłącznie w trybie Classic."});
        if(config.competitionFormat?.id==="single_elimination"){
            if(!tournamentSizeValid()) errors.push({tab:"special",message:"System turniejowy wymaga dokładnie 8, 10 lub 12 graczy."});
            if(!window.DraftTournamentEngine?.buildBracket || !window.SnapdraftTournamentUI?.beginDraft) errors.push({tab:"special",message:"Brakuje jednego z modułów Systemu Turniejowego. Sprawdź instalację Patcha 2."});
            if(typeof getFinalDraftPlayers==='function'){
                const roster=getFinalDraftPlayers().map(n=>String(n||'').trim());
                if(new Set(roster).size!==roster.length || roster.some(n=>!n)) errors.push({tab:"special",message:"Nicki graczy w turnieju muszą być niepuste i unikalne."});
            }
        }
        const twist=config.specialSettings?.specialTwist;
        if(twist?.enabled&&!String(twist.name||"").trim()) errors.push({tab:"special",message:"Aktywny Specjalny Twist potrzebuje nazwy."});
        if(twist?.enabled&&!String(twist.description||"").trim()) errors.push({tab:"special",message:"Opisz zasadę aktywnego Specjalnego Twista."});
        return errors;
    }

    function ensureValidationBanner(){
        const root=$("settingsV2Configurator");
        if(!root) return null;
        let banner=$("settingsV2ValidationBanner");
        if(!banner){
            banner=document.createElement("div");
            banner.id="settingsV2ValidationBanner";
            banner.className="settingsV2ValidationBanner";
            banner.hidden=true;
            banner.setAttribute("role","alert");
            root.prepend(banner);
        }
        return banner;
    }

    function showValidation(errors){
        const banner=ensureValidationBanner();
        if(!banner) return;
        if(!errors?.length){ banner.hidden=true; banner.innerHTML=""; return; }
        banner.innerHTML=`<b>SPRAWDŹ PROJEKT DRAFTU</b><span>${errors.map(e=>esc(e.message)).join(" • ")}</span>`;
        banner.hidden=false;
        banner.animate?.([{opacity:0,transform:"translate(-50%,-8px)"},{opacity:1,transform:"translate(-50%,0)"}],{duration:220,easing:"ease-out"});
    }

    function validateBeforeStart({focus=true}={}){
        syncAddonDependencies();
        const errors=validationErrors();
        showValidation(errors);
        if(!errors.length) return true;
        if(focus){
            setTab(errors[0].tab||"special");
            $("settingsV2Configurator")?.scrollIntoView?.({behavior:"smooth",block:"center"});
        }
        return false;
    }

    function refreshUx(){
        syncModeSpecificControls();
        syncAddonDependencies();
        updateTournamentAvailability();
        const config=getConfig();
        updateNavCounts(config);
        renderSummary();
        if(!validationErrors(config).length) showValidation([]);
    }

    function bind(){
        const root=$("settingsV2Configurator");
        if(!root||root.dataset.bound==="1") return;
        root.dataset.bound="1";

        root.querySelectorAll("[data-settings-tab]").forEach(button=>button.addEventListener("click",()=>setTab(button.dataset.settingsTab)));
        root.querySelectorAll('input[name="settingsDraftMode"]').forEach(radio=>radio.addEventListener("change",()=>{syncLegacyModeFromRadio();syncAddonDependencies();}));
        $("enablePokerDraft")?.addEventListener("change",syncRadioFromLegacy);
        $("enableGalacticCurrent")?.addEventListener("change",syncRadioFromLegacy);
        root.querySelectorAll('input[name="galacticCurrentVariant"]').forEach(radio=>radio.addEventListener("change",renderSummary));

        root.addEventListener("click",handleDependencyActivation,true);
        $("enableEconomy")?.addEventListener("change",syncAddonDependencies);
        $("enableBounties")?.addEventListener("change",syncAddonDependencies);
        $("enableDraftQuests")?.addEventListener("change",syncAddonDependencies);
        $("enableTradeMarket")?.addEventListener("change",syncAddonDependencies);
        $("enableBlackHoleAnomalies")?.addEventListener("change",syncModeSpecificControls);

        $("numPlayers")?.addEventListener("change",()=>{
            updateTournamentAvailability(); renderSummary();
            if(!validationErrors().length) showValidation([]);
        });
        const twist=$("infoThemeTwists");
        twist?.addEventListener("change",()=>{toggleTwistFields();renderSummary();});

        root.addEventListener("input",event=>{
            if(event.target.matches('input[name="settingsDraftMode"]')) return;
            renderSummary();
        });
        root.addEventListener("change",event=>{
            if(event.target.matches('input[name="settingsDraftMode"]')) return;
            renderSummary();
        });

        bindTooltips(root);
        syncRadioFromLegacy();
        syncModeSpecificControls();
        syncAddonDependencies();
        updateTournamentAvailability();
        toggleTwistFields();
        setTab("mode");
        renderSummary();
    }

    window.SettingsV2={
        version:VERSION,
        getConfig,
        getArchiveConfig,
        renderSummary,
        setTab,
        syncLegacyModeFromRadio,
        syncRadioFromLegacy,
        applyConfig,
        runtimeInfoHtml,
        syncAddonDependencies,
        validationErrors,
        validateBeforeStart,
        refreshUx
    };

    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bind,{once:true});
    else bind();
})();
