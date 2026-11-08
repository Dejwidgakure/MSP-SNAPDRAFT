(function(){
"use strict";

const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const playerName=params.get("name");

const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[ch]));
const attr=value=>esc(value).replace(/`/g,"&#096;");
const pct=value=>Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:"—";
const num=(value,digits=0)=>Number.isFinite(Number(value))?Number(value).toFixed(digits):"—";
const recordText=row=>row?`${row.wins}W–${row.losses}L · ${pct(row.winRate)}`:"—";

if(typeof database==="undefined"||!Array.isArray(database.drafts)||typeof DraftStatsEngine==="undefined"){
  $("playerName").textContent="Błąd danych";
  return;
}

const profile=playerName?DraftStatsEngine.calculatePlayerProfile(database.drafts,playerName):null;
$("playerName").textContent=playerName||"Nieznany Wojownik";
$("playerScanName").textContent=playerName||"WOJOWNIK";

const hero=PlayerVisuals.getHero(playerName||"");
if(hero){
  $("heroCharacter").src=hero.file;
  $("heroSignature").textContent="AKTYWNY PROFIL WOJOWNIKA · DANE HISTORYCZNE";
  $("profileStage").setAttribute("style",PlayerVisuals.heroStyle(hero));
}

function empty(id,message){
  const node=$(id);
  if(node) node.innerHTML=`<div class="empty-note-02a">${esc(message)}</div>`;
}

if(!profile){
  $("rank").textContent="Brak kanonicznych danych";
  ["signatureMain","signatureFacts","careerGrid","recordGrid","rivalGrid","draftHistory","arsenalGrid","achievementGrid"]
    .forEach(id=>empty(id,"Brak danych tego wojownika w ukończonych draftach."));
  return;
}

const s=profile.summary;
const r=profile.records||{};
const rivals=profile.rivalries||{};
const history=(profile.history||[]).slice().sort((a,b)=>Number(b.draftId)-Number(a.draftId));

const rankText=s.legendRank?`#${s.legendRank} RANKINGU LEGEND`:"POZA RANKINGIEM";
$("rank").innerHTML=`${rankText} · <span class="legend-star">✦</span> ${s.legendPoints} PUNKTÓW LEGEND`;

$("quickStrip").innerHTML=[
 ["Drafty",s.drafts],
 ["Tytuły",s.draftWins],
 ["Podia",s.podiums],
 ["Bilans",`${s.wins}–${s.losses}`],
 ["Mecze",s.officialMatches],
 ["Punkty",s.draftPoints]
].map(([label,value])=>`<div class="quick-stat"><b>${value}</b><span>${label}</span></div>`).join("");

const cardByName=new Map(
  typeof cardDatabase!=="undefined"&&Array.isArray(cardDatabase)
    ? cardDatabase.map(card=>[card.name,card])
    : []
);

const cardHighlights=profile.cardHighlights||{};
const mostUsed=cardHighlights.mostUsed||null;
const bestCard=cardHighlights.bestQualified||null;
const mostWinsCard=cardHighlights.mostWins||null;
const legendaryCard=cardHighlights.mostLegend||null;
const minMatches=Number(cardHighlights.minimumMatches)||DraftStatsEngine.SAMPLE_THRESHOLDS?.GLOBAL_CARD_WR_MATCHES||5;
const mostFrequentRival=rivals.mostFrequentRival||null;

const bestPerformance=r.bestFinish||profile.topPerformances?.[0]||profile.history?.[0]||null;

$("signatureMain").hidden=true;
$("signatureMain").innerHTML="";

const signatureFacts=[
  {
    label:"Najlepszy występ",
    value:bestPerformance?`D${bestPerformance.draftId} · #${bestPerformance.place}`:"—",
    sub:bestPerformance?`${bestPerformance.points} pkt · ${bestPerformance.wins}W–${bestPerformance.losses}L`:""
  },
  {
    label:"Najczęstszy rywal",
    value:mostFrequentRival?mostFrequentRival.name:"—",
    sub:mostFrequentRival?`${mostFrequentRival.matches} meczów · ${recordText(mostFrequentRival)}`:"Brak realnych pojedynków"
  },
  {
    label:"Karta sygnaturowa",
    value:mostUsed?mostUsed.name:"—",
    sub:mostUsed?`${mostUsed.appearances} występów w decku gracza · ${mostUsed.wins} zwycięstw`:"Brak zapisanych występów kart"
  },
  {
    label:"Najdłuższa seria",
    value:`${profile.streaks?.longestWinStreak?.length||0} zwycięstw`,
    sub:profile.streaks?.longestWinStreak?.length
      ?`D${profile.streaks.longestWinStreak.startDraftId} → D${profile.streaks.longestWinStreak.endDraftId}`
      :"Brak serii"
  }
];

$("signatureFacts").innerHTML=signatureFacts.map(f=>`
  <div class="signature-fact">
    <b>${esc(f.label)}</b><span>${esc(f.value)}</span>${f.sub?`<small>${esc(f.sub)}</small>`:""}
  </div>
`).join("");

const career=[
  {
    cls:"legend",label:"Ranking Legend",value:s.legendRank?`#${s.legendRank}`:"—",
    sub:s.legendRank?`✦ ${s.legendPoints} Punktów Legend`:`✦ ${s.legendPoints} Punktów Legend · poza rankingiem`
  },
  {
    label: "Win Rate (Całkowity)", 
    value: pct(s.winRate), 
    sub: `${s.wins}W–${s.losses}L · wszystkie mecze`
  },
  {
    label: "Win Rate (Realny)", 
    value: pct(s.playedWinRate), 
    sub: `${s.playedWins}W–${s.playedLosses}L · bez walkowerów`
  },
  {label:"Punkty draftowe",value:s.draftPoints,sub:`średnio ${num(s.averageDraftPoints,1)} / draft`},
  {label:"Średnie miejsce",value:s.averageFinish===null?"—":`#${num(s.averageFinish,2)}`,sub:`${pct(s.podiumRate)} draftów na podium`},
  {label:"Punkty w porażkach",value:s.lossPoints,sub:"punkty draftowe zdobyte w przegranych meczach"}
];

$("careerGrid").innerHTML=career.map(item=>`
  <article class="career-card ${item.cls||""}">
    <span class="metric-label">${esc(item.label)}</span>
    <span class="metric-value">${esc(item.value)}</span>
    <span class="metric-sub">${esc(item.sub||"")}</span>
  </article>
`).join("");
const highest=r.highestPointsDraft;
const mostWins=r.mostWinsDraft;
const bestWR=r.bestWinRateDraft;
const bestFinish=r.bestFinish;

const records=[
  {
    label:"Najwięcej punktów",
    value:highest?`${highest.points} pkt · D${highest.draftId}`:"—",
    sub:highest?`${highest.wins}W–${highest.losses}L · #${highest.place}`:""
  },
  {
    label:"Najwięcej zwycięstw",
    value:mostWins?`${mostWins.wins} · D${mostWins.draftId}`:"—",
    sub:mostWins?`${pct(mostWins.winRate)} WR · ${mostWins.points} pkt`:""
  },
  {
    label:"Najlepszy WR w edycji",
    value:bestWR?`${pct(bestWR.winRate)} · D${bestWR.draftId}`:"—",
    sub:bestWR?`${bestWR.wins}W–${bestWR.losses}L · #${bestWR.place}`:""
  },
  {
    label:"Najlepsze miejsce",
    value:bestFinish?`#${bestFinish.place} · D${bestFinish.draftId}`:"—",
    sub:bestFinish?`${r.bestFinishCount||1}× osiągnięte · ${bestFinish.points} pkt`:""
  },
  {
    label:"Najdłuższa seria zwycięstw",
    value:`${profile.streaks?.longestWinStreak?.length||0}`,
    sub:profile.streaks?.longestWinStreak?.length
      ?`D${profile.streaks.longestWinStreak.startDraftId} → D${profile.streaks.longestWinStreak.endDraftId}`
      :"Brak serii"
  },
  {
    label:"Czyste zwycięstwa",
    value:profile.battle?.cleanWins||0,
    sub:`z ${profile.battle?.eligibleMatches||0} meczów kwalifikowanych do statystyk Battle`
  }
];

$("recordGrid").innerHTML=records.map(item=>`
  <article class="record-card">
    <span class="record-label">${esc(item.label)}</span>
    <span class="record-value">${esc(item.value)}</span>
    <span class="record-sub">${esc(item.sub||"")}</span>
  </article>
`).join("");

const rivalDefs=[
  ["Arcyrival","Najczęściej spotykany przeciwnik",rivals.archrival],
  ["Pogromca","Najwyższy WR w kwalifikowanej rywalizacji",rivals.dominatedOpponent],
  ["Nemezis","Najtrudniejszy kwalifikowany rywal",rivals.nemesis],
  ["Najbardziej wyrównany","Bilans najbliższy 50/50",rivals.closestRival]
];

function rivalCard(type,description,row){
  if(!row){
    return `<article class="rival-card"><span class="rival-type">${esc(type)}</span><div class="empty-note-02a">Za mało rozegranych meczów.</div></article>`;
  }
  return `<article class="rival-card">
    <span class="rival-type">${esc(type)} · ${esc(description)}</span>
    <div class="rival-versus">
      <div class="rival-player">${esc(playerName)}</div>
      <div class="vs-orb">VS</div>
      <div class="rival-opponent">${esc(row.name)}</div>
    </div>
    <div class="rival-result">
      <span><b>${row.wins}–${row.losses}</b>Bilans</span>
      <span><b>${pct(row.winRate)}</b>WR</span>
      <span><b>${row.matches}</b>Mecze</span>
    </div>
  </article>`;
}

$("rivalGrid").innerHTML=rivalDefs.map(def=>rivalCard(...def)).join("");

function sanitizeDeckOwner(name){
  return String(name||"").toLowerCase().replace(/ /g,"").replace(/\./g,"");
}
function deckImagePath(name,draftId){
  return `assets/decks/${sanitizeDeckOwner(name)}_${draftId}.jpg`;
}
function medalLabel(item){
  if(item.isWinner)return "MISTRZ";
  if(Number(item.place)===2)return "II MIEJSCE";
  if(Number(item.place)===3)return "III MIEJSCE";
  return "";
}

$("draftHistory").innerHTML=history.length?history.map(item=>{
  const medal=medalLabel(item);
  const deckNames=(item.deck||[]).join(" · ");
  const sideboardNames=(item.sideboard||[]).join(" · ");
  return `<a class="draft-history-card" href="draft.html?id=${encodeURIComponent(item.draftId)}">
    <div class="draft-thumb">
      <img src="${attr(deckImagePath(playerName,item.draftId))}"
           alt="Talia ${attr(playerName)} — Draft ${attr(item.draftId)}"
           loading="lazy"
           onerror="this.closest('.draft-history-card').classList.add('no-image');this.remove()">
      <span class="draft-badge">D${esc(item.draftId)}</span>
      ${medal?`<span class="draft-medal">${medal}</span>`:""}
    </div>
    <div class="draft-body">
      <div class="draft-place">#${esc(item.place||"?")} · ${esc(item.points)} pkt</div>
      <div class="draft-core">
        <span><b>${esc(item.wins)}–${esc(item.losses)}</b>Bilans</span>
        <span><b>${pct(item.winRate)}</b>WR</span>
        <span><b>${esc(item.matches)}</b>Mecze</span>
      </div>
      <div class="draft-legend-award">${Number(item.legendPoints)>0?`✦ +${esc(item.legendPoints)} Punktów Legend`:"Bez Punktów Legend"}</div>
      <div class="draft-deck-fallback"><b>MAIN DECK:</b> ${esc(deckNames||"Brak zapisanego składu talii")}${sideboardNames?`<br><b>PLANETARNA REZERWA:</b> ${esc(sideboardNames)}`:""}</div>
    </div>
  </a>`;
}).join(""):`<div class="empty-note-02a">Brak ukończonych draftów tego wojownika.</div>`;

function arsenalCard(kind,row,metric,sub){
  if(!row){
    return `<div class="arsenal-card"><div class="arsenal-body"><span class="arsenal-kind">${esc(kind)}</span><span class="arsenal-metric">Brak danych</span><span class="arsenal-sub">${esc(sub||"")}</span></div></div>`;
  }

  const card=cardByName.get(row.name)||{};
  const cost=Number.isFinite(Number(card.cost))?card.cost:"?";
  const power=Number.isFinite(Number(card.power))?card.power:"?";
  const isSkill=card.cardType==="Skill";

  return `<a class="arsenal-card" href="card-stats.html?card=${encodeURIComponent(row.name)}">
    <div class="arsenal-card-top">
      <span class="arsenal-cost">${esc(cost)}</span>
      ${isSkill?"":`<span class="arsenal-power">${esc(power)}</span>`}
      <span class="arsenal-name">${esc(row.name)}</span>
    </div>
    <div class="arsenal-body">
      <span class="arsenal-kind">${esc(kind)}</span>
      <span class="arsenal-metric">${esc(metric)}</span>
      <span class="arsenal-sub">${esc(sub||"")}</span>
    </div>
  </a>`;
}

$("arsenalGrid").innerHTML=[
  arsenalCard(
    "Najczęstsza karta",
    mostUsed,
    mostUsed?`${mostUsed.appearances} występów`:"—",
    mostUsed?`${mostUsed.wins}W–${mostUsed.losses}L · ${mostUsed.matches} realnych meczów`:""
  ),
  arsenalCard(
    "Najskuteczniejsza karta",
    bestCard,
    bestCard?`${pct(bestCard.winRate)} WR`:"—",
    bestCard?`${bestCard.wins}W–${bestCard.losses}L · ${bestCard.matches} meczów`:`Minimum ${minMatches} realnych meczów`
  ),
  arsenalCard(
    "Najwięcej zwycięstw",
    mostWinsCard,
    mostWinsCard?`${mostWinsCard.wins} zwycięstw`:"—",
    mostWinsCard?`${pct(mostWinsCard.winRate)} WR · ${mostWinsCard.appearances} występów`:""
  ),
  arsenalCard(
    "Najwięcej ✦ z graczem",
    legendaryCard,
    legendaryCard?`✦ ${legendaryCard.legendPoints}`:"—",
    legendaryCard?`${legendaryCard.titleDecks} tytułów · ${legendaryCard.podiumDecks} podiów z kartą`:""
  )
].join("");

const topArsenal=Array.isArray(cardHighlights.topArsenal)?cardHighlights.topArsenal:[];

$("arsenalChips").innerHTML=topArsenal.map(row=>
  `<a class="arsenal-chip" href="card-stats.html?card=${encodeURIComponent(row.name)}">${esc(row.name)} · ${row.appearances} występów</a>`
).join("");

const achievements=Array.isArray(profile.achievements)?profile.achievements:[];

$("achievementGrid").innerHTML=achievements.length?achievements.map(item=>`
  <article class="achievement ${item.cls||""}">
    <b>${esc(item.title)}</b>
    <small>${esc(item.sub)}</small>
  </article>
`).join(""):`<div class="empty-note-02a">Brak zapisanych osiągnięć historycznych.</div>`;

function fitPlayerScanName(){
  const el=$("playerScanName");
  if(!el)return;
  let size=15,min=8;
  el.style.fontSize=size+"px";
  const available=Math.max(0,el.parentElement.clientWidth*.72);
  while(size>min&&el.scrollWidth>available){
    size-=1;
    el.style.fontSize=size+"px";
  }
}

requestAnimationFrame(fitPlayerScanName);
window.addEventListener("resize",()=>requestAnimationFrame(fitPlayerScanName));

})();