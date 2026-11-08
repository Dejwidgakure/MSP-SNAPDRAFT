(function(){
"use strict";

const EXCLUDED_PERMANENT_BANS = new Set(["Arishem","Loki"]);
const LIMIT = 10;

const esc = value => String(value ?? "")
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;");

function cardUrl(name){
  return `card-stats.html?card=${encodeURIComponent(name)}`;
}


function buildBanRanking(){
  const root=document.getElementById("mostBannedCards");
  if(!root)return;

  const drafts = (typeof database!=="undefined" && Array.isArray(database?.drafts))
    ? database.drafts
    : [];

  const cards = (typeof cardDatabase!=="undefined" && Array.isArray(cardDatabase))
    ? cardDatabase
    : [];

  const cardByName=new Map(cards.filter(Boolean).map(card=>[card.name,card]));
  if(typeof DraftStatsEngine==="undefined" || typeof DraftStatsEngine.calculateBanRanking!=="function"){
    root.innerHTML='<div class="ban-cards-empty">Silnik statystyk nie udostępnia rankingu banów.</div>';
    return;
  }

  const rows=DraftStatsEngine.calculateBanRanking(drafts,{
    excludedNames:[...EXCLUDED_PERMANENT_BANS],
    limit:LIMIT
  }).map(row=>({...row,card:cardByName.get(row.name)||null}));

  if(!rows.length){
    root.innerHTML='<div class="ban-cards-empty">Brak zapisanej historii banów w ukończonych draftach.</div>';
    return;
  }

  root.innerHTML=rows.map((row,index)=>{
    const cost=row.card?.cost ?? "—";
    const power=row.card?.power ?? "—";
    const isSkill=row.card?.cardType==="Skill";
    const body=`<span class="ban-card-shell">
      <span class="ban-rank">#${index+1}</span>
      <span class="ban-cost">${esc(cost)}</span>
      ${isSkill?"":`<span class="ban-power">${esc(power)}</span>`}
      <b class="ban-card-name">${esc(row.name)}</b>
      <span class="ban-card-count">${row.bans} ${row.bans===1?"DRAFT":"DRAFTY"}</span>
    </span>`;

    return row.card
      ? `<a class="ban-stat-card" href="${cardUrl(row.name)}" title="${esc(row.name)} — ${row.bans} ukończonych draftów z banem">${body}</a>`
      : `<div class="ban-stat-card" title="${esc(row.name)} — ${row.bans} ukończonych draftów z banem">${body}</div>`;
  }).join("");
}

buildBanRanking();
})();
