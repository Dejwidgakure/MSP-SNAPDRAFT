(function(){
"use strict";

const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[ch]));
const pct=value=>Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:"—";
const dec=(value,d=1)=>Number.isFinite(Number(value))?Number(value).toFixed(d):"—";
const signed=value=>{
  const n=Number(value);
  if(!Number.isFinite(n))return "—";
  return `${n>0?"+":""}${Math.round(n)}`;
};

const params=new URLSearchParams(location.search);
const playerName=params.get("name");
if(!playerName||typeof DraftStatsEngine==="undefined"||typeof database==="undefined"||!Array.isArray(database.drafts))return;

const profile=DraftStatsEngine.calculatePlayerProfile(database.drafts,playerName);
if(!profile)return;

const s=profile.summary||{};
const b=profile.battle||{};
const r=profile.records||{};
const rivals=profile.rivalries||{};
const history=(profile.history||[]).slice().sort((a,c)=>Number(a.draftId)-Number(c.draftId));

/* =========================================================
   ALL-TIME POINT ANATOMY
========================================================= */
const anatomy=profile.anatomy||{};
const pointShares=anatomy.pointShares||{total:0,win:{points:0,share:0},loss:{points:0,share:0}};
$("pointsTotal").textContent=Math.round(Number(pointShares.total)||0).toLocaleString("pl-PL");

const segmentRows=[
  {key:"win",label:"Zwycięstwa",value:Number(pointShares.win?.points)||0,share:Number(pointShares.win?.share)||0},
  {key:"loss",label:"Porażki",value:Number(pointShares.loss?.points)||0,share:Number(pointShares.loss?.share)||0}
];

$("pointSplitTrack").innerHTML=segmentRows.map(row=>
  `<div class="point-segment ${row.key}" style="width:${(row.share*100).toFixed(3)}%"></div>`
).join("");

$("pointSplitLegend").innerHTML=segmentRows.map(row=>`
  <div class="point-legend-item ${row.key}">
    <b>${Math.round(row.value).toLocaleString("pl-PL")} · ${pct(row.share)}</b>
    ${esc(row.label)}
  </div>
`).join("");

const pointKpis=[
  ["Średnio / draft",s.averageDraftPoints],
  ["Średnio / realny mecz",s.averagePlayedPoints],
  ["Średnio w wygranej",s.averagePlayedWinPoints],
  ["Średnio w porażce",s.averagePlayedLossPoints]
];

$("pointKpis").innerHTML=pointKpis.map(([label,value])=>`
  <div class="point-kpi"><span>${esc(label)}</span><b>${dec(value,1)} pkt</b></div>
`).join("");

const played=Number(s.playedMatches)||0;
const walkovers=Number(s.walkoverMatches)||0;
const doubleWalkovers=Number(s.doubleWalkovers)||0;
$("matchBreakdown").innerHTML=`
  <span class="match-pill"><b>${played}</b> realnych meczów</span>
  <span class="match-pill"><b>${walkovers}</b> walkowerów</span>
  <span class="match-pill"><b>${doubleWalkovers}</b> podwójnych walkowerów</span>
`;

/* =========================================================
   SNAP BATTLE ANATOMY
========================================================= */
$("battleDuels").innerHTML=`
  <div class="battle-duel">
    <div class="battle-side positive"><b>${Number(b.cleanWins)||0}</b><small>czyste zwycięstwa</small></div>
    <div class="battle-score">25–0 / 0–25</div>
    <div class="battle-side negative"><b>${Number(b.cleanLosses)||0}</b><small>czyste porażki</small></div>
  </div>
  <div class="battle-duel">
    <div class="battle-side positive"><b>${Number(b.lastLifeWins)||0}</b><small>wygrane o włos</small></div>
    <div class="battle-score">16–9 / 9–16</div>
    <div class="battle-side negative"><b>${Number(b.lastLifeLosses)||0}</b><small>porażki o włos</small></div>
  </div>
`;

$("battleAverages").innerHTML=`
  <div class="battle-average">
    <span>Śr. pozostałych żyć po wygranej</span>
    <b>${dec(b.averageLivesRemainingOnWin,2)}</b>
  </div>
  <div class="battle-average">
    <span>Śr. odebranych żyć przy porażce</span>
    <b>${dec(b.averageDamageDealtOnLoss,2)}</b>
  </div>
`;

/* =========================================================
   FINISH DISTRIBUTION
========================================================= */
const finishes=(anatomy.finishDistribution||[]).map(row=>[row.label,Number(row.count)||0]);
const maxFinishCount=Number(anatomy.maxFinishCount)||1;

$("finishSummary").innerHTML=`
  <div class="finish-summary-card"><b>${s.averageFinish===null||s.averageFinish===undefined?"—":`#${dec(s.averageFinish,2)}`}</b><span>Średnie miejsce</span></div>
  <div class="finish-summary-card"><b>${pct(s.podiumRate)}</b><span>Draftów na podium</span></div>
`;

$("finishDistribution").innerHTML=finishes.map(([label,count])=>`
  <div class="finish-row">
    <span class="finish-label">${esc(label)}</span>
    <div class="finish-track"><div class="finish-fill" style="width:${(count/maxFinishCount*100).toFixed(1)}%"></div></div>
    <span class="finish-count">${count}</span>
  </div>
`).join("");

/* =========================================================
   TRAJECTORY + MOMENTUM
========================================================= */
const dynamics=profile.dynamics||{};
const glowUp=dynamics.biggestRise||null;
const fall=dynamics.biggestFall||null;
const pointsJump=dynamics.biggestPointsRise||null;
const consecutive=profile.streaks?.consecutiveDraftAppearances||{length:0,startDraftId:null,endDraftId:null};

function transitionText(row){
  if(!row)return ["Brak danych","Za mało kolejnych występów"];
  return [
    `D${row.before.draftId} #${row.before.place} → D${row.after.draftId} #${row.after.place}`,
    `${signed(row.pointsDelta)} pkt między edycjami`
  ];
}
const [glowValue,glowSub]=transitionText(glowUp);
const [fallValue,fallSub]=transitionText(fall);

const momentum=[
  {cls:"positive",label:"Największy glow-up",value:glowValue,sub:glowSub},
  {cls:"negative",label:"Największy zjazd",value:fallValue,sub:fallSub},
  {
    cls:"positive",
    label:"Największy skok punktów",
    value:pointsJump?`${signed(pointsJump.delta)} pkt`:"Brak danych",
    sub:pointsJump?`D${pointsJump.before.draftId} → D${pointsJump.after.draftId}`:"Za mało występów"
  },
  {
    cls:"",
    label:"Najdłuższa ciągła obecność",
    value:`${Number(consecutive.length)||0} draftów`,
    sub:consecutive.length?`D${consecutive.startDraftId} → D${consecutive.endDraftId}`:"Brak serii"
  }
];

$("momentumGrid").innerHTML=momentum.map(item=>`
  <article class="momentum-card ${item.cls}">
    <span>${esc(item.label)}</span><b>${esc(item.value)}</b><small>${esc(item.sub)}</small>
  </article>
`).join("");

function trajectorySvg(rows){
  if(!rows.length)return '<div class="empty-note-02a">Brak historii do narysowania wykresu.</div>';

  const width=Math.max(900,rows.length*66);
  const height=326;
  const pad={l:48,r:52,t:26,b:43};
  const innerW=width-pad.l-pad.r;
  const innerH=height-pad.t-pad.b;
  const maxPoints=Math.max(1,...rows.map(x=>Number(x.points)||0));
  const maxPlace=Math.max(2,...rows.map(x=>Math.max(Number(x.place)||1,Number(x.playerCount)||1)));
  const x=i=>rows.length===1?pad.l+innerW/2:pad.l+(i/(rows.length-1))*innerW;
  const yPoints=v=>pad.t+innerH-(Number(v)||0)/maxPoints*innerH;
  const yPlace=p=>pad.t+((Math.max(1,Number(p)||1)-1)/(maxPlace-1))*innerH;
  const barWidth=Math.min(24,Math.max(9,innerW/Math.max(1,rows.length)*.38));

  const grid=[];
  for(let i=0;i<=4;i++){
    const yy=pad.t+(i/4)*innerH;
    const val=Math.round(maxPoints*(1-i/4));
    grid.push(`<line class="chart-grid" x1="${pad.l}" y1="${yy}" x2="${width-pad.r}" y2="${yy}"></line>`);
    grid.push(`<text class="chart-axis-label" x="${pad.l-8}" y="${yy+3}" text-anchor="end">${val}</text>`);
  }

  const rightLabels=[
    {p:1,y:yPlace(1)},
    {p:Math.max(1,Math.round((maxPlace+1)/2)),y:yPlace(Math.max(1,Math.round((maxPlace+1)/2)))},
    {p:maxPlace,y:yPlace(maxPlace)}
  ];

  const bars=rows.map((row,i)=>{
    const xx=x(i)-barWidth/2;
    const yy=yPoints(row.points);
    return `<rect class="chart-bar" x="${xx}" y="${yy}" width="${barWidth}" height="${pad.t+innerH-yy}" rx="4"></rect>`;
  }).join("");

  const path=rows.map((row,i)=>`${i?"L":"M"} ${x(i).toFixed(1)} ${yPlace(row.place).toFixed(1)}`).join(" ");
  const dots=rows.map((row,i)=>`<circle class="chart-place-dot" cx="${x(i)}" cy="${yPlace(row.place)}" r="4.5"></circle>`).join("");

  const step=rows.length>18?2:1;
  const labels=rows.map((row,i)=>i%step===0
    ?`<text class="chart-draft-label" x="${x(i)}" y="${height-16}" text-anchor="middle">D${esc(row.draftId)}</text>`
    :""
  ).join("");

  const hits=rows.map((row,i)=>{
    const hitW=Math.max(34,innerW/Math.max(1,rows.length));
    return `<rect class="chart-hit" data-index="${i}" x="${x(i)-hitW/2}" y="${pad.t}" width="${hitW}" height="${innerH}"></rect>`;
  }).join("");

  return `<svg viewBox="0 0 ${width} ${height}" style="min-width:${width}px" aria-label="Wykres kariery ${esc(playerName)}">
    <defs>
      <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#7ef8ff"></stop>
        <stop offset="100%" stop-color="#3b70ff"></stop>
      </linearGradient>
    </defs>
    ${grid.join("")}
    ${rightLabels.map(row=>`<text class="chart-axis-label" x="${width-pad.r+9}" y="${row.y+3}" text-anchor="start">#${row.p}</text>`).join("")}
    ${bars}
    <path class="chart-place-line" d="${path}"></path>
    ${dots}
    ${labels}
    ${hits}
  </svg>`;
}

$("careerTrajectory").innerHTML=trajectorySvg(history);

const tooltip=document.createElement("div");
tooltip.className="chart-tooltip";
document.body.appendChild(tooltip);

$("careerTrajectory").addEventListener("mousemove",event=>{
  const hit=event.target.closest(".chart-hit");
  if(!hit){tooltip.style.display="none";return;}
  const row=history[Number(hit.dataset.index)];
  if(!row)return;
  tooltip.innerHTML=`<b>D${esc(row.draftId)} · #${esc(row.place)}/${esc(row.playerCount)}</b><br>${esc(row.points)} pkt · ${esc(row.wins)}W–${esc(row.losses)}L · ${pct(row.winRate)} WR`;
  tooltip.style.display="block";
  tooltip.style.left=`${event.clientX+14}px`;
  tooltip.style.top=`${event.clientY+14}px`;
});
$("careerTrajectory").addEventListener("mouseleave",()=>{tooltip.style.display="none";});

/* =========================================================
   SHADOWS + PERFORMANCE SPECTRUM
========================================================= */
const worstPlace=r.worstFinish;
const lowestPoints=r.lowestPointsDraft;
const worstWR=r.worstWinRateDraft;
const lossStreak=profile.streaks?.longestLossStreak||{length:0};

const shadows=[
  {
    label:"Najniższy wynik punktowy",
    value:lowestPoints?`${lowestPoints.points} pkt · D${lowestPoints.draftId}`:"—",
    sub:lowestPoints?`#${lowestPoints.place} · ${lowestPoints.wins}W–${lowestPoints.losses}L`:"Brak danych"
  },
  {
    label:"Najgorsze miejsce",
    value:worstPlace?`#${worstPlace.place} · D${worstPlace.draftId}`:"—",
    sub:worstPlace?`${worstPlace.points} pkt · ${pct(worstPlace.winRate)} WR`:"Brak danych"
  },
  {
    label:"Najniższy WR w edycji",
    value:worstWR?`${pct(worstWR.winRate)} · D${worstWR.draftId}`:"—",
    sub:worstWR?`${worstWR.wins}W–${worstWR.losses}L · #${worstWR.place}`:"Brak danych"
  },
  {
    label:"Najdłuższa seria porażek",
    value:`${Number(lossStreak.length)||0}`,
    sub:lossStreak.length?`D${lossStreak.startDraftId} → D${lossStreak.endDraftId}`:"Brak serii"
  }
];

$("shadowGrid").innerHTML=shadows.map(item=>`
  <article class="shadow-card">
    <span>${esc(item.label)}</span><b>${esc(item.value)}</b><small>${esc(item.sub)}</small>
  </article>
`).join("");

const performanceSpectrum=profile.performanceSpectrum||{};
const best3=Array.isArray(performanceSpectrum.best)?performanceSpectrum.best:[];
const hard3=Array.isArray(performanceSpectrum.hardest)?performanceSpectrum.hardest:[];

function performanceRows(rows){
  return rows.map(row=>`
    <div class="spectrum-row">
      <span class="spectrum-draft">D${esc(row.draftId)}</span>
      <span class="spectrum-main"><b>#${esc(row.place)} · ${esc(row.points)} pkt</b><small>${esc(row.wins)}W–${esc(row.losses)}L · ${pct(row.winRate)} WR</small></span>
      <span class="spectrum-score">✦ ${esc(row.legendPoints||0)}</span>
    </div>
  `).join("")||'<div class="empty-note-02a">Brak danych.</div>';
}

$("bestPerformances").innerHTML=performanceRows(best3);
$("hardPerformances").innerHTML=performanceRows(hard3);

/* =========================================================
   FULL RIVAL MAP
========================================================= */
const allRivals=(rivals.rivals||[]).slice();
const minimum=Number(rivals.minimumMatches)||0;
$("rivalMap").innerHTML=allRivals.length?allRivals.map(row=>{
  const wr=Math.max(0,Math.min(1,Number(row.winRate)||0));
  return `<article class="rival-map-row">
    <div class="rival-map-top">
      <span class="rival-map-name">${esc(row.name)}</span>
      <span class="rival-map-record">${row.wins}–${row.losses} · ${pct(wr)}</span>
    </div>
    <div class="rival-map-track"><div class="rival-map-fill" style="width:${(wr*100).toFixed(1)}%"></div></div>
    <div class="rival-map-bottom">
      <span>${row.matches} realnych meczów</span>
      <span class="${row.matches>=minimum?"rival-qualified":""}">${row.matches>=minimum?"kwalifikowana próbka":`próbka < ${minimum}`}</span>
    </div>
  </article>`;
}).join(""):'<div class="empty-note-02a">Brak realnych pojedynków H2H.</div>';

})();