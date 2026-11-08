/* MSP SnapDraft — Kroniki Draftowe | System Turniejowy V1 | Patch 3
   Rendering + local-only score editor + export. No network writes, no mutation of legacy draft data.
*/
(function(root){
  'use strict';
  const E=()=>root.DraftTournamentEngine;
  const S=()=>root.DraftStatsEngine;
  const GROUPS=[['preliminary','Kwalifikacje'],['quarterfinal','Ćwierćfinały'],['semifinal','Półfinały'],['third_place','Mecz o 3. miejsce'],['final','Finał']];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fixtureLabel=f=>f.id==='B'?'BRĄZ':f.id==='F'?'FINAŁ':f.id;
  function sourceLabel(s){
    if(!s) return 'Nieustalone';
    if(s.type==='player') return s.name;
    if(s.type==='winner') return `Zwycięzca ${s.fixtureId}`;
    if(s.type==='loser') return `Przegrany ${s.fixtureId}`;
    return 'Nieustalone';
  }
  function nameAt(f,i){return f.players[i]||sourceLabel(f.slots[i]);}
  function groupMarkup(f,edit){
    const result=f.result;
    const cls=f.status==='finished'?'is-complete':f.status==='ready'?'is-ready':f.status==='conflict'||f.status==='invalid'?'is-conflict':'is-pending';
    const winnerAt=i=>f.winner&&f.players[i]===f.winner;
    return `<article class="t-ch-fixture ${cls}" data-fixture="${esc(f.id)}">
      <header><strong>${esc(fixtureLabel(f))}</strong><span>${f.status==='finished'?'ZAKOŃCZONY':f.status==='ready'?'GOTOWY':'OCZEKUJE'}</span></header>
      ${[0,1].map(i=>`<div class="t-ch-fighter ${winnerAt(i)?'is-winner':''} ${!f.players[i]?'is-placeholder':''}"><span>${esc(nameAt(f,i))}</span><b>${result?(i===0?result.pts1:result.pts2):'–'}</b></div>`).join('')}
      ${result?.resultType==='walkover'?'<small class="t-ch-wo">Walkower</small>':''}
      ${edit&&['ready','finished'].includes(f.status)?`<button type="button" class="t-ch-edit" data-edit-fixture="${esc(f.id)}">${result?'Zmień wynik':'Wpisz wynik'}</button>`:''}
    </article>`;
  }
  function stateFor(draft){return E().tournamentState(draft);}
  function renderSchedule(draft,stats,box){
    if(!E()||!E().isTournament(draft)) return false;
    const state=stateFor(draft);
    if(!state.valid){box.innerHTML='<div class="t-ch-error">Nieprawidłowe dane turnieju. Sprawdź drabinkę i wyniki.</div>';return true;}
    box.classList.add('t-ch-schedule');
    box.innerHTML=GROUPS.map(([round,label])=>{
      const matches=state.fixtures.filter(f=>f.round===round);
      if(!matches.length) return '';
      return `<div class="result-block-title">${esc(label)}</div>`+matches.map(f=>`<div class="${f.status==='finished'?'result-item':'unplayed-item'} t-ch-schedule-item">
        <span class="t-ch-schedule-id">${esc(f.id)}</span>
        <span>${esc(nameAt(f,0))}</span>
        <strong>${f.result?`${f.result.pts1} – ${f.result.pts2}`:'VS'}</strong>
        <span>${esc(nameAt(f,1))}</span>
        ${f.result?.resultType==='walkover'?'<span class="result-note">(walkower)</span>':''}
      </div>`).join('');
    }).join('')+'<div class="t-ch-byes">'+(state.byes.length?`<b>Wolne losy (+20 pkt):</b> ${state.byes.map(x=>esc(x.name)).join(' · ')}`:'Bez wolnych losów')+'</div>';
    return true;
  }
  let context=null,dirty=false,editing=null;
  function buildView(){
    if(!context) return;
    const state=stateFor(context.draft);
    const rootEl=document.getElementById('tournamentChroniclesRoot');
    if(!rootEl) return;
    const canEdit=context.canEdit;
    const warnings=state.warnings.map(w=>w.code);
    rootEl.innerHTML=`
      <div class="t-ch-heading">
        <div><span class="t-ch-overline">MSP SNAPDRAFT · SYSTEM TURNIEJOWY</span><h2>🏆 Drabinka Turniejowa</h2><p>Wylosowany układ jest stały. Zwycięzcy kolejnych par automatycznie awansują do odpowiednich spotkań.</p></div>
        <div class="t-ch-status"><b>${state.resolvedMatches} / ${state.expectedMatches}</b><small>rozstrzygniętych meczów</small></div>
      </div>
      ${!state.valid?`<div class="t-ch-error" role="alert">Nieprawidłowa drabinka: ${esc(warnings.join(', '))}. Edycja zablokowana do czasu poprawy danych.</div>`:''}
      <div class="t-ch-bracket-scroll"><div class="t-ch-bracket">
      ${GROUPS.filter(([round])=>state.fixtures.some(f=>f.round===round)).map(([round,label])=>`<section class="t-ch-phase t-ch-phase--${round}"><h3>${esc(label)}</h3><div class="t-ch-phase-body">${state.fixtures.filter(f=>f.round===round).map(f=>groupMarkup(f,canEdit&&state.valid)).join('')}</div></section>`).join('')}
      </div></div>
      <div class="t-ch-footer">
        <div class="t-ch-bye-panel"><b>🌟 Wolne losy:</b> ${state.byes.length?state.byes.map(x=>`<span>${esc(x.name)} <b>+20 pkt</b></span>`).join(''):'Brak'}</div>
        <p>${state.complete?`🏆 Mistrz turnieju: <b>${esc(state.champion)}</b>`:'Punkty Draftowe obejmują punkty meczowe, wolne losy oraz bonusy fazowe. Podium jest oficjalne dopiero po finale i meczu o 3. miejsce.'}</p>
      </div>
      ${canEdit?`<section class="t-ch-editor-area"><div><b>Edytor wyników — tylko lokalnie</b><p>Zmiany pojawiają się od razu w tabeli i drabince, ale nie zapisują się automatycznie na GitHubie. Po zakończeniu pobierz gotowy <code>database.js</code> lub skopiuj wpis draftu.</p></div>
        <div class="t-ch-editor-actions"><button type="button" data-action="download-db" ${!state.valid?'disabled':''}>Pobierz database.js</button><button type="button" data-action="copy-draft" ${!state.valid?'disabled':''}>Kopiuj wpis draftu</button></div>
        <span class="t-ch-dirty" aria-live="polite">${dirty?'⚠ Niezapisane zmiany — pobierz aktualizację przed opuszczeniem strony.':'Brak lokalnych zmian.'}</span>
      </section><div class="t-ch-edit-panel" id="tournamentChroniclesEditor" hidden></div>`:''}`;
    if(canEdit) rootEl.querySelectorAll('[data-edit-fixture]').forEach(btn=>btn.addEventListener('click',()=>editFixture(btn.dataset.editFixture)));
    if(canEdit) rootEl.querySelector('[data-action="download-db"]').addEventListener('click',downloadDatabase);
    if(canEdit) rootEl.querySelector('[data-action="copy-draft"]').addEventListener('click',copyDraft);
  }
  function editFixture(id){
    if(!context||!context.canEdit)return;
    const state=stateFor(context.draft);
    const f=state.fixtures.find(row=>row.id===id);
    if(!f||!['ready','finished'].includes(f.status))return;
    editing=id;
    const panel=document.getElementById('tournamentChroniclesEditor');
    panel.hidden=false;
    const initial=f.result?.resultType==='walkover'?'walkover':'played';
    panel.innerHTML=`<div class="t-ch-edit-header"><strong>${esc(id)} · ${esc(nameAt(f,0))} kontra ${esc(nameAt(f,1))}</strong><button type="button" data-close>✕</button></div>
      <form id="tournamentScoreForm"><label>${esc(nameAt(f,0))}<input name="score1" type="number" inputmode="numeric" min="0" max="25" required value="${f.result?.pts1??''}"></label>
      <label>${esc(nameAt(f,1))}<input name="score2" type="number" inputmode="numeric" min="0" max="25" required value="${f.result?.pts2??''}"></label>
      <label>Rodzaj meczu<select name="type"><option value="played" ${initial==='played'?'selected':''}>Rozegrany · razem 25 pkt</option><option value="walkover" ${initial==='walkover'?'selected':''}>Walkower · 20–0</option></select></label>
      <div class="t-ch-form-actions"><button type="submit">Zapisz wynik lokalnie</button>${f.result?'<button type="button" class="t-ch-delete" data-delete>Usuń wynik</button>':''}</div></form><p class="t-ch-feedback" role="status" aria-live="polite"></p>`;
    panel.querySelector('[data-close]').onclick=()=>{panel.hidden=true;editing=null;};
    panel.querySelector('form').addEventListener('submit',e=>{
      e.preventDefault();
      const form=e.currentTarget, a=Number(form.elements.score1.value),b=Number(form.elements.score2.value),type=form.elements.type.value;
      try{
        // The engine owns score validation and bracket dependencies.
        let next;
        try{next=E().updateResult(context.draft,id,a,b,{resultType:type});}
        catch(error){
          if(!/Zmiana narusza późniejsze wyniki/.test(error.message)) throw error;
          if(!root.confirm('Ta zmiana zmodyfikuje awans. Istnieją już wyniki późniejszych spotkań, które staną się nieważne. Usunąć zależne wyniki i zastosować korektę?')) return;
          next=E().updateResult(context.draft,id,a,b,{resultType:type,invalidateDependents:true});
        }
        apply(next);
      }catch(error){panel.querySelector('.t-ch-feedback').textContent=error.message;}
    });
    panel.querySelector('[data-delete]')?.addEventListener('click',()=>{
      if(!root.confirm(`Usunąć wynik ${id}? Zależne wyniki późniejszych rund również mogą zostać unieważnione.`))return;
      try{apply(removeResult(context.draft,id));}catch(error){panel.querySelector('.t-ch-feedback').textContent=error.message;}
    });
    panel.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function removeResult(draft,id){
    if(!Array.isArray(draft.matches)||!draft.matches.some(m=>m.fixtureId===id))throw Error('Brak wyniku do usunięcia.');
    let pending=draft.matches.filter(m=>m.fixtureId!==id);
    for(let guard=0;guard<20;guard++){
      const state=stateFor({...draft,matches:pending});
      if(state.valid)return {...draft,matches:pending,status:state.complete?'finished':'active',winner:state.complete?state.champion:null};
      const stale=new Set(state.warnings.filter(w=>w.code==='staleOrUnexpectedMatch').map(w=>w.id));
      if(!stale.size)throw Error('Usunięcie wywołało nieoczekiwany błąd drabinki: '+state.warnings.map(x=>x.code).join(', '));
      pending=pending.filter(m=>!stale.has(m.fixtureId));
    }
    throw Error('Nie można bezpiecznie usunąć zależnych wyników.');
  }
  function apply(next){
    if(!context)return;
    context.onChange(next);
    dirty=true;editing=null;
    buildView();
    const container=document.getElementById('tournamentChroniclesSection');
    container?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function contentDb(){
    const db=context.database;
    if(!db||!Array.isArray(db.drafts))throw Error('Brak danych database.js');
    return 'const database = '+JSON.stringify(db,null,2)+';\n';
  }
  function downloadDatabase(){
    const data=contentDb();
    const blob=new Blob([data],{type:'text/javascript;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='database.js';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
    // Download isn't a confirmed successful commit. Retain dirty warning.
  }
  async function copyDraft(){
    const value=JSON.stringify(context.draft,null,2);
    const panel=document.getElementById('tournamentChroniclesEditor');
    if(!panel)return;
    panel.hidden=false;
    panel.innerHTML=`<div class="t-ch-edit-header"><strong>Wpis draftu D${context.draft.id} do wklejenia w database.js</strong><button type="button" data-close>✕</button></div><textarea class="t-ch-export-text" readonly></textarea><p>Skopiuj cały obiekt i podmień istniejący wpis tego draftu. Nie dodawaj go jako drugi egzemplarz.</p>`;
    const textarea=panel.querySelector('textarea');textarea.value=value;
    panel.querySelector('[data-close]').onclick=()=>{panel.hidden=true;};
    textarea.focus();textarea.select();
    try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(value);else document.execCommand('copy');}catch(_){/* manual selection remains available */}
  }
  function init(opts){
    context=null;dirty=false;editing=null;
    if(!opts?.draft||!E()||!E().isTournament(opts.draft))return false;
    if(typeof opts.onChange!=='function')throw Error('Kroniki: brak funkcji odświeżania po zmianie wyniku.');
    context={...opts,canEdit:new URLSearchParams(root.location.search).get('edit')==='1'};
    const section=document.getElementById('tournamentChroniclesSection');
    if(!section)throw Error('Kroniki: brak sekcji turniejowej.');
    section.hidden=false;
    buildView();
    return true;
  }
  root.addEventListener?.('beforeunload',event=>{if(context?.canEdit&&dirty){event.preventDefault();event.returnValue='';}});
  root.DraftTournamentChronicles=Object.freeze({init,renderSchedule,removeResult,sourceLabel});
})(typeof window!=='undefined'?window:globalThis);
