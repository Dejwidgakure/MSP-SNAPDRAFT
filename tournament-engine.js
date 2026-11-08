/* MSP SNAPDRAFT — SYSTEM TURNIEJOWY V1 | PATCH 1
   Pure, deterministic bracket engine. Browser: window.DraftTournamentEngine.
   Node: require('./tournament-engine.js'). Does not touch DOM or existing drafts.
*/
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
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
