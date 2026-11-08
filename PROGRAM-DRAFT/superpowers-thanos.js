/* MSP SNAPDRAFT — PERFECTLY BALANCED: BLIP — cinematic V2 / 2026-11-08
   Base game mutations go through ThanosHostBridge; no shadow decks.
   Assets: draft-assets/thanos_*.png. Restorable at intro/choice stage.
*/
(function(global){
'use strict';
const PATH='draft-assets/';
const STONES=Object.freeze([
 {id:'time',name:'Kamień Czasu',pick:'TIME PICK',color:'#55f494',info:'Wybierz kopię ostatniej normalnie wybranej karty jednego z pozostałych graczy.'},
 {id:'soul',name:'Kamień Duszy',pick:'SOUL PICK',color:'#ff9a32',info:'Wybierz jedną z 5 kart najlepiej dopasowanych tagami do swojej aktualnej talii.'},
 {id:'power',name:'Kamień Mocy',pick:'POWER PICK',color:'#d459ff',info:'Wybierz jedną z 5 losowych kart o bazowej Sile co najmniej 10.'},
 {id:'space',name:'Kamień Przestrzeni',pick:'SPACE PICK',color:'#43baff',info:'Wskaż Koszt, a następnie wybierz jedną z 7 losowych kart o tym Koszcie.'},
 {id:'mind',name:'Kamień Umysłu',pick:'MIND PICK',color:'#ffe263',info:'Wybierz rywala i skopiuj jedną z jego kart o największej bazowej Sile.'},
 {id:'reality',name:'Kamień Rzeczywistości',pick:'REALITY PICK',color:'#fa576b',info:'Wybierz dowolną niezbanowaną kartę o Koszcie takim jak poświęcona karta.'}
]);
const STONE_MAP=Object.fromEntries(STONES.map(s=>[s.id,s]));
const state={phase:'idle',playerName:'',playerIndex:-1,lost:[],stones:[],step:0,choices:[],cache:{},selectedIndex:-1,search:'',error:''};
let cinematicTimer=null;
const $=id=>document.getElementById(id);
const host=()=>global.ThanosHostBridge;
const norm=v=>String(v||'').trim().toLocaleLowerCase('pl');
const safeNumber=v=>Number.isFinite(Number(v))?Number(v):null;
const clone=v=>JSON.parse(JSON.stringify(v));
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const isBusy=()=>state.phase!=='idle';
const getDeck=()=>host()?.getDecks?.()?.[state.playerIndex]||[];
function validPool(){
 const occupied=new Set(getDeck().map(card=>norm(card?.name)));
 const banned=new Set((host()?.getBanned?.()||[]).map(norm));
 const seen=new Set();
 return (host()?.getDatabase?.()||[]).filter(card=>{
   const name=norm(card?.name);
   if(!name||seen.has(name)||occupied.has(name)||banned.has(name)||card?.joker||safeNumber(card?.cost)===null||safeNumber(card?.power)===null)return false;
   seen.add(name);return true;
 });
}
function warn(title,message){
 state.error=message||title;
 global.SuperpowerFeedback?.warning?.('thanos',title,message||title);
 render();return false;
}
function element(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;}
function button(label,action,attrs={}){const b=element('button','spth-btn',label);b.type='button';b.dataset.thanosAction=action;Object.entries(attrs).forEach(([key,value])=>b.dataset[key]=String(value));return b;}
function image(src,cls,alt=''){const el=element('img',cls);el.src=PATH+src;el.alt=alt;el.draggable=false;el.decoding='async';return el;}
function stoneImg(id,cls){return image('thanos_stone_'+id+'.png',cls,STONE_MAP[id]?.name||'Kamień');}
function ensureUi(){
 if($('spthOverlay'))return;
 const overlay=element('div','spth-overlay');overlay.id='spthOverlay';overlay.hidden=true;
 const veil=element('div','spth-veil');overlay.append(veil);
 const cinema=element('div','spth-cinema');cinema.id='spthCinema';cinema.setAttribute('aria-label','Animacja pstryknięcia Thanosa');
 cinema.append(element('div','spth-cinema-aura'));
 cinema.append(image('thanos_jeff_hero.webp','spth-cinema-jeff','Jeff Tytan'));
 const glove=element('div','spth-cinema-glove');
 glove.append(image('thanos_gauntlet_open.png','spth-cinema-glove-open',''),image('thanos_gauntlet_snap.png','spth-cinema-glove-snap',''));
 cinema.append(glove,element('div','spth-cinema-flash'));
 const dust=element('div','spth-cinema-cards');dust.id='spthCinematicCards';cinema.append(dust);
 overlay.append(cinema);
 const frame=element('section','spth-panel');frame.tabIndex=-1;frame.setAttribute('role','dialog');frame.setAttribute('aria-modal','true');frame.setAttribute('aria-labelledby','spthTitle');
 const title=element('header','spth-head');title.append(element('h2','spth-title','PERFECTLY BALANCED: BLIP'),element('p','spth-tagline','Odbuduj swój wszechświat'));
 frame.append(title);
 const medallion=image('thanos_jeff_medallion.webp','spth-medallion','Jeff Tytan — emblemat');frame.append(medallion);
 const sidebar=element('div','spth-active-stone');sidebar.id='spthActiveStone';sidebar.append(element('div','spth-active-stone-img'),element('strong','spth-active-stone-title'));
 frame.append(sidebar);
 frame.append(image('thanos_gauntlet_open.png','spth-side-gauntlet','Rękawica z Kamieniami Nieskończoności'));
 const content=element('main','spth-content');content.id='spthContent';frame.append(content);
 const actions=element('footer','spth-actions');actions.id='spthActions';frame.append(actions);
 overlay.append(frame);document.body.append(overlay);
 overlay.addEventListener('click',event=>{
  const target=event.target.closest('[data-thanos-action]');if(!target||target.disabled)return;
  const action=target.dataset.thanosAction;
  if(action==='begin')return beginRebuild();
  if(action==='cost')return chooseCost(Number(target.dataset.cost));
  if(action==='opponent')return chooseOpponent(Number(target.dataset.index));
  if(action==='pick')return chooseCard(Number(target.dataset.index));
  if(action==='clear')return clearSelection();
  if(action==='back-cost')return backToCost();
  if(action==='back-opponent')return backToOpponent();
  if(action==='rebuild')return confirmStonePick();
  if(action==='fallback')return showFallback();
  if(action==='done')return done();
 });
 overlay.addEventListener('input',event=>{
  if(event.target.id!=='spthSearch')return;
  state.search=event.target.value;
  drawCardGrid($('spthCardGrid'),state.cache[state.step]?.cards||[],state.search);
 });
 document.addEventListener('keydown',event=>{if(isBusy() && event.key==='Escape')event.preventDefault();},true);
}
function render(){
 ensureUi();const overlay=$('spthOverlay');
 if(state.phase==='idle'){overlay.hidden=true;document.body.classList.remove('spth-locked');return;}
 overlay.hidden=false;document.body.classList.add('spth-locked');
 overlay.classList.toggle('spth-cinematic',state.phase==='cinematic');
 const content=$('spthContent'),actions=$('spthActions');content.replaceChildren();actions.replaceChildren();
 const side=$('spthActiveStone');side.replaceChildren();
 if(state.phase==='cinematic'){renderCinematic();return;}
 if(state.phase==='intro'){renderIntro(content,actions);return;}
 if(state.phase==='choosing'){renderStone(content,actions,side);return;}
 if(state.phase==='finished'){renderFinished(content,actions);return;}
}
function renderCinematic(){
 const holder=$('spthCinematicCards');holder.replaceChildren();
 const cards=state.lost;const n=cards.length;
 cards.forEach((card,i)=>{
  // Distribute sacrificed card tiles around the gauntlet, keeping the center unobstructed.
  const angle=(-90+(360/n)*i)*Math.PI/180;
  const tile=element('div','spth-dust-tile');
  tile.style.setProperty('--x',`${Math.round(Math.cos(angle)*42)}vw`);
  tile.style.setProperty('--y',`${Math.round(Math.sin(angle)*25)}vh`);
  tile.style.setProperty('--rot',`${Math.round((i-n/2)*5)}deg`);
  tile.style.setProperty('--delay',`${(i%2)*.13}s`);
  tile.append(element('span','spth-dust-cost',card?.cost??'?'),element('strong','spth-dust-name',card?.name||'Karta'),element('span','spth-dust-power',`SIŁA ${card?.power??'?'}`));
  const particles=element('div','spth-dust-particles');
  for(let p=0;p<24;p++){
    const dot=element('i','spth-dust-particle');
    dot.style.setProperty('--px',`${Math.round((Math.random()-.5)*135)}px`);
    dot.style.setProperty('--py',`${Math.round(-12-Math.random()*175)}px`);
    dot.style.setProperty('--pd',`${(Math.random()*.58).toFixed(2)}s`);
    dot.style.setProperty('--ps',`${(1+Math.random()*3.3).toFixed(1)}px`);
    particles.append(dot);
  }
  tile.append(particles);holder.append(tile);
 });
}
function renderIntro(content,actions){
 const title=element('div','spth-intro');
 title.append(element('p','spth-main-copy',`Poświęcono ${state.lost.length} karty. Przed Tobą ${state.stones.length} Infinity Picki, które odbudują talię.`));
 content.append(title);
 const b=button('ROZPOCZNIJ ODBUDOWĘ','begin');b.classList.add('spth-btn-primary');actions.append(b);
}
function renderProgress(content){
 const progress=element('div','spth-progress');
 state.stones.forEach((id,i)=>{const item=element('span','spth-progress-step'+(i<state.step?' is-done':i===state.step?' is-active':''));item.append(stoneImg(id,'spth-progress-gem'));item.title=STONE_MAP[id]?.pick||'';progress.append(item);});
 content.append(progress);
 content.append(element('p','spth-counter',`WYBÓR ${state.step+1} / ${state.stones.length}`));
}
function renderStone(content,actions,side){
 const stone=STONE_MAP[state.stones[state.step]],lost=state.lost[state.step];
 if(!stone){state.phase='finished';render();return;}
 side.append(stoneImg(stone.id,'spth-active-stone-image'),element('strong','spth-active-stone-title',stone.pick));
 side.style.setProperty('--stone-color',stone.color);
 renderProgress(content);
 content.append(element('h3','spth-step-title',stone.name));
 const sacrificed=element('div','spth-replacement');
 sacrificed.append(element('span','spth-small-label','ODTWARZASZ MIEJSCE PO KARCIE'),element('strong','spth-lost-card',`${lost?.name||'Nieznana karta'}`),element('span','spth-lost-stats',`Koszt ${lost?.cost??'?'}  ·  Siła ${lost?.power??'?'}`));
 content.append(sacrificed);
 content.append(element('p','spth-rule',stone.info));
 if(state.error)content.append(element('p','spth-error',state.error));
 const cache=ensureChoices(stone,lost);
 if(stone.id==='space'&&cache.cost===undefined){
  content.append(element('p','spth-small-label','WYBIERZ KOSZT'));
  const costs=element('div','spth-cost-options');
  [...new Set(validPool().map(c=>Number(c.cost)))].sort((a,b)=>a-b).forEach(cost=>costs.append(button(String(cost),'cost',{cost})));
  content.append(costs);return;
 }
 if(stone.id==='mind'&&cache.opponent===undefined&&!(cache.cards||[]).length){
  content.append(element('p','spth-small-label','WYBIERZ RYWALA'));
  const players=element('div','spth-player-options');
  (host()?.getPlayers?.()||[]).forEach((name,i)=>{
    if(i===state.playerIndex)return;
    const deck=host()?.getDecks?.()?.[i]||[];if(!deck.length)return;
    const max=Math.max(...deck.map(c=>safeNumber(c.power)??-Infinity));
    players.append(button(`${name} · ${max} Siły`,'opponent',{index:i}));
  });content.append(players);
  if(!players.childElementCount){cache.cards=shuffle(validPool()).slice(0,5);cache.opponent='fallback';cache.warning='Brak rywala z kartami — awaryjna pula legalnych kart.';render();}
  return;
 }
 if(stone.id==='reality'){
  const input=element('input','spth-search');input.id='spthSearch';input.type='search';input.placeholder='Szukaj karty…';input.value=state.search;input.autocomplete='off';input.setAttribute('aria-label','Szukaj kart o wymaganym koszcie');content.append(input);
 }
 if(cache.warning)content.append(element('p','spth-advice',cache.warning));
 if(stone.id==='space'&&cache.cost!==undefined){
  const toolbar=element('div','spth-options-toolbar');toolbar.append(element('span','',`Koszt ${cache.cost}`),button('ZMIEŃ KOSZT','back-cost'));content.append(toolbar);
 }
 if(stone.id==='mind'&&cache.opponent!==undefined&&cache.opponent!=='fallback'){
  const name=host()?.getPlayers?.()?.[cache.opponent]||'Rywal';
  const toolbar=element('div','spth-options-toolbar');toolbar.append(element('span','',name),button('ZMIEŃ RYWALA','back-opponent'));content.append(toolbar);
 }
 const cards=cache.cards||[];const grid=element('div','spth-card-grid');grid.id='spthCardGrid';content.append(grid);
 drawCardGrid(grid,cards,stone.id==='reality'?state.search:'');
 if(!cards.length){
  content.append(element('p','spth-error','Brak dostępnych kart według tej zasady.'));
  actions.append(button('WYBÓR AWARYJNY','fallback'));return;
 }
 if(state.selectedIndex>=0&&cards[state.selectedIndex]){
  const chosen=cards[state.selectedIndex];
  content.append(element('div','spth-confirm-text',`Wybrano: ${chosen.name}`));
  actions.append(button('ZMIEŃ WYBÓR','clear'));
  const confirm=button('ODBUDUJ','rebuild');confirm.classList.add('spth-btn-primary');actions.append(confirm);
 }else{
  content.append(element('p','spth-select-hint','Zaznacz kartę, aby ją zatwierdzić.'));
 }
}
function drawCardGrid(grid,cards,query){
 if(!grid)return;grid.replaceChildren();
 const filtered=cards.map((card,index)=>({card,index})).filter(({card})=>norm(card.name).includes(norm(query)));
 const visible=filtered.slice(0,80);
 visible.forEach(({card,index})=>{
  const selected=index===state.selectedIndex;
  const b=button('', 'pick',{index});b.classList.add('spth-card');if(selected)b.classList.add('is-selected');
  b.setAttribute('aria-pressed',String(selected));
  b.append(element('strong','spth-card-title',card?.name||'?'));
  b.append(element('span','spth-card-stats',`KOSZT ${card.cost??'?'}  ·  SIŁA ${card.power??'?'}`));
  const tags=(Array.isArray(card.tags)?card.tags:[]).slice(0,3);
  if(tags.length)b.append(element('small','spth-card-tags',tags.join(' · ')));
  grid.append(b);
 });
 if(filtered.length>80)grid.append(element('p','spth-grid-info',`80 z ${filtered.length} kart. Użyj wyszukiwarki.`));
 if(!filtered.length)grid.append(element('p','spth-grid-info','Brak pasujących kart.'));
}
function ensureChoices(stone,lost){
 if(state.cache[state.step]?.stone===stone.id)return state.cache[state.step];
 const cache={stone:stone.id,cards:[],warning:''};state.cache[state.step]=cache;
 const pool=validPool();
 if(stone.id==='power'){
  cache.cards=shuffle(pool.filter(c=>Number(c.power)>=10)).slice(0,5);
 }else if(stone.id==='soul'){
  const counts=new Map();
  getDeck().forEach(card=>(Array.isArray(card?.tags)?card.tags:[]).forEach(t=>counts.set(norm(t),(counts.get(norm(t))||0)+1)));
  const score=card=>(Array.isArray(card.tags)?card.tags:[]).reduce((n,t)=>n+(counts.get(norm(t))||0),0);
  cache.cards=shuffle(pool).filter(c=>score(c)>0).sort((a,b)=>score(b)-score(a)).slice(0,5);
  if(!cache.cards.length){cache.cards=shuffle(pool).slice(0,5);cache.warning='Brak wspólnych tagów — propozycje awaryjne.';}
 }else if(stone.id==='time'){
  const events=host()?.getPickHistory?.()||[];
  const lastByPlayer=new Map();
  for(let i=events.length-1;i>=0;i--){
   const e=events[i];if(e?.type!=='card_picked'||e.playerIndex===state.playerIndex||!Number.isInteger(e.playerIndex)||lastByPlayer.has(e.playerIndex))continue;
   const card=e.resultCard||e.sourceCard;
   if(card?.name)lastByPlayer.set(e.playerIndex,{...card,thanosFromPlayer:e.player});
  }
  const occupied=new Set(getDeck().map(c=>norm(c.name))),banned=new Set((host()?.getBanned?.()||[]).map(norm));
  const database=host()?.getDatabase?.()||[];
  cache.cards=[...lastByPlayer.values()].filter(c=>!occupied.has(norm(c.name))&&!banned.has(norm(c.name))).map(c=>{
   const canonical=database.find(t=>norm(t.name)===norm(c.name));return {...(canonical||c),thanosFromPlayer:c.thanosFromPlayer};
  });
  if(!cache.cards.length){cache.cards=shuffle(pool).slice(0,5);cache.warning='Brak ostatnich picków innych graczy — propozycje awaryjne.';}
 }else if(stone.id==='reality'){
  cache.cards=pool.filter(c=>Number(c.cost)===Number(lost?.cost)).sort((a,b)=>String(a.name).localeCompare(String(b.name),'pl'));
  if(!cache.cards.length){cache.cards=shuffle(pool).slice(0,8);cache.warning='Brak legalnej karty o tym Koszcie — propozycje awaryjne.';}
 }
 return cache;
}
function chooseCost(cost){
 if(state.phase!=='choosing'||state.stones[state.step]!=='space')return;
 const cache=state.cache[state.step];if(!cache||cache.cost!==undefined)return;
 const pool=validPool().filter(c=>Number(c.cost)===cost);
 if(!pool.length)return warn('BRAK KART','Nie ma dostępnych kart o takim Koszcie.');
 cache.cost=cost;cache.cards=shuffle(pool).slice(0,7);state.selectedIndex=-1;state.error='';render();
}
function chooseOpponent(index){
 if(state.phase!=='choosing'||state.stones[state.step]!=='mind')return;
 const cache=state.cache[state.step];if(!cache||cache.opponent!==undefined)return;
 const deck=host()?.getDecks?.()?.[index]||[];
 if(index===state.playerIndex||!deck.length)return warn('BRAK CELU','Wybierz innego gracza z kartami.');
 const highest=Math.max(...deck.map(c=>safeNumber(c.power)??-Infinity));
 const eligible=deck.filter(c=>Number(c.power)===highest);
 const valid=new Set(validPool().map(c=>norm(c.name)));
 const cards=eligible.filter(c=>valid.has(norm(c.name)));
 if(!cards.length)return warn('BRAK KOPII','Najsilniejsza karta rywala jest zbanowana albo już w Twojej talii. Wybierz innego gracza.');
 cache.opponent=index;cache.cards=cards;cache.warning=`Najwyższa Siła: ${highest}. Rywal zachowa oryginał.`;
 state.selectedIndex=-1;state.error='';render();
}
function chooseCard(index){
 if(state.phase!=='choosing')return;
 const card=state.cache[state.step]?.cards?.[index];if(!card)return;
 state.selectedIndex=index;state.error='';render();
}
function clearSelection(){if(state.phase!=='choosing')return;state.selectedIndex=-1;render();}
function backToCost(){
 if(state.phase!=='choosing'||state.stones[state.step]!=='space')return;
 const cache=state.cache[state.step];if(!cache)return;
 delete cache.cost;cache.cards=[];state.selectedIndex=-1;render();
}
function backToOpponent(){
 if(state.phase!=='choosing'||state.stones[state.step]!=='mind')return;
 const cache=state.cache[state.step];if(!cache)return;
 delete cache.opponent;cache.cards=[];cache.warning='';state.selectedIndex=-1;render();
}
function showFallback(){
 if(state.phase!=='choosing')return;
 const cache=state.cache[state.step];if(!cache)return;
 const pool=validPool();if(!pool.length)return warn('BRAK KART','Nie ma żadnej legalnej karty w bazie.');
 cache.cards=shuffle(pool).slice(0,8);cache.warning='Awaryjna pula kart pozwalająca zakończyć odbudowę.';
 if(state.stones[state.step]==='mind')cache.opponent='fallback';
 if(state.stones[state.step]==='space')cache.cost='fallback';
 state.selectedIndex=-1;render();
}
function confirmStonePick(){
 if(state.phase!=='choosing'||state.selectedIndex<0)return;
 const card=state.cache[state.step]?.cards?.[state.selectedIndex];if(!card)return;
 const result=host()?.gain?.(state.playerName,card,state.stones[state.step],state.step+1);
 if(!result?.ok)return warn('WYBÓR ODRZUCONY',result?.reason||'Nie udało się odbudować tej karty.');
 state.choices.push({name:result.card.name,stone:state.stones[state.step]});
 state.step++;state.selectedIndex=-1;state.search='';state.error='';
 state.phase=state.step>=state.stones.length?'finished':'choosing';
 host()?.refresh?.();host()?.captureSnapshot?.(state.phase==='finished'?'thanos_rebuild_complete':'thanos_stone_choice');render();
}
function renderFinished(content,actions){
 content.append(element('h3','spth-intro-title','BALANS PRZYWRÓCONY'));
 content.append(element('p','spth-main-copy',`Odbudowano ${state.choices.length} kart. Twoja talia znów liczy ${getDeck().length} kart.`));
 const summary=element('div','spth-results');state.choices.forEach(ch=>{
  const item=element('div','spth-result');item.append(element('strong','',STONE_MAP[ch.stone]?.pick||''),element('span','',ch.name));summary.append(item);
 });content.append(summary);
 const b=button('WRÓĆ DO DRAFTU','done');b.classList.add('spth-btn-primary');actions.append(b);
}
function finishCinema(){
 cinematicTimer=null;
 if(state.phase!=='cinematic')return;
 state.phase='intro';render();host()?.captureSnapshot?.('thanos_rebuild_intro');
 $('spthOverlay')?.querySelector('.spth-panel')?.focus();
}
function start(playerName){
 ensureUi();
 if(isBusy())return warn('ODBUDOWA W TOKU','Dokończ rozpoczętą sekwencję Thanosa.');
 const adapter=host();
 if(!adapter?.isDraftActive?.())return warn('DRAFT NIEAKTYWNY','Supermoc wymaga aktywnego draftu.');
 if(global.SuperpowerUI?.isDraftMutationLocked?.())return warn('INNA AKCJA W TOKU',global.SuperpowerUI?.getDraftMutationLockReason?.()||'Dokończ bieżącą akcję.');
 const interference=global.BlackHoleAnomalies?.getSuperpowerInterference?.();
 if(interference?.blocked)return warn('ZAKŁÓCENIE ANOMALII',`${interference.name||'Anomalia'}: ${interference.reason||'Supermoce są zablokowane.'}`);
 const check=global.SuperpowerEngine?.canActivate?.(playerName,'thanos');
 if(!check?.ok)return warn('SUPERPOWER NIEDOSTĘPNA',check?.reason||'Moc nie może teraz zostać użyta.');
 const index=adapter.getPlayerIndex?.(playerName), deck=adapter.getDecks?.()?.[index]||[];
 if(deck.length<6||deck.length>8)return warn('WYMAGANE 6–8 KART',`Thanos ma aktualnie ${deck.length} kart. Potrzebuje 6, 7 lub 8.`);
 const count=Math.floor(deck.length/2);
 const indexes=shuffle(deck.map((_,i)=>i)).slice(0,count);
 const stones=shuffle(STONES.map(s=>s.id)).slice(0,count);
 // A single committed snap. The cinematic merely presents its actual, already-rolled outcome.
 const result=adapter.snap?.(playerName,indexes,stones);
 if(!result?.ok)return warn('PSTRYKNIĘCIE NIEUDANE',result?.reason||'Nie można wykonać operacji.');
 state.playerName=playerName;state.playerIndex=index;state.lost=result.lost;state.stones=stones;
 state.step=0;state.choices=[];state.cache={};state.selectedIndex=-1;state.search='';state.error='';
 state.phase='intro';adapter.captureSnapshot?.('thanos_blip_committed');
 state.phase='cinematic';adapter.refresh?.();render();
 const reduced=global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 cinematicTimer=global.setTimeout(finishCinema,reduced?1100:7600);
 return true;
}
function beginRebuild(){if(state.phase!=='intro')return;state.phase='choosing';render();host()?.captureSnapshot?.('thanos_rebuild_opened');}
function done(){if(state.phase!=='finished')return false;reset();host()?.refresh?.();return true;}
function reset(){
 if(cinematicTimer!==null){clearTimeout(cinematicTimer);cinematicTimer=null;}
 Object.assign(state,{phase:'idle',playerName:'',playerIndex:-1,lost:[],stones:[],step:0,choices:[],cache:{},selectedIndex:-1,search:'',error:''});render();
}
function exportState(){
 if(state.phase==='idle')return null;
 const snapshot=clone(state);if(snapshot.phase==='cinematic')snapshot.phase='intro';return snapshot;
}
function restoreState(snapshot){
 reset();if(!snapshot||typeof snapshot!=='object')return;
 if(!Array.isArray(snapshot.stones)||!Array.isArray(snapshot.lost))return;
 if(!['intro','choosing','finished'].includes(snapshot.phase))return;
 Object.assign(state,clone(snapshot));render();
}
global.ThanosUI=Object.freeze({start,reset,isBusy,exportState,restoreState,debugState:()=>clone(state)});
})(window);
