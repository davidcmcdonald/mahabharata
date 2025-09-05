// app.js — v5
(() => {
  const CH = Array.isArray(window.chapters) ? window.chapters : [];
  const PEOPLE = Array.isArray(window.people) ? window.people : [];
  const PLACES = Array.isArray(window.places) ? window.places : [];

  // --- helpers ---
  const strip = (s) => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const slug = (s) => strip(String(s||'').trim().toLowerCase()).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  const translit = (s) => strip(s)
    .replace(/[śṣ]/g, 'sh')
    .replace(/ṅ|ñ/g, 'n')
    .replace(/ṭ/g, 't')
    .replace(/ḍ/g, 'd')
    .replace(/ḥ/g, 'h')
    .replace(/ā/g, 'a').replace(/ī/g, 'i').replace(/ū/g, 'u')
    .toLowerCase();

  const firstKey = (x) => {
    const ch = (x && x.first_appearance && x.first_appearance.chapter) || 9999;
    const ord = (x && x.first_appearance && x.first_appearance.order) || 99999;
    return `${String(ch).padStart(3,'0')}_${String(ord).padStart(5,'0')}`;
  };

  // Life-cycle (death / revival) per chapter
  const isDeceasedAt = (p, chId) => {
    if (Array.isArray(p.life_events) && p.life_events.length){
      const ev = p.life_events
        .filter(e => Number(e.chapter) <= Number(chId))
        .sort((a,b)=>Number(a.chapter)-Number(b.chapter));
      let dead = false;
      for (const e of ev){
        if (e.type === "death") dead = true;
        else if (e.type === "revival") dead = false;
      }
      return dead;
    }
    if (p.death && Number(p.death.chapter) <= Number(chId)) return true;
    if (typeof p.deceased === "boolean") return p.deceased;
    return false;
  };

  const lastDeathInfo = (p, chId) => {
    let info = null;
    if (Array.isArray(p.life_events)){
      for (const e of p.life_events){
        if (e.type === 'death' && Number(e.chapter) <= Number(chId)){
          if (!info || e.chapter > info.chapter) info = e;
        }
      }
    } else if (p.death && Number(p.death.chapter) <= Number(chId)) {
      info = { type:'death', chapter: p.death.chapter, note: p.death.note || '' };
    }
    return info;
  };

  // Relevance in current chapter
  const weightRank = { major: 0, significant: 1, minor: 2 };
  const relevanceRankForPerson = (pid, chId) => {
    const ch = CH.find(c => c.id === chId);
    if (!ch || !ch.mentions || !Array.isArray(ch.mentions.people)) return 99;
    const ent = ch.mentions.people.find(([id]) => id === pid);
    if (!ent) return 99;
    const w = ent[1] || 'minor';
    return weightRank[w] ?? 99;
  };

  // In current chapter checks
  const isInCurrentChapterPerson = (pid, chId) => {
    const ch = CH.find(c => c.id === chId);
    if (!ch || !ch.mentions || !Array.isArray(ch.mentions.people)) return false;
    return !!ch.mentions.people.find(([id]) => id === pid);
  };
  const isInCurrentChapterPlace = (plid, chId) => {
    const ch = CH.find(c => c.id === chId);
    if (!ch || !ch.mentions || !Array.isArray(ch.mentions.places)) return false;
    return ch.mentions.places.includes(plid);
  };

  // Image candidates (robust, covers bhishma_avatar etc.)
  const EXT = ['jpg','jpeg','png','webp'];
  const IMG_DIRS_P = ['Avatars','avatars','Places','places'];
  const IMG_DIRS_L = ['Places','places','Avatars','avatars'];
  const nameVariants = (record) => {
    const all = new Set();
    const base = record.name || '';
    const aliases = Array.isArray(record.aka) ? record.aka : [];
    const pool = [base, ...aliases];
    for (const n of pool){
      const s1 = slug(n);
      const s2 = translit(n).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
      const s3 = translit(n).replace(/[^a-z0-9]+/g,'').toLowerCase();
      all.add(s1); all.add(s2); all.add(s3);
      // also try first token only
      const first = n.split(/\s+/)[0];
      const s4 = slug(first);
      const s5 = translit(first).replace(/[^a-z0-9]+/g,'_');
      all.add(s4); all.add(s5);
    }
    return Array.from(all).filter(Boolean);
  };
  const candidatesFor = (record, isPlace=false) => {
    const paths = [];
    const dirs = isPlace ? IMG_DIRS_L : IMG_DIRS_P;
    // explicit avatar base (without extension) — try all extensions
    if (record.avatar){
      const base = record.avatar.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      for (const d of dirs){ for (const e of EXT){ paths.push(`${d}/${base}.${e}`); } }
    }
    // name-derived variants
    for (const v of nameVariants(record)){
      for (const d of dirs){
        for (const e of EXT){
          paths.push(`${d}/${v}_avatar.${e}`);
          paths.push(`${d}/${v}.${e}`);
        }
      }
    }
    return paths;
  };

  const makePortrait = (name, candidates) => {
    const wrap = document.createElement('div'); wrap.className = 'portrait';
    const img = document.createElement('img'); img.alt = `${name} portrait`; img.loading = 'lazy'; img.decoding = 'async';
    wrap.appendChild(img);
    const initials = (name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w => strip(w[0]||'').toUpperCase()).join('') || '?';
    const showFallback = () => { if (img && img.parentNode) { img.remove(); } const fb = document.createElement('div'); fb.className = 'fallback'; fb.textContent = initials; wrap.appendChild(fb); };
    let i = 0;
    const tryNext = () => {
      if (i >= candidates.length) { showFallback(); return; }
      const src = candidates[i++];
      const test = new Image();
      const to = setTimeout(() => { test.onload = test.onerror = null; tryNext(); }, 1500);
      test.onload = () => { clearTimeout(to); img.src = src; };
      test.onerror = () => { clearTimeout(to); tryNext(); };
      test.src = src;
    };
    tryNext();
    return wrap;
  };

  // annotate names in chapter summary/events -> hover preview
  function buildEntityIndex(chId){
    const idx = [];
    const so = soFarMentions(chId);
    // People
    for (const p of PEOPLE){
      if (!so.people.has(p.id)) continue;
      const names = [p.name, ...(Array.isArray(p.aka) ? p.aka : [])];
      for (const nm of names){
        if (!nm) continue;
        const pat = nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        idx.push({ type:'person', id:p.id, pattern:new RegExp(`\\b${pat}\\b`, 'g') , display:nm });
      }
    }
    // Places
    for (const pl of PLACES){
      if (!so.places.has(pl.id)) continue;
      const names = [pl.name, ...(Array.isArray(pl.aka) ? pl.aka : [])];
      for (const nm of names){
        if (!nm) continue;
        const pat = nm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        idx.push({ type:'place', id:pl.id, pattern:new RegExp(`\\b${pat}\\b`, 'g') , display:nm });
      }
    }
    // sort by length desc to reduce nested replacements
    idx.sort((a,b)=>b.display.length - a.display.length);
    return idx;
  }
  function annotateEntitiesHTML(text, chId){
    if (!text) return '';
    let html = (text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const idx = buildEntityIndex(chId);
    for (const ent of idx){
      html = html.replace(ent.pattern, (m)=> `<span class="link-entity ${ent.type}" data-type="${ent.type}" data-id="${ent.id}">${m}</span>`);
    }
    return html;
  }

  function soFarMentions(chId){
    const ids = { people: new Set(), places: new Set() };
    for (const c of CH) {
      if (c.id > chId) break;
      if (c.mentions){
        if (Array.isArray(c.mentions.people)) c.mentions.people.forEach(([pid]) => ids.people.add(pid));
        if (Array.isArray(c.mentions.places)) c.mentions.places.forEach(pl => ids.places.add(pl));
      }
    }
    return ids;
  }

  // DOM refs
  const $  = s => document.querySelector(s);
  const chapterSlider = $('#chapterSlider');
  const chapterLabel  = $('#chapterLabel');
  const chapterTotal  = $('#chapterTotal');
  const chapterMeta   = $('#chapterMeta');
  const summaryEl = $('#summary');
  const eventsEl  = $('#events');
  const tabPeople = $('#tabPeople');
  const tabPlaces = $('#tabPlaces');
  const gridTitle = $('#gridTitle');
  const grid      = $('#grid');
  const searchEl  = $('#search');
  const btnEdit   = $('#btnEdit');
  const btnExport = $('#btnExport');
  const hoverPrev = $('#hoverPreview');
  const edChWrap  = $('#chapterEditor');
  const edChTitle = $('#edChTitle');
  const edChSummary = $('#edChSummary');
  const edChEvents  = $('#edChEvents');
  const btnChSave = $('#btnChSave');
  const btnChCancel = $('#btnChCancel');

  let activeTab = 'people';
  let editMode = false;

  function currentChapterId(){ return Number(chapterSlider.value); }

  function renderChapterMeta(chId){
    const ch = CH.find(c => c.id === chId) || {};
    chapterLabel.textContent = String(chId);
    chapterTotal.textContent = String(CH.length || 88);
    chapterMeta.textContent  = ch.title || '';
    // Annotate summary and events with hoverable entity spans
    summaryEl.innerHTML = annotateEntitiesHTML(ch.summary || '', chId);
    eventsEl.innerHTML = '';
    (ch.events || []).forEach(e => {
      const li = document.createElement('li');
      li.innerHTML = annotateEntitiesHTML(e, chId);
      eventsEl.appendChild(li);
    });

    // If edit mode, populate editor
    if (editMode){
      edChWrap.style.display = '';
      edChTitle.value = ch.title || '';
      edChSummary.value = ch.summary || '';
      edChEvents.value = (ch.events || []).join('\n');
    } else {
      edChWrap.style.display = 'none';
    }
  }

  function matchesQuery(rec, q){
    if (!q) return true;
    const hay = `${rec.name} ${(rec.aka||[]).join(' ')} ${rec.desc||''} ${rec.role||''}`.toLowerCase();
    return hay.includes(q);
  }

  function downloadText(filename, text){
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }
  function ensureNotes(ch){
    ch.notes = ch.notes || {};
    ch.notes.people = ch.notes.people || {};
    ch.notes.places = ch.notes.places || {};
  }

  function renderGrid(){
    const chId = currentChapterId();
    const q = searchEl.value.trim().toLowerCase();
    grid.innerHTML = '';

    const ids = soFarMentions(chId);

    if (activeTab === 'people'){
      gridTitle.textContent = 'Characters';
      let list = PEOPLE.filter(p => ids.people.has(p.id));
      if (q) list = list.filter(p => matchesQuery(p, q));

      const selected = (document.querySelector('input[name="sort"]:checked')||{}).value || 'relevance';
      if (selected === 'alpha'){
        list.sort((a,b)=>a.name.localeCompare(b.name));
      } else if (selected === 'first'){
        list.sort((a,b)=> firstKey(a).localeCompare(firstKey(b)) || a.name.localeCompare(b.name));
      } else {
        list.sort((a,b)=>{
          const ra = relevanceRankForPerson(a.id, chId);
          const rb = relevanceRankForPerson(b.id, chId);
          if (ra !== rb) return ra - rb;
          const fa = firstKey(a), fb = firstKey(b);
          if (fa !== fb) return fa.localeCompare(fb);
          return a.name.localeCompare(b.name);
        });
      }

      for (const p of list){
        const card = document.createElement('article'); card.className = 'item'; card.dataset.type = 'person'; card.dataset.id = p.id;
        if (isInCurrentChapterPerson(p.id, chId)) card.classList.add('in-chapter');
        const portrait = makePortrait(p.name, candidatesFor(p,false));
        card.appendChild(portrait);
        const body = document.createElement('div'); body.className = 'body';
        const nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = p.name;
        const akaEl = (p.aka && p.aka.length) ? (()=>{const d=document.createElement('div'); d.className='aka'; d.textContent=`aka: ${p.aka.join(', ')}`; return d;})() : null;
        const roleEl = (p.role) ? (()=>{const d=document.createElement('div'); d.className='role'; d.textContent=p.role; return d;})() : null;
        const descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = p.desc || '';
        const badges = document.createElement('div'); badges.className = 'badges';
        if (isInCurrentChapterPerson(p.id, chId)) { const b0 = document.createElement('span'); b0.className='badge inchapter'; b0.textContent='In this chapter'; badges.appendChild(b0); }
        if (isDeceasedAt(p, chId)){ const b = document.createElement('span'); b.className='badge deceased'; const di = lastDeathInfo(p, chId); b.textContent = di ? `Deceased (Ch ${di.chapter})` : 'Deceased'; b.title = di ? (di.note ? `${di.note} — Chapter ${di.chapter}` : `Died in Chapter ${di.chapter}`) : 'Deceased'; badges.appendChild(b); }

        body.appendChild(nameEl); if (akaEl) body.appendChild(akaEl); if (roleEl) body.appendChild(roleEl); body.appendChild(descEl);

        // Chapter-specific note
        const ch = CH.find(c => c.id === chId); ensureNotes(ch);
        const noteText = ch.notes.people[p.id] || '';
        if (noteText){ const note = document.createElement('div'); note.className='note'; note.textContent = noteText; body.appendChild(note); }
        if (badges.children.length) body.appendChild(badges);

        // Inline editor for people
        if (editMode){
          card.classList.add('editing');
          const ed = document.createElement('div'); ed.className='editor';
          const row1 = document.createElement('div'); row1.className = 'row';
          const labRole = document.createElement('label'); labRole.textContent='Role';
          const inRole = document.createElement('input'); inRole.type='text'; inRole.value = p.role || '';
          labRole.appendChild(inRole); row1.appendChild(labRole); ed.appendChild(row1);
          const row2 = document.createElement('div'); row2.className = 'row';
          const labDesc = document.createElement('label'); labDesc.textContent='Description';
          const taDesc = document.createElement('textarea'); taDesc.value = p.desc || '';
          labDesc.appendChild(taDesc); row2.appendChild(labDesc); ed.appendChild(row2);
          const row3 = document.createElement('div'); row3.className='row';
          const labNote = document.createElement('label'); labNote.textContent='Chapter note for this character';
          const taNote = document.createElement('textarea'); taNote.value = ch.notes.people[p.id] || '';
          labNote.appendChild(taNote); row3.appendChild(labNote); ed.appendChild(row3);
          const actions = document.createElement('div'); actions.className='actions-r';
          const btnS = document.createElement('button'); btnS.className='btn'; btnS.textContent='Save';
          const btnC = document.createElement('button'); btnC.className='btn'; btnC.textContent='Cancel';
          actions.appendChild(btnS); actions.appendChild(btnC); ed.appendChild(actions);
          btnS.addEventListener('click', () => { p.role = inRole.value.trim(); p.desc = taDesc.value.trim(); const t = taNote.value.trim(); if (t) ch.notes.people[p.id] = t; else delete ch.notes.people[p.id]; renderGrid(); });
          btnC.addEventListener('click', () => renderGrid());
          body.appendChild(ed);
        }

        card.appendChild(body); grid.appendChild(card);
      }
    } else {
      gridTitle.textContent = 'Places';
      let list = PLACES.filter(pl => ids.places.has(pl.id));
      if (q) list = list.filter(pl => matchesQuery(pl, q));
      const ch = CH.find(c => c.id === chId);
      const selected = (document.querySelector('input[name="sort"]:checked')||{}).value || 'relevance';
      if (selected === 'alpha'){
        list.sort((a,b)=>a.name.localeCompare(b.name));
      } else if (selected === 'first'){
        list.sort((a,b)=> firstKey(a).localeCompare(firstKey(b)) || a.name.localeCompare(b.name));
      } else {
        list.sort((a,b)=>{
          const ain = (ch && Array.isArray(ch.mentions?.places) && ch.mentions.places.includes(a.id)) ? 0 : 1;
          const bin = (ch && Array.isArray(ch.mentions?.places) && ch.mentions.places.includes(b.id)) ? 0 : 1;
          if (ain !== bin) return ain - bin;
          const fa = firstKey(a), fb = firstKey(b);
          if (fa !== fb) return fa.localeCompare(fb);
          return a.name.localeCompare(b.name);
        });
      }
      for (const pl of list){
        const card = document.createElement('article'); card.className = 'item'; card.dataset.type='place'; card.dataset.id=pl.id;
        if (isInCurrentChapterPlace(pl.id, chId)) card.classList.add('in-chapter');
        const portrait = makePortrait(pl.name, candidatesFor(pl,true));
        card.appendChild(portrait);
        const body = document.createElement('div'); body.className = 'body';
        const nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = pl.name;
        const akaEl = (pl.aka && pl.aka.length) ? (()=>{const d=document.createElement('div'); d.className='aka'; d.textContent=`aka: ${pl.aka.join(', ')}`; return d;})() : null;
        const descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = pl.desc || '';
        body.appendChild(nameEl); if (akaEl) body.appendChild(akaEl); body.appendChild(descEl);

        const ch2 = CH.find(c => c.id === chId); ensureNotes(ch2);
        const pnote = ch2.notes.places[pl.id] || '';
        if (pnote){ const note = document.createElement('div'); note.className='note'; note.textContent = pnote; body.appendChild(note); }

        if (editMode){
          card.classList.add('editing');
          const ed = document.createElement('div'); ed.className='editor';
          const row = document.createElement('div'); row.className='row';
          const lab = document.createElement('label'); lab.textContent='Chapter note for this place';
          const ta = document.createElement('textarea'); ta.value = pnote;
          lab.appendChild(ta); row.appendChild(lab); ed.appendChild(row);
          const actions = document.createElement('div'); actions.className='actions-r';
          const btnS = document.createElement('button'); btnS.className='btn'; btnS.textContent='Save';
          const btnC = document.createElement('button'); btnC.className='btn'; btnC.textContent='Cancel';
          actions.appendChild(btnS); actions.appendChild(btnC); ed.appendChild(actions);
          btnS.addEventListener('click', ()=>{ const t = ta.value.trim(); if (t) ch2.notes.places[pl.id] = t; else delete ch2.notes.places[pl.id]; renderGrid(); });
          btnC.addEventListener('click', ()=> renderGrid());
          body.appendChild(ed);
        }

        card.appendChild(body); grid.appendChild(card);
      }
    }
  }

  // Hover preview handling
  function getEntityById(type, id){
    if (type === 'person') return PEOPLE.find(p=>p.id===id);
    if (type === 'place') return PLACES.find(p=>p.id===id);
    return null;
  }
  function buildPreviewHTML(type, rec, chId){
    let desc = (rec && rec.desc) || '';
    let role = rec.role || '';
    let badges = '';
    if (type==='person'){
      if (isDeceasedAt(rec, chId)){
        const di = lastDeathInfo(rec, chId);
        badges += `<span class="badge deceased">${di ? `Deceased (Ch ${di.chapter})` : 'Deceased'}</span>`;
      }
      if (isInCurrentChapterPerson(rec.id, chId)){
        badges += `<span class="badge inchapter">In this chapter</span>`;
      }
    } else {
      if (isInCurrentChapterPlace(rec.id, chId)){
        badges += `<span class="badge inchapter">In this chapter</span>`;
      }
    }
    const title = rec.name || '';
    const sub = role ? role : (rec.aka && rec.aka.length ? `aka: ${rec.aka.join(', ')}` : '');
    return `<div class="p-title">${title}</div>${sub?`<div class="p-sub">${sub}</div>`:''}<div class="p-desc">${(desc||'').replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div><div class="p-badges">${badges}</div>`;
  }
  function attachHoverHandlers(){
    function showPreview(e){
      const t = e.target.closest('.link-entity'); if (!t) return;
      const type = t.dataset.type, id = t.dataset.id;
      const rec = getEntityById(type,id); if (!rec) return;
      hoverPrev.innerHTML = buildPreviewHTML(type, rec, currentChapterId());
      const rect = t.getBoundingClientRect();
      const x = Math.min(rect.left+window.scrollX, window.scrollX + window.innerWidth - hoverPrev.offsetWidth - 16);
      const y = rect.bottom + window.scrollY + 8;
      hoverPrev.style.left = x+'px'; hoverPrev.style.top = y+'px';
      hoverPrev.style.display = 'block';
    }
    function hidePreview(){ hoverPrev.style.display='none'; }
    summaryEl.addEventListener('mouseover', showPreview);
    summaryEl.addEventListener('mouseout', hidePreview);
    eventsEl.addEventListener('mouseover', showPreview);
    eventsEl.addEventListener('mouseout', hidePreview);

    function onClickEntity(e){
      const t = e.target.closest('.link-entity'); if (!t) return;
      const type = t.dataset.type, id = t.dataset.id;
      if (type === 'place' && activeTab !== 'places'){ activeTab = 'places'; tabPlaces.classList.add('active'); tabPeople.classList.remove('active'); renderGrid(); }
      if (type === 'person' && activeTab !== 'people'){ activeTab = 'people'; tabPeople.classList.add('active'); tabPlaces.classList.remove('active'); renderGrid(); }
      // Scroll after render
      setTimeout(()=>{
        const el = grid.querySelector(`.item[data-type="${type}"][data-id="${id}"]`);
        if (el){ el.scrollIntoView({behavior:'smooth', block:'center'}); el.classList.add('highlight-scroll'); setTimeout(()=> el.classList.remove('highlight-scroll'), 2000); }
      }, 60);
    }
    summaryEl.addEventListener('click', onClickEntity);
    eventsEl.addEventListener('click', onClickEntity);
  }

  function setChapter(n){ renderChapterMeta(n); renderGrid(); }

  function init(){
    CH.sort((a,b)=>a.id-b.id);
    chapterSlider.min = String(CH[0]?.id || 1);
    chapterSlider.max = String(CH[CH.length-1]?.id || 88);
    chapterSlider.step = '1';
    chapterTotal.textContent = String(CH.length || 88);
    const firstId = CH[0]?.id || 1;
    setChapter(firstId); chapterSlider.value = String(firstId);
    chapterSlider.addEventListener('input', () => setChapter(Number(chapterSlider.value)));
    searchEl.addEventListener('input', renderGrid);
    document.querySelectorAll('input[name="sort"]').forEach(r => r.addEventListener('change', renderGrid));
    tabPeople.addEventListener('click', () => { activeTab='people'; tabPeople.classList.add('active'); tabPlaces.classList.remove('active'); renderGrid(); });
    tabPlaces.addEventListener('click', () => { activeTab='places'; tabPlaces.classList.add('active'); tabPeople.classList.remove('active'); renderGrid(); });

    // Toolbar
    btnEdit.addEventListener('click', () => {
      editMode = !editMode;
      btnEdit.textContent = editMode ? '✅ Done' : '✏️ Edit';
      renderChapterMeta(currentChapterId());
      renderGrid();
    });
    btnExport.addEventListener('click', () => {
      const peopleStr = 'window.people = ' + JSON.stringify(PEOPLE, null, 2) + ';\n';
      const placesStr = 'window.places = ' + JSON.stringify(PLACES, null, 2) + ';\n';
      const chStr     = 'window.chapters = ' + JSON.stringify(CH, null, 2) + ';\n';
      downloadText('people.edited.js', peopleStr);
      downloadText('places.edited.js', placesStr);
      downloadText('chapters.edited.js', chStr);
      alert('Exported 3 files. Replace your originals in /data to keep changes.');
    });

    // Chapter editor buttons
    btnChSave.addEventListener('click', () => {
      const chId = currentChapterId();
      const ch = CH.find(c=>c.id===chId); if (!ch) return;
      ch.title = edChTitle.value.trim();
      ch.summary = edChSummary.value.trim();
      ch.events = edChEvents.value.split('\n').map(s=>s.trim()).filter(Boolean);
      setChapter(chId);
    });
    btnChCancel.addEventListener('click', () => { setChapter(currentChapterId()); });

    // Hover previews + click-to-scroll
    attachHoverHandlers();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
