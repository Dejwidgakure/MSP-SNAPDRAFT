/* MSP SNAPDRAFT - SYSTEM TURNIEJOWY PATCH 4
   Bundled pure tournament engine bootstrap (identical rules to tournament-engine.js).
   Older statistics HTML pages may load only draft-stats-engine.js; this bootstrap
   makes them compatible with future tournament records without requiring page edits.
   The separate tournament-engine.js remains the public engine for draft and Kroniki.
*/
/* MSP SNAPDRAFT — SYSTEM TURNIEJOWY V1 | PATCH 1
   Pure, deterministic bracket engine. Browser: window.DraftTournamentEngine.
   Node: require('./tournament-engine.js'). Does not touch DOM or existing drafts.
*/
(function(root,factory){
  if(root.DraftTournamentEngine) return; // Prefer the external engine when already loaded.
  const api=factory();
  root.DraftTournamentEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const VERSION='1.0.0-patch1';
  const FORMAT='single_elimination';
  const BYE_POINTS=20;
  const PHASE_STEP=60;
  const SIZES=Object.freeze([8,10,12]);
  const ROUND=Object.freeze({PRE:'preliminary',QF:'quarterfinal',SF:'semifinal',BRONZE:'third_place',FINAL:'final'});
  const LABELS=Object.freeze({preliminary:'Kwalifikacje',quarterfinal:'Ćwierćfinał',semifinal:'Półfinał',third_place:'Mecz o 3. miejsce',final:'Finał'});
  const str=v=>String(v??'').trim();
  const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
  const pairKey=(a,b)=>[str(a),str(b)].sort().join('\u0000');
  const warn=(code,details={})=>({code,...details});
  const sourcePlayer=name=>({type:'player',name});
  const sourceRef=(type,fixtureId)=>({type,fixtureId});
  const fixture=(id,round,source1,source2)=>({id,round,slots:[source1,source2]});

  function seededRandom(seed){
    let h=2166136261;
    for(const ch of String(seed)){
      h=Math.imul(h^ch.charCodeAt(0),16777619);
    }
    return ()=>{
      h+=0x6D2B79F5;
      let x=h;
      x=Math.imul(x^(x>>>15),x|1);
      x^=x+Math.imul(x^(x>>>7),x|61);
      return ((x^(x>>>14))>>>0)/4294967296;
    };
  }
  function shuffle(input,rng){
    const list=input.slice();
    for(let i=list.length-1;i>0;i--){
      const j=Math.floor(rng()*(i+1));
      [list[i],list[j]]=[list[j],list[i]];
    }
    return list;
  }
  function buildBracket(playerNames,seed){
    const players=Array.isArray(playerNames)?playerNames.map(str):[];
    if(!SIZES.includes(players.length)) throw new Error('Turniej V1 wymaga 8, 10 lub 12 graczy.');
    if(players.some(name=>!name)||new Set(players).size!==players.length) throw new Error('Lista graczy ma puste lub zduplikowane nazwy.');
    if(seed===undefined||seed===null||str(seed)==='') throw new Error('Wymagany jawny seed losowania, aby utrwalić drabinkę.');
    const rng=seededRandom(seed);
    const shuffled=shuffle(players,rng);
    const prelimCount=players.length-8;
    const prePlayers=shuffled.slice(0,prelimCount*2);
    const byePlayers=players.length===8?[]:shuffled.slice(prelimCount*2);
    const fixtures=[];
    for(let i=0;i<prelimCount;i++){
      fixtures.push(fixture(`P${i+1}`,ROUND.PRE,sourcePlayer(prePlayers[i*2]),sourcePlayer(prePlayers[i*2+1])));
    }
    let qfSlots=[];
    if(players.length===8){
      for(let i=0;i<4;i++) qfSlots.push([sourcePlayer(shuffled[2*i]),sourcePlayer(shuffled[2*i+1])]);
    }else if(players.length===10){
      // The two potential qualifiers begin in opposite semifinal halves.
      qfSlots=[
        [sourceRef('winner','P1'),sourcePlayer(byePlayers[0])],
        [sourcePlayer(byePlayers[2]),sourcePlayer(byePlayers[3])],
        [sourceRef('winner','P2'),sourcePlayer(byePlayers[1])],
        [sourcePlayer(byePlayers[4]),sourcePlayer(byePlayers[5])]
      ];
    }else{
      qfSlots=Array.from({length:4},(_,i)=>[sourceRef('winner',`P${i+1}`),sourcePlayer(byePlayers[i])]);
    }
    // Randomize left and right positions without changing bracket topology.
    qfSlots=qfSlots.map(pair=>rng()<.5?[pair[1],pair[0]]:pair);
    for(let i=0;i<4;i++) fixtures.push(fixture(`QF${i+1}`,ROUND.QF,...qfSlots[i]));
    fixtures.push(fixture('SF1',ROUND.SF,sourceRef('winner','QF1'),sourceRef('winner','QF2')));
    fixtures.push(fixture('SF2',ROUND.SF,sourceRef('winner','QF3'),sourceRef('winner','QF4')));
    fixtures.push(fixture('B',ROUND.BRONZE,sourceRef('loser','SF1'),sourceRef('loser','SF2')));
    fixtures.push(fixture('F',ROUND.FINAL,sourceRef('winner','SF1'),sourceRef('winner','SF2')));
    return {
      schema:'msp-snapdraft/tournament-bracket',version:1,
      format:FORMAT,seed:String(seed),size:players.length,
      roster:players.slice(),
      byePoints:BYE_POINTS,
      byes:byePlayers.map(name=>({name,points:BYE_POINTS})),
      fixtures
    };
  }
  function isTournament(draft){return draft?.competitionFormat?.id===FORMAT;}
  const bonusAt=(round,size)=>{
    const large=size>8;
    if(round==='qualifier') return large?60:0;
    if(round==='quarter') return large?120:60;
    if(round==='semi') return large?240:180;
    if(round==='bronze') return large?180:120;
    if(round==='final') return large?300:240;
    return 0;
  };
  function validateScore(match){
    if(!finite(match.pts1)||!finite(match.pts2)) return false;
    const a=Number(match.pts1),b=Number(match.pts2);
    if(!Number.isInteger(a)||!Number.isInteger(b)||a===b) return false;
    const type=match.resultType||'played';
    if(type==='played') return Math.max(a,b)>=16&&Math.max(a,b)<=25&&Math.min(a,b)>=0&&Math.min(a,b)<=9&&a+b===25;
    if(type==='walkover') return Math.max(a,b)===20&&Math.min(a,b)===0;
    return false;
  }
  function tournamentState(draft){
    const bracket=draft?.tournament;
    const warnings=[];
    const roster=Array.isArray(draft?.players)?draft.players.map(p=>str(p?.name)):[];
    const matches=Array.isArray(draft?.matches)?draft.matches:[];
    if(!isTournament(draft)) warnings.push(warn('notTournament'));
    if(!bracket||bracket.schema!=='msp-snapdraft/tournament-bracket'||bracket.format!==FORMAT){
      return {valid:false,complete:false,warnings:[...warnings,warn('missingBracket')],fixtures:[],standings:[],byes:[],resolvedMatches:0,expectedMatches:0};
    }
    const n=bracket.size;
    if(draft?.scoring?.system!=='standard25') warnings.push(warn('requiresStandard25'));
    if(draft?.competitionFormat?.bonusScheme && draft.competitionFormat.bonusScheme!=='milestones60_v1') warnings.push(warn('unsupportedBonusScheme'));
    if(draft?.competitionFormat?.thirdPlaceMatch===false) warnings.push(warn('thirdPlaceMatchRequired'));
    if(draft?.competitionFormat?.version!==undefined && draft.competitionFormat.version!==1) warnings.push(warn('unsupportedFormatVersion'));
    if(bracket.version!==1) warnings.push(warn('unsupportedBracketVersion'));
    if(bracket.byePoints!==BYE_POINTS) warnings.push(warn('unsupportedByePoints'));
    if(!SIZES.includes(n)){
      return {valid:false,complete:false,warnings:[...warnings,warn('unsupportedSize',{size:n})],fixtures:[],standings:[],byes:[],resolvedMatches:0,expectedMatches:0};
    }
    if(n!==roster.length||!Array.isArray(bracket.roster)||
       bracket.roster.length!==n||roster.some(name=>!name)||new Set(roster).size!==n||
       new Set(bracket.roster).size!==n||roster.some(name=>!bracket.roster.includes(name))){
      warnings.push(warn('rosterMismatch'));
    }
    const prelimCount=n-8;
    const byeCount=n===8?0:n===10?6:4;
    const byeEntries=Array.isArray(bracket.byes)?bracket.byes:[];
    const namesOfByes=byeEntries.map(b=>str(b?.name));
    if(namesOfByes.length!==byeCount||new Set(namesOfByes).size!==byeCount||
       namesOfByes.some(name=>!roster.includes(name))||byeEntries.some(b=>b.points!==BYE_POINTS)) warnings.push(warn('badByes'));
    const expectedIds=[...Array.from({length:prelimCount},(_,i)=>`P${i+1}`),'QF1','QF2','QF3','QF4','SF1','SF2','B','F'];
    const fixtures=Array.isArray(bracket.fixtures)?bracket.fixtures:[];
    if(fixtures.length!==n||fixtures.map(f=>f?.id).join('|')!==expectedIds.join('|')) warnings.push(warn('invalidBracketTopology'));
    // Prevent accidental edits to fixed pairing, BYEs or fixture dependencies.
    try{
      const expected=buildBracket(bracket.roster,bracket.seed);
      if(JSON.stringify(expected.fixtures)!==JSON.stringify(fixtures)||JSON.stringify(expected.byes)!==JSON.stringify(byeEntries)){
        warnings.push(warn('bracketModified'));
      }
    }catch(_){warnings.push(warn('invalidBracketSeed'));}
    const map=new Map();
    for(const [index,match] of matches.entries()){
      const id=str(match?.fixtureId);
      if(!id){warnings.push(warn('unlinkedMatch',{index}));continue;}
      if(!expectedIds.includes(id)){warnings.push(warn('unknownFixture',{index,id}));continue;}
      if(map.has(id)){warnings.push(warn('duplicateFixtureResult',{index,id}));continue;}
      map.set(id,match);
    }
    const stats=new Map(roster.map(name=>[name,{name,rawPoints:0,byePoints:0,phaseBonus:0,total:0,wins:0,losses:0,winPoints:0,lossPoints:0,matches:0,place:null,eliminatedIn:null}]));
    for(const {name,points} of byeEntries){
      const row=stats.get(name);
      if(row){row.byePoints+=BYE_POINTS;row.phaseBonus=bonusAt('qualifier',n);}
    }
    const settled=new Map();
    const rendered=[];
    function sourceValue(source){
      if(source?.type==='player') return str(source.name);
      if(source?.type==='winner'||source?.type==='loser'){
        const prev=settled.get(str(source.fixtureId));
        return prev ? (source.type==='winner'?prev.winner:prev.loser) : null;
      }
      return null;
    }
    let resolvedMatches=0;
    for(const f of fixtures){
      const names=(Array.isArray(f?.slots)?f.slots:[]).map(sourceValue);
      const match=map.get(f.id)||null;
      let status=names.length===2&&names[0]&&names[1]?'ready':'awaiting';
      let winner=null,loser=null;
      if(match){
        if(status==='awaiting'||names[0]!==str(match.p1)||names[1]!==str(match.p2)){
          warnings.push(warn('staleOrUnexpectedMatch',{id:f.id,expected:names,actual:[match.p1,match.p2]}));
          status='conflict';
        }else if(!validateScore(match)){
          warnings.push(warn('invalidTournamentScore',{id:f.id,pts1:match.pts1,pts2:match.pts2,resultType:match.resultType||'played'}));
          status='invalid';
        }else{
          const a=Number(match.pts1),b=Number(match.pts2);
          winner=a>b?names[0]:names[1];
          loser=a>b?names[1]:names[0];
          const sa=stats.get(names[0]),sb=stats.get(names[1]);
          if(sa&&sb){
            for(const [s,pts] of [[sa,a],[sb,b]]){s.rawPoints+=pts;s.matches++;}
            const winStat=stats.get(winner),loseStat=stats.get(loser);
            winStat.wins++;winStat.winPoints+=Math.max(a,b);
            loseStat.losses++;loseStat.lossPoints+=Math.min(a,b);
            const next=f.round===ROUND.PRE?'qualifier':f.round===ROUND.QF?'quarter':f.round===ROUND.SF?'semi':f.round===ROUND.BRONZE?'bronze':'final';
            winStat.phaseBonus=bonusAt(next,n);
            if(f.round===ROUND.PRE)loseStat.eliminatedIn='preliminary';
            else if(f.round===ROUND.QF)loseStat.eliminatedIn='quarterfinal';
            else if(f.round===ROUND.BRONZE)loseStat.eliminatedIn='third_place';
            else if(f.round===ROUND.FINAL)loseStat.eliminatedIn='final';
            settled.set(f.id,{winner,loser});
            resolvedMatches++;
            status='finished';
          }else{
            warnings.push(warn('participantNotInRoster',{id:f.id}));
            status='conflict';
          }
        }
      }
      rendered.push({id:f.id,round:f.round,label:LABELS[f.round],slots:f.slots,players:names,status,result:status==='finished'?{p1:names[0],p2:names[1],pts1:Number(match.pts1),pts2:Number(match.pts2),resultType:match.resultType||'played'}:null,winner,loser});
    }
    const completion=resolvedMatches===n&&warnings.length===0&&settled.has('F')&&settled.has('B');
    if(completion){
      stats.get(settled.get('F').winner).place=1;
      stats.get(settled.get('F').loser).place=2;
      stats.get(settled.get('B').winner).place=3;
      stats.get(settled.get('B').loser).place=4;
    }
    for(const row of stats.values())row.total=row.rawPoints+row.byePoints+row.phaseBonus;
    // Canonical tie-break matches the legacy engine: total, real wins,
    // points scored in wins, an unambiguous H2H only for EXACTLY TWO tied
    // players, then alphabetical. Never let H2H override tournament phase.
    const baseCompare=(a,b)=>b.total-a.total||b.wins-a.wins||b.winPoints-a.winPoints||str(a.name).localeCompare(str(b.name),'pl');
    const sameCore=(a,b)=>a.total===b.total&&a.wins===b.wins&&a.winPoints===b.winPoints;
    const rankTies=rows=>{
      const sorted=rows.slice().sort(baseCompare),out=[];
      for(let i=0;i<sorted.length;){
        let j=i+1;
        while(j<sorted.length&&sameCore(sorted[i],sorted[j]))j++;
        const group=sorted.slice(i,j);
        if(group.length===2){
          const [a,b]=group;
          // Every fixture can occur only once in single elimination.
          const headToHead=rendered.find(f=>f.status==='finished'&&
            f.players.includes(a.name)&&f.players.includes(b.name));
          if(headToHead?.winner===b.name)group.reverse();
        }
        out.push(...group);
        i=j;
      }
      return out;
    };
    let standings;
    if(completion){
      // The bracket establishes places 1–4. Within eliminated groups,
      // points and deterministic tie-breaks establish places 5–12.
      const podium=[1,2,3,4].map(place=>[...stats.values()].find(row=>row.place===place));
      const remaining=rankTies([...stats.values()].filter(row=>row.place===null));
      standings=[...podium,...remaining];
      standings.forEach((row,index)=>{row.place=index+1;});
    }else{
      standings=rankTies([...stats.values()]);
    }
    return {valid:warnings.length===0,complete:completion,warnings,fixtures:rendered,standings,byes:byeEntries.map(b=>({name:b.name,points:BYE_POINTS})),resolvedMatches,expectedMatches:n,champion:completion?settled.get('F').winner:null};
  }
  function updateResult(draft,id,score1,score2,options={}){
    if(!isTournament(draft)) throw new Error('Wymagany format single_elimination.');
    const prev=tournamentState(draft);
    if(!prev.valid) throw new Error(`Nieprawidłowa drabinka: ${prev.warnings.map(w=>w.code).join(', ')}`);
    const target=prev.fixtures.find(f=>f.id===id);
    if(!target) throw new Error(`Nieznane ID meczu: ${id}`);
    if(!target.players.every(Boolean)) throw new Error('Nie znamy jeszcze obu przeciwników.');
    const replacement={fixtureId:id,p1:target.players[0],p2:target.players[1],pts1:score1,pts2:score2,resultType:options.resultType||'played'};
    if(!validateScore(replacement)) throw new Error('Nieprawidłowy wynik: oczekiwano 25 pkt standard25 albo walkower 20:0.');
    const oldResults=Array.isArray(draft.matches)?draft.matches:[];
    // Preserve chronological/fixture order when correcting an existing result;
    // other stats use the recorded match order to analyze streaks.
    const exists=oldResults.some(m=>m.fixtureId===id);
    const nextMatches=exists?oldResults.map(m=>m.fixtureId===id?replacement:m):oldResults.concat([replacement]);
    const next={...draft,matches:nextMatches};
    const check=tournamentState(next);
    if(!check.valid){
      if(!options.invalidateDependents) throw new Error(`Zmiana narusza późniejsze wyniki (${check.warnings.map(w=>w.code).join(', ')}). Użyj invalidateDependents:true tylko po świadomym potwierdzeniu.`);
      // Remove all downstream results that have become stale, repeat until stable.
      let pending=nextMatches;
      let current=check;
      while(!current.valid){
        const stale=new Set(current.warnings.filter(w=>w.code==='staleOrUnexpectedMatch').map(w=>w.id));
        if(!stale.size) throw new Error(`Nie można automatycznie naprawić błędów: ${current.warnings.map(w=>w.code).join(', ')}`);
        pending=pending.filter(m=>!stale.has(m.fixtureId));
        current=tournamentState({...draft,matches:pending});
      }
      return {...draft,matches:pending,status:'active',winner:null};
    }
    return {...next,status:check.complete?'finished':'active',winner:check.complete?check.champion:null};
  }
  function validateBracket(draft){const state=tournamentState(draft);return {valid:state.valid,complete:state.complete,warnings:state.warnings,expectedMatches:state.expectedMatches,resolvedMatches:state.resolvedMatches};}
  return Object.freeze({VERSION,FORMAT,BYE_POINTS,PHASE_STEP,SIZES,ROUND,buildBracket,isTournament,tournamentState,updateResult,validateBracket});
});


(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  root.DraftStatsEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const MATCH_TYPES = Object.freeze({
    PLAYED: 'played',
    WALKOVER: 'walkover',
    DOUBLE_WALKOVER: 'doubleWalkover'
  });

  const DRAFT_STATUSES = Object.freeze({
    ACTIVE: 'active',
    FINISHED: 'finished'
  });

  const VALID_MATCH_TYPES = new Set(Object.values(MATCH_TYPES));
  const VALID_DRAFT_STATUSES = new Set(Object.values(DRAFT_STATUSES));

  function getMainDeckCards(player){
    if(Array.isArray(player)) return player.slice();
    return Array.isArray(player?.deck) ? player.deck.slice() : [];
  }

  function getSideboardCards(player){
    return Array.isArray(player?.sideboard) ? player.sideboard.slice() : [];
  }

  // Canonical statistical meaning of a player's deck: Main Deck + optional Sideboard.
  // The zones stay structurally separate for rendering/export, but card statistics
  // treat both parts identically.
  function getPlayerDeckCards(player){
    return [...getMainDeckCards(player),...getSideboardCards(player)];
  }

  // Backwards-compatible alias kept for pages/tests created before Planetary Reserve V1.
  function getAllDraftedCards(player){
    return getPlayerDeckCards(player);
  }

  // Canonical MSP SnapDraft Legend system. Legend Points are derived data:
  // database.js stores historical facts, while the engine owns the scoring model.
  const LEGEND_POINTS = Object.freeze({
    1: 8,
    2: 4,
    3: 3,
    4: 2,
    5: 1
  });
  const MIN_LEGEND_DRAFTS = 2;
  const DECK_ARCHETYPE_MIN_CARDS = 4;

  // Shared sample thresholds for the statistics layer. Patch A uses player
  // rivalry thresholds; the remaining values reserve one canonical source
  // for the card/global layers added by later patches.
  const SAMPLE_THRESHOLDS = Object.freeze({
    PLAYER_RIVALRY_MATCHES:3,
    GLOBAL_RIVALRY_MATCHES:5,
    GLOBAL_PLAYER_WR_MATCHES:10,
    GLOBAL_CARD_WR_MATCHES:20,
    GLOBAL_FINISH_DRAFTS:3,
    GLOBAL_PODIUM_RATE_DRAFTS:3,
    CARD_PILOT_DRAFTS:2,
    CARD_PARTNER_DRAFTS:2,
    CARD_MATCHUP_MATCHES:5,
    GLOBAL_CARD_MATCHUP_MATCHES:8
  });


  // Canonical rules exposed to every presentation layer. Pages should render
  // these rules rather than re-implementing statistical definitions locally.
  const STAT_RULES = Object.freeze({
    HISTORICAL_STATS_FINISHED_DRAFTS_ONLY:true,
    BATTLE_LIFE_SCORING_SYSTEM:'standard25',
    BATTLE_TOTAL_POINTS:25,
    CLEAN_WIN_WINNER_POINTS:25,
    CLEAN_WIN_LOSER_POINTS:0,
    LAST_LIFE_WIN_WINNER_POINTS:16,
    LAST_LIFE_WIN_LOSER_POINTS:9,
    PLAYER_RIVALRY_MIN_MATCHES:SAMPLE_THRESHOLDS.PLAYER_RIVALRY_MATCHES,
    GLOBAL_RIVALRY_MIN_MATCHES:SAMPLE_THRESHOLDS.GLOBAL_RIVALRY_MATCHES,
    GLOBAL_PLAYER_WR_MIN_MATCHES:SAMPLE_THRESHOLDS.GLOBAL_PLAYER_WR_MATCHES,
    GLOBAL_CARD_WR_MIN_MATCHES:SAMPLE_THRESHOLDS.GLOBAL_CARD_WR_MATCHES,
    CARD_PILOT_MIN_DRAFTS:SAMPLE_THRESHOLDS.CARD_PILOT_DRAFTS,
    CARD_PARTNER_MIN_DRAFTS:SAMPLE_THRESHOLDS.CARD_PARTNER_DRAFTS,
    CARD_MATCHUP_MIN_MATCHES:SAMPLE_THRESHOLDS.CARD_MATCHUP_MATCHES,
    GLOBAL_CARD_MATCHUP_MIN_MATCHES:SAMPLE_THRESHOLDS.GLOBAL_CARD_MATCHUP_MATCHES,
    DECK_ARCHETYPE_MIN_CARDS
  });

  const STAT_DEFINITIONS = Object.freeze({
    legendRank:Object.freeze({
      label:'Ranga Legend',
      description:'Pozycja zawodnika w kanonicznym Rankingu Legend. Do rankingu kwalifikują się zawodnicy z co najmniej dwoma ukończonymi draftami.'
    }),
    legendPoints:Object.freeze({
      label:'Punkty Legend',
      description:'Punkty prestiżu przyznawane za miejsca 1–5 w ukończonych draftach według systemu 8 / 4 / 3 / 2 / 1.'
    }),
    draftPoints:Object.freeze({
      label:'Punkty draftowe',
      description:'Łączna liczba punktów zdobytych przez zawodnika w tabelach ukończonych draftów.'
    }),
    winRate:Object.freeze({
      label:'Win Rate',
      description:'Odsetek zwycięstw w rozstrzygniętych meczach. W interfejsie powinien być prezentowany razem z bilansem W–L, gdy pozwala na to miejsce.'
    }),
    officialMatches:Object.freeze({
      label:'Mecze oficjalne',
      description:'Wszystkie zapisane rozstrzygnięcia turniejowe zawodnika w ukończonych draftach, w tym walkovery i podwójne walkovery.'
    }),
    playedMatches:Object.freeze({
      label:'Rozegrane mecze',
      description:'Mecze oznaczone jako normalnie rozegrane, bez walkowerów i podwójnych walkowerów.'
    }),
    cleanWin:Object.freeze({
      label:'Czyste zwycięstwo',
      description:'Realnie rozegrany mecz w systemie standard25 zakończony wynikiem 25–0. Walkovery i starsze systemy punktacji są wykluczone.'
    }),
    cleanLoss:Object.freeze({
      label:'Czysta porażka',
      description:'Realnie rozegrany mecz w systemie standard25 zakończony dla zawodnika wynikiem 0–25.'
    }),
    lastLifeWin:Object.freeze({
      label:'Zwycięstwo o włos',
      description:'Realnie rozegrany mecz standard25 wygrany 16–9, czyli zwycięstwo z jednym zachowanym życiem.'
    }),
    lastLifeLoss:Object.freeze({
      label:'Porażka o włos',
      description:'Realnie rozegrany mecz standard25 przegrany 9–16, czyli porażka po odebraniu rywalowi dziewięciu żyć.'
    }),
    archrival:Object.freeze({
      label:'Arcyrival',
      description:'Rywal, z którym zawodnik rozegrał najwięcej prawdziwych bezpośrednich meczów. Walkovery nie zwiększają liczby spotkań H2H.'
    }),
    dominatedOpponent:Object.freeze({
      label:'Pogromca',
      description:'Rywal, przeciwko któremu zawodnik ma najwyższy H2H Win Rate przy wymaganej minimalnej liczbie realnie rozegranych spotkań.'
    }),
    nemesis:Object.freeze({
      label:'Nemesis',
      description:'Rywal, przeciwko któremu zawodnik ma najniższy H2H Win Rate przy wymaganej minimalnej liczbie realnie rozegranych spotkań.'
    }),
    closestRival:Object.freeze({
      label:'Wyrównany rywal',
      description:'Rywal, przeciwko któremu H2H Win Rate zawodnika jest najbliższy 50% przy wymaganej minimalnej próbce.'
    }),
    averageFinish:Object.freeze({
      label:'Średnie miejsce',
      description:'Średnia pozycja końcowa zawodnika we wszystkich jego ukończonych draftach.'
    }),
    averageFinishPercentile:Object.freeze({
      label:'Pozycja po uwzględnieniu wielkości edycji',
      description:'Pomocniczy wskaźnik techniczny porównujący miejsce z wielkością edycji. Nie jest domyślnie eksponowany graczom.'
    }),
    titleRate:Object.freeze({
      label:'Odsetek zwycięskich edycji',
      description:'Odsetek ukończonych draftów zawodnika zakończonych zwycięstwem całej edycji.'
    }),
    podiumRate:Object.freeze({
      label:'Odsetek podiów',
      description:'Odsetek ukończonych draftów zawodnika zakończonych miejscem w pierwszej trójce.'
    }),
    top5Rate:Object.freeze({
      label:'Top 5 Rate',
      description:'Odsetek ukończonych draftów zawodnika zakończonych miejscem w Top 5.'
    }),
    cardAppearance:Object.freeze({
      label:'Występ karty',
      description:'Obecność karty w decku gracza zapisanym w bazie — w Main Decku albo Planetarnej Rezerwie. Nie należy automatycznie utożsamiać jej z historycznym pickiem.'
    }),
    cardLegendPoints:Object.freeze({
      label:'Punkty Legend karty',
      description:'Suma Punktów Legend zdobytych przez decki graczy zawierające tę kartę w Main Decku albo Planetarnej Rezerwie.'
    })
  });

  function hasOwn(object, key){
    return Boolean(object) && Object.prototype.hasOwnProperty.call(object, key);
  }

  function numberOrZero(value){
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function isFinitePointValue(value){
    return Number.isFinite(Number(value));
  }

  function normalizeName(value){
    return String(value || '').trim();
  }

  // PATCH 1: only tournament drafts require this optional module. Legacy drafts
  // continue to work if tournament-engine.js is not loaded yet.
  function tournamentApi(){
    if(typeof globalThis!=='undefined' && globalThis.DraftTournamentEngine) return globalThis.DraftTournamentEngine;
    if(typeof require==='function'){
      try{return require('./tournament-engine.js');}catch(_){return null;}
    }
    return null;
  }
  function isTournamentDraft(draft){return draft?.competitionFormat?.id==='single_elimination';}
  function tournamentState(draft){
    if(!isTournamentDraft(draft)) return null;
    const api=tournamentApi();
    if(!api) throw new Error('System Turniejowy wymaga zaladowanego tournament-engine.js PRZED draft-stats-engine.js.');
    return api.tournamentState(draft);
  }

  function getDraftModeLabel(draft){
    const mode=draft?.draftConfigV2?.draftMode;
    if(!mode) return 'Brak danych';
    const name=normalizeName(mode.name) || (mode.id==='poker' ? 'Poker Draft' : mode.id==='galactic_current' ? 'Gwiezdny Prąd' : 'Classic');
    const variant=normalizeName(mode.variantName);
    const base=variant ? `${name} — ${variant}` : name;
    return isTournamentDraft(draft) ? `${base} · System turniejowy` : base;
  }

  function pairKey(firstName, secondName){
    return [normalizeName(firstName), normalizeName(secondName)].sort().join('::');
  }

  function getScoringSystem(draftOrId){
    if(draftOrId && typeof draftOrId === 'object'){
      const system = normalizeName(draftOrId?.scoring?.system);
      return system || null;
    }
    return null;
  }

  function supportsBattleLifeStats(draftOrId){
    // Canonical Battle-life statistics are only reconstructible from the
    // standard25 system: winner = 15 + remaining lives, loser = lives taken.
    return getScoringSystem(draftOrId) === 'standard25';
  }

  function supportsCleanWins(draftOrId){
    // Backwards-compatible alias retained for existing consumers.
    return supportsBattleLifeStats(draftOrId);
  }

  function normalizeExplicitType(value){
    if(value === MATCH_TYPES.WALKOVER) return MATCH_TYPES.WALKOVER;
    if(value === MATCH_TYPES.DOUBLE_WALKOVER) return MATCH_TYPES.DOUBLE_WALKOVER;
    return MATCH_TYPES.PLAYED;
  }

  function isBareHistoricalDoubleWalkover(match){
    return !hasOwn(match,'resultType') &&
      isFinitePointValue(match?.pts1) &&
      isFinitePointValue(match?.pts2) &&
      Number(match.pts1) === 0 &&
      Number(match.pts2) === 0;
  }

  function isValidStandard25Score(match){
    if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return false;
    const pts1 = Number(match.pts1);
    const pts2 = Number(match.pts2);
    if(!Number.isInteger(pts1) || !Number.isInteger(pts2) || pts1 === pts2) return false;
    const winnerPoints = Math.max(pts1,pts2);
    const loserPoints = Math.min(pts1,pts2);
    return winnerPoints >= 16 && winnerPoints <= 25 &&
      loserPoints >= 0 && loserPoints <= 9 &&
      winnerPoints + loserPoints === STAT_RULES.BATTLE_TOTAL_POINTS;
  }

  function getMatchType(match, draftOrId){
    // Explicit metadata is canonical. A bare historical 0:0 remains the one
    // safe compatibility case: it always represents a double walkover.
    if(hasOwn(match, 'resultType')){
      return normalizeExplicitType(match.resultType);
    }
    if(isBareHistoricalDoubleWalkover(match)) return MATCH_TYPES.DOUBLE_WALKOVER;
    return MATCH_TYPES.PLAYED;
  }

  function getMatchResult(match, draftOrId){
    const type = getMatchType(match, draftOrId);
    const pts1 = numberOrZero(match?.pts1);
    const pts2 = numberOrZero(match?.pts2);

    if(type === MATCH_TYPES.DOUBLE_WALKOVER){
      return {type, p1Outcome:'loss', p2Outcome:'loss', winner:null, loser:null};
    }
    if(pts1 > pts2){
      return {type, p1Outcome:'win', p2Outcome:'loss', winner:match.p1, loser:match.p2};
    }
    if(pts2 > pts1){
      return {type, p1Outcome:'loss', p2Outcome:'win', winner:match.p2, loser:match.p1};
    }
    // SnapDraft Battle nie ma remisu. Równy wynik w meczu PLAYED to
    // nieprawidłowy/legacy rekord danych i nie może zasilać statystyk W/L.
    return {type, p1Outcome:null, p2Outcome:null, winner:null, loser:null, invalid:true};
  }

  function getPlayerOutcome(match, draftOrId, playerName){
    const result = getMatchResult(match, draftOrId);
    if(match?.p1 === playerName) return result.p1Outcome;
    if(match?.p2 === playerName) return result.p2Outcome;
    return null;
  }

  function isWalkover(match, draftOrId){
    return getMatchType(match, draftOrId) === MATCH_TYPES.WALKOVER;
  }

  function isDoubleWalkover(match, draftOrId){
    return getMatchType(match, draftOrId) === MATCH_TYPES.DOUBLE_WALKOVER;
  }

  function isBattleStatsEligibleMatch(match, draftOrId){
    if(!supportsBattleLifeStats(draftOrId)) return false;
    if(getMatchType(match, draftOrId) !== MATCH_TYPES.PLAYED) return false;
    return isValidStandard25Score(match);
  }

  function getBattleResult(match, draftOrId){
    if(!isBattleStatsEligibleMatch(match, draftOrId)) return null;
    const pts1 = Number(match.pts1);
    const pts2 = Number(match.pts2);
    const p1Won = pts1 > pts2;
    const winner = normalizeName(p1Won ? match?.p1 : match?.p2);
    const loser = normalizeName(p1Won ? match?.p2 : match?.p1);
    const winnerPoints = p1Won ? pts1 : pts2;
    const loserPoints = p1Won ? pts2 : pts1;
    return {
      winner,
      loser,
      winnerPoints,
      loserPoints,
      winnerLivesRemaining:winnerPoints - 15,
      loserDamageDealt:loserPoints,
      cleanWin:winnerPoints === 25 && loserPoints === 0,
      lastLifeWin:winnerPoints === 16 && loserPoints === 9
    };
  }

  function isCleanWin(match, draftOrId){
    return Boolean(getBattleResult(match, draftOrId)?.cleanWin);
  }

  function isCleanLoss(match, draftOrId, playerName){
    const battle = getBattleResult(match, draftOrId);
    return Boolean(battle?.cleanWin && battle.loser === normalizeName(playerName));
  }

  function isLastLifeWin(match, draftOrId){
    return Boolean(getBattleResult(match, draftOrId)?.lastLifeWin);
  }

  function isLastLifeLoss(match, draftOrId, playerName){
    const battle = getBattleResult(match, draftOrId);
    return Boolean(battle?.lastLifeWin && battle.loser === normalizeName(playerName));
  }

  function isPlayerCleanWin(match, draftOrId, playerName){
    const battle = getBattleResult(match, draftOrId);
    return Boolean(battle?.cleanWin && battle.winner === normalizeName(playerName));
  }

  function isPlayerLastLifeWin(match, draftOrId, playerName){
    const battle = getBattleResult(match, draftOrId);
    return Boolean(battle?.lastLifeWin && battle.winner === normalizeName(playerName));
  }

  function getRosterNames(draft){
    return (Array.isArray(draft?.players) ? draft.players : [])
      .map(player=>normalizeName(player?.name));
  }

  function getActualPlayerCount(draft){
    return Array.isArray(draft?.players) ? draft.players.length : 0;
  }

  function getExpectedMatchCount(draft){
    if(isTournamentDraft(draft)) return tournamentState(draft).expectedMatches;
    const playerCount = getActualPlayerCount(draft);
    return playerCount > 1 ? (playerCount * (playerCount - 1)) / 2 : 0;
  }

  function getExpectedPairKeys(draft){
    const names = getRosterNames(draft);
    const actualCount = getActualPlayerCount(draft);
    if(names.length !== actualCount || names.some(name=>!name)) return null;
    if(new Set(names).size !== actualCount) return null;

    const expectedPairs = new Set();
    for(let first=0; first<names.length; first++){
      for(let second=first+1; second<names.length; second++){
        expectedPairs.add(pairKey(names[first], names[second]));
      }
    }
    return expectedPairs;
  }

  function getResolvedPairKeys(draft){
    const roster = new Set(getRosterNames(draft).filter(Boolean));
    const resolvedPairs = new Set();
    (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
      const p1 = normalizeName(match?.p1);
      const p2 = normalizeName(match?.p2);
      if(!p1 || !p2 || p1 === p2) return;
      if(!roster.has(p1) || !roster.has(p2)) return;
      if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;
      resolvedPairs.add(pairKey(p1,p2));
    });
    return resolvedPairs;
  }

  function isFullRoundRobin(draft){
    const expectedPairs = getExpectedPairKeys(draft);
    if(!expectedPairs || expectedPairs.size === 0) return false;
    const resolvedPairs = getResolvedPairKeys(draft);
    return [...expectedPairs].every(key=>resolvedPairs.has(key));
  }

  function getUnplayedMatches(draft){
    if(isTournamentDraft(draft)) return tournamentState(draft).fixtures
      .filter(f=>f.status!=='finished').map(f=>({
        fixtureId:f.id,round:f.round,
        p1:f.players[0]||`Oczekuje: ${f.slots[0]?.type||'gracz'} ${f.slots[0]?.fixtureId||''}`,
        p2:f.players[1]||`Oczekuje: ${f.slots[1]?.type||'gracz'} ${f.slots[1]?.fixtureId||''}`,
        status:f.status
      }));
    const names = getRosterNames(draft).filter(Boolean);
    const resolvedPairs = getResolvedPairKeys(draft);
    const missing = [];
    for(let first=0; first<names.length; first++){
      for(let second=first+1; second<names.length; second++){
        if(!resolvedPairs.has(pairKey(names[first],names[second]))){
          missing.push({p1:names[first], p2:names[second]});
        }
      }
    }
    return missing;
  }

  function getExplicitDraftStatus(draft){
    if(!hasOwn(draft, 'status')) return null;
    const status = normalizeName(draft?.status);
    return VALID_DRAFT_STATUSES.has(status) ? status : null;
  }

  function getDraftStatus(draft){
    if(isTournamentDraft(draft)){
      const state=tournamentState(draft);
      return state.complete&&state.valid ? DRAFT_STATUSES.FINISHED : DRAFT_STATUSES.ACTIVE;
    }
    const explicitStatus = getExplicitDraftStatus(draft);
    if(explicitStatus) return explicitStatus;
    return isFullRoundRobin(draft) ? DRAFT_STATUSES.FINISHED : DRAFT_STATUSES.ACTIVE;
  }

  function isDraftFinished(draft){
    return getDraftStatus(draft) === DRAFT_STATUSES.FINISHED;
  }

  function emptyPlayerStats(name){
    return {
      name,
      total:0,
      wins:0,
      losses:0,
      winPoints:0,
      lossPoints:0,
      cleanWins:0,
      matches:0
    };
  }

  function getDirectMatchWinner(draft, firstName, secondName){
    const first = normalizeName(firstName);
    const second = normalizeName(secondName);
    if(!first || !second || first === second) return null;

    const directMatches = (Array.isArray(draft?.matches) ? draft.matches : []).filter(match=>
      pairKey(match?.p1, match?.p2) === pairKey(first,second) &&
      isFinitePointValue(match?.pts1) &&
      isFinitePointValue(match?.pts2)
    );
    if(!directMatches.length) return null;

    const winners = new Set();
    directMatches.forEach(match=>{
      const result = getMatchResult(match, draft);
      if(result.type !== MATCH_TYPES.DOUBLE_WALKOVER && result.winner){
        winners.add(normalizeName(result.winner));
      }
    });
    if(winners.size !== 1) return null;
    const winner = [...winners][0];
    return winner === first || winner === second ? winner : null;
  }

  function samePrimaryTieBreak(first, second){
    return first.total === second.total &&
      first.wins === second.wins &&
      first.winPoints === second.winPoints;
  }

  function applyRankingTieBreaks(baseRanking, draft){
    const ranking = [];
    let index = 0;
    while(index < baseRanking.length){
      let end = index + 1;
      while(end < baseRanking.length && samePrimaryTieBreak(baseRanking[index], baseRanking[end])) end++;
      const group = baseRanking.slice(index,end);

      // Head-to-head is unambiguous for a two-player tie. For larger tied
      // groups, the final alphabetical fallback stays deterministic instead
      // of introducing a potentially non-transitive circular H2H order.
      if(group.length === 2){
        const [first,second] = group;
        const directWinner = getDirectMatchWinner(draft, first.name, second.name);
        if(directWinner === second.name) group.reverse();
      }
      ranking.push(...group);
      index = end;
    }
    return ranking;
  }

  function calculateDraftStats(draft){
    if(isTournamentDraft(draft)){
      const state=tournamentState(draft);
      const byName={};
      state.standings.forEach(row=>{
        byName[row.name]={...row,cleanWins:0};
      });
      state.fixtures.filter(f=>f.status==='finished'&&f.result?.resultType==='played')
        .forEach(f=>{
          const a=f.result.pts1,b=f.result.pts2;
          if(Math.max(a,b)===25&&Math.min(a,b)===0&&byName[f.winner]) byName[f.winner].cleanWins++;
        });
      return {byName,ranking:state.standings.map(row=>byName[row.name])};
    }
    const byName = {};
    const rosterNames = getRosterNames(draft).filter(Boolean);
    const roster = new Set(rosterNames);
    rosterNames.forEach(name=>{
      if(!byName[name]) byName[name] = emptyPlayerStats(name);
    });

    (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
      const p1 = normalizeName(match?.p1);
      const p2 = normalizeName(match?.p2);
      if(!p1 || !p2 || p1 === p2) return;
      if(!roster.has(p1) || !roster.has(p2)) return;
      if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;

      const pts1 = Number(match.pts1);
      const pts2 = Number(match.pts2);
      const result = getMatchResult(match, draft);
      if(result.invalid) return;

      byName[p1].total += pts1;
      byName[p2].total += pts2;
      byName[p1].matches++;
      byName[p2].matches++;

      if(result.type === MATCH_TYPES.DOUBLE_WALKOVER){
        byName[p1].losses++;
        byName[p2].losses++;
        byName[p1].lossPoints += pts1;
        byName[p2].lossPoints += pts2;
        return;
      }

      if(result.p1Outcome === 'win'){
        byName[p1].wins++;
        byName[p2].losses++;
        byName[p1].winPoints += pts1;
        byName[p2].lossPoints += pts2;
        if(isCleanWin(match, draft)) byName[p1].cleanWins++;
      }else if(result.p2Outcome === 'win'){
        byName[p2].wins++;
        byName[p1].losses++;
        byName[p2].winPoints += pts2;
        byName[p1].lossPoints += pts1;
        if(isCleanWin(match, draft)) byName[p2].cleanWins++;
      }
    });

    const baseRanking = Object.values(byName).sort((a,b)=>
      b.total-a.total ||
      b.wins-a.wins ||
      b.winPoints-a.winPoints ||
      a.name.localeCompare(b.name)
    );
    const ranking = applyRankingTieBreaks(baseRanking, draft);

    return {byName, ranking};
  }

  function calculateDraftRanking(draft){
    return calculateDraftStats(draft).ranking;
  }

  function getDraftLeader(draft){
    const ranking = calculateDraftRanking(draft);
    return ranking[0]?.name || null;
  }

  function getExplicitWinner(draft){
    return normalizeName(draft?.winner) || null;
  }

  function getDraftWinner(draft){
    if(isTournamentDraft(draft)){
      const state=tournamentState(draft);
      return state.complete?state.champion:null;
    }
    if(!isDraftFinished(draft)) return null;
    const roster = new Set(getRosterNames(draft).filter(Boolean));
    const explicitWinner = getExplicitWinner(draft);
    if(explicitWinner && roster.has(explicitWinner)) return explicitWinner;
    return getDraftLeader(draft);
  }

  function getDraftLegendOrder(draft){
    if(isTournamentDraft(draft)) return isDraftFinished(draft)?calculateDraftRanking(draft):[];
    if(!isDraftFinished(draft)) return [];
    const ranking = calculateDraftRanking(draft);
    const officialWinner = getDraftWinner(draft);
    if(!officialWinner) return ranking;

    // An explicit, valid official winner is the historical #1 for Legend purposes.
    // The mathematical ranking itself remains untouched; everybody else keeps the
    // relative order produced by the canonical draft ranking engine.
    const winnerEntry = ranking.find(player=>player.name === officialWinner);
    if(!winnerEntry) return ranking;
    return [winnerEntry, ...ranking.filter(player=>player.name !== officialWinner)];
  }

  function getDraftLegendAwards(draft){
    return getDraftLegendOrder(draft).slice(0,5).map((player,index)=>{
      const place = index + 1;
      return {
        place,
        name:player.name,
        points:LEGEND_POINTS[place] || 0,
        draftPoints:player.total,
        wins:player.wins,
        losses:player.losses
      };
    });
  }

  function createLegendPlayer(name){
    return {
      name,
      legendPoints:0,
      draftWins:0,
      first:0,
      second:0,
      third:0,
      fourth:0,
      fifth:0,
      drafts:0,
      draftPoints:0,
      avgDraftPoints:0,
      wins:0,
      losses:0,
      matches:0,
      winRate:0,
      balance:0,
      eligibleForRank:false,
      rank:null
    };
  }

  function ensureLegendPlayer(map, name){
    const normalized = normalizeName(name);
    if(!normalized) return null;
    if(!map[normalized]) map[normalized] = createLegendPlayer(normalized);
    return map[normalized];
  }

  function calculateLegendStandings(drafts){
    const byName = {};
    const finishedDrafts = (Array.isArray(drafts) ? drafts : []).filter(isDraftFinished);

    finishedDrafts.forEach(draft=>{
      const draftStats = calculateDraftStats(draft);

      // Participation is defined by the canonical players[] roster, not by whether
      // a player happened to have a match object in an incomplete historical draft.
      (Array.isArray(draft?.players) ? draft.players : []).forEach(player=>{
        const legendPlayer = ensureLegendPlayer(byName, player?.name);
        if(legendPlayer) legendPlayer.drafts++;
      });

      Object.values(draftStats.byName).forEach(playerStats=>{
        const legendPlayer = ensureLegendPlayer(byName, playerStats.name);
        if(!legendPlayer) return;
        legendPlayer.draftPoints += playerStats.total;
        legendPlayer.wins += playerStats.wins;
        legendPlayer.losses += playerStats.losses;
        legendPlayer.matches += playerStats.matches;
      });

      getDraftLegendAwards(draft).forEach(award=>{
        const legendPlayer = ensureLegendPlayer(byName, award.name);
        if(!legendPlayer) return;
        legendPlayer.legendPoints += award.points;
        if(award.place === 1){ legendPlayer.first++; legendPlayer.draftWins++; }
        if(award.place === 2) legendPlayer.second++;
        if(award.place === 3) legendPlayer.third++;
        if(award.place === 4) legendPlayer.fourth++;
        if(award.place === 5) legendPlayer.fifth++;
      });
    });

    const allPlayers = Object.values(byName).map(player=>{
      const decidedMatches = player.wins + player.losses;
      return {
        ...player,
        avgDraftPoints:player.drafts ? player.draftPoints / player.drafts : 0,
        winRate:decidedMatches ? player.wins / decidedMatches : 0,
        balance:player.wins - player.losses,
        eligibleForRank:player.drafts >= MIN_LEGEND_DRAFTS,
        rank:null
      };
    });

    const ranking = allPlayers
      .filter(player=>player.eligibleForRank)
      .sort((a,b)=>
        b.legendPoints-a.legendPoints ||
        b.draftWins-a.draftWins ||
        b.draftPoints-a.draftPoints ||
        b.winRate-a.winRate ||
        a.name.localeCompare(b.name,'pl')
      )
      .map((player,index)=>({...player, rank:index+1}));

    const rankByName = {};
    ranking.forEach(player=>{ rankByName[player.name] = player.rank; });
    const rankedByName = Object.fromEntries(ranking.map(player=>[player.name,player]));
    const allByName = Object.fromEntries(allPlayers.map(player=>[
      player.name,
      rankedByName[player.name] || player
    ]));

    return {
      legendPoints:LEGEND_POINTS,
      minDrafts:MIN_LEGEND_DRAFTS,
      ranking,
      allPlayers:Object.values(allByName),
      byName:allByName,
      rankByName
    };
  }

  function getPlayerLegendStats(drafts, playerName){
    const name = normalizeName(playerName);
    if(!name) return null;
    return calculateLegendStandings(drafts).byName[name] || null;
  }

  function getPlayerLegendRank(drafts, playerName){
    const stats = getPlayerLegendStats(drafts, playerName);
    return stats?.rank || null;
  }

  function calculateWinRate(wins, losses){
    const decided = numberOrZero(wins) + numberOrZero(losses);
    return decided > 0 ? numberOrZero(wins) / decided : 0;
  }

  function qualifiesSample(value, minimum){
    return numberOrZero(value) >= numberOrZero(minimum);
  }

  function rankTopN(items, compareFn, sameRankFn, limit){
    const sorted = (Array.isArray(items) ? items : []).slice().sort(compareFn);
    const maxRank = Math.max(1, Number(limit) || 3);
    const ranked = [];
    let previous = null;
    let rank = 0;
    sorted.forEach((item,index)=>{
      if(index === 0 || !sameRankFn(item, previous)) rank = index + 1;
      if(rank <= maxRank) ranked.push({...item, rank});
      previous = item;
    });
    return ranked;
  }


  function getStatDefinition(key){
    const normalized = normalizeName(key);
    return normalized && hasOwn(STAT_DEFINITIONS,normalized) ? STAT_DEFINITIONS[normalized] : null;
  }

  function calculateFinishPercentile(place, playerCount){
    const position = Number(place);
    const count = Number(playerCount);
    if(!Number.isFinite(position) || !Number.isFinite(count) || count <= 0) return null;
    if(count === 1) return position === 1 ? 1 : null;
    if(position < 1 || position > count) return null;
    return (count-position) / (count-1);
  }

  function getFinishedDraftsChronologically(drafts){
    return (Array.isArray(drafts) ? drafts : [])
      .filter(isDraftFinished)
      .slice()
      .sort((a,b)=>numberOrZero(a?.id)-numberOrZero(b?.id));
  }

  function getPlayerDraftEntry(draft, playerName){
    const name = normalizeName(playerName);
    return (Array.isArray(draft?.players) ? draft.players : [])
      .find(player=>normalizeName(player?.name) === name) || null;
  }

  function buildPlayerDraftPerformance(draft, playerName){
    const name = normalizeName(playerName);
    const playerEntry = getPlayerDraftEntry(draft,name);
    if(!name || !playerEntry || !isDraftFinished(draft)) return null;

    const draftStats = calculateDraftStats(draft);
    const stats = draftStats.byName[name] || emptyPlayerStats(name);
    const order = getDraftLegendOrder(draft);
    const placeIndex = order.findIndex(player=>player.name === name);
    const place = placeIndex >= 0 ? placeIndex + 1 : null;
    const award = place && place <= 5 ? (LEGEND_POINTS[place] || 0) : 0;
    const decidedMatches = stats.wins + stats.losses;

    let battleEligibleMatches = 0;
    let battleWins = 0;
    let battleLosses = 0;
    let cleanWins = 0;
    let cleanLosses = 0;
    let lastLifeWins = 0;
    let lastLifeLosses = 0;
    let currentWinRun = 0;
    let longestWinRun = 0;

    (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
      if(normalizeName(match?.p1) !== name && normalizeName(match?.p2) !== name) return;
      const battle = getBattleResult(match,draft);
      if(!battle) return;
      battleEligibleMatches++;
      if(battle.winner === name){
        battleWins++;
        currentWinRun++;
        longestWinRun=Math.max(longestWinRun,currentWinRun);
        if(battle.cleanWin) cleanWins++;
        if(battle.lastLifeWin) lastLifeWins++;
      }else if(battle.loser === name){
        battleLosses++;
        currentWinRun=0;
        if(battle.cleanWin) cleanLosses++;
        if(battle.lastLifeWin) lastLifeLosses++;
      }
    });

    return {
      draftId:numberOrZero(draft?.id),
      startDate:draft?.startDate || null,
      endDate:draft?.endDate || null,
      mode:getDraftModeLabel(draft),
      playerCount:getActualPlayerCount(draft),
      place,
      points:stats.total,
      wins:stats.wins,
      losses:stats.losses,
      matches:stats.matches,
      winRate:decidedMatches ? stats.wins / decidedMatches : 0,
      winPoints:stats.winPoints,
      lossPoints:stats.lossPoints,
      legendPoints:award,
      isWinner:getDraftWinner(draft) === name,
      deck:getMainDeckCards(playerEntry),
      sideboard:getSideboardCards(playerEntry),
      playerDeck:getPlayerDeckCards(playerEntry),
      allDraftedCards:getPlayerDeckCards(playerEntry),
      battle:{
        eligibleMatches:battleEligibleMatches,
        wins:battleWins,
        losses:battleLosses,
        winRate:calculateWinRate(battleWins,battleLosses),
        cleanWins,
        cleanLosses,
        lastLifeWins,
        lastLifeLosses,
        longestWinRun
      }
    };
  }

  function calculatePlayerHistory(drafts, playerName){
    const name = normalizeName(playerName);
    if(!name) return [];
    return getFinishedDraftsChronologically(drafts)
      .map(draft=>buildPlayerDraftPerformance(draft,name))
      .filter(Boolean);
  }

  function comparePerformanceSuccess(first, second){
    const firstPlace = Number.isFinite(Number(first?.place)) ? Number(first.place) : Number.POSITIVE_INFINITY;
    const secondPlace = Number.isFinite(Number(second?.place)) ? Number(second.place) : Number.POSITIVE_INFINITY;
    return firstPlace-secondPlace ||
      numberOrZero(second?.winRate)-numberOrZero(first?.winRate) ||
      numberOrZero(second?.points)-numberOrZero(first?.points) ||
      numberOrZero(second?.wins)-numberOrZero(first?.wins) ||
      numberOrZero(second?.draftId)-numberOrZero(first?.draftId);
  }

  function calculatePlayerTopPerformances(drafts, playerName, limit){
    const maxItems = Math.max(1,Number(limit) || 3);
    return calculatePlayerHistory(drafts,playerName)
      .slice()
      .sort(comparePerformanceSuccess)
      .slice(0,maxItems);
  }

  function chooseRecord(history, compareFn){
    const source = (Array.isArray(history) ? history : []).slice().filter(Boolean);
    return source.length ? source.sort(compareFn)[0] : null;
  }

  function calculatePlayerRecords(drafts, playerName){
    const history = calculatePlayerHistory(drafts,playerName);
    const withDecidedMatches = history.filter(item=>(item.wins + item.losses) > 0);
    const bestPlace = history.reduce((value,item)=>item.place && (!value || item.place < value) ? item.place : value,null);
    const worstPlace = history.reduce((value,item)=>item.place && (!value || item.place > value) ? item.place : value,null);

    return {
      bestFinish:chooseRecord(history,comparePerformanceSuccess),
      bestFinishCount:bestPlace ? history.filter(item=>item.place === bestPlace).length : 0,
      worstFinish:chooseRecord(history,(a,b)=>
        numberOrZero(b?.place)-numberOrZero(a?.place) ||
        numberOrZero(a?.winRate)-numberOrZero(b?.winRate) ||
        numberOrZero(a?.points)-numberOrZero(b?.points) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      ),
      worstFinishCount:worstPlace ? history.filter(item=>item.place === worstPlace).length : 0,
      bestWinRateDraft:chooseRecord(withDecidedMatches,(a,b)=>
        numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
        numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
        numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
        numberOrZero(b?.points)-numberOrZero(a?.points) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      ),
      worstWinRateDraft:chooseRecord(withDecidedMatches,(a,b)=>
        numberOrZero(a?.winRate)-numberOrZero(b?.winRate) ||
        numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
        numberOrZero(a?.wins)-numberOrZero(b?.wins) ||
        numberOrZero(a?.points)-numberOrZero(b?.points) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      ),
      highestPointsDraft:chooseRecord(history,(a,b)=>
        numberOrZero(b?.points)-numberOrZero(a?.points) ||
        numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
        numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      ),
      lowestPointsDraft:chooseRecord(history,(a,b)=>
        numberOrZero(a?.points)-numberOrZero(b?.points) ||
        numberOrZero(a?.wins)-numberOrZero(b?.wins) ||
        numberOrZero(a?.winRate)-numberOrZero(b?.winRate) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      ),
      mostWinsDraft:chooseRecord(history,(a,b)=>
        numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
        numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
        numberOrZero(b?.points)-numberOrZero(a?.points) ||
        numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
      )
    };
  }

  function createRivalStats(name){
    return {name,matches:0,wins:0,losses:0,winRate:0,balance:0};
  }

  function calculatePlayerRivalries(drafts, playerName, minimumMatches){
    const name = normalizeName(playerName);
    if(!name) return {minimumMatches:SAMPLE_THRESHOLDS.PLAYER_RIVALRY_MATCHES,rivals:[],archrival:null,dominatedOpponent:null,nemesis:null,closestRival:null};
    const minimum = Math.max(1,Number(minimumMatches) || SAMPLE_THRESHOLDS.PLAYER_RIVALRY_MATCHES);
    const map = {};

    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
        if(getMatchType(match,draft) !== MATCH_TYPES.PLAYED) return;
        if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;
        const p1 = normalizeName(match?.p1);
        const p2 = normalizeName(match?.p2);
        if(p1 !== name && p2 !== name) return;
        const opponent = p1 === name ? p2 : p1;
        if(!opponent || opponent === name) return;
        const outcome = getPlayerOutcome(match,draft,name);
        if(outcome !== 'win' && outcome !== 'loss') return;
        if(!map[opponent]) map[opponent] = createRivalStats(opponent);
        map[opponent].matches++;
        if(outcome === 'win') map[opponent].wins++;
        if(outcome === 'loss') map[opponent].losses++;
      });
    });

    const rivals = Object.values(map).map(rival=>({
      ...rival,
      winRate:calculateWinRate(rival.wins,rival.losses),
      balance:rival.wins-rival.losses
    })).sort((a,b)=>
      b.matches-a.matches ||
      b.wins-a.wins ||
      a.name.localeCompare(b.name,'pl')
    );

    const qualified = rivals.filter(rival=>qualifiesSample(rival.matches,minimum));
    const archrival = rivals.length ? rivals.slice().sort((a,b)=>
      b.matches-a.matches ||
      Math.abs(a.winRate-.5)-Math.abs(b.winRate-.5) ||
      a.name.localeCompare(b.name,'pl')
    )[0] : null;
    const dominatedOpponent = qualified.length ? qualified.slice().sort((a,b)=>
      b.winRate-a.winRate ||
      b.matches-a.matches ||
      b.balance-a.balance ||
      a.name.localeCompare(b.name,'pl')
    )[0] : null;
    const nemesis = qualified.length ? qualified.slice().sort((a,b)=>
      a.winRate-b.winRate ||
      b.matches-a.matches ||
      a.balance-b.balance ||
      a.name.localeCompare(b.name,'pl')
    )[0] : null;
    const closestRival = qualified.length ? qualified.slice().sort((a,b)=>
      Math.abs(a.winRate-.5)-Math.abs(b.winRate-.5) ||
      b.matches-a.matches ||
      Math.abs(a.balance)-Math.abs(b.balance) ||
      a.name.localeCompare(b.name,'pl')
    )[0] : null;

    return {minimumMatches:minimum,rivals,mostFrequentRival:rivals[0] || null,archrival,dominatedOpponent,nemesis,closestRival};
  }

  function calculatePlayerMatchBreakdown(drafts, playerName){
    const name = normalizeName(playerName);
    const stats = {
      officialMatches:0,
      playedMatches:0,
      playedWins:0,
      playedLosses:0,
      playedWinRate:0,
      playedPoints:0,
      playedWinPoints:0,
      playedLossPoints:0,
      averagePlayedPoints:0,
      averagePlayedWinPoints:0,
      averagePlayedLossPoints:0,
      walkoverMatches:0,
      walkoverWins:0,
      walkoverLosses:0,
      doubleWalkovers:0,
      battleEligibleMatches:0
    };
    if(!name) return stats;

    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
        const p1 = normalizeName(match?.p1);
        const p2 = normalizeName(match?.p2);
        if(p1 !== name && p2 !== name) return;
        if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;
        const result = getMatchResult(match,draft);
        if(result.invalid) return;
        stats.officialMatches++;
        const type = result.type;
        if(type === MATCH_TYPES.WALKOVER){
          stats.walkoverMatches++;
          const outcome = p1 === name ? result.p1Outcome : result.p2Outcome;
          if(outcome === 'win') stats.walkoverWins++;
          if(outcome === 'loss') stats.walkoverLosses++;
          return;
        }
        if(type === MATCH_TYPES.DOUBLE_WALKOVER){
          stats.doubleWalkovers++;
          return;
        }
        stats.playedMatches++;
        const outcome = p1 === name ? result.p1Outcome : result.p2Outcome;
        const ownPoints = p1 === name ? numberOrZero(match?.pts1) : numberOrZero(match?.pts2);
        stats.playedPoints += ownPoints;
        if(outcome === 'win'){
          stats.playedWins++;
          stats.playedWinPoints += ownPoints;
        }else if(outcome === 'loss'){
          stats.playedLosses++;
          stats.playedLossPoints += ownPoints;
        }
        if(isBattleStatsEligibleMatch(match,draft)) stats.battleEligibleMatches++;
      });
    });
    stats.playedWinRate = calculateWinRate(stats.playedWins,stats.playedLosses);
    stats.averagePlayedPoints = stats.playedMatches ? stats.playedPoints / stats.playedMatches : 0;
    stats.averagePlayedWinPoints = stats.playedWins ? stats.playedWinPoints / stats.playedWins : 0;
    stats.averagePlayedLossPoints = stats.playedLosses ? stats.playedLossPoints / stats.playedLosses : 0;
    return stats;
  }

  function calculatePlayerBattleStats(drafts, playerName){
    const name = normalizeName(playerName);
    const stats = {
      eligibleMatches:0,
      wins:0,
      losses:0,
      winRate:0,
      cleanWins:0,
      cleanLosses:0,
      lastLifeWins:0,
      lastLifeLosses:0,
      totalLivesRemainingOnWins:0,
      averageLivesRemainingOnWin:0,
      totalDamageDealtOnLosses:0,
      averageDamageDealtOnLoss:0,
      walkoverWins:0,
      walkoverLosses:0,
      doubleWalkovers:0
    };
    if(!name) return stats;

    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
        const p1 = normalizeName(match?.p1);
        const p2 = normalizeName(match?.p2);
        if(p1 !== name && p2 !== name) return;

        const type = getMatchType(match,draft);
        if(type === MATCH_TYPES.WALKOVER){
          const outcome = getPlayerOutcome(match,draft,name);
          if(outcome === 'win') stats.walkoverWins++;
          if(outcome === 'loss') stats.walkoverLosses++;
          return;
        }
        if(type === MATCH_TYPES.DOUBLE_WALKOVER){
          stats.doubleWalkovers++;
          return;
        }

        const battle = getBattleResult(match,draft);
        if(!battle) return;
        stats.eligibleMatches++;
        if(battle.winner === name){
          stats.wins++;
          stats.totalLivesRemainingOnWins += battle.winnerLivesRemaining;
          if(battle.cleanWin) stats.cleanWins++;
          if(battle.lastLifeWin) stats.lastLifeWins++;
        }else if(battle.loser === name){
          stats.losses++;
          stats.totalDamageDealtOnLosses += battle.loserDamageDealt;
          if(battle.cleanWin) stats.cleanLosses++;
          if(battle.lastLifeWin) stats.lastLifeLosses++;
        }
      });
    });

    stats.winRate = calculateWinRate(stats.wins,stats.losses);
    stats.averageLivesRemainingOnWin = stats.wins ? stats.totalLivesRemainingOnWins / stats.wins : 0;
    stats.averageDamageDealtOnLoss = stats.losses ? stats.totalDamageDealtOnLosses / stats.losses : 0;
    return stats;
  }

  function calculateLongestOutcomeStreak(drafts, playerName, wantedOutcome){
    const name = normalizeName(playerName);
    const wanted = wantedOutcome === 'loss' ? 'loss' : 'win';
    let best = {length:0,startDraftId:null,endDraftId:null,startMatchIndex:null,endMatchIndex:null};
    let current = null;

    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      (Array.isArray(draft?.matches) ? draft.matches : []).forEach((match,index)=>{
        if(getMatchType(match,draft) !== MATCH_TYPES.PLAYED) return;
        const p1 = normalizeName(match?.p1);
        const p2 = normalizeName(match?.p2);
        if(p1 !== name && p2 !== name) return;
        const outcome = getPlayerOutcome(match,draft,name);
        if(outcome !== 'win' && outcome !== 'loss') return;

        if(outcome === wanted){
          if(!current){
            current = {length:0,startDraftId:numberOrZero(draft?.id),startMatchIndex:index};
          }
          current.length++;
          current.endDraftId = numberOrZero(draft?.id);
          current.endMatchIndex = index;
          if(current.length > best.length) best = {...current};
        }else{
          current = null;
        }
      });
    });
    return best;
  }

  function calculateConsecutiveDraftAppearances(drafts, playerName){
    const name = normalizeName(playerName);
    let best = {length:0,startDraftId:null,endDraftId:null};
    let current = null;
    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      const present = Boolean(getPlayerDraftEntry(draft,name));
      if(present){
        if(!current) current = {length:0,startDraftId:numberOrZero(draft?.id)};
        current.length++;
        current.endDraftId = numberOrZero(draft?.id);
        if(current.length > best.length) best = {...current};
      }else{
        current = null;
      }
    });
    return best;
  }

  function calculatePlayerStreaks(drafts, playerName){
    return {
      longestWinStreak:calculateLongestOutcomeStreak(drafts,playerName,'win'),
      longestLossStreak:calculateLongestOutcomeStreak(drafts,playerName,'loss'),
      consecutiveDraftAppearances:calculateConsecutiveDraftAppearances(drafts,playerName)
    };
  }

  function calculatePlayerSummary(drafts, playerName){
    const name = normalizeName(playerName);
    if(!name) return null;
    const history = calculatePlayerHistory(drafts,name);
    if(!history.length) return null;
    const legend = getPlayerLegendStats(drafts,name) || createLegendPlayer(name);
    const matchBreakdown = calculatePlayerMatchBreakdown(drafts,name);
    const totals = history.reduce((sum,item)=>{
      sum.matches += item.matches;
      sum.wins += item.wins;
      sum.losses += item.losses;
      sum.draftPoints += item.points;
      sum.winPoints += item.winPoints;
      sum.lossPoints += item.lossPoints;
      if(Number.isFinite(Number(item.place))){
        sum.finishTotal += Number(item.place);
        sum.finishCount++;
        const percentile = calculateFinishPercentile(item.place,item.playerCount);
        if(percentile !== null){
          sum.finishPercentileTotal += percentile;
          sum.finishPercentileCount++;
        }
      }
      return sum;
    },{
      matches:0,wins:0,losses:0,draftPoints:0,winPoints:0,lossPoints:0,
      finishTotal:0,finishCount:0,finishPercentileTotal:0,finishPercentileCount:0
    });

    const draftsPlayed = history.length;
    const draftWins = numberOrZero(legend.draftWins);
    const podiums = numberOrZero(legend.first)+numberOrZero(legend.second)+numberOrZero(legend.third);
    const top5 = podiums+numberOrZero(legend.fourth)+numberOrZero(legend.fifth);

    return {
      name,
      drafts:draftsPlayed,
      matches:totals.matches,
      officialMatches:matchBreakdown.officialMatches,
      playedMatches:matchBreakdown.playedMatches,
      walkoverMatches:matchBreakdown.walkoverMatches,
      doubleWalkovers:matchBreakdown.doubleWalkovers,
      battleEligibleMatches:matchBreakdown.battleEligibleMatches,
      playedWins:matchBreakdown.playedWins,
      playedLosses:matchBreakdown.playedLosses,
      playedWinRate:matchBreakdown.playedWinRate,
      playedPoints:matchBreakdown.playedPoints,
      playedWinPoints:matchBreakdown.playedWinPoints,
      playedLossPoints:matchBreakdown.playedLossPoints,
      averagePlayedPoints:matchBreakdown.averagePlayedPoints,
      averagePlayedWinPoints:matchBreakdown.averagePlayedWinPoints,
      averagePlayedLossPoints:matchBreakdown.averagePlayedLossPoints,
      wins:totals.wins,
      losses:totals.losses,
      balance:totals.wins-totals.losses,
      winRate:calculateWinRate(totals.wins,totals.losses),
      draftPoints:totals.draftPoints,
      averageDraftPoints:draftsPlayed ? totals.draftPoints / draftsPlayed : 0,
      averageFinish:totals.finishCount ? totals.finishTotal / totals.finishCount : null,
      averageFinishPercentile:totals.finishPercentileCount ? totals.finishPercentileTotal / totals.finishPercentileCount : null,
      winPoints:totals.winPoints,
      lossPoints:totals.lossPoints,
      legendPoints:numberOrZero(legend.legendPoints),
      legendRank:legend.rank || null,
      eligibleForLegendRank:Boolean(legend.eligibleForRank),
      draftWins,
      titleRate:draftsPlayed ? draftWins / draftsPlayed : 0,
      podiums,
      podiumRate:draftsPlayed ? podiums / draftsPlayed : 0,
      top5,
      top5Rate:draftsPlayed ? top5 / draftsPlayed : 0,
      first:numberOrZero(legend.first),
      second:numberOrZero(legend.second),
      third:numberOrZero(legend.third),
      fourth:numberOrZero(legend.fourth),
      fifth:numberOrZero(legend.fifth)
    };
  }


  function calculateCardProfile(drafts, cards, cardName, options){
    const name = normalizeName(cardName);
    if(!name) return null;

    const sourceCards = Array.isArray(cards) ? cards : [];
    const meta = sourceCards.find(card=>normalizeName(card?.name) === name) || null;
    const finishedDrafts = getFinishedDraftsChronologically(drafts);

    const draftIds = new Set();
    const owners = {};
    const pilots = {};
    const partners = {};
    const opponents = {};
    const perDraft = {};
    let appearances = 0;
    let mainDeckAppearances = 0;
    let sideboardAppearances = 0;
    let matches = 0;
    let wins = 0;
    let losses = 0;
    let draftWins = 0;
    let podiums = 0;
    let top5 = 0;
    let legendPoints = 0;
    let draftPoints = 0;

    function ensureMini(map, key){
      if(!map[key]){
        map[key] = {
          name:key,
          appearances:0,
          sharedDecks:0,
          matches:0,
          wins:0,
          losses:0,
          draftPoints:0,
          legendPoints:0,
          draftWins:0,
          podiums:0,
          top5:0,
          draftIds:new Set()
        };
      }
      return map[key];
    }

    finishedDrafts.forEach(draft=>{
      const draftId = numberOrZero(draft?.id);
      const players = Array.isArray(draft?.players) ? draft.players : [];
      const ranking = getDraftLegendOrder(draft);
      const placeByName = {};
      ranking.forEach((row,index)=>{ placeByName[row.name] = index+1; });
      const rankByName = {};
      ranking.forEach(row=>{ rankByName[row.name] = row; });

      const deckByPlayer = {};
      const carriers = [];

      players.forEach(player=>{
        const playerName = normalizeName(player?.name);
        const rawDeck = getMainDeckCards(player).map(normalizeName).filter(Boolean);
        const rawSideboard = getSideboardCards(player).map(normalizeName).filter(Boolean);
        const uniqueDeck = [...new Set(rawDeck)];
        const uniqueSideboard = [...new Set(rawSideboard)];
        const uniquePlayerDeck = [...new Set([...rawDeck,...rawSideboard])];
        deckByPlayer[playerName] = uniquePlayerDeck;

        if(!uniquePlayerDeck.includes(name)) return;
        appearances++;
        if(uniqueDeck.includes(name)) mainDeckAppearances++;
        if(uniqueSideboard.includes(name)) sideboardAppearances++;
        draftIds.add(draftId);
        owners[playerName] = numberOrZero(owners[playerName])+1;
        carriers.push(playerName);

        const place = placeByName[playerName] || null;
        if(place === 1) draftWins++;
        if(place && place <= 3) podiums++;
        if(place && place <= 5) top5++;
        legendPoints += place ? numberOrZero(LEGEND_POINTS[place]) : 0;

        const playerDraftPoints = numberOrZero(rankByName[playerName]?.total);
        draftPoints += playerDraftPoints;

        const pilot = ensureMini(pilots,playerName);
        pilot.appearances++;
        pilot.draftIds.add(draftId);
        pilot.legendPoints += place ? numberOrZero(LEGEND_POINTS[place]) : 0;
        pilot.draftPoints += playerDraftPoints;
        if(place === 1) pilot.draftWins++;
        if(place && place <= 3) pilot.podiums++;
        if(place && place <= 5) pilot.top5++;

        if(!perDraft[draftId]){
          perDraft[draftId] = {
            id:draftId,
            title:normalizeName(draft?.title) || `D${draftId}`,
            playerCount:players.length,
            players:new Set(),
            places:[],
            carriers:[],
            matches:0,
            wins:0,
            losses:0,
            draftPoints:0
          };
        }
        const carrier={
          player:playerName,
          place,
          zone:uniqueDeck.includes(name) ? 'mainDeck' : 'sideboard',
          inMainDeck:uniqueDeck.includes(name),
          inSideboard:uniqueSideboard.includes(name),
          mainDeck:rawDeck.slice(),
          sideboard:rawSideboard.slice(),
          playerDeck:uniquePlayerDeck.slice(),
          matches:0,
          wins:0,
          losses:0,
          winRate:0,
          draftPoints:playerDraftPoints,
          legendPoints:place ? numberOrZero(LEGEND_POINTS[place]) : 0,
          isWinner:place === 1
        };
        perDraft[draftId].players.add(playerName);
        perDraft[draftId].carriers.push(carrier);
        if(place) perDraft[draftId].places.push({player:playerName,place});
        perDraft[draftId].draftPoints += playerDraftPoints;

        uniquePlayerDeck.forEach(partnerName=>{
          if(partnerName === name) return;
          const partner = ensureMini(partners,partnerName);
          partner.sharedDecks++;
          partner.draftIds.add(draftId);
        });
      });

      if(!carriers.length) return;

      (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
        if(getMatchType(match,draft) !== MATCH_TYPES.PLAYED) return;
        const p1 = normalizeName(match?.p1);
        const p2 = normalizeName(match?.p2);

        carriers.forEach(playerName=>{
          if(p1 !== playerName && p2 !== playerName) return;
          const outcome = getPlayerOutcome(match,draft,playerName);
          if(outcome !== 'win' && outcome !== 'loss') return;

          matches++;
          if(outcome === 'win') wins++;
          else losses++;

          const pilot = ensureMini(pilots,playerName);
          pilot.matches++;
          if(outcome === 'win') pilot.wins++;
          else pilot.losses++;

          const row = perDraft[draftId];
          if(row){
            row.matches++;
            if(outcome === 'win') row.wins++;
            else row.losses++;
            const carrier=row.carriers?.find(item=>item.player===playerName);
            if(carrier){
              carrier.matches++;
              if(outcome === 'win') carrier.wins++;
              else carrier.losses++;
            }
          }

          const ownDeck = deckByPlayer[playerName] || [];
          ownDeck.forEach(partnerName=>{
            if(partnerName === name) return;
            const partner = ensureMini(partners,partnerName);
            partner.matches++;
            if(outcome === 'win') partner.wins++;
            else partner.losses++;
          });

          const opponentName = p1 === playerName ? p2 : p1;
          (deckByPlayer[opponentName] || []).forEach(opponentCardName=>{
            if(opponentCardName === name) return;
            const opponent = ensureMini(opponents,opponentCardName);
            opponent.draftIds.add(draftId);
            opponent.matches++;
            if(outcome === 'win') opponent.wins++;
            else opponent.losses++;
          });
        });
      });
    });

    const ownerRows = Object.entries(owners).map(([ownerName,count])=>({
      name:ownerName,
      appearances:count
    })).sort((a,b)=>b.appearances-a.appearances || compareLocale(a.name,b.name));

    function serializeMini(map){
      return Object.values(map).map(item=>({
        ...item,
        drafts:item.draftIds.size,
        draftIds:[...item.draftIds].sort((a,b)=>a-b),
        winRate:calculateWinRate(item.wins,item.losses)
      })).sort((a,b)=>
        b.appearances-a.appearances ||
        b.sharedDecks-a.sharedDecks ||
        b.matches-a.matches ||
        compareLocale(a.name,b.name)
      );
    }

    const pilotRows = serializeMini(pilots);
    const partnerRows = serializeMini(partners);
    const opponentRows = serializeMini(opponents);
    const perDraftRows = Object.values(perDraft).map(row=>{
      const serializedCarriers=(row.carriers||[]).map(carrier=>({
        ...carrier,
        winRate:calculateWinRate(carrier.wins,carrier.losses)
      })).sort((a,b)=>(a.place||999)-(b.place||999) || compareLocale(a.player,b.player));
      return {
        ...row,
        players:[...row.players].sort(compareLocale),
        places:row.places.slice().sort((a,b)=>a.place-b.place || compareLocale(a.player,b.player)),
        carriers:serializedCarriers,
        // Per-edition point records for a card must describe a typical deck using it,
        // not the raw sum of every carrier in a large lobby.
        averagePointsPerAppearance:serializedCarriers.length ? numberOrZero(row.draftPoints)/serializedCarriers.length : 0,
        winRate:calculateWinRate(row.wins,row.losses)
      };
    }).sort((a,b)=>b.id-a.id);

    const placements = perDraftRows.flatMap(row=>(row.carriers||[]).map(carrier=>Number(carrier.place)).filter(Number.isFinite));
    const averageFinish = placements.length ? average(placements) : null;
    const podiumRate = appearances ? podiums/appearances : 0;
    const titleRate = appearances ? draftWins/appearances : 0;

    const activeDraftIds = new Set(perDraftRows.map(row=>numberOrZero(row.id)));
    let longestAppearanceStreak={length:0,startDraftId:null,endDraftId:null};
    let currentAppearanceStreak={length:0,startDraftId:null,endDraftId:null};
    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      const id=numberOrZero(draft?.id);
      if(activeDraftIds.has(id)){
        if(!currentAppearanceStreak.length) currentAppearanceStreak.startDraftId=id;
        currentAppearanceStreak.length++;
        currentAppearanceStreak.endDraftId=id;
        if(currentAppearanceStreak.length>longestAppearanceStreak.length) longestAppearanceStreak={...currentAppearanceStreak};
      }else{
        currentAppearanceStreak={length:0,startDraftId:null,endDraftId:null};
      }
    });
    const chronologicalActive=[...activeDraftIds].sort((a,b)=>a-b);
    let longestReturnGap=null;
    for(let index=1; index<chronologicalActive.length; index++){
      const skippedDrafts=Math.max(0,chronologicalActive[index]-chronologicalActive[index-1]-1);
      if(!longestReturnGap || skippedDrafts>longestReturnGap.skippedDrafts){
        longestReturnGap={fromDraftId:chronologicalActive[index-1],toDraftId:chronologicalActive[index],skippedDrafts};
      }
    }

    const minimumPilotDrafts = Number(options?.minimumPilotDrafts) || SAMPLE_THRESHOLDS.CARD_PILOT_DRAFTS;
    const minimumRelationshipMatches = Number(options?.minimumRelationshipMatches) || SAMPLE_THRESHOLDS.GLOBAL_CARD_WR_MATCHES;

    // Player-facing "Najskuteczniejszy pilot": 2 ukończone drafty z kartą wystarczą
    // do kwalifikacji. Sam WR nadal pochodzi wyłącznie z realnie rozegranych meczów.
    const qualifiedPilots = pilotRows.filter(row=>
      numberOrZero(row?.drafts) >= minimumPilotDrafts && numberOrZero(row?.matches) > 0
    );
    const qualifiedPartners = partnerRows.filter(row=>qualifiesSample(row.matches,minimumRelationshipMatches));
    const qualifiedOpponents = opponentRows.filter(row=>qualifiesSample(row.matches,minimumRelationshipMatches));

    const byBestWinRate = rows=>rows.slice().sort((a,b)=>
      numberOrZero(b.winRate)-numberOrZero(a.winRate) ||
      numberOrZero(b.matches)-numberOrZero(a.matches) ||
      numberOrZero(b.wins)-numberOrZero(a.wins) ||
      compareLocale(a.name,b.name)
    )[0] || null;
    const byWorstWinRate = rows=>rows.slice().sort((a,b)=>
      numberOrZero(a.winRate)-numberOrZero(b.winRate) ||
      b.matches-a.matches ||
      compareLocale(a.name,b.name)
    )[0] || null;

    const timeline=finishedDrafts.map(draft=>{
      const draftId=numberOrZero(draft?.id);
      const row=perDraftRows.find(item=>numberOrZero(item?.id)===draftId) || null;
      const carriers=row?.carriers || [];
      const totalPlayers=getActualPlayerCount(draft);
      const timelineWins=carriers.reduce((sum,item)=>sum+numberOrZero(item?.wins),0);
      const timelineLosses=carriers.reduce((sum,item)=>sum+numberOrZero(item?.losses),0);
      const timelineMatches=timelineWins+timelineLosses;
      const timelinePlaces=carriers.map(item=>Number(item?.place)).filter(Number.isFinite);
      return {
        draftId,
        appearances:carriers.length,
        totalPlayers,
        presence:totalPlayers?carriers.length/totalPlayers:0,
        wins:timelineWins,
        losses:timelineLosses,
        matches:timelineMatches,
        winRate:timelineMatches?timelineWins/timelineMatches:null,
        legendPoints:carriers.reduce((sum,item)=>sum+numberOrZero(item?.legendPoints),0),
        avgPlace:timelinePlaces.length?average(timelinePlaces):null
      };
    });
    const activeTimeline=timeline.filter(row=>row.appearances>0);
    const peakPopularity=activeTimeline.slice().sort((a,b)=>
      numberOrZero(b?.presence)-numberOrZero(a?.presence) ||
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
    )[0] || null;
    const bestWrEra=activeTimeline.filter(row=>numberOrZero(row?.matches)>=minimumRelationshipMatches).slice().sort((a,b)=>
      numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
    )[0] || null;
    const bestLegendEra=activeTimeline.slice().sort((a,b)=>
      numberOrZero(b?.legendPoints)-numberOrZero(a?.legendPoints) ||
      numberOrZero(b?.presence)-numberOrZero(a?.presence) ||
      numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
    )[0] || null;
    const worstLegendEra=activeTimeline.slice().sort((a,b)=>
      numberOrZero(a?.legendPoints)-numberOrZero(b?.legendPoints) ||
      numberOrZero(a?.presence)-numberOrZero(b?.presence) ||
      numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
    )[0] || null;

    const finishBuckets=[
      {key:'first',label:'#1',count:placements.filter(place=>place===1).length},
      {key:'second',label:'#2',count:placements.filter(place=>place===2).length},
      {key:'third',label:'#3',count:placements.filter(place=>place===3).length},
      {key:'fourth',label:'#4',count:placements.filter(place=>place===4).length},
      {key:'fifth',label:'#5',count:placements.filter(place=>place===5).length},
      {key:'outsideTop5',label:'> #5',count:placements.filter(place=>place>5).length}
    ];
    const finishDistribution={
      total:placements.length,
      averageFinish,
      podiumRate:placements.length?placements.filter(place=>place<=3).length/placements.length:0,
      titleRate:placements.length?placements.filter(place=>place===1).length/placements.length:0,
      buckets:finishBuckets,
      maxCount:Math.max(1,...finishBuckets.map(row=>row.count))
    };

    const pilotGallery=pilotRows.slice().sort((a,b)=>
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      numberOrZero(b?.legendPoints)-numberOrZero(a?.legendPoints) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      compareLocale(a?.name,b?.name)
    );
    const frequentPartners=partnerRows.filter(row=>numberOrZero(row?.drafts)>=2).slice().sort((a,b)=>
      numberOrZero(b?.sharedDecks)-numberOrZero(a?.sharedDecks) ||
      numberOrZero(b?.drafts)-numberOrZero(a?.drafts) ||
      compareLocale(a?.name,b?.name)
    ).slice(0,4);

    const deckEntries=perDraftRows.flatMap(row=>(row.carriers||[]).map(carrier=>({
      draftId:numberOrZero(row?.id),
      player:carrier.player,
      playerCount:numberOrZero(row?.playerCount),
      mainDeck:Array.isArray(carrier.mainDeck)?carrier.mainDeck.slice():[],
      sideboard:Array.isArray(carrier.sideboard)?carrier.sideboard.slice():[],
      playerDeck:Array.isArray(carrier.playerDeck)?carrier.playerDeck.slice():[],
      zone:carrier.zone||null,
      inMainDeck:Boolean(carrier.inMainDeck),
      inSideboard:Boolean(carrier.inSideboard),
      place:Number.isFinite(Number(carrier.place))?Number(carrier.place):null,
      wins:numberOrZero(carrier.wins),
      losses:numberOrZero(carrier.losses),
      matches:numberOrZero(carrier.matches),
      points:numberOrZero(carrier.draftPoints),
      winRate:numberOrZero(carrier.winRate),
      legendPoints:numberOrZero(carrier.legendPoints),
      isWinner:Boolean(carrier.isWinner)
    }))).sort((a,b)=>a.draftId-b.draftId||compareLocale(a.player,b.player));
    const showcaseDecks=deckEntries.slice().sort((a,b)=>
      (Number.isFinite(a.place)?a.place:999)-(Number.isFinite(b.place)?b.place:999) ||
      b.points-a.points ||
      b.winRate-a.winRate ||
      b.wins-a.wins ||
      b.draftId-a.draftId
    ).slice(0,4);

    const placeRows=deckEntries.filter(entry=>Number.isFinite(entry.place)).map(entry=>({draftId:entry.draftId,player:entry.player,place:entry.place}));
    const bestPlace=placeRows.slice().sort((a,b)=>a.place-b.place||b.draftId-a.draftId)[0]||null;
    const worstPlace=placeRows.slice().sort((a,b)=>b.place-a.place||b.draftId-a.draftId)[0]||null;
    const lowestAveragePointsDraft=perDraftRows.filter(row=>(row?.carriers?.length||0)>0).slice().sort((a,b)=>
      numberOrZero(a?.averagePointsPerAppearance)-numberOrZero(b?.averagePointsPerAppearance) ||
      numberOrZero(b?.carriers?.length)-numberOrZero(a?.carriers?.length) ||
      numberOrZero(b?.id)-numberOrZero(a?.id)
    )[0] || null;
    const highestAveragePointsDraft=perDraftRows.filter(row=>(row?.carriers?.length||0)>0).slice().sort((a,b)=>
      numberOrZero(b?.averagePointsPerAppearance)-numberOrZero(a?.averagePointsPerAppearance) ||
      numberOrZero(b?.carriers?.length)-numberOrZero(a?.carriers?.length) ||
      numberOrZero(b?.id)-numberOrZero(a?.id)
    )[0] || null;

    const chronologicalHistory=perDraftRows.slice().sort((a,b)=>numberOrZero(a?.id)-numberOrZero(b?.id));
    const debutDraft=chronologicalHistory[0]||null;
    const latestDraft=chronologicalHistory[chronologicalHistory.length-1]||null;
    const topPilot=pilotRows[0]||null;
    const heritage={
      titleRate,
      podiumRate,
      legendPerAppearance:appearances?legendPoints/appearances:0,
      appearancesPerDraft:draftIds.size?appearances/draftIds.size:0,
      debutDraft,
      latestDraft,
      partnerCount:partnerRows.length,
      topPilotShare:topPilot&&appearances?numberOrZero(topPilot.appearances)/appearances:0
    };

    const tagDefinitions=buildTagDefinitionIndex(options?.tags);
    const cardMetaByName=new Map(sourceCards.map(card=>[normalizeName(card?.name),card]));
    const tagEnvironment=new Map();
    deckEntries.forEach(entry=>{
      const companions=[...new Set((entry.playerDeck||[]).map(normalizeName).filter(cardName=>cardName&&cardName!==name))];
      const seenTags=new Set();
      companions.forEach(companionName=>{
        const companion=cardMetaByName.get(companionName);
        (Array.isArray(companion?.tags)?companion.tags:[]).forEach(tagIdRaw=>{
          const tagId=normalizeName(tagIdRaw);
          const category=tagDefinitions.categoryById[tagId];
          if(!category||category==='series'||category==='special') return;
          seenTags.add(tagId);
        });
      });
      seenTags.forEach(tagId=>{
        const tag=tagDefinitions.byId[tagId]||{};
        const category=tagDefinitions.categoryById[tagId]||'unknown';
        const row=tagEnvironment.get(tagId)||{id:tagId,name:normalizeName(tag?.name)||tagId,category,decks:0,wins:0,losses:0,matches:0};
        row.decks++;
        row.wins+=entry.wins;
        row.losses+=entry.losses;
        row.matches+=entry.matches;
        tagEnvironment.set(tagId,row);
      });
    });
    const environmentRows=[...tagEnvironment.values()].map(row=>({
      ...row,
      coverage:deckEntries.length?row.decks/deckEntries.length:0,
      winRate:calculateWinRate(row.wins,row.losses)
    })).sort((a,b)=>compareLocale(a.name,b.name));
    const categoryRows={};
    environmentRows.forEach(row=>{
      if(!categoryRows[row.category]) categoryRows[row.category]=[];
      categoryRows[row.category].push(row);
    });
    Object.keys(categoryRows).forEach(category=>categoryRows[category].sort((a,b)=>
      b.decks-a.decks || b.matches-a.matches || compareLocale(a.name,b.name)
    ));
    const mostCommonEnvironment=environmentRows.slice().sort((a,b)=>
      b.decks-a.decks || b.matches-a.matches || compareLocale(a.name,b.name)
    )[0] || null;
    const bestQualifiedEnvironment=environmentRows.filter(row=>row.matches>=minimumRelationshipMatches&&row.decks>=2).slice().sort((a,b)=>
      b.winRate-a.winRate || b.matches-a.matches || b.decks-a.decks || compareLocale(a.name,b.name)
    )[0] || null;
    const uniquePartners=new Set(deckEntries.flatMap(entry=>(entry.playerDeck||[]).filter(cardName=>normalizeName(cardName)!==name))).size;
    const uniqueArchetypes=environmentRows.filter(row=>row.category==='deckArchetypes').length;

    const pairMap=new Map();
    deckEntries.forEach(entry=>{
      const companions=[...new Set((entry.playerDeck||[]).map(normalizeName).filter(cardName=>cardName&&cardName!==name))].sort(compareLocale);
      for(let first=0; first<companions.length; first++){
        for(let second=first+1; second<companions.length; second++){
          const a=companions[first], b=companions[second];
          const key=`${a}|||${b}`;
          const pair=pairMap.get(key)||{a,b,decks:0,draftIds:new Set()};
          pair.decks++;
          pair.draftIds.add(entry.draftId);
          pairMap.set(key,pair);
        }
      }
    });
    const corePairs=[...pairMap.values()].map(row=>({a:row.a,b:row.b,decks:row.decks,draftCount:row.draftIds.size,draftIds:[...row.draftIds].sort((a,b)=>a-b)}))
      .filter(row=>row.decks>=2)
      .sort((a,b)=>b.decks-a.decks||b.draftCount-a.draftCount||compareLocale(a.a,b.a)||compareLocale(a.b,b.b))
      .slice(0,4);

    /* =========================================================
       CARD SYNERGY NETWORK — Engine-owned card environment
       A built synergy exists when >= 4 cards in the whole player deck
       (Main Deck + Planetary Reserve) share one canonical tag.
       The focal card does NOT need to own that tag itself.
    ========================================================= */
    const synergyMinimumCards = DECK_ARCHETYPE_MIN_CARDS;
    const minimumPartnerDrafts = Number(options?.minimumPartnerDrafts) || SAMPLE_THRESHOLDS.CARD_PARTNER_DRAFTS;
    const minimumPartnerMatches = Number(options?.minimumPartnerMatches) || SAMPLE_THRESHOLDS.CARD_MATCHUP_MATCHES;

    const commonPartners = partnerRows.slice().sort((a,b)=>
      numberOrZero(b?.sharedDecks)-numberOrZero(a?.sharedDecks) ||
      numberOrZero(b?.drafts)-numberOrZero(a?.drafts) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      compareLocale(a?.name,b?.name)
    ).slice(0,6).map(row=>({
      ...row,
      deckShare:deckEntries.length ? numberOrZero(row.sharedDecks)/deckEntries.length : 0
    }));

    function buildCardSynergyRows(allowedCategories){
      const map=new Map();
      deckEntries.forEach(entry=>{
        const counts=new Map();
        (entry.playerDeck||[]).forEach(deckCardNameRaw=>{
          const deckCardName=normalizeName(deckCardNameRaw);
          const deckCard=cardMetaByName.get(deckCardName);
          (Array.isArray(deckCard?.tags)?deckCard.tags:[]).forEach(tagIdRaw=>{
            const tagId=normalizeName(tagIdRaw);
            const category=tagDefinitions.categoryById[tagId];
            if(!allowedCategories.has(category)) return;
            counts.set(tagId,numberOrZero(counts.get(tagId))+1);
          });
        });

        counts.forEach((count,tagId)=>{
          if(count < synergyMinimumCards) return;
          const tag=tagDefinitions.byId[tagId]||{};
          const category=tagDefinitions.categoryById[tagId]||null;
          const row=map.get(tagId)||{
            id:tagId,
            name:normalizeName(tag?.name)||tagId,
            category,
            decks:0,
            cardSlots:0,
            maxCards:0,
            draftIds:new Set(),
            players:new Set()
          };
          row.decks++;
          row.cardSlots+=count;
          row.maxCards=Math.max(row.maxCards,count);
          row.draftIds.add(entry.draftId);
          row.players.add(entry.player);
          map.set(tagId,row);
        });
      });

      return [...map.values()].map(row=>({
        id:row.id,
        name:row.name,
        category:row.category,
        decks:row.decks,
        coverage:deckEntries.length ? row.decks/deckEntries.length : 0,
        averageCards:row.decks ? row.cardSlots/row.decks : 0,
        maxCards:row.maxCards,
        drafts:row.draftIds.size,
        draftIds:[...row.draftIds].sort((a,b)=>a-b),
        players:row.players.size
      })).sort((a,b)=>
        numberOrZero(b.decks)-numberOrZero(a.decks) ||
        numberOrZero(b.maxCards)-numberOrZero(a.maxCards) ||
        numberOrZero(b.averageCards)-numberOrZero(a.averageCards) ||
        compareLocale(a.name,b.name)
      );
    }

    const builtMechanics=buildCardSynergyRows(new Set(['mechanicFamilies','subtypes']));
    const builtArchetypes=buildCardSynergyRows(new Set(['deckArchetypes']));

    const performancePartners=partnerRows.filter(row=>
      numberOrZero(row?.drafts) >= minimumPartnerDrafts &&
      numberOrZero(row?.matches) >= minimumPartnerMatches
    ).slice().sort((a,b)=>
      numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
      numberOrZero(b?.sharedDecks)-numberOrZero(a?.sharedDecks) ||
      compareLocale(a?.name,b?.name)
    ).slice(0,6).map(row=>({
      ...row,
      deckShare:deckEntries.length ? numberOrZero(row.sharedDecks)/deckEntries.length : 0
    }));

    const synergy={
      summary:{
        analyzedDecks:deckEntries.length,
        uniquePartners:partnerRows.length,
        builtMechanics:builtMechanics.length,
        builtArchetypes:builtArchetypes.length,
        minimumSynergyCards:synergyMinimumCards,
        minimumPartnerDrafts,
        minimumPartnerMatches
      },
      commonPartners,
      builtMechanics,
      builtArchetypes,
      performancePartners
    };

    let biggestPopularityRise=null;
    let biggestPopularityFall=null;
    for(let index=1; index<timeline.length; index++){
      const before=timeline[index-1], after=timeline[index];
      const delta=numberOrZero(after?.presence)-numberOrZero(before?.presence);
      const transition={before,after,delta};
      if(!biggestPopularityRise||delta>biggestPopularityRise.delta) biggestPopularityRise=transition;
      if(!biggestPopularityFall||delta<biggestPopularityFall.delta) biggestPopularityFall=transition;
    }
    const popularityMomentum={
      biggestRise:biggestPopularityRise,
      biggestFall:biggestPopularityFall
    };
    const dna={
      totalDecks:deckEntries.length,
      environmentRows,
      categoryRows,
      highlights:{mostCommonEnvironment,bestQualifiedEnvironment,uniquePartners,uniqueArchetypes,minimumMatches:minimumRelationshipMatches},
      corePairs
    };

    return {
      name,
      card:meta ? {...meta} : {name},
      heritage,
      timeline,
      trends:{
        peakPopularity,
        bestWrEra,
        bestLegendEra,
        worstLegendEra,
        longestAppearanceStreak,
        popularityMomentum,
        minimumMatches:minimumRelationshipMatches
      },
      finishDistribution,
      pilotGallery,
      frequentPartners,
      showcaseDecks,
      synergy,
      // Legacy environment block retained for backward compatibility with older consumers.
      // New card UI uses `synergy`.
      dna,
      summary:{
        appearances,
        mainDeckAppearances,
        sideboardAppearances,
        drafts:draftIds.size,
        owners:ownerRows.length,
        matches,
        wins,
        losses,
        winRate:calculateWinRate(wins,losses),
        draftWins,
        podiums,
        top5,
        legendPoints,
        draftPoints,
        // Average points of a real deck appearance containing the card.
        // A draft with several carriers must not count as one giant observation.
        averageDraftPoints:appearances ? draftPoints/appearances : 0,
        averageFinish,
        podiumRate,
        titleRate
      },
      ownerRows,
      topOwner:ownerRows[0] || null,
      pilots:pilotRows,
      partners:partnerRows,
      opponents:opponentRows,
      history:perDraftRows,
      curiosities:{
        longestAppearanceStreak,
        longestReturnGap,
        mostLoyalPilot:pilotRows[0] || null,
        mostFrequentPartner:partnerRows[0] || null,
        peakDraftByAppearances:perDraftRows.slice().sort((a,b)=>
          (b.carriers?.length||0)-(a.carriers?.length||0) || b.id-a.id
        )[0] || null,
        championPilots:pilotRows.filter(row=>row.draftWins>0).length,
        podiumPilots:pilotRows.filter(row=>row.podiums>0).length
      },
      records:{
        mostFrequentPilot:pilotRows[0] || null,
        bestQualifiedPilot:byBestWinRate(qualifiedPilots),
        bestQualifiedPartner:byBestWinRate(qualifiedPartners),
        bestQualifiedMatchup:byBestWinRate(qualifiedOpponents),
        worstQualifiedMatchup:byWorstWinRate(qualifiedOpponents),
        highestAveragePointsDraft,
        lowestAveragePointsDraft,
        // Backward-compatible aliases; semantics are now normalized per deck appearance.
        highestPointsDraft:highestAveragePointsDraft,
        bestWinRateDraft:perDraftRows.filter(row=>row.matches>0).sort((a,b)=>
          numberOrZero(b.winRate)-numberOrZero(a.winRate) ||
          b.matches-a.matches ||
          b.id-a.id
        )[0] || null,
        worstWinRateDraft:perDraftRows.filter(row=>row.matches>0).sort((a,b)=>
          numberOrZero(a.winRate)-numberOrZero(b.winRate) ||
          b.matches-a.matches ||
          b.id-a.id
        )[0] || null,
        lowestPointsDraft:lowestAveragePointsDraft,
        bestPlace,
        worstPlace
      }
    };
  }

  function calculatePlayerCardContributions(drafts, playerName){
    const name = normalizeName(playerName);
    if(!name) return [];

    const rows = {};
    const history = calculatePlayerHistory(drafts,name);

    function ensureCard(cardName){
      if(!rows[cardName]){
        rows[cardName] = {
          name:cardName,
          appearances:0,
          mainDeckAppearances:0,
          sideboardAppearances:0,
          matches:0,
          wins:0,
          losses:0,
          podiumDecks:0,
          titleDecks:0,
          legendPoints:0,
          draftIds:new Set()
        };
      }
      return rows[cardName];
    }

    history.forEach(item=>{
      const mainDeck = [...new Set(getMainDeckCards(item).map(normalizeName).filter(Boolean))];
      const sideboard = [...new Set(getSideboardCards(item).map(normalizeName).filter(Boolean))];
      const playerDeck = [...new Set([...mainDeck,...sideboard])];
      if(!playerDeck.length) return;

      const draft = (Array.isArray(drafts) ? drafts : []).find(row=>numberOrZero(row?.id) === numberOrZero(item?.draftId));
      let playedWins = 0;
      let playedLosses = 0;
      if(draft){
        (Array.isArray(draft?.matches) ? draft.matches : []).forEach(match=>{
          if(getMatchType(match,draft) !== MATCH_TYPES.PLAYED) return;
          const result = getPlayerOutcome(match,draft,name);
          if(result === 'win') playedWins++;
          else if(result === 'loss') playedLosses++;
        });
      }
      const playedMatches = playedWins + playedLosses;

      playerDeck.forEach(cardName=>{
        const stat = ensureCard(cardName);
        stat.appearances++;
        if(mainDeck.includes(cardName)) stat.mainDeckAppearances++;
        if(sideboard.includes(cardName)) stat.sideboardAppearances++;
        stat.matches += playedMatches;
        stat.wins += playedWins;
        stat.losses += playedLosses;
        if(Number(item?.place) >= 1 && Number(item?.place) <= 3) stat.podiumDecks++;
        if(item?.isWinner) stat.titleDecks++;
        stat.legendPoints += numberOrZero(item?.legendPoints);
        stat.draftIds.add(numberOrZero(item?.draftId));
      });
    });

    return Object.values(rows).map(row=>({
      ...row,
      draftIds:[...row.draftIds].sort((a,b)=>a-b),
      winRate:calculateWinRate(row.wins,row.losses)
    })).sort((a,b)=>compareLocale(a.name,b.name));
  }

  function calculatePlayerAnatomy(summary){
    const source = summary && typeof summary === 'object' ? summary : {};
    const totalPoints = numberOrZero(source.draftPoints);
    const winPoints = numberOrZero(source.winPoints);
    const lossPoints = numberOrZero(source.lossPoints);
    const draftsPlayed = numberOrZero(source.drafts);
    const top5 = numberOrZero(source.top5);
    const finishDistribution = [
      {key:'first',label:'#1',count:numberOrZero(source.first)},
      {key:'second',label:'#2',count:numberOrZero(source.second)},
      {key:'third',label:'#3',count:numberOrZero(source.third)},
      {key:'fourth',label:'#4',count:numberOrZero(source.fourth)},
      {key:'fifth',label:'#5',count:numberOrZero(source.fifth)},
      {key:'outsideTop5',label:'> #5',count:Math.max(0,draftsPlayed-top5)}
    ];
    return {
      pointShares:{
        total:totalPoints,
        win:{points:winPoints,share:totalPoints>0?winPoints/totalPoints:0},
        loss:{points:lossPoints,share:totalPoints>0?lossPoints/totalPoints:0}
      },
      finishDistribution,
      maxFinishCount:Math.max(1,...finishDistribution.map(row=>row.count))
    };
  }

  function calculatePlayerDynamics(historyInput){
    const history=(Array.isArray(historyInput)?historyInput:[]).slice().sort((a,b)=>numberOrZero(a?.draftId)-numberOrZero(b?.draftId));
    let biggestRise=null;
    let biggestFall=null;
    let biggestPointsRise=null;
    for(let index=1; index<history.length; index++){
      const before=history[index-1];
      const after=history[index];
      const beforePercentile=calculateFinishPercentile(before?.place,before?.playerCount);
      const afterPercentile=calculateFinishPercentile(after?.place,after?.playerCount);
      if(beforePercentile!==null && afterPercentile!==null){
        const change=afterPercentile-beforePercentile;
        const transition={before,after,change,pointsDelta:numberOrZero(after?.points)-numberOrZero(before?.points)};
        if(!biggestRise || change>biggestRise.change) biggestRise=transition;
        if(!biggestFall || change<biggestFall.change) biggestFall=transition;
      }
      const delta=numberOrZero(after?.points)-numberOrZero(before?.points);
      if(!biggestPointsRise || delta>biggestPointsRise.delta) biggestPointsRise={before,after,delta};
    }
    return {biggestRise,biggestFall,biggestPointsRise};
  }

  function calculatePlayerPerformanceSpectrum(historyInput, limit){
    const history=(Array.isArray(historyInput)?historyInput:[]).slice();
    const maxItems=Math.max(1,Number(limit)||3);
    const best=history.slice().sort(comparePerformanceSuccess).slice(0,maxItems);
    const hardest=history.slice().sort((a,b)=>
      numberOrZero(b?.place)-numberOrZero(a?.place) ||
      numberOrZero(a?.winRate)-numberOrZero(b?.winRate) ||
      numberOrZero(a?.points)-numberOrZero(b?.points)
    ).slice(0,maxItems);
    return {best,hardest};
  }

  function calculatePlayerCardHighlights(rowsInput){
    const rows=(Array.isArray(rowsInput)?rowsInput:[]).slice();
    const minimumMatches=SAMPLE_THRESHOLDS.GLOBAL_CARD_WR_MATCHES;
    const mostUsed=rows.slice().sort((a,b)=>
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      numberOrZero(b?.legendPoints)-numberOrZero(a?.legendPoints) ||
      compareLocale(a?.name,b?.name)
    )[0] || null;
    const bestQualified=rows.filter(row=>numberOrZero(row?.matches)>=minimumMatches).slice().sort((a,b)=>
      numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
      compareLocale(a?.name,b?.name)
    )[0] || null;
    const mostWins=rows.slice().sort((a,b)=>
      numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
      numberOrZero(b?.matches)-numberOrZero(a?.matches) ||
      numberOrZero(b?.winRate)-numberOrZero(a?.winRate) ||
      compareLocale(a?.name,b?.name)
    )[0] || null;
    const mostLegend=rows.slice().sort((a,b)=>
      numberOrZero(b?.legendPoints)-numberOrZero(a?.legendPoints) ||
      numberOrZero(b?.titleDecks)-numberOrZero(a?.titleDecks) ||
      numberOrZero(b?.podiumDecks)-numberOrZero(a?.podiumDecks) ||
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      compareLocale(a?.name,b?.name)
    )[0] || null;
    const signatureCards=rows.slice().sort((a,b)=>
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
      numberOrZero(b?.legendPoints)-numberOrZero(a?.legendPoints) ||
      compareLocale(a?.name,b?.name)
    ).slice(0,12);
    const topArsenal=rows.slice().sort((a,b)=>
      numberOrZero(b?.appearances)-numberOrZero(a?.appearances) ||
      numberOrZero(b?.wins)-numberOrZero(a?.wins) ||
      compareLocale(a?.name,b?.name)
    ).slice(0,12);
    return {minimumMatches,mostUsed,bestQualified,mostWins,mostLegend,signatureCards,topArsenal};
  }

  function calculatePlayerDeckProfile(historyInput, cardRowsInput, cardsInput){
    const chronology=(Array.isArray(historyInput)?historyInput:[]).slice().sort((a,b)=>numberOrZero(a?.draftId)-numberOrZero(b?.draftId));
    const cardRows=Array.isArray(cardRowsInput)?cardRowsInput:[];
    const cards=Array.isArray(cardsInput)?cardsInput:[];
    const signatureDeck=calculatePlayerCardHighlights(cardRows).signatureCards;
    const usage=new Map(cardRows.map(row=>[normalizeName(row?.name),row]));
    const cardCatalog=new Map(cards.map(card=>[normalizeName(card?.name),card]).filter(([name])=>Boolean(name)));
    let totalDeckSlots=0;
    chronology.forEach(item=>{
      const fullDeck=Array.isArray(item?.playerDeck)?item.playerDeck:getPlayerDeckCards(item);
      totalDeckSlots+=fullDeck.map(normalizeName).filter(Boolean).length;
    });

    // Career deck-shape metrics are Main Deck only. Sideboard / Planetarna Rezerwa
    // deliberately does not affect the average Cost or printed base Power.
    const mainDeckAverages=[];
    let mainDeckSlots=0;
    let costCardsIncluded=0;
    let powerCardsIncluded=0;
    const missingCostCards=new Set();
    const missingPowerCards=new Set();
    chronology.forEach(item=>{
      const deck=getMainDeckCards(item).map(normalizeName).filter(Boolean);
      if(!deck.length) return;
      mainDeckSlots+=deck.length;
      const costValues=[];
      const powerValues=[];
      deck.forEach(cardName=>{
        const card=cardCatalog.get(cardName);
        const cost=Number(card?.cost);
        const power=Number(card?.power);
        if(Number.isFinite(cost)){
          costValues.push(cost);
          costCardsIncluded++;
        }else{
          missingCostCards.add(cardName);
        }
        if(Number.isFinite(power)){
          powerValues.push(power);
          powerCardsIncluded++;
        }else{
          missingPowerCards.add(cardName);
        }
      });
      mainDeckAverages.push({
        draftId:numberOrZero(item?.draftId),
        slots:deck.length,
        costCards:costValues.length,
        powerCards:powerValues.length,
        averageCost:costValues.length?costValues.reduce((sum,value)=>sum+value,0)/costValues.length:null,
        averagePower:powerValues.length?powerValues.reduce((sum,value)=>sum+value,0)/powerValues.length:null
      });
    });
    const costDecks=mainDeckAverages.filter(row=>Number.isFinite(row.averageCost));
    const powerDecks=mainDeckAverages.filter(row=>Number.isFinite(row.averagePower));
    const averageCost=costDecks.length?costDecks.reduce((sum,row)=>sum+row.averageCost,0)/costDecks.length:null;
    const averagePower=powerDecks.length?powerDecks.reduce((sum,row)=>sum+row.averagePower,0)/powerDecks.length:null;
    const deckAverages={
      source:'current-card-catalog',
      mainDeckOnly:true,
      decksExpected:mainDeckAverages.length,
      costDecksIncluded:costDecks.length,
      powerDecksIncluded:powerDecks.length,
      mainDeckSlots,
      costCardsIncluded,
      powerCardsIncluded,
      costCoverage:mainDeckSlots?costCardsIncluded/mainDeckSlots:0,
      powerCoverage:mainDeckSlots?powerCardsIncluded/mainDeckSlots:0,
      missingCostCards:[...missingCostCards].sort(compareLocale),
      missingPowerCards:[...missingPowerCards].sort(compareLocale),
      averageCost,
      averagePower,
      perDraft:mainDeckAverages
    };

    const finishCounts=new Map();
    chronology.forEach(item=>{
      const place=Number(item?.place);
      if(Number.isFinite(place)) finishCounts.set(place,(finishCounts.get(place)||0)+1);
    });
    const mostCommonFinish=[...finishCounts.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0]||null;

    let loyalty={name:null,length:0,start:null,end:null};
    const streakState=new Map();
    chronology.forEach((item,index)=>{
      const set=new Set((Array.isArray(item?.playerDeck)?item.playerDeck:getPlayerDeckCards(item)).map(normalizeName).filter(Boolean));
      set.forEach(cardName=>{
        const previous=streakState.get(cardName);
        const next=previous&&previous.lastIndex===index-1
          ?{length:previous.length+1,start:previous.start,lastIndex:index}
          :{length:1,start:item.draftId,lastIndex:index};
        streakState.set(cardName,next);
        if(next.length>loyalty.length) loyalty={name:cardName,length:next.length,start:next.start,end:item.draftId};
      });
    });

    let biggestRebuild=null;
    let strongestCore=null;
    for(let index=1; index<chronology.length; index++){
      const before=chronology[index-1];
      const after=chronology[index];
      const beforeSet=new Set((Array.isArray(before?.playerDeck)?before.playerDeck:getPlayerDeckCards(before)).map(normalizeName).filter(Boolean));
      const afterSet=new Set((Array.isArray(after?.playerDeck)?after.playerDeck:getPlayerDeckCards(after)).map(normalizeName).filter(Boolean));
      if(!beforeSet.size||!afterSet.size) continue;
      const retained=[...beforeSet].filter(cardName=>afterSet.has(cardName)).length;
      const base=Math.max(1,Math.min(beforeSet.size,afterSet.size));
      const retainedShare=retained/base;
      const row={before,after,retained,base,retainedShare};
      if(!biggestRebuild||retainedShare<biggestRebuild.retainedShare) biggestRebuild=row;
      if(!strongestCore||retainedShare>strongestCore.retainedShare) strongestCore=row;
    }

    const uniqueCards=usage.size;
    const diversityShare=totalDeckSlots?uniqueCards/totalDeckSlots:0;
    // Exactly four deck-building curiosities. "Najczęstsze miejsce" was removed
    // because it describes standings, not deck construction, and is already
    // represented elsewhere in the player profile.
    const curiosities=[
      {key:'diversity',label:'Różnorodność arsenału',value:`${uniqueCards} różnych kart`,sub:`${totalDeckSlots} miejsc w składach draftowych · ${(diversityShare*100).toFixed(1)}% unikalnych nazw względem wszystkich slotów`},
      {key:'loyalCard',label:'Najwierniejsza karta',value:loyalty.name||'Brak danych',sub:loyalty.name?`${loyalty.length} kolejnych własnych występów · D${loyalty.start} → D${loyalty.end}`:'Brak ciągłości składów'},
      {key:'biggestRebuild',label:'Największa przebudowa składu',value:biggestRebuild?`D${biggestRebuild.before.draftId} → D${biggestRebuild.after.draftId}`:'Brak danych',sub:biggestRebuild?`Zachowane ${biggestRebuild.retained}/${biggestRebuild.base} kart między kolejnymi występami.`:'Za mało zapisanych decków'},
      {key:'strongestCore',label:'Najtrwalszy rdzeń składu',value:strongestCore?`D${strongestCore.before.draftId} → D${strongestCore.after.draftId}`:'Brak danych',sub:strongestCore?`Zachowane ${strongestCore.retained}/${strongestCore.base} kart między kolejnymi występami.`:'Za mało zapisanych decków'}
    ];
    return {signatureDeck,totalDeckSlots,uniqueCards,diversityShare,mostCommonFinish,loyalty,biggestRebuild,strongestCore,deckAverages,curiosities};
  }

  function calculatePlayerCareerCuriosities(drafts, playerName, historyInput, streaksInput){
    const name=normalizeName(playerName);
    const finished=getFinishedDraftsChronologically(drafts);
    const history=(Array.isArray(historyInput)?historyInput:calculatePlayerHistory(finished,name)).slice().sort((a,b)=>numberOrZero(a?.draftId)-numberOrZero(b?.draftId));
    const streaks=streaksInput&&typeof streaksInput==='object'?streaksInput:calculatePlayerStreaks(finished,name);
    const byDraftId=new Map(finished.map((draft,index)=>[numberOrZero(draft?.id),{draft,index}]));

    const lossPeak=history.slice().sort((a,b)=>
      numberOrZero(b?.lossPoints)-numberOrZero(a?.lossPoints) ||
      numberOrZero(b?.points)-numberOrZero(a?.points) ||
      numberOrZero(b?.draftId)-numberOrZero(a?.draftId)
    )[0] || null;

    let championWins=0;
    const champions=new Set();
    finished.forEach(draft=>{
      if(!getPlayerDraftEntry(draft,name)) return;
      const champion=normalizeName(getDraftWinner(draft));
      if(!champion || champion===name) return;
      (Array.isArray(draft?.matches)?draft.matches:[]).forEach(match=>{
        const p1=normalizeName(match?.p1);
        const p2=normalizeName(match?.p2);
        if(!((p1===name&&p2===champion)||(p2===name&&p1===champion))) return;
        if(getMatchType(match,draft)!==MATCH_TYPES.PLAYED) return;
        if(getPlayerOutcome(match,draft,name)==='win'){
          championWins++;
          champions.add(champion);
        }
      });
    });

    let longestReturn=null;
    for(let index=1; index<history.length; index++){
      const before=history[index-1];
      const after=history[index];
      const beforeMeta=byDraftId.get(numberOrZero(before?.draftId));
      const afterMeta=byDraftId.get(numberOrZero(after?.draftId));
      if(!beforeMeta||!afterMeta) continue;
      const skipped=Math.max(0,afterMeta.index-beforeMeta.index-1);
      const row={beforeDraftId:before.draftId,afterDraftId:after.draftId,skipped};
      if(!longestReturn || skipped>longestReturn.skipped || (skipped===longestReturn.skipped&&numberOrZero(after.draftId)>numberOrZero(longestReturn.afterDraftId))){
        longestReturn=row;
      }
    }

    const attendance=streaks?.consecutiveDraftAppearances||{length:0,startDraftId:null,endDraftId:null};
    return [
      {
        key:'lossPointsPeak',
        label:'Najwięcej punktów z porażek',
        value:lossPeak?`${numberOrZero(lossPeak.lossPoints)} pkt · D${lossPeak.draftId}`:'Brak danych',
        sub:lossPeak?`${lossPeak.losses} porażek · ${lossPeak.points} pkt łącznie w tej edycji`:'Brak ukończonych edycji'
      },
      {
        key:'championSlayer',
        label:'Pogromca późniejszych mistrzów',
        value:`${championWins} ${championWins===1?'zwycięstwo':'zwycięstw'}`,
        sub:championWins?(champions.size===1?'Przeciwko późniejszemu mistrzowi w edycji, którą ostatecznie wygrał.':`Przeciwko ${champions.size} różnym późniejszym mistrzom w edycjach, które ostatecznie wygrali.`):'Brak wygranej nad późniejszym mistrzem tej samej edycji.'
      },
      {
        key:'longestReturn',
        label:'Najdłuższy powrót',
        value:longestReturn&&longestReturn.skipped>0?`Po ${longestReturn.skipped} ${longestReturn.skipped===1?'edycji':'edycjach'} przerwy`:(history.length>1?'Bez pominiętej edycji':'Za mało występów'),
        sub:longestReturn&&longestReturn.skipped>0?`D${longestReturn.beforeDraftId} → D${longestReturn.afterDraftId}`:(history.length>1?'Kolejne zapisane występy następowały bez przerwy.':'Potrzebne co najmniej dwa występy.')
      },
      {
        key:'attendanceStreak',
        label:'Najdłuższa seria obecności',
        value:`${numberOrZero(attendance.length)} ${numberOrZero(attendance.length)===1?'draft':'draftów'} z rzędu`,
        sub:numberOrZero(attendance.length)?`D${attendance.startDraftId} → D${attendance.endDraftId}`:'Brak ukończonych występów'
      }
    ];
  }

  function calculatePlayerAchievements(drafts, playerName, limit){
    const name = normalizeName(playerName);
    const maxItems = Math.max(1,Number(limit) || 6);
    const finished = getFinishedDraftsChronologically(drafts);
    const history = calculatePlayerHistory(finished,name);
    if(!name || !history.length) return [];

    const byDraftId = new Map(finished.map(draft=>[numberOrZero(draft?.id),draft]));
    const achievements = [];

    history.forEach(item=>{
      const draft = byDraftId.get(numberOrZero(item.draftId));
      if(!draft) return;
      const place = Number(item.place);
      if(item.isWinner || place === 1){
        achievements.push({
          tier:0,draftId:item.draftId,cls:'title',
          title:`Mistrz Draftu ${item.draftId}`,
          sub:`#1 · ${item.points} pkt · ${item.wins}W–${item.losses}L`
        });
        return;
      }
      if(place === 2 || place === 3){
        achievements.push({
          tier:place === 2 ? 1 : 2,draftId:item.draftId,cls:'',
          title:`Podium Draftu ${item.draftId}`,
          sub:`#${place} · ${item.points} pkt · ${item.wins}W–${item.losses}L`
        });
        return;
      }

      // Poza podium badge dostaje tylko wynik wyróżniający gracza względem
      // całej stawki tej konkretnej edycji, nie jego prywatny personal best.
      const ranking = calculateDraftRanking(draft);
      const decided = ranking.filter(row=>(numberOrZero(row.wins)+numberOrZero(row.losses))>0);
      const self = ranking.find(row=>normalizeName(row.name) === name);
      if(!self || !decided.length) return;
      const maxWins = Math.max(...decided.map(row=>numberOrZero(row.wins)));
      const maxWinRate = Math.max(...decided.map(row=>calculateWinRate(numberOrZero(row.wins),numberOrZero(row.losses))));
      const selfWinRate = calculateWinRate(numberOrZero(self.wins),numberOrZero(self.losses));
      const leadsWins = numberOrZero(self.wins) === maxWins && maxWins > 0;
      const leadsWinRate = Math.abs(selfWinRate-maxWinRate) < 1e-12 && (numberOrZero(self.wins)+numberOrZero(self.losses))>0;

      if(leadsWins && leadsWinRate){
        achievements.push({
          tier:3,draftId:item.draftId,cls:'',
          title:`Lider skuteczności Draftu ${item.draftId}`,
          sub:`Najwięcej zwycięstw (${self.wins}) · najwyższy WR ${(selfWinRate*100).toFixed(1)}%`
        });
      }else if(leadsWins){
        achievements.push({
          tier:4,draftId:item.draftId,cls:'',
          title:`Najwięcej zwycięstw w Draft ${item.draftId}`,
          sub:`${self.wins} zwycięstw · ${item.points} pkt · #${item.place}`
        });
      }else if(leadsWinRate){
        achievements.push({
          tier:5,draftId:item.draftId,cls:'',
          title:`Najwyższy WR Draftu ${item.draftId}`,
          sub:`${(selfWinRate*100).toFixed(1)}% WR · ${item.wins}W–${item.losses}L · #${item.place}`
        });
      }else if(place === 4 || place === 5){
        achievements.push({
          tier:6,draftId:item.draftId,cls:'',
          title:`Top 5 Draftu ${item.draftId}`,
          sub:`#${place} · ${item.points} pkt · ${item.wins}W–${item.losses}L`
        });
      }
    });

    const uniqueByDraft = new Map();
    achievements
      .sort((a,b)=>a.tier-b.tier || numberOrZero(b.draftId)-numberOrZero(a.draftId))
      .forEach(item=>{ if(!uniqueByDraft.has(item.draftId)) uniqueByDraft.set(item.draftId,item); });
    const selected = [...uniqueByDraft.values()].slice(0,maxItems);

    // Jeżeli gracz nigdy nie zdobył podium ani nie prowadził żadnej edycji w
    // realnej statystyce stawki, pokaż maksymalnie jeden uczciwy fallback:
    // najmocniejszy występ kariery, jasno opisany jako występ, nie rekord.
    if(!selected.length){
      const best = calculatePlayerTopPerformances(finished,name,1)[0];
      if(best){
        selected.push({
          tier:9,draftId:best.draftId,cls:'',
          title:`Najmocniejszy występ kariery · Draft ${best.draftId}`,
          sub:`#${best.place} · ${best.points} pkt · ${best.wins}W–${best.losses}L`
        });
      }
    }
    return selected;
  }

  function calculatePlayerDna(drafts, playerName, options){
    const name=normalizeName(playerName);
    const cards=Array.isArray(options?.cards)?options.cards:[];
    const tags=options?.tags&&typeof options.tags==='object'?options.tags:{};
    const tagIndex=buildTagDefinitionIndex(tags);
    const cardByName=new Map(cards.map(card=>[normalizeName(card?.name),card]).filter(([cardName])=>cardName));
    const minimumSynergyCards=DECK_ARCHETYPE_MIN_CARDS;

    const empty={
      summary:{totalDecks:0,totalCardAppearances:0,championDecks:0,minimumSynergyCards},
      selection:{abilityTypes:[],mechanics:[],deckArchetypes:[]},
      builtSynergies:{mechanics:[],deckArchetypes:[]},
      championSynergies:{mechanics:[],deckArchetypes:[]},
      records:{archetypeCohesion:null,mechanicCohesion:null},
      comparison:{globalDecks:0,signature:[]}
    };
    if(!name||!cards.length||!Object.keys(tagIndex.byId).length) return empty;

    const finished=getFinishedDraftsChronologically(drafts);
    const tagName=id=>normalizeName(tagIndex.byId[id]?.name)||id;
    const inc=(map,key,amount=1)=>{ if(key) map.set(key,numberOrZero(map.get(key))+numberOrZero(amount)); };
    const selection={abilityTypes:new Map(),mechanics:new Map(),deckArchetypes:new Map()};
    const builtMechanics=new Map(),builtArchetypes=new Map();
    const championMechanics=new Map(),championArchetypes=new Map();
    const globalMechanics=new Map(),globalArchetypes=new Map();
    const recordMechanics=[],recordArchetypes=[];
    let totalDecks=0,totalCardAppearances=0,championDecks=0,globalDecks=0;

    function countDeckTags(deck, countSelections){
      const mechanics=new Map(),archetypes=new Map();
      (Array.isArray(deck)?deck:[]).forEach(cardNameRaw=>{
        const cardName=normalizeName(cardNameRaw);
        if(!cardName) return;
        const card=cardByName.get(cardName);
        if(countSelections) totalCardAppearances++;
        (Array.isArray(card?.tags)?card.tags:[]).forEach(tagIdRaw=>{
          const tagId=normalizeName(tagIdRaw);
          const category=tagIndex.categoryById[tagId];
          if(category==='abilityTypes'&&countSelections) inc(selection.abilityTypes,tagId);
          if(category==='mechanicFamilies'||category==='subtypes'){
            inc(mechanics,tagId);
            if(countSelections) inc(selection.mechanics,tagId);
          }
          if(category==='deckArchetypes'){
            inc(archetypes,tagId);
            if(countSelections) inc(selection.deckArchetypes,tagId);
          }
        });
      });
      return {mechanics,archetypes};
    }

    function ensureSynergy(map,id){
      if(!map.has(id)) map.set(id,{id,name:tagName(id),category:tagIndex.categoryById[id]||null,decks:0,cardSlots:0,maxCards:0,draftIds:new Set()});
      return map.get(id);
    }
    function addSynergies(countMap,targetMap,draftId){
      countMap.forEach((count,id)=>{
        if(count<minimumSynergyCards) return;
        const row=ensureSynergy(targetMap,id);
        row.decks++;
        row.cardSlots+=count;
        row.maxCards=Math.max(row.maxCards,count);
        row.draftIds.add(draftId);
      });
    }
    function addGlobalSynergies(countMap,targetMap){
      countMap.forEach((count,id)=>{ if(count>=minimumSynergyCards) inc(targetMap,id); });
    }

    // Global denominator for "Na tle Galaktyki": every finished player deck.
    finished.forEach(draft=>{
      (Array.isArray(draft?.players)?draft.players:[]).forEach(player=>{
        const deck=getPlayerDeckCards(player).map(normalizeName).filter(Boolean);
        if(!deck.length) return;
        globalDecks++;
        const counts=countDeckTags(deck,false);
        addGlobalSynergies(counts.mechanics,globalMechanics);
        addGlobalSynergies(counts.archetypes,globalArchetypes);
      });
    });

    finished.forEach(draft=>{
      const player=(Array.isArray(draft?.players)?draft.players:[]).find(row=>normalizeName(row?.name)===name);
      if(!player) return;
      const deck=getPlayerDeckCards(player).map(normalizeName).filter(Boolean);
      if(!deck.length) return;
      const ranking=getDraftLegendOrder(draft);
      const placeIndex=ranking.findIndex(row=>normalizeName(row?.name)===name);
      const place=placeIndex>=0?placeIndex+1:null;
      const isChampion=place===1;
      totalDecks++;
      if(isChampion) championDecks++;
      const counts=countDeckTags(deck,true);
      const draftId=numberOrZero(draft?.id);
      addSynergies(counts.mechanics,builtMechanics,draftId);
      addSynergies(counts.archetypes,builtArchetypes,draftId);
      if(isChampion){
        addSynergies(counts.mechanics,championMechanics,draftId);
        addSynergies(counts.archetypes,championArchetypes,draftId);
      }
      counts.mechanics.forEach((count,id)=>{
        if(count>=minimumSynergyCards) recordMechanics.push({id,name:tagName(id),category:tagIndex.categoryById[id]||null,count,draftId,place,deckSize:deck.length});
      });
      counts.archetypes.forEach((count,id)=>{
        if(count>=minimumSynergyCards) recordArchetypes.push({id,name:tagName(id),category:'deckArchetypes',count,draftId,place,deckSize:deck.length});
      });
    });

    function selectionRows(map,limit=5){
      return [...map.entries()].map(([id,occurrences])=>({
        id,name:tagName(id),category:tagIndex.categoryById[id]||null,
        occurrences,share:totalCardAppearances?occurrences/totalCardAppearances:0
      })).sort((a,b)=>b.occurrences-a.occurrences||compareLocale(a.name,b.name)).slice(0,limit);
    }
    function synergyRows(map,total,limit=5){
      const rows=[...map.values()].map(row=>({
        id:row.id,name:row.name,category:row.category,decks:row.decks,
        deckShare:total?row.decks/total:0,
        averageCards:row.decks?row.cardSlots/row.decks:0,
        maxCards:row.maxCards,drafts:row.draftIds.size,draftIds:[...row.draftIds].sort((a,b)=>a-b)
      })).sort((a,b)=>b.decks-a.decks||b.maxCards-a.maxCards||b.averageCards-a.averageCards||compareLocale(a.name,b.name));
      return limit===null||limit===undefined ? rows : rows.slice(0,Number(limit));
    }
    function bestRecord(rows){
      return (rows||[]).slice().sort((a,b)=>b.count-a.count||numberOrZero(a.place)-numberOrZero(b.place)||b.draftId-a.draftId||compareLocale(a.name,b.name))[0]||null;
    }

    const allBuiltMechanicRows=synergyRows(builtMechanics,totalDecks,null);
    const allBuiltArchetypeRows=synergyRows(builtArchetypes,totalDecks,null);
    const builtMechanicRows=allBuiltMechanicRows.slice(0,6);
    const builtArchetypeRows=allBuiltArchetypeRows.slice(0,6);
    const championMechanicRows=synergyRows(championMechanics,championDecks,4);
    const championArchetypeRows=synergyRows(championArchetypes,championDecks,4);

    const comparisonCandidates=[...allBuiltMechanicRows,...allBuiltArchetypeRows].map(row=>{
      const globalMap=row.category==='deckArchetypes'?globalArchetypes:globalMechanics;
      const globalCount=numberOrZero(globalMap.get(row.id));
      const globalShare=globalDecks?globalCount/globalDecks:0;
      return {...row,globalDecks:globalCount,globalShare,delta:row.deckShare-globalShare};
    }).sort((a,b)=>b.delta-a.delta||b.deckShare-a.deckShare||b.decks-a.decks||compareLocale(a.name,b.name));
    let signature=comparisonCandidates.filter(row=>row.delta>0).slice(0,3);
    if(signature.length<3){
      const used=new Set(signature.map(row=>row.id));
      signature=signature.concat(comparisonCandidates.filter(row=>!used.has(row.id)).slice(0,3-signature.length));
    }

    return {
      summary:{totalDecks,totalCardAppearances,championDecks,minimumSynergyCards},
      selection:{
        abilityTypes:selectionRows(selection.abilityTypes,5),
        mechanics:selectionRows(selection.mechanics,5),
        deckArchetypes:selectionRows(selection.deckArchetypes,5)
      },
      builtSynergies:{mechanics:builtMechanicRows,deckArchetypes:builtArchetypeRows},
      championSynergies:{mechanics:championMechanicRows,deckArchetypes:championArchetypeRows},
      records:{archetypeCohesion:bestRecord(recordArchetypes),mechanicCohesion:bestRecord(recordMechanics)},
      comparison:{globalDecks,signature}
    };
  }

  function calculatePlayerProfile(drafts, playerName, options){
    const name = normalizeName(playerName);
    const summary = calculatePlayerSummary(drafts,name);
    if(!summary) return null;
    const rivalryMinimum = Number(options?.rivalryMinimum) || SAMPLE_THRESHOLDS.PLAYER_RIVALRY_MATCHES;
    const history=calculatePlayerHistory(drafts,name);
    const cardContributions=calculatePlayerCardContributions(drafts,name);
    const streaks=calculatePlayerStreaks(drafts,name);
    const deckProfile=calculatePlayerDeckProfile(history,cardContributions,options?.cards);
    const careerCuriosities=calculatePlayerCareerCuriosities(drafts,name,history,streaks);
    return {
      name,
      summary,
      anatomy:calculatePlayerAnatomy(summary),
      dynamics:calculatePlayerDynamics(history),
      performanceSpectrum:calculatePlayerPerformanceSpectrum(history,3),
      topPerformances:calculatePlayerTopPerformances(drafts,name,3),
      records:calculatePlayerRecords(drafts,name),
      rivalries:calculatePlayerRivalries(drafts,name,rivalryMinimum),
      battle:calculatePlayerBattleStats(drafts,name),
      streaks,
      history,
      achievements:calculatePlayerAchievements(drafts,name,6),
      cardContributions,
      cardHighlights:calculatePlayerCardHighlights(cardContributions),
      deckProfile,
      dna:(Array.isArray(options?.cards)&&options?.tags)?calculatePlayerDna(drafts,name,{cards:options.cards,tags:options.tags}):null,
      curiosities:{
        deck:deckProfile.curiosities,
        career:careerCuriosities
      }
    };
  }

  function buildTagDefinitionIndex(tagsInput){
    const source = tagsInput && typeof tagsInput === 'object' ? tagsInput : {};
    const byId = {};
    const categoryById = {};
    const duplicateIds = [];
    Object.keys(source).forEach(category=>{
      const entries = Array.isArray(source[category]) ? source[category] : [];
      entries.forEach(entry=>{
        const id = normalizeName(entry?.id);
        if(!id) return;
        if(hasOwn(byId,id)) duplicateIds.push(id);
        byId[id] = entry;
        categoryById[id] = category;
      });
    });
    return {byId,categoryById,duplicateIds:[...new Set(duplicateIds)]};
  }

  function normalizeDatabaseValidationInput(draftsOrOptions, cardsArg, tagsArg){
    if(draftsOrOptions && !Array.isArray(draftsOrOptions) && typeof draftsOrOptions === 'object' && hasOwn(draftsOrOptions,'drafts')){
      return {
        drafts:Array.isArray(draftsOrOptions.drafts) ? draftsOrOptions.drafts : [],
        cards:Array.isArray(draftsOrOptions.cards) ? draftsOrOptions.cards : [],
        tags:draftsOrOptions.tags && typeof draftsOrOptions.tags === 'object' ? draftsOrOptions.tags : {}
      };
    }
    return {
      drafts:Array.isArray(draftsOrOptions) ? draftsOrOptions : [],
      cards:Array.isArray(cardsArg) ? cardsArg : [],
      tags:tagsArg && typeof tagsArg === 'object' ? tagsArg : {}
    };
  }

  function validateDatabase(draftsOrOptions, cardsArg, tagsArg){
    const {drafts,cards,tags} = normalizeDatabaseValidationInput(draftsOrOptions,cardsArg,tagsArg);
    const issues = [];
    const pushIssue = (severity,code,details)=>issues.push({severity,code,...(details || {})});
    const seenDraftIds = new Set();
    const dateFormats = new Set();

    drafts.forEach((draft,index)=>{
      const id = draft?.id;
      if(seenDraftIds.has(id)) pushIssue('error','duplicateDraftId',{draftId:id,index});
      seenDraftIds.add(id);
      const validation = validateDraft(draft);
      validation.warnings.forEach(warning=>pushIssue('warning',`draft.${warning.code}`,{draftId:id,...warning}));

      const startDate = normalizeName(draft?.startDate);
      if(startDate){
        if(/^\d{4}-\d{2}-\d{2}$/.test(startDate)) dateFormats.add('iso');
        else if(/^\d{2}\.\d{2}\.\d{4}$/.test(startDate)) dateFormats.add('dmy');
        else dateFormats.add('other');
      }

      (Array.isArray(draft?.matches) ? draft.matches : []).forEach((match,matchIndex)=>{
        if(getScoringSystem(draft) === 'standard25' && getMatchType(match,draft) === MATCH_TYPES.PLAYED &&
          isFinitePointValue(match?.pts1) && isFinitePointValue(match?.pts2)){
          const pts1 = Number(match.pts1);
          const pts2 = Number(match.pts2);
          if(!isValidStandard25Score(match)){
            pushIssue('error','invalidStandard25PlayedScore',{draftId:id,matchIndex,pts1,pts2});
          }
        }
      });
    });

    if(dateFormats.size > 1) pushIssue('warning','mixedDateFormats',{formats:[...dateFormats]});

    const cardByName = {};
    const duplicateCardNames = [];
    cards.forEach((card,index)=>{
      const name = normalizeName(card?.name);
      if(!name) return;
      if(hasOwn(cardByName,name)) duplicateCardNames.push(name);
      cardByName[name] = card;
      if(Array.isArray(card?.tags)){
        const duplicateTags = card.tags.filter((tag,tagIndex)=>card.tags.indexOf(tag) !== tagIndex);
        if(duplicateTags.length) pushIssue('warning','duplicateCardTag',{card:name,tags:[...new Set(duplicateTags)]});
      }
    });
    [...new Set(duplicateCardNames)].forEach(name=>pushIssue('error','duplicateCardName',{card:name}));

    const tagIndex = buildTagDefinitionIndex(tags);
    tagIndex.duplicateIds.forEach(id=>pushIssue('error','duplicateTagId',{tagId:id}));

    if(cards.length && Object.keys(tagIndex.byId).length){
      cards.forEach(card=>{
        const name = normalizeName(card?.name);
        (Array.isArray(card?.tags) ? card.tags : []).forEach(tagId=>{
          if(!hasOwn(tagIndex.byId,tagId)) pushIssue('warning','unknownCardTag',{card:name,tagId});
        });
      });
    }

    drafts.forEach(draft=>{
      (Array.isArray(draft?.players) ? draft.players : []).forEach(player=>{
        const deck = Array.isArray(player?.deck) ? player.deck : [];
        if(deck.length !== 12) pushIssue('warning','unexpectedDeckSize',{draftId:draft?.id,player:normalizeName(player?.name),size:deck.length});
        const normalizedDeck = deck.map(normalizeName).filter(Boolean);
        const duplicateCards = normalizedDeck.filter((name,index)=>normalizedDeck.indexOf(name) !== index);
        if(duplicateCards.length) pushIssue('warning','duplicateCardInDeck',{draftId:draft?.id,player:normalizeName(player?.name),cards:[...new Set(duplicateCards)]});
        if(cards.length){
          normalizedDeck.forEach(cardName=>{
            if(!hasOwn(cardByName,cardName)) pushIssue('warning','unknownDeckCard',{draftId:draft?.id,player:normalizeName(player?.name),card:cardName});
          });
        }
        if(Object.prototype.hasOwnProperty.call(player||{},'sideboard')){
          const sideboard=getSideboardCards(player);
          if(sideboard.length!==3) pushIssue('warning','unexpectedSideboardSize',{draftId:draft?.id,player:normalizeName(player?.name),size:sideboard.length});
          const normalizedSideboard=sideboard.map(normalizeName).filter(Boolean);
          const duplicateSideboard=normalizedSideboard.filter((name,index)=>normalizedSideboard.indexOf(name)!==index);
          if(duplicateSideboard.length) pushIssue('warning','duplicateCardInSideboard',{draftId:draft?.id,player:normalizeName(player?.name),cards:[...new Set(duplicateSideboard)]});
          const overlap=normalizedSideboard.filter(cardName=>normalizedDeck.includes(cardName));
          if(overlap.length) pushIssue('warning','sideboardMainDeckOverlap',{draftId:draft?.id,player:normalizeName(player?.name),cards:[...new Set(overlap)]});
          if(cards.length){
            normalizedSideboard.forEach(cardName=>{
              if(!hasOwn(cardByName,cardName)) pushIssue('warning','unknownSideboardCard',{draftId:draft?.id,player:normalizeName(player?.name),card:cardName});
            });
          }
        }
      });
    });

    const counts = issues.reduce((acc,issue)=>{
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    },{error:0,warning:0,info:0});

    return {
      valid:counts.error === 0,
      counts,
      issues,
      totals:{
        drafts:drafts.length,
        finishedDrafts:drafts.filter(isDraftFinished).length,
        activeDrafts:drafts.filter(draft=>!isDraftFinished(draft)).length,
        cards:cards.length,
        tags:Object.keys(tagIndex.byId).length
      }
    };
  }

  function createStatsContext(options){
    const source = options && typeof options === 'object' ? options : {};
    const drafts = Array.isArray(source.drafts) ? source.drafts : [];
    const cards = Array.isArray(source.cards) ? source.cards : [];
    const tags = source.tags && typeof source.tags === 'object' ? source.tags : {};
    const finishedDrafts = getFinishedDraftsChronologically(drafts);
    const activeDrafts = drafts.filter(draft=>!isDraftFinished(draft)).slice().sort((a,b)=>numberOrZero(a?.id)-numberOrZero(b?.id));
    const draftById = {};
    const playerDraftsByName = {};
    const playerNames = new Set();
    const cardByName = {};
    const deckAppearancesByCard = {};

    drafts.forEach(draft=>{
      draftById[draft?.id] = draft;
      (Array.isArray(draft?.players) ? draft.players : []).forEach(player=>{
        const name = normalizeName(player?.name);
        if(!name) return;
        playerNames.add(name);
        if(!playerDraftsByName[name]) playerDraftsByName[name] = [];
        playerDraftsByName[name].push(draft);
        getMainDeckCards(player).forEach(cardNameRaw=>{
          const cardName = normalizeName(cardNameRaw);
          if(!cardName) return;
          if(!deckAppearancesByCard[cardName]) deckAppearancesByCard[cardName] = [];
          deckAppearancesByCard[cardName].push({draftId:numberOrZero(draft?.id),player:name,finished:isDraftFinished(draft),zone:'MAIN_DECK'});
        });
        getSideboardCards(player).forEach(cardNameRaw=>{
          const cardName=normalizeName(cardNameRaw);
          if(!cardName) return;
          if(!deckAppearancesByCard[cardName]) deckAppearancesByCard[cardName]=[];
          deckAppearancesByCard[cardName].push({draftId:numberOrZero(draft?.id),player:name,finished:isDraftFinished(draft),zone:'SIDEBOARD'});
        });
      });
    });
    Object.keys(playerDraftsByName).forEach(name=>playerDraftsByName[name].sort((a,b)=>numberOrZero(a?.id)-numberOrZero(b?.id)));
    cards.forEach(card=>{ const name = normalizeName(card?.name); if(name) cardByName[name] = card; });
    const tagIndex = buildTagDefinitionIndex(tags);
    const legendStandings = calculateLegendStandings(drafts);
    const playerProfileCache = new Map();
    let validationCache = null;
    let archiveSnapshotCache = null;

    function playerCacheKey(name,profileOptions){
      const minimum = Number(profileOptions?.rivalryMinimum) || SAMPLE_THRESHOLDS.PLAYER_RIVALRY_MATCHES;
      return `${normalizeName(name)}::${minimum}`;
    }

    const context = {
      drafts,
      finishedDrafts,
      activeDrafts,
      cards,
      tags,
      legendStandings,
      indexes:Object.freeze({
        draftById,
        playerDraftsByName,
        playerNames:[...playerNames].sort((a,b)=>a.localeCompare(b,'pl')),
        cardByName,
        deckAppearancesByCard,
        tagById:tagIndex.byId,
        tagCategoryById:tagIndex.categoryById
      }),
      getDraft(id){ return draftById[id] || null; },
      getPlayerNames(){ return [...context.indexes.playerNames]; },
      getPlayerSummary(name){ return calculatePlayerSummary(drafts,name); },
      getPlayerProfile(name,profileOptions){
        const key = playerCacheKey(name,profileOptions);
        if(!playerProfileCache.has(key)) playerProfileCache.set(key,calculatePlayerProfile(drafts,name,profileOptions));
        return playerProfileCache.get(key);
      },
      getPlayerHistory(name){ return calculatePlayerHistory(drafts,name); },
      getPlayerRivalries(name,minimum){ return calculatePlayerRivalries(drafts,name,minimum); },
      getPlayerBattleStats(name){ return calculatePlayerBattleStats(drafts,name); },
      getPlayerMatchBreakdown(name){ return calculatePlayerMatchBreakdown(drafts,name); },
      getCardMetadata(name){ return cardByName[normalizeName(name)] || null; },
      getCardDeckAppearances(name){ return (deckAppearancesByCard[normalizeName(name)] || []).slice(); },
      getTagDefinition(id){ return tagIndex.byId[normalizeName(id)] || null; },
      getTagCategory(id){ return tagIndex.categoryById[normalizeName(id)] || null; },
      getArchiveSnapshot(){
        if(!archiveSnapshotCache) archiveSnapshotCache = buildArchiveSnapshot({drafts,cards,tags});
        return archiveSnapshotCache;
      },
      validate(){
        if(!validationCache) validationCache = validateDatabase({drafts,cards,tags});
        return validationCache;
      },
      clearCaches(){ playerProfileCache.clear(); validationCache = null; archiveSnapshotCache = null; }
    };
    return Object.freeze(context);
  }

  function compareLocale(first,second){
    return normalizeName(first).localeCompare(normalizeName(second),'pl');
  }

  function average(values){
    const valid = (Array.isArray(values) ? values : []).map(Number).filter(Number.isFinite);
    return valid.length ? valid.reduce((sum,value)=>sum+value,0) / valid.length : 0;
  }

  function standardDeviation(values){
    const valid = (Array.isArray(values) ? values : []).map(Number).filter(Number.isFinite);
    if(!valid.length) return null;
    const mean = average(valid);
    return Math.sqrt(valid.reduce((sum,value)=>sum+Math.pow(value-mean,2),0)/valid.length);
  }

  function rankArchiveTop(items, valueGetter, direction, limit){
    const getValue = typeof valueGetter === 'function' ? valueGetter : item=>numberOrZero(item?.value);
    const factor = direction === 'asc' ? 1 : -1;
    const ordered = (Array.isArray(items) ? items : [])
      .filter(Boolean)
      .slice()
      .sort((first,second)=>{
        const valueOrder = (numberOrZero(getValue(first))-numberOrZero(getValue(second))) * factor;
        if(valueOrder) return valueOrder;
        const firstRank = Number.isFinite(Number(first?.legendRank)) ? Number(first.legendRank) : Number.MAX_SAFE_INTEGER;
        const secondRank = Number.isFinite(Number(second?.legendRank)) ? Number(second.legendRank) : Number.MAX_SAFE_INTEGER;
        return firstRank-secondRank ||
          numberOrZero(second?.legendPoints)-numberOrZero(first?.legendPoints) ||
          numberOrZero(second?.draftPoints)-numberOrZero(first?.draftPoints) ||
          compareLocale(first?.name || first?.label,second?.name || second?.label);
      });
    const places = Math.max(1,Number(limit) || 3);
    let currentPlace = 0;
    let previousValue = null;
    return ordered.map((item,index)=>{
      const value = numberOrZero(getValue(item));
      if(index === 0 || value !== previousValue) currentPlace = index + 1;
      previousValue = value;
      return {...item,statPlace:currentPlace};
    }).filter(item=>item.statPlace <= places);
  }

  function getDraftBanCards(draft){
    const bans = draft?.draftConfigV2?.specialSettings?.poolRules?.bans;
    if(!bans?.enabled || !Array.isArray(bans.cards)) return [];
    return bans.cards
      .map(item=>{
        if(typeof item === 'string') return normalizeName(item);
        if(item && typeof item === 'object') return normalizeName(item.name || item.card || item.label);
        return '';
      })
      .filter(Boolean);
  }

  function calculateBanRanking(drafts, options){
    const limit = Math.max(1,numberOrZero(options?.limit) || 10);
    const excluded = new Set((Array.isArray(options?.excludedNames) ? options.excludedNames : [])
      .map(normalizeName)
      .filter(Boolean));
    const counts = new Map();

    getFinishedDraftsChronologically(drafts).forEach(draft=>{
      const uniqueBans = new Set(getDraftBanCards(draft));
      uniqueBans.forEach(name=>{
        if(excluded.has(name)) return;
        counts.set(name,(counts.get(name) || 0) + 1);
      });
    });

    return [...counts.entries()]
      .map(([name,bans])=>({name,bans}))
      .sort((a,b)=>b.bans-a.bans || compareLocale(a.name,b.name))
      .slice(0,limit);
  }

  function buildArchiveSnapshot(options){
    const source = options && typeof options === 'object' ? options : {};
    const drafts = Array.isArray(source.drafts) ? source.drafts : [];
    const cards = Array.isArray(source.cards) ? source.cards : [];
    const context = createStatsContext({drafts,cards,tags:source.tags || {}});
    const finishedDrafts = context.finishedDrafts;
    const finishedWithMatches = finishedDrafts.filter(draft=>(draft?.matches || []).length);
    const startOrderCoverage = finishedWithMatches.length
      ? finishedWithMatches.filter(draft=>Array.isArray(draft?.startOrder) && draft.startOrder.length).length / finishedWithMatches.length
      : 0;
    const reliableMatchOrder = startOrderCoverage === 1;
    const cardMetaByName = {};
    cards.forEach(card=>{
      const name = normalizeName(card?.name);
      if(name) cardMetaByName[name] = card;
    });

    const tagIndex = buildTagDefinitionIndex(source.tags || {});
    const tagNameById = {};
    const archetypeNameById = {};
    Object.keys(tagIndex.byId).forEach(tagId=>{
      tagNameById[tagId] = normalizeName(tagIndex.byId[tagId]?.name) || tagId;
      if(tagIndex.categoryById[tagId] !== 'deckArchetypes') return;
      archetypeNameById[tagId] = tagNameById[tagId];
    });

    // GALACTIC DNA: global tag telemetry is Engine-owned. Every card occurrence
    // in every finished player deck (Main Deck + Planetary Reserve) counts once.
    // No per-draft/per-player deduplication is applied to this layer.
    const dnaSelectionCounts = {abilityTypes:{},mechanics:{},deckArchetypes:{}};
    const mechanicMeta = {};
    let dnaCardAppearances = 0;
    let dnaDecks = 0;
    let dnaChampionDecks = 0;

    function incrementCounter(map,key,amount=1){
      if(!key) return;
      map[key] = numberOrZero(map[key]) + numberOrZero(amount);
    }

    function ensureMechanicMeta(tagId){
      if(!mechanicMeta[tagId]){
        mechanicMeta[tagId] = {
          id:tagId,
          name:tagNameById[tagId] || tagId,
          category:tagIndex.categoryById[tagId] || null,
          decks:0,
          championDecks:0,
          cardSlots:0,
          draftIds:new Set(),
          players:new Set(),
          maxConcentration:0
        };
      }
      return mechanicMeta[tagId];
    }

    const deckMetaRows = [];
    const archetypeMeta = {};

    function ensureArchetypeMeta(tagId){
      if(!archetypeMeta[tagId]){
        archetypeMeta[tagId] = {
          id:tagId,
          name:archetypeNameById[tagId] || tagId,
          decks:0,
          championDecks:0,
          cardSlots:0,
          sideboardSlots:0,
          draftedSlots:0,
          draftIds:new Set(),
          players:new Set(),
          maxConcentration:0
        };
      }
      return archetypeMeta[tagId];
    }

    const playerNames = new Set();
    const deckCardNames = new Set();
    const cardMap = {};
    const cardPairMap = {};
    const h2hMap = {};
    const playerBattleMargins = {};
    const timeline = [];
    const draftRows = [];
    const global = {
      drafts:drafts.length,
      finishedDrafts:finishedDrafts.length,
      activeDrafts:drafts.length-finishedDrafts.length,
      players:0,
      storedMatches:0,
      playedMatches:0,
      walkovers:0,
      doubleWalkovers:0,
      decks:0,
      deckCards:0,
      availableCards:cards.length,
      totalRecordedPoints:0
    };
    let biggestStomp = null;
    let closestBattle = null;

    function ensureCard(nameRaw){
      const name = normalizeName(nameRaw);
      if(!name) return null;
      if(!cardMap[name]){
        cardMap[name] = {
          name,
          cost:Number.isFinite(Number(cardMetaByName[name]?.cost)) ? Number(cardMetaByName[name].cost) : null,
          power:Number.isFinite(Number(cardMetaByName[name]?.power)) ? Number(cardMetaByName[name].power) : null,
          appearances:0,
          mainDeckAppearances:0,
          sideboardAppearances:0,
          draftIds:new Set(),
          owners:{},
          matches:0,
          wins:0,
          losses:0,
          draftWins:0,
          podiums:0,
          legendPoints:0,
          draftPoints:0,
          finishTotal:0,
          finishCount:0,
          partners:{}
        };
      }
      return cardMap[name];
    }

    function addCardOutcome(cardNames,outcome){
      (Array.isArray(cardNames) ? cardNames : []).forEach(cardName=>{
        const stat = ensureCard(cardName);
        if(!stat) return;
        stat.matches++;
        if(outcome === 'win') stat.wins++;
        if(outcome === 'loss') stat.losses++;
      });
    }

    drafts.forEach(draft=>{
      const draftId = numberOrZero(draft?.id);
      const finished = isDraftFinished(draft);
      const players = Array.isArray(draft?.players) ? draft.players : [];
      const matches = Array.isArray(draft?.matches) ? draft.matches : [];
      const deckByPlayer = {};
      const uniqueMainDeckCards = new Set();
      const uniqueDraftCards = new Set();
      let deckSlots = 0;
      let sideboardSlots = 0;

      players.forEach(player=>{
        const playerName = normalizeName(player?.name);
        if(!playerName) return;
        playerNames.add(playerName);
        global.decks++;
        const rawDeck = getMainDeckCards(player).map(normalizeName).filter(Boolean);
        const rawSideboard = getSideboardCards(player).map(normalizeName).filter(Boolean);
        const deck = [...new Set(rawDeck)];
        const sideboard=[...new Set(rawSideboard)];
        const playerDeck=[...new Set([...rawDeck,...rawSideboard])];
        // Slot totals retain the two structural zones, while every statistical card
        // aggregation uses the complete player deck (Main Deck + Sideboard).
        deckSlots += rawDeck.length;
        sideboardSlots += rawSideboard.length;
        deckByPlayer[playerName] = playerDeck;
        rawDeck.forEach(cardName=>uniqueMainDeckCards.add(cardName));
        [...rawDeck,...rawSideboard].forEach(cardName=>uniqueDraftCards.add(cardName));

        // Historical card records are frozen to FINISHED drafts only.
        if(finished){
          playerDeck.forEach(cardName=>{
            const stat = ensureCard(cardName);
            stat.appearances++;
            stat.draftIds.add(draftId);
            stat.owners[playerName] = numberOrZero(stat.owners[playerName])+1;
            deckCardNames.add(cardName);
          });
          deck.forEach(cardName=>{ ensureCard(cardName).mainDeckAppearances++; });
          sideboard.forEach(cardName=>{ ensureCard(cardName).sideboardAppearances++; });
          for(let first=0; first<playerDeck.length; first++){
            for(let second=first+1; second<playerDeck.length; second++){
              const names = [playerDeck[first],playerDeck[second]].sort((a,b)=>compareLocale(a,b));
              const key = names.join('::');
              if(!cardPairMap[key]) cardPairMap[key] = {cardA:names[0],cardB:names[1],decks:0,draftIds:new Set()};
              cardPairMap[key].decks++;
              cardPairMap[key].draftIds.add(draftId);
              const firstCard = ensureCard(names[0]);
              const secondCard = ensureCard(names[1]);
              firstCard.partners[names[1]] = numberOrZero(firstCard.partners[names[1]])+1;
              secondCard.partners[names[0]] = numberOrZero(secondCard.partners[names[0]])+1;
            }
          }
        }
      });

      matches.forEach(match=>{
        if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;
        global.storedMatches++;
        global.totalRecordedPoints += Number(match.pts1)+Number(match.pts2);
        const type = getMatchType(match,draft);
        if(type === MATCH_TYPES.PLAYED) global.playedMatches++;
        if(type === MATCH_TYPES.WALKOVER) global.walkovers++;
        if(type === MATCH_TYPES.DOUBLE_WALKOVER) global.doubleWalkovers++;
      });

      let ranking = [];
      let winner = null;
      let winnerMargin = null;
      let pointSpread = null;
      if(finished){
        ranking = getDraftLegendOrder(draft);
        winner = getDraftWinner(draft);
        if(ranking.length > 1) winnerMargin = numberOrZero(ranking[0]?.total)-numberOrZero(ranking[1]?.total);
        if(ranking.length){
          const totals = ranking.map(player=>numberOrZero(player?.total));
          pointSpread = Math.max(...totals)-Math.min(...totals);
        }
        const placeByName = {};
        const rankByName = {};
        ranking.forEach((player,index)=>{
          placeByName[player.name] = index+1;
          rankByName[player.name] = player;
        });

        // Historical DNA / deck analytics. Cost and Power are intentionally NOT used
        // because cards.js contains current, not historical, card parameters. Tags are
        // the canonical historical taxonomy available for every stored card occurrence.
        players.forEach(player=>{
          const playerName = normalizeName(player?.name);
          if(!playerName) return;
          const place = placeByName[playerName] || null;
          const rawMainDeck = getMainDeckCards(player).map(normalizeName).filter(Boolean);
          const rawSideboard = getSideboardCards(player).map(normalizeName).filter(Boolean);
          const rawDeck = [...rawMainDeck,...rawSideboard];
          const archetypeCounts = {};
          const mechanicCounts = {};

          dnaDecks++;
          if(place === 1) dnaChampionDecks++;

          rawDeck.forEach(cardName=>{
            dnaCardAppearances++;
            const card = cardMetaByName[cardName];
            (Array.isArray(card?.tags) ? card.tags : []).forEach(tagIdRaw=>{
              const tagId = normalizeName(tagIdRaw);
              const category = tagIndex.categoryById[tagId];
              if(category === 'abilityTypes') incrementCounter(dnaSelectionCounts.abilityTypes,tagId);
              if(category === 'mechanicFamilies' || category === 'subtypes'){
                incrementCounter(dnaSelectionCounts.mechanics,tagId);
                incrementCounter(mechanicCounts,tagId);
              }
              if(category === 'deckArchetypes'){
                incrementCounter(dnaSelectionCounts.deckArchetypes,tagId);
                incrementCounter(archetypeCounts,tagId);
              }
            });
          });

          const archetypes = Object.entries(archetypeCounts)
            .map(([id,count])=>({id,name:archetypeNameById[id] || id,category:'deckArchetypes',count}))
            .sort((a,b)=>b.count-a.count || compareLocale(a.name,b.name));
          const mechanics = Object.entries(mechanicCounts)
            .map(([id,count])=>({id,name:tagNameById[id] || id,category:tagIndex.categoryById[id] || null,count}))
            .sort((a,b)=>b.count-a.count || compareLocale(a.name,b.name));

          const represented = archetypes.filter(item=>item.count >= DECK_ARCHETYPE_MIN_CARDS);
          const representedMechanics = mechanics.filter(item=>item.count >= DECK_ARCHETYPE_MIN_CARDS);
          const primary = archetypes[0] || null;
          const primaryMechanic = mechanics[0] || null;

          const deckMetaRow = {
            draftId,
            player:playerName,
            name:playerName,
            place,
            isWinner:place === 1,
            deckSize:rawDeck.length,
            primaryArchetype:primary?.name || null,
            primaryArchetypeId:primary?.id || null,
            primaryCount:primary?.count || 0,
            primaryShare:rawDeck.length && primary ? primary.count/rawDeck.length : null,
            hybridArchetypeCount:represented.length,
            representedArchetypes:represented,
            primaryMechanic:primaryMechanic?.name || null,
            primaryMechanicId:primaryMechanic?.id || null,
            primaryMechanicCategory:primaryMechanic?.category || null,
            primaryMechanicCount:primaryMechanic?.count || 0,
            representedMechanics
          };
          deckMetaRows.push(deckMetaRow);

          represented.forEach(item=>{
            const meta = ensureArchetypeMeta(item.id);
            meta.decks++;
            if(place === 1) meta.championDecks++;
            meta.cardSlots += item.count;
            meta.draftedSlots += item.count;
            meta.maxConcentration = Math.max(meta.maxConcentration,item.count);
            meta.draftIds.add(draftId);
            meta.players.add(playerName);
          });

          representedMechanics.forEach(item=>{
            const meta = ensureMechanicMeta(item.id);
            meta.decks++;
            if(place === 1) meta.championDecks++;
            meta.cardSlots += item.count;
            meta.maxConcentration = Math.max(meta.maxConcentration,item.count);
            meta.draftIds.add(draftId);
            meta.players.add(playerName);
          });

          rawSideboard.forEach(cardName=>{
            const card=cardMetaByName[cardName];
            (Array.isArray(card?.tags)?card.tags:[]).forEach(tagIdRaw=>{
              const tagId=normalizeName(tagIdRaw);
              if(tagIndex.categoryById[tagId]!=='deckArchetypes') return;
              const meta=ensureArchetypeMeta(tagId);
              meta.sideboardSlots++;
            });
          });
        });

        players.forEach(player=>{
          const playerName = normalizeName(player?.name);
          const place = placeByName[playerName];
          const deck = deckByPlayer[playerName] || [];
          deck.forEach(cardName=>{
            const stat = ensureCard(cardName);
            if(place === 1) stat.draftWins++;
            if(place && place <= 3) stat.podiums++;
            stat.legendPoints += place ? numberOrZero(LEGEND_POINTS[place]) : 0;
            stat.draftPoints += numberOrZero(rankByName[playerName]?.total);
            if(place){
              stat.finishTotal += place;
              stat.finishCount++;
            }
          });
        });

        matches.forEach((match,index)=>{
          if(getMatchType(match,draft) !== MATCH_TYPES.PLAYED) return;
          if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)) return;
          const p1 = normalizeName(match?.p1);
          const p2 = normalizeName(match?.p2);
          const result = getMatchResult(match,draft);
          if(result.p1Outcome !== 'win' && result.p1Outcome !== 'loss') return;
          addCardOutcome(deckByPlayer[p1],result.p1Outcome);
          addCardOutcome(deckByPlayer[p2],result.p2Outcome);

          const pairNames = [p1,p2].sort((a,b)=>compareLocale(a,b));
          const h2hKey = pairNames.join('::');
          if(!h2hMap[h2hKey]) h2hMap[h2hKey] = {playerA:pairNames[0],playerB:pairNames[1],matches:0,winsA:0,winsB:0,draftIds:new Set()};
          const h2h = h2hMap[h2hKey];
          h2h.matches++;
          h2h.draftIds.add(draftId);
          if(result.winner === h2h.playerA) h2h.winsA++;
          if(result.winner === h2h.playerB) h2h.winsB++;

          const battle = getBattleResult(match,draft);
          if(!battle) return;
          const margin = battle.winnerPoints-battle.loserPoints;
          [p1,p2].forEach(playerName=>{
            if(!playerBattleMargins[playerName]) playerBattleMargins[playerName] = [];
            playerBattleMargins[playerName].push(margin);
          });
          const battleRow = {
            draftId,
            matchIndex:index,
            winner:battle.winner,
            loser:battle.loser,
            winnerPoints:battle.winnerPoints,
            loserPoints:battle.loserPoints,
            margin
          };
          if(!biggestStomp || margin > biggestStomp.margin) biggestStomp = battleRow;
          if(!closestBattle || margin < closestBattle.margin) closestBattle = battleRow;
        });
      }

      const cleanWins = matches.filter(match=>isCleanWin(match,draft)).length;
      const totalPoints = matches.reduce((sum,match)=>sum+numberOrZero(match?.pts1)+numberOrZero(match?.pts2),0);
      const battleRows = matches.map(match=>getBattleResult(match,draft)).filter(Boolean);
      const battleMargins = battleRows.map(battle=>battle.winnerPoints-battle.loserPoints);
      // PATCH 4: These percentage-style comparisons are strictly round-robin.
      // Tournament total includes BYE + phase bonuses and some players may play
      // an additional preliminary match. Comparing that total against a 25-point
      // match denominator produces impossible ratios and false draft records.
      // The ONE total Draft Points, score, podium, Legend Points and deck impact
      // still include the tournament bonuses everywhere else in this engine.
      const comparableRoundRobin=finished && !isTournamentDraft(draft) && supportsBattleLifeStats(draft);
      const playerEfficiencies = comparableRoundRobin
        ? ranking.map(player=>{
            const matchCount = numberOrZero(player?.matches);
            return matchCount ? numberOrZero(player?.total)/(matchCount*STAT_RULES.BATTLE_TOTAL_POINTS) : null;
          }).filter(Number.isFinite)
        : [];
      const efficiencyDispersion = standardDeviation(playerEfficiencies);
      const normalizedWinnerGap = comparableRoundRobin && ranking.length > 1
        ? Math.max(0,(numberOrZero(ranking[0]?.total)-numberOrZero(ranking[1]?.total))/
          (Math.max(1,numberOrZero(ranking[0]?.matches))*STAT_RULES.BATTLE_TOTAL_POINTS))
        : null;
      const normalizedPointSpread = comparableRoundRobin && ranking.length > 1
        ? Math.max(0,pointSpread /
          (Math.max(1,numberOrZero(ranking[0]?.matches))*STAT_RULES.BATTLE_TOTAL_POINTS))
        : null;
      const averagePlayerPoints = ranking.length
        ? average(ranking.map(player=>numberOrZero(player?.total)))
        : null;
      const playerDeckSlots = deckSlots+sideboardSlots;
      const repeatedDeckSlots = Math.max(0,playerDeckSlots-uniqueDraftCards.size);
      const row = {
        id:draftId,
        label:`D${draftId}`,
        startDate:draft?.startDate || null,
        endDate:draft?.endDate || null,
        mode:getDraftModeLabel(draft),
        status:finished ? DRAFT_STATUSES.FINISHED : DRAFT_STATUSES.ACTIVE,
        players:players.length,
        matches:matches.length,
        uniqueCards:uniqueDraftCards.size,
        mainDeckUniqueCards:uniqueMainDeckCards.size,
        draftedUniqueCards:uniqueDraftCards.size,
        deckSlots,
        sideboardSlots,
        playerDeckSlots,
        draftedSlots:playerDeckSlots,
        repeatedDeckSlots,
        diversityRate:playerDeckSlots ? uniqueDraftCards.size/playerDeckSlots : null,
        totalPoints,
        averagePlayerPoints,
        cleanWins,
        battleMatches:battleRows.length,
        brutalRate:battleRows.length ? battleRows.filter(battle=>battle.cleanWin).length/battleRows.length : null,
        nervousRate:battleRows.length ? battleRows.filter(battle=>battle.lastLifeWin).length/battleRows.length : null,
        averageBattleMargin:battleMargins.length ? average(battleMargins) : null,
        balanceIndex:efficiencyDispersion === null ? null : Math.max(0,100*(1-Math.min(1,efficiencyDispersion/.5))),
        normalizedWinnerGap,
        normalizedPointSpread,
        winner:finished ? winner : null,
        winnerMargin:finished ? winnerMargin : null,
        pointSpread:finished ? pointSpread : null
      };
      draftRows.push(row);
      timeline.push(row);
    });

    global.players = playerNames.size;
    global.deckCards = deckCardNames.size;

    const playerRows = [...playerNames].map(name=>{
      const profile = context.getPlayerProfile(name);
      if(!profile) return null;
      const summary = profile.summary;
      const history = profile.history || [];
      const debut = history[0] || null;
      const debutPercentile = debut ? calculateFinishPercentile(debut.place,debut.playerCount) : null;
      let biggestComeback = null;
      for(let index=1; index<history.length; index++){
        const before = history[index-1];
        const after = history[index];
        const beforePercentile = calculateFinishPercentile(before.place,before.playerCount);
        const afterPercentile = calculateFinishPercentile(after.place,after.playerCount);
        if(beforePercentile === null || afterPercentile === null) continue;
        const improvement = afterPercentile-beforePercentile;
        if(!biggestComeback || improvement > biggestComeback.improvement){
          biggestComeback = {
            fromDraftId:before.draftId,
            toDraftId:after.draftId,
            fromPlace:before.place,
            toPlace:after.place,
            improvement
          };
        }
      }
      const firstTitleIndex = history.findIndex(item=>item.isWinner);
      const finishPlaces = history.map(item=>Number(item?.place)).filter(Number.isFinite);
      const finishStdDev = standardDeviation(finishPlaces);
      const bestFinishPlace = finishPlaces.length ? Math.min(...finishPlaces) : null;
      const worstFinishPlace = finishPlaces.length ? Math.max(...finishPlaces) : null;
      const finishRange = finishPlaces.length ? worstFinishPlace-bestFinishPlace : null;
      let longestReturnGap = null;
      for(let index=1; index<history.length; index++){
        const fromDraftId = numberOrZero(history[index-1]?.draftId);
        const toDraftId = numberOrZero(history[index]?.draftId);
        const skippedDrafts = Math.max(0,toDraftId-fromDraftId-1);
        if(!longestReturnGap || skippedDrafts > longestReturnGap.skippedDrafts){
          longestReturnGap = {
            fromDraftId,
            toDraftId,
            skippedDrafts
          };
        }
      }
      return {
        name,
        drafts:summary.drafts,
        draftWins:summary.draftWins,
        podiums:summary.podiums,
        officialMatches:summary.officialMatches,
        officialWins:summary.wins,
        officialLosses:summary.losses,
        balance:summary.balance,
        playedMatches:summary.playedMatches,
        playedWins:summary.playedWins,
        playedLosses:summary.playedLosses,
        playedWinRate:summary.playedWinRate,
        winRate:summary.winRate,
        playedPoints:summary.playedPoints,
        cleanWins:profile.battle.cleanWins,
        winStreak:reliableMatchOrder ? profile.streaks.longestWinStreak.length : null,
        consecutiveDrafts:profile.streaks.consecutiveDraftAppearances.length,
        draftPoints:summary.draftPoints,
        averageDraftPoints:summary.averageDraftPoints,
        averagePlayedPoints:summary.averagePlayedPoints,
        averageFinish:summary.averageFinish,
        legendPoints:summary.legendPoints,
        legendRank:summary.legendRank,
        averageFinishPercentile:summary.averageFinishPercentile,
        finishStdDev,
        bestFinishPlace,
        worstFinishPlace,
        finishRange,
        longestReturnGap,
        titleRate:summary.titleRate,
        podiumRate:summary.podiumRate,
        debutDraftId:debut?.draftId || null,
        lastDraftId:history.length ? history[history.length-1]?.draftId || null : null,
        debutPlace:debut?.place || null,
        debutPercentile,
        debutWinRate:debut?.battle?.winRate ?? null,
        debutBattleMatches:debut?.battle?.eligibleMatches || 0,
        rookieChampion:Boolean(debut?.isWinner),
        draftsToFirstTitle:firstTitleIndex >= 0 ? firstTitleIndex+1 : null,
        comeback:biggestComeback,
        averageBattleMargin:average(playerBattleMargins[name] || []),
        closeBattleSample:(playerBattleMargins[name] || []).length,
        lossPoints:summary.lossPoints,
        walkovers:summary.walkoverMatches+summary.doubleWalkovers
      };
    }).filter(Boolean).filter(player=>player.drafts > 0);

    // One historical performance = one player in one finished draft.
    // This is the missing middle layer between career records and whole-event records.
    const performanceRows = [];
    finishedDrafts.forEach(draft=>{
      const playerCount = getActualPlayerCount(draft);
      (Array.isArray(draft?.players) ? draft.players : []).forEach(player=>{
        const playerName = normalizeName(player?.name);
        if(!playerName) return;
        const performance = buildPlayerDraftPerformance(draft,playerName);
        if(!performance) return;
        const standard25 = supportsBattleLifeStats(draft);
        // PATCH 4: Tournament efficiency considers only actual 25-point battles.
        // Exclude BYEs (20), walkovers (20) and phase bonuses, while preserving
        // the ONE canonical Draft Points total in performance.points elsewhere.
        // Keep all legacy round-robin calculations byte-for-byte equivalent.
        const tournamentPlayedMatches=isTournamentDraft(draft)
          ? (Array.isArray(draft.matches)?draft.matches:[]).filter(match=>
              (match.p1===playerName||match.p2===playerName)&&isBattleStatsEligibleMatch(match,draft))
          : null;
        const efficiencyPoints=tournamentPlayedMatches
          ? tournamentPlayedMatches.reduce((sum,match)=>sum+Number(match.p1===playerName?match.pts1:match.pts2),0)
          : performance.points;
        const efficiencyMatches=tournamentPlayedMatches?tournamentPlayedMatches.length:performance.matches;
        const scoreEfficiency = standard25 && efficiencyMatches > 0
          ? efficiencyPoints / (efficiencyMatches * STAT_RULES.BATTLE_TOTAL_POINTS)
          : null;
        performanceRows.push({
          ...performance,
          name:playerName,
          player:playerName,
          playerCount,
          scoreEfficiency
        });
      });
    });

    const cardRows = Object.values(cardMap).map(stat=>{
      const owners = Object.entries(stat.owners).map(([name,appearances])=>({name,appearances}))
        .sort((a,b)=>b.appearances-a.appearances || compareLocale(a.name,b.name));
      const partners = Object.entries(stat.partners).map(([name,decks])=>({name,decks}))
        .sort((a,b)=>b.decks-a.decks || compareLocale(a.name,b.name));
      return {
        name:stat.name,
        cost:stat.cost,
        power:stat.power,
        appearances:stat.appearances,
        mainDeckAppearances:stat.mainDeckAppearances,
        sideboardAppearances:stat.sideboardAppearances,
        drafts:stat.draftIds.size,
        owners:owners.length,
        ownerRows:owners,
        topOwner:owners[0] || null,
        topPartner:partners[0] || null,
        matches:stat.matches,
        wins:stat.wins,
        losses:stat.losses,
        winRate:calculateWinRate(stat.wins,stat.losses),
        draftWins:stat.draftWins,
        podiums:stat.podiums,
        podiumRate:stat.appearances ? stat.podiums/stat.appearances : 0,
        titleRate:stat.appearances ? stat.draftWins/stat.appearances : 0,
        legendPoints:stat.legendPoints,
        draftPoints:stat.draftPoints,
        averageDraftPoints:stat.appearances ? stat.draftPoints/stat.appearances : 0,
        averageFinish:stat.finishCount ? stat.finishTotal/stat.finishCount : null
      };
    });

    const cardPairs = Object.values(cardPairMap).map(pair=>({
      cardA:pair.cardA,
      cardB:pair.cardB,
      decks:pair.decks,
      drafts:pair.draftIds.size,
      name:`${pair.cardA} + ${pair.cardB}`
    })).sort((a,b)=>b.decks-a.decks || compareLocale(a.name,b.name));

    const h2h = Object.values(h2hMap).map(pair=>({
      playerA:pair.playerA,
      playerB:pair.playerB,
      name:`${pair.playerA} vs ${pair.playerB}`,
      matches:pair.matches,
      winsA:pair.winsA,
      winsB:pair.winsB,
      drafts:pair.draftIds.size,
      balance:Math.abs(pair.winsA-pair.winsB),
      leader:pair.winsA === pair.winsB ? null : (pair.winsA > pair.winsB ? pair.playerA : pair.playerB),
      leaderWins:Math.max(pair.winsA,pair.winsB)
    })).sort((a,b)=>b.matches-a.matches || compareLocale(a.name,b.name));

    const qualifiedPlayers = playerRows.filter(player=>qualifiesSample(player.playedMatches,SAMPLE_THRESHOLDS.GLOBAL_PLAYER_WR_MATCHES));
    const qualifiedFinishPlayers = playerRows.filter(player=>qualifiesSample(player.drafts,SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS));
    const qualifiedPodiumPlayers = playerRows.filter(player=>qualifiesSample(player.drafts,SAMPLE_THRESHOLDS.GLOBAL_PODIUM_RATE_DRAFTS));
    const qualifiedCards = cardRows.filter(card=>qualifiesSample(card.matches,SAMPLE_THRESHOLDS.GLOBAL_CARD_WR_MATCHES));
    const qualifiedH2H = h2h.filter(pair=>qualifiesSample(pair.matches,SAMPLE_THRESHOLDS.GLOBAL_RIVALRY_MATCHES));
    const finishedDraftRows = draftRows.filter(draft=>draft.status === DRAFT_STATUSES.FINISHED);

    const playerRecords = {
      success:{
        draftWins:rankArchiveTop(playerRows,item=>item.draftWins,'desc',3),
        podiums:rankArchiveTop(playerRows,item=>item.podiums,'desc',3),
        averageFinish:rankArchiveTop(
          qualifiedFinishPlayers.filter(item=>item.averageFinish !== null),
          item=>item.averageFinish,
          'asc',
          3
        ),
        podiumRate:rankArchiveTop(qualifiedPodiumPlayers,item=>item.podiumRate,'desc',3),
        drafts:rankArchiveTop(playerRows,item=>item.drafts,'desc',3)
      },
      effectiveness:{
        matches:rankArchiveTop(playerRows,item=>item.officialMatches,'desc',3),
        wins:rankArchiveTop(playerRows,item=>item.officialWins,'desc',3),
        balance:rankArchiveTop(playerRows,item=>item.balance,'desc',3),
        winRate:rankArchiveTop(qualifiedPlayers,item=>item.winRate,'desc',3),
        averageDraftPoints:rankArchiveTop(qualifiedFinishPlayers,item=>item.averageDraftPoints,'desc',3),
        averagePlayedPoints:rankArchiveTop(qualifiedPlayers,item=>item.averagePlayedPoints,'desc',3),
        winStreak:reliableMatchOrder ? rankArchiveTop(playerRows,item=>item.winStreak,'desc',3) : [],
        cleanWins:rankArchiveTop(playerRows,item=>item.cleanWins,'desc',3)
      },
      accumulation:{
        legendPoints:rankArchiveTop(playerRows,item=>item.legendPoints,'desc',3),
        draftPoints:rankArchiveTop(playerRows,item=>item.draftPoints,'desc',3),
        lossPoints:rankArchiveTop(playerRows,item=>item.lossPoints,'desc',3),
        drafts:rankArchiveTop(playerRows,item=>item.drafts,'desc',3)
      },
      veterans:{
        consecutiveDrafts:rankArchiveTop(playerRows,item=>item.consecutiveDrafts,'desc',3),
        activeLongevity:rankArchiveTop(
          playerRows.filter(item=>item.lastDraftId === numberOrZero(finishedDrafts[finishedDrafts.length-1]?.id)),
          item=>item.debutDraftId,'asc',3
        ),
        returnGap:rankArchiveTop(
          playerRows.filter(item=>item.longestReturnGap && item.longestReturnGap.skippedDrafts>0),
          item=>item.longestReturnGap.skippedDrafts,'desc',3
        )
      }
    };

    const cardRecords = {
      popularity:{
        appearances:rankArchiveTop(cardRows,item=>item.appearances,'desc',3),
        drafts:rankArchiveTop(cardRows,item=>item.drafts,'desc',3),
        owners:rankArchiveTop(cardRows,item=>item.owners,'desc',3)
      },
      effectiveness:{
        wins:rankArchiveTop(cardRows,item=>item.wins,'desc',3),
        winRate:rankArchiveTop(qualifiedCards,item=>item.winRate,'desc',3),
        matches:rankArchiveTop(cardRows,item=>item.matches,'desc',3)
      },
      success:{
        draftWins:rankArchiveTop(cardRows,item=>item.draftWins,'desc',3),
        podiums:rankArchiveTop(cardRows,item=>item.podiums,'desc',3),
        legendPoints:rankArchiveTop(cardRows,item=>item.legendPoints,'desc',3),
        draftPoints:rankArchiveTop(cardRows,item=>item.draftPoints,'desc',3),
        averageDraftPoints:rankArchiveTop(
          cardRows.filter(item=>item.drafts >= SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS),
          item=>item.averageDraftPoints,'desc',3
        ),
        averageFinish:rankArchiveTop(
          cardRows.filter(item=>item.drafts >= SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS && item.averageFinish !== null),
          item=>item.averageFinish,'asc',3
        ),
        podiumRate:rankArchiveTop(
          cardRows.filter(item=>item.drafts >= SAMPLE_THRESHOLDS.GLOBAL_PODIUM_RATE_DRAFTS),
          item=>item.podiumRate,'desc',3
        )
      },
      pilots:cardRows.filter(card=>card.topOwner).map(card=>({
        name:`${card.topOwner.name} + ${card.name}`,
        player:card.topOwner.name,
        card:card.name,
        appearances:card.topOwner.appearances,
        cardAppearances:card.appearances,
        share:card.appearances ? card.topOwner.appearances/card.appearances : 0
      })).sort((a,b)=>b.appearances-a.appearances || b.share-a.share || compareLocale(a.name,b.name)).slice(0,3),
      pairs:cardPairs.slice(0,3)
    };

    const archetypeRows = Object.values(archetypeMeta).map(item=>({
      id:item.id,
      name:item.name,
      category:'deckArchetypes',
      decks:item.decks,
      championDecks:item.championDecks,
      cardSlots:item.cardSlots,
      sideboardSlots:item.sideboardSlots,
      draftedSlots:item.draftedSlots,
      drafts:item.draftIds.size,
      players:item.players.size,
      averageSlots:item.decks ? item.cardSlots/item.decks : 0,
      maxConcentration:item.maxConcentration,
      deckShare:dnaDecks ? item.decks/dnaDecks : 0,
      championShare:dnaChampionDecks ? item.championDecks/dnaChampionDecks : 0
    }));

    const mechanicRows = Object.values(mechanicMeta).map(item=>({
      id:item.id,
      name:item.name,
      category:item.category,
      decks:item.decks,
      championDecks:item.championDecks,
      cardSlots:item.cardSlots,
      drafts:item.draftIds.size,
      players:item.players.size,
      averageSlots:item.decks ? item.cardSlots/item.decks : 0,
      maxConcentration:item.maxConcentration,
      deckShare:dnaDecks ? item.decks/dnaDecks : 0,
      championShare:dnaChampionDecks ? item.championDecks/dnaChampionDecks : 0
    }));

    function buildDnaSelectionRows(counter,limit=5){
      const rows = Object.entries(counter || {}).map(([id,occurrences])=>({
        id,
        name:tagNameById[id] || id,
        category:tagIndex.categoryById[id] || null,
        occurrences:numberOrZero(occurrences),
        share:dnaCardAppearances ? numberOrZero(occurrences)/dnaCardAppearances : 0
      }));
      return rankArchiveTop(rows,item=>item.occurrences,'desc',limit);
    }

    const coherentDecks = deckMetaRows.filter(item=>item.primaryArchetype && item.primaryCount >= DECK_ARCHETYPE_MIN_CARDS);
    const hybridDecks = deckMetaRows.filter(item=>item.hybridArchetypeCount >= 2);
    const championDecks = coherentDecks.filter(item=>item.isWinner);

    const championHybridDecks = hybridDecks.filter(item=>item.isWinner);
    const coherentMechanicDecks = deckMetaRows.filter(item=>item.primaryMechanic && item.primaryMechanicCount >= DECK_ARCHETYPE_MIN_CARDS);
    const deckRecords = {
      cohesion:rankArchiveTop(coherentDecks,item=>item.primaryCount,'desc',3),
      hybrid:rankArchiveTop(hybridDecks,item=>item.hybridArchetypeCount,'desc',3),
      championCohesion:rankArchiveTop(championDecks,item=>item.primaryCount,'desc',3),
      championHybrid:rankArchiveTop(championHybridDecks,item=>item.hybridArchetypeCount,'desc',3),
      showcases:{
        popular:cardRows.slice()
          .sort((a,b)=>b.appearances-a.appearances || b.drafts-a.drafts || compareLocale(a.name,b.name))
          .slice(0,12),
        legendary:cardRows.slice()
          .sort((a,b)=>b.legendPoints-a.legendPoints || b.draftWins-a.draftWins || b.podiums-a.podiums || compareLocale(a.name,b.name))
          .slice(0,12)
      }
    };

    const metaRecords = {
      popularArchetypes:rankArchiveTop(
        archetypeRows.filter(item=>item.decks > 0),
        item=>item.decks,
        'desc',
        5
      ),
      championArchetypes:rankArchiveTop(
        archetypeRows.filter(item=>item.championDecks > 0),
        item=>item.championDecks,
        'desc',
        5
      ),
      widespreadArchetypes:rankArchiveTop(
        archetypeRows.filter(item=>item.players > 0),
        item=>item.players,
        'desc',
        5
      )
    };

    const dnaRecords = {
      selection:{
        totalCardAppearances:dnaCardAppearances,
        abilityTypes:buildDnaSelectionRows(dnaSelectionCounts.abilityTypes,5),
        mechanics:buildDnaSelectionRows(dnaSelectionCounts.mechanics,5),
        deckArchetypes:buildDnaSelectionRows(dnaSelectionCounts.deckArchetypes,5)
      },
      builtSynergies:{
        totalDecks:dnaDecks,
        mechanics:rankArchiveTop(mechanicRows.filter(item=>item.decks>0),item=>item.decks,'desc',5),
        deckArchetypes:rankArchiveTop(archetypeRows.filter(item=>item.decks>0),item=>item.decks,'desc',5)
      },
      championSynergies:{
        totalDecks:dnaChampionDecks,
        mechanics:rankArchiveTop(mechanicRows.filter(item=>item.championDecks>0),item=>item.championDecks,'desc',2),
        deckArchetypes:rankArchiveTop(archetypeRows.filter(item=>item.championDecks>0),item=>item.championDecks,'desc',2)
      },
      records:{
        archetypeCohesion:deckRecords.cohesion,
        archetypeHybrid:deckRecords.hybrid,
        mechanicCohesion:rankArchiveTop(coherentMechanicDecks,item=>item.primaryMechanicCount,'desc',3)
      }
    };

    const draftRecords = {
      // Skala i różnorodność edycji.
      largest:rankArchiveTop(finishedDraftRows,item=>item.players,'desc',3),
      smallest:rankArchiveTop(finishedDraftRows,item=>item.players,'asc',3),
      uniqueCards:rankArchiveTop(finishedDraftRows,item=>item.uniqueCards,'desc',3),
      diversityRate:rankArchiveTop(
        finishedDraftRows.filter(item=>item.diversityRate !== null),
        item=>item.diversityRate,
        'desc',
        3
      ),

      // Walka o tytuł i kształt tabeli.
      dominance:rankArchiveTop(
        finishedDraftRows.filter(item=>item.normalizedWinnerGap !== null),
        item=>item.normalizedWinnerGap,
        'desc',
        3
      ),
      closestTitle:rankArchiveTop(
        finishedDraftRows.filter(item=>item.normalizedWinnerGap !== null),
        item=>item.normalizedWinnerGap,
        'asc',
        3
      ),
      balance:rankArchiveTop(
        finishedDraftRows.filter(item=>item.balanceIndex !== null),
        item=>item.balanceIndex,
        'desc',
        3
      ),
      standingsSpread:rankArchiveTop(
        finishedDraftRows.filter(item=>item.normalizedPointSpread !== null),
        item=>item.normalizedPointSpread,
        'desc',
        3
      ),

      // Charakter całej edycji, a nie pojedynczego systemowego wyniku.
      oneSided:rankArchiveTop(
        finishedDraftRows.filter(item=>item.averageBattleMargin !== null),
        item=>item.averageBattleMargin,
        'desc',
        3
      ),
      balancedBattles:rankArchiveTop(
        finishedDraftRows.filter(item=>item.averageBattleMargin !== null),
        item=>item.averageBattleMargin,
        'asc',
        3
      )
    };

    const undefeatedDrafts = performanceRows.filter(item=>item.matches>0&&item.losses===0);
    const perfectRuns = performanceRows.filter(item=>Number(item.battle?.longestWinRun||0)>0);
    const performanceRecords = {
      draftPoints:rankArchiveTop(performanceRows,item=>item.points,'desc',3),
      wins:rankArchiveTop(performanceRows,item=>item.wins,'desc',3),
      undefeatedDraft:rankArchiveTop(undefeatedDrafts,item=>item.wins,'desc',3),
      perfectRun:rankArchiveTop(perfectRuns,item=>item.battle.longestWinRun,'desc',3),
      cleanWins:rankArchiveTop(performanceRows,item=>item.battle?.cleanWins || 0,'desc',3),
      scoreEfficiency:rankArchiveTop(
        performanceRows.filter(item=>item.scoreEfficiency !== null),
        item=>item.scoreEfficiency,
        'desc',
        3
      )
    };

    const rivalryRecords = {
      mostMeetings:rankArchiveTop(h2h,item=>item.matches,'desc',3),
      closest:rankArchiveTop(qualifiedH2H,item=>item.balance,'asc',3),
      oneSided:rankArchiveTop(qualifiedH2H,item=>item.balance,'desc',3),
      mostWinsAgainst:rankArchiveTop(qualifiedH2H,item=>item.leaderWins,'desc',3)
    };

    const loyalPair = cardRows.filter(card=>card.topOwner).map(card=>({
      name:`${card.topOwner.name} + ${card.name}`,
      player:card.topOwner.name,
      card:card.name,
      appearances:card.topOwner.appearances
    })).sort((a,b)=>b.appearances-a.appearances || compareLocale(a.name,b.name))[0] || null;

    const legendTop = context.legendStandings.ranking.slice(0,3);
    const legendFocus = context.legendStandings.ranking.slice(0,5).map(player=>player.name);
    const legendEvolution = finishedDrafts.map((draft,index)=>{
      const standings = calculateLegendStandings(finishedDrafts.slice(0,index+1));
      return {
        id:numberOrZero(draft?.id),
        ranks:Object.fromEntries(legendFocus.map(name=>[name,standings.rankByName[name] || null]))
      };
    });
    const veteranCardNoTitle = cardRows.filter(card=>card.drafts >= 3 && card.draftWins === 0)
      .sort((a,b)=>b.drafts-a.drafts || b.appearances-a.appearances || compareLocale(a.name,b.name))[0] || null;
    const bestDebut = playerRows.filter(player=>player.debutPercentile !== null)
      .sort((a,b)=>b.debutPercentile-a.debutPercentile || a.debutDraftId-b.debutDraftId || compareLocale(a.name,b.name))[0] || null;
    const rookieChampion = playerRows.filter(player=>player.rookieChampion)
      .sort((a,b)=>a.debutDraftId-b.debutDraftId || compareLocale(a.name,b.name))[0] || null;
    const bestDebutWinRate = playerRows.filter(player=>player.debutBattleMatches >= 3)
      .sort((a,b)=>b.debutWinRate-a.debutWinRate || b.debutBattleMatches-a.debutBattleMatches || compareLocale(a.name,b.name))[0] || null;
    const fastestCrown = playerRows.filter(player=>player.draftsToFirstTitle !== null)
      .sort((a,b)=>a.draftsToFirstTitle-b.draftsToFirstTitle || a.debutDraftId-b.debutDraftId || compareLocale(a.name,b.name))[0] || null;
    const glowUp = playerRows.filter(player=>player.comeback && player.comeback.improvement > 0)
      .sort((a,b)=>b.comeback.improvement-a.comeback.improvement || compareLocale(a.name,b.name))[0] || null;
    const podiumWithoutTitleCandidate = playerRows
      .filter(player=>player.draftWins===0 && player.podiums>0)
      .sort((a,b)=>b.podiums-a.podiums || b.drafts-a.drafts || compareLocale(a.name,b.name))[0] || null;

    const consistencyCandidate = playerRows
      .filter(player=>player.drafts >= SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS && player.finishStdDev !== null)
      .sort((a,b)=>a.finishStdDev-b.finishStdDev || b.drafts-a.drafts || compareLocale(a.name,b.name))[0] || null;

    const volatilityCandidate = playerRows
      .filter(player=>player.drafts >= SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS && player.finishRange !== null)
      .sort((a,b)=>b.finishRange-a.finishRange || b.drafts-a.drafts || compareLocale(a.name,b.name))[0] || null;

    const roughestChampion = performanceRows
      .filter(item=>item.isWinner && item.battle?.eligibleMatches >= 3 && item.battle?.winRate !== null)
      .sort((a,b)=>
        a.battle.winRate-b.battle.winRate ||
        b.battle.eligibleMatches-a.battle.eligibleMatches ||
        numberOrZero(a.draftId)-numberOrZero(b.draftId)
      )[0] || null;

    const attendanceJump = finishedDraftRows
      .slice()
      .sort((a,b)=>a.id-b.id)
      .map((draft,index,rows)=>{
        if(index===0) return null;
        const previous = rows[index-1];
        return {
          fromDraftId:previous.id,
          toDraftId:draft.id,
          fromPlayers:previous.players,
          toPlayers:draft.players,
          jump:draft.players-previous.players
        };
      })
      .filter(item=>item && item.jump > 0)
      .sort((a,b)=>b.jump-a.jump || a.toDraftId-b.toDraftId)[0] || null;

    const curiosities = [];
    if(glowUp) curiosities.push({
      title:'Największy kosmiczny skok',
      value:glowUp.name,
      detail:`D${glowUp.comeback.fromDraftId} #${glowUp.comeback.fromPlace} → D${glowUp.comeback.toDraftId} #${glowUp.comeback.toPlace}`,
      entity:{type:'player',name:glowUp.name}
    });
    if(bestDebutWinRate) curiosities.push({
      title:'Najlepszy bilans w debiucie',
      value:bestDebutWinRate.name,
      detail:`D${bestDebutWinRate.debutDraftId} · miejsce #${bestDebutWinRate.debutPlace} · ${Math.round(bestDebutWinRate.debutWinRate*100)}% WR · ${bestDebutWinRate.debutBattleMatches} rozegranych meczów`,
      entity:{type:'player',name:bestDebutWinRate.name}
    });
    if(roughestChampion) curiosities.push({
      title:'Mistrz pod ostrzałem',
      value:roughestChampion.player,
      detail:`D${roughestChampion.draftId} · tytuł mimo ${Math.round(roughestChampion.battle.winRate*100)}% WR · ${roughestChampion.battle.wins}–${roughestChampion.battle.losses}`,
      entity:{type:'player',name:roughestChampion.player}
    });
    if(consistencyCandidate) curiosities.push({
      title:'Najrówniejsza trajektoria',
      value:consistencyCandidate.name,
      detail:`${consistencyCandidate.drafts} draftów · najmniejsze wahanie zajmowanych miejsc`,
      entity:{type:'player',name:consistencyCandidate.name}
    });
    if(volatilityCandidate) curiosities.push({
      title:'Kosmiczna sinusoida',
      value:volatilityCandidate.name,
      detail:`Rozpiętość miejsc: #${volatilityCandidate.bestFinishPlace} → #${volatilityCandidate.worstFinishPlace} · ${volatilityCandidate.drafts} draftów`,
      entity:{type:'player',name:volatilityCandidate.name}
    });
    if(podiumWithoutTitleCandidate) curiosities.push({
      title:'O krok od korony',
      value:podiumWithoutTitleCandidate.name,
      detail:`${podiumWithoutTitleCandidate.podiums} podiów w ${podiumWithoutTitleCandidate.drafts} ukończonych draftach · bez tytułu`,
      entity:{type:'player',name:podiumWithoutTitleCandidate.name}
    });
    if(veteranCardNoTitle) curiosities.push({
      title:'Weteran bez korony',
      value:veteranCardNoTitle.name,
      detail:`${veteranCardNoTitle.drafts} ukończonych draftów · ${veteranCardNoTitle.appearances} występów w deckach · bez zwycięskiego decku`,
      entity:{type:'card',name:veteranCardNoTitle.name}
    });
    if(attendanceJump) curiosities.push({
      title:'Największy skok frekwencji',
      value:`D${attendanceJump.fromDraftId} → D${attendanceJump.toDraftId}`,
      detail:`${attendanceJump.fromPlayers} → ${attendanceJump.toPlayers} graczy · +${attendanceJump.jump}`,
      entity:{type:'draft',id:attendanceJump.toDraftId}
    });

    const cumulativeChampionNames = new Set();
    const championEvolution = finishedDraftRows
      .slice()
      .sort((a,b)=>numberOrZero(a.id)-numberOrZero(b.id))
      .map(draft=>{
        if(draft.winner) cumulativeChampionNames.add(draft.winner);
        return {
          id:draft.id,
          uniqueChampions:cumulativeChampionNames.size,
          winner:draft.winner || null
        };
      });

    const snapshot = {
      version:'archive-v2.6-galactic-dna',
      generatedFrom:{drafts:drafts.length,cards:cards.length},
      dataQuality:{
        scoringSystemCoverage:drafts.length ? drafts.filter(draft=>Boolean(getScoringSystem(draft))).length/drafts.length : 0,
        scoringSystems:drafts.reduce((map,draft)=>{
          const key=getScoringSystem(draft) || 'unknown';
          map[key]=numberOrZero(map[key])+1;
          return map;
        },{}),
        startOrderCoverage,
        reliableMatchOrder
      },
      thresholds:{
        playerWinRateMatches:SAMPLE_THRESHOLDS.GLOBAL_PLAYER_WR_MATCHES,
        cardWinRateMatches:SAMPLE_THRESHOLDS.GLOBAL_CARD_WR_MATCHES,
        rivalryMatches:SAMPLE_THRESHOLDS.GLOBAL_RIVALRY_MATCHES,
        finishDrafts:SAMPLE_THRESHOLDS.GLOBAL_FINISH_DRAFTS,
        podiumRateDrafts:SAMPLE_THRESHOLDS.GLOBAL_PODIUM_RATE_DRAFTS,
        deckArchetypeCards:DECK_ARCHETYPE_MIN_CARDS,
        deckSynergyCards:DECK_ARCHETYPE_MIN_CARDS
      },
      legend:{top:legendTop,focus:legendFocus,evolution:legendEvolution},
      totals:global,
      players:playerRows,
      cards:cardRows,
      drafts:draftRows,
      h2h,
      timeline:timeline.slice().sort((a,b)=>numberOrZero(a.id)-numberOrZero(b.id)),
      records:{players:playerRecords,performances:performanceRecords,cards:cardRecords,decks:deckRecords,meta:metaRecords,dna:dnaRecords,drafts:draftRecords,rivalries:rivalryRecords},
      trends:{
        drafts:finishedDraftRows.map(draft=>({
          id:draft.id,
          players:draft.players,
          matches:draft.matches,
          uniqueCards:draft.uniqueCards,
          repeatedDeckSlots:draft.repeatedDeckSlots,
          deckSlots:draft.playerDeckSlots,
          mainDeckSlots:draft.deckSlots,
          sideboardSlots:draft.sideboardSlots,
          averagePlayerPoints:draft.averagePlayerPoints,
          status:draft.status
        })),
        attendance:finishedDraftRows.map(draft=>({id:draft.id,players:draft.players,status:draft.status})),
        legendEvolution,
        cardUse:finishedDraftRows.map(draft=>({
          id:draft.id,
          uniqueCards:draft.uniqueCards,
          repeatedDeckSlots:draft.repeatedDeckSlots,
          deckSlots:draft.playerDeckSlots,
          mainDeckSlots:draft.deckSlots,
          sideboardSlots:draft.sideboardSlots
        })),
        averagePoints:finishedDraftRows
          .filter(draft=>draft.averagePlayerPoints !== null)
          .map(draft=>({id:draft.id,averagePlayerPoints:draft.averagePlayerPoints})),
        champions:championEvolution,
        cardPopularity:cardRecords.popularity.appearances.slice(0,8),
        resultTypes:{played:global.playedMatches,walkover:global.walkovers,doubleWalkover:global.doubleWalkovers}
      },
      highlights:{biggestStomp,closestBattle,loyalPair,topCardPair:cardPairs[0] || null},
      curiosities
    };
    return Object.freeze(snapshot);
  }

  function calculateCardCollectionPosition(drafts, cards, cardName, options){
    const name=normalizeName(cardName);
    if(!name) return null;
    const snapshot=buildArchiveSnapshot({
      drafts:Array.isArray(drafts)?drafts:[],
      cards:Array.isArray(cards)?cards:[],
      tags:options?.tags || {}
    });
    const row=(snapshot.cards||[]).find(item=>item.name===name);
    if(!row) return null;
    const rank=(rows,field,direction='desc')=>{
      const sorted=(rows||[]).slice().filter(item=>Number.isFinite(Number(item?.[field]))).sort((a,b)=>{
        const av=Number(a[field]),bv=Number(b[field]);
        const delta=direction==='asc'?av-bv:bv-av;
        return delta || compareLocale(a.name,b.name);
      });
      const index=sorted.findIndex(item=>item.name===name);
      if(index<0) return null;
      const value=Number(sorted[index][field]);
      const better=sorted.filter(item=>direction==='asc'?Number(item[field])<value:Number(item[field])>value).length;
      const tieCount=sorted.filter(item=>Number(item[field])===value).length;
      return {rank:better+1,total:sorted.length,value,tieCount,isTied:tieCount>1};
    };
    const qualifiedWr=(snapshot.cards||[]).filter(item=>qualifiesSample(item.matches,snapshot.thresholds.cardWinRateMatches));
    const qualifiedFinish=(snapshot.cards||[]).filter(item=>item.drafts>=snapshot.thresholds.finishDrafts && item.averageFinish!==null);
    const qualifiedAveragePoints=(snapshot.cards||[]).filter(item=>item.drafts>=snapshot.thresholds.finishDrafts);
    return Object.freeze({
      name,
      legendPoints:rank(snapshot.cards,'legendPoints','desc'),
      appearances:rank(snapshot.cards,'appearances','desc'),
      draftWins:rank(snapshot.cards,'draftWins','desc'),
      winRate:rank(qualifiedWr,'winRate','desc'),
      averageDraftPoints:rank(qualifiedAveragePoints,'averageDraftPoints','desc'),
      averageFinish:rank(qualifiedFinish,'averageFinish','asc'),
      thresholds:{...snapshot.thresholds}
    });
  }

  function createWarning(code, details){
    return {code, ...(details || {})};
  }

  function validateDraft(draft){
    if(isTournamentDraft(draft)){
      const state=tournamentState(draft);
      const warnings=state.warnings.map(w=>createWarning(w.code,w));
      const actualPlayerCount=getActualPlayerCount(draft);
      const declaredPlayerCount=Number(draft?.playersCount);
      if(Number.isFinite(declaredPlayerCount)&&declaredPlayerCount!==actualPlayerCount){
        warnings.push(createWarning('playersCountMismatch',{declared:declaredPlayerCount,actual:actualPlayerCount}));
      }
      const rawStatus=hasOwn(draft,'status')?normalizeName(draft.status):null;
      if(rawStatus&&!VALID_DRAFT_STATUSES.has(rawStatus)) warnings.push(createWarning('invalidStatus',{value:rawStatus}));
      if(rawStatus===DRAFT_STATUSES.FINISHED&&!state.complete) warnings.push(createWarning('tournamentFinishedBeforeFinalAndBronze'));
      const winner=getDraftWinner(draft);
      const explicitWinner=normalizeName(draft?.winner);
      if(explicitWinner&&winner&&explicitWinner!==winner){warnings.push(createWarning('winnerMismatch',{officialWinner:explicitWinner,calculatedLeader:winner}));}
      if(explicitWinner&&!winner) warnings.push(createWarning('winnerOnActiveDraft',{winner:explicitWinner}));
      return {
        valid:warnings.length===0,warnings,
        status:getDraftStatus(draft),statusSource:'bracket',
        roundRobinComplete:false,tournamentComplete:state.complete,
        actualPlayerCount,declaredPlayerCount:Number.isFinite(declaredPlayerCount)?declaredPlayerCount:null,
        expectedMatchCount:state.expectedMatches,resolvedPairCount:state.resolvedMatches,
        leader:state.standings[0]?.name||null,winner,winnerMismatch:Boolean(explicitWinner&&winner&&explicitWinner!==winner)
      };
    }
    const warnings = [];
    const rosterNames = getRosterNames(draft);
    const roster = new Set(rosterNames.filter(Boolean));
    const actualPlayerCount = getActualPlayerCount(draft);
    const declaredPlayerCount = Number(draft?.playersCount);

    if(hasOwn(draft, 'status')){
      const rawStatus = normalizeName(draft?.status);
      if(!VALID_DRAFT_STATUSES.has(rawStatus)){
        warnings.push(createWarning('invalidStatus',{value:draft?.status}));
      }
    }

    if(Number.isFinite(declaredPlayerCount) && declaredPlayerCount !== actualPlayerCount){
      warnings.push(createWarning('playersCountMismatch',{
        declared:declaredPlayerCount,
        actual:actualPlayerCount
      }));
    }

    const seenPlayerNames = new Set();
    rosterNames.forEach((name,index)=>{
      if(!name){
        warnings.push(createWarning('blankPlayerName',{index}));
        return;
      }
      if(seenPlayerNames.has(name)) warnings.push(createWarning('duplicatePlayerName',{name}));
      seenPlayerNames.add(name);
    });

    const seenPairs = new Set();
    (Array.isArray(draft?.matches) ? draft.matches : []).forEach((match,index)=>{
      const p1 = normalizeName(match?.p1);
      const p2 = normalizeName(match?.p2);

      if(p1 && p2){
        const key = pairKey(p1,p2);
        if(seenPairs.has(key)) warnings.push(createWarning('duplicateMatchPair',{index,p1,p2}));
        seenPairs.add(key);
      }

      if(p1 && p2 && p1 === p2) warnings.push(createWarning('selfMatch',{index,player:p1}));
      if(p1 && !roster.has(p1)) warnings.push(createWarning('unknownMatchPlayer',{index,player:p1}));
      if(p2 && !roster.has(p2)) warnings.push(createWarning('unknownMatchPlayer',{index,player:p2}));
      if(!isFinitePointValue(match?.pts1) || !isFinitePointValue(match?.pts2)){
        warnings.push(createWarning('invalidPoints',{index,pts1:match?.pts1,pts2:match?.pts2}));
      }

      if(hasOwn(match,'resultType') && !VALID_MATCH_TYPES.has(match.resultType)){
        warnings.push(createWarning('invalidResultType',{index,value:match.resultType}));
      }

      const matchType = getMatchType(match,draft);
      if(getScoringSystem(draft) === 'standard25' && matchType === MATCH_TYPES.PLAYED &&
        isFinitePointValue(match?.pts1) && isFinitePointValue(match?.pts2)){
        const standardPts1 = Number(match.pts1);
        const standardPts2 = Number(match.pts2);
        if(!isValidStandard25Score(match)){
          warnings.push(createWarning('invalidStandard25PlayedScore',{index,pts1:standardPts1,pts2:standardPts2}));
        }
      }
      if(matchType === MATCH_TYPES.WALKOVER &&
        isFinitePointValue(match?.pts1) && isFinitePointValue(match?.pts2) &&
        Number(match.pts1) === Number(match.pts2)){
        warnings.push(createWarning('walkoverWithoutWinner',{index,pts1:match.pts1,pts2:match.pts2}));
      }
      if(matchType === MATCH_TYPES.DOUBLE_WALKOVER &&
        isFinitePointValue(match?.pts1) && isFinitePointValue(match?.pts2) &&
        Number(match.pts1) !== Number(match.pts2)){
        warnings.push(createWarning('doubleWalkoverUnequalPoints',{index,pts1:match.pts1,pts2:match.pts2}));
      }
    });

    const draftStatus = getDraftStatus(draft);
    const leader = getDraftLeader(draft);
    const explicitWinner = getExplicitWinner(draft);
    const winnerKnown = Boolean(explicitWinner && roster.has(explicitWinner));
    const officialWinner = getDraftWinner(draft);
    const winnerMismatch = Boolean(
      draftStatus === DRAFT_STATUSES.FINISHED &&
      winnerKnown && leader && explicitWinner !== leader
    );

    if(explicitWinner && !winnerKnown){
      warnings.push(createWarning('unknownWinner',{winner:explicitWinner}));
    }
    if(draftStatus === DRAFT_STATUSES.ACTIVE && explicitWinner){
      warnings.push(createWarning('winnerOnActiveDraft',{winner:explicitWinner}));
    }
    if(winnerMismatch){
      warnings.push(createWarning('winnerMismatch',{
        officialWinner:explicitWinner,
        calculatedLeader:leader
      }));
    }

    const roundRobinComplete = isFullRoundRobin(draft);
    const resolvedPairCount = getResolvedPairKeys(draft).size;
    const expectedMatchCount = getExpectedMatchCount(draft);
    const rawStatus = hasOwn(draft,'status') ? normalizeName(draft?.status) : null;
    const statusSource = VALID_DRAFT_STATUSES.has(rawStatus)
      ? 'explicit'
      : (hasOwn(draft,'status') ? 'invalid-fallback' : 'fallback');

    return {
      valid:warnings.length === 0,
      warnings,
      status:draftStatus,
      statusSource,
      roundRobinComplete,
      actualPlayerCount,
      declaredPlayerCount:Number.isFinite(declaredPlayerCount) ? declaredPlayerCount : null,
      expectedMatchCount,
      resolvedPairCount,
      leader,
      winner:officialWinner,
      winnerMismatch
    };
  }

  return Object.freeze({
    MATCH_TYPES,
    DRAFT_STATUSES,
    LEGEND_POINTS,
    MIN_LEGEND_DRAFTS,
    SAMPLE_THRESHOLDS,
    STAT_RULES,
    STAT_DEFINITIONS,
    getScoringSystem,
    getDraftModeLabel,
    isTournamentDraft,
    getTournamentState:tournamentState,
    supportsBattleLifeStats,
    supportsCleanWins,
    isValidStandard25Score,
    getMatchType,
    getMatchResult,
    getPlayerOutcome,
    isWalkover,
    isDoubleWalkover,
    isBattleStatsEligibleMatch,
    getBattleResult,
    isCleanWin,
    isCleanLoss,
    isLastLifeWin,
    isLastLifeLoss,
    isPlayerCleanWin,
    isPlayerLastLifeWin,
    getActualPlayerCount,
    getExpectedMatchCount,
    isFullRoundRobin,
    getUnplayedMatches,
    getDraftStatus,
    isDraftFinished,
    calculateDraftStats,
    calculateDraftRanking,
    getDraftLeader,
    getDraftWinner,
    getDraftLegendOrder,
    getDraftLegendAwards,
    calculateLegendStandings,
    getPlayerLegendStats,
    getPlayerLegendRank,
    calculateWinRate,
    qualifiesSample,
    rankTopN,
    getStatDefinition,
    calculateFinishPercentile,
    calculatePlayerHistory,
    calculatePlayerTopPerformances,
    calculatePlayerRecords,
    calculatePlayerRivalries,
    calculatePlayerMatchBreakdown,
    calculatePlayerBattleStats,
    calculatePlayerStreaks,
    calculatePlayerSummary,
    calculatePlayerAchievements,
    calculatePlayerProfile,
    calculatePlayerDna,
    calculatePlayerCardContributions,
    calculateCardProfile,
    calculateCardCollectionPosition,
    getMainDeckCards,
    getSideboardCards,
    getPlayerDeckCards,
    getAllDraftedCards,
    calculateBanRanking,
    buildArchiveSnapshot,
    validateDraft,
    validateDatabase,
    createStatsContext
  });
});
