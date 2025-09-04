// app.js — v4 life_events (death/revival) + places + relevance
(() => {
  const CH = Array.isArray(window.chapters) ? window.chapters : [];
  const PEOPLE = Array.isArray(window.people) ? window.people : [];
  const PLACES = Array.isArray(window.places) ? window.places : [];

  // ------------- helpers -------------
  const strip = (s) => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); // diacritics
  const slug = (s) => strip(String(s||'').trim().toLowerCase()).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

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

  // Relevance rank for people in the *current* chapter only
  const weightRank = { major: 0, significant: 1, minor: 2 };
  const relevanceRankForPerson = (pid, chId) => {
    const ch = CH.find(c => c.id === chId);
    if (!ch || !ch.mentions || !Array.isArray(ch.mentions.people)) return 99;
    const ent = ch.mentions.people.find(([id]) => id === pid);
    if (!ent) return 99;
    const w = ent[1] || 'minor';
    return weightRank[w] ?? 99;
  };

  // Places are presence-only
  const isPlaceInChapter = (ch, id) => {
    if (!ch || !ch.mentions || !Array.isArray(ch.mentions.places)) return false;
    return ch.mentions.places.includes(id);
  };

  // image candidates (try multiple folders + extensions)
  const AVATAR_DIRS = ['Avatars','avatars','Places','places'];
  const EXT = ['jpg','jpeg','png','webp'];
  const candidatesFor = (record, isPlace=false) => {
    const names = record.avatar
      ? [record.avatar]
      : EXT.flatMap(e => [`${slug(record.name)}_avatar.${e}`, `${slug(record.name)}.${e}`]);
    const dirs = isPlace ? ['Places','places','Avatars','avatars'] : ['Avatars','avatars','Places','places'];
    const paths = [];
    for (const d of dirs) for (const n of names) paths.push(`${d}/${n}`);
    return paths;
  };

  const makePortrait = (name, candidates) => {
    const wrap = document.createElement('div');
    wrap.className = 'portrait';
    const img = document.createElement('img');
    img.alt = `${name} portrait`;
    img.loading = 'lazy'; img.decoding = 'async';
    wrap.appendChild(img);
    const initials = (name||'').split(/\s+/).filter(Boolean).slice(0,2).map(w => strip(w[0]||'').toUpperCase()).join('') || '?';
    const showFallback = () => { if (img.parentNode) img.parentNode.remove(); const fb = document.createElement('div'); fb.className = 'fallback'; fb.textContent = initials; wrap.appendChild(fb); };
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

  // ------------- DOM refs -------------
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

  let activeTab = 'people'; // 'people' | 'places'

  function currentChapterId(){ return Number(chapterSlider.value); }

  // cumulative "so far" sets
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

  function renderChapterMeta(chId){
    const ch = CH.find(c => c.id === chId) || {};
    chapterLabel.textContent = String(chId);
    chapterTotal.textContent = String(CH.length || 88);
    chapterMeta.textContent  = ch.title || '';
    summaryEl.textContent    = ch.summary || '';
    eventsEl.innerHTML = '';
    (ch.events || []).forEach(e => { const li = document.createElement('li'); li.textContent = e; eventsEl.appendChild(li); });
  }

  function matchesQuery(rec, q){
    if (!q) return true;
    const hay = `${rec.name} ${(rec.aka||[]).join(' ')} ${rec.desc||''}`.toLowerCase();
    return hay.includes(q);
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
        const card = document.createElement('article'); card.className = 'item';
        const portrait = makePortrait(p.name, candidatesFor(p,false));
        card.appendChild(portrait);
        const body = document.createElement('div'); body.className = 'body';
        const nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = p.name;
        const akaEl = (p.aka && p.aka.length) ? (()=>{const d=document.createElement('div'); d.className='aka'; d.textContent=`aka: ${p.aka.join(', ')}`; return d;})() : null;
        const descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = p.desc || '';
        const badges = document.createElement('div'); badges.className = 'badges';
        if (isDeceasedAt(p, chId)){ const b = document.createElement('span'); b.className='badge deceased'; b.textContent='Deceased'; badges.appendChild(b); }
        body.appendChild(nameEl); if (akaEl) body.appendChild(akaEl); body.appendChild(descEl); if (badges.children.length) body.appendChild(badges);
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
        const card = document.createElement('article'); card.className = 'item';
        const portrait = makePortrait(pl.name, candidatesFor(pl,true));
        card.appendChild(portrait);
        const body = document.createElement('div'); body.className = 'body';
        const nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = pl.name;
        const akaEl = (pl.aka && pl.aka.length) ? (()=>{const d=document.createElement('div'); d.className='aka'; d.textContent=`aka: ${pl.aka.join(', ')}`; return d;})() : null;
        const descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = pl.desc || '';
        body.appendChild(nameEl); if (akaEl) body.appendChild(akaEl); body.appendChild(descEl);
        card.appendChild(body); grid.appendChild(card);
      }
    }
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
