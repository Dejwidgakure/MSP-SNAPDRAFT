/* ============================================================
   MSP SNAPDRAFT — ANOMALIE CZARNEJ DZIURY
   JOKER RIFT + DAY/NIGHT REBUILD 02A — based on tested Prehistoric 01F
   ============================================================ */
(function(root,factory){
    const api=factory(root||{});
    if(typeof module!=="undefined"&&module.exports) module.exports=api;
    if(root) root.BlackHoleAnomalies=api;
})(typeof window!=="undefined"?window:globalThis,function(global){
    "use strict";

    const VERSION="2.12.6-mephisto-pact-22g";
    if(typeof window!=="undefined") window.__MEPHISTO_PATCH_VERSION__=VERSION;
    const ADMIN_TEST_BUILD="force-test-2";
    const ADMIN_STORAGE_KEY="mspSnapDraft.blackHoleAnomalies.adminTest.v2";
    const STORAGE_KEY="mspSnapDraft.blackHoleAnomalies.v1";
    const DEFAULT_CONFIG=Object.freeze({enabled:false,chance:0.10,guarantee:true,guaranteedAnomalyId:null});
    const RARITY_LABELS=Object.freeze({rare:"RZADKA",epic:"EPICKA",legendary:"LEGENDARNA",random:"PEŁEN LOS"});
    const RARITY_WEIGHTS=Object.freeze({rare:37,epic:35,legendary:28});
    const TIMING_LABELS=Object.freeze({draft_start:"START DRAFTU",before_open:"PRZED OTWARCIEM",after_open:"PO OTWARCIU",mid_pack:"W ŚRODKU PACZKI",after_pack:"PO ZAKOŃCZENIU PACZKI"});
    const WINDOW_LABELS=Object.freeze({draft_start:"START DRAFTU",intermission:"PRZERWA / PRZED PACZKĄ",before_pack_open:"PRZED OTWARCIEM PACZKI",after_pack_open:"PO OTWARCIU PACZKI",after_pick:"PO PICKU",after_pack:"PO ZAKOŃCZENIU PACZKI"});
    const SCHEDULER_VERSION="timeline-21b";
    const JEFF_PACK_SWIMMER_ASSETS=Object.freeze([
        "draft-assets/bha_jeff_pack_cubes.webp",
        "draft-assets/bha_jeff_love_tongue.webp",
        "draft-assets/bha_jeff_heart_eyes.webp",
        "draft-assets/bha_jeff_wink.webp",
        "draft-assets/bha_jeff_golden_card.webp",
        "draft-assets/bha_jeff_skeptical.webp",
        "draft-assets/bha_jeff_shades.webp"
    ]);
    const JEFF_PACK_LAYOUTS=Object.freeze([
        {x:2,y:24,scale:.56,rot:-10,dur:4.2,delay:.00,z:3},
        {x:98,y:22,scale:.54,rot:9,dur:4.7,delay:.20,z:3},
        {x:4,y:76,scale:.50,rot:-7,dur:5.0,delay:.11,z:2},
        {x:96,y:75,scale:.52,rot:8,dur:4.5,delay:.17,z:2},
        {x:25,y:-2,scale:.46,rot:-4,dur:4.1,delay:.06,z:4},
        {x:72,y:-1,scale:.47,rot:5,dur:4.8,delay:.28,z:4},
        {x:52,y:103,scale:.48,rot:0,dur:4.6,delay:.13,z:2}
    ]);
    const ZOMBIE_HORDE_ASSETS=Object.freeze([
        "draft-assets/zombie-horde/zombie_01.png",
        "draft-assets/zombie-horde/zombie_02.png",
        "draft-assets/zombie-horde/zombie_03.png",
        "draft-assets/zombie-horde/zombie_04.png",
        "draft-assets/zombie-horde/zombie_05.png"
    ]);
    const FORBIDDEN_FRUIT_ASSET="draft-assets/bha_forbidden_fruit_branch.webp";
    const LIVING_TRIBUNAL_PANEL_ASSET="draft-assets/bha_living_tribunal_panel.webp";
    const LIVING_TRIBUNAL_CHARACTER_ASSET="draft-assets/bha_living_tribunal.webp";
    const LIVING_TRIBUNAL_SCALE_ASSET="draft-assets/bha_living_tribunal_scale.webp";
    const KANG_CHARACTER_ASSET="draft-assets/bha_kang_time_rewind.png";
    const KANG_CLOCK_NORMAL_ASSET="draft-assets/bha_kang_clock_normal.webp";
    const KANG_CLOCK_WARPED_ASSET="draft-assets/bha_kang_clock_warped.webp";
    const MEPHISTO_EYES_ASSET="draft-assets/bha_mephisto_eyes.webp";
    const MEPHISTO_HELL_ASSET="draft-assets/bha_mephisto_hell.webp";
    const MEPHISTO_THRONE_ASSET="draft-assets/bha_mephisto_throne.webp";
    const MEPHISTO_CONTRACT_ASSET="draft-assets/bha_mephisto_contract.webp";
    const MEPHISTO_FIRE_A_ASSET="draft-assets/bha_mephisto_fire_a.webp";
    const MEPHISTO_FIRE_B_ASSET="draft-assets/bha_mephisto_fire_b.webp";
    const MEPHISTO_FIRE_C_ASSET="draft-assets/bha_mephisto_fire_c.webp";
    const FORBIDDEN_FRUIT_ABILITY_TYPES=Object.freeze([
        {id:"on-reveal",name:"On Reveal"},
        {id:"ongoing",name:"Ongoing"}
    ]);
    const FORBIDDEN_FRUIT_COST_POOL=Object.freeze([1,2,3,4,5,6]);

    const REGISTRY=Object.freeze([
        {id:"golden_meteor",name:"Złoty Meteor",rarity:"rare",timing:"before_open",requiresEconomy:true,runtimeReady:true,description:"Każdy gracz otrzymuje 5 JeffCoinów, jeśli Economy jest aktywne.",window:"intermission",scope:["economy","player"],replacePackTitle:false},
        {id:"joker_rift",name:"Jokerowa Szczelina",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Połowa kart aktualnej paczki zostaje zastąpiona prawdziwymi losowymi Jokerami z aktywnego katalogu Jokerów.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"black_hole",name:"Czarna Dziura",rarity:"legendary",timing:"after_open",runtimeReady:false,description:"Po otwarciu pochłania trzy czwarte paczki i generuje w ich miejsce inne legalne karty.",window:"after_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"prehistoric",name:"Prehistoryczna Anomalia",rarity:"rare",timing:"before_open",runtimeReady:true,description:"Paczka składa się wyłącznie z kart Starter, Series 1 i Recruit Pass.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"custom_pack_crack",name:"Pęknięcie Custom Packa",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Nadchodząca paczka zostaje całkowicie przejęta przez jeden losowy Custom Pack. Paczki historii zwycięskich draftów są wyłączone z losowania.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"zombie_horde",name:"Horda Zombie",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Pięć sąsiadujących kart tworzy Hordę. Każdy pick rozszerza infekcję o sąsiednią kartę, a wybranie Hordy daje losową kartę z Hordy i rozszerza ją dwukrotnie. Karta zabrana z Hordy pozostaje niezmienna do końca draftu.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"techno_organic_virus",name:"Techno-Organic Virus",rarity:"epic",timing:"before_open",minPackIndex:3,runtimeReady:true,description:"Każdy gracz otrzymuje nieuleczalnego Pacjenta Zero. Po każdym jego kolejnym picku wirus mutuje jedną niechronioną kartę w decku w inną kartę o tym samym Koszcie albo tej samej Sile co Pacjent Zero.",window:"intermission",duration:"rest_of_draft",scope:["player","deck"],replacePackTitle:false},
        {id:"battleworld",name:"Battleworld",rarity:"legendary",timing:"after_pack",minPackIndex:1,runtimeReady:true,description:"Po zakończeniu paczki Battleworld losowo wyrywa po jednej niechronionej karcie z decku każdego gracza; gracze następnie wybierają po jednej z tej wspólnej puli.",window:"after_pack",scope:["player","deck","queue"],replacePackTitle:false},
        {id:"jeff_anomaly",name:"Jeffowa Anomalia",rarity:"rare",timing:"before_open",runtimeReady:true,description:"Do paczki wdzierają się Jeff! i Jeff the Baby Dolphin!? — po jednej karcie na gracza.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"divine_judgment",name:"Boski Sąd",rarity:"legendary",timing:"before_open",minPackIndex:2,runtimeReady:false,description:"Gracze z największą liczbą kart kosztu 5+ tracą najwyższy koszt, który zostaje przelosowany.",window:"intermission",scope:["player","deck"],replacePackTitle:false},
        {id:"archetype_convergence",name:"Grawitacja Archetypu",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Losuje jedną Rodzinę Mechanik albo Archetyp Deckowy i wypełnia nią paczkę tak mocno, jak pozwala legalna pula. Brakujące sloty uzupełniają zwykłe legalne karty, a na środku paczki powstaje czarna dziura z nazwą wybranego tagu.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"night_of_the_living_dead",name:"Noc Żywych Trupów",rarity:"epic",timing:"mid_pack",minPackIndex:3,runtimeReady:true,description:"Po 1–2 pickach aktualnej paczki otwiera się nawiedzenie Kosmicznego Cmentarzyska: wszystkie możliwe karty wracają prawdziwie z Graveyardu do paczki, a brakujące sloty dopełniają zombie-fillery.",window:"after_pick",duration:"current_pack",scope:["pack","graveyard"]},
        {id:"random_chaos",name:"Losowy Chaos",rarity:"rare",timing:"before_open",minPackIndex:1,runtimeReady:true,description:"Jedna losowa karta w decku każdego gracza zostaje przelosowana.",window:"intermission",scope:["player","deck"],replacePackTitle:false},
        {id:"cosmic_rain",name:"Kosmiczny Deszcz",rarity:"rare",timing:"before_open",runtimeReady:true,description:"Paczka otrzymuje pięć dodatkowych kart, ale liczba picków pozostaje bez zmian.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"sun_and_moon",name:"Strefa Dnia i Nocy",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Paczka dzieli się na Strefę Nocy i Strefę Dnia; gracz wybiera z przypisanej strony, a ograniczenie znika, jeśli jego strona nie ma już żadnej karty.",window:"before_pack_open",duration:"current_pack",scope:["pack","pick"]},
        {id:"shadow_veil",name:"Zasłona Cienia",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Przez pierwszą rundę wyborów wszystkie karty w paczce są całkowicie zakryte.",window:"before_pack_open",duration:"current_pack",scope:["pack","pick"]},
        {id:"guess_who",name:"Paczka Zagadki",rarity:"rare",timing:"before_open",runtimeReady:true,description:"Paczka pokazuje wyłącznie koszt i siłę; nazwa karty ujawnia się po wybraniu.",window:"before_pack_open",duration:"current_pack",scope:["pack","pick"]},
        {id:"glitch_pack",name:"Glitchująca Paczka",rarity:"epic",timing:"before_open",runtimeReady:true,description:"Po każdym picku połowa pozostałych kart glitchuje kolejno w inne legalne karty; gdy zostaje 5 lub mniej, glitchują wszystkie.",window:"before_pack_open",duration:"current_pack",scope:["pack"]},
        {id:"invisible_queue",name:"Niewidzialna Kolejka",rarity:"epic",timing:"before_open",runtimeReady:true,replacePackTitle:false,superpowerPolicy:"allow",description:"Na jedną paczkę prawdziwa kolejność zostaje ukryta. Każda runda ma własną zamrożoną losową kolejność, a przyszli wybierający są zasłonięci niebieskim polem siłowym i ujawniają się dopiero w chwili swojej tury.",window:"before_pack_open",duration:"current_pack",scope:["queue","player"]},
        {id:"double_trouble",name:"Double Trouble",rarity:"epic",timing:"before_open",runtimeReady:true,replacePackTitle:false,description:"Każdy gracz wybiera tylko raz w tej paczce, ale zabiera od razu dwie połączone kolorystycznie karty. Paczka zawiera jedną dodatkową parę.",window:"before_pack_open",duration:"current_pack",scope:["pack","pick","queue"]},
        {id:"klyntar_haunting",name:"Symbioza Klyntaru",rarity:"epic",timing:"after_open",runtimeReady:true,replacePackTitle:false,description:"Po otwarciu paczki Klyntar przejmuje wyłącznie jej kolejkę: gracze zostają losowo połączeni w pary, wspólnie otrzymują wybraną kartę, a symbiont pożera dodatkową losową kartę. Następna paczka wraca do normalnego Snake'a.",window:"after_pack_open",duration:"current_pack",scope:["queue","player"]},
        {id:"forbidden_fruit",name:"Zakazany Owoc",rarity:"random",rarityMode:"random",timing:"mid_pack",runtimeReady:true,replacePackTitle:true,description:"Po pierwszym albo drugim picku nad paczką wyrasta kosmiczna gałąź z Zakazanym Owocem. Od tej chwili co trzy piki zmienia się rodzaj kart, których nie wolno wybierać — według Typu Zdolności, dwóch Rodzin Mechanik, trzech Kosztów albo progu Siły.",window:"after_pick",duration:"current_pack",scope:["pack","pick"]},
        {id:"astral_contract",name:"Astralny Kontrakt",rarity:"epic",timing:"mid_pack",runtimeReady:true,replacePackTitle:false,superpowerPolicy:"allow",description:"Dwoje losowych graczy zostaje związanych Astralnym Kontraktem. Mają 90 sekund, by wybrać po jednej legalnej karcie ze swoich decków i zatwierdzić wymianę. Jeśli nie zawrą układu na czas, los wybiera legalną parę kart za nich.",window:"after_pick",duration:"instant",scope:["player","deck"]},
        {id:"kang_time_rewind",name:"Kang — Cofnięcie Czasu",rarity:"legendary",timing:"mid_pack",runtimeReady:true,replacePackTitle:false,superpowerPolicy:"allow",description:"Po pierwszym pełnym obiegu graczy Kang naprawdę cofa ten obieg: ostatni pick każdego gracza znika z historii, pełna paczka wraca do stanu sprzed obiegu, pięć kart przechodzi do alternatywnej linii czasu, a odtwarzany pierwszy obieg zostaje odwrócony. Drugi obieg zachowuje oryginalną kolejność.",window:"after_pick",duration:"one_round",scope:["pack","queue","player"]},
        {id:"cost_cut",name:"Cięcie Kosztów",rarity:"rare",timing:"mid_pack",runtimeReady:true,description:"Wszystkie pozostałe karty kosztu 5+ transformują się w losowe legalne karty kosztu 1.",window:"after_pick",duration:"current_pack",scope:["pack"]},
        {id:"mephisto_pact",name:"Pakt z Mefisto",rarity:"legendary",timing:"draft_start",duration:"draft",scope:["player","deck"],superpowerPolicy:"allow",runtimeReady:true,description:"Mefisto trzykrotnie kusi w trakcie draftu gracza posiadającego co najmniej 5 kart. Cel wybiera według jednego z kryteriów: najmniejsza synergia Mechanic Family / Archetype, ostatnia pozycja w kolejce albo — przy aktywnej Economy — najmniejsza liczba JeffCoinów. Podpisanie cyrografu przemienia 3 losowe karty w karty bez zdolności i pozwala dobrać 2 zakazane karty.",window:"draft_start",replacePackTitle:false},
        {id:"cosmic_treasure",name:"Kosmiczny Skarb",rarity:"legendary",timing:"draft_start",duration:"draft",scope:["pack","player","economy"],superpowerPolicy:"allow",runtimeReady:true,description:"Na początku draftu galaktyczna mapa zdradza jednorazową wskazówkę. Gdzieś w późniejszych paczkach ukrywa się jeden Kosmiczny Skarb — kto wybierze tę kartę, odnajdzie zaginioną skrzynię i wymieni dowolną kartę ze swojego decku na dowolną legalną kartę z całej gry. Jeśli Economy jest aktywne, dodatkowo otrzyma +5 JeffCoinów.",window:"draft_start",replacePackTitle:false},
        {id:"shooting_stars",name:"Spadające Gwiazdy",rarity:"epic",timing:"draft_start",duration:"draft",scope:["pack","player","economy","queue"],superpowerPolicy:"allow",runtimeReady:true,description:"Przez cały draft w każdej z sześciu paczek ukrywa się jedna Spadająca Gwiazda. Trafienie jej podczas normalnego picku zatrzymuje draft i pozwala wybrać jedno z trzech losowych życzeń.",window:"draft_start",replacePackTitle:false},
        {id:"living_tribunal",name:"The Living Tribunal",rarity:"legendary",timing:"after_open",minPackIndex:3,runtimeReady:true,replacePackTitle:false,superpowerPolicy:"allow",description:"Po połowie draftu Living Tribunal ocenia aktualny deck każdego gracza przez dwa jego kolejne piki i proponuje pięć alternatywnych kart: dwie z najlepszego Archetypu Deckowego, dwie z drugiego Archetypu Deckowego i jedną z dominującej Rodziny Mechanik.",window:"after_pack_open",duration:"two_picks_each",scope:["player","deck","pick"]}
    ]);

    let state=createState();
    let uiBound=false;
    let activationTimer=0;
    let leaveTimer=0;
    let sunMoonRevealTimer=0;
    let battleworldSession=null;
    let archetypeGravityVisualSignature="";
    let customPackCrackVisualSignature="";
    let astralContractInterval=0;
    let astralContractCloseTimer=0;
    let astralContractResume=null;
    let kangRewindTimer=0;
    let kangFlashTimer=0;
    let mephistoPactStageTimer=0;
    let mephistoPactCloseTimer=0;

    function chooseLivingDeadTriggerPick(ctx=context()){
        const totalPicks=Math.max(0,Array.isArray(ctx?.pickOrder)?ctx.pickOrder.length:0);
        if(totalPicks<=1) return 1;
        return Math.random()<0.5?1:2;
    }

    function chooseAstralContractTriggerPick(ctx=context(),adminForced=false){
        const order=Array.isArray(ctx?.pickOrder)?ctx.pickOrder:[];
        if(!order.length) return 1;
        if(adminForced) return 1;
        const base=(Array.isArray(ctx?.decks)?ctx.decks:[]).map(deck=>Array.isArray(deck)?deck.length:0);
        const candidates=[];
        for(let resolved=1;resolved<=order.length;resolved++){
            const projected=[...base];
            for(let i=0;i<resolved;i++){
                const p=Number(order[i]);
                if(Number.isInteger(p)&&p>=0) projected[p]=Number(projected[p]||0)+1;
            }
            if(projected.filter(count=>Number(count||0)>0).length>=2) candidates.push(resolved);
        }
        const pool=candidates.length?candidates:[Math.min(order.length,Math.max(1,2))];
        return pool[Math.floor(Math.random()*pool.length)];
    }

    function createState(){
        return {version:VERSION,schedulerVersion:SCHEDULER_VERSION,enabled:false,config:{...DEFAULT_CONFIG},timeline:[],plan:[],events:[],active:null,ongoing:null,technoOrganicVirus:null,livingTribunal:null,astralContract:null,astralContractHistory:[],kangTimeRewind:null,kangHistory:[],locked:false,draftPlayers:[],totalPacks:6,mode:"classic",adminTest:{enabled:false,anomalyId:null,completed:false,scheduledPackIndex:null,blockedReason:null}};
    }
    function clone(value){
        if(value===undefined) return undefined;
        if(typeof structuredClone==="function"){try{return structuredClone(value);}catch(_){}}
        return JSON.parse(JSON.stringify(value));
    }
    function clampChance(value){
        const n=Number(value);
        if([0.10,0.25,0.30,0.55].includes(n)) return n;
        // 13B migration: legacy presets map to their nearest replacement instead of silently resetting.
        if(n===0.05) return 0.10;
        if(n===0.50) return 0.55;
        return DEFAULT_CONFIG.chance;
    }
    function shuffle(list,random=Math.random){
        const out=[...list];
        for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
        return out;
    }
    function chooseUniform(list,random=Math.random){
        if(!Array.isArray(list)||!list.length) return null;
        const index=Math.min(list.length-1,Math.floor(Math.max(0,Math.min(.999999999,Number(random())||0))*list.length));
        return list[index]||list[list.length-1]||null;
    }
    function chooseRarity(random=Math.random,allowed=["rare","epic","legendary"]){
        const legal=allowed.filter(key=>Number(RARITY_WEIGHTS[key]||0)>0);
        if(!legal.length) return null;
        const total=legal.reduce((sum,key)=>sum+Number(RARITY_WEIGHTS[key]||0),0);
        let roll=Math.max(0,Math.min(.999999999,Number(random())||0))*total;
        for(const key of legal){roll-=Number(RARITY_WEIGHTS[key]||0);if(roll<0) return key;}
        return legal[legal.length-1];
    }
    // Backward-compatible helper name: rarity is rolled first, then the concrete anomaly.
    function chooseWeighted(list,random=Math.random){
        if(!Array.isArray(list)||!list.length) return null;
        const rarities=[...new Set(list.map(item=>item?.rarity).filter(key=>RARITY_WEIGHTS[key]))];
        const rarity=chooseRarity(random,rarities);
        return chooseUniform(list.filter(item=>item?.rarity===rarity),random)||chooseUniform(list,random);
    }
    function runtimeRegistry(){return REGISTRY.filter(def=>def.runtimeReady===true);}
    function packRuntimeRegistry(){return runtimeRegistry().filter(def=>String(def?.duration||"")!=="draft"&&def?.window!=="draft_start"&&def?.timing!=="draft_start");}
    function ongoingRuntimeRegistry(){return runtimeRegistry().filter(def=>String(def?.duration||"")==="draft"||def?.window==="draft_start"||def?.timing==="draft_start");}
    function staticEligible(def,options={}){
        if(!def?.runtimeReady) return false;
        if(String(options.mode||"classic")!=="classic") return false;
        if(def.requiresEconomy&&!options.economyEnabled) return false;
        return true;
    }
    function eligibleForPack(def,packIndex,options={}){
        if(!staticEligible(def,options)) return false;
        if(Number(def.minPackIndex||0)>Number(packIndex||0)) return false;
        return true;
    }
    function getLegalTimelineSlots(def,options={}){
        if(!staticEligible(def,options)) return [];
        const totalPacks=Math.max(1,Number(options.totalPacks)||6);
        const minPackIndex=Math.max(0,Number(def.minPackIndex||0));
        const window=String(def.window||({draft_start:"draft_start",before_open:"before_pack_open",after_open:"after_pack_open",mid_pack:"after_pick",after_pack:"after_pack"}[def.timing]||"before_pack_open"));
        if(window==="draft_start") return [{type:"draft_start",packIndex:null,cycleIndex:null}];
        const slots=[];
        if(def.id==="living_tribunal"){
            // 19B: Trybunał może pojawić się wyłącznie NA POCZĄTKU paczki 4, 5 albo 6,
            // ale dopiero po pełnym odsłonięciu kart tej paczki. Nie losujemy już środka paczki.
            const maxPackIndex=Math.min(totalPacks-1,5);
            for(let packIndex=minPackIndex;packIndex<=maxPackIndex;packIndex++){
                slots.push({type:"after_pack_open",packIndex,cycleIndex:packIndex,occupiedCycles:[packIndex]});
            }
            return slots;
        }
        for(let packIndex=minPackIndex;packIndex<totalPacks;packIndex++){
            const slot={type:window,packIndex,cycleIndex:packIndex};
            if(window==="intermission") slot.boundaryIndex=packIndex;
            if(window==="after_pick") slot.pickOffset=def.id==="kang_time_rewind"?Math.max(1,Number(options.playerCount)||1):(def.id==="night_of_the_living_dead"||def.id==="forbidden_fruit"||def.id==="astral_contract")?null:1;
            slots.push(slot);
        }
        return slots;
    }
    function slotCycleIndexes(slot){
        if(!slot||slot.type==="draft_start") return [];
        const raw=Array.isArray(slot.occupiedCycles)&&slot.occupiedCycles.length?slot.occupiedCycles:[slot.cycleIndex];
        return [...new Set(raw.map(Number).filter(Number.isInteger))];
    }
    function slotAvailable(slot,occupiedCycles,draftStartUsed){
        if(!slot) return false;
        if(slot.type==="draft_start") return !draftStartUsed;
        const cycles=slotCycleIndexes(slot);
        return cycles.length>0&&cycles.every(cycle=>!occupiedCycles.has(cycle));
    }
    function slotForDefinition(def,options,occupiedCycles,draftStartUsed,random=Math.random){
        const slots=getLegalTimelineSlots(def,options).filter(slot=>slotAvailable(slot,occupiedCycles,draftStartUsed));
        return chooseUniform(slots,random);
    }
    function definitionFitsConcreteSlot(def,slot,options={}){
        if(!def||!slot||!staticEligible(def,options)) return false;
        const window=String(def.window||"");
        if(window!==String(slot.type||"")) return false;
        if(slot.type==="draft_start") return true;
        if(def.id==="living_tribunal") return getLegalTimelineSlots(def,options).some(candidate=>candidate.type===slot.type&&Number(candidate.packIndex)===Number(slot.packIndex));
        return Number(def.minPackIndex||0)<=Number(slot.packIndex||0);
    }
    function buildPrerolledBackups(primary,slot,options={},random=Math.random){
        const candidates=runtimeRegistry().filter(def=>def.id!==primary.id&&def.rarity===primary.rarity&&definitionFitsConcreteSlot(def,slot,options));
        return shuffle(candidates,random).slice(0,2).map(def=>def.id);
    }
    function rollEventBudget(options={}){
        const opportunityCount=Math.max(1,Number(options.opportunityCount)||Math.max(1,Number(options.totalPacks)||6));
        const chance=clampChance(options.chance);
        const guarantee=options.guarantee!==false;
        const random=typeof options.random==="function"?options.random:Math.random;
        let count=0;
        for(let i=0;i<opportunityCount;i++) if(random()<chance) count++;
        const forced=Boolean(guarantee&&count===0);
        if(forced) count=1;
        return {count,forced,opportunityCount,chance};
    }
    function selectDefinitionsForRarities(raritySequence,options={},random=Math.random){
        const selected=[];
        const reserved=options.reservedDefinition||null;
        const usedIds=new Set(reserved?.id?[reserved.id]:[]);
        for(const rarity of raritySequence){
            let candidates=runtimeRegistry().filter(def=>def.id!==reserved?.id&&(def.rarity===rarity||def.rarity==="random")&&staticEligible(def,options)&&getLegalTimelineSlots(def,options).length>0);
            if(reserved?.window==="draft_start"||selected.some(def=>def.window==="draft_start")) candidates=candidates.filter(def=>def.window!=="draft_start");
            if(!candidates.length) return null;
            const fresh=candidates.filter(def=>!usedIds.has(def.id));
            const source=chooseUniform(fresh.length?fresh:candidates,random);
            if(!source) return null;
            const def=source.rarity==="random"?{...clone(source),rarity,rarityMode:"random"}:source;
            selected.push(def);
            usedIds.add(def.id);
        }
        return selected;
    }
    function assignTimelineSlots(definitions,options={},random=Math.random){
        const jobs=definitions.map((def,index)=>({def,index,slots:getLegalTimelineSlots(def,options)}));
        jobs.sort((a,b)=>a.slots.length-b.slots.length||a.index-b.index);
        const assigned=new Array(definitions.length);
        const occupiedCycles=new Set();
        let draftStartUsed=false;
        function place(position){
            if(position>=jobs.length) return true;
            const job=jobs[position];
            const slots=shuffle(job.slots,random);
            for(const slot of slots){
                if(!slotAvailable(slot,occupiedCycles,draftStartUsed)) continue;
                const cycles=slotCycleIndexes(slot);
                if(slot.type==="draft_start") draftStartUsed=true;
                else cycles.forEach(cycle=>occupiedCycles.add(cycle));
                assigned[job.index]=clone(slot);
                if(place(position+1)) return true;
                assigned[job.index]=undefined;
                if(slot.type==="draft_start") draftStartUsed=false;
                else cycles.forEach(cycle=>occupiedCycles.delete(cycle));
            }
            return false;
        }
        return place(0)?assigned:null;
    }
    function buildTimeline(options={}){
        const totalPacks=Math.max(1,Number(options.totalPacks)||6);
        const random=typeof options.random==="function"?options.random:Math.random;
        const schedulerOptions={...options,totalPacks,mode:String(options.mode||"classic")};
        const budget=rollEventBudget({...schedulerOptions,random});
        if(String(schedulerOptions.mode)!=="classic"||budget.count<=0) return [];

        // Optional named guarantee: reserve one SPECIFIC anomaly in its natural legal window.
        // Original chance rolls continue unchanged and can add other random anomalies.
        // With no selection the historical scheduler logic is untouched.
        const requestedId=options.guarantee===false?null:String(options.guaranteedAnomalyId||"");
        const requestedDef=requestedId?getDefinition(requestedId):null;
        const reservedDefinition=requestedDef&&staticEligible(requestedDef,schedulerOptions)&&getLegalTimelineSlots(requestedDef,schedulerOptions).length
            ? requestedDef:null;
        const extraRandomEvents=reservedDefinition
            ? (budget.forced?0:budget.count)
            : budget.count;
        const selectionOptions={...schedulerOptions,reservedDefinition};

        // Canon: rarity is rolled FIRST for random events and timing cannot change rarity.
        // Only the explicitly selected anomaly bypasses the random rarity roll.
        const legalRarities=["rare","epic","legendary"].filter(rarity=>runtimeRegistry().some(def=>def.id!==reservedDefinition?.id&&(def.rarity===rarity||def.rarity==="random")&&staticEligible(def,schedulerOptions)&&getLegalTimelineSlots(def,schedulerOptions).length>0));
        const raritySequence=Array.from({length:extraRandomEvents},()=>chooseRarity(random,legalRarities));
        let definitions=null,slots=null;
        const targetCount=extraRandomEvents+(reservedDefinition?1:0);
        for(let repair=0;repair<=Math.max(1,targetCount)&&!slots;repair++){
            for(let attempt=0;attempt<24&&!slots;attempt++){
                const randomDefinitions=selectDefinitionsForRarities(raritySequence,selectionOptions,random);
                if(!randomDefinitions) break;
                definitions=reservedDefinition?[reservedDefinition,...randomDefinitions]:randomDefinitions;
                slots=assignTimelineSlots(definitions,schedulerOptions,random);
            }
            if(slots) break;
            // Only an impossible capacity collision may alter a rolled rarity (e.g. six Legendary
            // events while the current runtime exposes only five legal Legendary windows).
            // This never happens merely because an anomaly has a late minPackIndex; the matcher
            // reorders constrained anomalies first. The repair is a last-resort legality guard.
            if(raritySequence.length&&legalRarities.length>1){
                const index=Math.max(0,raritySequence.length-1-(repair%raritySequence.length));
                const alternatives=legalRarities.filter(rarity=>rarity!==raritySequence[index]);
                raritySequence[index]=chooseRarity(random,alternatives)||alternatives[0]||raritySequence[index];
                definitions=null;
            }
        }
        if(!definitions||!slots) return [];

        const timeline=definitions.map((def,eventIndex)=>{
            const slot=slots[eventIndex];
            const item={...clone(def),scheduleId:`bha-${eventIndex+1}-${def.id}`,schedulerVersion:SCHEDULER_VERSION,window:String(def.window||slot.type),slot:clone(slot),packIndex:(slot.packIndex===null||slot.packIndex===undefined)?null:Number(slot.packIndex),triggered:false,guaranteed:Boolean((reservedDefinition&&def.id===reservedDefinition.id)||(!reservedDefinition&&budget.forced&&eventIndex===0))};
            item.backupIds=buildPrerolledBackups(def,slot,schedulerOptions,random);
            return item;
        });
        return timeline.sort((a,b)=>{
            const ap=a.slot?.type==="draft_start"?-1:Number(a.slot?.cycleIndex??a.packIndex??999);
            const bp=b.slot?.type==="draft_start"?-1:Number(b.slot?.cycleIndex??b.packIndex??999);
            if(ap!==bp) return ap-bp;
            const order={intermission:0,before_pack_open:1,after_pack_open:2,after_pick:3,after_pack:4,draft_start:-1};
            return Number(order[a.slot?.type]??9)-Number(order[b.slot?.type]??9);
        });
    }
    // Compatibility API used by older tests/consumers: transient events only.
    function buildPlan(options={}){return buildTimeline(options).filter(item=>item.window!=="draft_start"&&item.timing!=="draft_start");}

    function host(){return global.BlackHoleAnomalyHost||null;}
    function context(){return host()?.getContext?.()||{};}
    function getDefinition(id){return REGISTRY.find(item=>item.id===id)||null;}
    function readSettingsFromDom(){
        if(typeof document==="undefined") return {...state.config,enabled:state.enabled};
        const selected=document.querySelector('input[name="blackHoleAnomalyChance"]:checked');
        const guarantee=document.getElementById("blackHoleAnomalyGuarantee")?.checked!==false;
        const preferred=document.getElementById("blackHoleGuaranteedAnomaly")?.value||null;
        return {enabled:Boolean(document.getElementById("enableBlackHoleAnomalies")?.checked),chance:clampChance(selected?.value||state.config.chance),guarantee,guaranteedAnomalyId:guarantee&&runtimeRegistry().some(def=>def.id===preferred)?preferred:null};
    }
    function writeSettingsToDom(config={}){
        if(typeof document==="undefined") return;
        const chance=clampChance(config.chance);
        const radio=document.querySelector(`input[name="blackHoleAnomalyChance"][value="${chance.toFixed(2)}"]`);
        if(radio) radio.checked=true;
        const guarantee=document.getElementById("blackHoleAnomalyGuarantee");
        if(guarantee) guarantee.checked=config.guarantee!==false;
        const selected=document.getElementById("blackHoleGuaranteedAnomaly");
        if(selected) selected.value=runtimeRegistry().some(def=>def.id===config.guaranteedAnomalyId)?config.guaranteedAnomalyId:"";
        const enabled=document.getElementById("enableBlackHoleAnomalies");
        if(enabled&&config.enabled!==undefined) enabled.checked=Boolean(config.enabled);
        updateSettingsVisuals();
    }
    function saveSettings(config){try{global.localStorage?.setItem?.(STORAGE_KEY,JSON.stringify(config));}catch(_){}}
    function loadSettings(){try{const parsed=JSON.parse(global.localStorage?.getItem?.(STORAGE_KEY)||"null");if(parsed&&typeof parsed==="object") return {...DEFAULT_CONFIG,...parsed,chance:clampChance(parsed.chance)};}catch(_){} return {...DEFAULT_CONFIG};}
    function normalizeAdminTestConfig(config={}){
        const anomalyId=String(config.anomalyId||runtimeRegistry()[0]?.id||"");
        const valid=runtimeRegistry().some(def=>def.id===anomalyId);
        return {enabled:Boolean(config.enabled),anomalyId:valid?anomalyId:(runtimeRegistry()[0]?.id||null)};
    }
    function loadAdminTestSettings(){try{const parsed=JSON.parse(global.localStorage?.getItem?.(ADMIN_STORAGE_KEY)||"null");if(parsed&&typeof parsed==="object") return normalizeAdminTestConfig(parsed);}catch(_){} return normalizeAdminTestConfig({enabled:false});}
    function saveAdminTestSettings(config){const normalized=normalizeAdminTestConfig(config);try{global.localStorage?.setItem?.(ADMIN_STORAGE_KEY,JSON.stringify(normalized));}catch(_){}return normalized;}
    function readAdminTestFromDom(){
        if(typeof document==="undefined") return loadAdminTestSettings();
        return normalizeAdminTestConfig({enabled:Boolean(document.getElementById("bhaAdminTestEnabled")?.checked),anomalyId:document.getElementById("bhaAdminTestAnomaly")?.value});
    }
    function writeAdminTestToDom(config={}){
        if(typeof document==="undefined") return;
        const normalized=normalizeAdminTestConfig(config);
        const enabled=document.getElementById("bhaAdminTestEnabled");if(enabled) enabled.checked=normalized.enabled;
        const select=document.getElementById("bhaAdminTestAnomaly");if(select&&normalized.anomalyId) select.value=normalized.anomalyId;
        updateAdminTestVisuals();
    }
    function getSettingsConfig(){
        const config=readSettingsFromDom();
        return {enabled:Boolean(config.enabled),name:"Anomalie Czarnej Dziury",chance:clampChance(config.chance),guarantee:config.guarantee!==false,guaranteedAnomalyId:config.guarantee===false?null:(config.guaranteedAnomalyId||null),chaosPreset:clampChance(config.chance)===0.55,incompatibleWith:["galactic_current","poker"],engineVersion:VERSION};
    }


    function sortCosmicTreasureTemplates(list=[]){
        return [...(Array.isArray(list)?list:[])].sort((left,right)=>{
            const lc=Number(left?.cost), rc=Number(right?.cost);
            if(Number.isFinite(lc)&&Number.isFinite(rc)&&lc!==rc) return lc-rc;
            const lp=Number(left?.power), rp=Number(right?.power);
            if(Number.isFinite(lp)&&Number.isFinite(rp)&&lp!==rp) return lp-rp;
            return String(left?.name||"").localeCompare(String(right?.name||""),"pl");
        });
    }
    function legalCosmicTreasureTemplates(ctx=context()){
        const banned=new Set((Array.isArray(ctx?.bannedCards)?ctx.bannedCards:[]).map(normalizeName));
        return sortCosmicTreasureTemplates((Array.isArray(ctx?.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=normalizeName(card?.name);
            if(!name||card?.joker||banned.has(name)) return false;
            return true;
        }));
    }
    function findCosmicTreasureTemplateByName(name,ctx=context()){
        const target=normalizeName(name);
        return legalCosmicTreasureTemplates(ctx).find(card=>normalizeName(card?.name)===target)||null;
    }
    function buildCosmicTreasureHint(template,random=Math.random){
        if(!template) return "WSKAZÓWKA: NIEWYRAŹNE GWIEZDNE ZNACZNIKI.";
        const options=[];
        const cost=Number(template?.cost), power=Number(template?.power);
        if(Number.isFinite(cost)&&Number.isFinite(power)) options.push(`KOSZT ${cost} • SIŁA ${power}`);
        if(Number.isFinite(cost)) options.push(`KOSZT TEJ KARTY TO ${cost}`);
        if(Number.isFinite(power)) options.push(`SIŁA TEJ KARTY TO ${power}`);
        const name=String(template?.name||"").trim();
        if(name){
            options.push(`NAZWA ZACZYNA SIĘ NA „${name.charAt(0).toUpperCase()}”`);
            const words=name.split(/\s+/).filter(Boolean);
            if(words.length>=2) options.push(`KARTA MA ${words.length} CZŁONY W NAZWIE`);
        }
        if(!options.length) return "WSKAZÓWKA: GWIAZDY MILCZĄ O SZCZEGÓŁACH.";
        return chooseUniform(options,random)||options[0];
    }
    function buildCosmicTreasureSetup(totalPacks,random=Math.random,ctx=context()){
        const templates=legalCosmicTreasureTemplates(ctx);
        const template=chooseUniform(templates,random)||templates[0]||null;
        const fallbackPack=Math.max(0,Math.min(Math.max(0,Number(totalPacks||1)-1),1));
        const startPackMin=Math.min(Math.max(0,Number(totalPacks||1)-1),1);
        const legalPacks=[];
        for(let packIndex=startPackMin;packIndex<Math.max(1,Number(totalPacks||1));packIndex++) legalPacks.push(packIndex);
        const hiddenPackIndex=(chooseUniform(legalPacks,random) ?? fallbackPack);
        return {
            treasureTemplateName:template?.name||null,
            treasureHint:buildCosmicTreasureHint(template,random),
            initialTreasurePackIndex:Number(hiddenPackIndex),
            pendingTreasurePackIndex:Number(hiddenPackIndex),
            activeTreasurePackIndex:null,
            found:false,
            foundByPlayerIndex:null,
            foundAtPackIndex:null,
            rewardClaimed:false,
            rewardSummary:null,
            treasureMoveHistory:[],
            revealShown:false,
            economyBonusGranted:false
        };
    }
    function buildMephistoPactSetup(totalPacks=6,random=Math.random,ctx=context()){
        const playersCount=Math.max(1,Number(ctx?.players?.length||state.draftPlayers?.length)||1);
        const totalNormalPicks=Math.max(playersCount*12,playersCount*Math.max(1,Number(totalPacks)||6)*2);
        const firstEligiblePick=playersCount*5;
        const gapPicks=5;
        const available=Math.max(18,totalNormalPicks-firstEligiblePick);
        const centers=[.22,.52,.82].map(ratio=>firstEligiblePick+Math.round(available*ratio));
        const jitter=Math.max(1,Math.min(5,Math.floor(available/18)));
        const plan=[];
        centers.forEach((center,index)=>{
            const drift=Math.round(((typeof random==="function"?random():Math.random())*2-1)*jitter);
            const min=index===0?firstEligiblePick:plan[index-1]+gapPicks;
            const max=Math.max(min,totalNormalPicks-(2-index)*gapPicks);
            plan.push(Math.max(min,Math.min(max,center+drift)));
        });
        return {
            temptationsTotal:3,
            temptationsDone:0,
            minDeckSize:5,
            gapPicks,
            lastTriggerPickCount:0,
            activePrompt:false,
            history:[],
            lastPlayerIndex:null,
            temptationPlan:plan,
            lastSelectionCriterion:null
        };
    }
    function initializeOngoingEntry(entry,totalPacks,random=Math.random,ctx=context()){
        if(!entry) return null;
        const ongoing={...clone(entry),starCount:Math.min(6,totalPacks),starsByPack:{},hits:[],wishes:[],pendingQueuePriority:null};
        if(entry.id==="cosmic_treasure") Object.assign(ongoing,buildCosmicTreasureSetup(totalPacks,random,ctx));
        if(entry.id==="mephisto_pact") Object.assign(ongoing,buildMephistoPactSetup(totalPacks,random,ctx));
        return ongoing;
    }

    function beginDraft(players=[],options={}){
        const config={...readSettingsFromDom(),...(options.config||{})};
        config.enabled=options.enabled===undefined?Boolean(config.enabled):Boolean(options.enabled);
        config.chance=clampChance(config.chance);
        config.guarantee=config.guarantee!==false;
        config.guaranteedAnomalyId=config.guarantee&&runtimeRegistry().some(def=>def.id===config.guaranteedAnomalyId)?config.guaranteedAnomalyId:null;
        state=createState();
        state.mode=String(options.mode||"classic");
        state.enabled=Boolean(config.enabled&&state.mode==="classic");
        state.config={enabled:state.enabled,chance:config.chance,guarantee:config.guarantee,guaranteedAnomalyId:config.guaranteedAnomalyId};
        state.draftPlayers=[...players];
        state.totalPacks=Math.max(1,Number(options.totalPacks)||6);
        const adminConfig=normalizeAdminTestConfig(options.adminTest||loadAdminTestSettings());
        state.adminTest={...adminConfig,enabled:Boolean(state.enabled&&adminConfig.enabled),completed:false,scheduledPackIndex:null,blockedReason:null};
        const random=typeof options.random==="function"?options.random:Math.random;
        if(state.enabled&&state.adminTest.enabled){
            const forced=getDefinition(state.adminTest.anomalyId);
            if(forced?.runtimeReady&&(forced?.window==="draft_start"||forced?.timing==="draft_start"||String(forced?.duration||"")==="draft")){
                const forcedTimeline={...clone(forced),scheduleId:`admin-${forced.id}`,schedulerVersion:SCHEDULER_VERSION,window:"draft_start",slot:{type:"draft_start",packIndex:null,cycleIndex:null},packIndex:null,triggered:false,adminForced:true,guaranteed:true,backupIds:[]};
                state.timeline=[forcedTimeline];
                state.ongoing=initializeOngoingEntry(forcedTimeline,state.totalPacks,random,context());
                state.adminTest.blockedReason="draft_start";
            }
        }else if(state.enabled){
            state.timeline=buildTimeline({totalPacks:state.totalPacks,playerCount:players.length,chance:config.chance,guarantee:config.guarantee,guaranteedAnomalyId:config.guaranteedAnomalyId,economyEnabled:Boolean(options.economyEnabled),mode:state.mode,random});
            state.plan=state.timeline.filter(item=>item.window!=="draft_start"&&item.timing!=="draft_start");
            const ongoingEntry=state.timeline.find(item=>item.window==="draft_start"||item.timing==="draft_start"||String(item.duration||"")==="draft")||null;
            if(ongoingEntry){
                state.ongoing=initializeOngoingEntry(ongoingEntry,state.totalPacks,random,context());
            }
        }
        host()?.log?.("black_hole_anomalies_started",{data:{enabled:state.enabled,mode:state.mode,config:clone(state.config),schedulerVersion:SCHEDULER_VERSION,adminTest:clone(state.adminTest),ongoing:state.ongoing?{id:state.ongoing.id,rarity:state.ongoing.rarity,timing:state.ongoing.timing,window:state.ongoing.window,duration:state.ongoing.duration}:null,timeline:state.timeline.map(item=>({id:item.id,rarity:item.rarity,window:item.window,slot:clone(item.slot),packIndex:item.packIndex,guaranteed:Boolean(item.guaranteed),backupIds:clone(item.backupIds||[])})),plan:state.plan.map(item=>({id:item.id,packIndex:item.packIndex,rarity:item.rarity,timing:item.timing,window:item.window,guaranteed:Boolean(item.guaranteed)}))}});
        refreshRuntimeInfo();
        return exportState();
    }

    function setLocked(value){state.locked=Boolean(value);if(typeof document!=="undefined") document.body?.classList.toggle("bha-resolution-lock",state.locked);global.DraftTurnTimer?.refresh?.();}
    function blocksInteraction(){return Boolean(state.enabled&&state.locked);}

    function clearJeffPackAmbience(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaJeffPackAmbience")?.remove?.();
        document.getElementById("bhaJeffOpenWaveFx")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-jeff-open-pack");
    }
    function getOpenPackCardBounds(anchor){
        if(!anchor||typeof anchor.getBoundingClientRect!=="function") return null;
        const cards=[...anchor.querySelectorAll(".pack-card-btn,.joker-card-btn")].filter(node=>{
            const rect=node.getBoundingClientRect?.();
            return rect&&rect.width>0&&rect.height>0;
        });
        if(!cards.length) return null;
        const hostRect=anchor.getBoundingClientRect();
        const rects=cards.map(card=>card.getBoundingClientRect());
        const left=Math.min(...rects.map(rect=>rect.left))-hostRect.left;
        const top=Math.min(...rects.map(rect=>rect.top))-hostRect.top;
        const right=Math.max(...rects.map(rect=>rect.right))-hostRect.left;
        const bottom=Math.max(...rects.map(rect=>rect.bottom))-hostRect.top;
        return {left,top,width:Math.max(1,right-left),height:Math.max(1,bottom-top)};
    }
    function placeOpenPackLayer(layer,bounds,paddingX=62,paddingY=58){
        if(!layer||!bounds) return;
        layer.style.left=`${bounds.left-paddingX}px`;
        layer.style.top=`${bounds.top-paddingY}px`;
        layer.style.width=`${bounds.width+paddingX*2}px`;
        layer.style.height=`${bounds.height+paddingY*2}px`;
    }
    function refreshPackAmbience(presentation=getPackPresentation()){
        if(typeof document==="undefined") return;
        const anchor=document.getElementById("pack");
        const isOpen=typeof host()?.isPackOpen==="function" ? Boolean(host().isPackOpen()) : Boolean(global.packIsOpen);
        if(!anchor){clearJeffPackAmbience();clearLivingDeadPackBackdrop();return;}
        if(presentation?.id!=="prehistoric"||!isOpen) clearPrehistoricPackFx();
        const shouldShowLivingDeadBackdrop=Boolean(presentation?.active&&presentation?.id==="night_of_the_living_dead"&&isOpen&&state.active?.livingDeadBackdropActive);
        if(shouldShowLivingDeadBackdrop) ensureLivingDeadPackBackdrop(anchor); else clearLivingDeadPackBackdrop();
        const shouldShow=Boolean(presentation?.active&&presentation?.id==="jeff_anomaly"&&isOpen);
        if(!shouldShow){clearJeffPackAmbience();return;}
        const bounds=getOpenPackCardBounds(anchor);
        if(!bounds){document.getElementById("bhaJeffPackAmbience")?.remove?.();return;}
        anchor.classList.add("bha-jeff-open-pack");
        const ctx=context();
        const signature=[presentation?.id||"none",Number(ctx.packStartIndex||0),anchor.querySelectorAll(".pack-card-btn,.joker-card-btn").length].join("|");
        const existing=document.getElementById("bhaJeffPackAmbience");
        if(existing?.dataset?.signature===signature){placeOpenPackLayer(existing,bounds);return;}
        existing?.remove?.();
        const layer=document.createElement("div");
        layer.id="bhaJeffPackAmbience";
        layer.className="bha-jeff-pack-ambience";
        layer.dataset.signature=signature;
        layer.setAttribute("aria-hidden","true");
        placeOpenPackLayer(layer,bounds);
        const layouts=shuffle(JEFF_PACK_LAYOUTS).slice(0,3);
        const assets=shuffle(JEFF_PACK_SWIMMER_ASSETS);
        layouts.forEach((layout,index)=>{
            const swimmer=document.createElement("div");
            swimmer.className="bha-jeff-swimmer";
            swimmer.style.setProperty("--x",`${layout.x}%`);
            swimmer.style.setProperty("--y",`${layout.y}%`);
            swimmer.style.setProperty("--scale",String(layout.scale));
            swimmer.style.setProperty("--rot",`${layout.rot}deg`);
            swimmer.style.setProperty("--dur",`${layout.dur}s`);
            swimmer.style.setProperty("--delay",`${layout.delay}s`);
            swimmer.style.setProperty("--z",String(layout.z));
            swimmer.style.setProperty("--drift",`${index%2===0?-18:18}px`);
            const img=document.createElement("img");
            img.src=assets[index%assets.length];
            img.alt="";
            img.decoding="async";
            img.loading="eager";
            swimmer.appendChild(img);
            const wake=document.createElement("span");
            wake.className="bha-jeff-swimmer-wake";
            swimmer.appendChild(wake);
            const wave=document.createElement("span");
            wave.className="bha-jeff-swimmer-wave";
            swimmer.appendChild(wave);
            layer.appendChild(swimmer);
        });
        anchor.appendChild(layer);
    }
    function playJeffOpenWaveFx(presentation=getPackPresentation()){
        if(typeof document==="undefined") return false;
        const anchor=document.getElementById("pack");
        const isOpen=typeof host()?.isPackOpen==="function" ? Boolean(host().isPackOpen()) : Boolean(global.packIsOpen);
        if(!anchor||!isOpen||presentation?.id!=="jeff_anomaly"||!presentation?.active) return false;
        const bounds=getOpenPackCardBounds(anchor);
        if(!bounds) return false;
        document.getElementById("bhaJeffOpenWaveFx")?.remove?.();
        anchor.classList.add("bha-jeff-open-pack","bha-jeff-wave-reveal");
        const fx=document.createElement("div");
        fx.id="bhaJeffOpenWaveFx";
        fx.className="bha-jeff-open-wave-fx";
        fx.setAttribute("aria-hidden","true");
        placeOpenPackLayer(fx,bounds,78,72);
        fx.innerHTML=`<i class="bha-sea-wave wave-1"></i><i class="bha-sea-wave wave-2"></i><i class="bha-sea-wave wave-3"></i><span class="bha-sea-foam foam-1"></span><span class="bha-sea-foam foam-2"></span><span class="bha-sea-sheen"></span>`;
        anchor.appendChild(fx);
        setTimeout(()=>anchor.classList.add("bha-jeff-wave-cards-in"),2180);
        setTimeout(()=>{
            fx.remove?.();
            anchor.classList.remove("bha-jeff-wave-reveal","bha-jeff-wave-cards-in");
        },5550);
        return true;
    }
    function afterPackRendered(options={}){
        const presentation=getPackPresentation();
        refreshPackAmbience(presentation);
        if(presentation?.id==="sun_and_moon"){
            refreshSunMoonContext(context());
            renderSunMoonPackFx(context(),options);
        }else{
            refreshSunMoonContext();
            clearSunMoonPackFx();
        }
        if(presentation?.id==="prehistoric") ensurePrehistoricPackFx(context(),options);
        else clearPrehistoricPackFx();
        if(presentation?.id==="archetype_convergence") renderArchetypeGravityFx(context());
        else clearArchetypeGravityFx();
        if(presentation?.id==="custom_pack_crack") renderCustomPackCrackFx(context(),options);
        else clearCustomPackCrackFx();
        if(presentation?.id==="zombie_horde") refreshZombieHordePackFx();
        else clearZombieHordePackFx();
        if(presentation?.id==="forbidden_fruit") renderForbiddenFruitFx();
        else clearForbiddenFruitFx();
        if(options?.revealCards) playJeffOpenWaveFx(presentation);
    }

    function afterDecksRendered(){
        if(livingTribunalActive()&&state.livingTribunal?.panelVisible!==false) return renderLivingTribunalPanel();
        if(!state.livingTribunal?.ending) clearLivingTribunalPanel();
        return false;
    }

    function clearGoldenMeteorFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaGoldenMeteorFx")?.remove?.();
        document.querySelectorAll(".bha-golden-meteor-target-pulse").forEach(node=>node.classList.remove("bha-golden-meteor-target-pulse"));
    }
    function getGoldenMeteorTarget(playerIndex){
        if(typeof document==="undefined") return null;
        const wallet=[...document.querySelectorAll(`[data-economy-wallet-player="${Number(playerIndex)}"]`)]
            .find(node=>node.offsetParent!==null);
        if(wallet) return wallet;
        return [...document.querySelectorAll("#decks .deck-section")][Number(playerIndex)]||null;
    }
    function playGoldenMeteorFx(outcome={}){
        if(typeof document==="undefined") return false;
        clearGoldenMeteorFx();
        const ctx=context();
        const playerCount=Math.max(0,Number(outcome?.creditedPlayers)||Number(ctx.players?.length)||Number(state.draftPlayers?.length)||0);
        if(!playerCount) return false;
        const root=document.createElement("div");
        root.id="bhaGoldenMeteorFx";
        root.className="bha-golden-meteor-fx";
        root.setAttribute("aria-hidden","true");
        const flash=document.createElement("div");
        flash.className="bha-golden-meteor-flash";
        root.appendChild(flash);
        const shower=document.createElement("div");
        shower.className="bha-golden-meteor-shower";
        root.appendChild(shower);
        document.body.appendChild(root);
        const width=Math.max(640,global.innerWidth||1280);
        const height=Math.max(480,global.innerHeight||720);
        // Background shower first: this sells the meteor event before the targeted +5 streams arrive.
        const showerCount=Math.min(26,10+playerCount*4);
        for(let i=0;i<showerCount;i++){
            const coin=document.createElement("img");
            coin.className="bha-golden-meteor-coin is-shower";
            coin.src="draft-assets/jeffcoin.png";
            coin.alt="";
            coin.style.setProperty("--sx",`${Math.round(12+Math.random()*(width-24))}px`);
            coin.style.setProperty("--fall",`${Math.round(height*.62+Math.random()*height*.26)}px`);
            coin.style.setProperty("--drift",`${Math.round(-95+Math.random()*190)}px`);
            coin.style.setProperty("--delay",`${Math.round(Math.random()*720)}ms`);
            coin.style.setProperty("--dur",`${Math.round(1050+Math.random()*650)}ms`);
            shower.appendChild(coin);
        }
        for(let playerIndex=0;playerIndex<playerCount;playerIndex++){
            const target=getGoldenMeteorTarget(playerIndex);
            const rect=target?.getBoundingClientRect?.();
            const targetX=rect?rect.left+rect.width/2:width*((playerIndex+1)/(playerCount+1));
            const targetY=rect?rect.top+Math.min(rect.height*.45,85):height*.78;
            for(let coinIndex=0;coinIndex<5;coinIndex++){
                const coin=document.createElement("img");
                coin.className="bha-golden-meteor-coin is-targeted";
                coin.src="draft-assets/jeffcoin.png";
                coin.alt="";
                const startX=Math.max(24,Math.min(width-24,targetX+(-170+Math.random()*340)));
                const tx=targetX-startX;
                const ty=targetY+72;
                const arc=-55-Math.random()*80;
                coin.style.setProperty("--sx",`${Math.round(startX)}px`);
                coin.style.setProperty("--tx",`${Math.round(tx)}px`);
                coin.style.setProperty("--ty",`${Math.round(ty)}px`);
                coin.style.setProperty("--mx",`${Math.round(tx*.54)}px`);
                coin.style.setProperty("--my",`${Math.round(ty*.54+arc)}px`);
                coin.style.setProperty("--px",`${Math.round(tx*.92)}px`);
                coin.style.setProperty("--py",`${Math.round(ty*.92)}px`);
                coin.style.setProperty("--delay",`${Math.round(420+playerIndex*100+coinIndex*92+Math.random()*70)}ms`);
                root.appendChild(coin);
            }
            const award=document.createElement("div");
            award.className="bha-golden-meteor-award";
            award.textContent="+5 JC";
            award.style.left=`${Math.round(targetX)}px`;
            award.style.top=`${Math.round(targetY)}px`;
            award.style.setProperty("--delay",`${Math.round(1030+playerIndex*100)}ms`);
            root.appendChild(award);
            setTimeout(()=>{
                if(!target) return;
                target.classList.remove("bha-golden-meteor-target-pulse");
                void target.offsetWidth;
                target.classList.add("bha-golden-meteor-target-pulse");
                setTimeout(()=>target.classList.remove("bha-golden-meteor-target-pulse"),820);
            },1200+playerIndex*100);
        }
        setTimeout(()=>root.classList.add("is-live"),20);
        setTimeout(()=>root.remove?.(),3450);
        return true;
    }
    function appendCosmicRainCardFx(button,card,packContext={}){
        if(!button||!card?.anomalyCosmicRain||typeof document==="undefined") return;
        button.classList.add("bha-card-cosmic-rain");
        const order=Math.max(0,Number(card.anomalyCosmicRainArrivalIndex)||0);
        const pack=Array.isArray(packContext?.currentPack)?packContext.currentPack:[];
        const baseCount=Math.max(1,pack.filter(entry=>!entry?.anomalyCosmicRain).length);
        const lastBaseIndex=Math.max(0,baseCount-1);
        const lastBaseDelay=lastBaseIndex<3 ? lastBaseIndex*180 : 920+(lastBaseIndex-3)*230;
        const rainStart=lastBaseDelay+1450;
        button.style.setProperty("--bha-rain-order",String(order));
        button.style.setProperty("--bha-rain-start",`${rainStart}ms`);
        button.style.setProperty("--bha-rain-delay",`${order*330}ms`);
        if(button.querySelector?.(".bha-cosmic-rain-vfx")) return;
        const fx=document.createElement("span");
        fx.className="bha-cosmic-rain-vfx";
        fx.setAttribute("aria-hidden","true");
        fx.innerHTML='<i class="bha-cosmic-rain-tail"></i><i class="bha-cosmic-rain-spark s1"></i><i class="bha-cosmic-rain-spark s2"></i><i class="bha-cosmic-rain-spark s3"></i>';
        button.appendChild(fx);
    }

    function ensureUi(){
        if(typeof document==="undefined") return;
        if(!document.getElementById("bhaActivationOverlay")){
            const overlay=document.createElement("div");
            overlay.id="bhaActivationOverlay";overlay.className="bha-activation-overlay";overlay.setAttribute("aria-hidden","true");
            overlay.innerHTML=`<div class="bha-space-tear" aria-hidden="true"><i></i><i></i><i></i></div><div class="bha-singularity" aria-hidden="true"><span></span></div><img class="bha-activation-jeff" src="draft-assets/black_hole_anomalies_logo.webp" alt=""><section class="bha-activation-copy" role="status" aria-live="assertive"><small>AKTYWOWANA ANOMALIA</small><h2 id="bhaActivationName">ANOMALIA</h2><div id="bhaActivationRarity" class="bha-rarity">RZADKA</div><p id="bhaActivationDescription"></p></section>`;
            document.body.appendChild(overlay);
        }
        if(!document.getElementById("blackHoleAnomalySettingsModal")){
            const modal=document.createElement("div");
            modal.id="blackHoleAnomalySettingsModal";modal.className="bha-settings-modal";modal.hidden=true;
            const adminOptions=runtimeRegistry().map(def=>`<option value="${escapeHtml(def.id)}">${escapeHtml(def.name)} • ${escapeHtml(WINDOW_LABELS[def.window]||TIMING_LABELS[def.timing]||def.window||def.timing)}</option>`).join("");
            modal.innerHTML=`<section class="bha-settings-shell" role="dialog" aria-modal="true" aria-labelledby="bhaSettingsTitle"><button type="button" class="bha-settings-close" id="bhaSettingsClose" aria-label="Zamknij">×</button><div class="bha-settings-hero"><img src="draft-assets/black_hole_anomalies_logo.webp" alt="Jeff i czarna dziura"><div><small>ROZSZERZENIE</small><h2 id="bhaSettingsTitle">ANOMALIE CZARNEJ DZIURY</h2><p>Na starcie draftu silnik losuje liczbę zdarzeń, ich rzadkość i konkretne Anomalie, a następnie zamraża je w legalnych oknach całej osi czasu draftu.</p></div></div><div class="bha-settings-grid"><section><h3>INTENSYWNOŚĆ DRAFTU</h3><div class="bha-chance-grid"><label><input type="radio" name="blackHoleAnomalyChance" value="0.10" checked><b>10%</b><small>Subtelnie</small></label><label><input type="radio" name="blackHoleAnomalyChance" value="0.25"><b>25%</b><small>Standard</small></label><label><input type="radio" name="blackHoleAnomalyChance" value="0.30"><b>30%</b><small>Niestabilnie</small></label><label class="is-chaos"><input type="radio" name="blackHoleAnomalyChance" value="0.55"><b>DANGER DANGER</b><small>CHAOS ANOMALII • 55%</small></label></div></section><section class="bha-guarantee-row"><label for="blackHoleAnomalyGuarantee"><input id="blackHoleAnomalyGuarantee" type="checkbox" checked><span></span><div><b>GWARANCJA JEDNEJ ANOMALII</b><small>Bez wskazania konkretnej: dotychczasowa losowa gwarancja. Po wybraniu anomalii: ta jedna jest pewna, a pozostałe zdarzenia nadal są losowane z ustawioną intensywnością.</small></div></label><div class="bha-named-guarantee"><label for="blackHoleGuaranteedAnomaly"><b>WYBIERZ GWARANTOWANĄ ANOMALIĘ</b><select id="blackHoleGuaranteedAnomaly"><option value="">LOSOWA — dotychczasowe zasady</option>${runtimeRegistry().map(def=>`<option value="${escapeHtml(def.id)}" class="bha-opt-${escapeHtml(def.rarity)}" data-rarity="${escapeHtml(def.rarity)}">${escapeHtml(def.name)} • ${RARITY_LABELS[def.rarity]||def.rarity}</option>`).join("")}</select></label><small id="bhaNamedGuaranteeHint">Opcjonalnie: wskazana anomalia pojawi się w swoim legalnym momencie. Pozostałe zdarzenia nadal podlegają normalnym szansom.</small></div></section></div><div class="bha-admin-test-panel"><div class="bha-admin-test-title"><span>TYMCZASOWE QA</span><b>TRYB TECHNICZNY — WYMUSZENIE ANOMALII</b><small>OFF = normalne losowanie. ON = brak RNG; system odpala tylko wskazaną Anomalię, jeden raz, w najwcześniejszym legalnym momencie.</small></div><label class="bha-admin-test-toggle" for="bhaAdminTestEnabled"><input id="bhaAdminTestEnabled" type="checkbox"><span></span><div><b>WŁĄCZ TRYB TECHNICZNY</b><small id="bhaAdminTestStatus">TRYB TECHNICZNY: OFF</small></div></label><label class="bha-admin-test-select"><b>WYBIERZ ANOMALIĘ DO TESTU</b><select id="bhaAdminTestAnomaly">${adminOptions}</select><small id="bhaAdminTestHint"></small></label><div class="bha-admin-test-warning">Scheduler ustala cały harmonogram przed pierwszym pickiem. Losowy Chaos i Techno-Organic Virus korzystają z okien przerwy między etapami, Złoty Meteor wymaga Economy, a Cięcie Kosztów wymaga legalnych kart Cost 5+.</div></div><div class="bha-rarity-legend"><span class="rare">RZADKA</span><span class="epic">EPICKA</span><span class="legendary">LEGENDARNA</span><small>V1: TYLKO CLASSIC • aktywny runtime: ${runtimeRegistry().length} Anomalii • RZADKOŚĆ 37/35/28 • Złoty Meteor wymaga Economy</small></div><button type="button" class="bha-settings-confirm" id="bhaSettingsConfirm">ZAPISZ USTAWIENIA ANOMALII</button></section>`;
            document.body.appendChild(modal);
        }
    }
    function updateSettingsVisuals(){
        if(typeof document==="undefined") return;
        document.querySelectorAll(".bha-chance-grid label").forEach(label=>label.classList.toggle("is-selected",Boolean(label.querySelector("input")?.checked)));
        const guaranteed=Boolean(document.getElementById("blackHoleAnomalyGuarantee")?.checked);
        const select=document.getElementById("blackHoleGuaranteedAnomaly");
        if(select){
            select.disabled=!guaranteed;
            select.dataset.rarity=getDefinition(select.value)?.rarity||"random";
        }
        const hint=document.getElementById("bhaNamedGuaranteeHint");
        const def=getDefinition(select?.value);
        if(hint) hint.textContent=!guaranteed
            ? "Włącz gwarancję jednej anomalii, aby wskazać konkretną."
            : def?`${def.name}: ${WINDOW_LABELS[def.window]||TIMING_LABELS[def.timing]} • naturalny moment aktywacji.${def.requiresEconomy?" Wymaga włączonej Ekonomii Draftu.":""}`
            : "Losowa gwarancja jak dotychczas. Wybór konkretnej anomalii nie blokuje innych losowych zdarzeń.";
    }
    function updateAdminTestVisuals(){
        if(typeof document==="undefined") return;
        const enabled=Boolean(document.getElementById("bhaAdminTestEnabled")?.checked);
        const select=document.getElementById("bhaAdminTestAnomaly");
        const def=getDefinition(select?.value);
        const hint=document.getElementById("bhaAdminTestHint");
        const status=document.getElementById("bhaAdminTestStatus");
        const panel=document.querySelector(".bha-admin-test-panel");
        panel?.classList.toggle("is-enabled",enabled);
        if(select) select.disabled=!enabled;
        if(status) status.textContent=enabled?`TRYB TECHNICZNY: ON • ${def?.name||"WYBIERZ ANOMALIĘ"}`:"TRYB TECHNICZNY: OFF";
        if(hint) hint.textContent=def?`${RARITY_LABELS[def.rarity]||def.rarity} • ${WINDOW_LABELS[def.window]||TIMING_LABELS[def.timing]||def.window||def.timing}${def.requiresEconomy?" • WYMAGA ECONOMY":""}`:"";
    }
    function openAdminTest(){openSettings();}
    function closeAdminTest(save=false){closeSettings(save);}
    function openSettings(){ensureUi();const modal=document.getElementById("blackHoleAnomalySettingsModal");if(!modal) return;writeSettingsToDom({...loadSettings(),...readSettingsFromDom()});writeAdminTestToDom(loadAdminTestSettings());modal.hidden=false;document.body.classList.add("bha-settings-open");}
    function closeSettings(save=false){
        const modal=typeof document!=="undefined"?document.getElementById("blackHoleAnomalySettingsModal"):null;
        if(save){
            const adminConfig=saveAdminTestSettings(readAdminTestFromDom());
            const config=readSettingsFromDom();
            if(adminConfig.enabled){config.enabled=true;const master=document.getElementById("enableBlackHoleAnomalies");if(master) master.checked=true;}
            saveSettings(config);
            state.config = { ...DEFAULT_CONFIG, ...config, chance: clampChance(config.chance) };
            state.enabled = Boolean(config.enabled && state.mode === "classic");
            global.SettingsV2?.refreshUx?.();global.updateModePreview?.();
        }
        if(modal) modal.hidden=true;document.body?.classList.remove("bha-settings-open");
    }
    function bindUi(){
        if(uiBound||typeof document==="undefined") return;uiBound=true;ensureUi();
        writeSettingsToDom({...loadSettings(),enabled:document.getElementById("enableBlackHoleAnomalies")?.checked});

        // Static listeners for the current Settings V2 DOM.
        document.getElementById("openBlackHoleAnomalySettings")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();openSettings();});
        document.getElementById("openBlackHoleAnomalyAdminTest")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();openSettings();});
        document.getElementById("enableBlackHoleAnomalies")?.addEventListener("change",event=>{if(event.target.checked) openSettings();global.SettingsV2?.refreshUx?.();});

        // Delegated fallback: Settings V2 can refresh/rebuild pieces of the card. If that happens,
        // the modal must still open even when the original checkbox/button node was replaced.
        document.addEventListener("click",event=>{
            const trigger=event.target?.closest?.("#openBlackHoleAnomalySettings,#openBlackHoleAnomalyAdminTest");
            if(!trigger) return;
            event.preventDefault();event.stopPropagation();openSettings();
        });
        document.addEventListener("change",event=>{
            if(event.target?.id!=="enableBlackHoleAnomalies") return;
            if(event.target.checked) openSettings();
            global.SettingsV2?.refreshUx?.();
        });

        document.getElementById("bhaSettingsClose")?.addEventListener("click",()=>closeSettings(false));
        document.getElementById("bhaSettingsConfirm")?.addEventListener("click",()=>closeSettings(true));
        document.getElementById("bhaAdminTestEnabled")?.addEventListener("change",updateAdminTestVisuals);
        document.getElementById("bhaAdminTestAnomaly")?.addEventListener("change",updateAdminTestVisuals);
        document.querySelectorAll('input[name="blackHoleAnomalyChance"]').forEach(input=>input.addEventListener("change",updateSettingsVisuals));
        document.getElementById("blackHoleAnomalyGuarantee")?.addEventListener("change",updateSettingsVisuals);
        document.getElementById("blackHoleGuaranteedAnomaly")?.addEventListener("change",updateSettingsVisuals);
        document.getElementById("blackHoleAnomalySettingsModal")?.addEventListener("click",event=>{if(event.target.id==="blackHoleAnomalySettingsModal") closeSettings(false);});
    }

    const ACTIVATION_EFFECT_MS=1250;
    const ACTIVATION_HOLD_MS=4700;
    const ACTIVATION_LEAVE_MS=600;

    function showActivation(entry,applyEffect,onComplete){
        ensureUi();const overlay=typeof document!=="undefined"?document.getElementById("bhaActivationOverlay"):null;
        if(!overlay){const outcome=applyEffect?.()||{};setLocked(false);onComplete?.(outcome);return;}
        clearTimeout(activationTimer);clearTimeout(leaveTimer);setLocked(true);
        const rarity=entry.rarity||"rare";
        const activationName=document.getElementById("bhaActivationName");if(activationName){activationName.textContent=entry.name;activationName.dataset.text=entry.name;}
        const rarityNode=document.getElementById("bhaActivationRarity");rarityNode.textContent=RARITY_LABELS[rarity]||rarity.toUpperCase();rarityNode.className=`bha-rarity ${rarity}`;
        document.getElementById("bhaActivationDescription").textContent=entry.description||"";
        overlay.dataset.rarity=rarity;
        overlay.setAttribute("aria-hidden","false");
        overlay.classList.remove("is-active","is-leaving");
        overlay.classList.add("is-entering");
        void overlay.offsetWidth;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
            if(overlay.getAttribute("aria-hidden")==="true") return;
            overlay.classList.add("is-active");
            overlay.classList.remove("is-entering");
        }));
        let outcome={};
        activationTimer=setTimeout(()=>{
            outcome=applyEffect?.()||{};
            // before_open musi odświeżyć panele/nagłówek, ale NIE może renderować kart
            // za overlayem — inaczej zawartość paczki miga przed właściwym otwarciem skrzynki.
            if(entry.timing==="before_open") host()?.renderStatus?.();
            else host()?.render?.();
        },ACTIVATION_EFFECT_MS);
        leaveTimer=setTimeout(()=>{
            overlay.classList.remove("is-entering");overlay.classList.add("is-leaving");
            setTimeout(()=>{overlay.classList.remove("is-active","is-leaving","is-entering");overlay.setAttribute("aria-hidden","true");setLocked(false);onComplete?.(outcome);if(entry.id==="golden_meteor") setTimeout(()=>playGoldenMeteorFx(outcome),110);refreshRuntimeInfo();},ACTIVATION_LEAVE_MS);
        },ACTIVATION_HOLD_MS);
    }


    function ensureTechnoOrganicOverlaySymbol(){
        if(typeof document==="undefined") return null;
        const overlay=document.getElementById("bhaActivationOverlay");
        if(!overlay) return null;
        let symbol=overlay.querySelector(".bha-techno-overlay-symbol");
        if(symbol) return symbol;
        symbol=document.createElement("span");
        symbol.className="bha-techno-overlay-symbol";
        symbol.setAttribute("aria-hidden","true");
        symbol.innerHTML='<i style="--virus-spike-angle:0deg"></i><i style="--virus-spike-angle:36deg"></i><i style="--virus-spike-angle:72deg"></i><i style="--virus-spike-angle:108deg"></i><i style="--virus-spike-angle:144deg"></i><i style="--virus-spike-angle:180deg"></i><i style="--virus-spike-angle:216deg"></i><i style="--virus-spike-angle:252deg"></i><i style="--virus-spike-angle:288deg"></i><i style="--virus-spike-angle:324deg"></i>';
        overlay.appendChild(symbol);
        return symbol;
    }
    function ensureTechnoOrganicOverlayCard(){
        if(typeof document==="undefined") return null;
        const overlay=document.getElementById("bhaActivationOverlay");
        if(!overlay) return null;
        let card=overlay.querySelector('.bha-techno-overlay-card');
        if(card) return card;
        card=document.createElement('div');
        card.className='bha-techno-overlay-card';
        card.setAttribute('aria-hidden','true');
        card.innerHTML=''
            + '<span class="bha-techno-overlay-cost">2</span>'
            + '<span class="bha-techno-overlay-power">4</span>'
            + '<span class="bha-techno-overlay-title">CABLE</span>'
            + '<span class="bha-techno-overlay-subtitle">PACJENT ZERO</span>'
            + '<span class="bha-techno-overlay-art"></span>'
            + '<span class="bha-techno-overlay-scan"></span>'
            + '<span class="bha-techno-overlay-wire wire-a"></span>'
            + '<span class="bha-techno-overlay-wire wire-b"></span>'
            + '<span class="bha-techno-overlay-wire wire-c"></span>'
            + '<span class="bha-techno-overlay-wire wire-d"></span>'
            + '<span class="bha-techno-overlay-pulse"></span>';
        overlay.appendChild(card);
        return card;
    }

    function showTechnoOrganicVirusBroadcast(options={},onComplete){
        ensureUi();
        const overlay=typeof document!=="undefined"?document.getElementById("bhaActivationOverlay"):null;
        if(!overlay){onComplete?.();return;}
        clearTimeout(activationTimer);clearTimeout(leaveTimer);setLocked(true);
        const phase=String(options.phase||"start");
        const title=String(options.title||"TECHNO-ORGANIC VIRUS");
        const description=String(options.description||(phase==="end"?"DALSZE ZAKAŻENIA NIE BĘDĄ JUŻ POWSTAWAĆ.":"PACJENCI ZERO ZOSTALI ZARAŻENI. PRZEZ 4 NAJBLIŻSZE KOLEJKI WIRUS BĘDZIE SIĘ ROZWIJAŁ."));
        const rarity=String(options.rarity||"epic");
        const kicker=String(options.kicker||(phase==="end"?"MUTACJA USTAŁA":"DECKI ZAKAŻONE"));
        const holdMs=Math.max(1600,Number(options.holdMs)||2500);
        const leaveMs=Math.max(320,Number(options.leaveMs)||520);
        const activationName=document.getElementById("bhaActivationName");
        if(activationName){activationName.textContent=title;activationName.dataset.text=title;}
        const rarityNode=document.getElementById("bhaActivationRarity");
        if(rarityNode){rarityNode.textContent=kicker;rarityNode.className=`bha-rarity ${rarity} bha-rarity--techno`;}
        const descriptionNode=document.getElementById("bhaActivationDescription");
        if(descriptionNode) descriptionNode.textContent=description;
        overlay.dataset.rarity=rarity;
        overlay.dataset.technoPhase=phase;
        overlay.setAttribute("aria-hidden","false");
        overlay.classList.remove("is-active","is-leaving","is-entering","bha-shooting-stars-intro","bha-techno-broadcast--start","bha-techno-broadcast--end");
        overlay.classList.add("is-entering","bha-techno-broadcast",phase==="end"?"bha-techno-broadcast--end":"bha-techno-broadcast--start");
        ensureTechnoOrganicOverlaySymbol();
        ensureTechnoOrganicOverlayCard();
        void overlay.offsetWidth;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
            if(overlay.getAttribute("aria-hidden")==="true") return;
            overlay.classList.add("is-active");
            overlay.classList.remove("is-entering");
        }));
        leaveTimer=setTimeout(()=>{
            overlay.classList.remove("is-entering");
            overlay.classList.add("is-leaving");
            setTimeout(()=>{
                overlay.classList.remove("is-active","is-leaving","is-entering","bha-techno-broadcast","bha-techno-broadcast--start","bha-techno-broadcast--end");
                overlay.removeAttribute("data-techno-phase");
                overlay.setAttribute("aria-hidden","true");
                setLocked(false);
                onComplete?.();
            },leaveMs);
        },holdMs);
    }

    function showBattleworldActivationIntro(entry,onComplete){
        ensureUi();
        const overlay=typeof document!=="undefined"?document.getElementById("bhaActivationOverlay"):null;
        if(!overlay){onComplete?.();return;}
        clearTimeout(activationTimer);clearTimeout(leaveTimer);setLocked(true);
        const rarity=entry.rarity||"legendary";
        const activationName=document.getElementById("bhaActivationName");
        if(activationName){activationName.textContent=entry.name;activationName.dataset.text=entry.name;}
        const rarityNode=document.getElementById("bhaActivationRarity");
        if(rarityNode){rarityNode.textContent=RARITY_LABELS[rarity]||rarity.toUpperCase();rarityNode.className=`bha-rarity ${rarity}`;}
        const description=document.getElementById("bhaActivationDescription");
        if(description) description.textContent=entry.description||"";
        overlay.dataset.rarity=rarity;
        overlay.setAttribute("aria-hidden","false");
        overlay.classList.remove("is-active","is-leaving");
        overlay.classList.add("is-entering");
        void overlay.offsetWidth;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
            if(overlay.getAttribute("aria-hidden")==="true") return;
            overlay.classList.add("is-active");
            overlay.classList.remove("is-entering");
        }));
        // Battleworld is an after-pack event. Its classic intro must be presentation-only:
        // do NOT render/finalize the pack or mutate Foundation while the intro is on screen.
        leaveTimer=setTimeout(()=>{
            overlay.classList.remove("is-entering");
            overlay.classList.add("is-leaving");
            activationTimer=setTimeout(()=>{
                overlay.classList.remove("is-active","is-leaving","is-entering");
                overlay.setAttribute("aria-hidden","true");
                setLocked(false);
                onComplete?.();
                refreshRuntimeInfo();
            },ACTIVATION_LEAVE_MS);
        },ACTIVATION_HOLD_MS);
    }

    function showOngoingActivationIntro(entry,onComplete){
        ensureUi();
        const overlay=typeof document!=="undefined"?document.getElementById("bhaActivationOverlay"):null;
        if(!overlay){onComplete?.();return;}
        clearTimeout(activationTimer);clearTimeout(leaveTimer);setLocked(true);
        const rarity=entry.rarity||"epic";
        const activationName=document.getElementById("bhaActivationName");
        if(activationName){activationName.textContent=entry.name;activationName.dataset.text=entry.name;}
        const rarityNode=document.getElementById("bhaActivationRarity");
        if(rarityNode){rarityNode.textContent=RARITY_LABELS[rarity]||rarity.toUpperCase();rarityNode.className=`bha-rarity ${rarity}`;}
        const description=document.getElementById("bhaActivationDescription");
        if(description) description.textContent=entry.description||"";
        overlay.dataset.rarity=rarity;
        overlay.setAttribute("aria-hidden","false");
        overlay.classList.remove("is-active","is-leaving","bha-shooting-stars-intro","bha-cosmic-treasure-intro");
        overlay.classList.add("is-entering");
        if(entry.id==="shooting_stars") overlay.classList.add("bha-shooting-stars-intro");
        else if(entry.id==="cosmic_treasure") overlay.classList.add("bha-cosmic-treasure-intro");
        void overlay.offsetWidth;
        requestAnimationFrame(()=>requestAnimationFrame(()=>{
            if(overlay.getAttribute("aria-hidden")==="true") return;
            overlay.classList.add("is-active");
            overlay.classList.remove("is-entering");
        }));
        leaveTimer=setTimeout(()=>{
            overlay.classList.remove("is-entering");
            overlay.classList.add("is-leaving");
            activationTimer=setTimeout(()=>{
                overlay.classList.remove("is-active","is-leaving","is-entering","bha-shooting-stars-intro","bha-cosmic-treasure-intro");
                overlay.setAttribute("aria-hidden","true");
                setLocked(false);
                onComplete?.();
                refreshRuntimeInfo();
            },ACTIVATION_LEAVE_MS);
        },ACTIVATION_HOLD_MS);
    }

    function zombieHordeActive(){return Boolean(state.enabled&&state.active?.id==="zombie_horde"&&state.active?.triggered);}
    function zombieHordeCard(card){return Boolean(card?.anomalyZombieHorde);}
    function zombieHordeHash(value=""){
        let hash=2166136261;
        for(const ch of String(value)){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
        return hash>>>0;
    }
    function zombieHordeVariant(card){
        const existing=Number(card?.anomalyZombieHordeVariant);
        if(Number.isInteger(existing)&&existing>=1&&existing<=ZOMBIE_HORDE_ASSETS.length) return existing;
        return 1+(zombieHordeHash(card?.instanceId||card?.name||Math.random())%ZOMBIE_HORDE_ASSETS.length);
    }
    function infectZombieHordeCard(card,generation=0,meta={}){
        if(!card||card?.joker) return false;
        card.anomalyZombieHorde=true;
        card.anomalyZombieHordeGeneration=Math.max(0,Number(generation)||0);
        card.anomalyZombieHordeVariant=zombieHordeVariant(card);
        card.anomalyZombieHordeTilt=Number.isFinite(Number(card.anomalyZombieHordeTilt))?Number(card.anomalyZombieHordeTilt):((zombieHordeHash(`${card.instanceId||card.name}|tilt`)%13)-6);
        card.anomalyZombieHordeScale=Number.isFinite(Number(card.anomalyZombieHordeScale))?Number(card.anomalyZombieHordeScale):(0.90+(zombieHordeHash(`${card.instanceId||card.name}|scale`)%17)/100);
        if(meta.justInfected) card.anomalyZombieHordeJustInfected=true;
        return true;
    }
    function zombieHordeDisplayOrder(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const fromHost=host()?.getPackDisplaySourceIndexes?.();
        if(Array.isArray(fromHost)&&fromHost.length){
            const valid=fromHost.map(Number).filter(index=>Number.isInteger(index)&&index>=0&&index<pack.length);
            if(valid.length===pack.length) return valid;
        }
        return pack.map((_,index)=>index);
    }
    function zombieHordeRuns(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const order=zombieHordeDisplayOrder(ctx);
        const runs=[];let current=[];
        order.forEach(index=>{
            const card=pack[index];
            if(card&&!card.joker){current.push(index);return;}
            if(current.length) runs.push(current);current=[];
        });
        if(current.length) runs.push(current);
        return runs;
    }
    function effectZombieHorde(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const runs=zombieHordeRuns(ctx);
        if(!runs.length) return {infected:0,reason:"no_eligible_cards"};
        const desired=Math.min(5,Math.max(...runs.map(run=>run.length)));
        const candidates=runs.filter(run=>run.length>=desired);
        const run=(candidates.length?shuffle(candidates)[0]:runs.slice().sort((a,b)=>b.length-a.length)[0])||[];
        const startMax=Math.max(0,run.length-desired);
        const start=startMax?Math.floor(Math.random()*(startMax+1)):0;
        const selected=run.slice(start,start+desired);
        selected.forEach(index=>infectZombieHordeCard(pack[index],0));
        if(state.active){
            state.active.hordeInitialCount=selected.length;
            state.active.hordeGeneration=0;
            state.active.hordeInitialInstanceIds=selected.map(index=>pack[index]?.instanceId||null).filter(Boolean);
        }
        return {infected:selected.length,indexes:selected,instanceIds:selected.map(index=>pack[index]?.instanceId||null).filter(Boolean)};
    }
    function zombieHordeSpreadCandidates(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const order=zombieHordeDisplayOrder(ctx);
        const infectedPositions=order.map((index,pos)=>({index,pos,card:pack[index]})).filter(entry=>zombieHordeCard(entry.card));
        if(!infectedPositions.length) return [];
        const minPos=Math.min(...infectedPositions.map(entry=>entry.pos));
        const maxPos=Math.max(...infectedPositions.map(entry=>entry.pos));
        return [minPos-1,maxPos+1].filter(pos=>pos>=0&&pos<order.length).map(pos=>({index:order[pos],pos,card:pack[order[pos]]})).filter(entry=>entry.card&&!entry.card.joker&&!zombieHordeCard(entry.card));
    }
    function zombieHordeInfectionSourceForCandidate(chosen,ctx=context()){
        if(!chosen) return null;
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const order=zombieHordeDisplayOrder(ctx);
        const targetPos=Number(chosen.pos);
        if(!Number.isInteger(targetPos)) return null;
        const sources=order.map((index,pos)=>({index,pos,card:pack[index]})).filter(entry=>zombieHordeCard(entry.card));
        if(!sources.length) return null;
        sources.sort((a,b)=>Math.abs(a.pos-targetPos)-Math.abs(b.pos-targetPos));
        const source=sources[0]||null;
        return source?{index:source.index,pos:source.pos,instanceId:source.card?.instanceId||null,name:source.card?.name||null}:null;
    }
    function spreadZombieHorde(count=1,ctx=context()){
        const infected=[];
        let generation=Math.max(0,...(Array.isArray(ctx?.currentPack)?ctx.currentPack:[]).filter(zombieHordeCard).map(card=>Number(card?.anomalyZombieHordeGeneration)||0));
        for(let step=0;step<Math.max(0,Number(count)||0);step++){
            const candidates=zombieHordeSpreadCandidates(ctx);
            if(!candidates.length) break;
            const chosen=candidates[Math.floor(Math.random()*candidates.length)];
            const source=zombieHordeInfectionSourceForCandidate(chosen,ctx);
            generation+=1;
            if(infectZombieHordeCard(chosen.card,generation,{justInfected:true})) infected.push({index:chosen.index,instanceId:chosen.card?.instanceId||null,name:chosen.card?.name||null,generation,sourceIndex:source?.index??null,sourceInstanceId:source?.instanceId||null,sourceName:source?.name||null});
        }
        if(state.active) state.active.hordeGeneration=generation;
        return infected;
    }
    function resolvePackPick(index,packContext={}){
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const requestedIndex=Number(index),clickedCard=pack[requestedIndex]||null;
        if(!zombieHordeActive()||!zombieHordeCard(clickedCard)) return {index:requestedIndex,requestedIndex,hordeRandomized:false,clickedCard,resolvedCard:clickedCard};
        const hordeIndexes=pack.map((card,i)=>({card,i})).filter(entry=>zombieHordeCard(entry.card)&&!entry.card?.joker).map(entry=>entry.i);
        if(!hordeIndexes.length) return {index:requestedIndex,requestedIndex,hordeRandomized:false,clickedCard,resolvedCard:clickedCard};
        const resolvedIndex=hordeIndexes[Math.floor(Math.random()*hordeIndexes.length)];
        return {index:resolvedIndex,requestedIndex,hordeRandomized:true,clickedCard,resolvedCard:pack[resolvedIndex]||clickedCard,hordeSize:hordeIndexes.length};
    }
    function preparePickedCardForDeck(sourceCard,resultCard=sourceCard){
        if(!sourceCard||!zombieHordeCard(sourceCard)||!resultCard) return false;
        resultCard.anomalyZombieHorde=true;
        resultCard.anomalyZombieHordeVariant=sourceCard.anomalyZombieHordeVariant||zombieHordeVariant(sourceCard);
        resultCard.anomalyZombieHordeDraftImmutable=true;
        resultCard.instanceMeta={...(resultCard.instanceMeta&&typeof resultCard.instanceMeta==="object"?resultCard.instanceMeta:{}),zombieHordeImmutable:true,zombieHordeSourceInstanceId:sourceCard.instanceId||null};
        return true;
    }
    function spawnZombieHordeInfectionBeam(pack,sourceNode,targetNode){
        if(!pack||!sourceNode||!targetNode||sourceNode===targetNode||typeof document==="undefined") return null;
        const packRect=pack.getBoundingClientRect?.();
        const sourceRect=sourceNode.getBoundingClientRect?.();
        const targetRect=targetNode.getBoundingClientRect?.();
        if(!packRect||!sourceRect||!targetRect) return null;
        const x1=(sourceRect.left-packRect.left)+(sourceRect.width/2);
        const y1=(sourceRect.top-packRect.top)+(sourceRect.height/2);
        const x2=(targetRect.left-packRect.left)+(targetRect.width/2);
        const y2=(targetRect.top-packRect.top)+(targetRect.height/2);
        const dx=x2-x1,dy=y2-y1;
        const distance=Math.max(18,Math.hypot(dx,dy));
        const angle=Math.atan2(dy,dx)*(180/Math.PI);
        const beam=document.createElement("span");
        beam.className="bha-zombie-horde-infect-beam";
        beam.setAttribute("aria-hidden","true");
        beam.style.setProperty("--bha-zbeam-length",`${distance}px`);
        beam.style.left=`${x1}px`;
        beam.style.top=`${y1}px`;
        beam.style.transform=`translateY(-50%) rotate(${angle}deg)`;
        beam.innerHTML='<span class="bha-zombie-horde-infect-beam-core"></span><span class="bha-zombie-horde-infect-hand bha-zombie-horde-infect-hand--ghost"><span class="bha-zombie-horde-infect-palm"></span><i></i><i></i><i></i><i></i><i></i></span><span class="bha-zombie-horde-infect-hand bha-zombie-horde-infect-hand--traveler"><span class="bha-zombie-horde-infect-palm"></span><i></i><i></i><i></i><i></i><i></i></span>';
        pack.appendChild(beam);
        setTimeout(()=>beam.remove?.(),1180);
        return beam;
    }
    function zombieHordeCardNodeByInstanceId(pack,instanceId){
        if(!pack||!instanceId) return null;
        const escaped=(typeof CSS!=="undefined"&&typeof CSS.escape==="function")?CSS.escape(String(instanceId)):String(instanceId).replace(/"/g,'\\"');
        return pack.querySelector?.(`[data-card-instance-id="${escaped}"]`)||null;
    }
    function playZombieHordeSpreadAnimations(infected=[]){
        if(typeof document==="undefined"||!Array.isArray(infected)||!infected.length) return 0;
        const pack=document.getElementById("pack");
        if(!pack) return 0;
        infected.forEach((entry,step)=>{
            const delay=step*280;
            setTimeout(()=>{
                const source=zombieHordeCardNodeByInstanceId(pack,entry?.sourceInstanceId);
                const target=zombieHordeCardNodeByInstanceId(pack,entry?.instanceId);
                if(source&&target&&source!==target) spawnZombieHordeInfectionBeam(pack,source,target);
                if(target){
                    target.classList.remove("bha-zombie-horde-newly-infected");
                    void target.offsetWidth;
                    target.classList.add("bha-zombie-horde-newly-infected");
                }
            },delay+40);
        });
        return 1240+Math.max(0,infected.length-1)*280;
    }
    function playZombieHordePickAnimation(requestedIndex,resolvedIndex){
        if(typeof document==="undefined") return {durationMs:0,horde:true};
        const pack=document.getElementById("pack");
        if(!pack) return {durationMs:920,horde:true};
        const cards=[...pack.querySelectorAll(".pack-card-btn,.joker-card-btn")];
        const horde=cards.filter(node=>node.classList?.contains?.("bha-zombie-horde-card"));
        horde.forEach(node=>{node.classList.remove("bha-zombie-horde-rattle");void node.offsetWidth;node.classList.add("bha-zombie-horde-rattle");});
        const clicked=cards.find(node=>Number(node?.dataset?.packIndex)===Number(requestedIndex));
        const resolved=cards.find(node=>Number(node?.dataset?.packIndex)===Number(resolvedIndex));
        clicked?.classList?.add?.("bha-zombie-horde-clicked");
        setTimeout(()=>resolved?.classList?.add?.("bha-zombie-horde-chosen"),290);
        setTimeout(()=>{clicked?.classList?.remove?.("bha-zombie-horde-clicked");resolved?.classList?.remove?.("bha-zombie-horde-chosen");horde.forEach(node=>node.classList.remove("bha-zombie-horde-rattle"));pack.querySelectorAll?.('.bha-zombie-horde-infect-beam')?.forEach(node=>node.remove?.());},1240);
        return {durationMs:1140,horde:true};
    }

    function playLivingDeadPickAnimation(payload={}){
        if(typeof document==="undefined") return {durationMs:0,undead:false};
        const pack=document.getElementById("pack");
        if(!pack) return {durationMs:760,undead:true};
        const sourceCard=payload?.sourceCard||payload?.card||payload?.resultCard||null;
        const sourceId=String(sourceCard?.instanceId||"");
        const cards=[...pack.querySelectorAll(".pack-card-btn,.joker-card-btn")];
        const target=cards.find(node=>sourceId&&String(node?.dataset?.cardInstanceId||"")===sourceId)
            || cards.find(node=>Number(node?.dataset?.packIndex)===Number(payload?.resolvedIndex??payload?.index??payload?.packIndex));
        if(!target) return {durationMs:620,undead:true};
        target.classList.remove("bha-undead-picked");
        void target.offsetWidth;
        target.classList.add("bha-undead-picked");
        setTimeout(()=>target.classList.remove("bha-undead-picked"),860);
        return {durationMs:760,undead:true};
    }
    function resolveNightOfLivingDeadPostPick(payload={},resume){
        if(!state.enabled||!state.active?.triggered||state.active.id!=="night_of_the_living_dead") return false;
        const sourceCard=payload?.sourceCard||payload?.card||payload?.resultCard||null;
        if(!sourceCard?.anomalyLivingDead) return false;
        setLocked(true);
        const fx=playLivingDeadPickAnimation(payload);
        setTimeout(()=>{setLocked(false);resume?.();},Math.max(320,Number(fx?.durationMs)||760));
        return true;
    }
    function clearZombieHordePackFx(){
        if(typeof document==="undefined") return;
        const pack=document.getElementById("pack");
        pack?.classList?.remove?.("bha-zombie-horde-pack");
        pack?.querySelectorAll?.(".bha-zombie-horde-card")?.forEach(node=>node.classList.remove("bha-horde-join-left","bha-horde-join-right"));
    }
    function refreshZombieHordePackFx(){
        if(typeof document==="undefined") return false;
        const pack=document.getElementById("pack");
        if(!pack||!zombieHordeActive()){clearZombieHordePackFx();return false;}
        pack.classList.add("bha-zombie-horde-pack");
        const cards=[...pack.querySelectorAll(":scope > .pack-card-btn,:scope > .joker-card-btn")];
        cards.forEach(node=>node.classList.remove("bha-horde-join-left","bha-horde-join-right"));
        cards.forEach((node,index)=>{
            if(!node.classList.contains("bha-zombie-horde-card")) return;
            if(cards[index-1]?.classList?.contains?.("bha-zombie-horde-card")) node.classList.add("bha-horde-join-left");
            if(cards[index+1]?.classList?.contains?.("bha-zombie-horde-card")) node.classList.add("bha-horde-join-right");
        });
        return true;
    }
    function technoOrganicVirusActive(){
        return Boolean(state.enabled&&state.technoOrganicVirus?.active);
    }
    function technoOrganicCard(card){return Boolean(card?.anomalyTechnoOrganicVirus);}
    function technoOrganicPatientZeroCard(card){return Boolean(card?.anomalyTechnoOrganicPatientZero||card?.instanceMeta?.technoOrganicPatientZero);}
    function technoOrganicNormalize(value){return String(value||"").trim().toLowerCase();}
    function technoOrganicPlayerState(playerIndex){
        return state.technoOrganicVirus?.players?.[String(Number(playerIndex))]||null;
    }
    function technoOrganicPatientZeroCandidates(ctx=context(),playerIndex){
        const p=Number(playerIndex),deck=Array.isArray(ctx?.decks?.[p])?ctx.decks[p]:[];
        if(!deck.length) return [];
        return deck.map((card,index)=>({card,index})).filter(entry=>{
            if(!entry.card||entry.card.joker||technoOrganicPatientZeroCard(entry.card)) return false;
            if(host()?.canReplaceDeckCard?.(p,entry.index,{reason:"techno_organic_patient_zero",anomalyId:"techno_organic_virus",effect:"transform"})===false) return false;
            return technoOrganicReplacementTemplates(ctx,p,entry.card).length>0;
        });
    }
    function technoOrganicReplacementTemplates(ctx=context(),playerIndex,patientZero){
        const p=Number(playerIndex),deck=Array.isArray(ctx?.decks?.[p])?ctx.decks[p]:[];
        const sourceCost=Number(patientZero?.cost),sourcePower=Number(patientZero?.power);
        const hasCost=Number.isFinite(sourceCost),hasPower=Number.isFinite(sourcePower);
        if(!hasCost&&!hasPower) return [];
        const banned=new Set((Array.isArray(ctx?.bannedCards)?ctx.bannedCards:[]).map(technoOrganicNormalize));
        const occupied=new Set(deck.filter(Boolean).map(card=>technoOrganicNormalize(card?.name)).filter(Boolean));
        return (Array.isArray(ctx?.cardDatabase)?ctx.cardDatabase:[]).filter(template=>{
            const name=technoOrganicNormalize(template?.name);
            if(!name||template?.joker||banned.has(name)||occupied.has(name)) return false;
            const cost=Number(template?.cost),power=Number(template?.power);
            const costMatch=hasCost&&Number.isFinite(cost)&&cost===sourceCost;
            const powerMatch=hasPower&&Number.isFinite(power)&&power===sourcePower;
            return costMatch||powerMatch;
        });
    }
    function markTechnoOrganicPatientZero(card,playerIndex){
        if(!card) return false;
        card.anomalyTechnoOrganicVirus=true;
        card.anomalyTechnoOrganicPatientZero=true;
        card.anomalyTechnoOrganicGeneration=0;
        card.instanceMeta={...(card.instanceMeta&&typeof card.instanceMeta==="object"?card.instanceMeta:{}),technoOrganicPatientZero:true,technoOrganicVirus:true,technoOrganicPlayerIndex:Number(playerIndex)};
        return true;
    }
    function markTechnoOrganicInfected(card,playerIndex,generation=1){
        if(!card) return false;
        card.anomalyTechnoOrganicVirus=true;
        card.anomalyTechnoOrganicPatientZero=false;
        card.anomalyTechnoOrganicGeneration=Math.max(1,Number(generation)||1);
        card.anomalyTechnoOrganicJustInfected=true;
        card.instanceMeta={...(card.instanceMeta&&typeof card.instanceMeta==="object"?card.instanceMeta:{}),technoOrganicVirus:true,technoOrganicPlayerIndex:Number(playerIndex),technoOrganicGeneration:card.anomalyTechnoOrganicGeneration};
        return true;
    }
    function refreshTechnoOrganicVirusCounters(virus=state.technoOrganicVirus){
        if(!virus) return null;
        const records=Object.values(virus.players||{});
        virus.picksPerPlayer=Math.max(1,Number(virus.picksPerPlayer||4));
        virus.totalPickMutations=records.reduce((sum,entry)=>sum+Math.max(0,Number(entry?.totalPickMutations??virus.picksPerPlayer)||0),0);
        virus.remainingPickMutations=records.reduce((sum,entry)=>sum+Math.max(0,Number(entry?.remainingPickMutations??entry?.totalPickMutations??virus.picksPerPlayer)||0),0);
        return virus;
    }
    function ensureTechnoOrganicVirusPerPlayerState(virus=state.technoOrganicVirus){
        if(!virus) return null;
        virus.picksPerPlayer=Math.max(1,Number(virus.picksPerPlayer||4));
        Object.values(virus.players||{}).forEach(entry=>{
            entry.totalPickMutations=Math.max(1,Number(entry.totalPickMutations||virus.picksPerPlayer));
            if(!Number.isFinite(Number(entry.remainingPickMutations))){
                const legacyRemaining=Math.max(0,Number(virus.remainingPickMutations??virus.totalPickMutations??virus.picksPerPlayer)||0);
                entry.remainingPickMutations=Math.min(entry.totalPickMutations,legacyRemaining||entry.totalPickMutations);
            }else entry.remainingPickMutations=Math.max(0,Number(entry.remainingPickMutations));
        });
        refreshTechnoOrganicVirusCounters(virus);
        if(virus.remainingPickMutations<=0){virus.active=false;virus.completed=true;}
        return virus;
    }
    function effectTechnoOrganicVirus(){
        const ctx=context(),players=Array.isArray(ctx.players)?ctx.players:[];
        if(state.technoOrganicVirus?.active) return {alreadyActive:true,patients:clone(state.technoOrganicVirus.players||{})};
        const virus={active:true,activatedPackIndex:Number(ctx.packStartIndex||0),activatedAt:new Date().toISOString(),players:{},history:[],picksPerPlayer:4,remainingPickMutations:0,totalPickMutations:0,completed:false};
        const patients=[];
        players.forEach((playerName,playerIndex)=>{
            const candidates=shuffle(technoOrganicPatientZeroCandidates(ctx,playerIndex));
            const selected=candidates[0]||null;
            if(!selected) return;
            markTechnoOrganicPatientZero(selected.card,playerIndex);
            const record={playerIndex,playerName:playerName||null,patientZeroInstanceId:selected.card.instanceId||null,patientZeroName:selected.card.name||null,cost:Number.isFinite(Number(selected.card.cost))?Number(selected.card.cost):null,power:Number.isFinite(Number(selected.card.power))?Number(selected.card.power):null,infections:0,totalPickMutations:4,remainingPickMutations:4};
            virus.players[String(playerIndex)]=record;
            patients.push(clone(record));
        });
        refreshTechnoOrganicVirusCounters(virus);
        virus.active=patients.length>0&&virus.remainingPickMutations>0;
        state.technoOrganicVirus=virus;
        host()?.log?.("techno_organic_virus_seeded",{packNumber:Number(ctx.packStartIndex||0)+1,reason:"techno_organic_virus",data:{patients:clone(patients),picksPerPlayer:virus.picksPerPlayer,totalPickMutations:virus.totalPickMutations}});
        return {patients,active:virus.active,picksPerPlayer:virus.picksPerPlayer,totalPickMutations:virus.totalPickMutations};
    }
    function technoOrganicLivePatientZero(ctx=context(),playerIndex){
        const p=Number(playerIndex),record=technoOrganicPlayerState(p),deck=Array.isArray(ctx?.decks?.[p])?ctx.decks[p]:[];
        if(!record) return null;
        const byId=deck.find(card=>String(card?.instanceId||"")===String(record.patientZeroInstanceId||""));
        return byId||deck.find(technoOrganicPatientZeroCard)||null;
    }
    function technoOrganicInfectionTargets(ctx=context(),playerIndex){
        const p=Number(playerIndex),deck=Array.isArray(ctx?.decks?.[p])?ctx.decks[p]:[];
        return deck.map((card,index)=>({card,index})).filter(entry=>{
            if(!entry.card||entry.card.joker||technoOrganicPatientZeroCard(entry.card)||technoOrganicCard(entry.card)) return false;
            return host()?.canReplaceDeckCard?.(p,entry.index,{reason:"techno_organic_virus",anomalyId:"techno_organic_virus",effect:"transform"})!==false;
        });
    }
    function spreadTechnoOrganicVirus(playerIndex,ctx=context()){
        if(!technoOrganicVirusActive()) return null;
        const p=Number(playerIndex),record=technoOrganicPlayerState(p);
        if(!record) return null;
        const patientZero=technoOrganicLivePatientZero(ctx,p);
        if(!patientZero) return null;
        const templates=technoOrganicReplacementTemplates(ctx,p,patientZero);
        if(!templates.length){
            host()?.log?.("techno_organic_virus_stalled",{packNumber:Number(ctx.packStartIndex||0)+1,reason:"techno_organic_virus",data:{playerIndex:p,reason:"no_matching_replacements",patientZeroInstanceId:record.patientZeroInstanceId}});
            return null;
        }
        const targets=shuffle(technoOrganicInfectionTargets(ctx,p));
        if(!targets.length){
            host()?.log?.("techno_organic_virus_stalled",{packNumber:Number(ctx.packStartIndex||0)+1,reason:"techno_organic_virus",data:{playerIndex:p,reason:"no_eligible_targets",patientZeroInstanceId:record.patientZeroInstanceId}});
            return null;
        }
        const target=targets[0],template=templates[Math.floor(Math.random()*templates.length)];
        const replacement=host()?.createCard?.(template,{anomalyId:"techno_organic_virus",sourceEvent:"techno_organic_virus_mutation"})||template;
        const result=host()?.replaceDeckCard?.(p,target.index,replacement,{reason:"techno_organic_virus",anomalyId:"techno_organic_virus",eventType:"techno_organic_virus_mutation",origin:"black_hole_anomaly",sourceEvent:"techno_organic_virus_mutation",graveyardCategory:"rerolled",recoverable:true,data:{patientZeroInstanceId:record.patientZeroInstanceId,patientZeroName:record.patientZeroName,patientZeroCost:record.cost,patientZeroPower:record.power}})||{ok:false};
        if(!result?.ok||!result.resultCard) return null;
        const generation=Number(record.infections||0)+1;
        markTechnoOrganicInfected(result.resultCard,p,generation);
        record.infections=generation;
        const matchedBy=[];
        if(Number.isFinite(Number(record.cost))&&Number(result.resultCard.cost)===Number(record.cost)) matchedBy.push("cost");
        if(Number.isFinite(Number(record.power))&&Number(result.resultCard.power)===Number(record.power)) matchedBy.push("power");
        const infection={playerIndex:p,playerName:ctx?.players?.[p]||record.playerName||null,generation,patientZeroInstanceId:record.patientZeroInstanceId,patientZeroName:record.patientZeroName,sourceCardName:result.previousCard?.name||target.card?.name||null,sourceCardInstanceId:result.previousCard?.instanceId||target.card?.instanceId||null,resultCardName:result.resultCard.name||null,resultCardInstanceId:result.resultCard.instanceId||null,matchedBy};
        state.technoOrganicVirus.history=Array.isArray(state.technoOrganicVirus.history)?state.technoOrganicVirus.history:[];
        state.technoOrganicVirus.history.push(clone(infection));
        host()?.log?.("techno_organic_virus_spread",{packNumber:Number(ctx.packStartIndex||0)+1,reason:"techno_organic_virus",data:clone(infection)});
        return infection;
    }
    function clearTechnoOrganicVirusFx(){
        if(typeof document==="undefined") return;
        document.querySelectorAll?.(".bha-techno-virus-transmission")?.forEach(node=>node.remove?.());
    }
    function playTechnoOrganicVirusSpreadFx(infection){
        if(typeof document==="undefined"||!infection) return {durationMs:0};
        clearTechnoOrganicVirusFx();
        const p=Number(infection.playerIndex);
        const source=document.querySelector?.(`#decks .card[data-player-index="${p}"][data-card-instance-id="${String(infection.patientZeroInstanceId||"")}"]`);
        const target=document.querySelector?.(`#decks .card[data-player-index="${p}"][data-card-instance-id="${String(infection.resultCardInstanceId||"")}"]`);
        if(!target) return {durationMs:900};
        target.classList.add("bha-techno-virus-mutation-hit");
        if(!source){setTimeout(()=>target.classList.remove("bha-techno-virus-mutation-hit"),980);return {durationMs:900};}
        const a=source.getBoundingClientRect?.(),b=target.getBoundingClientRect?.();
        if(!a||!b) return {durationMs:900};
        const x1=a.left+a.width/2,y1=a.top+a.height/2,x2=b.left+b.width/2,y2=b.top+b.height/2;
        const dx=x2-x1,dy=y2-y1,distance=Math.max(1,Math.hypot(dx,dy)),angle=Math.atan2(dy,dx)*180/Math.PI;
        const fx=document.createElement("div");
        fx.className="bha-techno-virus-transmission";
        fx.style.left=`${x1}px`;fx.style.top=`${y1}px`;fx.style.width=`${distance}px`;fx.style.transform=`rotate(${angle}deg)`;
        fx.innerHTML='<span class="bha-techno-virus-wire"></span><span class="bha-techno-virus-pulse"></span>';
        document.body.appendChild(fx);
        setTimeout(()=>{fx.remove?.();target.classList.remove("bha-techno-virus-mutation-hit");},1120);
        return {durationMs:1020};
    }
    function resolveTechnoOrganicVirusPostPick(payload={},resume){
        if(!technoOrganicVirusActive()) return false;
        const virus=ensureTechnoOrganicVirusPerPlayerState(state.technoOrganicVirus||{}),playerIndex=Number(payload?.playerIndex),record=technoOrganicPlayerState(playerIndex);
        if(!record) return false;
        const remainingBefore=Math.max(0,Number(record.remainingPickMutations??record.totalPickMutations??virus?.picksPerPlayer??4)||0);
        if(remainingBefore<=0) return false;
        record.remainingPickMutations=Math.max(0,remainingBefore-1);
        refreshTechnoOrganicVirusCounters(virus);
        const isFinalStep=virus.remainingPickMutations===0;
        const finishMutation=(infection)=>{
            if(infection){
                const card=context()?.decks?.[Number(infection.playerIndex)]?.find?.(entry=>String(entry?.instanceId||"")===String(infection.resultCardInstanceId||""));
                if(card) delete card.anomalyTechnoOrganicJustInfected;
            }
            if(!isFinalStep){
                setLocked(false);
                resume?.();
                return;
            }
            virus.active=false;
            virus.completed=true;
            showTechnoOrganicVirusBroadcast({
                phase:"end",
                title:"MUTACJA TECHNO-ORGANIC VIRUSA USTAŁA",
                description:"KAŻDY Z ZARAŻONYCH GRACZY WYKONAŁ CZTERY WŁASNE PICKI. DALSZE ZAKAŻENIA NIE BĘDĄ JUŻ POWSTAWAĆ.",
                rarity:"epic",
                kicker:"MUTACJA USTAŁA",
                holdMs:2300,
                leaveMs:520
            },()=>{
                setLocked(false);
                resume?.();
            });
        };
        const infection=spreadTechnoOrganicVirus(playerIndex,context());
        host()?.log?.("techno_organic_virus_pick_progress",{packNumber:Number(context()?.packStartIndex||0)+1,reason:"techno_organic_virus",data:{playerIndex,remainingForPlayer:Number(record.remainingPickMutations||0),remainingTotal:Number(virus.remainingPickMutations||0),picksPerPlayer:Number(virus.picksPerPlayer||4)}});
        if(!infection){
            if(isFinalStep){
                setLocked(true);
                finishMutation(null);
            }else resume?.();
            return true;
        }
        setLocked(true);
        host()?.renderDecks?.();
        if(typeof document==="undefined"){
            finishMutation(infection);
            return true;
        }
        requestAnimationFrame(()=>playTechnoOrganicVirusSpreadFx(infection));
        setTimeout(()=>finishMutation(infection),1080);
        return true;
    }
    function shootingStarsActive(){
        return Boolean(state.enabled&&state.ongoing?.id==="shooting_stars"&&state.ongoing?.triggered);
    }
    function recordOngoingActivation(entry,outcome={}){
        if(!entry) return null;
        if(state.ongoing?.id===entry.id) state.ongoing.triggered=true;
        const scheduled=state.timeline.find(item=>(entry.scheduleId&&item.scheduleId===entry.scheduleId)||item.id===entry.id&&item.window==="draft_start");
        if(scheduled) scheduled.triggered=true;
        if(entry.adminForced&&state.adminTest){state.adminTest.completed=true;state.adminTest.blockedReason=null;state.adminTest.scheduledPackIndex=-1;}
        const event={anomalyId:entry.id,name:entry.name,rarity:entry.rarity,timing:entry.timing,window:entry.window||"draft_start",slot:clone(entry.slot||{type:"draft_start"}),duration:entry.duration||"draft",packNumber:null,guaranteed:Boolean(entry.guaranteed),adminForced:Boolean(entry.adminForced),outcome:clone(outcome),at:new Date().toISOString()};
        state.events.push(event);
        host()?.log?.("black_hole_anomaly_activated",{reason:entry.id,data:clone(event)});
        return event;
    }
    function beforeDraftStart(resume){
        if(!state.enabled||!state.ongoing||state.ongoing.triggered) return false;
        const entry=state.ongoing;
        const activate=()=>{
            const payload=entry.id==="cosmic_treasure"
                ? {treasureTemplateName:entry.treasureTemplateName||null,treasureHint:entry.treasureHint||null,treasurePackIndex:Number(entry.pendingTreasurePackIndex??entry.initialTreasurePackIndex??0)+1,economyBonus:Boolean(context()?.economyEnabled)}
                : entry.id==="mephisto_pact"
                    ? {temptationsTotal:Number(entry.temptationsTotal||3),minDeckSize:Number(entry.minDeckSize||5),gapPicks:Number(entry.gapPicks||5),superpowerPolicy:entry.superpowerPolicy||"allow"}
                    : {starCount:Number(entry.starCount||Math.min(6,state.totalPacks)),superpowerPolicy:entry.superpowerPolicy||"allow"};
            recordOngoingActivation(entry,payload);
            if(entry.id==="cosmic_treasure"){
                entry.revealShown=true;
                if(typeof document==="undefined"){resume?.();return;}
                openCosmicTreasureMapModal(()=>resume?.());
                return;
            }
            resume?.();
        };
        if(typeof document==="undefined"){activate();return true;}
        showOngoingActivationIntro(entry,activate);
        return true;
    }
    function getShootingStarMarker(packIndex=context()?.packStartIndex){
        if(!shootingStarsActive()) return null;
        const key=String(Number(packIndex||0));
        return state.ongoing?.starsByPack?.[key]||null;
    }
    function ensureShootingStarForPack(ctx=context()){
        if(!shootingStarsActive()) return null;
        const packIndex=Number(ctx?.packStartIndex||0);
        const total=Math.max(0,Number(state.ongoing?.starCount||0));
        if(packIndex<0||packIndex>=total) return null;
        state.ongoing.starsByPack=state.ongoing.starsByPack||{};
        const key=String(packIndex);
        if(state.ongoing.starsByPack[key]) return state.ongoing.starsByPack[key];
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        if(!pack.length) return null;
        const normal=pack.map((card,index)=>({card,index})).filter(entry=>entry.card&&!entry.card.joker);
        const candidates=normal.length?normal:pack.map((card,index)=>({card,index})).filter(entry=>entry.card);
        if(!candidates.length) return null;
        const picked=candidates[Math.floor(Math.random()*candidates.length)];
        const marker={packIndex,instanceId:picked.card?.instanceId||null,sourceIndex:picked.index,cardName:picked.card?.name||null,hit:false,assignedAt:new Date().toISOString()};
        state.ongoing.starsByPack[key]=marker;
        host()?.log?.("shooting_star_hidden",{packNumber:packIndex+1,reason:"shooting_stars",data:{packIndex,sourceIndex:picked.index,cardInstanceId:marker.instanceId}});
        return marker;
    }
    function onPackCardsReplaced(payload={}){
        const replacements=Array.isArray(payload.replacements)?payload.replacements:[payload];
        let changed=false;
        if(zombieHordeActive()){
            for(const item of replacements){
                const source=item?.sourceCard||item?.previousCard||null;
                const replacement=item?.replacementCard||item?.resultCard||item?.replacement||null;
                if(zombieHordeCard(source)&&replacement&&!replacement.joker){
                    replacement.anomalyZombieHorde=true;
                    replacement.anomalyZombieHordeVariant=source.anomalyZombieHordeVariant||zombieHordeVariant(source);
                    replacement.anomalyZombieHordeGeneration=Number(source.anomalyZombieHordeGeneration)||0;
                    replacement.anomalyZombieHordeTilt=source.anomalyZombieHordeTilt;
                    replacement.anomalyZombieHordeScale=source.anomalyZombieHordeScale;
                    changed=true;
                }
            }
        }
        if(!shootingStarsActive()) return changed;
        const packIndex=Number(payload.packIndex??context()?.packStartIndex??0);
        const marker=getShootingStarMarker(packIndex);
        if(!marker||marker.hit) return changed;
        for(const item of replacements){
            const source=item?.sourceCard||item?.previousCard||null;
            const replacement=item?.replacementCard||item?.resultCard||item?.replacement||null;
            const sourceId=String(source?.instanceId||"");
            if(sourceId&&sourceId===String(marker.instanceId||"")&&replacement){
                marker.instanceId=replacement.instanceId||null;
                marker.cardName=replacement.name||null;
                if(Number.isInteger(Number(item?.index))) marker.sourceIndex=Number(item.index);
                host()?.log?.("shooting_star_transferred",{packNumber:packIndex+1,reason:"shooting_stars",data:{fromInstanceId:sourceId,toInstanceId:marker.instanceId,index:marker.sourceIndex}});
                return true;
            }
        }
        return changed;
    }
    function isShootingStarCard(card,packContext={}){
        if(!shootingStarsActive()||!card) return false;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        const marker=getShootingStarMarker(Number(ctx?.packStartIndex||0));
        if(!marker||marker.hit) return false;
        const cardId=String(card?.instanceId||"");
        return Boolean(cardId&&cardId===String(marker.instanceId||""));
    }
    function playKlyntarPickAnimation(index,packContext=context(),cardHint=null){
        if(typeof document==="undefined") return null;
        const turn=getKlyntarTurnMeta(packContext);
        if(!turn||turn.solo) return null;
        const normalizedIndex=Number(index);
        const hintedId=String(cardHint?.instanceId||"");
        const pack=document.getElementById("pack");
        const escapedHint=hintedId&&global.CSS?.escape?global.CSS.escape(hintedId):hintedId;
        const card=(Number.isInteger(normalizedIndex)
            ? pack?.querySelector?.(`[data-pack-index="${normalizedIndex}"]`)
            : null)
            ||(hintedId?pack?.querySelector?.(`[data-card-instance-id="${escapedHint}"]`):null);
        if(!card) return null;
        const rect=card.getBoundingClientRect?.();
        if(!rect||!rect.width||!rect.height) return null;

        let layer=document.getElementById("spxVenomFeastLayer");
        if(!layer){
            layer=document.createElement("div");
            layer.id="spxVenomFeastLayer";
            layer.className="spx-venom-feast-layer";
            document.body.appendChild(layer);
        }
        layer.className="spx-venom-feast-layer bha-klyntar-venom-feast";
        const centerX=rect.left+rect.width/2;
        const centerY=rect.top+rect.height/2;
        const startX=rect.left+rect.width*.18;
        const endX=rect.right-rect.width*.18;
        const distance=Math.max(1,endX-startX);
        layer.style.setProperty("--spx-venom-start-x",`${startX}px`);
        layer.style.setProperty("--spx-venom-start-y",`${centerY}px`);
        layer.style.setProperty("--spx-venom-end-x",`${endX}px`);
        layer.style.setProperty("--spx-venom-end-y",`${centerY}px`);
        layer.style.setProperty("--spx-venom-distance",`${distance}px`);
        layer.style.setProperty("--spx-venom-angle","0deg");
        layer.innerHTML=`
            <div class="spx-venom-feast-flash"></div>
            <div class="spx-venom-tendril-beam"></div>
            <img class="spx-venom-bite spx-venom-bite-own" src="draft-assets/venombite.webp" alt="">
            <img class="spx-venom-bite spx-venom-bite-target" src="draft-assets/venombite.webp" alt="">
            <div class="spx-venom-feast-label bha-klyntar-feast-label">
                <strong>SYMBIOZA KLYNTARU</strong>
                <span>WSPÓLNY PICK</span>
            </div>`;
        layer.hidden=false;
        card.classList.add("bha-klyntar-card-consumed");
        clearTimeout(playKlyntarPickAnimation.timer);
        playKlyntarPickAnimation.timer=setTimeout(()=>{
            layer.hidden=true;
            layer.innerHTML="";
            layer.className="spx-venom-feast-layer";
            card.classList.remove("bha-klyntar-card-consumed");
        },1550);
        return {durationMs:1550,venomFeast:true};
    }

    function playShootingStarPickAnimation(index,card){
        if(typeof document==="undefined") return {durationMs:0,shootingStar:true};
        const pack=document.getElementById("pack");
        const source=[...(pack?.querySelectorAll?.(".pack-card-btn,.joker-card-btn")||[])].find(button=>Number(button?.dataset?.packIndex)===Number(index))||null;
        const rect=source?.getBoundingClientRect?.();
        if(!rect) return {durationMs:1120,shootingStar:true};
        source.classList.add("bha-shooting-star-picked-source");
        document.getElementById("bhaShootingStarHitFx")?.remove?.();
        const fx=document.createElement("div");
        fx.id="bhaShootingStarHitFx";
        fx.className="bha-shooting-star-hit-fx";
        fx.style.left=`${rect.left+rect.width/2}px`;
        fx.style.top=`${rect.top+rect.height/2}px`;
        fx.style.setProperty("--bha-star-card-w",`${rect.width}px`);
        fx.style.setProperty("--bha-star-card-h",`${rect.height}px`);
        fx.innerHTML=`<span class="bha-shooting-star-core"></span><span class="bha-shooting-star-rays"></span><span class="bha-shooting-star-orbit"></span>${Array.from({length:18},(_,i)=>`<i style="--i:${i};--a:${(i*47)%360}deg;--r:${42+(i%5)*13}px;--d:${(i%7)*.045}s">☆</i>`).join("")}`;
        document.body.appendChild(fx);
        requestAnimationFrame(()=>fx.classList.add("is-active"));
        setTimeout(()=>fx.classList.add("is-leaving"),820);
        setTimeout(()=>fx.remove?.(),1450);
        return {durationMs:1180,shootingStar:true};
    }
    function getShootingStarDeckOptions(playerIndex,mode="replace"){
        const ctx=context(),deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        return deck.map((card,index)=>({card,index})).filter(({card,index})=>{
            if(!card||card?.joker) return false;
            if(mode==="display") return true;
            return host()?.canReplaceDeckCard?.(Number(playerIndex),index,{reason:"shooting_star_wish",anomalyId:"shooting_stars",effect:"replace"})!==false;
        });
    }
    function getShootingStarPackOptions(playerIndex){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        return pack.map((card,index)=>({card,index,publicCard:getPublicCardSnapshot(card,index,ctx)})).filter(({card,index})=>{
            if(!card||card?.joker) return false;
            if(host()?.canReplacePackCard?.(index,{reason:"shooting_star_wish",anomalyId:"shooting_stars"})===false) return false;
            return canPickCard(index,ctx)?.ok!==false;
        });
    }
    function hasFutureShootingStarQueue(playerIndex,ctx=context()){
        const p=Number(playerIndex),players=Array.isArray(ctx.players)?ctx.players:[];
        if(!Number.isInteger(p)||!players.length) return false;
        const roundSize=players.length,current=Number(ctx.currentPickIndex||0),order=Array.isArray(ctx.pickOrder)?ctx.pickOrder:[];
        if(current<roundSize&&order.findIndex((entry,index)=>index>=roundSize&&Number(entry)===p)>=0) return true;
        return Number(ctx.packStartIndex||0)+1<Number(state.totalPacks||6);
    }
    function buildShootingStarWishPool(playerIndex){
        const ctx=context();
        const wishes=[];
        if(ctx.economyEnabled) wishes.push({id:"jeffcoins",icon:"🪙",title:"KOSMICZNE BOGACTWO",text:"Otrzymujesz 5 JeffCoinów."});
        else if(getShootingStarDeckOptions(playerIndex).length&&typeof host()?.openTechnicalReroll==="function") wishes.push({id:"technical_reroll",icon:"↻",title:"NOWY LOS",text:"Wybierz kartę z decku i przelosuj ją: 1 z 3."});
        if(getShootingStarDeckOptions(playerIndex).length&&getShootingStarPackOptions(playerIndex).length) wishes.push({id:"deck_pack_swap",icon:"⇄",title:"ZAMIANA GWIAZD",text:"Zamień jedną własną kartę z kartą pozostałą w paczce."});
        if(hasFutureShootingStarQueue(playerIndex,ctx)) wishes.push({id:"queue_first",icon:"★",title:"PIERWSZE ŻYCZENIE",text:"Idziesz pierwszy w następnej kolejce."});
        if(getShootingStarDeckOptions(playerIndex).length&&host()?.hasEpicChoiceJoker?.()!==false) wishes.push({id:"epic_choice_joker",icon:"🃏",title:"JOKER Z GWIAZD",text:"Otwórz losowego Epickiego Jokera Choice i wstaw jego wynik do decku."});
        return shuffle(wishes).slice(0,3);
    }
    function ensureShootingStarWishModal(){
        if(typeof document==="undefined") return null;
        let root=document.getElementById("bhaShootingStarWishModal");
        if(root) return root;
        root=document.createElement("div");
        root.id="bhaShootingStarWishModal";
        root.className="bha-shooting-star-wish-modal";
        root.hidden=true;
        root.setAttribute("aria-hidden","true");
        root.innerHTML=`
            <div class="bha-wish-sky" aria-hidden="true"><i class="cloud cloud-a"></i><i class="cloud cloud-b"></i><i class="cloud cloud-c"></i><i class="cloud cloud-d"></i><span class="sky-star s1">✦</span><span class="sky-star s2">✧</span><span class="sky-star s3">★</span><span class="sky-star s4">✦</span><span class="sky-star s5">✧</span></div>
            <section class="bha-wish-shell" role="dialog" aria-modal="true" aria-labelledby="bhaWishTitle">
                <div class="bha-wish-kicker">🌠 SPADAJĄCA GWIAZDA</div>
                <h2 id="bhaWishTitle">TRAFIŁEŚ NA SPADAJĄCĄ GWIAZDĘ!</h2>
                <p id="bhaWishLead">Wybierz jedno z trzech życzeń.</p>
                <div class="bha-wish-content" id="bhaWishContent"></div>
                <div class="bha-wish-status" id="bhaWishStatus"></div>
            </section>`;
        document.body.appendChild(root);
        return root;
    }
    function shootingStarCardLabel(card){
        if(!card) return "KARTA";
        const stats=[];
        if(Number.isFinite(Number(card.cost))) stats.push(`${Number(card.cost)}⚡`);
        if(String(card.cardType||"").toLowerCase()!=="skill"&&Number.isFinite(Number(card.power))) stats.push(`${Number(card.power)}★`);
        return `${card.name||"Karta"}${stats.length?` · ${stats.join(" / ")}`:""}`;
    }
    function renderShootingStarChoiceButtons(root,wishes,onChoose){
        const content=root?.querySelector?.("#bhaWishContent");
        if(!content) return;
        content.className="bha-wish-content bha-wish-choice-grid";
        content.innerHTML="";
        wishes.forEach(wish=>{
            const button=document.createElement("button");
            button.type="button";
            button.className="bha-wish-cloud-choice";
            button.dataset.wishId=wish.id;
            button.innerHTML=`<span>${wish.icon||"✦"}</span><b>${escapeHtml(wish.title||wish.id)}</b><small>${escapeHtml(wish.text||"")}</small>`;
            button.addEventListener("click",()=>onChoose?.(wish));
            content.appendChild(button);
        });
    }
    function renderShootingStarCardSelector(root,{title,lead,entries,onChoose,publicCards=false}={}){
        const titleNode=root?.querySelector?.("#bhaWishTitle");
        const leadNode=root?.querySelector?.("#bhaWishLead");
        const content=root?.querySelector?.("#bhaWishContent");
        if(titleNode) titleNode.textContent=title||"WYBIERZ KARTĘ";
        if(leadNode) leadNode.textContent=lead||"";
        if(!content) return;
        content.className="bha-wish-content bha-wish-card-grid";
        content.innerHTML="";
        (entries||[]).forEach(entry=>{
            const card=publicCards?(entry.publicCard||entry.card):entry.card;
            const button=document.createElement("button");
            button.type="button";
            button.className="bha-wish-card-choice";
            button.innerHTML=`<b>${escapeHtml(card?.name||"Ukryta karta")}</b><small>${escapeHtml(shootingStarCardLabel(card).replace(String(card?.name||""),"").replace(/^\s*·\s*/,""))}</small>`;
            button.addEventListener("click",()=>onChoose?.(entry));
            content.appendChild(button);
        });
    }
    function finalizeShootingStarWish(playerIndex,wishId,result,done){
        if(state.ongoing?.id==="shooting_stars"){
            state.ongoing.wishes=Array.isArray(state.ongoing.wishes)?state.ongoing.wishes:[];
            state.ongoing.wishes.push({playerIndex:Number(playerIndex),playerName:context()?.players?.[Number(playerIndex)]||null,wishId,packNumber:Number(context()?.packStartIndex||0)+1,result:clone(result||{}),at:new Date().toISOString()});
        }
        host()?.log?.("shooting_star_wish_resolved",{packNumber:Number(context()?.packStartIndex||0)+1,reason:wishId,data:{playerIndex:Number(playerIndex),wishId,result:clone(result||{})}});
        const root=typeof document!=="undefined"?document.getElementById("bhaShootingStarWishModal"):null;
        if(root){root.classList.add("is-resolved");setTimeout(()=>{root.hidden=true;root.setAttribute("aria-hidden","true");root.classList.remove("is-open","is-resolved");},420);}
        setTimeout(()=>{setLocked(false);host()?.render?.();done?.();},typeof document==="undefined"?0:460);
    }
    function resolveShootingStarWish(playerIndex,wish,root,done){
        const status=root?.querySelector?.("#bhaWishStatus");
        if(status) status.textContent="";
        if(wish.id==="jeffcoins"){
            const credit=host()?.credit?.(Number(playerIndex),5,{kind:"anomaly_wish",reason:"shooting_star_jeffcoins",packNumber:Number(context()?.packStartIndex||0)+1,data:{anomalyId:"shooting_stars"}})||{ok:false};
            if(credit?.ok!==false){host()?.playJeffCoinAward?.(Number(playerIndex),5,{source:"shooting_star",label:"ŻYCZENIE GWIAZDY"});if(status) status.textContent="✦ +5 JEFFCOINÓW ✦";setTimeout(()=>finalizeShootingStarWish(playerIndex,wish.id,{amount:5},done),1450);return;}
            if(status) status.textContent=credit?.reason||"Nie udało się przyznać JeffCoinów.";
            return;
        }
        if(wish.id==="queue_first"){
            const result=grantShootingStarQueuePriority(playerIndex,context());
            if(result?.ok){host()?.playQueueStarFx?.(Number(playerIndex),result);if(status) status.textContent="✦ PIERWSZE MIEJSCE W NASTĘPNEJ KOLEJCE ✦";setTimeout(()=>finalizeShootingStarWish(playerIndex,wish.id,result,done),980);return;}
            if(status) status.textContent=result?.reason||"Nie ma już następnej kolejki.";
            return;
        }
        if(wish.id==="deck_pack_swap"){
            const deckEntries=getShootingStarDeckOptions(playerIndex);
            renderShootingStarCardSelector(root,{title:"WYBIERZ KARTĘ ZE SWOJEGO DECKU",lead:"Ta karta trafi do paczki. Nic nie trafia do Cmentarzyska.",entries:deckEntries,onChoose:deckEntry=>{
                const packEntries=getShootingStarPackOptions(playerIndex);
                renderShootingStarCardSelector(root,{title:"WYBIERZ KARTĘ Z PACZKI",lead:`${deckEntry.card?.name||"Wybrana karta"} ↔ karta z paczki`,entries:packEntries,publicCards:true,onChoose:packEntry=>{
                    const result=host()?.swapWishCards?.(Number(playerIndex),Number(deckEntry.index),Number(packEntry.index),{anomalyId:"shooting_stars",reason:"shooting_star_deck_pack_swap"})||{ok:false,reason:"Brak mostu wymiany."};
                    if(result?.ok) finalizeShootingStarWish(playerIndex,wish.id,{deckOut:result.deckOut?.name||null,deckIn:result.deckIn?.name||null},done);
                    else if(status) status.textContent=result?.reason||"Wymiana nie powiodła się.";
                }});
            }});
            return;
        }
        if(wish.id==="technical_reroll"){
            const deckEntries=getShootingStarDeckOptions(playerIndex);
            renderShootingStarCardSelector(root,{title:"WYBIERZ KARTĘ DO PRZELOSOWANIA",lead:"Za chwilę otworzy się Techniczny Reroll 1 z 3.",entries:deckEntries,onChoose:deckEntry=>{
                root.hidden=true;root.setAttribute("aria-hidden","true");
                const opened=host()?.openTechnicalReroll?.(Number(playerIndex),Number(deckEntry.index),{
                    kicker:"ŻYCZENIE SPADAJĄCEJ GWIAZDY",title:"TECHNICZNY REROLL • 1 Z 3",description:`${deckEntry.card?.name||"Karta"} → wybierz nowy los`,allowCancel:false,sourceEvent:"shooting_star_technical_reroll",reason:"shooting_star_technical_reroll",origin:"shooting_star_wish",method:"shooting_star_1_of_3",data:{anomalyId:"shooting_stars"},onResolve:result=>finalizeShootingStarWish(playerIndex,wish.id,{from:result?.previousCard?.name||deckEntry.card?.name||null,to:result?.resultCard?.name||null},done)
                });
                if(!opened){root.hidden=false;root.setAttribute("aria-hidden","false");if(status) status.textContent="Techniczny Reroll nie jest teraz dostępny.";}
            }});
            return;
        }
        if(wish.id==="epic_choice_joker"){
            const joker=host()?.getRandomEpicChoiceJoker?.()||null;
            if(!joker){if(status) status.textContent="Nie znaleziono legalnego Epickiego Jokera Choice.";return;}
            const titleNode=root?.querySelector?.("#bhaWishTitle"),leadNode=root?.querySelector?.("#bhaWishLead"),content=root?.querySelector?.("#bhaWishContent");
            if(titleNode) titleNode.textContent=`JOKER: ${joker.name||"EPICKI JOKER"}`;
            if(leadNode) leadNode.textContent=joker.desc||joker.description||"Wybierz wynik Jokera.";
            if(content){content.className="bha-wish-content bha-wish-joker-reveal";content.innerHTML=`<div class="bha-wish-joker-card"><small>EPIC • JOKER CHOICE</small><b>${escapeHtml(joker.name||"JOKER")}</b><span>${escapeHtml(joker.desc||joker.description||"")}</span></div>`;}
            setTimeout(()=>{
                root.hidden=true;root.setAttribute("aria-hidden","true");
                const opened=host()?.resolveJokerChoice?.(joker,Number(playerIndex),{
                    onResolve:resolvedCard=>{
                        root.hidden=false;root.setAttribute("aria-hidden","false");root.classList.add("is-open");
                        const deckEntries=getShootingStarDeckOptions(playerIndex);
                        renderShootingStarCardSelector(root,{title:"GDZIE WSTAWIĆ WYNIK JOKERA?",lead:`${resolvedCard?.name||"Wynik Jokera"} zastąpi jedną kartę w Twoim decku.`,entries:deckEntries,onChoose:deckEntry=>{
                            const result=host()?.replaceDeckWishCard?.(Number(playerIndex),Number(deckEntry.index),resolvedCard,{anomalyId:"shooting_stars",reason:"shooting_star_epic_choice_joker"})||{ok:false};
                            if(result?.ok) finalizeShootingStarWish(playerIndex,wish.id,{jokerId:joker.id||null,jokerName:joker.name||null,removed:result.previousCard?.name||null,added:result.resultCard?.name||resolvedCard?.name||null},done);
                            else if(status) status.textContent=result?.reason||"Nie udało się wstawić wyniku Jokera.";
                        }});
                    },
                    onCancel:()=>{root.hidden=false;root.setAttribute("aria-hidden","false");if(status) status.textContent="Życzenie musi zostać dokończone.";}
                });
                if(!opened){root.hidden=false;root.setAttribute("aria-hidden","false");if(status) status.textContent="Joker Choice nie może się teraz otworzyć.";}
            },820);
        }
    }
    function openShootingStarWishPrompt(playerIndex,payload,done){
        if(typeof document==="undefined"){
            const wishes=buildShootingStarWishPool(playerIndex);
            const wish=wishes[0]||null;
            if(!wish){setLocked(false);done?.();return false;}
            // Headless regression path resolves noninteractive rewards deterministically.
            if(wish.id==="jeffcoins"){host()?.credit?.(Number(playerIndex),5,{kind:"anomaly_wish",reason:"shooting_star_jeffcoins"});finalizeShootingStarWish(playerIndex,wish.id,{amount:5},done);return true;}
            if(wish.id==="queue_first"){finalizeShootingStarWish(playerIndex,wish.id,grantShootingStarQueuePriority(playerIndex,context()),done);return true;}
            setLocked(false);done?.();return true;
        }
        const root=ensureShootingStarWishModal();
        if(!root){setLocked(false);done?.();return false;}
        const playerName=context()?.players?.[Number(playerIndex)]||`Gracz ${Number(playerIndex)+1}`;
        const title=root.querySelector("#bhaWishTitle"),lead=root.querySelector("#bhaWishLead"),status=root.querySelector("#bhaWishStatus");
        if(title) title.textContent="TRAFIŁEŚ NA SPADAJĄCĄ GWIAZDĘ!";
        if(lead) lead.textContent=`${playerName}: wybierz jedno z trzech życzeń.`;
        if(status) status.textContent="";
        const wishes=buildShootingStarWishPool(playerIndex);
        renderShootingStarChoiceButtons(root,wishes,wish=>resolveShootingStarWish(playerIndex,wish,root,done));
        root.hidden=false;root.setAttribute("aria-hidden","false");
        requestAnimationFrame(()=>root.classList.add("is-open"));
        return true;
    }
    function resolveShootingStarPostPick(payload={},resume){
        if(!shootingStarsActive()) return false;
        const ctx=context(),marker=getShootingStarMarker(Number(ctx?.packStartIndex||0));
        const sourceCard=payload?.sourceCard||payload?.card||payload?.resultCard||null;
        if(!marker||marker.hit||!sourceCard||String(sourceCard?.instanceId||"")!==String(marker.instanceId||"")) return false;
        marker.hit=true;
        marker.hitPlayerIndex=Number(payload?.playerIndex);
        marker.hitPlayerName=ctx?.players?.[Number(payload?.playerIndex)]||null;
        marker.hitAt=new Date().toISOString();
        state.ongoing.hits=Array.isArray(state.ongoing.hits)?state.ongoing.hits:[];
        state.ongoing.hits.push(clone(marker));
        host()?.log?.("shooting_star_hit",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"shooting_stars",data:{playerIndex:Number(payload?.playerIndex),playerName:marker.hitPlayerName,cardInstanceId:marker.instanceId,cardName:sourceCard?.name||null}});
        setLocked(true);
        host()?.render?.();
        openShootingStarWishPrompt(Number(payload?.playerIndex),payload,resume);
        return true;
    }
    function resolvePostPick(payload={},resume){
        const finishMephisto=()=>{if(!resolveMephistoPostPick(payload,resume)) resume?.();};
        const finishShootingStar=()=>{if(!resolveShootingStarPostPick(payload,finishMephisto)) finishMephisto();};
        const finishCosmicTreasure=()=>{if(!resolveCosmicTreasurePostPick(payload,finishShootingStar)) finishShootingStar();};
        const finishVirus=()=>{if(!resolveTechnoOrganicVirusPostPick(payload,finishCosmicTreasure)) finishCosmicTreasure();};
        const finishTribunal=()=>{if(!resolveLivingTribunalPostPick(payload,finishVirus)) finishVirus();};
        const finishLivingDead=()=>{if(!resolveNightOfLivingDeadPostPick(payload,finishTribunal)) finishTribunal();};
        if(zombieHordeActive()){
            const sourceCard=payload?.sourceCard||payload?.card||payload?.resultCard||null;
            const spreadCount=zombieHordeCard(sourceCard)?2:1;
            const infected=spreadZombieHorde(spreadCount,context());
            host()?.log?.("zombie_horde_spread",{packNumber:Number(context()?.packStartIndex||0)+1,reason:"zombie_horde",data:{playerIndex:Number(payload?.playerIndex),sourceWasHorde:zombieHordeCard(sourceCard),spreadRequested:spreadCount,infected:clone(infected)}});
            if(infected.length){
                setLocked(true);
                if(typeof document==="undefined"){
                    infected.forEach(entry=>{const card=context()?.currentPack?.[entry.index];if(card) delete card.anomalyZombieHordeJustInfected;});
                    setLocked(false);finishLivingDead();return true;
                }
                host()?.render?.();
                const spreadFxMs=playZombieHordeSpreadAnimations(infected)||1240;
                setTimeout(()=>{infected.forEach(entry=>{const card=context()?.currentPack?.find?.(item=>String(item?.instanceId||"")===String(entry.instanceId||""));if(card) delete card.anomalyZombieHordeJustInfected;});setLocked(false);finishLivingDead();},spreadFxMs);
                return true;
            }
        }
        if(resolveNightOfLivingDeadPostPick(payload,finishTribunal)) return true;
        if(resolveLivingTribunalPostPick(payload,finishVirus)) return true;
        if(resolveTechnoOrganicVirusPostPick(payload,finishCosmicTreasure)) return true;
        if(resolveCosmicTreasurePostPick(payload,finishShootingStar)) return true;
        if(resolveShootingStarPostPick(payload,finishMephisto)) return true;
        if(resolveMephistoPostPick(payload,resume)) return true;
        return false;
    }

    function mephistoPactActive(){
        return Boolean(state.enabled&&state.ongoing?.id==="mephisto_pact"&&state.ongoing?.triggered);
    }
    const MEPHISTO_NO_ABILITY_NAMES=Object.freeze(["Misty Knight","Shocker","Cyclops","The Thing","Thing","Abomination","Hulk","Wasp"]);
    const MEPHISTO_FORBIDDEN_ALWAYS=Object.freeze(["Loki","Arishem"]);
    function mephistoGlobalPickCount(ctx=context()){
        const packIndex=Math.max(0,Number(ctx?.packStartIndex||0));
        const order=Array.isArray(ctx?.pickOrder)?ctx.pickOrder:[];
        const perPack=Math.max(1,order.length||Math.max(1,Number(ctx?.players?.length)||1)*2);
        const inPack=Math.max(0,Math.min(perPack,Number(ctx?.currentPickIndex||0)+1));
        return packIndex*perPack+inPack;
    }
    function mephistoNormalizeName(value){return String(value||"").trim().toLowerCase();}
    function mephistoGetWalletBalance(playerIndex){
        return Number(global.EconomyEngine?.getWallet?.(Number(playerIndex))?.balance||0);
    }
    function mephistoTagSets(){
        const raw=host()?.getTagCatalog?.()||{};
        const mechanic=new Set((Array.isArray(raw.mechanicFamilies)?raw.mechanicFamilies:[]).map(tag=>String(tag?.id||"").trim().toLowerCase()).filter(Boolean));
        const archetype=new Set((Array.isArray(raw.deckArchetypes)?raw.deckArchetypes:[]).map(tag=>String(tag?.id||"").trim().toLowerCase()).filter(Boolean));
        return {mechanic,archetype,all:new Set([...mechanic,...archetype])};
    }
    function mephistoSynergyProfile(deck=[]){
        const {all}=mephistoTagSets(),cards=Array.isArray(deck)?deck:[];
        const frequency=new Map();
        cards.forEach(card=>(Array.isArray(card?.tags)?card.tags:[]).forEach(tag=>{
            const id=String(tag||"").trim().toLowerCase();
            if(all.has(id)) frequency.set(id,(frequency.get(id)||0)+1);
        }));
        const repeated=new Set([...frequency.entries()].filter(([,count])=>count>=2).map(([id])=>id));
        const participatingCards=cards.filter(card=>(Array.isArray(card?.tags)?card.tags:[]).some(tag=>repeated.has(String(tag||"").trim().toLowerCase()))).length;
        const repeatStrength=[...frequency.entries()].filter(([,count])=>count>=2).reduce((sum,[,count])=>sum+(count-1),0);
        return {participatingCards,repeatStrength,repeatedTagCount:repeated.size};
    }
    function mephistoForbiddenNameSet(ctx=context()){
        return new Set([
            ...(Array.isArray(ctx?.bannedCards)?ctx.bannedCards:[]).map(item=>typeof item==="string"?item:item?.name),
            ...MEPHISTO_FORBIDDEN_ALWAYS
        ].map(mephistoNormalizeName).filter(Boolean));
    }
    function mephistoLegalRewardTemplatesForPlayer(playerIndex,ctx=context()){
        const deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        const occupied=new Set(deck.map(card=>mephistoNormalizeName(card?.name)).filter(Boolean));
        const seen=new Set();
        return (Array.isArray(ctx?.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=mephistoNormalizeName(card?.name);
            if(!name||seen.has(name)||occupied.has(name)||card?.joker) return false;
            seen.add(name);return true;
        });
    }
    function mephistoNoAbilityTemplates(ctx=context()){
        const explicit=new Set(MEPHISTO_NO_ABILITY_NAMES.map(mephistoNormalizeName));
        return (Array.isArray(ctx?.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=mephistoNormalizeName(card?.name);
            const tags=new Set((Array.isArray(card?.tags)?card.tags:[]).map(tag=>String(tag||"").trim().toLowerCase()));
            return Boolean(name&&!card?.joker&&(explicit.has(name)||tags.has("no-ability")||tags.has("no_ability")||tags.has("vanilla")));
        });
    }
    function mephistoEligibleSacrificeIndexes(playerIndex,ctx=context()){
        const deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        return deck.map((card,index)=>({card,index})).filter(entry=>entry.card&&host()?.canReplaceDeckCard?.(Number(playerIndex),Number(entry.index),{reason:"mephisto_pact",anomalyId:"mephisto_pact",effect:"sacrifice"})!==false).map(entry=>entry.index);
    }
    function mephistoEligiblePlayers(ctx=context()){
        const players=Array.isArray(ctx?.players)?ctx.players:[];
        const noAbilityCount=mephistoNoAbilityTemplates(ctx).length;
        return players.map((name,playerIndex)=>{
            const deck=Array.isArray(ctx?.decks?.[playerIndex])?ctx.decks[playerIndex]:[];
            const synergy=mephistoSynergyProfile(deck);
            const sacrifices=mephistoEligibleSacrificeIndexes(playerIndex,ctx);
            const rewards=mephistoLegalRewardTemplatesForPlayer(playerIndex,ctx);
            return {playerIndex,playerName:name||`GRACZ ${playerIndex+1}`,deckSize:deck.length,sacrificeCount:sacrifices.length,rewardCount:rewards.length,jeffCoins:mephistoGetWalletBalance(playerIndex),synergy};
        }).filter(entry=>entry.deckSize>=Number(state.ongoing?.minDeckSize||5)&&entry.sacrificeCount>=3&&entry.rewardCount>=2&&noAbilityCount>=3);
    }
    function mephistoQueueLastEligible(eligible,ctx=context()){
        const allowed=new Set(eligible.map(entry=>Number(entry.playerIndex)));
        const order=Array.isArray(ctx?.pickOrder)?ctx.pickOrder.map(Number):[];
        const from=Math.max(0,Number(ctx?.currentPickIndex||0)+1);
        const remaining=order.slice(from);
        for(let index=remaining.length-1;index>=0;index--){
            const playerIndex=Number(remaining[index]);
            if(allowed.has(playerIndex)) return eligible.find(entry=>Number(entry.playerIndex)===playerIndex)||null;
        }
        for(let index=order.length-1;index>=0;index--){
            const playerIndex=Number(order[index]);
            if(allowed.has(playerIndex)) return eligible.find(entry=>Number(entry.playerIndex)===playerIndex)||null;
        }
        return eligible[eligible.length-1]||null;
    }
    function chooseMephistoTargetPlayer(ctx=context()){
        const eligible=mephistoEligiblePlayers(ctx);
        if(!eligible.length) return null;
        const criteria=ctx?.economyEnabled?["synergy","queue","economy"]:["synergy","queue"];
        const criterion=criteria[Math.floor(Math.random()*criteria.length)]||"synergy";
        let target=null,reasonText="";
        if(criterion==="queue"){
            target=mephistoQueueLastEligible(eligible,ctx);
            reasonText="Mefisto wybrał tę duszę, bo jest aktualnie ostatnia w kolejce.";
        }else if(criterion==="economy"){
            const min=Math.min(...eligible.map(entry=>Number(entry.jeffCoins||0)));
            const tied=eligible.filter(entry=>Number(entry.jeffCoins||0)===min);
            target=tied[Math.floor(Math.random()*tied.length)]||tied[0];
            reasonText=`Mefisto wyczuł biedę: tylko ${Number(target?.jeffCoins||0)} JeffCoinów.`;
        }else{
            const minCards=Math.min(...eligible.map(entry=>Number(entry.synergy?.participatingCards||0)));
            let tied=eligible.filter(entry=>Number(entry.synergy?.participatingCards||0)===minCards);
            const minStrength=Math.min(...tied.map(entry=>Number(entry.synergy?.repeatStrength||0)));
            tied=tied.filter(entry=>Number(entry.synergy?.repeatStrength||0)===minStrength);
            target=tied[Math.floor(Math.random()*tied.length)]||tied[0];
            reasonText=`Mefisto wyczuł słabość synergii: tylko ${Number(target?.synergy?.participatingCards||0)} kart współdzieli powtarzający się Mechanic Family lub Archetype.`;
        }
        if(!target) return null;
        return {...target,selectionCriterion:criterion,selectionReason:reasonText};
    }
    function shouldTriggerMephistoPact(ctx=context()){
        if(!mephistoPactActive()||state.ongoing?.activePrompt) return false;
        const done=Number(state.ongoing?.temptationsDone||0),total=Number(state.ongoing?.temptationsTotal||3);
        if(done>=total) return false;
        const pickCount=mephistoGlobalPickCount(ctx),gap=Math.max(5,Number(state.ongoing?.gapPicks||5));
        const planned=Number(state.ongoing?.temptationPlan?.[done]);
        const requiredByPlan=Number.isFinite(planned)?planned:Math.max(1,Number(ctx?.players?.length||1)*5);
        const requiredByGap=done>0?Number(state.ongoing?.lastTriggerPickCount||0)+gap:0;
        if(pickCount<Math.max(requiredByPlan,requiredByGap)) return false;
        return mephistoEligiblePlayers(ctx).length>0;
    }
    function sampleRandom(list,count){
        const pool=shuffle(Array.isArray(list)?list:[]);
        return pool.slice(0,Math.max(0,Number(count)||0));
    }
    function clearMephistoPactModal(options={}){
        clearTimeout(mephistoPactStageTimer);clearTimeout(mephistoPactCloseTimer);mephistoPactStageTimer=0;mephistoPactCloseTimer=0;
        if(typeof document!=="undefined") document.getElementById("bhaMephistoPactModal")?.remove?.();
        if(mephistoPactActive()&&options.keepPrompt!==true) state.ongoing.activePrompt=false;
    }
    function mephistoSceneLayers(){
        const flameLayers=(position)=>`<div class="bha-mephisto-flames ${position}"><div class="bha-mephisto-flame-layer layer-a" style="background-image:url('${MEPHISTO_FIRE_A_ASSET}')"></div><div class="bha-mephisto-flame-layer layer-b" style="background-image:url('${MEPHISTO_FIRE_B_ASSET}')"></div><div class="bha-mephisto-flame-layer layer-c" style="background-image:url('${MEPHISTO_FIRE_C_ASSET}')"></div></div>`;
        return `<div class="bha-mephisto-darkness"></div><div class="bha-mephisto-eyes" style="background-image:url('${MEPHISTO_EYES_ASSET}')"></div><div class="bha-mephisto-hell" style="background-image:url('${MEPHISTO_HELL_ASSET}')"></div><div class="bha-mephisto-embers bha-mephisto-embers-a"></div><div class="bha-mephisto-embers bha-mephisto-embers-b"></div><div class="bha-mephisto-throne" style="background-image:url('${MEPHISTO_THRONE_ASSET}')"></div>${flameLayers('top')}${flameLayers('bottom')}`;
    }
    function ensureMephistoFonts(){
        if(typeof document==="undefined") return;
        if(document.getElementById("bhaMephistoFontLink")) return;
        const link=document.createElement("link");
        link.id="bhaMephistoFontLink";
        link.rel="stylesheet";
        link.href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Metal+Mania&family=Caveat:wght@700&display=swap";
        document.head.appendChild(link);
    }
    function renderMephistoPactSelection(root,session){
        if(!root||!session) return;
        const playerName=session.playerName||`GRACZ ${Number(session.playerIndex)+1}`;
        const offerLeftCopy=session.selectionCriterion==="low_synergy"?"Mefisto wybrał cię, bo masz obecnie najmniej synergii." : session.selectionCriterion==="last_in_queue"?"Mefisto wybrał cię, bo jesteś aktualnie ostatnio w kolejce." : session.selectionCriterion==="lowest_jeffcoins"?"Mefisto wybrał cię, bo masz obecnie najmniej JeffCoinów." : (session.selectionReason||"Mefisto wyczuł twoją słabość.");
        const forbiddenSet=mephistoForbiddenNameSet(context());
        const selectedRewards=Array.isArray(session.selectedRewards)?session.selectedRewards:[];
        const selectedSet=new Set(selectedRewards.map(card=>mephistoNormalizeName(card?.name)).filter(Boolean));
        const searchTerm=String(session.searchTerm||"").trim().toLowerCase();
        const filtered=(session.rewards||[]).filter(card=>{
            const name=String(card?.name||"");
            if(!searchTerm) return true;
            return name.toLowerCase().includes(searchTerm);
        }).sort((a,b)=>String(a?.name||"").localeCompare(String(b?.name||""),"pl",{sensitivity:"base"}));
        const suggested=filtered.filter(card=>forbiddenSet.has(mephistoNormalizeName(card?.name))).slice(0,18);
        const otherRewards=filtered.filter(card=>!forbiddenSet.has(mephistoNormalizeName(card?.name))).slice(0,30);
        
        const suggestionBlock=(list,title,section)=>!list.length?"":`<div class="bha-mephisto-picker-section"><div class="bha-mephisto-picker-heading">${escapeHtml(title)}</div><div class="bha-mephisto-picker-list">${list.map(card=>`<button type="button" class="bha-mephisto-picker-card${selectedSet.has(mephistoNormalizeName(card?.name))?" is-selected":""}" data-reward-name="${escapeHtml(card?.name||"")}"><b>${escapeHtml(card?.name||"Karta")}</b><span>${escapeHtml(card?.cost??"?")} / ${escapeHtml(card?.power??"?")}</span></button>`).join("")}</div></div>`;
        
        if(session.phase==="offer"||session.phase==="rejected"){
            const rejected=session.phase==="rejected";
            root.innerHTML=`<section class="bha-mephisto-shell bha-mephisto-shell--offer" role="dialog" aria-modal="true"><div class="bha-mephisto-scene">${mephistoSceneLayers()}<div class="bha-mephisto-world-copy"><small>${escapeHtml(offerLeftCopy)}</small><h2>${rejected?"JESZCZE TU WRÓCĘ!":"MEFISTO CIĘ KUSI"}</h2><p>${rejected?"Płomienie zamykają się, a Mefisto wycofuje tę próbę kuszenia.":"Mefisto chce skusić cię nagrodą w zamian za pewne poświęcenie."}</p>${rejected?"":`<div class="bha-mephisto-world-actions"><button type="button" data-mephisto-accept>PRZYJMIJ PAKT</button><button type="button" data-mephisto-reject>ZERWIJ UMOWĘ</button></div>`}</div></div></section>`;
            root.querySelector('[data-mephisto-accept]')?.addEventListener('click',()=>{session.phase="contract";renderMephistoPactSelection(root,session);});
            root.querySelector('[data-mephisto-reject]')?.addEventListener('click',()=>rejectMephistoPact(session,root));
            return;
        }
        
        const lineButtons=Array.from({length:2},(_,index)=>{
            const card=selectedRewards[index]||null;
            return `<div class="bha-mephisto-inline-choice${card?" is-filled":""}">
                ${card ? escapeHtml(card.name) : `<span style="opacity:0.3">brak wyboru...</span>`}
            </div>`;
        }).join("");
        
        const sacrificeLines=Array.from({length:3},(_,index)=>`<div class="bha-mephisto-sacrifice-line">${session.resultSummary?.sacrificed?.[index]?`${escapeHtml(session.resultSummary.sacrificed[index])}`:""}</div>`).join("");
        const canSign=selectedRewards.length===2;
        const pickerOpen=!session.signed;
        const resultSeal=session.resultSummary?`<div class="bha-mephisto-result-seal">Cyrograf płonie. Pakt został przypieczętowany.</div>`:"";
        
        const selectedTrayHtml=selectedRewards.length?`
            <div class="bha-mephisto-picker-selected-tray">
                <span>Wybrane (${selectedRewards.length}/2):</span>
                ${selectedRewards.map((card,idx)=>`
                    <div class="bha-mephisto-picker-selected-item">
                        <b>${escapeHtml(card.name)}</b>
                        <button type="button" data-remove-index="${idx}" title="Odznacz">×</button>
                    </div>
                `).join("")}
            </div>`:`<div class="bha-mephisto-picker-selected-tray"><span>Wybierz 2 karty z listy poniżej</span></div>`;

        root.innerHTML=`<section class="bha-mephisto-shell${session.signed?" is-signed":""}" role="dialog" aria-modal="true" aria-labelledby="bhaMephistoTitle"><div class="bha-mephisto-scene">${mephistoSceneLayers()}<div class="bha-mephisto-world-copy bha-mephisto-world-copy--contract"><small>${escapeHtml(offerLeftCopy)}</small></div><div class="bha-mephisto-contract-wrap"><div class="bha-mephisto-contract" style="background-image:url('${MEPHISTO_CONTRACT_ASSET}')"><div class="bha-mephisto-ink-name">${escapeHtml(playerName)}</div><div class="bha-mephisto-ink-reasons"></div><div class="bha-mephisto-ink-sacrifices">${sacrificeLines}</div><div class="bha-mephisto-ink-choice-block">${lineButtons}</div><div class="bha-mephisto-ink-signature">${session.signed?escapeHtml(playerName):""}</div><button type="button" class="bha-mephisto-sign bha-mephisto-sign--ink" data-mephisto-sign ${canSign&&!session.signed?"":"disabled"}>PODPISZ CYROGRAF</button>${resultSeal}${pickerOpen?`<div class="bha-mephisto-picker"><div class="bha-mephisto-picker-toolbar"><span>Wybierz 2 zakazane karty:</span><input type="text" data-mephisto-search value="${escapeHtml(session.searchTerm||"")}" placeholder="Szukaj karty..."></div>${selectedTrayHtml}<div class="bha-mephisto-picker-scroll-area">${suggestionBlock(suggested,"ZAKAZANE SKARBY","suggested")}${suggestionBlock(otherRewards,"POZOSTAŁE KARTY","other")}</div></div>`:""}</div></div></div></section>`;
        
        root.querySelector('[data-mephisto-search]')?.addEventListener('input',event=>{session.searchTerm=String(event.target?.value||"");renderMephistoPactSelection(root,session);const input=root.querySelector('[data-mephisto-search]');if(input){input.focus();input.setSelectionRange?.(String(session.searchTerm||"").length,String(session.searchTerm||"").length);}});
        
        root.querySelectorAll('[data-remove-index]').forEach(btn=>btn.addEventListener('click',()=>{
            if(session.signed) return;
            const idx=Number(btn.dataset.removeIndex);
            if(Number.isInteger(idx)){selectedRewards.splice(idx,1);session.selectedRewards=selectedRewards;renderMephistoPactSelection(root,session);}
        }));

        root.querySelectorAll('[data-reward-name]').forEach(button=>button.addEventListener('click',()=>{
            if(session.signed) return;
            const name=String(button.getAttribute('data-reward-name')||'');
            const card=(session.rewards||[]).find(item=>mephistoNormalizeName(item?.name)===mephistoNormalizeName(name));
            if(!card) return;
            const duplicateIndex=selectedRewards.findIndex(item=>mephistoNormalizeName(item?.name)===mephistoNormalizeName(card?.name));
            if(duplicateIndex>=0){
                selectedRewards.splice(duplicateIndex,1);
            } else if(selectedRewards.length < 2) {
                selectedRewards.push(card);
            }
            session.selectedRewards=selectedRewards;
            session.searchTerm="";
            renderMephistoPactSelection(root,session);
        }));
        
        root.querySelector('[data-mephisto-sign]')?.addEventListener('click',()=>resolveMephistoPactSelection(session,()=>renderMephistoPactSelection(root,session)));
    } function finalizeMephistoHeadless(session){
        const chosen=(session.selectedRewards||[]).length===2?session.selectedRewards:sampleRandom(session.rewards,2);session.selectedRewards=[...chosen];return executeMephistoPact(session);
    }
    function executeMephistoPact(session){
        const ctx=context(),
              eligible=mephistoEligibleSacrificeIndexes(session.playerIndex,ctx);
        
        if(eligible.length<5) return {ok:false,reason:"insufficient_payload"};
        
        const chosenIndexes=sampleRandom(eligible,5).sort((a,b)=>b-a);
        const curseIndexes=chosenIndexes.slice(0,3);
        const rewardIndexes=chosenIndexes.slice(3,5);
        
        const selected=(session.selectedRewards||[]).slice(0,2);
        const vanillaPool=sampleRandom(mephistoNoAbilityTemplates(ctx),3);
        
        if(selected.length<2||vanillaPool.length<3) return {ok:false,reason:"insufficient_payload"};
        
        const sacrificed=[],vanilla=[],granted=[];
        
        curseIndexes.forEach((deckIndex,offset)=>{
            const template=vanillaPool[offset];
            const replacement=host()?.createCard?.(template,{anomalyId:"mephisto_pact",sourceEvent:"mephisto_pact_curse"})||clone(template);
            const result=host()?.replaceDeckCard?.(Number(session.playerIndex),Number(deckIndex),replacement,{reason:"mephisto_pact",anomalyId:"mephisto_pact",eventType:"mephisto_pact_curse",origin:"black_hole_anomaly",sourceEvent:"mephisto_pact_curse",graveyardCategory:"burned",recoverable:false,graveyardMetadata:{mephisto:true,signedBy:session.playerName||null},data:{curseReplacementName:template?.name||null}})||{ok:false};
            if(result?.ok){
                sacrificed.push(result.previousCard?.name||null);
                vanilla.push(result.resultCard?.name||template?.name||null);
            }
        });
        
        rewardIndexes.forEach((deckIndex,offset)=>{
            const template=selected[offset];
            const reward=host()?.createCard?.(template,{anomalyId:"mephisto_pact",sourceEvent:"mephisto_pact_reward"})||clone(template);
            const result=host()?.replaceDeckCard?.(Number(session.playerIndex),Number(deckIndex),reward,{reason:"mephisto_pact",anomalyId:"mephisto_pact",eventType:"mephisto_pact_reward",origin:"black_hole_anomaly",sourceEvent:"mephisto_pact_reward",graveyardCategory:"burned",recoverable:false,graveyardMetadata:{mephisto:true,signedBy:session.playerName||null},data:{rewardReplacementName:template?.name||null}})||{ok:false};
            if(result?.ok){
                sacrificed.push(result.previousCard?.name||null);
                granted.push(result.resultCard?.name||template?.name||null);
            }
        });
        
        const record={playerIndex:Number(session.playerIndex),playerName:session.playerName||null,selectionCriterion:session.selectionCriterion||null,selectionReason:session.selectionReason||null,selectedRewards:selected.map(card=>card?.name||null),sacrificed,vanilla,granted,accepted:true,temptationNumber:Number(session.temptationNumber||1),packNumber:Number(ctx?.packStartIndex||0)+1,pickNumber:Number(ctx?.currentPickIndex||0)+1,globalPickCount:mephistoGlobalPickCount(ctx),at:new Date().toISOString()};
        state.ongoing.temptationsDone=Math.max(0,Number(state.ongoing?.temptationsDone||0))+1;state.ongoing.lastTriggerPickCount=mephistoGlobalPickCount(ctx);state.ongoing.lastPlayerIndex=Number(session.playerIndex);state.ongoing.lastSelectionCriterion=session.selectionCriterion||null;state.ongoing.history=Array.isArray(state.ongoing.history)?state.ongoing.history:[];state.ongoing.history.push(clone(record));host()?.log?.("mephisto_pact_signed",{packNumber:record.packNumber,reason:"mephisto_pact",data:clone(record)});host()?.renderDecks?.();return {ok:true,record};
    }
    function rejectMephistoPact(session,root){
        if(!session||session.signed)return false;const ctx=context();const record={playerIndex:Number(session.playerIndex),playerName:session.playerName||null,selectionCriterion:session.selectionCriterion||null,selectionReason:session.selectionReason||null,accepted:false,temptationNumber:Number(session.temptationNumber||1),packNumber:Number(ctx?.packStartIndex||0)+1,pickNumber:Number(ctx?.currentPickIndex||0)+1,globalPickCount:mephistoGlobalPickCount(ctx),at:new Date().toISOString()};state.ongoing.temptationsDone=Math.max(0,Number(state.ongoing?.temptationsDone||0))+1;state.ongoing.lastTriggerPickCount=mephistoGlobalPickCount(ctx);state.ongoing.lastPlayerIndex=Number(session.playerIndex);state.ongoing.lastSelectionCriterion=session.selectionCriterion||null;state.ongoing.history=Array.isArray(state.ongoing.history)?state.ongoing.history:[];state.ongoing.history.push(clone(record));host()?.log?.("mephisto_pact_rejected",{packNumber:record.packNumber,reason:"mephisto_pact",data:clone(record)});session.phase="rejected";renderMephistoPactSelection(root,session);
        if(root) root.classList.add("is-leaving");
        mephistoPactCloseTimer=setTimeout(()=>{clearMephistoPactModal();setLocked(false);session.resume?.();refreshRuntimeInfo();},1450);return true;
    }
    function resolveMephistoPactSelection(session,rerender){
        if(session.signed)return false;
        const result=executeMephistoPact(session);
        if(!result?.ok)return false;
        session.signed=true;
        session.resultSummary={sacrificed:result.record.sacrificed,vanilla:result.record.vanilla,granted:result.record.granted};
        rerender?.();
        const root = typeof document!=="undefined"?document.getElementById("bhaMephistoPactModal"):null;
        if(root) {
            // Wydłużone czasy na podziwianie krwawego podpisu i potężny ogień wchodzący z góry i z dołu
            setTimeout(() => {
                root.classList.add("is-consumed-by-fire");
                setTimeout(() => {
                    root.classList.add("is-leaving");
                    mephistoPactCloseTimer=setTimeout(()=>{
                        clearMephistoPactModal();
                        host()?.render?.();
                        setLocked(false);
                        session.resume?.();
                        refreshRuntimeInfo();
                    }, 2200);
                }, 2000);
            }, 3800);
        }
        return true;
    }
    function openMephistoPactModal(session,resume){
        if(!session)return false;clearMephistoPactModal({keepPrompt:true});state.ongoing.activePrompt=true;session.resume=resume;session.selectedRewards=[];session.signed=false;session.phase="offer";
        if(typeof document==="undefined"){session.phase="contract";const result=finalizeMephistoHeadless(session);state.ongoing.activePrompt=false;host()?.render?.();setLocked(false);resume?.();refreshRuntimeInfo();return Boolean(result?.ok);}
        ensureMephistoFonts();setLocked(true);const root=document.createElement('div');root.id='bhaMephistoPactModal';root.className='bha-mephisto-modal';document.body.appendChild(root);renderMephistoPactSelection(root,session);requestAnimationFrame(()=>root.classList.add('is-active'));mephistoPactStageTimer=setTimeout(()=>root.classList.add('is-revealed'),2850);return true;
    }
    function resolveMephistoPostPick(payload={},resume){
        const ctx=context();if(!shouldTriggerMephistoPact(ctx))return false;const target=chooseMephistoTargetPlayer(ctx);if(!target)return false;const rewards=mephistoLegalRewardTemplatesForPlayer(target.playerIndex,ctx);if(rewards.length<2)return false;const session={playerIndex:Number(target.playerIndex),playerName:target.playerName||ctx?.players?.[Number(target.playerIndex)]||`GRACZ ${Number(target.playerIndex)+1}`,rewards,selectionCriterion:target.selectionCriterion,selectionReason:target.selectionReason,temptationNumber:Number(state.ongoing?.temptationsDone||0)+1,triggerPayload:clone(payload||null)};return openMephistoPactModal(session,resume);
    }

    function cosmicTreasureActive(){
        return Boolean(state.enabled&&state.ongoing?.id==="cosmic_treasure"&&state.ongoing?.triggered&&!state.ongoing?.found);
    }
    function isCosmicTreasureCard(card){
        return Boolean(card?.anomalyCosmicTreasure===true);
    }
    function markCosmicTreasureCard(card,packIndex,templateName,hint){
        if(!card||typeof card!=="object") return card;
        card.anomalyCosmicTreasure=true;
        card.anomalyCosmicTreasurePackIndex=Number(packIndex);
        card.anomalyCosmicTreasureTemplateName=templateName||card?.name||null;
        card.anomalyCosmicTreasureHint=hint||null;
        return card;
    }
    function injectCosmicTreasureIntoPack(ctx=context()){
        if(!cosmicTreasureActive()) return {ok:false,reason:"inactive"};
        const ongoing=state.ongoing;
        const packIndex=Number(ctx?.packStartIndex||0);
        if(packIndex!==Number(ongoing.pendingTreasurePackIndex)) return {ok:false,reason:"wrong_pack"};
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const existing=pack.find(card=>isCosmicTreasureCard(card));
        if(existing){
            ongoing.activeTreasurePackIndex=packIndex;
            return {ok:true,reused:true,card:existing};
        }
        const template=findCosmicTreasureTemplateByName(ongoing.treasureTemplateName,ctx);
        if(!template) return {ok:false,reason:"missing_template"};
        const replaceable=replaceablePackIndexes(ctx);
        if(!replaceable.length) return {ok:false,reason:"no_replaceable_slot"};
        const targetIndex=chooseUniform(replaceable)||replaceable[0];
        const card=host()?.createCard?.(template,{sourceEvent:"cosmic_treasure_hidden_card",anomalyId:"cosmic_treasure"})||clone(template);
        if(!card) return {ok:false,reason:"create_failed"};
        markCosmicTreasureCard(card,packIndex,template?.name||null,ongoing.treasureHint||null);
        const result=host()?.replacePackAtIndexes?.([Number(targetIndex)],[card],{reason:"cosmic_treasure_inject",anomalyId:"cosmic_treasure",archivePrevious:true,recoverable:true,data:{packIndex,treasureTemplateName:template?.name||null,treasureHint:ongoing.treasureHint||null}})||{ok:false};
        if(result?.ok){
            ongoing.activeTreasurePackIndex=packIndex;
            ongoing.pendingTreasurePackIndex=packIndex;
            host()?.log?.("cosmic_treasure_hidden",{packNumber:packIndex+1,reason:"cosmic_treasure",data:{packIndex,index:Number(targetIndex),cardName:card?.name||null,cardInstanceId:card?.instanceId||null}});
            return {ok:true,index:Number(targetIndex),card};
        }
        return {ok:false,reason:result?.reason||"replace_failed"};
    }
    function carryForwardCosmicTreasure(ctx=context()){
        if(!cosmicTreasureActive()) return null;
        const ongoing=state.ongoing;
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        if(!pack.some(card=>isCosmicTreasureCard(card))) return null;
        const currentPackIndex=Number(ctx?.packStartIndex||0);
        const nextPackIndex=currentPackIndex+1;
        if(nextPackIndex>=Number(state.totalPacks||6)){
            ongoing.pendingTreasurePackIndex=null;
            ongoing.activeTreasurePackIndex=currentPackIndex;
            host()?.log?.("cosmic_treasure_lost_last_pack",{packNumber:currentPackIndex+1,reason:"cosmic_treasure",data:{currentPackIndex}});
            return {ok:false,reason:"last_pack"};
        }
        ongoing.pendingTreasurePackIndex=nextPackIndex;
        ongoing.activeTreasurePackIndex=null;
        ongoing.treasureMoveHistory=Array.isArray(ongoing.treasureMoveHistory)?ongoing.treasureMoveHistory:[];
        ongoing.treasureMoveHistory.push({fromPackIndex:currentPackIndex,toPackIndex:nextPackIndex,at:new Date().toISOString()});
        host()?.log?.("cosmic_treasure_carried_forward",{packNumber:currentPackIndex+1,reason:"cosmic_treasure",data:{fromPackIndex:currentPackIndex,toPackIndex:nextPackIndex}});
        return {ok:true,fromPackIndex:currentPackIndex,toPackIndex:nextPackIndex};
    }
    function getCosmicTreasureLegalRewardTemplates(playerIndex,deckIndex,ctx=context()){
        const legal=legalCosmicTreasureTemplates(ctx);
        const deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        const normalizedDeckIndex=Number(deckIndex);
        const replacing=Number.isInteger(normalizedDeckIndex)&&normalizedDeckIndex>=0?deck[normalizedDeckIndex]||null:null;
        const occupied=new Set(deck.map(card=>normalizeName(card?.name)).filter(Boolean));
        if(replacing) occupied.delete(normalizeName(replacing?.name));
        return legal.filter(card=>!occupied.has(normalizeName(card?.name)));
    }
    function getCosmicTreasureRewardPool(playerIndex,ctx=context()){
        return getCosmicTreasureLegalRewardTemplates(playerIndex,-1,ctx);
    }
    function autoResolveCosmicTreasureReward(playerIndex,payload={},resume){
        const ctx=context();
        const deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        const targetIndex=deck.findIndex((card,index)=>host()?.canReplaceDeckCard?.(Number(playerIndex),index,{reason:"cosmic_treasure_reward",anomalyId:"cosmic_treasure"})!==false);
        if(targetIndex<0){resume?.();return true;}
        const legal=getCosmicTreasureLegalRewardTemplates(playerIndex,targetIndex,ctx);
        const template=legal[0]||findCosmicTreasureTemplateByName(state.ongoing?.treasureTemplateName,ctx);
        if(!template){resume?.();return true;}
        const instance=host()?.createCard?.(template,{sourceEvent:"cosmic_treasure_reward",anomalyId:"cosmic_treasure"})||clone(template);
        const result=host()?.replaceDeckCard?.(Number(playerIndex),Number(targetIndex),instance,{anomalyId:"cosmic_treasure",reason:"cosmic_treasure_reward",eventType:"black_hole_anomaly_cosmic_treasure_reward",data:{rewardCardName:template?.name||null}})||{ok:false};
        if(context()?.economyEnabled&&state.ongoing&&!state.ongoing.economyBonusGranted){
            const credit=host()?.credit?.(Number(playerIndex),5,{kind:"anomaly",reason:"cosmic_treasure",packNumber:Number(context()?.packStartIndex||0)+1,data:{anomalyId:"cosmic_treasure"}})||{ok:false};
            if(credit?.ok!==false){
                state.ongoing.economyBonusGranted=true;
                host()?.playJeffCoinAward?.(Number(playerIndex),5,{source:"cosmic_treasure",label:"KOSMICZNY SKARB"});
            }
        }
        if(state.ongoing){
            state.ongoing.rewardClaimed=true;
            state.ongoing.rewardSummary={playerIndex:Number(playerIndex),replacedCardName:deck[targetIndex]?.name||null,rewardCardName:template?.name||null,automatic:true};
        }
        host()?.render?.();
        resume?.();
        return true;
    }
    function buildCosmicTreasureCardMeta(card){
        if(!card) return "";
        const cost=Number(card?.cost),power=Number(card?.power);
        const bits=[];
        if(Number.isFinite(cost)) bits.push(`Koszt ${cost}`);
        if(Number.isFinite(power)) bits.push(`Siła ${power}`);
        return bits.join(" • ");
    }
    function openCosmicTreasureMapModal(done){
        if(typeof document==="undefined"){done?.();return true;}
        document.getElementById("bhaCosmicTreasureMapModal")?.remove?.();
        const ongoing=state.ongoing||{};
        const root=document.createElement("div");
        root.id="bhaCosmicTreasureMapModal";
        root.className="bha-cosmic-map-modal bha-cosmic-map-modal--14b";
        root.setAttribute("aria-hidden","true");
        const hint=escapeHtml(String(ongoing.treasureHint||"WSKAZÓWKA NIEZNANA"));
        // Asset mapy zawiera już poprawny stały napis: SKARBU STRZEŻE KARTA:
        root.innerHTML=`<div class="bha-cosmic-map-backdrop"></div>
            <div class="bha-cosmic-map-scene" role="dialog" aria-modal="true" aria-labelledby="bhaCosmicTreasureTitle">
                <div class="bha-cosmic-map-caption">
                    <img src="draft-assets/bha_cosmic_treasure_chest.webp" alt="" aria-hidden="true">
                    <div><h2 id="bhaCosmicTreasureTitle">KOSMICZNY SKARB ZOSTAŁ UKRYTY W GALAKTYCE DRAFTU!</h2><p>ZAPAMIĘTAJ WSKAZÓWKĘ</p></div>
                </div>
                <div class="bha-cosmic-map-art bha-cosmic-map-art--14b">
                    <img src="draft-assets/bha_cosmic_treasure_map.webp" alt="Mapa Kosmicznego Skarbu">
                    <button type="button" class="bha-cosmic-map-x" aria-label="Zamknij mapę">×</button>
                    <div class="bha-cosmic-map-hint bha-cosmic-map-hint--14b"><strong>${hint}</strong></div>
                </div>
            </div>`;
        document.body.appendChild(root);
        let closed=false;
        const close=()=>{
            if(closed) return;
            closed=true;
            root.classList.add("is-folding");
            root.classList.remove("is-open");
            root.setAttribute("aria-hidden","true");
            setTimeout(()=>{root.remove();done?.();},560);
        };
        root.querySelector(".bha-cosmic-map-x")?.addEventListener("click",close);
        requestAnimationFrame(()=>{root.setAttribute("aria-hidden","false");root.classList.add("is-open");});
        return true;
    }
    function getCosmicTreasurePickOriginRect(payload={}){
        if(typeof document==="undefined") return null;
        const instanceId=String(payload?.sourceCard?.instanceId||payload?.card?.instanceId||"");
        const buttons=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")];
        const byId=instanceId?buttons.find(button=>String(button?.dataset?.cardInstanceId||"")===instanceId):null;
        const byIndex=buttons.find(button=>Number(button?.dataset?.packIndex)===Number(payload?.packIndex));
        const node=byId||byIndex||document.getElementById("pack");
        return node?.getBoundingClientRect?.()||null;
    }
    function playCosmicTreasureDiscoveryFx(payload={},done){
        if(typeof document==="undefined"){done?.();return true;}
        document.getElementById("bhaCosmicTreasureDiscoveryFx")?.remove?.();
        const origin=payload?.__originRect||getCosmicTreasurePickOriginRect(payload);
        const economyEnabled=Boolean(context()?.economyEnabled);
        const root=document.createElement("div");
        root.id="bhaCosmicTreasureDiscoveryFx";
        root.className="bha-cosmic-discovery-fx";
        root.setAttribute("aria-hidden","true");
        const coins=economyEnabled
            ? Array.from({length:9},(_,i)=>`<img src="draft-assets/jeffcoin.png" alt="" class="bha-cosmic-discovery-coin" style="--i:${i}">`).join("")
            : "";
        const sparks=Array.from({length:16},(_,i)=>`<i class="bha-cosmic-discovery-spark" style="--i:${i}"></i>`).join("");
        root.innerHTML=`<div class="bha-cosmic-discovery-dim"></div><div class="bha-cosmic-discovery-stage"><img class="bha-cosmic-discovery-chest" src="draft-assets/bha_cosmic_treasure_chest.webp" alt="Kosmiczny Skarb"><div class="bha-cosmic-discovery-coins">${coins}</div><div class="bha-cosmic-discovery-sparks">${sparks}</div><div class="bha-cosmic-discovery-title">ODNALAZŁEŚ ZAGINIONY SKARB!</div></div>`;
        document.body.appendChild(root);
        const chest=root.querySelector(".bha-cosmic-discovery-chest");
        const vw=window.innerWidth||1280, vh=window.innerHeight||720;
        const chestWidth=Math.max(210,Math.min(410,vw*.34));
        const originX=origin?origin.left+origin.width/2:vw/2;
        const originY=origin?origin.top+origin.height/2:vh*.56;
        const targetX=vw/2,targetY=vh*.46;
        chest.style.width=`${chestWidth}px`;
        chest.style.left="0";chest.style.top="0";
        chest.animate([
            {transform:`translate(${originX-chestWidth/2}px,${originY-chestWidth/2}px) scale(.16)`,opacity:.1,filter:"brightness(.8) drop-shadow(0 0 0 rgba(255,206,92,0))"},
            {offset:.34,transform:`translate(${originX-chestWidth/2}px,${originY-chestWidth/2-24}px) scale(.34)`,opacity:1,filter:"brightness(1.25) drop-shadow(0 0 22px rgba(255,206,92,.55))"},
            {transform:`translate(${targetX-chestWidth/2}px,${targetY-chestWidth/2}px) scale(1.08)`,opacity:1,filter:"brightness(1.12) drop-shadow(0 24px 42px rgba(0,0,0,.44)) drop-shadow(0 0 48px rgba(255,198,74,.52))"}
        ],{duration:1180,easing:"cubic-bezier(.16,.8,.24,1)",fill:"forwards"});
        requestAnimationFrame(()=>root.classList.add("is-live"));
        setTimeout(()=>root.classList.add("show-loot"),520);
        setTimeout(()=>root.classList.add("show-title"),820);
        setTimeout(()=>root.classList.add("is-leaving"),1900);
        setTimeout(()=>{root.remove();done?.();},2240);
        return true;
    }
    function buildCosmicTreasureRewardRow(card,className=""){
        return `<b>${escapeHtml(card?.name||"Karta")}</b><small>${escapeHtml(buildCosmicTreasureCardMeta(card)||"Brak statystyk")}</small>`;
    }
    function openCosmicTreasureRewardModal(playerIndex,payload={},resume){
        if(typeof document==="undefined") return autoResolveCosmicTreasureReward(playerIndex,payload,resume);
        const ctx=context();
        const deck=Array.isArray(ctx?.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        if(!deck.length) return autoResolveCosmicTreasureReward(playerIndex,payload,resume);
        document.getElementById("bhaCosmicTreasureRewardModal")?.remove?.();
        const root=document.createElement("div");
        root.id="bhaCosmicTreasureRewardModal";
        root.className="bha-cosmic-reward-modal bha-cosmic-reward-modal--14b";
        root.setAttribute("aria-hidden","true");
        root.innerHTML=`<div class="bha-cosmic-reward-backdrop"></div><div class="bha-cosmic-paper" role="dialog" aria-modal="true" aria-label="Kosmiczny Skarb"><img class="bha-cosmic-paper-bg" src="draft-assets/bha_cosmic_treasure_reward.webp" alt=""><div class="bha-cosmic-paper-content"></div><div class="bha-cosmic-final-flare" aria-hidden="true"></div></div>`;
        document.body.appendChild(root);
        const paper=root.querySelector(".bha-cosmic-paper");
        const content=root.querySelector(".bha-cosmic-paper-content");
        const selection={rewardName:null,deckIndex:null};
        const transitionTo=(renderer)=>{
            content.classList.add("is-changing");
            setTimeout(()=>{renderer();content.classList.remove("is-changing");content.classList.add("is-arriving");requestAnimationFrame(()=>requestAnimationFrame(()=>content.classList.remove("is-arriving")));},190);
        };
        const renderTreasureStage=()=>{
            content.className="bha-cosmic-paper-content bha-cosmic-paper-content--treasure";
            content.innerHTML=`<button type="button" class="bha-cosmic-treasure-click" aria-label="Otwórz wybór nagrody"><img src="draft-assets/bha_cosmic_treasure_chest.webp" alt="Kosmiczna skrzynia"><span>KLIKNIJ SKARB</span></button>${ctx?.economyEnabled?`<div class="bha-cosmic-paper-jc"><img src="draft-assets/jeffcoin.png" alt="">+5 JC</div>`:""}`;
            content.querySelector(".bha-cosmic-treasure-click")?.addEventListener("click",()=>transitionTo(renderRewardChoiceStage));
        };
        const renderRewardChoiceStage=()=>{
            content.className="bha-cosmic-paper-content bha-cosmic-paper-content--choice";
            content.innerHTML=`<img class="bha-cosmic-corner-chest" src="draft-assets/bha_cosmic_treasure_chest.webp" alt=""><h2>WYBIERZ SKARB</h2><p>Wpisz nazwę karty, którą chcesz zabrać z galaktyki.</p><label class="bha-cosmic-ink-search"><input type="search" autocomplete="off" placeholder="Wpisz nazwę karty..."><span></span></label><div class="bha-cosmic-ink-results" aria-live="polite"></div>`;
            const input=content.querySelector("input");
            const results=content.querySelector(".bha-cosmic-ink-results");
            const pool=getCosmicTreasureRewardPool(playerIndex,ctx);
            const renderResults=()=>{
                const term=String(input?.value||"").trim().toLocaleLowerCase("pl");
                if(term.length<1){results.innerHTML='<em>Wpisz nazwę, aby przeszukać legalną pulę kart.</em>';return;}
                const filtered=pool.filter(card=>String(card?.name||"").toLocaleLowerCase("pl").includes(term)).slice(0,12);
                if(!filtered.length){results.innerHTML='<em>Nie znaleziono legalnej karty o takiej nazwie.</em>';return;}
                results.innerHTML="";
                filtered.forEach(card=>{
                    const row=document.createElement("button");
                    row.type="button";
                    row.className="bha-cosmic-ink-row";
                    row.innerHTML=buildCosmicTreasureRewardRow(card);
                    row.addEventListener("click",()=>{selection.rewardName=card?.name||null;transitionTo(renderDeckChoiceStage);});
                    results.appendChild(row);
                });
            };
            input?.addEventListener("input",renderResults);
            input?.addEventListener("keydown",event=>{
                if(event.key!=="Enter") return;
                const term=String(input?.value||"").trim().toLocaleLowerCase("pl");
                const exact=pool.find(card=>String(card?.name||"").toLocaleLowerCase("pl")===term);
                if(exact){event.preventDefault();selection.rewardName=exact.name;transitionTo(renderDeckChoiceStage);}
            });
            renderResults();
            setTimeout(()=>input?.focus?.(),220);
        };
        const renderDeckChoiceStage=()=>{
            const chosen=findCosmicTreasureTemplateByName(selection.rewardName,ctx);
            content.className="bha-cosmic-paper-content bha-cosmic-paper-content--deck";
            content.innerHTML=`<img class="bha-cosmic-corner-chest" src="draft-assets/bha_cosmic_treasure_chest.webp" alt=""><h2>WYBIERZ KARTĘ DO PODMIANY</h2><p class="bha-cosmic-chosen-line">Twój skarb: <strong>${escapeHtml(chosen?.name||selection.rewardName||"Karta")}</strong></p><div class="bha-cosmic-ink-deck"></div>`;
            const list=content.querySelector(".bha-cosmic-ink-deck");
            deck.forEach((card,index)=>{
                const enabled=host()?.canReplaceDeckCard?.(Number(playerIndex),index,{reason:"cosmic_treasure_reward",anomalyId:"cosmic_treasure"})!==false;
                const row=document.createElement("button");
                row.type="button";
                row.className="bha-cosmic-ink-row bha-cosmic-ink-row--deck";
                row.disabled=!enabled;
                row.innerHTML=buildCosmicTreasureRewardRow(card);
                row.addEventListener("click",()=>finalizeReward(index));
                list.appendChild(row);
            });
        };
        const finishAndClose=()=>{
            root.classList.add("is-finalizing");
            const flare=root.querySelector(".bha-cosmic-final-flare");
            const coinMarkup=Array.from({length:ctx?.economyEnabled?8:0},(_,i)=>`<img src="draft-assets/jeffcoin.png" alt="" style="--i:${i}">`).join("");
            flare.innerHTML=`<strong>SKARB ODEBRANY!</strong>${coinMarkup}`;
            setTimeout(()=>root.classList.add("is-folding"),720);
            setTimeout(()=>{root.remove();resume?.();},1280);
        };
        const finalizeReward=(deckIndex)=>{
            const template=findCosmicTreasureTemplateByName(selection.rewardName,ctx);
            if(!template||!Number.isInteger(Number(deckIndex))) return;
            const previousCard=deck[Number(deckIndex)]||null;
            const reward=host()?.createCard?.(template,{sourceEvent:"cosmic_treasure_reward",anomalyId:"cosmic_treasure"})||clone(template);
            const result=host()?.replaceDeckCard?.(Number(playerIndex),Number(deckIndex),reward,{anomalyId:"cosmic_treasure",reason:"cosmic_treasure_reward",eventType:"black_hole_anomaly_cosmic_treasure_reward",data:{rewardCardName:template?.name||null,playerIndex:Number(playerIndex)}})||{ok:false};
            if(result?.ok===false) return;
            selection.deckIndex=Number(deckIndex);
            if(ctx?.economyEnabled&&state.ongoing&&!state.ongoing.economyBonusGranted){
                const credit=host()?.credit?.(Number(playerIndex),5,{kind:"anomaly",reason:"cosmic_treasure",packNumber:Number(context()?.packStartIndex||0)+1,data:{anomalyId:"cosmic_treasure"}})||{ok:false};
                if(credit?.ok!==false){
                    state.ongoing.economyBonusGranted=true;
                    host()?.playJeffCoinAward?.(Number(playerIndex),5,{source:"cosmic_treasure",label:"KOSMICZNY SKARB"});
                }
            }
            if(state.ongoing){
                state.ongoing.rewardClaimed=true;
                state.ongoing.rewardSummary={playerIndex:Number(playerIndex),replacedCardName:previousCard?.name||null,rewardCardName:template?.name||null,automatic:false};
            }
            host()?.log?.("cosmic_treasure_reward_claimed",{packNumber:Number(context()?.packStartIndex||0)+1,reason:"cosmic_treasure",data:clone(state.ongoing?.rewardSummary||{})});
            host()?.render?.();
            finishAndClose();
        };
        renderTreasureStage();
        requestAnimationFrame(()=>{root.setAttribute("aria-hidden","false");root.classList.add("is-open");});
        return true;
    }
    function resolveCosmicTreasurePostPick(payload={},resume){
        if(!state.enabled||state.ongoing?.id!=="cosmic_treasure"||!state.ongoing?.triggered||state.ongoing?.found) return false;
        const sourceCard=payload?.sourceCard||payload?.card||payload?.resultCard||null;
        if(!isCosmicTreasureCard(sourceCard)) return false;
        const playerIndex=Number(payload?.playerIndex);
        state.ongoing.found=true;
        state.ongoing.foundByPlayerIndex=playerIndex;
        state.ongoing.foundAtPackIndex=Number(context()?.packStartIndex||0);
        state.ongoing.activeTreasurePackIndex=null;
        state.ongoing.pendingTreasurePackIndex=null;
        host()?.log?.("cosmic_treasure_found",{packNumber:Number(context()?.packStartIndex||0)+1,reason:"cosmic_treasure",data:{playerIndex,playerName:context()?.players?.[playerIndex]||null,cardName:sourceCard?.name||null,cardInstanceId:sourceCard?.instanceId||null}});
        setLocked(true);
        const originPayload={...payload,sourceCard};
        const originRect=getCosmicTreasurePickOriginRect(originPayload);
        host()?.render?.();
        playCosmicTreasureDiscoveryFx({...originPayload,__originRect:originRect},()=>openCosmicTreasureRewardModal(playerIndex,payload,()=>{setLocked(false);resume?.();}));
        return true;
    }

    function grantShootingStarQueuePriority(playerIndex,ctx=context()){
        if(!shootingStarsActive()) return {ok:false,reason:"Spadające Gwiazdy nie są aktywne."};
        const p=Number(playerIndex),players=Array.isArray(ctx.players)?ctx.players:[],order=Array.isArray(ctx.pickOrder)?ctx.pickOrder:[];
        const roundSize=players.length,current=Number(ctx.currentPickIndex||0),packIndex=Number(ctx.packStartIndex||0);
        if(!Number.isInteger(p)||!roundSize) return {ok:false,reason:"Nie można ustalić kolejki."};
        // Niewidzialna Kolejka jest zamrożona na całą paczkę. Priorytet z Gwiazdy przechodzi na następną paczkę.
        if(isQueueFrozen(ctx)){
            const targetPackIndex=packIndex+1;
            if(targetPackIndex>=Number(state.totalPacks||6)) return {ok:false,reason:"To ostatnia kolejka draftu."};
            state.ongoing.pendingQueuePriority={playerIndex:p,targetPackIndex,createdAtPackIndex:packIndex};
            host()?.log?.("shooting_star_queue_priority_pending",{packNumber:packIndex+1,reason:"shooting_stars",data:{playerIndex:p,targetPackIndex,blockedBy:"invisible_queue"}});
            return {ok:true,mode:"next_pack",targetPackIndex,blockedBy:"invisible_queue"};
        }
        if(current<roundSize){
            const from=order.findIndex((entry,index)=>index>=roundSize&&Number(entry)===p);
            if(from>=0){
                const [moved]=order.splice(from,1);order.splice(roundSize,0,moved);
                host()?.log?.("shooting_star_queue_priority",{packNumber:packIndex+1,reason:"shooting_stars",data:{playerIndex:p,from,to:roundSize,mode:"next_round"}});
                return {ok:true,mode:"next_round",packIndex,from,to:roundSize};
            }
        }
        const targetPackIndex=packIndex+1;
        if(targetPackIndex>=Number(state.totalPacks||6)) return {ok:false,reason:"To ostatnia kolejka draftu."};
        state.ongoing.pendingQueuePriority={playerIndex:p,targetPackIndex,createdAtPackIndex:packIndex};
        host()?.log?.("shooting_star_queue_priority_pending",{packNumber:packIndex+1,reason:"shooting_stars",data:{playerIndex:p,targetPackIndex}});
        return {ok:true,mode:"next_pack",targetPackIndex};
    }
    function applyPendingQueuePriority(packContext={}){
        const pending=state.ongoing?.pendingQueuePriority;
        if(!shootingStarsActive()||!pending) return false;
        const packIndex=Number(packContext?.packStartIndex??context()?.packStartIndex??0);
        if(packIndex!==Number(pending.targetPackIndex)) return false;
        const order=Array.isArray(packContext?.pickOrder)?packContext.pickOrder:context()?.pickOrder;
        if(!Array.isArray(order)||!order.length) return false;
        const from=order.findIndex(entry=>Number(entry)===Number(pending.playerIndex));
        if(from<0) return false;
        const [moved]=order.splice(from,1);order.unshift(moved);
        state.ongoing.pendingQueuePriority=null;
        host()?.log?.("shooting_star_queue_priority_applied",{packNumber:packIndex+1,reason:"shooting_stars",data:{playerIndex:Number(pending.playerIndex),from,to:0,mode:"next_pack"}});
        return true;
    }
    function getSuperpowerInterference(){
        if(!state.enabled) return {blocked:false};
        const active=state.active;
        if(!active?.triggered) return {blocked:false};
        if(String(active.superpowerPolicy||"").toLowerCase()==="allow") return {blocked:false};
        return {blocked:true,anomalyId:active.id,name:active.name||getDefinition(active.id)?.name||"Anomalia",reason:"Energia aktywnej Anomalii zakłóca działanie Supermocy na tę paczkę."};
    }
    function blocksSuperpowers(){return Boolean(getSuperpowerInterference().blocked);}
    function getSuperpowerBlockReason(){return getSuperpowerInterference().reason||"Energia aktywnej Anomalii zakłóca działanie Supermocy w tej paczce.";}

    function effectGoldenMeteor(){
        const ctx=context();let credited=0;
        (ctx.players||state.draftPlayers||[]).forEach((_,playerIndex)=>{const result=host()?.credit?.(playerIndex,5,{kind:"anomaly",reason:"golden_meteor",packNumber:Number(ctx.packStartIndex||0)+1,data:{anomalyId:"golden_meteor"}});if(result?.ok) credited++;});
        return {creditedPlayers:credited,amountPerPlayer:5};
    }
    function effectDoubleTrouble(){
        const result=host()?.activateDoubleTrouble?.()||{ok:false,reason:"host_unavailable"};
        return {doubleTrouble:true,...result};
    }
    function effectCosmicRain(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const cards=host()?.generateCards?.(5,{excludeCards:pack,origin:"black_hole_anomaly",sourceEvent:"cosmic_rain"})||[];
        cards.forEach((card,index)=>{if(card&&typeof card==="object"){card.anomalyCosmicRain=true;card.anomalyCosmicRainArrivalIndex=index;}});
        const appendResult=host()?.appendPack?.(cards,{reason:"cosmic_rain",anomalyId:"cosmic_rain"})||{ok:false,added:0};
        return {requested:5,added:Number(appendResult.added??cards.length)||0,cardNames:cards.map(card=>card?.name).filter(Boolean)};
    }
    function normalizeName(value){return String(value||"").trim().toLowerCase();}
    function getArchetypeGravityTagCatalog(){
        const raw=host()?.getTagCatalog?.()||{};
        const categories=["mechanicFamilies","deckArchetypes"];
        const seen=new Set(),out=[];
        categories.forEach(category=>{
            (Array.isArray(raw?.[category])?raw[category]:[]).forEach(tag=>{
                const id=String(tag?.id||"").trim().toLowerCase();
                if(!id||seen.has(id)) return;
                seen.add(id);
                out.push({id,name:String(tag?.name||id),category});
            });
        });
        return out;
    }
    function archetypeGravityOccupiedNames(ctx=context()){
        return new Set([
            ...(Array.isArray(ctx.currentPack)?ctx.currentPack:[]),
            ...(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean)
        ].map(card=>normalizeName(card?.name)).filter(Boolean));
    }
    function archetypeGravityTagCandidates(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const decks=(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        const occupied=new Set([...pack,...decks].map(card=>normalizeName(card?.name)).filter(Boolean));
        const db=Array.isArray(ctx.cardDatabase)?ctx.cardDatabase:[];
        const candidates=getArchetypeGravityTagCatalog().map(tag=>{
            const existingCount=pack.reduce((total,card)=>{
                const tags=Array.isArray(card?.tags)?card.tags:[];
                return total+(tags.some(value=>String(value||"").trim().toLowerCase()===tag.id)?1:0);
            },0);
            const availableCount=db.reduce((total,card)=>{
                const name=normalizeName(card?.name);
                if(!name||occupied.has(name)||card?.joker||isBannedTemplate(card,ctx)) return total;
                const tags=Array.isArray(card?.tags)?card.tags:[];
                return total+(tags.some(value=>String(value||"").trim().toLowerCase()===tag.id)?1:0);
            },0);
            return {...tag,count:existingCount+availableCount,existingCount,availableCount};
        }).filter(tag=>tag.count>0);
        if(!candidates.length) return [];
        const strong=candidates.filter(tag=>tag.count>=Math.min(Math.max(2,pack.length||2),4));
        return strong.length?strong:candidates;
    }
    function prepareArchetypeGravityPlan(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        if(!pack.length) return {ok:false,reason:"empty_pack"};
        const candidates=shuffle(archetypeGravityTagCandidates(ctx));
        if(!candidates.length) return {ok:false,reason:"no_legal_gravity_tags"};
        const decks=(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        for(const tag of candidates){
            const keptIndexes=pack.map((card,index)=>({card,index})).filter(({card})=>
                (Array.isArray(card?.tags)?card.tags:[]).some(value=>String(value||"").trim().toLowerCase()===tag.id)
            ).map(({index})=>index);
            const keepSet=new Set(keptIndexes);
            const targets=pack.map((_,index)=>index).filter(index=>!keepSet.has(index));
            if(targets.some(index=>host()?.canReplacePackCard?.(index,{reason:"archetype_gravity",anomalyId:"archetype_convergence"})===false)) continue;
            const themed=targets.length?host()?.generateCards?.(targets.length,{
                requiredTag:tag.id,
                ignoreCustomPack:true,
                excludeCards:[...pack,...decks],
                origin:"black_hole_anomaly",
                sourceEvent:"archetype_gravity"
            })||[]:[];
            keptIndexes.forEach(index=>{
                const card=pack[index];
                if(!card) return;
                card.anomalyArchetypeGravity=true;
                card.anomalyArchetypeGravityTagId=tag.id;
                card.anomalyArchetypeGravityTagName=tag.name;
                card.anomalyArchetypeGravitySource="existing_tag";
            });
            themed.forEach(card=>{
                card.anomalyArchetypeGravity=true;
                card.anomalyArchetypeGravityTagId=tag.id;
                card.anomalyArchetypeGravityTagName=tag.name;
                card.anomalyArchetypeGravitySource="tag";
            });
            const missing=Math.max(0,targets.length-themed.length);
            const filler=missing?host()?.generateCards?.(missing,{
                ignoreCustomPack:true,
                excludeCards:[...pack,...decks,...themed],
                origin:"black_hole_anomaly",
                sourceEvent:"archetype_gravity_fallback"
            })||[]:[];
            filler.forEach(card=>{
                card.anomalyArchetypeGravity=true;
                card.anomalyArchetypeGravityTagId=tag.id;
                card.anomalyArchetypeGravityTagName=tag.name;
                card.anomalyArchetypeGravitySource="random_fallback";
            });
            const replacements=[...themed,...filler].slice(0,targets.length);
            if(replacements.length!==targets.length) continue;
            return {
                ok:true,
                tag:{id:tag.id,name:tag.name,category:tag.category,available:tag.count},
                replacements,
                themedCount:keptIndexes.length+themed.length,
                keptThemedCount:keptIndexes.length,
                generatedThemedCount:themed.length,
                fillerCount:filler.length,
                keptIndexes,
                targets
            };
        }
        return {ok:false,reason:"gravity_generation_failed"};
    }
    function isBannedTemplate(card,ctx=context()){
        const name=normalizeName(card?.name);
        if(!name) return true;
        const banned=new Set((Array.isArray(ctx.bannedCards)?ctx.bannedCards:[]).map(normalizeName));
        return banned.has(name);
    }
    function prehistoricTemplates(ctx=context()){
        const allowed=new Set(["starter","series1","recruit-pass"]);
        const seen=new Set();
        return shuffle((Array.isArray(ctx.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=normalizeName(card?.name);
            if(!name||seen.has(name)||card?.joker||isBannedTemplate(card,ctx)) return false;
            if(!(Array.isArray(card?.tags)&&card.tags.some(tag=>allowed.has(String(tag||"").toLowerCase())))) return false;
            seen.add(name);
            return true;
        }));
    }
    function jeffTemplates(ctx=context()){
        const names=["Jeff!","Jeff the Baby Dolphin!?"];
        return names.map(name=>(Array.isArray(ctx.cardDatabase)?ctx.cardDatabase:[]).find(card=>card?.name===name)).filter(Boolean);
    }
    function replaceablePackIndexes(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        return pack.map((_,index)=>index).filter(index=>host()?.canReplacePackCard?.(index,{reason:"black_hole_anomaly"})!==false);
    }
    function livingDeadEligibleIndexes(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        return pack.map((_,index)=>index).filter(index=>host()?.canReplacePackCard?.(index,{reason:"night_of_the_living_dead",anomalyId:"night_of_the_living_dead"})!==false);
    }
    function collectLivingDeadGraveyardEntries(ctx=context()){
        const hostEntries=typeof host()?.listGraveyardEntries==="function"
            ? host().listGraveyardEntries({status:"available",recoverable:true})
            : [];
        const rawPools=[
            hostEntries,ctx?.graveyardEntries,ctx?.availableGraveyard,ctx?.graveyard,ctx?.cosmicGraveyard,
            ctx?.rerolledGraveyard,ctx?.recoverableGraveyard,ctx?.archive?.graveyard,ctx?.blackHoleAnomalies?.graveyard
        ].filter(Array.isArray);
        const seen=new Set(),out=[];
        rawPools.forEach(pool=>pool.forEach((entry,entryIndex)=>{
            if(!entry) return;
            const status=String(entry?.status||entry?.state||"available").toLowerCase();
            if(entry?.recoverable===false) return;
            if(status&&status!=="available"&&status!=="recoverable"&&status!=="ready") return;
            if(entry?.consumed||entry?.claimed||entry?.used) return;
            const card=entry?.card||entry?.resultCard||entry?.previousCard||entry?.template||entry?.payload?.card||(entry?.name?entry:null);
            if(!card||card?.joker||isBannedTemplate(card,ctx)) return;
            const entryId=String(entry?.graveyardEntryId||entry?.entryId||entry?.id||"");
            const key=entryId||String(card?.instanceId||`${normalizeName(card?.name)}::${entryIndex}`);
            if(!key||seen.has(key)) return;
            seen.add(key);
            out.push({entryId,card,raw:entry,status});
        }));
        return out;
    }
    function instantiateLivingDeadCard(template,kind="graveyard",meta={}){
        if(!template) return null;
        const created=host()?.createCard?.(template,{sourceEvent:"night_of_the_living_dead",anomalyId:"night_of_the_living_dead",kind,sequence:Number(meta.sequence||0),graveyardEntryId:meta.entryId||null})||clone(template)||null;
        if(!created) return null;
        if(!created.instanceId) created.instanceId=`undead-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        created.anomalyLivingDead=true;
        created.anomalyLivingDeadSource=kind;
        created.anomalyLivingDeadLabel=kind==="graveyard"?"GRAVEYARD":"ZOMBIE";
        created.anomalyLivingDeadOriginName=template?.name||null;
        return created;
    }
    function generateLivingDeadZombieCards(ctx=context(),count=0,usedNames=new Set()){
        const needed=Math.max(0,Number(count)||0);
        if(!needed) return [];
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const decks=(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        const generated=[];
        const accept=card=>{
            const name=normalizeName(card?.name);
            if(!card||!name||usedNames.has(name)||card?.joker||isBannedTemplate(card,ctx)) return false;
            usedNames.add(name);
            card.anomalyLivingDead=true;
            card.anomalyLivingDeadSource="zombie";
            card.anomalyLivingDeadLabel="ZOMBIE";
            generated.push(card);
            return true;
        };
        const zombieTemplates=shuffle((Array.isArray(ctx.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const tags=Array.isArray(card?.tags)?card.tags.map(tag=>String(tag).toLowerCase()):[];
            const name=normalizeName(card?.name);
            return tags.includes("zombies")&&name&&!usedNames.has(name)&&!card?.joker&&!isBannedTemplate(card,ctx);
        }));
        zombieTemplates.forEach(template=>{
            if(generated.length>=needed) return;
            accept(instantiateLivingDeadCard(template,"zombie")||null);
        });
        while(generated.length<needed){
            const fallback=host()?.generateCards?.(1,{
                origin:"black_hole_anomaly",sourceEvent:"night_of_the_living_dead_fallback",ignoreCustomPack:true,
                excludeCards:[...pack,...decks],excludeNames:[...usedNames]
            })?.[0]||null;
            if(!fallback||!accept(fallback)) break;
        }
        return generated.slice(0,needed);
    }
    function prepareNightOfLivingDeadPlan(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const targets=livingDeadEligibleIndexes(ctx);
        if(!pack.length||targets.length!==pack.length) return [];
        const occupiedNames=new Set([
            ...pack.map(card=>normalizeName(card?.name)),
            ...(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).map(card=>normalizeName(card?.name))
        ].filter(Boolean));
        const graveyard=shuffle(collectLivingDeadGraveyardEntries(ctx)).filter(entry=>{
            const name=normalizeName(entry?.card?.name);
            if(!name||occupiedNames.has(name)) return false;
            occupiedNames.add(name);
            return true;
        });
        const graveCount=Math.min(pack.length,graveyard.length);
        const selectedGraveyard=graveyard.slice(0,graveCount);
        const zombieFillers=generateLivingDeadZombieCards(ctx,pack.length-graveCount,occupiedNames);
        const replacements=[];
        selectedGraveyard.forEach((entry,sequence)=>{
            const card=clone(entry.card);
            if(card){
                card.anomalyLivingDead=true;
                card.anomalyLivingDeadSource="graveyard";
                card.anomalyLivingDeadLabel="GRAVEYARD";
                replacements.push({replacement:card,source:"graveyard",entry});
            }
        });
        zombieFillers.forEach((card,sequence)=>replacements.push({replacement:card,source:"zombie",entry:null,sequence:graveCount+sequence}));
        return targets.map((index,order)=>({
            index,
            source:replacements[order]?.source||"zombie",
            graveyardEntry:replacements[order]?.entry||null,
            replacement:replacements[order]?.replacement||generateLivingDeadZombieCards(ctx,1,new Set(occupiedNames))[0]||null,
            sourceIndex:index,
            previousInstanceId:pack[index]?.instanceId||null,
            previousName:pack[index]?.name||null
        })).filter(item=>item.replacement);
    }
    function highCostPackTargets(ctx=context()){
        return (Array.isArray(ctx.currentPack)?ctx.currentPack:[])
            .map((card,index)=>({card,index,cost:Number(card?.cost)}))
            .filter(entry=>entry.card&&Number.isFinite(entry.cost)&&entry.cost>=5);
    }
    function costCutEligibleTargets(ctx=context()){
        return highCostPackTargets(ctx).filter(({index})=>
            host()?.canReplacePackCard?.(index,{reason:"cost_cut_transform",anomalyId:"cost_cut"})!==false
        );
    }
    function costCutLegalOneCostTemplates(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const drafted=(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        const occupied=new Set([...pack,...drafted].map(card=>normalizeName(card?.name)).filter(Boolean));
        const seen=new Set();
        return (Array.isArray(ctx.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=normalizeName(card?.name);
            if(!name||seen.has(name)||occupied.has(name)||card?.joker||isBannedTemplate(card,ctx)) return false;
            if(Number(card?.cost)!==1||!Number.isFinite(Number(card?.power))) return false;
            seen.add(name);
            return true;
        });
    }
    function getCostCutTargetPlan(ctx=context()){
        return costCutEligibleTargets(ctx).map(({card,index,cost})=>({
            instanceId:card?.instanceId||null,
            sourceIndex:index,
            name:card?.name||null,
            originalCost:Number(cost)
        }));
    }
    function prepareCostCutTransformPlan(ctx=context()){
        const targets=getCostCutTargetPlan(ctx);
        if(!targets.length) return [];
        const replacements=host()?.generateCards?.(targets.length,{
            exactCost:1,
            ignoreCustomPack:true,
            excludeCards:[
                ...(Array.isArray(ctx.currentPack)?ctx.currentPack:[]),
                ...(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean)
            ],
            origin:"black_hole_anomaly",
            sourceEvent:"cost_cut_transform"
        })||[];
        return targets.slice(0,replacements.length).map((target,index)=>({
            ...target,
            replacement:replacements[index],
            replacementName:replacements[index]?.name||null,
            replacementInstanceId:replacements[index]?.instanceId||null
        }));
    }
    function findCostCutLiveIndex(target,ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const id=String(target?.instanceId||"");
        if(id){
            const byId=pack.findIndex(card=>String(card?.instanceId||"")===id);
            if(byId>=0) return byId;
        }
        const fallback=Number(target?.sourceIndex);
        if(Number.isInteger(fallback)&&fallback>=0&&fallback<pack.length){
            const card=pack[fallback];
            if(card&&Number(card.cost)>=5) return fallback;
        }
        return -1;
    }
    function randomChaosEligibleIndexes(ctx=context(),playerIndex){
        const deck=ctx.decks?.[playerIndex];
        if(!Array.isArray(deck)||!deck.length) return [];
        return deck.map((_,index)=>index).filter(index=>host()?.canReplaceDeckCard?.(playerIndex,index,{reason:"random_chaos"})!==false);
    }
    function astralContractNormalizeName(value){return String(value||"").trim().toLowerCase();}
    function astralContractCardTradable(ctx,playerIndex,cardIndex){
        const deck=ctx?.decks?.[Number(playerIndex)],card=deck?.[Number(cardIndex)];
        if(!card) return false;
        if(host()?.canReplaceDeckCard?.(Number(playerIndex),Number(cardIndex),{reason:"astral_contract",anomalyId:"astral_contract",effect:"trade"})===false) return false;
        return true;
    }
    function astralContractSwapLegal(ctx,playerA,indexA,playerB,indexB){
        const a=Number(playerA),b=Number(playerB),ia=Number(indexA),ib=Number(indexB);
        if(!Number.isInteger(a)||!Number.isInteger(b)||a===b||!Number.isInteger(ia)||!Number.isInteger(ib)) return false;
        const deckA=ctx?.decks?.[a],deckB=ctx?.decks?.[b],cardA=deckA?.[ia],cardB=deckB?.[ib];
        if(!cardA||!cardB||!astralContractCardTradable(ctx,a,ia)||!astralContractCardTradable(ctx,b,ib)) return false;
        const nameA=astralContractNormalizeName(cardA?.name),nameB=astralContractNormalizeName(cardB?.name);
        if(!nameA||!nameB) return false;
        const occupiedA=new Set((deckA||[]).map((card,index)=>index===ia?null:astralContractNormalizeName(card?.name)).filter(Boolean));
        const occupiedB=new Set((deckB||[]).map((card,index)=>index===ib?null:astralContractNormalizeName(card?.name)).filter(Boolean));
        if(occupiedA.has(nameB)||occupiedB.has(nameA)) return false;
        return true;
    }
    function astralContractSwapOptions(ctx=context(),playerA,playerB){
        const a=Number(playerA),b=Number(playerB),deckA=ctx?.decks?.[a],deckB=ctx?.decks?.[b];
        if(!Array.isArray(deckA)||!Array.isArray(deckB)||a===b) return [];
        const options=[];
        for(let ia=0;ia<deckA.length;ia++) for(let ib=0;ib<deckB.length;ib++) if(astralContractSwapLegal(ctx,a,ia,b,ib)) options.push({playerA:a,indexA:ia,playerB:b,indexB:ib});
        return options;
    }
    function astralContractEligiblePlayerPairs(ctx=context()){
        const players=Array.isArray(ctx?.players)?ctx.players:[];
        const pairs=[];
        for(let a=0;a<players.length;a++) for(let b=a+1;b<players.length;b++){
            const options=astralContractSwapOptions(ctx,a,b);
            if(options.length) pairs.push({playerA:a,playerB:b,optionCount:options.length});
        }
        return pairs;
    }
    function clearAstralContractTimers(){
        clearInterval(astralContractInterval);clearTimeout(astralContractCloseTimer);astralContractInterval=0;astralContractCloseTimer=0;
    }
    function clearAstralContractModal(){
        clearAstralContractTimers();
        if(typeof document!=="undefined") document.getElementById("bhaAstralContractModal")?.remove?.();
    }
    function astralContractHasSelection(value){return value!==null&&value!==undefined&&Number.isInteger(Number(value));}
    function astralContractSelectionLegal(contract=state.astralContract,ctx=context()){
        if(!contract||!astralContractHasSelection(contract.selectionA)||!astralContractHasSelection(contract.selectionB)) return false;
        return astralContractSwapLegal(ctx,contract.playerA,contract.selectionA,contract.playerB,contract.selectionB);
    }
    function astralContractCardTile(card,index,side,contract,ctx){
        const own=side==="A"?contract.playerA:contract.playerB;
        const other=side==="A"?contract.playerB:contract.playerA;
        const otherSelection=side==="A"?contract.selectionB:contract.selectionA;
        const ownSelection=side==="A"?contract.selectionA:contract.selectionB;
        const selected=astralContractHasSelection(ownSelection)&&Number(ownSelection)===Number(index);
        const canTrade=astralContractCardTradable(ctx,own,index);
        const compatible=astralContractHasSelection(otherSelection)
            ? (side==="A"?astralContractSwapLegal(ctx,own,index,other,otherSelection):astralContractSwapLegal(ctx,other,otherSelection,own,index))
            : canTrade&&astralContractSwapOptions(ctx,contract.playerA,contract.playerB).some(option=>side==="A"?option.indexA===Number(index):option.indexB===Number(index));
        const disabled=!canTrade||!compatible;
        return `<button type="button" class="bha-contract-card${selected?" is-selected":""}${disabled?" is-disabled":""}" data-contract-side="${side}" data-contract-index="${Number(index)}" ${disabled?"disabled":""}><span class="bha-contract-cost">${escapeHtml(card?.cost??"")}</span><b>${escapeHtml(card?.name||"Karta")}</b>${String(card?.cardType||"").toLowerCase()==="skill"?"":`<span class="bha-contract-power">${escapeHtml(card?.power??"")}</span>`}</button>`;
    }
    function renderAstralContractModal(){
        if(typeof document==="undefined"||!state.astralContract?.active) return false;
        const contract=state.astralContract,ctx=context(),players=Array.isArray(ctx?.players)?ctx.players:[];
        let root=document.getElementById("bhaAstralContractModal");
        if(!root){root=document.createElement("div");root.id="bhaAstralContractModal";root.className="bha-astral-contract-modal";document.body.appendChild(root);}
        const deckA=Array.isArray(ctx?.decks?.[contract.playerA])?ctx.decks[contract.playerA]:[];
        const deckB=Array.isArray(ctx?.decks?.[contract.playerB])?ctx.decks[contract.playerB]:[];
        const seconds=Math.max(0,Number(contract.secondsLeft??90));
        const playerA=players[contract.playerA]||`GRACZ ${contract.playerA+1}`,playerB=players[contract.playerB]||`GRACZ ${contract.playerB+1}`;
        const status=contract.phase==="resolved"?(contract.timeout?"LOS ROZSTRZYGNĄŁ KONTRAKT":"KONTRAKT ZAWARTY"):contract.phase==="timeout"?"CZAS MINĄŁ — LOS ROZSTRZYGA":"WYBIERZCIE PO JEDNEJ KARCIE";
        root.innerHTML=`<section class="bha-contract-shell" role="dialog" aria-modal="true" aria-labelledby="bhaContractTitle"><div class="bha-contract-art" aria-hidden="true"></div><div class="bha-contract-stars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="bha-contract-orbit orbit-a"></div><div class="bha-contract-orbit orbit-b"></div><header><small>ANOMALIA SPOŁECZNA</small><h2 id="bhaContractTitle">ASTRALNY KONTRAKT</h2><p>${escapeHtml(status)}</p></header><div class="bha-contract-main"><section class="bha-contract-side side-a"><h3>${escapeHtml(playerA)}</h3><span class="bha-contract-side-label">ODDAJE 1 KARTĘ</span><div class="bha-contract-deck">${deckA.map((card,index)=>astralContractCardTile(card,index,"A",contract,ctx)).join("")}</div><button type="button" class="bha-contract-confirm${contract.confirmedA?" is-confirmed":""}" data-contract-confirm="A" ${astralContractHasSelection(contract.selectionA)?"":"disabled"}>${contract.confirmedA?"✓ OFERTA ZATWIERDZONA":"ZATWIERDŹ OFERTĘ"}</button></section><div class="bha-contract-core"><span class="bha-contract-chain chain-left"></span><div class="bha-contract-timer${seconds<=10?" is-critical":""}">${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}</div><div class="bha-contract-sigil"><i></i><i></i><i></i></div><strong>↔</strong><small>90 SEKUND NA UKŁAD</small><span class="bha-contract-chain chain-right"></span></div><section class="bha-contract-side side-b"><h3>${escapeHtml(playerB)}</h3><span class="bha-contract-side-label">ODDAJE 1 KARTĘ</span><div class="bha-contract-deck">${deckB.map((card,index)=>astralContractCardTile(card,index,"B",contract,ctx)).join("")}</div><button type="button" class="bha-contract-confirm${contract.confirmedB?" is-confirmed":""}" data-contract-confirm="B" ${astralContractHasSelection(contract.selectionB)?"":"disabled"}>${contract.confirmedB?"✓ OFERTA ZATWIERDZONA":"ZATWIERDŹ OFERTĘ"}</button></section></div><footer>Jeżeli nie zawrzecie układu przed końcem czasu, Astralny Kontrakt wybierze legalną wymianę za was.</footer></section>`;
        root.querySelectorAll("[data-contract-side]").forEach(button=>button.addEventListener("click",()=>{
            if(contract.phase!=="negotiating") return;
            const side=String(button.dataset.contractSide||""),index=Number(button.dataset.contractIndex);
            if(side==="A"){contract.selectionA=index;contract.confirmedA=false;if(astralContractHasSelection(contract.selectionB)&&!astralContractSwapLegal(context(),contract.playerA,index,contract.playerB,contract.selectionB)){contract.selectionB=null;contract.confirmedB=false;}}
            else {contract.selectionB=index;contract.confirmedB=false;if(astralContractHasSelection(contract.selectionA)&&!astralContractSwapLegal(context(),contract.playerA,contract.selectionA,contract.playerB,index)){contract.selectionA=null;contract.confirmedA=false;}}
            renderAstralContractModal();
        }));
        root.querySelectorAll("[data-contract-confirm]").forEach(button=>button.addEventListener("click",()=>{
            if(contract.phase!=="negotiating") return;
            const side=String(button.dataset.contractConfirm||"");
            if(side==="A"&&astralContractHasSelection(contract.selectionA)) contract.confirmedA=!contract.confirmedA;
            if(side==="B"&&astralContractHasSelection(contract.selectionB)) contract.confirmedB=!contract.confirmedB;
            renderAstralContractModal();
            if(contract.confirmedA&&contract.confirmedB&&astralContractSelectionLegal(contract,context())) resolveAstralContract(false);
        }));
        return true;
    }
    function finalizeAstralContract(resume=astralContractResume){
        const contract=state.astralContract;
        clearAstralContractModal();state.astralContract=null;astralContractResume=null;setLocked(false);host()?.renderDecks?.();refreshRuntimeInfo();resume?.();
        return Boolean(contract);
    }
    function resolveAstralContract(timeout=false){
        const contract=state.astralContract;if(!contract?.active||contract.phase==="resolved") return false;
        clearAstralContractTimers();
        const ctx=context();let choice=null;
        if(!timeout&&contract.confirmedA&&contract.confirmedB&&astralContractSelectionLegal(contract,ctx)) choice={playerA:contract.playerA,indexA:Number(contract.selectionA),playerB:contract.playerB,indexB:Number(contract.selectionB)};
        if(!choice){const options=astralContractSwapOptions(ctx,contract.playerA,contract.playerB);choice=options[Math.floor(Math.random()*options.length)]||null;timeout=true;}
        if(!choice){contract.phase="resolved";contract.timeout=true;contract.error="no_legal_swap";renderAstralContractModal();astralContractCloseTimer=setTimeout(()=>finalizeAstralContract(),1250);return true;}
        const result=host()?.swapDeckCardsBetweenPlayers?.(choice.playerA,choice.indexA,choice.playerB,choice.indexB,{reason:"astral_contract",anomalyId:"astral_contract",timeout:Boolean(timeout)});
        contract.phase="resolved";contract.timeout=Boolean(timeout);contract.result=result?.ok?clone(result):{ok:false,reason:result?.reason||"swap_failed"};
        contract.selectionA=choice.indexA;contract.selectionB=choice.indexB;
        state.astralContractHistory=Array.isArray(state.astralContractHistory)?state.astralContractHistory:[];
        state.astralContractHistory.push({packNumber:Number(ctx?.packStartIndex||0)+1,triggerAfterPick:Number(contract.triggerAfterPick||0),playerA:choice.playerA,playerAName:ctx?.players?.[choice.playerA]||null,playerB:choice.playerB,playerBName:ctx?.players?.[choice.playerB]||null,cardA:result?.cardA?.name||null,cardAInstanceId:result?.cardA?.instanceId||null,cardB:result?.cardB?.name||null,cardBInstanceId:result?.cardB?.instanceId||null,timeout:Boolean(timeout),ok:Boolean(result?.ok),at:new Date().toISOString()});
        host()?.log?.("astral_contract_resolved",{reason:"astral_contract",data:{playerA:choice.playerA,playerB:choice.playerB,indexA:choice.indexA,indexB:choice.indexB,timeout:Boolean(timeout),cardA:result?.cardA?.name||null,cardB:result?.cardB?.name||null,ok:Boolean(result?.ok)}});
        host()?.renderDecks?.();renderAstralContractModal();
        astralContractCloseTimer=setTimeout(()=>finalizeAstralContract(),1750);
        return true;
    }
    function openAstralContractModal(outcome={},resume){
        const contract=state.astralContract;if(!contract?.active){resume?.();return false;}
        clearAstralContractTimers();setLocked(true);contract.phase="negotiating";contract.secondsLeft=90;contract.startedAt=Date.now();astralContractResume=resume;renderAstralContractModal();
        astralContractInterval=setInterval(()=>{if(!state.astralContract?.active){clearAstralContractTimers();return;}const elapsed=Math.floor((Date.now()-Number(contract.startedAt||Date.now()))/1000);contract.secondsLeft=Math.max(0,90-elapsed);renderAstralContractModal();if(contract.secondsLeft<=0){contract.phase="timeout";renderAstralContractModal();setTimeout(()=>resolveAstralContract(true),520);}},1000);
        return true;
    }
    function effectAstralContract(ctx=context()){
        const pairs=astralContractEligiblePlayerPairs(ctx),pair=pairs[Math.floor(Math.random()*pairs.length)]||null;
        if(!pair) return {active:false,reason:"no_legal_pair"};
        state.astralContract={active:true,phase:"pending",playerA:Number(pair.playerA),playerB:Number(pair.playerB),selectionA:null,selectionB:null,confirmedA:false,confirmedB:false,secondsLeft:90,triggerAfterPick:Number(state.active?.triggerAfterPick||1),startedPackIndex:Number(ctx?.packStartIndex||0)};
        return {active:true,playerA:Number(pair.playerA),playerB:Number(pair.playerB),playerAName:ctx?.players?.[pair.playerA]||null,playerBName:ctx?.players?.[pair.playerB]||null,legalSwapCount:Number(pair.optionCount||0),timerSeconds:90};
    }

    function clearKangTimeRewindFx(){
        clearTimeout(kangRewindTimer);clearTimeout(kangFlashTimer);kangRewindTimer=0;kangFlashTimer=0;
        if(typeof document==="undefined") return;
        document.body?.classList?.remove?.("bha-kang-rewinding","bha-kang-rewind-frozen");
        document.getElementById("bhaKangTimeRewindFx")?.remove?.();
    }
    function kangReplaceableIndexes(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        return pack.map((card,index)=>({card,index})).filter(({card,index})=>card&&host()?.canReplacePackCard?.(index,{reason:"kang_time_rewind",anomalyId:"kang_time_rewind"})!==false);
    }
    function prepareKangTimeRewindPlan(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        const players=Array.isArray(ctx?.players)?ctx.players:[];
        const replaceable=shuffle(kangReplaceableIndexes(ctx));
        const targets=replaceable.slice(0,Math.min(5,replaceable.length));
        const drafted=(Array.isArray(ctx?.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        const replacements=host()?.generateCards?.(targets.length,{
            ignoreCustomPack:true,
            excludeCards:[...pack,...drafted],
            origin:"black_hole_anomaly",
            sourceEvent:"kang_time_rewind"
        })||[];
        const cards=targets.slice(0,replacements.length).map((target,index)=>{
            const replacement=replacements[index];
            if(replacement&&typeof replacement==="object"){
                replacement.anomalyKangTemporal=true;
                replacement.instanceMeta={...(replacement.instanceMeta&&typeof replacement.instanceMeta==="object"?replacement.instanceMeta:{}),kangTimeRewind:true,kangSourceCardName:target.card?.name||null};
            }
            return {index:Number(target.index),sourceInstanceId:target.card?.instanceId||null,sourceName:target.card?.name||null,replacement,replacementName:replacement?.name||null,replacementInstanceId:replacement?.instanceId||null};
        });
        const roundStartIndex=Math.max(0,Number(ctx?.currentPickIndex||0));
        const replayRound=(Array.isArray(ctx?.pickOrder)?ctx.pickOrder:[]).slice(roundStartIndex,roundStartIndex+players.length).map(Number);
        return {cards,playerCount:players.length,roundStartIndex,queueBefore:replayRound,queueAfter:[...replayRound].reverse(),startedAfterPick:Number(ctx?.currentPickIndex||0)+1};
    }
    function captureKangPackStartCheckpoint(ctx=context()){
        if(state.active?.id!=="kang_time_rewind"||state.active.triggered||state.active.kangRewindCheckpoint) return false;
        const checkpoint=host()?.captureCheckpoint?.({reason:"kang_time_rewind_pack_start"})||null;
        if(!checkpoint) return false;
        state.active.kangRewindCheckpoint=checkpoint;
        state.active.kangRoundStartIndex=Math.max(0,Number(ctx?.currentPickIndex||0));
        state.active.kangOriginalPickOrder=clone(Array.isArray(ctx?.pickOrder)?ctx.pickOrder:[]);
        state.active.kangCheckpointCapturedAt=new Date().toISOString();
        host()?.log?.("kang_time_rewind_checkpoint_captured",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"kang_time_rewind",data:{roundStartIndex:state.active.kangRoundStartIndex,playerCount:Number(ctx?.players?.length||0)}});
        return true;
    }
    function resealKangAfterCheckpointRestore(seal,plan={}){
        const scheduleId=seal?.active?.scheduleId||null,packIndex=Number(seal?.active?.packIndex??plan?.packIndex??context()?.packStartIndex??0);
        const matches=item=>(scheduleId&&item?.scheduleId===scheduleId)||(Number(item?.packIndex)===packIndex&&item?.id==="kang_time_rewind");
        const timelineItem=state.timeline?.find?.(matches);if(timelineItem) timelineItem.triggered=true;
        const planned=state.plan?.find?.(matches);if(planned) planned.triggered=true;
        state.active={...(clone(seal?.active||state.active||getDefinition("kang_time_rewind"))),triggered:true};
        if(state.active){delete state.active.kangRewindCheckpoint;delete state.active.kangOriginalPickOrder;}
        if(seal?.adminTest?.enabled&&seal?.active?.adminForced){state.adminTest={...state.adminTest,...clone(seal.adminTest),completed:true,blockedReason:null};}
        if(seal?.activationEvent){
            state.events=Array.isArray(state.events)?state.events:[];
            if(!state.events.some(event=>event?.anomalyId==="kang_time_rewind"&&event?.at===seal.activationEvent.at)) state.events.push(clone(seal.activationEvent));
        }
        state.kangTimeRewind={active:true,phase:"rewound",packIndex,playerCount:Number(plan.playerCount||context()?.players?.length||0),roundStartIndex:Number(plan.roundStartIndex||0),preparedAt:plan.preparedAt||new Date().toISOString()};
    }
    function effectKangTimeRewind(){
        const ctx=context(),checkpoint=state.active?.kangRewindCheckpoint||null;
        const playerCount=Math.max(1,Number(ctx?.players?.length)||1),roundStartIndex=Math.max(0,Number(state.active?.kangRoundStartIndex??0));
        state.kangTimeRewind={active:true,phase:"prepared",packIndex:Number(ctx?.packStartIndex||0),playerCount,roundStartIndex,checkpoint,preparedAt:new Date().toISOString()};
        return {playerCount,roundStartIndex,startedAfterPick:Number(ctx?.currentPickIndex||0)+1,checkpointReady:Boolean(checkpoint)};
    }
    function applyKangTimeRewindPlan(plan=state.kangTimeRewind){
        if(!plan?.checkpoint) return {ok:false,reason:"missing_kang_checkpoint"};
        const preRestoreState=state,activationEvent=[...(preRestoreState.events||[])].reverse().find(event=>event?.anomalyId==="kang_time_rewind")||null;
        const seal={active:clone(preRestoreState.active||null),adminTest:clone(preRestoreState.adminTest||null),activationEvent:clone(activationEvent)};
        const checkpoint=plan.checkpoint;
        const restored=host()?.restoreCheckpoint?.(checkpoint,{reason:"kang_time_rewind",silent:true})!==false;
        if(!restored) return {ok:false,reason:"kang_checkpoint_restore_failed"};
        resealKangAfterCheckpointRestore(seal,plan);
        const ctx=context(),mutation=prepareKangTimeRewindPlan(ctx),pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[],live=[];
        for(const target of Array.isArray(mutation.cards)?mutation.cards:[]){
            let index=-1;
            const id=String(target?.sourceInstanceId||"");
            if(id) index=pack.findIndex(card=>String(card?.instanceId||"")===id);
            if(index<0&&Number.isInteger(Number(target?.index))&&pack[Number(target.index)]) index=Number(target.index);
            if(index>=0&&target?.replacement&&host()?.canReplacePackCard?.(index,{reason:"kang_time_rewind",anomalyId:"kang_time_rewind"})!==false) live.push({...target,index});
        }
        const replacementResult=live.length?host()?.replacePackAtIndexes?.(live.map(item=>item.index),live.map(item=>item.replacement),{reason:"kang_time_rewind",anomalyId:"kang_time_rewind",graveyardCategory:"rerolled",recoverable:true,data:{alternateTimeline:true,rewoundFirstRound:true}}):{ok:false,replaced:0,reason:"no_live_targets"};
        const queue=host()?.reverseReplayQueueRound?.({reason:"kang_time_rewind",anomalyId:"kang_time_rewind",playerCount:Number(plan.playerCount||ctx?.players?.length||0),startIndex:Number(plan.roundStartIndex||0)})||{ok:false,reason:"queue_host_unavailable"};
        const record={packNumber:Number(ctx?.packStartIndex||0)+1,rewound:true,replayedRoundStart:Number(plan.roundStartIndex||0),replaced:Number(replacementResult?.replaced||0),sourceCards:live.map(item=>item.sourceName),replacementCards:live.map(item=>item.replacementName),queueBefore:clone(queue?.before||mutation.queueBefore||[]),queueAfter:clone(queue?.after||mutation.queueAfter||[]),secondRoundUnchanged:Boolean(queue?.secondRoundUnchanged),at:new Date().toISOString()};
        state.kangTimeRewind={...(state.kangTimeRewind||{}),active:false,phase:"resolved",checkpoint:null,...record};
        state.kangHistory=Array.isArray(state.kangHistory)?state.kangHistory:[];state.kangHistory.push(clone(record));
        host()?.log?.("kang_time_rewind_resolved",{packNumber:record.packNumber,reason:"kang_time_rewind",data:clone(record)});
        host()?.render?.();
        return {ok:Boolean(replacementResult?.ok&&queue?.ok),replacementResult,queueResult:queue,record};
    }
    function positionKangOverPack(root){
        if(typeof document==="undefined"||!root) return;
        const pack=document.getElementById("pack"),rect=pack?.getBoundingClientRect?.();
        if(!rect||!rect.width) return;
        root.style.setProperty("--kang-pack-x",`${Math.min(window.innerWidth-130,Math.max(130,rect.right-50))}px`);
        root.style.setProperty("--kang-pack-y",`${Math.max(120,rect.top+rect.height*.12)}px`);
    }
    function playKangTimeRewind(entry,plan,resume){
        clearKangTimeRewindFx();
        if(typeof document==="undefined"){
            applyKangTimeRewindPlan(plan);setLocked(false);resume?.();return true;
        }
        setLocked(true);
        const root=document.createElement("div");root.id="bhaKangTimeRewindFx";root.className="bha-kang-rewind-fx";root.setAttribute("aria-hidden","true");
        root.innerHTML=`<div class="bha-kang-time-veil"></div><div class="bha-kang-light-streaks"><i></i><i></i><i></i><i></i><i></i></div><img class="bha-kang-clock c1" src="${KANG_CLOCK_NORMAL_ASSET}" alt=""><img class="bha-kang-clock c2 warped" src="${KANG_CLOCK_WARPED_ASSET}" alt=""><img class="bha-kang-clock c3 warped" src="${KANG_CLOCK_WARPED_ASSET}" alt=""><img class="bha-kang-clock c4" src="${KANG_CLOCK_NORMAL_ASSET}" alt=""><img class="bha-kang-character" src="${KANG_CHARACTER_ASSET}" alt=""><div class="bha-kang-rewind-button"><span>↶</span><b>COFANIE CZASU</b></div><div class="bha-kang-flash"></div><div class="bha-kang-new-timeline">ALTERNATYWNA LINIA CZASU</div>`;
        document.body.appendChild(root);document.body.classList.add("bha-kang-rewinding");positionKangOverPack(root);
        requestAnimationFrame(()=>root.classList.add("is-running"));
        kangRewindTimer=setTimeout(()=>{
            root.classList.add("is-rewind-frozen","is-kang-arriving");
            document.body.classList.add("bha-kang-rewind-frozen");
            positionKangOverPack(root);
        },2450);
        kangFlashTimer=setTimeout(()=>{
            root.classList.add("is-flashing");
            const resolved=applyKangTimeRewindPlan(state.kangTimeRewind||plan);
            (resolved?.record?.replacementCards||[]).length&&setTimeout(()=>{document.querySelectorAll("#pack .bha-kang-temporal-card").forEach((node,index)=>{node.style.setProperty("--kang-new-delay",`${index*90}ms`);node.classList.add("is-kang-new");});},90);
        },3350);
        setTimeout(()=>root.classList.add("is-new-timeline"),3750);
        setTimeout(()=>{
            root.classList.add("is-leaving");
            setTimeout(()=>{clearKangTimeRewindFx();setLocked(false);resume?.();},650);
        },5050);
        return true;
    }

    function runtimeEligible(def,ctx=context(),phase="prepared"){
        if(!def?.runtimeReady) return false;
        if(def.id==="golden_meteor") return Boolean(ctx.economyEnabled);
        if(def.id==="prehistoric"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.length>0&&replaceablePackIndexes(ctx).length===pack.length&&prehistoricTemplates(ctx).length>=pack.length;
        }
        if(def.id==="jeff_anomaly"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            const count=Math.min(pack.length,Math.max(1,Number(ctx.players?.length)||1));
            return count>0&&jeffTemplates(ctx).length===2&&replaceablePackIndexes(ctx).length>=count;
        }
        if(def.id==="joker_rift"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            const count=Math.max(1,Math.floor(pack.length/2));
            return pack.length>1&&typeof global.getRandomJoker==="function"&&replaceablePackIndexes(ctx).length>=count;
        }
        if(def.id==="glitch_pack"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.length>1&&replaceablePackIndexes(ctx).length>0;
        }
        if(def.id==="double_trouble"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return (ctx.players||[]).length>=2&&pack.length>0&&!pack.some(card=>card?.joker)&&typeof host()?.activateDoubleTrouble==="function";
        }
        if(def.id==="battleworld"){
            const players=Array.isArray(ctx.players)?ctx.players:[];
            const decks=Array.isArray(ctx.decks)?ctx.decks:[];
            if(players.length<2||decks.length<players.length) return false;
            return players.every((_,playerIndex)=>battleworldEligibleIndexes(ctx,playerIndex).length>0);
        }
        if(def.id==="zombie_horde"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.filter(card=>card&&!card.joker).length>=2&&zombieHordeRuns(ctx).some(run=>run.length>=2);
        }
        if(def.id==="techno_organic_virus"){
            if(technoOrganicVirusActive()) return false;
            const players=Array.isArray(ctx.players)?ctx.players:[];
            return players.length>0&&players.every((_,playerIndex)=>technoOrganicPatientZeroCandidates(ctx,playerIndex).length>0);
        }
        if(def.id==="custom_pack_crack"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.length>0&&replaceablePackIndexes(ctx).length===pack.length&&typeof host()?.applyRandomCustomPack==="function"&&Number(host()?.getRandomCustomPackCandidateCount?.({excludeCategories:["msp_history"],excludeMeta:true})||0)>0;
        }
        if(def.id==="archetype_convergence"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.length>0&&replaceablePackIndexes(ctx).length===pack.length&&archetypeGravityTagCandidates(ctx).length>0&&typeof host()?.generateCards==="function";
        }
        if(def.id==="night_of_the_living_dead"){
            const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return pack.length>0&&livingDeadEligibleIndexes(ctx).length===pack.length&&Boolean(host()?.generateCards||host()?.createCard);
        }
        if(def.id==="living_tribunal"){
            const players=Array.isArray(ctx.players)?ctx.players:[];
            const decks=Array.isArray(ctx.decks)?ctx.decks:[];
            if(!players.length||decks.length<players.length||state.livingTribunal?.active) return false;
            if(!players.every((_,playerIndex)=>Array.isArray(decks[playerIndex])&&decks[playerIndex].length>=6)) return false;
            return players.every((_,playerIndex)=>buildLivingTribunalRecommendations(playerIndex,ctx).recommendations.length===5);
        }
        if(def.id==="astral_contract"){
            if(state.astralContract?.active) return false;
            return astralContractEligiblePlayerPairs(ctx).length>0;
        }
        if(def.id==="kang_time_rewind"){
            const players=Array.isArray(ctx.players)?ctx.players:[],pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
            return players.length>=2&&pack.length>players.length&&typeof host()?.reverseUpcomingQueueRound==="function"&&typeof host()?.generateCards==="function"&&kangReplaceableIndexes(ctx).length>0;
        }
        if(def.id==="random_chaos"){
            const players=Array.isArray(ctx.players)?ctx.players:[];
            if(!players.length) return false;
            return players.every((_,playerIndex)=>randomChaosEligibleIndexes(ctx,playerIndex).length>0);
        }
        if(def.id==="cost_cut"){
            const targets=costCutEligibleTargets(ctx);
            if(!targets.length) return false;
            // Transformacja ma objąć KAŻDY legalnie wymienialny cel Cost 5+, więc wymagamy
            // odpowiedniej liczby unikalnych legalnych kart Cost 1 przed odpaleniem anomalii.
            return costCutLegalOneCostTemplates(ctx).length>=targets.length;
        }
        return true;
    }
    function materializeScheduledDefinition(def,entry){
        if(!def||!entry) return null;
        return {...clone(def),scheduleId:entry.scheduleId||`bha-fallback-${def.id}`,schedulerVersion:SCHEDULER_VERSION,window:entry.window||def.window||null,slot:clone(entry.slot||null),packIndex:(entry.packIndex===null||entry.packIndex===undefined)?null:Number(entry.packIndex),triggered:false,guaranteed:Boolean(entry.guaranteed),fallbackFrom:entry.id||null,backupIds:[]};
    }
    function chooseRuntimeFallback(entry,ctx=context()){
        // 13A: runtime never rolls a new anomaly. It may only consume backups pre-rolled at draft start.
        const ids=Array.isArray(entry?.backupIds)?entry.backupIds:[];
        for(const id of ids){
            const def=getDefinition(id);
            if(!def||def.rarity!==entry.rarity) continue;
            if(String(def.window||"")!==String(entry.window||"")) continue;
            if(Number(def.minPackIndex||0)>Number(entry.packIndex??ctx.packStartIndex??0)) continue;
            if(def.requiresEconomy&&!ctx.economyEnabled) continue;
            if(runtimeEligible(def,ctx)) return materializeScheduledDefinition(def,entry);
        }
        return null;
    }
    function replaceTimelineEntry(previous,next){
        const matches=item=>item&&(item===previous||(item.scheduleId&&previous?.scheduleId&&item.scheduleId===previous.scheduleId)||(item.packIndex===previous?.packIndex&&item.id===previous?.id&&!item.triggered));
        const timelineIndex=state.timeline.findIndex(matches);
        if(timelineIndex>=0) state.timeline[timelineIndex]=next;
        const planIndex=state.plan.findIndex(matches);
        if(planIndex>=0) state.plan[planIndex]=next;
        return {timelineIndex,planIndex};
    }
    function resolvePreparedEntry(entry,ctx=context()){
        if(!entry) return null;
        if(runtimeEligible(entry,ctx)) return entry;
        const fallback=chooseRuntimeFallback(entry,ctx);
        if(fallback){
            replaceTimelineEntry(entry,fallback);
            host()?.log?.("black_hole_anomaly_fallback",{reason:"prerolled_runtime_ineligible",data:{from:entry.id,to:fallback.id,rarity:entry.rarity,window:entry.window,slot:clone(entry.slot||null),packNumber:Number(ctx.packStartIndex||0)+1}});
            return fallback;
        }
        const skipped={...entry,triggered:true,skipped:true,skipReason:"runtime_ineligible_no_prerolled_backup"};
        replaceTimelineEntry(entry,skipped);
        host()?.log?.("black_hole_anomaly_skipped",{reason:"runtime_ineligible_no_prerolled_backup",data:{anomalyId:entry.id,rarity:entry.rarity,window:entry.window,slot:clone(entry.slot||null),packNumber:Number(ctx.packStartIndex||0)+1}});
        return null;
    }
    function effectPrehistoric(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const templates=prehistoricTemplates(ctx).slice(0,pack.length);
        if(!pack.length||templates.length<pack.length) return {replaced:0,reason:"insufficient_prehistoric_pool"};
        const replacements=templates.map((template,index)=>host()?.createCard?.(template,{sourceEvent:"prehistoric_pack",sequence:index})).filter(Boolean);
        if(replacements.length!==pack.length) return {replaced:0,reason:"instance_generation_failed"};
        const result=host()?.replacePackAtIndexes?.(pack.map((_,index)=>index),replacements,{reason:"prehistoric_shift",anomalyId:"prehistoric",graveyardCategory:"rerolled"})||{ok:false,replaced:0};
        return {replaced:Number(result.replaced||0),cardNames:replacements.map(card=>card?.name).filter(Boolean)};
    }
    function effectJeffAnomaly(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[],templates=jeffTemplates(ctx);
        const count=Math.min(pack.length,Math.max(1,Number(ctx.players?.length)||1));
        const available=shuffle(replaceablePackIndexes(ctx)).slice(0,count);
        if(templates.length!==2||available.length<count) return {replaced:0,reason:"jeff_targets_unavailable"};
        const replacements=available.map((_,index)=>host()?.createCard?.(templates[index%templates.length],{sourceEvent:"jeff_anomaly",sequence:index})).filter(Boolean);
        if(replacements.length!==available.length) return {replaced:0,reason:"jeff_instance_generation_failed"};
        const result=host()?.replacePackAtIndexes?.(available,replacements,{reason:"jeff_anomaly_arrival",anomalyId:"jeff_anomaly",graveyardCategory:"rerolled"})||{ok:false,replaced:0};
        return {replaced:Number(result.replaced||0),cards:replacements.map(card=>card?.name).filter(Boolean)};
    }
    function effectJokerRift(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        if(pack.length<2||typeof global.getRandomJoker!=="function") return {replaced:0,reason:"joker_engine_unavailable"};
        const count=Math.max(1,Math.floor(pack.length/2));
        const replaceable=replaceablePackIndexes(ctx);
        const nonJoker=shuffle(replaceable.filter(index=>!pack[index]?.joker));
        const existingJoker=shuffle(replaceable.filter(index=>pack[index]?.joker));
        const targets=[...nonJoker,...existingJoker].slice(0,count);
        if(targets.length<count) return {replaced:0,reason:"joker_rift_targets_unavailable",requested:count};
        const usedIds=new Set(pack.filter(card=>card?.joker&&card?.id).map(card=>String(card.id)));
        const replacements=[];
        for(let sequence=0;sequence<targets.length;sequence+=1){
            const definition=global.getRandomJoker([...usedIds]);
            if(!definition) return {replaced:0,reason:"joker_rift_definition_failed",requested:count};
            if(definition.id) usedIds.add(String(definition.id));
            const source={joker:true,...definition,anomalyJokerRift:true};
            const instance=host()?.createCard?.(source,{sourceEvent:"joker_rift",anomalyId:"joker_rift",sequence});
            if(!instance) return {replaced:0,reason:"joker_rift_instance_failed",requested:count};
            instance.anomalyJokerRift=true;
            replacements.push(instance);
        }
        const result=host()?.replacePackAtIndexes?.(targets,replacements,{
            reason:"joker_rift",
            anomalyId:"joker_rift",
            graveyardCategory:"rerolled",
            data:{jokerIds:replacements.map(card=>card?.id||null),targetIndexes:[...targets]}
        })||{ok:false,replaced:0};
        return {
            replaced:Number(result.replaced||0),
            requested:count,
            targetIndexes:[...targets],
            jokers:replacements.map(card=>({id:card?.id||null,name:card?.name||null,type:card?.type||null,rarity:card?.rarity||null,instanceId:card?.instanceId||null}))
        };
    }
    function effectCustomPackCrack(){
        const result=host()?.applyRandomCustomPack?.({
            anomalyId:"custom_pack_crack",
            excludeCategories:["msp_history"],
            excludeMeta:true,
            excludeCurrent:true,
            sourceEvent:"custom_pack_crack"
        })||{ok:false,reason:"custom_pack_host_unavailable"};
        if(result?.ok&&state.active){
            state.active.customPackId=result.packId||null;
            state.active.customPackName=result.packName||null;
            state.active.customPackCategory=result.category||null;
            state.active.customPackSummary=result.summary||null;
            state.active.customPackCardNames=Array.isArray(result.cardNames)?[...result.cardNames]:[];
        }
        return {
            replaced:Number(result?.replaced||0),
            ok:Boolean(result?.ok),
            reason:result?.reason||null,
            packId:result?.packId||null,
            packName:result?.packName||null,
            category:result?.category||null,
            summary:result?.summary||null,
            candidateCount:Number(result?.candidateCount||0),
            cardNames:Array.isArray(result?.cardNames)?[...result.cardNames]:[]
        };
    }
    function effectArchetypeGravity(plan=prepareArchetypeGravityPlan(context())){
        if(!plan?.ok) return {replaced:0,reason:plan?.reason||"gravity_plan_unavailable"};
        const result=plan.targets.length?(host()?.replacePackAtIndexes?.(plan.targets,plan.replacements,{
            reason:"archetype_gravity",
            anomalyId:"archetype_convergence",
            graveyardCategory:"rerolled",
            data:{tagId:plan.tag?.id||null,tagName:plan.tag?.name||null,tagCategory:plan.tag?.category||null,themedCount:Number(plan.themedCount||0),keptThemedCount:Number(plan.keptThemedCount||0),fillerCount:Number(plan.fillerCount||0)}
        })||{ok:false,replaced:0}):{ok:true,replaced:0};
        if(result?.ok&&state.active){
            state.active.gravityTag=clone(plan.tag);
            state.active.gravityThemedCount=Number(plan.themedCount||0);
            state.active.gravityFillerCount=Number(plan.fillerCount||0);
        }
        return {replaced:Number(result.replaced||0),tag:clone(plan.tag),themedCount:Number(plan.themedCount||0),keptThemedCount:Number(plan.keptThemedCount||0),generatedThemedCount:Number(plan.generatedThemedCount||0),fillerCount:Number(plan.fillerCount||0),cardNames:plan.replacements.map(card=>card?.name||null)};
    }
    function effectRandomChaos(){
        const ctx=context();let changed=0;const results=[];
        (Array.isArray(ctx.players)?ctx.players:[]).forEach((_,playerIndex)=>{
            const indexes=shuffle(randomChaosEligibleIndexes(ctx,playerIndex));
            const index=indexes[0];
            if(!Number.isInteger(index)) return;
            const result=host()?.rerollDeckCard?.(playerIndex,index,{reason:"random_chaos",anomalyId:"random_chaos"});
            if(result?.ok){changed++;results.push({playerIndex,cardIndex:index,from:result.previousCard?.name||null,to:result.resultCard?.name||null});}
        });
        host()?.renderDecks?.();
        return {changed,results};
    }
    function effectCostCut(targetPlan=prepareCostCutTransformPlan(context())){
        const plan=Array.isArray(targetPlan)?targetPlan:[];
        let changed=0;const transformed=[];
        plan.forEach(target=>{
            const ctx=context();
            const index=findCostCutLiveIndex(target,ctx);
            if(index<0) return;
            const liveCard=ctx.currentPack?.[index];
            const replacement=target?.replacement;
            if(!liveCard||Number(liveCard.cost)<5||!replacement||Number(replacement.cost)!==1) return;
            if(host()?.canReplacePackCard?.(index,{reason:"cost_cut_transform",anomalyId:"cost_cut"})===false) return;
            replacement.anomalyCostCut=true;
            replacement.anomalyOriginalCost=Number(target.originalCost??liveCard.cost);
            replacement.anomalyCostCutSourceName=liveCard.name||target.name||null;
            replacement.anomalyCostCutSourceInstanceId=liveCard.instanceId||target.instanceId||null;
            const result=host()?.replacePackAtIndexes?.([index],[replacement],{
                reason:"cost_cut_transform",
                anomalyId:"cost_cut",
                graveyardCategory:"rerolled",
                data:{
                    originalCost:Number(target.originalCost??liveCard.cost),
                    newCost:1,
                    sourceInstanceId:liveCard.instanceId||target.instanceId||null,
                    sourceName:liveCard.name||target.name||null,
                    replacementInstanceId:replacement.instanceId||null,
                    replacementName:replacement.name||null
                }
            });
            if(result?.ok){
                changed++;
                transformed.push({
                    sourceInstanceId:liveCard.instanceId||target.instanceId||null,
                    sourceName:liveCard.name||target.name||null,
                    originalCost:Number(target.originalCost??liveCard.cost),
                    replacementInstanceId:replacement.instanceId||null,
                    replacementName:replacement.name||null,
                    newCost:Number(replacement.cost),
                    index
                });
            }
        });
        return {changed,transformed,mutated:transformed,requested:plan.length};
    }

    function effectNightOfLivingDead(targetPlan=prepareNightOfLivingDeadPlan(context())){
        const plan=(Array.isArray(targetPlan)?targetPlan:[]).filter(item=>Number.isInteger(item?.index)&&item?.replacement);
        let changed=0,graveyardUsed=0,zombieFillers=0;const transformed=[];
        plan.forEach((target,sequence)=>{
            const ctx=context();
            const liveCard=ctx.currentPack?.[Number(target.index)]||null;
            if(!liveCard) return;
            if(host()?.canReplacePackCard?.(Number(target.index),{reason:"night_of_the_living_dead",anomalyId:"night_of_the_living_dead"})===false) return;
            let replacement=target.replacement;
            let source=target.source||replacement?.anomalyLivingDeadSource||"zombie";
            let consumedEntry=null;
            if(source==="graveyard"){
                const entryId=String(target.graveyardEntry?.entryId||"");
                consumedEntry=entryId&&typeof host()?.consumeGraveyardEntry==="function"
                    ? host().consumeGraveyardEntry(entryId,{
                        consumer:"black_hole_anomaly",reason:"night_of_the_living_dead",anomalyId:"night_of_the_living_dead",
                        packNumber:Number(ctx.packStartIndex||0)+1,pickIndex:Number(ctx.currentPickIndex||0)
                    })
                    : null;
                if(consumedEntry?.card){
                    replacement=consumedEntry.card;
                }else if(typeof host()?.consumeGraveyardEntry==="function"){
                    replacement=generateLivingDeadZombieCards(ctx,1,new Set([
                        ...(Array.isArray(ctx.currentPack)?ctx.currentPack:[]).map(card=>normalizeName(card?.name)),
                        ...(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).map(card=>normalizeName(card?.name))
                    ].filter(Boolean)))[0]||null;
                    source="zombie";
                }
            }
            if(!replacement) return;
            replacement.anomalyLivingDead=true;
            replacement.anomalyLivingDeadSource=source;
            replacement.anomalyLivingDeadLabel=source==="graveyard"?"GRAVEYARD":"ZOMBIE";
            const result=host()?.replacePackAtIndexes?.([Number(target.index)],[replacement],{
                reason:"night_of_the_living_dead",anomalyId:"night_of_the_living_dead",archivePrevious:false,
                data:{
                    source,previousInstanceId:liveCard.instanceId||target.previousInstanceId||null,previousName:liveCard.name||target.previousName||null,
                    graveyardEntryId:source==="graveyard"?target.graveyardEntry?.entryId||null:null,
                    replacementInstanceId:replacement.instanceId||null,replacementName:replacement.name||null,sequence
                }
            })||{ok:false,replaced:0};
            if(result?.ok){
                changed+=Number(result.replaced||1);
                if(source==="graveyard") graveyardUsed+=1; else zombieFillers+=1;
                transformed.push({index:Number(target.index),source,name:replacement.name||null,instanceId:replacement.instanceId||null,previousName:liveCard.name||target.previousName||null});
            }else if(consumedEntry&&target.graveyardEntry?.entryId&&typeof host()?.restoreGraveyardEntry==="function"){
                host().restoreGraveyardEntry(target.graveyardEntry.entryId,{consumer:"black_hole_anomaly",reason:"night_of_the_living_dead_rollback",anomalyId:"night_of_the_living_dead"});
            }
        });
        return {changed,graveyardUsed,zombieFillers,transformed,requested:plan.length};
    }
    function findLivingDeadCardElement(target){
        if(typeof document==="undefined") return null;
        const id=String(target?.previousInstanceId||"");
        const buttons=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")];
        if(id){
            const byId=buttons.find(button=>String(button?.dataset?.cardInstanceId||"")===id);
            if(byId) return byId;
        }
        const sourceIndex=String(Number(target?.sourceIndex??target?.index));
        return buttons.find(button=>String(button?.dataset?.packIndex||"")===sourceIndex)||null;
    }
    function clearLivingDeadPackBackdrop(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaLivingDeadBackdrop")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-living-dead-pack-background");
    }
    function ensureLivingDeadPackBackdrop(pack=document.getElementById("pack")){
        if(typeof document==="undefined"||!pack) return null;
        pack.classList.add("bha-living-dead-pack-background");
        let layer=document.getElementById("bhaLivingDeadBackdrop");
        if(layer&&layer.parentElement!==pack) layer.remove?.();
        if(!layer){
            layer=document.createElement("div");
            layer.id="bhaLivingDeadBackdrop";
            layer.className="bha-living-dead-pack-backdrop";
            layer.setAttribute("aria-hidden","true");
            pack.prepend(layer);
        }
        layer.dataset.asset="draft-assets/graveyard_background.webp";
        return layer;
    }
    function clearLivingDeadPackFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaLivingDeadPackFx")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-living-dead-pack-active","bha-living-dead-pack-closing");
    }
    function renderLivingDeadPackFx(ctx=context(),coffinCount=5){
        if(typeof document==="undefined") return null;
        const pack=document.getElementById("pack");
        if(!pack) return null;
        clearLivingDeadPackFx();
        const bounds=getOpenPackCardBounds(pack)||{left:0,top:0,width:pack.clientWidth||640,height:pack.clientHeight||420};
        const layer=document.createElement("div");
        layer.id="bhaLivingDeadPackFx";
        layer.className="bha-living-dead-pack-fx is-summoning";
        layer.setAttribute("aria-hidden","true");
        placeOpenPackLayer(layer,bounds,96,96);
        const visualCount=Math.max(4,Math.min(12,Number(coffinCount)||6));
        const coffins=Array.from({length:visualCount},(_,i)=>`<i class="coffin" style="--coffin-i:${i};--coffin-x:${(-54+(108*(i/(Math.max(1,visualCount-1))))).toFixed(1)}%;--coffin-delay:${(0.10+i*0.08).toFixed(2)}s;--coffin-rot:${(-18+(i%6)*7).toFixed(1)}deg;--coffin-rise:${(138+(i%4)*16).toFixed(1)}px"></i>`).join("");
        layer.innerHTML=`<div class="bha-necro-planet-wrap">
            <div class="bha-necro-aura aura-a"></div><div class="bha-necro-aura aura-b"></div>
            <img class="bha-necro-graveyard-planet" src="draft-assets/graveyard_planet_icon.webp" alt="">
            <div class="bha-necro-gas gas-a"></div><div class="bha-necro-gas gas-b"></div><div class="bha-necro-gas gas-c"></div>
            <div class="bha-necro-title">NOC ŻYWYCH TRUPÓW</div>
            <div class="bha-necro-coffins">${coffins}</div><div class="bha-necro-smog"></div>
        </div>`;
        pack.classList.add("bha-living-dead-pack-active");
        pack.appendChild(layer);
        return layer;
    }
    function playNightOfLivingDeadTransformation(entry,targetPlan,resume){
        const plan=(Array.isArray(targetPlan)?targetPlan:[]).filter(target=>Number.isInteger(target?.index)&&target?.replacement);
        if(!plan.length){
            const outcome=effectNightOfLivingDead([]);
            recordActivation(entry,outcome);
            host()?.render?.();
            setLocked(false);
            resume?.();
            return true;
        }
        if(typeof document==="undefined"){
            const outcome=effectNightOfLivingDead(plan);
            recordActivation(entry,outcome);
            host()?.render?.();
            setLocked(false);
            resume?.();
            return true;
        }
        setLocked(true);
        const stage=renderLivingDeadPackFx(context(),plan.length);
        if(state.active) state.active.livingDeadBackdropActive=true;
        ensureLivingDeadPackBackdrop(document.getElementById("pack"));
        const targets=plan.map((target,order)=>({target,order,button:findLivingDeadCardElement(target)}));
        targets.forEach(({button,order})=>{
            if(!button) return;
            button.classList.add("bha-undead-target");
            button.style.setProperty("--bha-undead-order",String(order));
            setTimeout(()=>button.classList.add("is-undead-armed"),120+order*70);
        });
        const result={changed:0,graveyardUsed:0,zombieFillers:0,transformed:[],requested:plan.length};
        const mutationBase=1380;
        targets.forEach(({target,button,order})=>{
            const mutateAt=mutationBase+order*150;
            setTimeout(()=>button?.classList?.add?.("is-undead-rising"),Math.max(120,mutateAt-260));
            setTimeout(()=>{
                const single=effectNightOfLivingDead([target]);
                result.changed+=Number(single.changed||0);
                result.graveyardUsed+=Number(single.graveyardUsed||0);
                result.zombieFillers+=Number(single.zombieFillers||0);
                result.transformed.push(...(single.transformed||[]));
                if(single.changed){
                    if(state.active) state.active.livingDeadBackdropActive=true;
                    ensureLivingDeadPackBackdrop(document.getElementById("pack"));
                    const rendered=host()?.renderPackCardAt?.(Number(target.index),{className:"bha-undead-card-reveal"});
                    rendered?.element?.classList?.add?.("bha-undead-card","bha-undead-card-reveal");
                    setTimeout(()=>rendered?.element?.classList?.remove?.("bha-undead-card-reveal"),1120);
                }
            },mutateAt);
        });
        const finishAt=mutationBase+targets.length*150+1320;
        setTimeout(()=>{
            recordActivation(entry,result);
            host()?.render?.();
            stage?.classList?.add?.("is-leaving");
            document.getElementById("pack")?.classList?.add?.("bha-living-dead-pack-closing");
            setTimeout(()=>clearLivingDeadPackFx(),620);
            setLocked(false);
            resume?.();
        },finishAt);
        return true;
    }
    function findCostCutCardElement(target){
        if(typeof document==="undefined") return null;
        const id=String(target?.instanceId||"");
        const buttons=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")];
        if(id){
            const byId=buttons.find(button=>String(button?.dataset?.cardInstanceId||"")===id);
            if(byId) return byId;
        }
        const sourceIndex=String(Number(target?.sourceIndex));
        return buttons.find(button=>String(button?.dataset?.packIndex||"")===sourceIndex)||null;
    }
    function decorateCostCutTargetElement(button,target,order=0){
        if(!button||typeof document==="undefined") return;
        button.classList.add("bha-cost-cut-target");
        button.style.setProperty("--bha-cost-cut-order",String(order));
        button.dataset.costCutOriginal=String(target?.originalCost??"");
        if(!button.querySelector(".bha-cost-cut-arrows")){
            const arrows=document.createElement("span");
            arrows.className="bha-cost-cut-arrows";
            [18,35,52,70,84].forEach((x,index)=>{
                const arrow=document.createElement("i");
                arrow.textContent="↓";
                arrow.style.setProperty("--x",`${x}%`);
                arrow.style.setProperty("--delay",`${(index*.11).toFixed(2)}s`);
                arrow.style.setProperty("--scale",String(.72+(index%3)*.18));
                arrows.appendChild(arrow);
            });
            button.appendChild(arrows);
        }
    }
    function playCostCutTransformation(entry,targetPlan,resume){
        const plan=(Array.isArray(targetPlan)?targetPlan:[]).filter(target=>Number(target?.originalCost)>=5);
        if(!plan.length){
            const outcome=effectCostCut([]);
            recordActivation(entry,outcome);
            host()?.render?.();
            setLocked(false);
            resume?.();
            return true;
        }
        if(typeof document==="undefined"){
            const outcome=effectCostCut(plan);
            recordActivation(entry,outcome);
            host()?.render?.();
            setLocked(false);
            resume?.();
            return true;
        }
        setLocked(true);
        const targets=plan.map((target,order)=>({target,order,button:findCostCutCardElement(target)}));
        targets.forEach(({target,order,button})=>decorateCostCutTargetElement(button,target,order));
        requestAnimationFrame(()=>targets.forEach(({button})=>button?.classList?.add?.("is-cost-cut-armed")));

        targets.forEach(({button,order})=>{
            const stagger=order*120;
            setTimeout(()=>button?.classList?.add?.("is-cost-cut-focus"),260+stagger);
            setTimeout(()=>button?.classList?.add?.("is-cost-planet-out"),760+stagger);
        });

        const mutationBase=1480;
        const result={changed:0,mutated:[],requested:plan.length};
        targets.forEach(({target,button,order})=>{
            const mutateAt=mutationBase+order*140;
            setTimeout(()=>{
                const single=effectCostCut([target]);
                result.changed+=Number(single.changed||0);
                result.mutated.push(...(single.mutated||[]));
                if(single.changed){
                    const transformed=single.transformed?.[0]||single.mutated?.[0]||null;
                    const costNode=button?.querySelector?.(".pack-planet");
                    if(costNode) costNode.textContent="1";
                    button?.classList?.add?.("is-cost-cut-changed","is-cost-cut-transforming-out");
                    setTimeout(()=>{
                        const rendered=host()?.renderPackCardAt?.(Number(transformed?.index),{className:"bha-cost-cut-result-reveal"});
                        rendered?.element?.classList?.add?.("bha-card-cost-cut-result","bha-cost-cut-result-reveal");
                    },180);
                }else{
                    button?.classList?.add?.("is-cost-cut-missed");
                }
            },mutateAt);
        });

        const finishAt=mutationBase+Math.max(0,targets.length-1)*140+1120;
        setTimeout(()=>{
            recordActivation(entry,result);
            targets.forEach(({button})=>button?.classList?.add?.("is-cost-cut-finished"));
            setTimeout(()=>{
                host()?.render?.();
                setLocked(false);
                refreshRuntimeInfo();
                resume?.();
            },620);
        },finishAt);
        return true;
    }
    function getGlitchPackMutationCount(totalCards){
        const total=Math.max(0,Number(totalCards)||0);
        if(total<=0) return 0;
        return total<=5 ? total : Math.floor(total/2);
    }
    function prepareGlitchPackCycle(ctx=context()){
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const desired=getGlitchPackMutationCount(pack.length);
        if(!desired) return [];
        const replaceable=shuffle(pack.map((card,index)=>({card,index})).filter(({index})=>
            host()?.canReplacePackCard?.(index,{reason:"glitch_pack_cycle",anomalyId:"glitch_pack"})!==false
        ));
        const targets=replaceable.slice(0,Math.min(desired,replaceable.length));
        if(!targets.length) return [];
        const drafted=(Array.isArray(ctx.decks)?ctx.decks:[]).flatMap(deck=>Array.isArray(deck)?deck:[]).filter(Boolean);
        const replacements=host()?.generateCards?.(targets.length,{
            ignoreCustomPack:true,
            excludeCards:[...pack,...drafted],
            origin:"black_hole_anomaly",
            sourceEvent:"glitch_pack_cycle"
        })||[];
        return targets.slice(0,replacements.length).map((target,sequence)=>({
            index:target.index,
            sourceInstanceId:target.card?.instanceId||null,
            sourceName:target.card?.name||null,
            replacement:replacements[sequence],
            replacementInstanceId:replacements[sequence]?.instanceId||null,
            replacementName:replacements[sequence]?.name||null,
            sequence
        }));
    }
    function findGlitchPackElement(target){
        if(typeof document==="undefined") return null;
        const id=String(target?.sourceInstanceId||"");
        const buttons=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")];
        if(id){
            const byId=buttons.find(button=>String(button?.dataset?.cardInstanceId||"")===id);
            if(byId) return byId;
        }
        return buttons.find(button=>Number(button?.dataset?.packIndex)===Number(target?.index))||null;
    }
    function playGlitchPackCycle(resume){
        const ctx=context();
        const plan=prepareGlitchPackCycle(ctx);
        if(!plan.length) return false;
        setLocked(true);
        host()?.render?.();
        const transformed=[];
        const STEP_GLITCH_MS=260;
        const STEP_SETTLE_MS=170;
        const finish=()=>{
            host()?.log?.("black_hole_anomaly_glitch_cycle",{
                reason:"glitch_pack",
                data:{
                    requested:getGlitchPackMutationCount(Array.isArray(ctx.currentPack)?ctx.currentPack.length:0),
                    transformed:transformed.map(item=>({from:item.sourceName,to:item.replacementName,index:item.index}))
                }
            });
            setTimeout(()=>{
                host()?.render?.();
                if(typeof document!=="undefined"){
                    const pack=document.getElementById("pack");
                    const changedIds=new Set(transformed.map(item=>String(item.replacementInstanceId||"")));
                    const buttons=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")];
                    // The global glitch belongs to the FINAL settle/reflow, not to the start of mutations.
                    pack?.classList?.remove?.("bha-glitch-pack-global-reflow");
                    void pack?.offsetWidth;
                    pack?.classList?.add?.("bha-glitch-pack-global-reflow");
                    setTimeout(()=>pack?.classList?.remove?.("bha-glitch-pack-global-reflow"),640);
                    buttons.forEach(button=>{
                        const id=String(button?.dataset?.cardInstanceId||"");
                        if(!changedIds.has(id)) return;
                        button.classList.add("bha-glitch-pack-changed-frame");
                        setTimeout(()=>button.classList.remove("bha-glitch-pack-changed-frame"),2600);
                    });
                }
                setTimeout(()=>{
                    setLocked(false);
                    refreshRuntimeInfo();
                    resume?.();
                },650);
            },170);
        };
        const step=sequence=>{
            if(sequence>=plan.length){finish();return;}
            const target=plan[sequence];
            const live=context().currentPack?.[target.index];
            if(!live||String(live?.instanceId||"")!==String(target.sourceInstanceId||"")){
                step(sequence+1);return;
            }
            const button=findGlitchPackElement(target);
            if(button){
                button.classList.add("bha-glitch-pack-transform");
                button.style.setProperty("--bha-glitch-seq",String(sequence));
            }
            setTimeout(()=>{
                const current=context().currentPack?.[target.index];
                if(!current||String(current?.instanceId||"")!==String(target.sourceInstanceId||"")){
                    step(sequence+1);return;
                }
                const result=host()?.replacePackAtIndexes?.([target.index],[target.replacement],{
                    reason:"glitch_pack_cycle",
                    anomalyId:"glitch_pack",
                    graveyardCategory:"rerolled",
                    data:{
                        sourceInstanceId:target.sourceInstanceId,
                        sourceName:target.sourceName,
                        replacementInstanceId:target.replacementInstanceId,
                        replacementName:target.replacementName,
                        sequence
                    }
                });
                if(result?.ok){
                    transformed.push(target);
                    const rendered=host()?.renderPackCardAt?.(target.index,{className:"bha-glitch-pack-result"});
                    rendered?.element?.style?.setProperty?.("--bha-glitch-seq",String(sequence));
                }
                setTimeout(()=>step(sequence+1),STEP_SETTLE_MS);
            },STEP_GLITCH_MS);
        };
        step(0);
        return true;
    }

    function battleworldEligibleIndexes(ctx=context(),playerIndex){
        const deck=Array.isArray(ctx.decks?.[Number(playerIndex)])?ctx.decks[Number(playerIndex)]:[];
        return deck.map((card,index)=>({card,index})).filter(entry=>
            entry.card&&host()?.canReplaceDeckCard?.(Number(playerIndex),entry.index,{reason:"battleworld_extraction",anomalyId:"battleworld"})!==false
        ).map(entry=>entry.index);
    }
    function getBattleworldOrder(ctx=context()){
        const playerCount=Math.max(0,Number(ctx.players?.length)||0);
        const seen=new Set(),order=[];
        (Array.isArray(ctx.pickOrder)?ctx.pickOrder:[]).forEach(value=>{
            const p=Number(value);
            if(Number.isInteger(p)&&p>=0&&p<playerCount&&!seen.has(p)){seen.add(p);order.push(p);}
        });
        for(let p=0;p<playerCount;p++) if(!seen.has(p)) order.push(p);
        return order;
    }
    function prepareBattleworldPool(ctx=context()){
        const players=Array.isArray(ctx.players)?ctx.players:[];
        const decks=Array.isArray(ctx.decks)?ctx.decks:[];
        if(players.length<2||decks.length<players.length) return {ok:false,reason:"battleworld_players_missing",entries:[]};
        const entries=[];
        for(let playerIndex=0;playerIndex<players.length;playerIndex++){
            const eligible=battleworldEligibleIndexes(ctx,playerIndex);
            if(!eligible.length) return {ok:false,reason:"battleworld_no_unprotected_card",blockedPlayerIndex:playerIndex,entries:[]};
            const cardIndex=eligible[Math.floor(Math.random()*eligible.length)];
            const card=decks[playerIndex]?.[cardIndex];
            if(!card) return {ok:false,reason:"battleworld_card_missing",blockedPlayerIndex:playerIndex,entries:[]};
            entries.push({
                originPlayerIndex:playerIndex,
                originPlayerName:players[playerIndex]||`GRACZ ${playerIndex+1}`,
                sourceCardIndex:cardIndex,
                sourceInstanceId:card.instanceId||null,
                card
            });
        }
        return {ok:true,entries,order:getBattleworldOrder(ctx)};
    }
    function clearBattleworldPresentation(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaBattleworldOverlay")?.remove?.();
        const queueTitle=document.querySelector("#roundQueue")?.previousElementSibling;
        if(queueTitle?.dataset?.battleworldOriginalTitle!==undefined){
            queueTitle.textContent=queueTitle.dataset.battleworldOriginalTitle||"KOLEJKA PACZKI";
            delete queueTitle.dataset.battleworldOriginalTitle;
        }
        const queue=document.getElementById("roundQueue");
        queue?.closest?.(".info-panel--queue")?.classList?.remove?.("bha-battleworld-queue-panel");
        const banner=document.getElementById("currentPickerBanner");
        banner?.classList?.remove?.("bha-battleworld-picker-banner");
        document.body?.classList?.remove?.("bha-battleworld-active");
    }
    function battleworldCardPosition(index,total){
        const count=Math.max(1,Number(total)||1);
        const t=count===1?.5:index/Math.max(1,count-1);
        const angle=(205+(330-205)*t)*Math.PI/180;
        const radiusX=Math.min(36,24+count*1.5);
        const radiusY=Math.min(30,20+count*1.2);
        return {
            x:50+Math.cos(angle)*radiusX,
            y:54+Math.sin(angle)*radiusY,
            rot:-12+t*24
        };
    }
    function reflowBattleworldCards(session,animate=true){
        if(!session||typeof document==="undefined") return;
        const live=session.pool.filter(entry=>entry&&!entry.claimed&&entry.slot);
        live.forEach((entry,index)=>{
            const pos=battleworldCardPosition(index,live.length||1);
            entry.slot.style.setProperty("--bw-x",`${pos.x}%`);
            entry.slot.style.setProperty("--bw-y",`${pos.y}%`);
            entry.slot.style.setProperty("--bw-rot",`${pos.rot.toFixed(1)}deg`);
            if(animate){
                entry.slot.classList.remove("is-reflowing");
                void entry.slot.offsetWidth;
                entry.slot.classList.add("is-reflowing");
                setTimeout(()=>entry.slot?.classList?.remove?.("is-reflowing"),420);
            }
        });
    }
    function buildBattleworldOverlay(session){
        if(typeof document==="undefined") return null;
        clearBattleworldPresentation();
        const overlay=document.createElement("div");
        overlay.id="bhaBattleworldOverlay";
        overlay.className="bha-battleworld-overlay is-entering";
        overlay.innerHTML=`
            <div class="bha-battleworld-stars" aria-hidden="true"></div>
            <div class="bha-battleworld-shell">
                <div class="bha-battleworld-heading"><small>LEGENDARNA ANOMALIA</small><strong>BATTLEWORLD</strong><span id="bhaBattleworldPhase">KARTY ZOSTAJĄ WYRWANE Z DECKÓW</span></div>
                <div class="bha-battleworld-arena">
                    <img class="bha-battleworld-planet" src="draft-assets/bha_battleworld_planet.webp" alt="Battleworld">
                    <div class="bha-battleworld-planet-glow" aria-hidden="true"></div>
                    <div class="bha-battleworld-cardfield" id="bhaBattleworldCardfield"></div>
                </div>
                <div class="bha-battleworld-picker" id="bhaBattleworldPicker" hidden></div>
                <div class="bha-battleworld-hint" id="bhaBattleworldHint">BATTLEWORLD ZBIERA SWOJE ŁUPY…</div>
            </div>`;
        document.body.appendChild(overlay);
        document.body.classList.add("bha-battleworld-active");
        requestAnimationFrame(()=>overlay.classList.remove("is-entering"));
        return overlay;
    }
    function setBattleworldQueueUi(session){
        if(typeof document==="undefined"||!session) return;
        const queue=document.getElementById("roundQueue");
        const title=queue?.previousElementSibling;
        if(title){
            if(title.dataset.battleworldOriginalTitle===undefined) title.dataset.battleworldOriginalTitle=title.textContent||"KOLEJKA PACZKI";
            title.textContent="KOLEJKA BATTLEWORLD";
        }
        if(queue){
            queue.closest?.(".info-panel--queue")?.classList?.add?.("bha-battleworld-queue-panel");
            queue.innerHTML="";
            session.order.forEach((playerIndex,index)=>{
                const node=document.createElement("div");
                node.textContent=session.players[playerIndex]||`Gracz ${playerIndex+1}`;
                node.className="bha-battleworld-queue-player"+(index===session.turnIndex?" current-player":"")+(index<session.turnIndex?" is-done":"");
                const color=host()?.getPlayerColor?.(playerIndex)||"#7eefff";
                node.style.color=color;
                queue.appendChild(node);
            });
        }
        const current=session.order[session.turnIndex];
        const banner=document.getElementById("currentPickerBanner");
        if(Number.isInteger(current)){
            const color=host()?.getPlayerColor?.(current)||"#7eefff";
            const name=escapeHtml(session.players[current]||`GRACZ ${current+1}`);
            if(banner){
                banner.style.display="block";
                banner.classList.add("bha-battleworld-picker-banner");
                banner.innerHTML=`BATTLEWORLD • WYBIERA: <span class="pickerName" style="color:${color};text-shadow:0 0 12px ${color},0 0 28px ${color};">${name}</span>`;
            }
            const overlayPicker=document.getElementById("bhaBattleworldPicker");
            if(overlayPicker){
                overlayPicker.hidden=false;
                overlayPicker.innerHTML=`WYBIERA: <span style="color:${color};text-shadow:0 0 12px ${color},0 0 28px ${color};">${name}</span>`;
            }
        }
    }
    function makeBattleworldCardNode(entry,index,total,session){
        if(typeof document==="undefined") return null;
        const field=document.getElementById("bhaBattleworldCardfield");
        if(!field) return null;
        const pos=battleworldCardPosition(index,total);
        const slot=document.createElement("div");
        slot.className="bha-battleworld-card-slot";
        slot.dataset.battleworldPoolIndex=String(index);
        slot.style.setProperty("--bw-x",`${pos.x}%`);
        slot.style.setProperty("--bw-y",`${pos.y}%`);
        slot.style.setProperty("--bw-rot",`${pos.rot.toFixed(1)}deg`);
        const button=host()?.buildBattleworldCard?.(entry.card,index)||document.createElement("button");
        button.classList.add("bha-battleworld-card");
        button.disabled=true;
        button.onclick=()=>selectBattleworldCard(index);
        const badge=document.createElement("span");
        badge.className="bha-battleworld-origin";
        badge.textContent=String(entry.originPlayerName||`Gracz ${Number(entry.originPlayerIndex)+1}`);
        badge.style.setProperty("--bw-owner",host()?.getPlayerColor?.(entry.originPlayerIndex)||"#7eefff");
        const impact=document.createElement("span");
        impact.className="bha-battleworld-impact";
        const fire=document.createElement("span");
        fire.className="bha-battleworld-fire";
        slot.appendChild(impact);
        slot.appendChild(fire);
        slot.appendChild(button);
        slot.appendChild(badge);
        field.appendChild(slot);
        entry.slot=slot;
        entry.button=button;
        return slot;
    }
    function flyBattleworldCard(entry,sourceRect,targetRect){
        if(typeof document==="undefined") return Promise.resolve();
        const flight=host()?.buildBattleworldCard?.(entry.card,-1)||document.createElement("div");
        flight.classList.add("bha-battleworld-flight-card");
        const trail=document.createElement("span");
        trail.className="bha-battleworld-flight-trail";
        flight.appendChild(trail);
        const start=sourceRect||{left:innerWidth/2,top:innerHeight+80,width:120,height:160};
        const end=targetRect||{left:innerWidth/2-60,top:innerHeight/2-80,width:120,height:160};
        Object.assign(flight.style,{position:"fixed",left:`${start.left}px`,top:`${start.top}px`,width:`${Math.max(70,start.width||120)}px`,height:`${Math.max(100,start.height||160)}px`,zIndex:"1000006",pointerEvents:"none",margin:"0"});
        document.body.appendChild(flight);
        const dx=(end.left-start.left),dy=(end.top-start.top);
        const sx=(end.width||120)/Math.max(1,start.width||120),sy=(end.height||160)/Math.max(1,start.height||160);
        const animation=flight.animate([
            {transform:"translate3d(0,0,0) rotate(-8deg) scale(1)",filter:"brightness(1) drop-shadow(0 0 0 rgba(0,0,0,0))",opacity:1},
            {offset:.55,transform:`translate3d(${(dx*.58).toFixed(1)}px,${(dy*.42-70).toFixed(1)}px,0) rotate(9deg) scale(1.08)`,filter:"brightness(1.45) drop-shadow(0 0 22px rgba(110,213,255,.9))",opacity:1},
            {transform:`translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0) rotate(0deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`,filter:"brightness(1.08) drop-shadow(0 0 12px rgba(255,177,60,.75))",opacity:.98}
        ],{duration:720,easing:"cubic-bezier(.18,.78,.2,1)",fill:"forwards"});
        return animation.finished.catch(()=>{}).then(()=>flight.remove());
    }
    function animateBattleworldExtraction(session){
        const overlay=document.getElementById("bhaBattleworldOverlay");
        const phase=document.getElementById("bhaBattleworldPhase");
        const hint=document.getElementById("bhaBattleworldHint");
        if(phase) phase.textContent="BATTLEWORLD WYRYWA PO JEDNEJ KARCIE";
        let chain=Promise.resolve();
        session.pool.forEach((entry,index)=>{
            chain=chain.then(()=>new Promise(resolve=>setTimeout(resolve,index?180:250))).then(async()=>{
                const ctx=context();
                const deck=ctx.decks?.[entry.originPlayerIndex]||[];
                let liveIndex=deck.findIndex(card=>String(card?.instanceId||"")===String(entry.sourceInstanceId||""));
                if(liveIndex<0) liveIndex=deck.indexOf(entry.card);
                if(liveIndex<0) throw new Error("battleworld_live_card_missing");
                const sourceRect=host()?.getDeckCardRect?.(entry.originPlayerIndex,entry.card)||null;
                const taken=host()?.takeDeckCard?.(entry.originPlayerIndex,liveIndex,{reason:"battleworld_extraction",anomalyId:"battleworld"});
                if(!taken?.ok) throw new Error(taken?.reason||"battleworld_take_failed");
                entry.card=taken.card||entry.card;
                host()?.renderDecks?.();
                const slot=makeBattleworldCardNode(entry,index,session.pool.length,session);
                if(!slot) return;
                const targetRect=slot.querySelector(".bha-battleworld-card")?.getBoundingClientRect?.()||slot.getBoundingClientRect?.();
                slot.classList.add("is-awaiting-impact");
                await flyBattleworldCard(entry,sourceRect,targetRect);
                slot.classList.remove("is-awaiting-impact");
                slot.classList.add("is-landed");
                await new Promise(resolve=>setTimeout(resolve,150));
            });
        });
        chain.then(()=>{
            if(phase) phase.textContent="WALKA O KARTY BATTLEWORLD";
            if(hint) hint.textContent="KAŻDY GRACZ WYBIERA JEDNĄ KARTĘ";
            session.phase="draft";
            session.pool.forEach(entry=>{if(entry.button) entry.button.disabled=false;});
            setBattleworldQueueUi(session);
            overlay?.classList?.add?.("is-draft-phase");
        }).catch(error=>abortBattleworldSession(error?.message||"battleworld_extraction_failed"));
    }
    function selectBattleworldCard(poolIndex){
        const session=battleworldSession;
        if(!session||session.phase!=="draft"||session.busy) return false;
        const index=Number(poolIndex),entry=session.pool[index];
        const playerIndex=session.order[session.turnIndex];
        if(!entry||entry.claimed||!Number.isInteger(playerIndex)) return false;
        session.busy=true;
        session.pool.forEach(item=>{if(item.button) item.button.disabled=true;});
        const sourceRect=entry.button?.getBoundingClientRect?.()||entry.slot?.getBoundingClientRect?.();
        const targetRect=host()?.getDeckDropRect?.(playerIndex)||null;
        entry.slot?.classList?.add?.("is-picked");
        setTimeout(()=>{
            entry.slot?.classList?.add?.("is-claimed");
            flyBattleworldCard(entry,sourceRect,targetRect).then(()=>{
                const given=host()?.giveDeckCard?.(playerIndex,entry.card,{reason:"battleworld_redraft",anomalyId:"battleworld",originPlayerIndex:entry.originPlayerIndex});
                if(!given?.ok){
                    abortBattleworldSession("battleworld_give_failed");
                    return;
                }
                entry.claimed=true;
                entry.claimedByPlayerIndex=playerIndex;
                entry.slot?.remove?.();
                host()?.renderDecks?.();
                reflowBattleworldCards(session,true);
                host()?.log?.("black_hole_anomaly_battleworld_pick",{reason:"battleworld",data:{playerIndex,playerName:session.players[playerIndex],originPlayerIndex:entry.originPlayerIndex,originPlayerName:entry.originPlayerName,cardName:entry.card?.name||null,cardInstanceId:entry.card?.instanceId||null,battleworldPickIndex:session.turnIndex}});
                session.turnIndex++;
                session.busy=false;
                if(session.turnIndex>=session.order.length){finishBattleworldSession();return;}
                session.pool.forEach(item=>{if(item.button&&!item.claimed) item.button.disabled=false;});
                setBattleworldQueueUi(session);
            });
        },360);
        return true;
    }
    function abortBattleworldSession(reason="battleworld_aborted"){
        const session=battleworldSession;
        if(!session) return false;
        session.phase="aborted";
        if(session.transactionId) host()?.rollbackTransaction?.(session.transactionId,{reason});
        host()?.log?.("black_hole_anomaly_battleworld_aborted",{reason,data:{reason}});
        clearBattleworldPresentation();
        battleworldSession=null;
        setLocked(false);
        refreshRuntimeInfo();
        host()?.renderStatus?.();
        session.resume?.();
        return true;
    }

    function finishBattleworldSession(){
        const session=battleworldSession;
        if(!session) return;
        session.phase="outro";
        const overlay=document.getElementById("bhaBattleworldOverlay");
        const phase=document.getElementById("bhaBattleworldPhase");
        const hint=document.getElementById("bhaBattleworldHint");
        if(phase) phase.textContent="BATTLEWORLD ROZSTRZYGNIĘTY";
        if(hint) hint.textContent="KARTY WRACAJĄ DO NOWYCH WŁAŚCICIELI";
        overlay?.classList?.add?.("is-complete");
        const outcome={
            participants:session.players.length,
            order:[...session.order],
            cards:session.pool.map(entry=>({name:entry.card?.name||null,instanceId:entry.card?.instanceId||null,originPlayerIndex:entry.originPlayerIndex,originPlayerName:entry.originPlayerName,claimedByPlayerIndex:entry.claimedByPlayerIndex}))
        };
        if(session.transactionId&&!host()?.commitTransaction?.(session.transactionId,{reason:"battleworld_complete",outcome:clone(outcome)})){
            abortBattleworldSession("battleworld_commit_failed");
            return;
        }
        session.transactionId=null;
        host()?.captureSnapshot?.("after_battleworld");
        setTimeout(()=>{
            clearBattleworldPresentation();
            battleworldSession=null;
            setLocked(false);
            refreshRuntimeInfo();
            host()?.renderStatus?.();
            session.resume?.();
        },1050);
        if(session.event) session.event.outcome=clone(outcome);
    }
    function startBattleworldSession(entry,prepared,resume){
        const ctx=context();
        const tx=host()?.beginTransaction?.("battleworld",{packNumber:Number(ctx.packStartIndex||0)+1,players:[...(ctx.players||[])],order:[...prepared.order]})||{ok:false};
        if(!tx?.ok){
            recordActivation(entry,{started:false,reason:tx?.reason||"battleworld_transaction_unavailable"});
            refreshRuntimeInfo();
            resume?.();
            return true;
        }
        const event=recordActivation(entry,{started:true,participants:prepared.entries.length,cards:prepared.entries.map(item=>({name:item.card?.name||null,instanceId:item.card?.instanceId||null,originPlayerIndex:item.originPlayerIndex,originPlayerName:item.originPlayerName}))});
        setLocked(true);
        host()?.captureSnapshot?.("before_battleworld");
        battleworldSession={
            phase:"intro",
            busy:false,
            turnIndex:0,
            order:prepared.order,
            pool:prepared.entries,
            players:[...(ctx.players||state.draftPlayers||[])],
            resume,
            event,
            transactionId:tx.transactionId||null
        };
        buildBattleworldOverlay(battleworldSession);
        setBattleworldQueueUi(battleworldSession);
        setTimeout(()=>animateBattleworldExtraction(battleworldSession),520);
        return true;
    }
    function runBattleworld(entry,resume){
        if(!state.enabled||!entry||entry.triggered||battleworldSession) return false;
        const prepared=prepareBattleworldPool(context());
        if(!prepared.ok){
            recordActivation(entry,{started:false,reason:prepared.reason,blockedPlayerIndex:prepared.blockedPlayerIndex??null});
            refreshRuntimeInfo();
            resume?.();
            return true;
        }
        showBattleworldActivationIntro(entry,()=>startBattleworldSession(entry,prepared,resume));
        return true;
    }

    function effectSunAndMoon(){
        const ctx=context(),pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const counts=ensureSunMoonAssignments(pack,{reset:true});
        const players=ctx.players||state.draftPlayers||[];
        const sidePool=shuffle(players.map((_,index)=>index%2?"moon":"sun"));
        const playerSides={};
        players.forEach((_,playerIndex)=>{playerSides[playerIndex]=sidePool[playerIndex]||"sun";});
        if(state.active) state.active.playerSides=playerSides;
        return {sun:counts.sun,moon:counts.moon,playerSides:clone(playerSides)};
    }
    function buildInvisibleQueueRound(players,random=Math.random){
        return shuffle(players.map((_,index)=>index),random);
    }
    function effectInvisibleQueue(ctx=context()){
        const players=Array.isArray(ctx.players)?ctx.players:[];
        const order=Array.isArray(ctx.pickOrder)?ctx.pickOrder:null;
        if(!players.length||!order) return {ok:false,reason:"queue_unavailable"};
        const roundOne=buildInvisibleQueueRound(players,Math.random);
        let roundTwo=buildInvisibleQueueRound(players,Math.random);
        // Canon: każdy gracz dokładnie raz na rundę i brak podwójnego turnu na styku rund.
        if(players.length>1&&roundOne.length&&roundTwo.length&&roundOne[roundOne.length-1]===roundTwo[0]){
            const swapIndex=roundTwo.findIndex((player,index)=>index>0&&player!==roundOne[roundOne.length-1]);
            if(swapIndex>0){
                const tmp=roundTwo[0];roundTwo[0]=roundTwo[swapIndex];roundTwo[swapIndex]=tmp;
            }
        }
        const originalOrder=[...order];
        const hiddenOrder=[...roundOne,...roundTwo];
        order.splice(0,order.length,...hiddenOrder);
        const payload={
            roundOne:[...roundOne],
            roundTwo:[...roundTwo],
            hiddenOrder:[...hiddenOrder],
            originalPickOrder:originalOrder,
            createdAtPackIndex:Number(ctx.packStartIndex||0),
            frozen:true
        };
        if(state.active) state.active.invisibleQueue=clone(payload);
        host()?.log?.("invisible_queue_created",{
            packNumber:Number(ctx.packStartIndex||0)+1,
            reason:"invisible_queue",
            data:{roundOne:[...roundOne],roundTwo:[...roundTwo],originalPickOrder:originalOrder,newPickOrder:[...hiddenOrder]}
        });
        return {ok:true,...clone(payload)};
    }
    function getInvisibleQueueState(packContext=context()){
        if(!state.enabled||state.active?.id!=="invisible_queue"||!state.active?.triggered||!state.active?.invisibleQueue) return null;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(Number(ctx?.packStartIndex??-1)!==Number(state.active?.packIndex??-2)) return null;
        return {
            active:true,
            frozen:true,
            currentPickIndex:Number(ctx?.currentPickIndex??0),
            totalTurns:Number(state.active.invisibleQueue.hiddenOrder?.length||0),
            roundSize:Array.isArray(ctx?.players)?ctx.players.length:0,
            packIndex:Number(state.active.packIndex??ctx?.packStartIndex??0)
        };
    }
    function isQueueFrozen(packContext=context()){
        return Boolean(getInvisibleQueueState(packContext)?.active);
    }

    function effectKlyntarSymbiosis(ctx=context()){
        const players=Array.isArray(ctx.players)?ctx.players:[];
        const order=Array.isArray(ctx.pickOrder)?ctx.pickOrder:null;
        if(!players.length||!order) return {ok:false,reason:"queue_unavailable"};
        const shuffled=shuffle(players.map((_,index)=>index));
        const pairs=[];
        let solo=null;
        for(let i=0;i<shuffled.length;i+=2){
            const first=shuffled[i],second=shuffled[i+1];
            if(Number.isInteger(second)) pairs.push({id:`klyntar_pair_${pairs.length+1}`,players:[first,second]});
            else solo=first;
        }
        const turns=[];
        pairs.forEach(pair=>turns.push({pairId:pair.id,controller:pair.players[0],partner:pair.players[1],solo:false,phase:1}));
        if(Number.isInteger(solo)) turns.push({pairId:"klyntar_solo",controller:solo,partner:null,solo:true,phase:1});
        pairs.forEach(pair=>turns.push({pairId:pair.id,controller:pair.players[1],partner:pair.players[0],solo:false,phase:2}));
        if(Number.isInteger(solo)) turns.push({pairId:"klyntar_solo",controller:solo,partner:null,solo:true,phase:2});
        const originalOrder=[...order];
        order.splice(0,order.length,...turns.map(turn=>turn.controller));
        if(state.active){
            state.active.klyntar={pairs:clone(pairs),solo:Number.isInteger(solo)?solo:null,turns:clone(turns),originalPickOrder:originalOrder};
        }
        host()?.log?.("klyntar_symbiosis_queue_created",{
            packNumber:Number(ctx.packStartIndex||0)+1,
            reason:"klyntar_haunting",
            data:{pairs:clone(pairs),solo:Number.isInteger(solo)?solo:null,turns:clone(turns),originalPickOrder:originalOrder,newPickOrder:[...order]}
        });
        return {ok:true,pairs:clone(pairs),solo:Number.isInteger(solo)?solo:null,turns:clone(turns),originalPickOrder:originalOrder,newPickOrder:[...order]};
    }
    function getKlyntarTurnMeta(packContext=context()){
        if(!state.enabled||state.active?.id!=="klyntar_haunting"||!state.active?.triggered||!state.active?.klyntar) return null;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(Number(ctx?.packStartIndex??-1)!==Number(state.active?.packIndex??-2)) return null;
        const pickIndex=Number(ctx?.currentPickIndex??0);
        const turn=state.active.klyntar.turns?.[pickIndex];
        if(!turn) return null;
        return {...clone(turn),pickIndex,pairs:clone(state.active.klyntar.pairs||[]),soloPlayerIndex:state.active.klyntar.solo};
    }
    function getKlyntarQueueState(packContext=context()){
        if(!state.enabled||state.active?.id!=="klyntar_haunting"||!state.active?.triggered||!state.active?.klyntar) return null;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(Number(ctx?.packStartIndex??-1)!==Number(state.active?.packIndex??-2)) return null;
        return {active:true,...clone(state.active.klyntar),currentPickIndex:Number(ctx?.currentPickIndex??0)};
    }
    function resolveKlyntarSymbiosisPick(payload={}){
        const suppliedTurn=payload?.turnMeta&&typeof payload.turnMeta==="object"?payload.turnMeta:null;
        const turn=suppliedTurn||getKlyntarTurnMeta(context());
        if(!turn||turn.solo||!Number.isInteger(Number(turn.partner))) return {handled:false,solo:Boolean(turn?.solo)};
        const committedPlayer=Number(payload?.playerIndex);
        if(Number.isInteger(committedPlayer)&&committedPlayer!==Number(turn.controller)){
            host()?.log?.("klyntar_symbiosis_controller_mismatch",{
                packNumber:Number(context()?.packStartIndex||0)+1,
                reason:"klyntar_haunting",
                data:{expectedController:Number(turn.controller),committedPlayer,pickIndex:Number(turn.pickIndex??context()?.currentPickIndex??0)}
            });
            return {handled:false,reason:"controller_mismatch",turn};
        }
        const result=host()?.resolveKlyntarSharedPick?.({
            controllerIndex:Number(turn.controller),
            partnerIndex:Number(turn.partner),
            pairId:turn.pairId,
            phase:Number(turn.phase||1),
            sourceCard:payload?.sourceCard||payload?.card||null,
            resultCard:payload?.resultCard||payload?.card||null
        })||{ok:false,reason:"host_unavailable"};
        if(result?.ok){
            host()?.log?.("klyntar_symbiosis_pick_resolved",{
                packNumber:Number(context()?.packStartIndex||0)+1,
                reason:"klyntar_haunting",
                data:{controllerIndex:Number(turn.controller),partnerIndex:Number(turn.partner),pairId:turn.pairId,phase:Number(turn.phase||1),partnerCardName:result.partnerCard?.name||null,burnedCardName:result.burnedCard?.name||null,replacement:Boolean(result.replacement)}
            });
        }else{
            host()?.log?.("klyntar_symbiosis_pick_failed",{
                packNumber:Number(context()?.packStartIndex||0)+1,
                reason:"klyntar_haunting",
                data:{controllerIndex:Number(turn.controller),partnerIndex:Number(turn.partner),pairId:turn.pairId,phase:Number(turn.phase||1),failureReason:result?.reason||"unknown"}
            });
        }
        return {handled:Boolean(result?.ok),turn,result};
    }

    function forbiddenFruitCardTags(card){
        return new Set((Array.isArray(card?.tags)?card.tags:[]).map(tag=>String(tag||"").trim().toLowerCase()).filter(Boolean));
    }
    function forbiddenFruitRuleMatches(card,rule){
        if(!card||!rule) return false;
        const tags=forbiddenFruitCardTags(card);
        if(rule.kind==="ability") return tags.has(String(rule.tagId||""));
        if(rule.kind==="mechanic") return (Array.isArray(rule.tagIds)?rule.tagIds:[]).some(id=>tags.has(String(id||"")));
        if(rule.kind==="cost") return (Array.isArray(rule.costs)?rule.costs:[]).includes(Number(card?.cost));
        if(rule.kind==="power"){
            const power=Number(card?.power);
            if(!Number.isFinite(power)) return false;
            return rule.operator==="lt"?power<Number(rule.value):power>Number(rule.value);
        }
        return false;
    }
    function forbiddenFruitRuleSignature(rule){
        if(!rule) return "";
        if(rule.kind==="ability") return `ability:${rule.tagId}`;
        if(rule.kind==="mechanic") return `mechanic:${[...(rule.tagIds||[])].sort().join("+")}`;
        if(rule.kind==="cost") return `cost:${[...(rule.costs||[])].sort((a,b)=>a-b).join("+")}`;
        if(rule.kind==="power") return `power:${rule.operator}:${rule.value}`;
        return JSON.stringify(rule);
    }
    function forbiddenFruitRuleLabel(rule){
        if(!rule) return {kicker:"ZAKAZ ZNIESIONY",main:"WYBÓR DOWOLNY"};
        if(rule.kind==="ability") return {kicker:"ZAKAZANY TYP",main:String(rule.name||rule.tagId||"").toUpperCase()};
        if(rule.kind==="mechanic") return {kicker:"ZAKAZANE MECHANIKI",main:(Array.isArray(rule.names)?rule.names:rule.tagIds||[]).map(name=>String(name).toUpperCase()).join(" + ")};
        if(rule.kind==="cost") return {kicker:"ZAKAZANE KOSZTY",main:(rule.costs||[]).join(" • ")};
        if(rule.kind==="power") return {kicker:"ZAKAZANA SIŁA",main:`${rule.operator==="lt"?"<":">"} ${Number(rule.value)}`};
        return {kicker:"ZAKAZ ZNIESIONY",main:"WYBÓR DOWOLNY"};
    }
    function forbiddenFruitHasLegalCard(rule,ctx=context()){
        if(!rule) return true;
        const pack=(Array.isArray(ctx?.currentPack)?ctx.currentPack:[]).filter(Boolean);
        if(!pack.length) return true;
        return pack.some(card=>!forbiddenFruitRuleMatches(card,rule));
    }
    function forbiddenFruitRuleValidity(rule,ctx=context()){
        const pack=(Array.isArray(ctx?.currentPack)?ctx.currentPack:[]).filter(Boolean);
        if(pack.length<2) return {valid:false,blocked:0,legal:pack.length};
        const blocked=pack.filter(card=>forbiddenFruitRuleMatches(card,rule)).length;
        const legal=pack.length-blocked;
        return {valid:blocked>=1&&legal>=1,blocked,legal};
    }
    function forbiddenFruitMechanicCatalog(){
        const catalog=host()?.getTagCatalog?.()?.mechanicFamilies;
        const fallback=[
            ["afflict","Afflict"],["bounce","Bounce"],["buff","Buff"],["card-generation","Card Generation"],["clog","Clog"],["cost","Cost"],["destroy","Destroy"],["discard","Discard"],["disruption","Disruption"],["downside","Downside"],["draw","Draw"],["energy","Energy"],["merge","Merge"],["move","Move"],["power-support","Power Support"],["skills","Skills"],["tech","Tech"],["zombie-horde","Zombie Horde"]
        ].map(([id,name])=>({id,name}));
        return (Array.isArray(catalog)&&catalog.length?catalog:fallback).map(tag=>({id:String(tag?.id||"").toLowerCase(),name:String(tag?.name||tag?.id||"")})).filter(tag=>tag.id);
    }
    function forbiddenFruitAllRules(ctx=context()){
        const rules=[];
        FORBIDDEN_FRUIT_ABILITY_TYPES.forEach(item=>rules.push({kind:"ability",tagId:item.id,name:item.name}));
        const mechanics=forbiddenFruitMechanicCatalog();
        for(let i=0;i<mechanics.length;i++) for(let j=i+1;j<mechanics.length;j++) rules.push({kind:"mechanic",tagIds:[mechanics[i].id,mechanics[j].id],names:[mechanics[i].name,mechanics[j].name]});
        const costs=[...FORBIDDEN_FRUIT_COST_POOL];
        for(let a=0;a<costs.length;a++) for(let b=a+1;b<costs.length;b++) for(let c=b+1;c<costs.length;c++) rules.push({kind:"cost",costs:[costs[a],costs[b],costs[c]]});
        rules.push({kind:"power",operator:"lt",value:5},{kind:"power",operator:"gt",value:5});
        return rules.map(rule=>({...rule,...forbiddenFruitRuleValidity(rule,ctx)})).filter(rule=>rule.valid);
    }
    function rollForbiddenFruitRule(ctx=context(),excludeSignature="",random=Math.random){
        const valid=forbiddenFruitAllRules(ctx);
        if(!valid.length) return null;
        const byKind=new Map();
        valid.forEach(rule=>{if(!byKind.has(rule.kind)) byKind.set(rule.kind,[]);byKind.get(rule.kind).push(rule);});
        let kinds=[...byKind.keys()];
        if(!kinds.length) return null;
        kinds=shuffle(kinds,random);
        for(const kind of kinds){
            let candidates=byKind.get(kind)||[];
            const fresh=candidates.filter(rule=>forbiddenFruitRuleSignature(rule)!==excludeSignature);
            if(fresh.length) candidates=fresh;
            const picked=chooseUniform(candidates,random);
            if(picked) return clone(picked);
        }
        return clone(valid[0]);
    }
    function effectForbiddenFruit(ctx=context()){
        const rule=rollForbiddenFruitRule(ctx,"",Math.random);
        const activatedAfterPick=Number(ctx?.currentPickIndex||0)+1;
        if(state.active){
            state.active.forbiddenFruit={
                active:Boolean(rule),
                activatedAfterPick,
                rule:clone(rule),
                ruleIndex:rule?1:0,
                lastRuleChangedAt:Date.now(),
                history:rule?[{rule:clone(rule),activatedAfterPick,at:new Date().toISOString()}]:[]
            };
        }
        host()?.log?.("forbidden_fruit_activated",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"forbidden_fruit",data:{triggerAfterPick:Number(state.active?.triggerAfterPick||activatedAfterPick),activatedAfterPick,rule:clone(rule)}});
        return {active:Boolean(rule),activatedAfterPick,rule:clone(rule)};
    }
    function rotateForbiddenFruitRule(ctx=context()){
        if(state.active?.id!=="forbidden_fruit"||!state.active?.triggered||!state.active?.forbiddenFruit?.active) return null;
        const fruit=state.active.forbiddenFruit;
        const previousSignature=forbiddenFruitRuleSignature(fruit.rule);
        const next=rollForbiddenFruitRule(ctx,previousSignature,Math.random);
        if(!next){
            if(fruit.rule&&!forbiddenFruitHasLegalCard(fruit.rule,ctx)){
                fruit.rule=null;
                fruit.exhausted=true;
                fruit.lastRuleChangedAt=Date.now();
                host()?.log?.("forbidden_fruit_rule_exhausted",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"forbidden_fruit_all_blocked",data:{afterResolvedPick:Number(ctx?.currentPickIndex||0)+1}});
            }
            return null;
        }
        fruit.rule=clone(next);
        fruit.exhausted=false;
        fruit.ruleIndex=Number(fruit.ruleIndex||0)+1;
        fruit.lastRuleChangedAt=Date.now();
        fruit.history=Array.isArray(fruit.history)?fruit.history:[];
        fruit.history.push({rule:clone(next),afterResolvedPick:Number(ctx?.currentPickIndex||0)+1,at:new Date().toISOString()});
        host()?.log?.("forbidden_fruit_rule_changed",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"forbidden_fruit",data:{ruleIndex:fruit.ruleIndex,rule:clone(next),afterResolvedPick:Number(ctx?.currentPickIndex||0)+1}});
        return clone(next);
    }
    function getForbiddenFruitState(packContext=context()){
        if(!state.enabled||state.active?.id!=="forbidden_fruit"||!state.active?.triggered||!state.active?.forbiddenFruit?.active) return null;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(Number(ctx?.packStartIndex??-1)!==Number(state.active?.packIndex??-2)) return null;
        const rawRule=state.active.forbiddenFruit.rule||null;
        const hasLegal=forbiddenFruitHasLegalCard(rawRule,ctx);
        const rule=hasLegal?clone(rawRule):null;
        return {...clone(state.active.forbiddenFruit),rule,exhausted:Boolean(!hasLegal||state.active.forbiddenFruit.exhausted),label:forbiddenFruitRuleLabel(rule)};
    }
    function clearForbiddenFruitFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaForbiddenFruitFx")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-forbidden-fruit-pack");
    }
    function renderForbiddenFruitFx(){
        if(typeof document==="undefined") return false;
        const fruit=getForbiddenFruitState(context());
        const pack=document.getElementById("pack");
        if(!fruit||!pack){clearForbiddenFruitFx();return false;}
        let fx=document.getElementById("bhaForbiddenFruitFx");
        if(!fx){
            fx=document.createElement("div");
            fx.id="bhaForbiddenFruitFx";
            fx.className="bha-forbidden-fruit-fx is-growing";
            fx.setAttribute("aria-hidden","true");
            fx.innerHTML=`<img src="${FORBIDDEN_FRUIT_ASSET}" alt=""><div class="bha-forbidden-fruit-copy"><small></small><b></b></div>`;
            pack.appendChild(fx);
            setTimeout(()=>fx?.classList?.remove?.("is-growing"),980);
        }
        const label=fruit.label||forbiddenFruitRuleLabel(fruit.rule);
        const small=fx.querySelector("small"),main=fx.querySelector("b");
        if(small) small.textContent=label.kicker||"ZAKAZANE";
        if(main) main.textContent=label.main||"?";
        fx.dataset.ruleSignature=forbiddenFruitRuleSignature(fruit.rule);
        pack.classList.add("bha-forbidden-fruit-pack");
        if(Date.now()-Number(fruit.lastRuleChangedAt||0)<1100){
            fx.classList.remove("is-rule-changing");void fx.offsetWidth;fx.classList.add("is-rule-changing");
            setTimeout(()=>fx?.classList?.remove?.("is-rule-changing"),980);
        }
        return true;
    }
    function playForbiddenFruitDeny(index){
        if(typeof document==="undefined") return false;
        const button=[...document.querySelectorAll("#pack .pack-card-btn,#pack .joker-card-btn")].find(node=>Number(node?.dataset?.packIndex)===Number(index));
        if(!button) return false;
        button.classList.remove("bha-forbidden-fruit-denied");void button.offsetWidth;button.classList.add("bha-forbidden-fruit-denied");
        setTimeout(()=>button?.classList?.remove?.("bha-forbidden-fruit-denied"),520);
        return true;
    }

    function livingTribunalCatalog(category){
        const catalog=host()?.getTagCatalog?.()?.[category];
        return (Array.isArray(catalog)?catalog:[]).map(entry=>({
            id:String(entry?.id||"").trim().toLowerCase(),
            name:String(entry?.name||entry?.id||"").trim()
        })).filter(entry=>entry.id);
    }
    function livingTribunalCardTagSet(card){
        return new Set((Array.isArray(card?.tags)?card.tags:[]).map(tag=>String(tag||"").trim().toLowerCase()).filter(Boolean));
    }
    function livingTribunalLegalTemplates(playerIndex,ctx=context()){
        const banned=new Set((Array.isArray(ctx?.bannedCards)?ctx.bannedCards:[]).map(normalizeName));
        const occupied=new Set();
        (Array.isArray(ctx?.decks)?ctx.decks:[]).forEach(deck=>(Array.isArray(deck)?deck:[]).forEach(card=>{const name=normalizeName(card?.name);if(name)occupied.add(name);}));
        (Array.isArray(ctx?.currentPack)?ctx.currentPack:[]).forEach(card=>{const name=normalizeName(card?.name);if(name)occupied.add(name);});
        return (Array.isArray(ctx?.cardDatabase)?ctx.cardDatabase:[]).filter(card=>{
            const name=normalizeName(card?.name);
            if(!name||card?.joker||banned.has(name)||occupied.has(name)||isBannedTemplate(card,ctx)) return false;
            return Number.isFinite(Number(card?.cost))&&Number.isFinite(Number(card?.power));
        });
    }
    function livingTribunalDeckTagFrequency(deck=[],category){
        const catalog=livingTribunalCatalog(category),counts=new Map(catalog.map(tag=>[tag.id,0]));
        (Array.isArray(deck)?deck:[]).forEach(card=>{
            const tags=livingTribunalCardTagSet(card);
            catalog.forEach(tag=>{if(tags.has(tag.id)) counts.set(tag.id,(counts.get(tag.id)||0)+1);});
        });
        return catalog.map(tag=>({...tag,count:Number(counts.get(tag.id)||0)}));
    }
    function livingTribunalAllSynergyFrequencies(deck=[]){
        const frequencies=new Map();
        ["deckArchetypes","mechanicFamilies"].forEach(category=>{
            livingTribunalDeckTagFrequency(deck,category).forEach(entry=>{if(entry.count>0)frequencies.set(entry.id,entry.count);});
        });
        return frequencies;
    }
    function livingTribunalCandidateScore(card,deck=[],requiredTagId=""){
        const tags=livingTribunalCardTagSet(card),frequencies=livingTribunalAllSynergyFrequencies(deck);
        let score=requiredTagId&&tags.has(requiredTagId)?80:0;
        frequencies.forEach((count,tagId)=>{if(tags.has(tagId)) score+=count*7;});
        const cost=Number(card?.cost);
        if(Number.isFinite(cost)){
            const sameCost=(Array.isArray(deck)?deck:[]).filter(anchor=>Number(anchor?.cost)===cost).length;
            score+=Math.min(3,sameCost);
        }
        return score;
    }
    function livingTribunalRankTags(deck,category,legal,minCandidates=1){
        const pool=Array.isArray(legal)?legal:[];
        return livingTribunalDeckTagFrequency(deck,category).map(entry=>({
            ...entry,
            candidateCount:pool.filter(card=>livingTribunalCardTagSet(card).has(entry.id)).length
        })).filter(entry=>entry.candidateCount>=Math.max(1,Number(minCandidates)||1)).sort((a,b)=>
            b.count-a.count || b.candidateCount-a.candidateCount || a.name.localeCompare(b.name,"pl")
        );
    }
    function livingTribunalSelectForTag(legal,deck,tag,count,usedNames,group){
        if(!tag) return [];
        const requested=Math.max(0,Number(count)||0);
        const pool=(Array.isArray(legal)?legal:[]).filter(card=>{
            const name=normalizeName(card?.name);
            return name&&!usedNames.has(name)&&livingTribunalCardTagSet(card).has(tag.id);
        }).map(card=>({card,score:livingTribunalCandidateScore(card,deck,tag.id)})).sort((a,b)=>
            b.score-a.score || Number(a.card?.cost||0)-Number(b.card?.cost||0) || String(a.card?.name||"").localeCompare(String(b.card?.name||""),"pl")
        );
        const selected=pool.slice(0,requested).map(entry=>{
            const name=normalizeName(entry.card?.name);if(name)usedNames.add(name);
            return {card:clone(entry.card),group,tagId:tag.id,tagName:tag.name,coverage:Number(tag.count||0),score:entry.score};
        });
        return selected;
    }
    function livingTribunalFallbackTag(rankings,excludedIds=new Set()){
        return (Array.isArray(rankings)?rankings:[]).find(entry=>!excludedIds.has(entry.id))||null;
    }
    function buildLivingTribunalRecommendations(playerIndex,packContext=context()){
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        const p=Number(playerIndex),deck=Array.isArray(ctx?.decks?.[p])?ctx.decks[p]:[];
        const legal=livingTribunalLegalTemplates(p,ctx);
        const empty=()=>({playerIndex:p,deckSize:deck.length,recommendations:[],archetypes:[],mechanicFamily:null});
        if(!deck.length||legal.length<5) return empty();
        const archetypeRank=livingTribunalRankTags(deck,"deckArchetypes",legal,2).filter(entry=>entry.count>0);
        const mechanicRank=livingTribunalRankTags(deck,"mechanicFamilies",legal,1).filter(entry=>entry.count>0);
        if(archetypeRank.length<2||!mechanicRank.length) return empty();

        // Kanon Trybunału jest sztywny: 2 + 2 + 1, bez fillerów i bez zmiany grup.
        // Szukamy pierwszej najwyżej ocenionej kombinacji dwóch RÓŻNYCH archetypów,
        // która po deduplikacji nadal zostawia legalną kartę dla Mechanic Family.
        for(let firstIndex=0;firstIndex<archetypeRank.length;firstIndex++){
            const archetype1=archetypeRank[firstIndex];
            const usedAfterFirst=new Set();
            const first=livingTribunalSelectForTag(legal,deck,archetype1,2,usedAfterFirst,"archetype_1");
            if(first.length!==2) continue;
            for(let secondIndex=0;secondIndex<archetypeRank.length;secondIndex++){
                const archetype2=archetypeRank[secondIndex];
                if(!archetype2||archetype2.id===archetype1.id) continue;
                const usedAfterSecond=new Set(usedAfterFirst);
                const second=livingTribunalSelectForTag(legal,deck,archetype2,2,usedAfterSecond,"archetype_2");
                if(second.length!==2) continue;
                for(const mechanicFamily of mechanicRank){
                    const usedFinal=new Set(usedAfterSecond);
                    const mechanic=livingTribunalSelectForTag(legal,deck,mechanicFamily,1,usedFinal,"mechanic_family");
                    if(mechanic.length!==1) continue;
                    const recommendations=[...first,...second,...mechanic];
                    if(recommendations.length!==5||new Set(recommendations.map(item=>normalizeName(item?.card?.name))).size!==5) continue;
                    return {playerIndex:p,deckSize:deck.length,recommendations,archetypes:[clone(archetype1),clone(archetype2)],mechanicFamily:clone(mechanicFamily)};
                }
            }
        }
        return empty();
    }
    function livingTribunalSourceIndexes(ctx=context()){
        const pack=Array.isArray(ctx?.currentPack)?ctx.currentPack:[];
        return pack.map((card,index)=>({card,index})).filter(entry=>{
            if(!entry.card) return false;
            if(isShootingStarCard(entry.card,ctx)) return false;
            return host()?.canReplacePackCard?.(entry.index,{reason:"living_tribunal_verdict",anomalyId:"living_tribunal"})!==false;
        }).map(entry=>entry.index);
    }
    function ensureLivingTribunalPerPlayerState(tribunal=state.livingTribunal,ctx=context()){
        if(!tribunal) return null;
        const players=Array.isArray(ctx?.players)?ctx.players:[];
        const perPlayer=Math.max(1,Number(tribunal.picksPerPlayer||2));
        if(!tribunal.perPlayerRemaining||typeof tribunal.perPlayerRemaining!=="object"){
            tribunal.perPlayerRemaining={};
            players.forEach((_,playerIndex)=>{tribunal.perPlayerRemaining[String(playerIndex)]=perPlayer;});
            const history=Array.isArray(tribunal.history)?tribunal.history:[];
            history.forEach(item=>{
                const key=String(Number(item?.playerIndex));
                if(!Object.prototype.hasOwnProperty.call(tribunal.perPlayerRemaining,key)) return;
                tribunal.perPlayerRemaining[key]=Math.max(0,Number(tribunal.perPlayerRemaining[key]||0)-1);
            });
        }else{
            players.forEach((_,playerIndex)=>{
                const key=String(playerIndex);
                if(!Object.prototype.hasOwnProperty.call(tribunal.perPlayerRemaining,key)) tribunal.perPlayerRemaining[key]=perPlayer;
            });
        }
        tribunal.picksPerPlayer=perPlayer;
        tribunal.totalPicks=players.length*perPlayer;
        tribunal.picksRemaining=players.reduce((sum,_,playerIndex)=>sum+Math.max(0,Number(tribunal.perPlayerRemaining?.[String(playerIndex)]||0)),0);
        return tribunal;
    }
    function livingTribunalPlayerRemaining(playerIndex,tribunal=state.livingTribunal,ctx=context()){
        if(!tribunal||!Number.isInteger(Number(playerIndex))) return 0;
        ensureLivingTribunalPerPlayerState(tribunal,ctx);
        return Math.max(0,Number(tribunal.perPlayerRemaining?.[String(Number(playerIndex))]||0));
    }
    function livingTribunalActive(){
        const tribunal=ensureLivingTribunalPerPlayerState(state.livingTribunal,context());
        return Boolean(state.enabled&&tribunal?.active&&Number(tribunal.picksRemaining||0)>0&&!tribunal?.ending);
    }
    function getLivingTribunalState(){return state.livingTribunal?clone(ensureLivingTribunalPerPlayerState(state.livingTribunal,context())):null;}
    function clearLivingTribunalPanel(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaLivingTribunalPanel")?.remove?.();
    }
    function livingTribunalReasonLabel(candidate){
        if(candidate?.group==="archetype_1") return {kicker:"ARCHETYP I",name:candidate.tagName||"ARCHETYP"};
        if(candidate?.group==="archetype_2") return {kicker:"ARCHETYP II",name:candidate.tagName||"ARCHETYP"};
        if(candidate?.group==="mechanic_family") return {kicker:"RODZINA MECHANIK",name:candidate.tagName||"MECHANIKA"};
        return {kicker:"WERDYKT",name:candidate?.tagName||"DOPASOWANIE"};
    }
    function tribunalCardHtml(candidate,index){
        const card=candidate?.card||{},reason=livingTribunalReasonLabel(candidate),isSkill=String(card?.cardType||"").toLowerCase()==="skill";
        return `<button type="button" class="bha-tribunal-choice" data-tribunal-choice="${index}" aria-label="${escapeHtml(card?.name||"Karta")} — ${escapeHtml(reason.name)}"><span class="bha-tribunal-card"><span class="bha-tribunal-cost">${escapeHtml(card?.cost??"")}</span><b>${escapeHtml(card?.name||"Karta")}</b>${isSkill?"":`<span class="bha-tribunal-power">${escapeHtml(card?.power??"")}</span>`}</span><small><em>${escapeHtml(reason.kicker)}</em><strong>${escapeHtml(reason.name)}</strong></small></button>`;
    }
    function renderLivingTribunalPanel(){
        if(typeof document==="undefined") return false;
        if(!livingTribunalActive()||state.livingTribunal?.panelVisible===false||host()?.isPackOpen?.()===false){clearLivingTribunalPanel();return false;}
        const ctx=context(),playerIndex=currentPlayerIndex(ctx);
        if(!Number.isInteger(playerIndex)||livingTribunalPlayerRemaining(playerIndex,state.livingTribunal,ctx)<=0){clearLivingTribunalPanel();return false;}
        const evaluation=buildLivingTribunalRecommendations(playerIndex,ctx);
        if(!evaluation.recommendations.length){clearLivingTribunalPanel();return false;}
        const pack=document.getElementById("pack");
        const turnHud=document.getElementById("draftTurnHud");
        if(!pack||!turnHud) return false;
        let root=document.getElementById("bhaLivingTribunalPanel"),previousSignature=root?.dataset?.signature||"";
        const wasCreated=!root;
        if(!root){root=document.createElement("aside");root.id="bhaLivingTribunalPanel";root.className="bha-living-tribunal-panel";}
        if(root.previousElementSibling!==pack || root.parentElement!==turnHud.parentElement){
            turnHud.insertAdjacentElement("beforebegin",root);
        }
        const playerName=ctx?.players?.[playerIndex]||`GRACZ ${playerIndex+1}`;
        const deckSignature=(Array.isArray(ctx?.decks?.[playerIndex])?ctx.decks[playerIndex]:[]).map(card=>String(card?.instanceId||card?.name||"")).join("~");
        const signature=`${playerIndex}|${deckSignature}|${livingTribunalPlayerRemaining(playerIndex,state.livingTribunal,ctx)}`;
        root.dataset.playerIndex=String(playerIndex);root.dataset.signature=signature;
        root.classList.remove("is-choosing");
        root.innerHTML=`<h3 class="bha-tribunal-title">WERDYKT TRIBUNAŁA</h3><div class="bha-tribunal-board"><img class="bha-tribunal-bg" src="${LIVING_TRIBUNAL_PANEL_ASSET}" alt=""><img class="bha-tribunal-scale" src="${LIVING_TRIBUNAL_SCALE_ASSET}" alt="" aria-hidden="true"><div class="bha-tribunal-verdict"><div class="bha-tribunal-choices">${evaluation.recommendations.map(tribunalCardHtml).join("")}</div><div class="bha-tribunal-player"><span>OCENA DECKU</span><b>${escapeHtml(playerName)}</b></div></div><img class="bha-tribunal-character" src="${LIVING_TRIBUNAL_CHARACTER_ASSET}" alt="Living Tribunal"></div>`;
        if(wasCreated){root.classList.add("is-entering");setTimeout(()=>root?.classList?.remove?.("is-entering"),820);}
        else if(previousSignature&&previousSignature!==signature){root.classList.remove("is-reweighing");void root.offsetWidth;root.classList.add("is-reweighing");setTimeout(()=>root?.classList?.remove?.("is-reweighing"),1050);}
        root.querySelectorAll("[data-tribunal-choice]").forEach(button=>button.addEventListener("click",()=>chooseLivingTribunalRecommendation(Number(button.dataset.tribunalChoice))));
        state.livingTribunal.currentPlayerIndex=playerIndex;
        state.livingTribunal.currentPlayerName=playerName;
        state.livingTribunal.currentRecommendations=evaluation.recommendations.map(candidate=>({name:candidate?.card?.name||null,group:candidate.group,tagId:candidate.tagId,tagName:candidate.tagName}));
        return true;
    }
    function chooseLivingTribunalRecommendation(candidateIndex){
        if(!livingTribunalActive()) return false;
        const ctx=context(),playerIndex=currentPlayerIndex(ctx);
        if(livingTribunalPlayerRemaining(playerIndex,state.livingTribunal,ctx)<=0) return false;
        const evaluation=buildLivingTribunalRecommendations(playerIndex,ctx),candidate=evaluation.recommendations?.[Number(candidateIndex)];
        if(!candidate?.card) return false;
        const sourceIndexes=livingTribunalSourceIndexes(ctx);
        if(!sourceIndexes.length) return false;
        const sourceIndex=sourceIndexes[Math.floor(Math.random()*sourceIndexes.length)];
        const resultCard=host()?.createCard?.(candidate.card,{sourceEvent:"living_tribunal_verdict",anomalyId:"living_tribunal"})||clone(candidate.card);
        if(!resultCard) return false;
        const playerRemaining=livingTribunalPlayerRemaining(playerIndex,state.livingTribunal,ctx),perPlayer=Math.max(1,Number(state.livingTribunal?.picksPerPlayer||2));
        const reason=livingTribunalReasonLabel(candidate),override={card:resultCard,livingTribunal:{candidateIndex:Number(candidateIndex),group:candidate.group,tagId:candidate.tagId,tagName:candidate.tagName,reason:reason.name,playerIndex,verdictSequence:perPlayer-playerRemaining+1}};
        const root=document.getElementById("bhaLivingTribunalPanel"),choice=root?.querySelector?.(`[data-tribunal-choice="${Number(candidateIndex)}"]`);
        root?.classList?.add?.("is-choosing");choice?.classList?.add?.("is-chosen");
        state.livingTribunal.lastChoice=clone({cardName:resultCard?.name||null,...override.livingTribunal,sourceIndex,at:new Date().toISOString()});
        host()?.log?.("living_tribunal_recommendation_chosen",{packNumber:Number(ctx?.packStartIndex||0)+1,reason:"living_tribunal",data:clone(state.livingTribunal.lastChoice)});
        const commit=host()?.commitAlternatePick;
        if(typeof commit!=="function") return false;
        return commit(sourceIndex,override)!==false;
    }
    function effectLivingTribunal(){
        const ctx=context(),players=Array.isArray(ctx?.players)?ctx.players:[],picksPerPlayer=2;
        const perPlayerRemaining={};
        players.forEach((_,playerIndex)=>{perPlayerRemaining[String(playerIndex)]=picksPerPlayer;});
        state.livingTribunal={active:true,ending:false,panelVisible:false,picksPerPlayer,totalPicks:players.length*picksPerPlayer,picksRemaining:players.length*picksPerPlayer,perPlayerRemaining,startedPackIndex:Number(ctx?.packStartIndex||0),startedAfterPick:Number(ctx?.currentPickIndex||0),startedAt:new Date().toISOString(),history:[],currentRecommendations:[]};
        return {active:true,picksPerPlayer,totalPicks:players.length*picksPerPlayer,minDeckSize:6};
    }
    function trackLivingTribunalCommittedPick(payload={}){
        const tribunal=ensureLivingTribunalPerPlayerState(state.livingTribunal,context());
        if(!tribunal?.active||tribunal.ending||Number(tribunal.picksRemaining||0)<=0) return null;
        const playerIndex=Number(payload?.playerIndex),key=String(playerIndex),before=livingTribunalPlayerRemaining(playerIndex,tribunal,context());
        if(!Number.isInteger(playerIndex)||before<=0) return null;
        tribunal.perPlayerRemaining[key]=Math.max(0,before-1);
        ensureLivingTribunalPerPlayerState(tribunal,context());
        tribunal.history=Array.isArray(tribunal.history)?tribunal.history:[];
        tribunal.history.push({playerIndex,playerName:context()?.players?.[playerIndex]||null,source:String(payload?.source||"pack"),cardName:payload?.resultCard?.name||payload?.card?.name||null,tribunalChoice:Boolean(String(payload?.source||"")==="living_tribunal"),remainingForPlayer:Number(tribunal.perPlayerRemaining[key]||0),remainingTotal:Number(tribunal.picksRemaining||0),at:new Date().toISOString()});
        if(tribunal.picksRemaining<=0){
            tribunal.ending=true;tribunal.endedAt=new Date().toISOString();
            if(typeof document!=="undefined") document.getElementById("bhaLivingTribunalPanel")?.classList?.add?.("is-ending");
            setTimeout(()=>{if(state.livingTribunal===tribunal&&tribunal.ending){clearLivingTribunalPanel();state.livingTribunal=null;}},1800);
        }
        return clone(tribunal.history[tribunal.history.length-1]);
    }
    function resolveLivingTribunalPostPick(payload={},resume){
        const tribunal=state.livingTribunal;
        if(!tribunal?.ending) return false;
        if(typeof document==="undefined"){
            state.livingTribunal=null;resume?.();return true;
        }
        const root=document.getElementById("bhaLivingTribunalPanel");
        root?.classList?.add?.("is-ending");
        setLocked(true);
        setTimeout(()=>{clearLivingTribunalPanel();state.livingTribunal=null;setLocked(false);resume?.();},920);
        return true;
    }

    function effectModifier(){return {modifier:true};}
    function recordActivation(entry,outcome={}){
        const matches=item=>(entry.scheduleId&&item.scheduleId===entry.scheduleId)||(item.packIndex===entry.packIndex&&item.id===entry.id&&!item.triggered);
        const planned=state.plan.find(matches)||state.plan.find(item=>item.packIndex===entry.packIndex&&item.id===entry.id);
        if(planned) planned.triggered=true;
        const timelineItem=state.timeline.find(matches)||state.timeline.find(item=>item.packIndex===entry.packIndex&&item.id===entry.id);
        if(timelineItem) timelineItem.triggered=true;
        if(state.active) state.active.triggered=true;
        if(entry.adminForced&&state.adminTest){state.adminTest.completed=true;state.adminTest.blockedReason=null;state.adminTest.scheduledPackIndex=Number(entry.packIndex);}
        const event={anomalyId:entry.id,name:entry.name,rarity:entry.rarity,timing:entry.timing,window:entry.window||getDefinition(entry.id)?.window||null,slot:clone(entry.slot||null),packNumber:(entry.packIndex===null||entry.packIndex===undefined)?null:Number(entry.packIndex)+1,guaranteed:Boolean(entry.guaranteed),adminForced:Boolean(entry.adminForced),outcome:clone(outcome),at:new Date().toISOString()};
        state.events.push(event);host()?.log?.("black_hole_anomaly_activated",{packNumber:event.packNumber,reason:entry.id,data:clone(event)});return event;
    }
    function applyEntry(entry){
        let outcome={};
        if(entry.id==="golden_meteor") outcome=effectGoldenMeteor();
        else if(entry.id==="double_trouble") outcome=effectDoubleTrouble();
        else if(entry.id==="cosmic_rain") outcome=effectCosmicRain();
        else if(entry.id==="prehistoric") outcome=effectPrehistoric();
        else if(entry.id==="jeff_anomaly") outcome=effectJeffAnomaly();
        else if(entry.id==="joker_rift") outcome=effectJokerRift();
        else if(entry.id==="custom_pack_crack") outcome=effectCustomPackCrack();
        else if(entry.id==="zombie_horde") outcome=effectZombieHorde();
        else if(entry.id==="techno_organic_virus") outcome=effectTechnoOrganicVirus();
        else if(entry.id==="archetype_convergence") outcome=effectArchetypeGravity();
        else if(entry.id==="random_chaos") outcome=effectRandomChaos();
        else if(entry.id==="cost_cut") outcome=effectCostCut();
        else if(entry.id==="sun_and_moon") outcome=effectSunAndMoon();
        else if(entry.id==="invisible_queue") outcome=effectInvisibleQueue();
        else if(entry.id==="klyntar_haunting") outcome=effectKlyntarSymbiosis();
        else if(entry.id==="forbidden_fruit") outcome=effectForbiddenFruit();
        else if(entry.id==="living_tribunal") outcome=effectLivingTribunal();
        else if(entry.id==="astral_contract") outcome=effectAstralContract();
        else if(entry.id==="kang_time_rewind") outcome=effectKangTimeRewind();
        else if(entry.id==="shadow_veil"||entry.id==="guess_who"||entry.id==="glitch_pack") outcome=effectModifier();
        recordActivation(entry,outcome);
        return outcome;
    }
    function runEntry(entry,resume){
        if(!state.enabled||!entry||entry.triggered) return false;
        if(entry.id==="cost_cut"){
            showActivation(entry,()=>({targets:prepareCostCutTransformPlan(context())}),activationOutcome=>{
                const targets=Array.isArray(activationOutcome?.targets)?activationOutcome.targets:prepareCostCutTransformPlan(context());
                playCostCutTransformation(entry,targets,resume);
            });
            return true;
        }
        if(entry.id==="night_of_the_living_dead"){
            showActivation(entry,()=>({targets:prepareNightOfLivingDeadPlan(context())}),activationOutcome=>{
                const targets=Array.isArray(activationOutcome?.targets)?activationOutcome.targets:prepareNightOfLivingDeadPlan(context());
                playNightOfLivingDeadTransformation(entry,targets,resume);
            });
            return true;
        }
        if(entry.id==="living_tribunal"){
            showActivation(entry,()=>applyEntry(entry),()=>{
                if(state.livingTribunal){
                    state.livingTribunal.panelVisible=true;
                    host()?.renderDecks?.();
                }
                resume?.();
            });
            return true;
        }
        if(entry.id==="astral_contract"){
            showActivation(entry,()=>applyEntry(entry),outcome=>openAstralContractModal(outcome,resume));
            return true;
        }
        if(entry.id==="kang_time_rewind"){
            showActivation(entry,()=>applyEntry(entry),outcome=>playKangTimeRewind(entry,outcome,resume));
            return true;
        }
        if(entry.id==="techno_organic_virus"){
            showActivation(entry,()=>applyEntry(entry),()=>{
                showTechnoOrganicVirusBroadcast({
                    phase:"start",
                    title:"TECHNO-ORGANIC VIRUS",
                    description:"PACJENCI ZERO ZOSTALI ZARAŻENI. PRZEZ 4 WŁASNE PICKI KAŻDEGO GRACZA WIRUS BĘDZIE SIĘ ROZWIJAŁ.",
                    rarity:"epic",
                    kicker:"DECKI ZAKAŻONE",
                    holdMs:2550,
                    leaveMs:520
                },()=>resume?.());
            });
            return true;
        }
        showActivation(entry,()=>applyEntry(entry),()=>resume?.());
        return true;
    }

    function getAdminForcedEntry(ctx=context()){
        if(!state.enabled||!state.adminTest?.enabled||state.adminTest.completed) return null;
        const def=getDefinition(state.adminTest.anomalyId);
        if(!def?.runtimeReady){state.adminTest.blockedReason="not_runtime_ready";return null;}
        if(def.timing==="draft_start"||String(def.duration||"")==="draft"){state.adminTest.blockedReason="draft_start";return null;}
        const packIndex=Number(ctx.packStartIndex||0);
        if(Number(def.minPackIndex||0)>packIndex){state.adminTest.blockedReason="minimum_pack";return null;}
        if(def.requiresEconomy&&!ctx.economyEnabled){state.adminTest.blockedReason="requires_economy";return null;}
        if(!runtimeEligible(def,ctx,"prepared")){state.adminTest.blockedReason="runtime_ineligible";return null;}
        state.adminTest.blockedReason=null;state.adminTest.scheduledPackIndex=packIndex;
        const window=def.window||({before_open:"before_pack_open",after_open:"after_pack_open",mid_pack:"after_pick",after_pack:"after_pack"}[def.timing]||"before_pack_open");
        const resolvedDef=def.rarity==="random"?{...clone(def),rarity:chooseRarity(Math.random,["rare","epic","legendary"])||"rare",rarityMode:"random"}:clone(def);
        return {...resolvedDef,scheduleId:`admin-${def.id}-${packIndex}`,schedulerVersion:SCHEDULER_VERSION,window,slot:{type:window,packIndex,cycleIndex:packIndex,...(window==="intermission"?{boundaryIndex:packIndex}:{})},packIndex,triggered:false,guaranteed:true,adminForced:true,backupIds:[]};
    }

    function onPackPrepared(packContext={},resume){
        if(!state.enabled) return false;
        const packIndex=Number(packContext.packStartIndex??context().packStartIndex??0);
        const preparedContext={...context(),...(packContext&&typeof packContext==="object"?packContext:{})};
        // Draft-long treasure must be injected even in Admin TEST mode, before any pack mutator runs.
        if(cosmicTreasureActive()) injectCosmicTreasureIntoPack(preparedContext);
        let entry=getAdminForcedEntry(preparedContext);
        if(!entry&&state.adminTest?.enabled&&!state.adminTest.completed){
            // Draft-long admin anomaly is resolved by beforeDraftStart(), not by a pack slot.
            if(state.ongoing?.id===state.adminTest?.anomalyId){state.active=null;refreshRuntimeInfo();return false;}
            state.active=null;refreshRuntimeInfo();return false;
        }
        if(!entry){
            const plannedEntry=state.plan.find(item=>item.packIndex===packIndex&&!item.triggered)||null;
            entry=resolvePreparedEntry(plannedEntry,preparedContext);
        }
        state.active=entry?{...clone(entry)}:null;
        if(state.active?.id==="night_of_the_living_dead") state.active.triggerAfterPick=chooseLivingDeadTriggerPick(preparedContext);
        if(state.active?.id==="forbidden_fruit"&&!Number.isInteger(Number(state.active.triggerAfterPick))) state.active.triggerAfterPick=1+Math.floor(Math.random()*2);
        if(state.active?.id==="astral_contract"&&!Number.isInteger(Number(state.active.triggerAfterPick))) state.active.triggerAfterPick=chooseAstralContractTriggerPick(preparedContext,Boolean(state.active.adminForced));
        if(state.active?.id==="kang_time_rewind"&&!Number.isInteger(Number(state.active.triggerAfterPick))) state.active.triggerAfterPick=Math.max(1,Number(preparedContext?.players?.length)||1);
        const prepareStar=()=>ensureShootingStarForPack(context());
        if(!entry){prepareStar();refreshRuntimeInfo();return false;}
        if(entry.timing!=="before_open"){
            // after_open needs to assign the hidden star only after its transformation is finished.
            if(entry.timing!=="after_open") prepareStar();
            refreshRuntimeInfo();
            return false;
        }
        if(entry.window==="intermission"){
            // Intermission anomalies are instant events between stages. Their persistent payload,
            // if any (e.g. Techno-Organic Virus), lives in its dedicated state, not in state.active.
            return runEntry(state.active,()=>{state.active=null;prepareStar();refreshRuntimeInfo();resume?.();});
        }
        return runEntry(state.active,()=>{prepareStar();resume?.();});
    }
    function onPackOpened(packContext={},resume){
        if(!state.enabled) return false;
        if(state.active?.id==="living_tribunal"&&!state.active.triggered){
            // 19B: onPackOpened jest wołane PRZED showPack(true), czyli przed faktycznym revealem kart.
            // Trybunał czeka na afterPackRevealComplete().
            ensureShootingStarForPack({...context(),...(packContext&&typeof packContext==="object"?packContext:{})});
            return false;
        }
        if(!state.active||state.active.triggered||state.active.timing!=="after_open"){
            ensureShootingStarForPack({...context(),...(packContext&&typeof packContext==="object"?packContext:{})});
            return false;
        }
        return runEntry(state.active,()=>{ensureShootingStarForPack(context());resume?.();});
    }
    function afterPackRevealComplete(packContext={},resume){
        if(!state.enabled) return false;
        const ctx={...context(),...(packContext&&typeof packContext==="object"?packContext:{})};
        if(state.active?.id==="kang_time_rewind"&&!state.active.triggered){
            captureKangPackStartCheckpoint(ctx);
            return false;
        }
        if(state.active?.id!=="living_tribunal"||state.active.triggered) return false;
        if(!runtimeEligible(state.active,ctx,"after_pack_reveal")){
            const previous=state.active;
            const fallback=chooseRuntimeFallback(previous,ctx);
            if(!fallback){
                const skipped={...previous,triggered:true,skipped:true,skipReason:"after_pack_reveal_runtime_ineligible_no_prerolled_backup"};
                replaceTimelineEntry(previous,skipped);
                state.active=null;refreshRuntimeInfo();return false;
            }
            replaceTimelineEntry(previous,fallback);
            state.active={...clone(fallback)};
        }
        return runEntry(state.active,resume);
    }

    function beforeAdvance(packContext={},resume){
        if(!state.enabled||!state.active){
            const ctxNoActive={...context(),...(packContext&&typeof packContext==="object"?packContext:{})};
            const pickCount=Array.isArray(ctxNoActive.pickOrder)?ctxNoActive.pickOrder.length:0;
            const isLastNormalPick=pickCount>0&&Number(ctxNoActive.currentPickIndex||0)+1>=pickCount;
            if(isLastNormalPick) carryForwardCosmicTreasure(ctxNoActive);
            return false;
        }
        const ctx={...context(),...(packContext&&typeof packContext==="object"?packContext:{})};
        const pickCount=Array.isArray(ctx.pickOrder)?ctx.pickOrder.length:0;
        const isLastNormalPick=pickCount>0&&Number(ctx.currentPickIndex||0)+1>=pickCount;
        if(isLastNormalPick) carryForwardCosmicTreasure(ctx);
        if(state.active.id==="battleworld"&&!state.active.triggered&&state.active.timing==="after_pack"){
            if(isLastNormalPick) return runBattleworld(state.active,resume);
            return false;
        }
        if(state.active.id==="night_of_the_living_dead"&&!state.active.triggered&&state.active.timing==="mid_pack"){
            const triggerAfterPick=Math.max(1,Number(state.active.triggerAfterPick||1));
            const resolvedPickNumber=Number(ctx.currentPickIndex||0)+1;
            if(resolvedPickNumber<triggerAfterPick) return false;
        }
        if(state.active.id==="astral_contract"&&!state.active.triggered&&state.active.timing==="mid_pack"){
            const triggerAfterPick=Math.max(1,Number(state.active.triggerAfterPick||1));
            const resolvedPickNumber=Number(ctx.currentPickIndex||0)+1;
            if(resolvedPickNumber<triggerAfterPick) return false;
        }
        if(state.active.id==="kang_time_rewind"&&!state.active.triggered&&state.active.timing==="mid_pack"){
            const triggerAfterPick=Math.max(1,Number(state.active.triggerAfterPick||ctx.players?.length||1));
            const resolvedPickNumber=Number(ctx.currentPickIndex||0)+1;
            if(resolvedPickNumber<triggerAfterPick) return false;
        }
        if(state.active.id==="forbidden_fruit"&&state.active.timing==="mid_pack"){
            const resolvedPickNumber=Number(ctx.currentPickIndex||0)+1;
            if(!state.active.triggered){
                const triggerAfterPick=Math.max(1,Math.min(2,Number(state.active.triggerAfterPick||1)));
                if(resolvedPickNumber<triggerAfterPick) return false;
            }else{
                const fruit=state.active.forbiddenFruit;
                const activatedAfterPick=Number(fruit?.activatedAfterPick||0);
                const totalTurns=Array.isArray(ctx.pickOrder)?ctx.pickOrder.length:0;
                const scheduledRotate=fruit?.active&&resolvedPickNumber>activatedAfterPick&&resolvedPickNumber<totalTurns&&(resolvedPickNumber-activatedAfterPick)%3===0;
                const allBlocked=Boolean(fruit?.active&&fruit?.rule&&!forbiddenFruitHasLegalCard(fruit.rule,ctx));
                if(scheduledRotate||allBlocked){
                    rotateForbiddenFruitRule(ctx);
                    host()?.render?.();
                }
                return false;
            }
        }
        if(state.active.id==="glitch_pack"&&state.active.triggered){
            return playGlitchPackCycle(resume);
        }
        if(state.active.triggered||state.active.timing!=="mid_pack") return false;
        if(!runtimeEligible(state.active,ctx,"mid_pack")){
            const previous=state.active;
            const fallback=chooseRuntimeFallback(previous,ctx);
            if(!fallback){
                const skipped={...previous,triggered:true,skipped:true,skipReason:"mid_pack_runtime_ineligible_no_prerolled_backup"};
                replaceTimelineEntry(previous,skipped);
                state.active=null;refreshRuntimeInfo();return false;
            }
            replaceTimelineEntry(previous,fallback);
            state.active={...clone(fallback)};
        }
        return runEntry(state.active,resume);
    }
    function onCardCommitted(payload={}){
        if(!state.enabled) return null;
        const hasTriggeredActive=Boolean(state.active?.triggered),hasLivingTribunal=Boolean(state.livingTribunal?.active);
        if(!hasTriggeredActive&&!hasLivingTribunal) return null;
        let klyntarSymbiosis=null;
        if(state.active?.id==="klyntar_haunting"){
            if(payload?.klyntarResolvedAtCommit){
                klyntarSymbiosis={handled:true,directCommit:true,turn:clone(payload?.klyntarCommit?.turn||null),result:clone(payload?.klyntarCommit?.result||null)};
            }else{
                const source=String(payload?.source||"");
                if(["pack","joker","black_cat_gem"].includes(source)){
                    klyntarSymbiosis=resolveKlyntarSymbiosisPick(payload);
                }
            }
        }
        const livingTribunal=trackLivingTribunalCommittedPick(payload);
        return {ok:true,anomalyId:state.active?.id||(livingTribunal?"living_tribunal":null),payload:payload?.card?.instanceId||payload?.card?.name||null,klyntarSymbiosis,livingTribunal};
    }
    function currentPlayerIndex(ctx=context()){
        const pickIndex=Number(ctx.currentPickIndex||0);
        const fromOrder=Number(Array.isArray(ctx.pickOrder)?ctx.pickOrder[pickIndex]:NaN);
        return Number.isInteger(fromOrder)?fromOrder:pickIndex;
    }
    function getSunMoonSplitIndex(totalCards){
        const total=Math.max(0,Number(totalCards)||0);
        return Math.ceil(total/2);
    }
    function ensureSunMoonAssignments(pack,options={}){
        const cards=Array.isArray(pack)?pack:[];
        if(!cards.length) return {moon:0,sun:0};
        const reset=Boolean(options.reset);
        if(reset){
            const split=getSunMoonSplitIndex(cards.length);
            cards.forEach((card,index)=>{
                if(card&&typeof card==="object") card.anomalySide=index<split?"moon":"sun";
            });
        }else{
            let moon=cards.filter(card=>card?.anomalySide==="moon").length;
            let sun=cards.filter(card=>card?.anomalySide==="sun").length;
            const targetMoon=getSunMoonSplitIndex(cards.length);
            cards.forEach(card=>{
                if(!card||typeof card!=="object"||(card.anomalySide==="moon"||card.anomalySide==="sun")) return;
                const side=moon<targetMoon&&moon<=sun?"moon":"sun";
                card.anomalySide=side;
                if(side==="moon") moon+=1; else sun+=1;
            });
        }
        return {
            moon:cards.filter(card=>card?.anomalySide==="moon").length,
            sun:cards.filter(card=>card?.anomalySide==="sun").length
        };
    }
    function getSunMoonAvailableSides(pack){
        const cards=Array.isArray(pack)?pack:[];
        ensureSunMoonAssignments(cards);
        const live=[...new Set(cards.map(card=>card?.anomalySide).filter(side=>side==="sun"||side==="moon"))];
        return live;
    }
    function getAssignedSunMoonSide(ctx=context()){
        if(!state.enabled||state.active?.id!=="sun_and_moon"||!state.active?.triggered) return null;
        if(!state.active.playerSides||typeof state.active.playerSides!=="object") state.active.playerSides={};
        const playerIndex=currentPlayerIndex(ctx);
        let side=state.active.playerSides[playerIndex];
        if(side!=="sun"&&side!=="moon"){
            side=Math.random()<0.5?"sun":"moon";
            state.active.playerSides[playerIndex]=side;
        }
        return side;
    }
    function getAllowedSide(ctx=context()){
        const assigned=getAssignedSunMoonSide(ctx);
        if(!assigned) return null;
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        const available=getSunMoonAvailableSides(pack);
        // Anti-softlock: once a player's fixed side is exhausted, they can pick from the remaining side.
        if(!available.includes(assigned)) return null;
        return assigned;
    }
    function getSunMoonSideMeta(side){
        const normalized=side==="moon"?"moon":"sun";
        return normalized==="moon"
            ? {id:"moon",icon:"☾",label:"STREFA NOCY",shortLabel:"NOC",cardLabel:"NOC",className:"moon"}
            : {id:"sun",icon:"☀",label:"STREFA DNIA",shortLabel:"DZIEŃ",cardLabel:"DZIEŃ",className:"sun"};
    }
    function clearSunMoonPackFx(){
        if(typeof document==="undefined") return;
        clearTimeout(sunMoonRevealTimer);
        sunMoonRevealTimer=0;
        document.getElementById("bhaSunMoonPackFx")?.remove?.();
        const pack=document.getElementById("pack");
        pack?.classList?.remove?.("bha-sunmoon-pack-active");
        if(pack?.dataset){ delete pack.dataset.playerSide; delete pack.dataset.sunMoonColumns; }
        if(pack?.style){
            pack.style.removeProperty("grid-template-columns");
            pack.style.removeProperty("--bha-sunmoon-card-width");
            pack.style.removeProperty("--bha-sunmoon-corridor");
        }
        pack?.querySelectorAll?.(".pack-card-btn,.joker-card-btn")?.forEach?.(button=>{
            button.style.removeProperty("grid-column");
            button.style.removeProperty("grid-row");
        });
    }
    function layoutSunMoonCards(pack,cards){
        if(!pack) return {columns:0,moon:0,sun:0};
        const buttons=(Array.isArray(cards)&&cards.length?cards:[...pack.querySelectorAll(".pack-card-btn,.joker-card-btn")]).filter(Boolean);
        if(!buttons.length) return {columns:0,moon:0,sun:0};
        const moon=buttons.filter(button=>button.dataset?.anomalySide==="moon");
        const sun=buttons.filter(button=>button.dataset?.anomalySide==="sun");
        const firstRect=buttons[0]?.getBoundingClientRect?.();
        const cardWidth=Math.max(96,Math.round(Number(firstRect?.width)||112));
        const packWidth=Math.max(520,Math.round(Number(pack.getBoundingClientRect?.()?.width)||Number(pack.clientWidth)||1100));
        const corridor=72;
        const desiredGap=Math.max(12,Math.min(24,Math.round(packWidth*.012)));
        const possible=Math.floor((packWidth-corridor-desiredGap*4)/(2*(cardWidth+desiredGap)));
        const columns=Math.max(1,Math.min(4,possible||1));
        pack.dataset.sunMoonColumns=String(columns);
        pack.style.setProperty("--bha-sunmoon-card-width",`${cardWidth}px`);
        pack.style.setProperty("--bha-sunmoon-corridor",`${corridor}px`);
        pack.style.gridTemplateColumns=`repeat(${columns}, ${cardWidth}px) ${corridor}px repeat(${columns}, ${cardWidth}px)`;
        const place=(group,base)=>{
            group.forEach((button,index)=>{
                const row=Math.floor(index/columns);
                const rowStart=row*columns;
                const rowCount=Math.min(columns,group.length-rowStart);
                const inRow=index-rowStart;
                const offset=Math.floor((columns-rowCount)/2);
                button.style.gridColumn=String(base+offset+inRow);
                button.style.gridRow=String(row+1);
            });
        };
        place(moon,1);
        place(sun,columns+2);
        return {columns,moon:moon.length,sun:sun.length};
    }
    function positionSunMoonPackFx(pack,layer,cards){
        if(!pack||!layer) return;
        layoutSunMoonCards(pack,cards);
        const packRect=pack.getBoundingClientRect?.();
        const center=Math.max(0,Number(packRect?.width||pack.clientWidth||0)/2);
        layer.style.setProperty("--bha-sunmoon-divider-center",`${center}px`);
        layer.style.setProperty("--bha-sunmoon-left-width",`${center}px`);
        layer.style.setProperty("--bha-sunmoon-right-start",`${center}px`);
    }
    function renderSunMoonPackFx(ctx=context(),options={}){
        if(typeof document==="undefined") return false;
        const pack=document.getElementById("pack");
        if(!pack) return false;
        clearSunMoonPackFx();
        const cards=[...pack.querySelectorAll(".pack-card-btn,.joker-card-btn")];
        if(!cards.length) return false;
        const allowed=getAllowedSide(ctx);
        const layer=document.createElement("div");
        layer.id="bhaSunMoonPackFx";
        layer.className="bha-sunmoon-pack-fx"+(options?.revealCards?" is-reveal is-pending":" is-settled");
        layer.setAttribute("aria-hidden","true");
        layer.innerHTML=`
            <div class="bha-sunmoon-half bha-sunmoon-half--moon${allowed&&allowed!=="moon"?" is-locked":""}">
                <span class="bha-sunmoon-moon-beam"></span>
            </div>
            <div class="bha-sunmoon-half bha-sunmoon-half--sun${allowed&&allowed!=="sun"?" is-locked":""}">
                <span class="bha-sunmoon-sun-rays">
                    <i></i><i></i><i></i><i></i><i></i>
                </span>
            </div>
            <div class="bha-sunmoon-divider"><i>☾</i><span></span><strong>☀</strong></div>
            <span class="bha-sunmoon-corner bha-sunmoon-corner--moon"><b>☾</b><small>NOC</small></span>
            <span class="bha-sunmoon-corner bha-sunmoon-corner--sun"><b>☀</b><small>DZIEŃ</small></span>`;
        pack.classList.add("bha-sunmoon-pack-active");
        if(allowed) pack.dataset.playerSide=allowed;
        pack.prepend(layer);
        positionSunMoonPackFx(pack,layer,cards);
        if(typeof requestAnimationFrame==="function"){
            requestAnimationFrame(()=>positionSunMoonPackFx(pack,layer,cards));
            requestAnimationFrame(()=>requestAnimationFrame(()=>positionSunMoonPackFx(pack,layer,cards)));
        }
        setTimeout(()=>positionSunMoonPackFx(pack,layer,cards),90);
        setTimeout(()=>positionSunMoonPackFx(pack,layer,cards),280);

        if(options?.revealCards){
            // Hero cards finish first; the day/night board arrives just before the real pack reveal.
            sunMoonRevealTimer=setTimeout(()=>{
                if(!layer.isConnected) return;
                layer.classList.remove("is-pending");
                layer.classList.add("is-settled");
                positionSunMoonPackFx(pack,layer,cards);
            },2050);
        }
        return true;
    }
    function clearPrehistoricPackFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaPrehistoricPackFx")?.remove?.();
        document.getElementById("bhaPrehistoricLeafOverlay")?.remove?.();
        const pack=document.getElementById("pack");
        const stage=document.getElementById("packStage");
        pack?.classList?.remove?.("bha-prehistoric-pack-active");
        stage?.classList?.remove?.("bha-prehistoric-stage-active");
    }
    function getPrehistoricStageBounds(pack,stage){
        if(!pack||!stage||typeof stage.getBoundingClientRect!=="function") return null;
        const cards=[...pack.querySelectorAll(".pack-card-btn,.joker-card-btn")].filter(node=>{
            const rect=node.getBoundingClientRect?.();
            return rect&&rect.width>0&&rect.height>0;
        });
        if(!cards.length) return null;
        const stageRect=stage.getBoundingClientRect();
        const rects=cards.map(card=>card.getBoundingClientRect());
        const left=Math.min(...rects.map(rect=>rect.left))-stageRect.left;
        const top=Math.min(...rects.map(rect=>rect.top))-stageRect.top;
        const right=Math.max(...rects.map(rect=>rect.right))-stageRect.left;
        const bottom=Math.max(...rects.map(rect=>rect.bottom))-stageRect.top;
        return {left,top,width:Math.max(1,right-left),height:Math.max(1,bottom-top)};
    }
    function positionPrehistoricStageLayer(layer,bounds,paddingX=148,paddingY=136){
        if(!layer||!bounds) return;
        layer.style.left=`${bounds.left-paddingX}px`;
        layer.style.top=`${bounds.top-paddingY}px`;
        layer.style.width=`${bounds.width+paddingX*2}px`;
        layer.style.height=`${bounds.height+paddingY*2}px`;
    }
    function getOrCreatePrehistoricLeafOverlay(stage,signature){
        if(!stage) return null;
        let overlay=document.getElementById("bhaPrehistoricLeafOverlay");
        if(!overlay){
            overlay=document.createElement("div");
            overlay.id="bhaPrehistoricLeafOverlay";
            overlay.className="bha-prehistoric-leaf-overlay";
            overlay.setAttribute("aria-hidden","true");
            stage.appendChild(overlay);
        }
        if(signature!=null) overlay.dataset.signature=String(signature);
        return overlay;
    }
    function hashPrehistoricSeed(value="0"){
        let hash=2166136261;
        const input=String(value);
        for(let i=0;i<input.length;i+=1){
            hash^=input.charCodeAt(i);
            hash=Math.imul(hash,16777619);
        }
        return hash>>>0;
    }
    function prehistoricRandom(seed){
        let state=(seed>>>0)||1;
        return ()=>{
            state=(Math.imul(state,1664525)+1013904223)>>>0;
            return state/4294967296;
        };
    }
    function positionPrehistoricSeriesStones(layer,pack,stage,bounds){
        if(!layer||!pack||!stage||!bounds) return;
        const stones=[...layer.querySelectorAll('.bha-prehistoric-series-stone')];
        const cards=[...pack.querySelectorAll('.pack-card-btn,.joker-card-btn')].filter(node=>{
            const rect=node.getBoundingClientRect?.();
            return rect&&rect.width>0&&rect.height>0;
        });
        if(stones.length<3||!cards.length) return;
        const stageRect=stage.getBoundingClientRect?.();
        if(!stageRect) return;
        const paddingX=148,paddingY=136;
        const layerLeft=bounds.left-paddingX;
        const layerTop=bounds.top-paddingY;
        const rects=cards.map(card=>({card,rect:card.getBoundingClientRect()}));
        const maxBottom=Math.max(...rects.map(item=>item.rect.bottom));
        const sampleHeight=Math.max(1,rects[0]?.rect?.height||148);
        const bottomRow=rects.filter(item=>item.rect.bottom>=maxBottom-sampleHeight*.36).sort((a,b)=>a.rect.left-b.rect.left);
        const row=bottomRow.length?bottomRow:rects.sort((a,b)=>a.rect.left-b.rect.left);
        const targets=[row[0],row[Math.floor((row.length-1)/2)],row[row.length-1]];
        stones.forEach((stone,index)=>{
            const target=targets[index]||targets[0];
            if(!target) return;
            const rect=target.rect;
            const x=index===0 ? rect.left-stageRect.left-layerLeft+8 : index===2 ? rect.right-stageRect.left-layerLeft-8 : rect.left-stageRect.left-layerLeft+rect.width/2;
            const y=rect.bottom-stageRect.top-layerTop-4;
            stone.style.setProperty('--stone-x',`${x.toFixed(1)}px`);
            stone.style.setProperty('--stone-y',`${y.toFixed(1)}px`);
        });
    }
    function refreshPrehistoricCardLeaves(layer,pack,stage,bounds,ctx=context()){
        if(!layer||!pack||!stage||!bounds) return;
        layer.querySelectorAll('.bha-prehistoric-card-leaf').forEach(node=>node.remove?.());
        const cards=[...pack.querySelectorAll('.pack-card-btn,.joker-card-btn')].filter(node=>{
            const rect=node.getBoundingClientRect?.();
            return rect&&rect.width>0&&rect.height>0;
        });
        if(!cards.length) return;
        const stageRect=stage.getBoundingClientRect?.();
        if(!stageRect) return;
        const paddingX=148;
        const paddingY=136;
        const layerLeft=bounds.left-paddingX;
        const layerTop=bounds.top-paddingY;
        const rng=prehistoricRandom(hashPrehistoricSeed(`${ctx?.packStartIndex||0}|${cards.length}|${bounds.width}|${bounds.height}`));
        const corners=[
            {x:.14,y:.18,rot:-42,label:'nw'},
            {x:.86,y:.18,rot:41,label:'ne'},
            {x:.18,y:.82,rot:-128,label:'sw'},
            {x:.82,y:.84,rot:128,label:'se'},
            {x:.06,y:.50,rot:-82,label:'w'},
            {x:.94,y:.50,rot:82,label:'e'}
        ];
        const count=Math.min(12,Math.max(Math.min(6,cards.length),Math.round(cards.length*0.70)));
        const taken=new Set();
        for(let i=0;i<count;i+=1){
            let idx=Math.floor(rng()*cards.length);
            let guard=0;
            while(taken.has(idx)&&guard<cards.length*2){ idx=(idx+1)%cards.length; guard+=1; }
            taken.add(idx);
            const card=cards[idx];
            const rect=card.getBoundingClientRect();
            const localLeft=rect.left-stageRect.left-layerLeft;
            const localTop=rect.top-stageRect.top-layerTop;
            const corner=corners[Math.floor(rng()*corners.length)];
            const leaf=document.createElement('span');
            leaf.className='bha-prehistoric-card-leaf';
            leaf.dataset.corner=corner.label;
            const x=localLeft+rect.width*corner.x+(rng()-.5)*8;
            const y=localTop+rect.height*corner.y+(rng()-.5)*8;
            leaf.style.left=`${x.toFixed(1)}px`;
            leaf.style.top=`${y.toFixed(1)}px`;
            leaf.style.setProperty('--rot',`${(corner.rot+(rng()-.5)*20).toFixed(1)}deg`);
            leaf.style.setProperty('--scale',(0.82+rng()*0.34).toFixed(3));
            leaf.style.setProperty('--delay',`${(-rng()*2.8).toFixed(2)}s`);
            layer.appendChild(leaf);
        }
    }
    function renderPrehistoricPackFx(ctx=context(),options={}){
        if(typeof document==="undefined") return false;
        const pack=document.getElementById("pack");
        const stage=document.getElementById("packStage")||pack;
        if(!pack||!stage) return false;
        const bounds=getPrehistoricStageBounds(pack,stage);
        if(!bounds) return false;
        const signature=[Number(ctx?.packStartIndex||0),pack.querySelectorAll(".pack-card-btn,.joker-card-btn").length].join("|");
        let layer=document.getElementById("bhaPrehistoricPackFx");
        if(layer?.dataset?.signature===signature){
            positionPrehistoricStageLayer(layer,bounds,148,136);
            const leafOverlay=getOrCreatePrehistoricLeafOverlay(stage,signature);
            if(leafOverlay) positionPrehistoricStageLayer(leafOverlay,bounds,148,136);
            refreshPrehistoricCardLeaves(leafOverlay||layer,pack,stage,bounds,ctx);
            positionPrehistoricSeriesStones(layer,pack,stage,bounds);
            pack.classList.add("bha-prehistoric-pack-active");
            stage.classList.add("bha-prehistoric-stage-active");
            return true;
        }
        layer?.remove?.();
        layer=document.createElement("div");
        layer.id="bhaPrehistoricPackFx";
        layer.dataset.signature=signature;
        layer.className=`bha-prehistoric-pack-fx ${options?.revealCards?"is-reveal":"is-settled"}`;
        layer.setAttribute("aria-hidden","true");
        positionPrehistoricStageLayer(layer,bounds,148,136);
        layer.innerHTML=`
            <div class="bha-prehistoric-side-vines bha-prehistoric-side-vines--left"><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <div class="bha-prehistoric-side-vines bha-prehistoric-side-vines--right"><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <div class="bha-prehistoric-dino-window"><img class="bha-prehistoric-dino" src="draft-assets/bha_prehistoric_snap_dino.webp" alt=""></div>
            <div class="bha-prehistoric-title-stone">
                <img src="draft-assets/bha_prehistoric_title_stone.webp" alt="">
                <strong>PREHISTORIA SNAPA</strong>
            </div>
            <div class="bha-prehistoric-series-stones">
                <span class="bha-prehistoric-series-stone stone-1"><img src="draft-assets/bha_prehistoric_series_stone.webp" alt=""><b>SERIES 1</b></span>
                <span class="bha-prehistoric-series-stone stone-2"><img src="draft-assets/bha_prehistoric_series_stone.webp" alt=""><b>RECRUIT PASS</b></span>
                <span class="bha-prehistoric-series-stone stone-3"><img src="draft-assets/bha_prehistoric_series_stone.webp" alt=""><b>STARTER CARDS</b></span>
            </div>`;
        pack.classList.add("bha-prehistoric-pack-active");
        stage.classList.add("bha-prehistoric-stage-active");
        stage.appendChild(layer);
        const leafOverlay=getOrCreatePrehistoricLeafOverlay(stage,signature);
        if(leafOverlay) positionPrehistoricStageLayer(leafOverlay,bounds,148,136);
        refreshPrehistoricCardLeaves(leafOverlay||layer,pack,stage,bounds,ctx);
        positionPrehistoricSeriesStones(layer,pack,stage,bounds);
        if(options?.revealCards){
            setTimeout(()=>{
                if(layer?.isConnected&&document.getElementById("bhaPrehistoricPackFx")===layer){
                    layer.classList.remove("is-reveal");
                    layer.classList.add("is-settled");
                }
            },3300);
        }
        return true;
    }
    function ensurePrehistoricPackFx(ctx=context(),options={}){
        const first=renderPrehistoricPackFx(ctx,options);
        if(first) return true;
        [60,260,2450].forEach((delay,index)=>setTimeout(()=>{
            if(state.enabled&&state.active?.id==="prehistoric"&&state.active?.triggered){
                renderPrehistoricPackFx(context(),{...options,revealCards:index<2?options?.revealCards:false});
            }
        },delay));
        return false;
    }
    function refreshSunMoonContext(ctx=context()){
        if(typeof document==="undefined") return;
        const active=Boolean(state.enabled&&state.active?.id==="sun_and_moon"&&state.active?.triggered);
        const banner=document.getElementById("currentPickerBanner");
        document.querySelectorAll?.(".bha-picker-side-chip,.bha-player-side-chip").forEach(node=>node.remove?.());
        banner?.classList?.remove?.("bha-current-picker-side-sun","bha-current-picker-side-moon","bha-current-picker-side-free");
        if(!active) return;
        const assigned=getAssignedSunMoonSide(ctx);
        if(assigned!=="sun"&&assigned!=="moon") return;
        const allowed=getAllowedSide(ctx);
        const meta=getSunMoonSideMeta(assigned);
        const bannerTarget=banner?.querySelector?.("[data-current-picker-context]")||banner;
        if(bannerTarget&&typeof document.createElement==="function"){
            const chip=document.createElement("span");
            chip.className=`bha-picker-side-chip bha-picker-side-chip--${meta.className}${allowed?``:" is-free"}`;
            chip.innerHTML=`<b>${meta.icon}</b>`;
            chip.setAttribute("role","img");
            chip.setAttribute("aria-label",allowed?meta.label:`${meta.label} — brak kart po tej stronie, wybór dowolny`);
            chip.title=allowed?meta.label:`${meta.label} • BRAK KART — WYBÓR DOWOLNY`;
            bannerTarget.prepend(chip);
            banner?.classList?.add(allowed?`bha-current-picker-side-${meta.className}`:"bha-current-picker-side-free");
        }
    }
    function clearArchetypeGravityFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaArchetypeGravitySlot")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-archetype-gravity-pack");
        archetypeGravityVisualSignature="";
    }
    function renderArchetypeGravityFx(ctx=context()){
        if(typeof document==="undefined") return false;
        const pack=document.getElementById("pack");
        if(!pack) return false;
        const tag=state.active?.gravityTag||null;
        if(!tag?.id){clearArchetypeGravityFx();return false;}
        const buttons=[...pack.querySelectorAll(":scope > .pack-card-btn,:scope > .joker-card-btn")];
        if(!buttons.length) return false;
        const signature=`${tag.id}:${buttons.length}:${buttons.map(button=>button?.dataset?.cardInstanceId||button?.dataset?.packIndex||"").join("|")}`;
        const existing=document.getElementById("bhaArchetypeGravitySlot");
        if(existing&&archetypeGravityVisualSignature===signature){
            existing.querySelector?.(".bha-archetype-gravity-label")?.replaceChildren?.(document.createTextNode(String(tag.name||tag.id)));
            return true;
        }
        existing?.remove?.();
        pack.classList.add("bha-archetype-gravity-pack");
        const slot=document.createElement("div");
        slot.id="bhaArchetypeGravitySlot";
        slot.className="bha-archetype-gravity-slot";
        slot.setAttribute("aria-hidden","true");
        slot.innerHTML=`<div class="bha-archetype-gravity-well"><i class="bha-gravity-disc disc-a"></i><i class="bha-gravity-disc disc-b"></i><i class="bha-gravity-disc disc-c"></i><span class="bha-gravity-core"></span><span class="bha-gravity-pulse pulse-a"></span><span class="bha-gravity-pulse pulse-b"></span><strong class="bha-archetype-gravity-label"></strong></div>`;
        slot.querySelector(".bha-archetype-gravity-label").textContent=String(tag.name||tag.id);
        const midpoint=Math.ceil(buttons.length/2);
        const anchor=buttons[midpoint]||null;
        if(anchor) pack.insertBefore(slot,anchor); else pack.appendChild(slot);
        archetypeGravityVisualSignature=signature;
        return true;
    }
    function clearCustomPackCrackFx(){
        if(typeof document==="undefined") return;
        document.getElementById("bhaCustomPackCrackFx")?.remove?.();
        document.getElementById("pack")?.classList?.remove?.("bha-custom-pack-crack-pack");
        customPackCrackVisualSignature="";
    }
    function buildCustomPackCrackStrand(index=0){
        const strand=document.createElement("span");
        strand.className=`bha-custom-dna-strand strand-${(index%6)+1}`;
        strand.style.setProperty("--dna-i",String(index));
        for(let n=0;n<9;n++){
            const rung=document.createElement("i");
            rung.style.setProperty("--rung",String(n));
            const left=document.createElement("b");
            const right=document.createElement("b");
            const bond=document.createElement("em");
            rung.append(left,bond,right);
            strand.appendChild(rung);
        }
        return strand;
    }
    function renderCustomPackCrackFx(ctx=context(),options={}){
        if(typeof document==="undefined") return false;
        const pack=document.getElementById("pack");
        if(!pack||host()?.isPackOpen?.()===false) return false;
        const packId=String(state.active?.customPackId||ctx?.currentCustomPackDefinition?.id||ctx?.customPackId||"");
        const buttons=[...pack.querySelectorAll(":scope > .pack-card-btn,:scope > .joker-card-btn")];
        if(!buttons.length) return false;
        const signature=`${packId}:${buttons.length}:${buttons.map(button=>button?.dataset?.cardInstanceId||button?.dataset?.packIndex||"").join("|")}`;
        const existing=document.getElementById("bhaCustomPackCrackFx");
        if(existing&&customPackCrackVisualSignature===signature) return true;
        existing?.remove?.();
        pack.classList.add("bha-custom-pack-crack-pack");
        const layer=document.createElement("div");
        layer.id="bhaCustomPackCrackFx";
        layer.className=`bha-custom-pack-crack-fx${options?.revealCards?" is-reveal":""}`;
        layer.setAttribute("aria-hidden","true");
        for(let i=0;i<7;i++) layer.appendChild(buildCustomPackCrackStrand(i));
        const haze=document.createElement("span");
        haze.className="bha-custom-dna-haze";
        layer.appendChild(haze);
        pack.appendChild(layer);
        customPackCrackVisualSignature=signature;
        if(options?.revealCards) setTimeout(()=>layer?.classList?.remove?.("is-reveal"),1500);
        return true;
    }
    function getPackPresentation(){
        if(!state.enabled||!state.active?.triggered) return null;
        if(state.active.id==="techno_organic_virus"||state.active.id==="living_tribunal") return null;
        return {
            active:true,
            id:state.active.id,
            name:state.active.name||getDefinition(state.active.id)?.name||"ANOMALIA",
            rarity:state.active.rarity||getDefinition(state.active.id)?.rarity||"rare",
            timing:state.active.timing||getDefinition(state.active.id)?.timing||null,
            replacePackTitle:(state.active.replacePackTitle??getDefinition(state.active.id)?.replacePackTitle)!==false
        };
    }
    function appendCardNumberBadge(button,index,packContext={}){
        if(!button||typeof document==="undefined"||!document.createElement||button.querySelector?.(".bha-card-number")) return;
        const displayIndex=Number(packContext?.displayIndex);
        const number=(Number.isInteger(displayIndex)&&displayIndex>=0?displayIndex:Number(index))+1;
        const badge=document.createElement("span");
        badge.className="bha-card-number";
        badge.textContent=String(number);
        badge.setAttribute("aria-hidden","true");
        button.appendChild(badge);
        button.dataset.anomalyCardNumber=String(number);
    }

    function decoratePackCard(button,card,index,packContext={}){
        if(!state.enabled||!state.active?.triggered||!button) return button;
        const id=state.active.id,ctx=packContext&&typeof packContext==="object"?packContext:context();
        button.dataset.blackHoleAnomaly=id;
        button.dataset.anomaly=id;
        if(id==="double_trouble"&&card?.anomalyDoubleTroublePairId){
            button.classList?.add?.("bha-double-trouble-card");
            button.style?.setProperty?.("--double-trouble-color",String(card.anomalyDoubleTroubleColor||"#7eefff"));
            button.dataset.pairId=String(card.anomalyDoubleTroublePairId);
            button.dataset.pairPosition=String(card.anomalyDoubleTroublePairPosition||1);
            if(typeof document!=="undefined"&&document.createElement&&!button.querySelector?.(".bha-double-trouble-marker")){
                const marker=document.createElement("span");marker.className="bha-double-trouble-marker";marker.textContent="●";marker.setAttribute("aria-hidden","true");button.appendChild(marker);
            }
        }
        if(card?.anomalyKangTemporal){
            button.classList?.add?.("bha-kang-temporal-card");
            button.dataset.kangTemporal="true";
            if(typeof document!=="undefined"&&document.createElement&&!button.querySelector?.(".bha-kang-temporal-mark")){
                const mark=document.createElement("span");mark.className="bha-kang-temporal-mark";mark.textContent="↶";mark.setAttribute("aria-hidden","true");button.appendChild(mark);
            }
        }
        if(card?.anomalyCostCut){
            button.classList?.add?.("bha-card-cost-cut-result");
            button.dataset.costCutSource=String(card?.anomalyCostCutSourceName||"");
            if(typeof document!=="undefined"&&document.createElement&&!button.querySelector?.(".bha-cost-cut-result-badge")){
                const marker=document.createElement("span");
                marker.className="bha-cost-cut-result-badge";
                marker.textContent="↓";
                marker.setAttribute("aria-hidden","true");
                button.appendChild?.(marker);
            }
        }
        if(id==="cosmic_rain"&&card?.anomalyCosmicRain) appendCosmicRainCardFx(button,card,ctx);
        if(id==="joker_rift"&&card?.joker&&card?.anomalyJokerRift){
            const variant=Math.abs(Number(index||0))%4;
            button.classList?.add?.("bha-joker-rift-card",`bha-joker-rift-card--${variant}`);
            button.dataset.jokerRiftVariant=String(variant);
        }
        if(id==="shadow_veil"&&Number(ctx.currentPickIndex||0)<Number(ctx.players?.length||0)){
            button.classList?.add?.("bha-card-shadowed");
            button.setAttribute?.("data-card-tooltip-suppressed","true");
            button.setAttribute?.("aria-label","Ukryta karta Anomalii Cienia");
            appendCardNumberBadge(button,index,ctx);
        }
        if(id==="guess_who"){
            button.classList?.add?.("bha-card-guess");
            button.setAttribute?.("data-card-tooltip-suppressed","true");
            const cost=Number(card?.cost),isSkill=String(card?.cardType||"").toLowerCase()==="skill",power=Number(card?.power);
            const stats=[];
            if(Number.isFinite(cost)) stats.push(`koszt ${cost}`);
            if(!isSkill&&Number.isFinite(power)) stats.push(`siła ${power}`);
            button.setAttribute?.("aria-label",`Ukryta nazwa karty${stats.length?`: ${stats.join(", ")}`:""}`);
            appendCardNumberBadge(button,index,ctx);
        }
        if(id==="sun_and_moon"){
            ensureSunMoonAssignments(Array.isArray(ctx.currentPack)?ctx.currentPack:[]);
            let side=card?.anomalySide;
            if(side!=="moon"&&side!=="sun"){
                side="moon";
                if(card&&typeof card==="object") card.anomalySide=side;
            }
            const allowed=getAllowedSide(ctx);
            const meta=getSunMoonSideMeta(side);
            button.classList?.add?.(`bha-card-${side}`);
            button.dataset.anomalySide=side;
            button.dataset.anomalySideLabel=meta.label;
            if(allowed&&allowed!==side){
                button.classList?.add?.("bha-card-side-locked");
                button.setAttribute?.("aria-disabled","true");
            }
            if(typeof document!=="undefined"&&document.createElement){
                const aura=document.createElement("span");
                aura.className=`bha-side-aura bha-side-aura--${meta.className}`;
                aura.setAttribute?.("aria-hidden","true");
                button.appendChild?.(aura);
                const badge=document.createElement("span");
                badge.className="bha-side-badge";
                badge.textContent=meta.icon;
                badge.setAttribute?.("aria-hidden","true");
                button.appendChild?.(badge);
                const label=document.createElement("span");
                label.className=`bha-side-label bha-side-label--${meta.className}`;
                label.textContent=meta.cardLabel;
                label.setAttribute?.("aria-hidden","true");
                button.appendChild?.(label);
            }
        }
        if(id==="zombie_horde"&&zombieHordeCard(card)){
            button.classList?.add?.("bha-zombie-horde-card");
            button.dataset.zombieHorde="true";
            button.dataset.zombieHordeGeneration=String(Number(card?.anomalyZombieHordeGeneration)||0);
            button.style?.setProperty?.("--bha-zombie-tilt",`${Number(card?.anomalyZombieHordeTilt)||0}deg`);
            button.style?.setProperty?.("--bha-zombie-scale",String(Number(card?.anomalyZombieHordeScale)||1));
            if(typeof document!=="undefined"&&document.createElement){
                button.querySelectorAll?.(".pack-card-inner .bha-zombie-horde-bg,.pack-card-inner .bha-zombie-horde-zombie,.pack-card-inner .bha-zombie-horde-logo")?.forEach?.(node=>node.remove?.());
                let artLayer=button.querySelector?.(":scope > .bha-zombie-horde-art-layer");
                if(!artLayer){artLayer=document.createElement("span");artLayer.className="bha-zombie-horde-art-layer";artLayer.setAttribute("aria-hidden","true");button.prepend(artLayer);}
                if(!artLayer.querySelector?.(".bha-zombie-horde-bg")){
                    const bg=document.createElement("img");bg.className="bha-zombie-horde-bg";bg.src="draft-assets/zombie-horde/horde_bg.webp";bg.alt="";bg.decoding="async";bg.loading="eager";bg.setAttribute("aria-hidden","true");artLayer.appendChild(bg);
                }
                if(!artLayer.querySelector?.(".bha-zombie-horde-zombie")){
                    const image=document.createElement("img");image.className="bha-zombie-horde-zombie";image.src=ZOMBIE_HORDE_ASSETS[Math.max(0,Math.min(ZOMBIE_HORDE_ASSETS.length-1,zombieHordeVariant(card)-1))];image.alt="";image.decoding="async";image.loading="eager";image.setAttribute("aria-hidden","true");artLayer.appendChild(image);
                }
                if(!button.querySelector?.(":scope > .bha-zombie-horde-slime")){
                    const slime=document.createElement("span");slime.className="bha-zombie-horde-slime";slime.setAttribute("aria-hidden","true");slime.innerHTML="<i></i><i></i><i></i><i></i>";button.appendChild(slime);
                }
                if(!button.querySelector?.(":scope > .bha-zombie-horde-logo")){
                    const logo=document.createElement("img");logo.className="bha-zombie-horde-logo";logo.src="draft-assets/zombie-horde/horde_logo.webp";logo.alt="";logo.decoding="async";logo.loading="eager";logo.setAttribute("aria-hidden","true");button.appendChild(logo);
                }
                if(!button.querySelector?.(":scope > .bha-zombie-horde-gas")){
                    const gas=document.createElement("span");gas.className="bha-zombie-horde-gas";gas.setAttribute("aria-hidden","true");button.appendChild(gas);
                }
            }
            if(card?.anomalyZombieHordeJustInfected) button.classList?.add?.("bha-zombie-horde-newly-infected");
        }
        if(id==="forbidden_fruit"){
            button.classList?.remove?.("bha-forbidden-fruit-card","bha-forbidden-fruit-denied");
            if(button.dataset) delete button.dataset.forbiddenFruit;
            button.removeAttribute?.("aria-disabled");
            button.querySelector?.(".bha-forbidden-fruit-mark")?.remove?.();
            const fruit=getForbiddenFruitState(ctx);
            if(fruit?.rule&&forbiddenFruitHasLegalCard(fruit.rule,ctx)&&forbiddenFruitRuleMatches(card,fruit.rule)){
                const label=fruit.label||forbiddenFruitRuleLabel(fruit.rule);
                button.classList?.add?.("bha-forbidden-fruit-card");
                button.dataset.forbiddenFruit="true";
                button.setAttribute?.("aria-disabled","true");
                button.setAttribute?.("aria-label",`${card?.name||"Karta"} — Zakazany Owoc: ${label.main||"zakazana karta"}`);
                if(typeof document!=="undefined"&&document.createElement&&!button.querySelector?.(".bha-forbidden-fruit-mark")){
                    const mark=document.createElement("span");mark.className="bha-forbidden-fruit-mark";mark.textContent="×";mark.setAttribute("aria-hidden","true");button.appendChild(mark);
                }
            }
        }
        if(id==="night_of_the_living_dead"&&card?.anomalyLivingDead){
            const source=String(card?.anomalyLivingDeadSource||"zombie");
            const label=String(card?.anomalyLivingDeadLabel||"").toUpperCase()==="GRAVEYARD"?"CMENTARZYSKO":"ZOMBIE";
            button.classList?.add?.("bha-undead-card",source==="graveyard"?"bha-undead-card--graveyard":"bha-undead-card--zombie");
            button.dataset.undeadSource=source;
            if(typeof document!=="undefined"){
                button.querySelectorAll?.('.bha-undead-badge,.bha-undead-cross,.bha-undead-grave-label')?.forEach(node=>node.remove?.());
                if(document.createElement&&!button.querySelector?.('.bha-undead-grave-label')){
                    const badge=document.createElement('span');
                    badge.className='bha-undead-grave-label';
                    badge.textContent=label;
                    badge.setAttribute('aria-hidden','true');
                    button.appendChild(badge);
                }
            }
            button.setAttribute?.("aria-label",`${card?.name||"Karta"} — ${source==="graveyard"?"powrót z Kosmicznego Cmentarzyska":"zombie filler"}`);
        }
        return button;
    }
    function canPickCard(index,packContext={}){
        if(!state.enabled) return {ok:true};
        if(blocksInteraction()) return {ok:false,reason:"Anomalia jest właśnie rozstrzygana."};
        if(!state.active?.triggered) return {ok:true};
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(state.active.id==="forbidden_fruit"){
            const card=ctx.currentPack?.[Number(index)];
            if(!card) return {ok:false,reason:"Karta nie znajduje się już w paczce."};
            const fruit=getForbiddenFruitState(ctx);
            if(!fruit?.rule||!forbiddenFruitHasLegalCard(fruit.rule,ctx)){
                return {ok:true,fallback:"forbidden_fruit_all_blocked"};
            }
            if(forbiddenFruitRuleMatches(card,fruit.rule)){
                playForbiddenFruitDeny(index);
                return {ok:false,reason:"TA KARTA JEST TERAZ ZAKAZANA"};
            }
            return {ok:true};
        }
        if(state.active.id!=="sun_and_moon") return {ok:true};
        ensureSunMoonAssignments(Array.isArray(ctx.currentPack)?ctx.currentPack:[]);
        const card=ctx.currentPack?.[Number(index)];
        if(!card) return {ok:false,reason:"Karta nie znajduje się już w paczce."};
        const side=getAllowedSide(ctx);
        if(!side) return {ok:true,fallback:"sun_moon_side_exhausted"};
        const hasLegalSideCard=(Array.isArray(ctx.currentPack)?ctx.currentPack:[]).some(entry=>entry?.anomalySide===side);
        if(!hasLegalSideCard) return {ok:true,fallback:"sun_moon_side_exhausted"};
        if(card.anomalySide!==side) return {ok:false,reason:`Ten gracz wybiera ze Strefy ${side==="sun"?"Dnia":"Nocy"}.`};
        return {ok:true};
    }
    function resolveLivePackCard(cardOrInstanceId,packContext={}){
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        const pack=Array.isArray(ctx.currentPack)?ctx.currentPack:[];
        if(cardOrInstanceId&&typeof cardOrInstanceId==="object"){
            const id=String(cardOrInstanceId.instanceId||"");
            return pack.find(card=>card===cardOrInstanceId||(id&&String(card?.instanceId||"")===id))||null;
        }
        const id=String(cardOrInstanceId||"");
        return pack.find(card=>id&&String(card?.instanceId||"")===id)||null;
    }
    function isCardIdentityConcealed(cardOrInstanceId,packContext={}){
        if(!state.enabled||!state.active?.triggered) return false;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(!resolveLivePackCard(cardOrInstanceId,ctx)) return false;
        if(state.active.id==="guess_who") return true;
        return state.active.id==="shadow_veil"&&Number(ctx.currentPickIndex||0)<Number(ctx.players?.length||0);
    }
    function getPublicCardSnapshot(card,index,packContext={}){
        if(!card||!state.enabled||!state.active?.triggered) return card;
        const ctx=packContext&&typeof packContext==="object"?packContext:context();
        if(state.active.id==="shadow_veil"&&Number(ctx.currentPickIndex||0)<Number(ctx.players?.length||0)){
            return {name:"Ukryta karta",id:"bha-shadow-card",instanceId:card.instanceId||null,tags:[],__blackHoleBlind:true};
        }
        if(state.active.id==="guess_who"){
            return {name:"? ? ?",id:"bha-guess-card",instanceId:card.instanceId||null,cost:card.cost,power:card.power,cardType:card.cardType||null,joker:Boolean(card.joker),tags:[],__blackHoleGuess:true};
        }
        return card;
    }

    function runtimeInfoHtml(){
        if(!state.enabled) return "";
        const chance=Math.round(Number(state.config.chance||0)*100),last=state.events[state.events.length-1];
        const adminDef=state.adminTest?.enabled?getDefinition(state.adminTest.anomalyId):null;
        const modeLine=adminDef&&!state.adminTest.completed?`TEST QA • ${escapeHtml(adminDef.name)}${state.adminTest.blockedReason?" • OCZEKUJE NA LEGALNY MOMENT":""}`:`TIMELINE • ${chance}% INTENSYWNOŚCI${state.config.guarantee?" • GWARANCJA 1":""}`;
        const ongoing=shootingStarsActive()?` • 🌠 GWIAZDY ${Number(state.ongoing?.hits?.length||0)}/${Number(state.ongoing?.starCount||6)}`:"";
        const virus=technoOrganicVirusActive()?` • 🦠 WIRUS AKTYWNY`:"";
        const mephisto=state.ongoing?.id==="mephisto_pact"&&state.ongoing?.triggered?` • 😈 PAKTY ${Number(state.ongoing?.temptationsDone||0)}/${Number(state.ongoing?.temptationsTotal||3)}`:"";
        const contract=state.astralContract?.active?` • ✦ KONTRAKT`:"";
        const kang=state.kangTimeRewind?.active?` • ↶ KANG`:"";
        return `<div class="bha-runtime-info"><small>ANOMALIE CZARNEJ DZIURY</small><b>${modeLine}${ongoing}${virus}${mephisto}${contract}${kang}</b><span>Aktywowane: ${state.events.length}${last?` • Ostatnia: ${escapeHtml(last.name)}`:""}</span></div>`;
    }
    function refreshRuntimeInfo(){global.updateInfoPanel?.();}
    function getArchiveData(){
        const virus=state.technoOrganicVirus?.active?{
            anomalyId:"techno_organic_virus",
            active:true,
            activatedPackNumber:Number(state.technoOrganicVirus.activatedPackIndex||0)+1,
            picksPerPlayer:Number(state.technoOrganicVirus.picksPerPlayer||4),remainingPickMutations:Number(state.technoOrganicVirus.remainingPickMutations||0),totalPickMutations:Number(state.technoOrganicVirus.totalPickMutations||0),players:Object.values(state.technoOrganicVirus.players||{}).map(entry=>({playerIndex:Number(entry.playerIndex),playerName:entry.playerName||null,patientZeroName:entry.patientZeroName||null,patientZeroInstanceId:entry.patientZeroInstanceId||null,cost:entry.cost??null,power:entry.power??null,infections:Number(entry.infections||0),remainingPickMutations:Number(entry.remainingPickMutations??0),totalPickMutations:Number(entry.totalPickMutations??4)})),
            history:clone(state.technoOrganicVirus.history||[])
        }:null;
        const timeline=(Array.isArray(state.timeline)?state.timeline:[]).map(item=>({
            scheduleId:item.scheduleId||null,
            anomalyId:item.id,
            name:item.name,
            rarity:item.rarity,
            timing:item.timing,
            window:item.window||null,
            slot:clone(item.slot||null),
            packNumber:(item.packIndex===null||item.packIndex===undefined)?null:Number(item.packIndex)+1,
            guaranteed:Boolean(item.guaranteed),
            triggered:Boolean(item.triggered),
            skipped:Boolean(item.skipped),
            skipReason:item.skipReason||null,
            fallbackFrom:item.fallbackFrom||null,
            backupIds:clone(item.backupIds||[])
        }));
        const tribunal=state.livingTribunal?{
            anomalyId:"living_tribunal",
            active:Boolean(state.livingTribunal.active),
            ending:Boolean(state.livingTribunal.ending),
            picksPerPlayer:Number(state.livingTribunal.picksPerPlayer||2),
            totalPicks:Number(state.livingTribunal.totalPicks||0),
            picksRemaining:Number(state.livingTribunal.picksRemaining||0),
            perPlayerRemaining:clone(state.livingTribunal.perPlayerRemaining||{}),
            startedPackNumber:Number(state.livingTribunal.startedPackIndex||0)+1,
            startedAfterPick:Number(state.livingTribunal.startedAfterPick||0),
            history:clone(state.livingTribunal.history||[])
        }:null;
        return {schema:"msp-snapdraft/black-hole-anomalies",version:VERSION,schedulerVersion:SCHEDULER_VERSION,enabled:Boolean(state.enabled),config:clone(state.config),timeline,astralContractHistory:clone(state.astralContractHistory||[]),kangHistory:clone(state.kangHistory||[]),ongoing:state.ongoing?{anomalyId:state.ongoing.id,name:state.ongoing.name,rarity:state.ongoing.rarity,timing:state.ongoing.timing,window:state.ongoing.window||null,duration:state.ongoing.duration,triggered:Boolean(state.ongoing.triggered),starCount:Number(state.ongoing.starCount||0),starsByPack:clone(state.ongoing.starsByPack||{}),hits:clone(state.ongoing.hits||[]),wishes:clone(state.ongoing.wishes||[]),treasureTemplateName:state.ongoing.treasureTemplateName||null,treasureHint:state.ongoing.treasureHint||null,pendingTreasurePackIndex:Number.isInteger(Number(state.ongoing.pendingTreasurePackIndex))?Number(state.ongoing.pendingTreasurePackIndex):null,found:Boolean(state.ongoing.found),foundByPlayerIndex:Number.isInteger(Number(state.ongoing.foundByPlayerIndex))?Number(state.ongoing.foundByPlayerIndex):null,rewardClaimed:Boolean(state.ongoing.rewardClaimed),rewardSummary:clone(state.ongoing.rewardSummary||null),temptationsTotal:Number(state.ongoing.temptationsTotal||0),temptationsDone:Number(state.ongoing.temptationsDone||0),gapPicks:Number(state.ongoing.gapPicks||0),temptationPlan:clone(state.ongoing.temptationPlan||[]),lastSelectionCriterion:state.ongoing.lastSelectionCriterion||null,history:clone(state.ongoing.history||[])}:null,technoOrganicVirus:virus,livingTribunal:tribunal,planned:state.plan.map(item=>({anomalyId:item.id,name:item.name,rarity:item.rarity,timing:item.timing,window:item.window||null,slot:clone(item.slot||null),packNumber:(item.packIndex===null||item.packIndex===undefined)?null:Number(item.packIndex)+1,guaranteed:Boolean(item.guaranteed),triggered:Boolean(item.triggered)})),events:clone(state.events),summary:{activations:state.events.length,scheduled:timeline.length,shootingStarHits:Number(state.ongoing?.hits?.length||0),shootingStarWishes:Number(state.ongoing?.wishes?.length||0),technoOrganicMutations:Number(state.technoOrganicVirus?.history?.length||0),livingTribunalPicks:Number(state.livingTribunal?.history?.length||0),astralContracts:Number(state.astralContractHistory?.length||0),kangRewinds:Number(state.kangHistory?.length||0),byRarity:state.events.reduce((map,event)=>{map[event.rarity]=(map[event.rarity]||0)+1;return map;},{})}};
    }
    function exportState(){return clone({...state,locked:false});}
    function normalizeRestoredTimeline(restored){
        if(Array.isArray(restored.timeline)&&restored.timeline.length){
            restored.timeline=restored.timeline.map((item,index)=>({...item,schedulerVersion:item.schedulerVersion||restored.schedulerVersion||SCHEDULER_VERSION,scheduleId:item.scheduleId||`restored-${index+1}-${item.id||"anomaly"}`,window:item.window||getDefinition(item.id)?.window||({draft_start:"draft_start",before_open:"before_pack_open",after_open:"after_pack_open",mid_pack:"after_pick",after_pack:"after_pack"}[item.timing]||null),slot:item.slot||((item.timing==="draft_start"||item.window==="draft_start")?{type:"draft_start",packIndex:null,cycleIndex:null}:{type:item.window||getDefinition(item.id)?.window||"before_pack_open",packIndex:Number.isInteger(Number(item.packIndex))?Number(item.packIndex):0,cycleIndex:Number.isInteger(Number(item.packIndex))?Number(item.packIndex):0}),backupIds:Array.isArray(item.backupIds)?item.backupIds:[]}));
        }else{
            const legacyPlan=Array.isArray(restored.plan)?restored.plan:[];
            restored.timeline=legacyPlan.map((item,index)=>({...item,schedulerVersion:SCHEDULER_VERSION,scheduleId:item.scheduleId||`legacy-${index+1}-${item.id||"anomaly"}`,window:item.window||getDefinition(item.id)?.window||({before_open:"before_pack_open",after_open:"after_pack_open",mid_pack:"after_pick",after_pack:"after_pack"}[item.timing]||"before_pack_open"),slot:item.slot||{type:item.window||getDefinition(item.id)?.window||"before_pack_open",packIndex:Number(item.packIndex||0),cycleIndex:Number(item.packIndex||0)},backupIds:Array.isArray(item.backupIds)?item.backupIds:[]}));
            if(restored.ongoing?.id){
                restored.timeline.unshift({...clone(restored.ongoing),schedulerVersion:SCHEDULER_VERSION,scheduleId:restored.ongoing.scheduleId||`legacy-ongoing-${restored.ongoing.id}`,window:"draft_start",slot:{type:"draft_start",packIndex:null,cycleIndex:null},packIndex:null,backupIds:[]});
            }
        }
        restored.plan=restored.timeline.filter(item=>item.window!=="draft_start"&&item.timing!=="draft_start");
        return restored;
    }
    function restoreState(payload){
        if(!payload||typeof payload!=="object") return false;
        const restored=normalizeRestoredTimeline({...createState(),...clone(payload),locked:false,schedulerVersion:payload.schedulerVersion||SCHEDULER_VERSION});
        if(restored.livingTribunal) ensureLivingTribunalPerPlayerState(restored.livingTribunal,{players:restored.draftPlayers||[]});
        if(restored.technoOrganicVirus) ensureTechnoOrganicVirusPerPlayerState(restored.technoOrganicVirus);
        state=restored;
        setLocked(false);refreshRuntimeInfo();refreshPackAmbience();return true;
    }
    function reset(){clearTimeout(activationTimer);clearTimeout(leaveTimer);clearAstralContractModal();clearKangTimeRewindFx();clearMephistoPactModal();astralContractResume=null;state=createState();battleworldSession=null;setLocked(false);if(typeof document!=="undefined"){document.getElementById("bhaActivationOverlay")?.classList.remove("is-active","is-leaving","is-entering","bha-shooting-stars-intro","bha-cosmic-treasure-intro");document.getElementById("bhaShootingStarWishModal")?.remove?.();document.getElementById("bhaShootingStarHitFx")?.remove?.();document.getElementById("bhaCosmicTreasureMapModal")?.remove?.();document.getElementById("bhaCosmicTreasureRewardModal")?.remove?.();document.getElementById("bhaCosmicTreasureDiscoveryFx")?.remove?.();document.getElementById("bhaMephistoPactModal")?.remove?.();}clearBattleworldPresentation();clearJeffPackAmbience();clearGoldenMeteorFx();clearSunMoonPackFx();clearPrehistoricPackFx();clearArchetypeGravityFx();clearCustomPackCrackFx();clearZombieHordePackFx();clearForbiddenFruitFx();clearTechnoOrganicVirusFx();clearLivingTribunalPanel();}
    function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]));}
    function getState(){return clone(state);} function getRegistry(){return clone(REGISTRY);} function getRuntimeRegistry(){return clone(runtimeRegistry());} function isEnabled(){return Boolean(state.enabled);}

    function getEncyclopediaRegistry(){
        return REGISTRY.map(def=>({
            name:def.name,
            rarity:def.rarity,
            timing:def.timing,
            window:def.window||null,
            windowLabel:WINDOW_LABELS[def.window]||TIMING_LABELS[def.timing]||def.window||def.timing,
            description:def.description,
            runtimeReady:Boolean(def.runtimeReady),
            requiresEconomy:Boolean(def.requiresEconomy),
            minPackIndex:Number(def.minPackIndex||0),
            duration:def.duration||null,
            scope:Array.isArray(def.scope)?clone(def.scope):[]
        }));
    }

    const api=Object.freeze({VERSION,SCHEDULER_VERSION,REGISTRY,isDoubleTroubleActive:()=>Boolean(state.enabled&&state.active?.id==="double_trouble"&&state.active?.triggered),getRegistry,getRuntimeRegistry,getEncyclopediaRegistry,getDefinition,buildTimeline,buildPlan,getSettingsConfig,getAdminTestConfig:loadAdminTestSettings,beginDraft,beforeDraftStart,reset,isEnabled,getState,onPackPrepared,onPackOpened,beforeAdvance,onCardCommitted,onPackCardsReplaced,decoratePackCard,canPickCard,resolvePackPick,preparePickedCardForDeck,playZombieHordePickAnimation,isCardIdentityConcealed,getPublicCardSnapshot,getPackPresentation,refreshPackAmbience,playJeffOpenWaveFx,playGoldenMeteorFx,afterPackRendered,afterPackRevealComplete,afterDecksRendered,refreshSunMoonContext,getGlitchPackMutationCount,battleworldEligibleIndexes,getBattleworldOrder,selectBattleworldCard,blocksInteraction,blocksSuperpowers,getSuperpowerInterference,getSuperpowerBlockReason,isShootingStarCard,isProtectedPackCard:isCosmicTreasureCard,playShootingStarPickAnimation,playKlyntarPickAnimation,resolvePostPick,applyPendingQueuePriority,getKlyntarTurnMeta,getKlyntarQueueState,getInvisibleQueueState,isQueueFrozen,getForbiddenFruitState,getLivingTribunalState,buildLivingTribunalRecommendations,astralContractEligiblePlayerPairs,astralContractSwapOptions,prepareKangTimeRewindPlan,resolveKlyntarSymbiosisPick,runtimeInfoHtml,getArchiveData,exportState,restoreState,openSettings,closeSettings,openAdminTest,closeAdminTest,bindUi,rarityLabels:RARITY_LABELS,rarityWeights:RARITY_WEIGHTS,timingLabels:TIMING_LABELS,windowLabels:WINDOW_LABELS});
    if(typeof document!=="undefined"&&!global.__BHA_CATALOG_MODE__){if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",bindUi,{once:true});else bindUi();}
    return api;
});
