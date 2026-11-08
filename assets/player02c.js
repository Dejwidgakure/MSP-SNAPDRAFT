(function(){
"use strict";

const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[ch]));

const params=new URLSearchParams(location.search);
const playerName=params.get("name");
if(!playerName||typeof database==="undefined"||!Array.isArray(database.drafts)||typeof DraftStatsEngine==="undefined")return;

const profile=DraftStatsEngine.calculatePlayerProfile(database.drafts,playerName,{
  cards:typeof cardDatabase!=="undefined"&&Array.isArray(cardDatabase)?cardDatabase:[]
});
if(!profile)return;

if($("heroSignature")){
  $("heroSignature").textContent="OSOBISTA TWIERDZA · HISTORIA I STATYSTYKI GRACZA";
}

const cardByName=new Map(
  typeof cardDatabase!=="undefined"&&Array.isArray(cardDatabase)
    ? cardDatabase.map(card=>[card.name,card])
    : []
);

// DraftStatsEngine owns the signature deck selection and all deck curiosities.
const deckProfile=profile.deckProfile||{};
const signatureDeck=Array.isArray(deckProfile.signatureDeck)?deckProfile.signatureDeck:[];

$("signatureDeckGrid").innerHTML=signatureDeck.length?signatureDeck.map((row,index)=>{
  const card=cardByName.get(row.name)||{};
  const cost=Number.isFinite(Number(card.cost))?card.cost:"?";
  const power=Number.isFinite(Number(card.power))?card.power:"?";
  const isSkill=card.cardType==="Skill";

  return `<a class="fortress-card"
             href="card-stats.html?card=${encodeURIComponent(row.name)}"
             style="--delay:${(-index*.19).toFixed(2)}s"
             title="${esc(row.name)} · ${row.appearances} występów w decku gracza">
      <span class="fortress-card-number">#${index+1}</span>
      <span class="fortress-card-cost">${esc(cost)}</span>
      ${isSkill?"":`<span class="fortress-card-power">${esc(power)}</span>`}
      <span class="fortress-card-core"><span class="fortress-card-name">${esc(row.name)}</span></span>
      <span class="fortress-card-frequency">${row.appearances}× w decku gracza</span>
    </a>`;
}).join(""):'<div class="signature-deck-empty">Brak wystarczających danych o występach kart.</div>';

if($("signatureDeckSummary")){
  const averages=deckProfile.deckAverages||{};
  const metric=value=>Number.isFinite(Number(value))?Number(value).toFixed(2).replace(".",","):"—";
  $("signatureDeckSummary").innerHTML=`
    <span class="signature-deck-average-context">
      <small>Średnie statystyki</small>
      <b>Wszystkich decków wojownika</b>
    </span>
    <span class="signature-deck-average">
      <small>Średni koszt talii</small>
      <b>${metric(averages.averageCost)}</b>
    </span>
    <span class="signature-deck-average">
      <small>Średnia siła talii</small>
      <b>${metric(averages.averagePower)}</b>
    </span>`;
}

// All curiosity selection and calculations are owned by DraftStatsEngine.
const curiosities=profile.curiosities||{};
const deckLore=Array.isArray(curiosities.deck)?curiosities.deck:[];
const careerLore=Array.isArray(curiosities.career)?curiosities.career:[];
const renderLore=rows=>rows.map(item=>`
  <article class="fortress-lore-card">
    <span>${esc(item.label)}</span>
    <b>${esc(item.value)}</b>
    <small>${esc(item.sub||"")}</small>
  </article>
`).join("");

$("fortressLoreGrid").innerHTML=renderLore(deckLore);
if($("warriorLoreGrid")) $("warriorLoreGrid").innerHTML=renderLore(careerLore);

})();