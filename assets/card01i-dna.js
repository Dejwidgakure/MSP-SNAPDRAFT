(function(){
"use strict";

const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[ch]));
const pct=value=>Number.isFinite(Number(value))?`${(Number(value)*100).toFixed(1)}%`:"—";
const one=value=>Number.isFinite(Number(value))?Number(value).toFixed(1):"—";

const params=new URLSearchParams(location.search);
const cardName=params.get("card");
if(!cardName||typeof cardDatabase==="undefined"||!Array.isArray(cardDatabase)||typeof database==="undefined"||!Array.isArray(database.drafts)||typeof DraftStatsEngine==="undefined")return;

const focal=cardDatabase.find(card=>card.name===cardName);
if(!focal)return;

function cardUrl(name){
  return "card-stats.html?card="+encodeURIComponent(name);
}
function cardColor(card){
  const cost=Number(card?.cost)||0;
  const hue=(190+cost*23)%360;
  return `hsl(${hue} 90% 67%)`;
}
function categoryGlyph(category){
  return ({
    abilityTypes:'✦',
    mechanicFamilies:'⬡',
    subtypes:'⚙',
    deckArchetypes:'◇'
  })[category]||'⌗';
}
function categoryMeta(category){
  const meta=(typeof TAG_CATEGORIES!=="undefined"&&TAG_CATEGORIES?.[category])||{};
  return {
    name:meta.name||category||"Tag",
    color:meta.color||"#6ce7df",
    glow:meta.glow||"rgba(108,231,223,.35)"
  };
}

/* All synergy statistics, qualification rules and ranking are Engine-owned. */
const cardProfile=DraftStatsEngine.calculateCardProfile(
  database.drafts,
  cardDatabase,
  cardName,
  {tags:typeof TAGS!=="undefined"?TAGS:{}}
);
const synergy=cardProfile?.synergy||{
  summary:{analyzedDecks:0,uniquePartners:0,builtMechanics:0,builtArchetypes:0,minimumSynergyCards:4,minimumPartnerDrafts:2,minimumPartnerMatches:5},
  commonPartners:[],
  builtMechanics:[],
  builtArchetypes:[],
  performancePartners:[]
};
const summary=synergy.summary||{};

/* =========================================================
   LABORATORY FX — purely decorative, no data logic
========================================================= */
const fx=$("synergyDnaFx");
if(fx){
  const helix=(className,count=13)=>`<div class="synergy-helix ${className}">${Array.from({length:count},(_,i)=>`<span style="--top:${4+i*6.8}%;--rot:${i*17}deg;--scale:${(.56+(i%4)*.11).toFixed(2)};--rdelay:${(-i*.21).toFixed(2)}s"></span>`).join("")}</div>`;
  const particles=Array.from({length:20},(_,i)=>{
    const x=(11+i*37)%94;
    const y=(7+i*53)%91;
    const size=2+(i%4);
    const delay=-(i%9)*1.35;
    const duration=9+(i%7)*1.4;
    return `<i class="synergy-particle" style="--x:${x}%;--y:${y}%;--s:${size}px;--delay:${delay}s;--duration:${duration}s"></i>`;
  }).join("");
  fx.innerHTML=`${helix("helix-a",14)}${helix("helix-b",12)}${helix("helix-c",11)}<div class="synergy-particles">${particles}</div><div class="synergy-scan-sweep"></div>`;
}

/* =========================================================
   FOCAL CARD + SCAN SUMMARY
========================================================= */
const focalRoot=$("synergyFocalCard");
if(focalRoot){
  const skill=String(focal?.cardType||"").toLowerCase()==="skill";
  focalRoot.style.setProperty("--card-accent",cardColor(focal));
  focalRoot.innerHTML=`
    <div class="synergy-card-shell" style="--card-accent:${cardColor(focal)}">
      <span class="synergy-card-scan" aria-hidden="true"></span>
      <span class="synergy-card-cost">${esc(focal.cost)}</span>
      ${skill?"":`<span class="synergy-card-power">${esc(focal.power)}</span>`}
      <strong>${esc(focal.name)}</strong>
      <small>${skill?"SKILL":"CHARACTER"}</small>
    </div>`;
}

const overview=$("synergyOverview");
if(overview){
  const totalBuilt=(Number(summary.builtMechanics)||0)+(Number(summary.builtArchetypes)||0);
  const rows=[
    ["Przebadane decki",Number(summary.analyzedDecks)||0,"Każdy ukończony deck z eksponatem"],
    ["Różni partnerzy",Number(summary.uniquePartners)||0,"Unikalne karty obok eksponatu"],
    ["Złożone synergie",totalBuilt,"Mechaniki + archetypy spełniające próg"],
    ["Próg konstrukcji",`${Number(summary.minimumSynergyCards)||4}+ kart`,"Jeden wspólny tag w całym decku"]
  ];
  overview.innerHTML=rows.map(([label,value,sub])=>`<article class="synergy-overview-card"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(sub)}</small></article>`).join("");
}

/* =========================================================
   MOST COMMON PARTNERS
========================================================= */
const commonRoot=$("synergyCommonPartners");
const common=Array.isArray(synergy.commonPartners)?synergy.commonPartners:[];
if(commonRoot){
  commonRoot.innerHTML=common.length?common.map((row,index)=>`
    <a class="synergy-partner-row" href="${cardUrl(row.name)}">
      <span class="synergy-rank">${String(index+1).padStart(2,"0")}</span>
      <span class="synergy-partner-copy">
        <b>${esc(row.name)}</b>
        <small>${Number(row.sharedDecks)||0} wspólnych decków · ${Number(row.drafts)||0} draftów</small>
      </span>
      <span class="synergy-share">${pct(row.deckShare)}</span>
    </a>`).join(""):`<div class="synergy-empty">Za mało historii wspólnych decków.</div>`;
}

/* =========================================================
   BUILT SYNERGIES — same >=4 tag rule as Galactic Draft DNA
========================================================= */
function renderSynergyTags(targetId,rows){
  const root=$(targetId);
  if(!root)return;
  const data=Array.isArray(rows)?rows.slice(0,6):[];
  root.innerHTML=data.length?data.map(row=>{
    const meta=categoryMeta(row.category);
    return `<article class="synergy-tag-row" style="--tag-color:${esc(meta.color)};--tag-glow:${esc(meta.glow)}">
      <span class="synergy-tag-glyph">${categoryGlyph(row.category)}</span>
      <span class="synergy-tag-copy">
        <b>${esc(row.name)}</b>
        <small>${Number(row.decks)||0} decków · ${pct(row.coverage)} · śr. ${one(row.averageCards)} kart tagu</small>
      </span>
      <span class="synergy-tag-max">MAX ${Number(row.maxCards)||0}</span>
    </article>`;
  }).join(""):`<div class="synergy-empty">Brak decków spełniających próg ${Number(summary.minimumSynergyCards)||4} kart.</div>`;
}
renderSynergyTags("synergyBuiltMechanics",synergy.builtMechanics);
renderSynergyTags("synergyBuiltArchetypes",synergy.builtArchetypes);

/* =========================================================
   PERFORMANCE PARTNERS
========================================================= */
const performanceRoot=$("synergyPerformancePartners");
const performance=Array.isArray(synergy.performancePartners)?synergy.performancePartners:[];
if(performanceRoot){
  performanceRoot.innerHTML=performance.length?performance.map((row,index)=>`
    <a class="synergy-performance-row" href="${cardUrl(row.name)}">
      <span class="synergy-performance-medal">${index===0?"✦":String(index+1).padStart(2,"0")}</span>
      <span class="synergy-performance-copy">
        <b>${esc(row.name)}</b>
        <small>${Number(row.wins)||0}W–${Number(row.losses)||0}L · ${Number(row.matches)||0} realnych meczów · ${Number(row.sharedDecks)||0} wspólnych decków</small>
      </span>
      <span class="synergy-wr">${pct(row.winRate)}</span>
    </a>`).join("")+`<div class="synergy-sample-note">Próg: min. ${Number(summary.minimumPartnerDrafts)||2} wspólne drafty i ${Number(summary.minimumPartnerMatches)||5} realnych meczów.</div>`
    :`<div class="synergy-empty">Brak partnerów z wymaganą próbką: min. ${Number(summary.minimumPartnerDrafts)||2} wspólne drafty i ${Number(summary.minimumPartnerMatches)||5} realnych meczów.</div>`;
}

})();
