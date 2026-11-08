(function(){
"use strict";

const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[ch]));
const pct=value=>Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:"—";
const one=value=>Number.isFinite(Number(value))?Number(value).toFixed(1):"—";
const signedPctPoints=value=>{
  const n=Number(value);
  if(!Number.isFinite(n))return "—";
  return `${n>0?"+":""}${(n*100).toFixed(1)} pp`;
};

const params=new URLSearchParams(location.search);
const cardName=params.get("card");
if(!cardName||typeof database==="undefined"||!Array.isArray(database.drafts)||typeof cardDatabase==="undefined"||!Array.isArray(cardDatabase)||typeof DraftStatsEngine==="undefined")return;

const focalCard=cardDatabase.find(c=>c.name===cardName);
if(!focalCard)return;

const profile=DraftStatsEngine.calculateCardProfile(
  database.drafts,
  cardDatabase,
  cardName,
  {tags:typeof TAGS!=="undefined"?TAGS:{}}
)||{
  timeline:[],trends:{},finishDistribution:{buckets:[]},pilotGallery:[],showcaseDecks:[]
};

function sanitizeDeckOwner(name){
  return String(name||"").toLowerCase().replace(/ /g,"").replace(/\./g,"");
}
function playerUrl(name){return "player.html?name="+encodeURIComponent(name);}

/* =========================================================
   TRAJECTORY ACROSS ALL FINISHED DRAFTS
   All timeline values and trend selections are Engine-owned.
========================================================= */
const timeline=Array.isArray(profile.timeline)?profile.timeline:[];

function trajectorySvg(rows){
  if(!rows.length)return '<div class="empty-01d">Brak ukończonych draftów.</div>';

  const width=Math.max(920,rows.length*54);
  const height=320;
  const pad={l:49,r:52,t:24,b:42};
  const innerW=width-pad.l-pad.r;
  const innerH=height-pad.t-pad.b;
  const xPos=i=>rows.length===1?pad.l+innerW/2:pad.l+i/(rows.length-1)*innerW;
  const yVal=v=>pad.t+innerH-(Number(v)||0)*innerH;
  const barW=Math.min(20,Math.max(7,innerW/Math.max(1,rows.length)*.38));

  const grid=[];
  for(let i=0;i<=4;i++){
    const value=1-i/4;
    const yy=pad.t+i/4*innerH;
    grid.push(`<line class="ct-grid" x1="${pad.l}" y1="${yy}" x2="${width-pad.r}" y2="${yy}"></line>`);
    grid.push(`<text class="ct-axis" x="${pad.l-7}" y="${yy+3}" text-anchor="end">${Math.round(value*100)}%</text>`);
    grid.push(`<text class="ct-axis" x="${width-pad.r+7}" y="${yy+3}" text-anchor="start">${Math.round(value*100)}%</text>`);
  }

  const bars=rows.map((row,i)=>{
    const yy=yVal(row.presence);
    return `<rect class="ct-presence" x="${xPos(i)-barW/2}" y="${yy}" width="${barW}" height="${pad.t+innerH-yy}" rx="3"></rect>`;
  }).join("");

  const wrPoints=rows.map((row,i)=>row.winRate===null?null:{i,value:row.winRate}).filter(Boolean);
  const path=wrPoints.map((point,j)=>`${j?"L":"M"} ${xPos(point.i).toFixed(1)} ${yVal(point.value).toFixed(1)}`).join(" ");
  const dots=rows.map((row,i)=>row.winRate===null
    ?`<circle class="ct-empty-dot" cx="${xPos(i)}" cy="${yVal(0)}" r="2.5"></circle>`
    :`<circle class="ct-wr-dot" cx="${xPos(i)}" cy="${yVal(row.winRate)}" r="4"></circle>`
  ).join("");

  const labelStep=rows.length>22?2:1;
  const labels=rows.map((row,i)=>i%labelStep===0
    ?`<text class="ct-draft" x="${xPos(i)}" y="${height-15}" text-anchor="middle">D${row.draftId}</text>`
    :""
  ).join("");

  const hitW=Math.max(29,innerW/Math.max(1,rows.length));
  const hits=rows.map((row,i)=>
    `<rect class="ct-hit" data-index="${i}" x="${xPos(i)-hitW/2}" y="${pad.t}" width="${hitW}" height="${innerH}"></rect>`
  ).join("");

  return `<svg viewBox="0 0 ${width} ${height}" style="min-width:${width}px" aria-label="Trajektoria karty ${esc(cardName)}">
    <defs>
      <linearGradient id="cardPresenceGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#63fff2"></stop>
        <stop offset="100%" stop-color="#476dff"></stop>
      </linearGradient>
    </defs>
    ${grid.join("")}
    ${bars}
    ${path?`<path class="ct-wr-line" d="${path}"></path>`:""}
    ${dots}
    ${labels}
    ${hits}
  </svg>`;
}

$("cardTrajectoryChart").innerHTML=trajectorySvg(timeline);

const tooltip=document.createElement("div");
tooltip.className="card-chart-tooltip";
document.body.appendChild(tooltip);

$("cardTrajectoryChart").addEventListener("mousemove",event=>{
  const hit=event.target.closest(".ct-hit");
  if(!hit){tooltip.style.display="none";return;}
  const row=timeline[Number(hit.dataset.index)];
  if(!row)return;
  tooltip.innerHTML=`<b>D${row.draftId}</b>
    ${row.appearances}/${row.totalPlayers} finalnych talii · ${pct(row.presence)} popularności<br>
    ${row.matches?`${row.wins}W–${row.losses}L · ${pct(row.winRate)} WR`:"Brak realnych meczów z kartą"}<br>
    ✦ ${row.legendPoints}${row.avgPlace!==null?` · śr. miejsce #${one(row.avgPlace)}`:""}`;
  tooltip.style.display="block";
  tooltip.style.left=`${event.clientX+14}px`;
  tooltip.style.top=`${event.clientY+14}px`;
});
$("cardTrajectoryChart").addEventListener("mouseleave",()=>{tooltip.style.display="none";});

const trends=profile.trends||{};
const peakPopularity=trends.peakPopularity||null;
const popularityMomentum=trends.popularityMomentum||{};
const biggestRise=popularityMomentum.biggestRise||null;
const biggestFall=popularityMomentum.biggestFall||null;
const longestRun=trends.longestAppearanceStreak||{length:0,startDraftId:null,endDraftId:null};

$("cardTrendFacts").innerHTML=[
  {
    label:"Szczyt popularności",
    value:peakPopularity?`D${peakPopularity.draftId} · ${pct(peakPopularity.presence)}`:"—",
    sub:peakPopularity?`${peakPopularity.appearances}/${peakPopularity.totalPlayers} finalnych talii`:"Brak danych"
  },
  {
    label:"Największy skok popularności",
    value:biggestRise?signedPctPoints(biggestRise.delta):"—",
    sub:biggestRise?`D${biggestRise.before.draftId} → D${biggestRise.after.draftId}`:"Brak kolejnych edycji"
  },
  {
    label:"Największy spadek popularności",
    value:biggestFall?signedPctPoints(biggestFall.delta):"—",
    sub:biggestFall?`D${biggestFall.before.draftId} → D${biggestFall.after.draftId}`:"Brak kolejnych edycji"
  },
  {
    label:"Najdłuższa ciągła ekspozycja",
    value:`${Number(longestRun.length)||0} draftów`,
    sub:longestRun.length?`D${longestRun.startDraftId} → D${longestRun.endDraftId}`:"Brak serii"
  }
].map(item=>`<article class="card-trend-fact"><span>${esc(item.label)}</span><b>${esc(item.value)}</b><small>${esc(item.sub)}</small></article>`).join("");

/* =========================================================
   FINISH DISTRIBUTION
========================================================= */
const finishDistribution=profile.finishDistribution||{total:0,averageFinish:null,podiumRate:0,titleRate:0,buckets:[],maxCount:1};
const buckets=(finishDistribution.buckets||[]).map(row=>[row.label,Number(row.count)||0]);
const maxCount=Number(finishDistribution.maxCount)||1;

$("cardFinishSummary").innerHTML=`
  <article class="card-finish-summary-card"><b>${finishDistribution.averageFinish===null?"—":`#${one(finishDistribution.averageFinish)}`}</b><span>Średnie miejsce</span></article>
  <article class="card-finish-summary-card"><b>${pct(finishDistribution.podiumRate)}</b><span>Występów na podium</span></article>
  <article class="card-finish-summary-card"><b>${pct(finishDistribution.titleRate)}</b><span>Występów zakończonych #1</span></article>
  <article class="card-finish-summary-card"><b>${Number(finishDistribution.total)||0}</b><span>Sklasyfikowanych talii</span></article>
`;

$("cardFinishDistribution").innerHTML=buckets.map(([label,count])=>`
  <div class="card-finish-row">
    <span class="card-finish-label">${label}</span>
    <div class="card-finish-track"><div class="card-finish-fill" style="width:${(count/maxCount*100).toFixed(1)}%"></div></div>
    <span class="card-finish-count">${count}</span>
  </div>
`).join("");

/* =========================================================
   FULL PILOT GALLERY
========================================================= */
const pilotRows=Array.isArray(profile.pilotGallery)?profile.pilotGallery:[];

$("fullPilotGallery").innerHTML=pilotRows.length?pilotRows.map((row,index)=>`
  <article class="pilot-ledger-card">
    <span class="pilot-ledger-rank">#${index+1} PILOT</span>
    <a href="${playerUrl(row.name)}"><b>${esc(row.name)}</b></a>
    <div class="pilot-ledger-stats">
      <span><strong>${row.appearances}</strong>Talii</span>
      <span><strong>${row.wins}–${row.losses}</strong>Bilans</span>
      <span><strong>${pct(row.winRate)}</strong>WR</span>
    </div>
    <div class="historic-deck-legend">✦ ${row.legendPoints} · ${row.drafts} draftów</div>
  </article>
`).join(""):'<div class="empty-01d">Brak danych o pilotach.</div>';

/* =========================================================
   HISTORICAL DECK VITRINES
========================================================= */
const showcase=Array.isArray(profile.showcaseDecks)?profile.showcaseDecks:[];

function deckImagePath(entry,extension="jpg"){
  return `assets/decks/${sanitizeDeckOwner(entry.player)}_${entry.draftId}.${extension}`;
}

$("cardDeckShowcase").innerHTML=showcase.length?showcase.map(entry=>{
  const place=Number.isFinite(entry.place)?`#${entry.place}`:"—";
  const cards=entry.mainDeck.slice(0,12);
  return `<article class="historic-deck-card">
    <div class="historic-deck-image">
      <img src="${deckImagePath(entry)}" alt="Talia ${esc(entry.player)} — D${entry.draftId}"
           data-png="${deckImagePath(entry,"png")}" data-webp="${deckImagePath(entry,"webp")}" data-image-fallback="0"
           loading="lazy"
           onerror="if(this.dataset.imageFallback==='0'){this.dataset.imageFallback='1';this.src=this.dataset.png;return;}if(this.dataset.imageFallback==='1'){this.dataset.imageFallback='2';this.src=this.dataset.webp;return;}this.closest('.historic-deck-card').classList.add('no-image')">
      <div class="historic-deck-fallback">
        ${cards.map(name=>`<span class="deck-mini-card ${name===cardName?"focal":""}">${esc(name)}</span>`).join("")}
      </div>
      <span class="deck-vitrine-badge draft">D${entry.draftId}</span>
      <span class="deck-vitrine-badge place">${place}</span>
    </div>
    <div class="historic-deck-body">
      <div class="historic-deck-pilot"><a href="${playerUrl(entry.player)}">${esc(entry.player)}</a></div>
      <div class="historic-deck-meta">
        <span><b>${entry.points}</b>Pkt</span>
        <span><b>${entry.wins}–${entry.losses}</b>Bilans</span>
        <span><b>${pct(entry.winRate)}</b>WR</span>
        <span><b>${entry.matches}</b>Mecze</span>
      </div>
      <div class="historic-deck-legend">✦ ${entry.legendPoints}${entry.isWinner?" · MISTRZOWSKA TALIA":""}</div>
    </div>
  </article>`;
}).join(""):'<div class="empty-01d">Brak historycznych talii z tym eksponatem.</div>';

})();
