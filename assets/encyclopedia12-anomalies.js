(()=>{
  'use strict';

  const api=window.BlackHoleAnomalies;
  const catalogRoot=document.getElementById('anomalyCatalogSections');
  const search=document.getElementById('anomalySearch');
  const count=document.getElementById('anomalyVisibleCount');
  const rarityFilters=document.getElementById('anomalyRarityFilters');
  const timingFilters=document.getElementById('anomalyTimingFilters');
  const heroFacts=document.getElementById('anomalyHeroFacts');
  const heroNote=document.getElementById('anomalyHeroNote');
  const badge=document.getElementById('anomalyCatalogBadge');

  const rarityOrder=['rare','epic','legendary'];
  const rarityLabels={rare:'RZADKA',epic:'EPICKA',legendary:'LEGENDARNA'};
  const rarityFilterLabels={rare:'RZADKIE',epic:'EPICKIE',legendary:'LEGENDARNE'};
  const raritySectionTitles={rare:'Rzadkie Anomalie',epic:'Epickie Anomalie',legendary:'Legendarne Anomalie'};
  const raritySectionKinds={rare:'Klasa I',epic:'Klasa II',legendary:'Klasa III'};
  const raritySectionDescriptions={
    rare:'Częstsze pęknięcia zasad — zwykle czytelny, punktowy efekt.',
    epic:'Mocniejsze anomalie ingerujące w paczkę, wybory albo dodatkowe systemy draftu.',
    legendary:'Najrzadsze i najbardziej inwazyjne zdarzenia, które potrafią mocno przebudować przebieg draftu.'
  };
  const timingLabels={
    draft_start:'Start draftu',
    before_open:'Przed otwarciem',
    after_open:'Po otwarciu',
    mid_pack:'W środku paczki',
    after_pack:'Po zakończeniu paczki',
    anytime:'Dowolny moment'
  };
  const timingFilterLabels={
    draft_start:'START DRAFTU',
    before_open:'PRZED OTWARCIEM',
    after_open:'PO OTWARCIU',
    mid_pack:'W PACZCE',
    after_pack:'PO PACZCE',
    anytime:'DOWOLNY MOMENT'
  };
  const timingOrder=['draft_start','before_open','after_open','mid_pack','after_pack','anytime'];
  const scopeLabels={pack:'PACZKA',player:'GRACZ',economy:'ECONOMY',queue:'KOLEJKA',deck:'DECK',draft:'DRAFT'};

  const normalize=value=>String(value||'').toLocaleLowerCase('pl-PL').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));

  let entries=[];
  let rarity='all';
  let timing='all';

  function getEntries(){
    if(!api||typeof api.getEncyclopediaRegistry!=='function') return [];
    const raw=api.getEncyclopediaRegistry();
    return Array.isArray(raw)?raw.filter(item=>item&&item.name&&item.rarity&&item.timing):[];
  }

  function metaFor(entry){
    const meta=[];
    meta.push({text:entry.runtimeReady?'WDROŻONA':'PLANOWANA',className:entry.runtimeReady?'live':'planned'});
    if(Number(entry.minPackIndex)>0) meta.push({text:`OD ${Number(entry.minPackIndex)+1}. PACZKI`});
    if(entry.requiresEconomy) meta.push({text:'WYMAGA ECONOMY',className:'warn'});
    if(entry.duration==='draft') meta.push({text:'CAŁY DRAFT',className:'ongoing'});
    (Array.isArray(entry.scope)?entry.scope:[]).map(key=>scopeLabels[key]).filter(Boolean).forEach(label=>meta.push({text:label,className:'scope'}));
    return meta;
  }

  function renderCard(entry){
    const meta=metaFor(entry);
    return `<article class="card" data-rarity="${escapeHtml(entry.rarity)}" data-timing="${escapeHtml(entry.timing)}">
      <div class="card-head"><span class="rarity">${escapeHtml(rarityLabels[entry.rarity]||entry.rarity)}</span><span class="timing">${escapeHtml(timingLabels[entry.timing]||entry.timing)}</span></div>
      <h3>${escapeHtml(entry.name)}</h3>
      <p>${escapeHtml(entry.description||'')}</p>
      ${meta.length?`<div class="meta">${meta.map(item=>`<span${item.className?` class="${escapeHtml(item.className)}"`:''}>${escapeHtml(item.text)}</span>`).join('')}</div>`:''}
    </article>`;
  }

  function renderSections(){
    if(!catalogRoot) return;
    catalogRoot.innerHTML=rarityOrder.map(rarityKey=>{
      const group=entries.filter(entry=>entry.rarity===rarityKey);
      if(!group.length) return '';
      return `<section class="section ${rarityKey} anomaly-section" data-section-rarity="${rarityKey}">
        <div class="section-heading"><div><small>${raritySectionKinds[rarityKey]}</small><h2>${raritySectionTitles[rarityKey]}</h2></div><p>${raritySectionDescriptions[rarityKey]}</p></div>
        <div class="cards">${group.map(renderCard).join('')}</div>
      </section>`;
    }).join('');
  }

  function makeFilter(container,attribute,value,label,active=false){
    if(!container) return;
    const button=document.createElement('button');
    button.type='button';
    button.textContent=label;
    button.dataset[attribute]=value;
    if(active) button.classList.add('is-active');
    container.appendChild(button);
  }

  function renderFilters(){
    if(rarityFilters){
      rarityFilters.innerHTML='';
      makeFilter(rarityFilters,'filterRarity','all','WSZYSTKIE',true);
      rarityOrder.filter(key=>entries.some(entry=>entry.rarity===key)).forEach(key=>makeFilter(rarityFilters,'filterRarity',key,rarityFilterLabels[key]||key));
    }
    if(timingFilters){
      timingFilters.innerHTML='';
      makeFilter(timingFilters,'filterTiming','all','KAŻDY TIMING',true);
      timingOrder.filter(key=>entries.some(entry=>entry.timing===key)).forEach(key=>makeFilter(timingFilters,'filterTiming',key,timingFilterLabels[key]||key));
    }
  }

  function renderSummary(){
    const rarityCounts=entries.reduce((map,entry)=>{map[entry.rarity]=(map[entry.rarity]||0)+1;return map;},{});
    const runtimeCount=entries.filter(entry=>entry.runtimeReady).length;
    if(badge) badge.textContent=`KATALOG · ${entries.length} ANOMALII`;
    if(heroFacts){
      heroFacts.innerHTML=[
        `<span class="rare">${rarityCounts.rare||0} RZADKICH</span>`,
        `<span class="epic">${rarityCounts.epic||0} EPICKICH</span>`,
        `<span class="legendary">${rarityCounts.legendary||0} LEGENDARNE</span>`,
        `<span>${runtimeCount} WDROŻONYCH · CLASSIC ONLY</span>`
      ].join('');
    }
    if(heroNote) heroNote.innerHTML=`<strong>Aktualny katalog:</strong> ${entries.length} Anomalii, z czego ${runtimeCount} jest obecnie wdrożonych w runtime. Lista aktualizuje się z tego samego katalogu co program draftu — nowych Anomalii nie trzeba dopisywać tutaj ręcznie.`;
  }

  function apply(){
    const cards=[...document.querySelectorAll('.card[data-rarity]')];
    const sections=[...document.querySelectorAll('.anomaly-section')];
    const q=normalize(search?.value);
    let visible=0;
    cards.forEach(card=>{
      const text=normalize(card.textContent);
      const show=(rarity==='all'||card.dataset.rarity===rarity)
        &&(timing==='all'||card.dataset.timing===timing)
        &&(!q||text.includes(q));
      card.hidden=!show;
      if(show) visible++;
    });
    sections.forEach(section=>section.classList.toggle('is-empty',![...section.querySelectorAll('.card')].some(card=>!card.hidden)));
    if(count) count.textContent=String(visible);
  }

  function bindFilters(){
    rarityFilters?.addEventListener('click',event=>{
      const button=event.target.closest('[data-filter-rarity]');
      if(!button) return;
      rarityFilters.querySelectorAll('[data-filter-rarity]').forEach(item=>item.classList.remove('is-active'));
      button.classList.add('is-active');
      rarity=button.dataset.filterRarity||'all';
      apply();
    });
    timingFilters?.addEventListener('click',event=>{
      const button=event.target.closest('[data-filter-timing]');
      if(!button) return;
      timingFilters.querySelectorAll('[data-filter-timing]').forEach(item=>item.classList.remove('is-active'));
      button.classList.add('is-active');
      timing=button.dataset.filterTiming||'all';
      apply();
    });
    search?.addEventListener('input',apply);
  }

  entries=getEntries();
  if(!entries.length){
    if(catalogRoot) catalogRoot.innerHTML='<section class="catalog-error"><b>Nie udało się wczytać katalogu Anomalii.</b><span>Odśwież stronę lub sprawdź, czy plik programu Anomalii jest dostępny.</span></section>';
    if(heroNote) heroNote.innerHTML='<strong>Katalog niedostępny:</strong> nie udało się odczytać aktualnych danych Anomalii.';
    return;
  }

  renderSummary();
  renderFilters();
  renderSections();
  bindFilters();
  apply();
})();
