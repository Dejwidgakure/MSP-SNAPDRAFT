(function(){
"use strict";

const $=id=>document.getElementById(id);
if(!$('cardTagGroups') || typeof cardDatabase==='undefined' || typeof TAGS==='undefined' || typeof TAG_CATEGORIES==='undefined') return;

const params=new URLSearchParams(location.search);
const requested=params.get('card');
const card=cardDatabase.find(c=>c.name===requested) || cardDatabase[0] || null;
if(!card) return;

/* The card profile reads the same taxonomy index as the statistics engine.
   Do not keep a hand-written legacy category list here: tags.js is canonical. */
const statsContext=DraftStatsEngine?.createStatsContext?.({
  drafts:database?.drafts||[],cards:cardDatabase,tags:TAGS
})||null;
const categoryOrder=Object.keys(TAG_CATEGORIES)
  .filter(category=>Array.isArray(TAGS?.[category]));
const tagIndex=new Map();
const indexedTags=statsContext?.indexes?.tagById||{};
const indexedCategories=statsContext?.indexes?.tagCategoryById||{};

Object.entries(indexedTags).forEach(([id,tag])=>{
  const category=indexedCategories[id];
  if(category) tagIndex.set(id,{...tag,category});
});
/* Graceful fallback for an older stats engine; the visible result stays tied to
   the current tags.js taxonomy. */
if(!tagIndex.size){
  categoryOrder.forEach(category=>{
    (TAGS[category]||[]).forEach(tag=>tagIndex.set(tag.id,{...tag,category}));
  });
}

const grouped=new Map(categoryOrder.map(c=>[c,[]]));
const unknown=[];
(card.tags||[]).forEach(id=>{
  const info=tagIndex.get(id);
  if(info&&grouped.has(info.category)) grouped.get(info.category).push(info);
  else unknown.push({id,name:id,description:'Tag nie ma definicji w aktualnym katalogu tags.js.'});
});

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
}[ch]));

function primaryValue(category){
  const rows=grouped.get(category)||[];
  return rows.length?rows.map(x=>x.name).join(', '):'—';
}

const categoryName=category=>TAG_CATEGORIES?.[category]?.name||category;

/* Visual taxonomy symbols only. Names, descriptions, colors and the card's
   actual tags still come exclusively from TAG_CATEGORIES/TAGS + cards.js. */
const categoryGlyph=category=>({
  series:'◫',
  abilityTypes:'✦',
  mechanicFamilies:'⬡',
  subtypes:'⚙',
  deckArchetypes:'◇',
  teams:'◉',
  themes:'✧',
  special:'⌁'
}[category]||'⌗');

const cardType=card.cardType==='Skill'?'Skill':'Character';
const identityRows=[
  ['Koszt',card.cost],
  ...(cardType==='Skill'?[]:[['Siła',card.power]]),
  ['Typ karty',cardType],
  [categoryName('series'),primaryValue('series')],
  [categoryName('abilityTypes'),primaryValue('abilityTypes')]
];

$('cardIdentityCore').innerHTML=identityRows
  .map(([label,value])=>`<div class="identity-core-card"><b>${esc(label)}</b><span>${esc(value)}</span></div>`)
  .join('');

const visibleCategories=categoryOrder.filter(category=>category!=='special');
$('cardTagGroups').innerHTML=visibleCategories.map(category=>{
  const rows=grouped.get(category)||[];
  if(!rows.length) return '';
  const meta=TAG_CATEGORIES[category]||{};
  const color=meta.color||'#65e9ff';
  const glow=meta.glow||'rgba(101,233,255,.15)';
  const atlasIndex=String(categoryOrder.indexOf(category)+1).padStart(2,'0');
  return `<section class="tag-category" data-category="${esc(category)}" style="--tag-color:${esc(color)};--tag-glow:${esc(glow)}">
    <span class="tag-category-watermark" aria-hidden="true">${esc(categoryGlyph(category))}</span>
    <span class="tag-category-index" aria-hidden="true">ATLAS // ${atlasIndex}</span>
    <div class="tag-category-meta">
      <span class="tag-category-glyph" aria-hidden="true">${esc(categoryGlyph(category))}</span>
      <b>${esc(meta.name||category)}</b>
      <small>${esc(meta.description||'')}</small>
    </div>
    <div class="tag-chip-list">
      ${rows.map((tag,index)=>`<span class="card-tag-chip" style="--tag-color:${esc(color)};--chip-index:${index}" title="${esc(tag.description||tag.name)}"><span class="tag-chip-mark" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>${esc(tag.name)}</span>`).join('')}
    </div>
  </section>`;
}).join('');

/* Ambient atlas labels are built from this card's real taxonomy only; they
   are decorative and never create or infer tags. */
const identityPanel=$('cardIdentityPanel');
if(identityPanel){
  const head=identityPanel.querySelector('.card-identity-head');
  if(head && !head.querySelector('.tag-jeff-corner')){
    const sticker=document.createElement('div');
    sticker.className='tag-jeff-corner';
    sticker.setAttribute('aria-hidden','true');
    sticker.innerHTML='<img src="assets/jeff_tag_sticker.webp" alt="">';
    head.appendChild(sticker);
  }
  identityPanel.querySelector('.tag-atlas-ambient')?.remove();
  const ambientEntries=[];
  visibleCategories.forEach(category=>{
    const rows=grouped.get(category)||[];
    if(!rows.length) return;
    ambientEntries.push({text:categoryName(category),kind:'category'});
    rows.forEach(tag=>ambientEntries.push({text:tag.name,kind:'tag'}));
  });
  if(ambientEntries.length){
    const ambient=document.createElement('div');
    ambient.className='tag-atlas-ambient';
    ambient.setAttribute('aria-hidden','true');
    const labelHtml=ambientEntries.slice(0,14).map((entry,index)=>
      `<span class="atlas-ambient-label ${entry.kind}" style="--ambient-index:${index}">${esc(entry.text)}</span>`
    ).join('');
    /* Large floating taxonomy marks use only categories that the current card
       actually has. They are presentation-only and never create new tags. */
    const glyphHtml=visibleCategories
      .filter(category=>(grouped.get(category)||[]).length)
      .slice(0,6)
      .map(category=>`<span class="atlas-ambient-glyph" aria-hidden="true">${esc(categoryGlyph(category))}</span>`)
      .join('');
    ambient.innerHTML=labelHtml+glyphHtml;
    identityPanel.prepend(ambient);
  }
}

const special=grouped.get('special')||[];
if(special.length||unknown.length){
  const entries=[...special,...unknown];
  $('specialTagCount').textContent=`(${entries.length})`;
  const meta=TAG_CATEGORIES.special||{};
  const color=meta.color||'#F6C94C';
  $('specialTagList').innerHTML=entries.map(tag=>`<span class="card-tag-chip" style="--tag-color:${esc(color)}" title="${esc(tag.description||tag.name)}">${esc(tag.name)}</span>`).join('');
}else{
  $('specialTagsBox').hidden=true;
}
})();
