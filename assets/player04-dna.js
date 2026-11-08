(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
const pct=value=>`${(Number(value||0)*100).toFixed(1).replace(".",",")}%`;
const dec=value=>Number(value||0).toFixed(1).replace(".",",");
const plural=(n,one,few,many)=>{const v=Math.abs(Number(n)||0);if(v===1)return one;const mod10=v%10,mod100=v%100;return mod10>=2&&mod10<=4&&!(mod100>=12&&mod100<=14)?few:many;};
const glyphs={abilityTypes:"✦",mechanicFamilies:"⬡",subtypes:"⚙",deckArchetypes:"◇"};
const fallbackColors={abilityTypes:"#35B8FF",mechanicFamilies:"#FF5FA2",subtypes:"#FF9F43",deckArchetypes:"#C96CFF"};
function meta(category){
  const source=typeof TAG_CATEGORIES!=="undefined"&&TAG_CATEGORIES?.[category]?TAG_CATEGORIES[category]:{};
  return {name:source.name||category,color:source.color||fallbackColors[category]||"#5fe7dd",glyph:glyphs[category]||"◇"};
}
function rowColor(row){return meta(row?.category).color;}
function tagList(rows,kind){
  const list=Array.isArray(rows)?rows:[];
  if(!list.length)return `<div class="dna-empty">Brak wystarczających danych.</div>`;
  return `<div class="dna-tag-list">${list.map(row=>{
    const color=rowColor(row),glyph=meta(row.category).glyph;
    let sub="",value="";
    if(kind==="selection"){
      sub=`${row.occurrences} ${plural(row.occurrences,"wystąpienie","wystąpienia","wystąpień")} kart z tagiem`;
      value=`${pct(row.share)}<small>kart gracza</small>`;
    }else if(kind==="synergy"){
      sub=`${row.decks} ${plural(row.decks,"deck","decki","decków")} · średnio ${dec(row.averageCards)} kart z tagiem`;
      value=`${pct(row.deckShare)}<small>MAX W DECKU: ${row.maxCards}</small>`;
    }else if(kind==="champion"){
      sub=`${row.decks} ${plural(row.decks,"mistrzowski deck","mistrzowskie decki","mistrzowskich decków")} · średnio ${dec(row.averageCards)} kart`;
      value=`${pct(row.deckShare)}<small>MAX W DECKU: ${row.maxCards}</small>`;
    }
    return `<div class="dna-tag-row" style="--row-color:${color}"><div class="dna-tag-main"><div class="dna-tag-name"><span class="mini-glyph">${esc(glyph)}</span><span>${esc(row.name)}</span></div><div class="dna-tag-meta">${sub}</div></div><div class="dna-tag-value">${value}</div></div>`;
  }).join("")}</div>`;
}
function categoryCard(title,category,rows,kind){
  const m=meta(category);
  return `<div class="dna-category" style="--tag-color:${m.color}"><div class="dna-category-title"><span class="dna-category-glyph">${esc(m.glyph)}</span><span>${esc(title)}</span></div>${tagList(rows,kind)}</div>`;
}
function recordCard(label,row){
  if(!row)return `<div class="dna-record-card"><span>${esc(label)}</span><strong>Brak danych</strong><small>Potrzebny jest deck z co najmniej 4 kartami jednego taga.</small></div>`;
  const m=meta(row.category);
  return `<div class="dna-record-card" style="--tag-color:${m.color}"><span>${esc(label)}</span><strong>${esc(m.glyph)} ${esc(row.name)}</strong><b>${row.count} kart z jednym tagiem</b><small>Draft ${row.draftId}${row.place?` · ${row.place}. miejsce`:""} · deck ${row.deckSize} kart razem z Rezerwą</small></div>`;
}
function galaxyCard(row){
  const m=meta(row.category),player=Math.max(0,Number(row.deckShare||0)),global=Math.max(0,Number(row.globalShare||0));
  const max=Math.max(player,global,.01),pWidth=Math.max(4,player/max*100),gWidth=Math.max(4,global/max*100),delta=Number(row.delta||0),deltaText=`${delta>=0?"+":""}${(delta*100).toFixed(1).replace(".",",")} pp`;
  return `<div class="dna-galaxy-card" style="--tag-color:${m.color}"><div class="galaxy-label"><i>${esc(m.glyph)}</i><span>${esc(row.name)}</span></div><div class="dna-compare-bars"><div class="dna-compare-line"><span>Wojownik</span><div class="dna-compare-track"><div class="dna-compare-fill" style="width:${pWidth}%"></div></div><b>${pct(player)}</b></div><div class="dna-compare-line global"><span>Galaktyka</span><div class="dna-compare-track"><div class="dna-compare-fill" style="width:${gWidth}%"></div></div><b>${pct(global)}</b></div></div><div class="dna-delta${delta<0?" negative":""}">${deltaText} względem wszystkich decków</div></div>`;
}

const params=new URLSearchParams(location.search);
const playerName=params.get("name");
if(!playerName||typeof database==="undefined"||!Array.isArray(database.drafts)||typeof DraftStatsEngine==="undefined"||typeof cardDatabase==="undefined"||!Array.isArray(cardDatabase)||typeof TAGS==="undefined")return;
const dna=DraftStatsEngine.calculatePlayerDna(database.drafts,playerName,{cards:cardDatabase,tags:TAGS});
if(!dna)return;
const summary=dna.summary||{};
if($("warriorDnaSummary"))$("warriorDnaSummary").innerHTML=`
  <div class="dna-summary-chip"><span>Decki w analizie</span><b>${summary.totalDecks||0}</b></div>
  <div class="dna-summary-chip"><span>Wystąpienia kart</span><b>${summary.totalCardAppearances||0}</b></div>
  <div class="dna-summary-chip"><span>Zwycięskie decki</span><b>${summary.championDecks||0}</b></div>
  <div class="dna-summary-chip"><span>Próg pełnej synergii</span><b>${summary.minimumSynergyCards||4}+ kart</b></div>`;

if($("warriorDnaSelection"))$("warriorDnaSelection").innerHTML=`<div class="dna-category-grid">${categoryCard("Typ Zdolności","abilityTypes",dna.selection?.abilityTypes,"selection")}${categoryCard("Mechanika",dna.selection?.mechanics?.[0]?.category||"mechanicFamilies",dna.selection?.mechanics,"selection")}${categoryCard("Archetyp","deckArchetypes",dna.selection?.deckArchetypes,"selection")}</div>`;
if($("warriorDnaBuilt"))$("warriorDnaBuilt").innerHTML=`<div class="dna-category-grid two">${categoryCard("Mechaniki","mechanicFamilies",dna.builtSynergies?.mechanics,"synergy")}${categoryCard("Archetypy","deckArchetypes",dna.builtSynergies?.deckArchetypes,"synergy")}</div>`;
if($("warriorDnaSuccess")){
  const champions=Number(summary.championDecks||0);
  $("warriorDnaSuccess").innerHTML=champions?`<div class="dna-category-grid two">${categoryCard("Mechaniki zwycięstw","mechanicFamilies",dna.championSynergies?.mechanics,"champion")}${categoryCard("Archetypy zwycięstw","deckArchetypes",dna.championSynergies?.deckArchetypes,"champion")}</div>`:`<div class="dna-empty">DNA Sukcesu pojawi się po pierwszym zwycięskim drafcie tego wojownika.</div>`;
}
if($("warriorDnaRecords"))$("warriorDnaRecords").innerHTML=`<div class="dna-record-grid">${recordCard("Najczystszy archetyp",dna.records?.archetypeCohesion)}${recordCard("Najgęstsza mechanika",dna.records?.mechanicCohesion)}</div>`;
if($("warriorDnaGalaxy")){
  const rows=Array.isArray(dna.comparison?.signature)?dna.comparison.signature:[];
  $("warriorDnaGalaxy").innerHTML=rows.length?`<div class="dna-galaxy-grid">${rows.map(galaxyCard).join("")}</div>`:`<div class="dna-empty">Brak pełnych synergii do porównania z całą galaktyką.</div>`;
}
})();
