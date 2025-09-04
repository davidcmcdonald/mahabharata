// /js/app.js
(() => {
  const chapters = Array.isArray(window.chapters) ? window.chapters : [];
  const PEOPLE   = Array.isArray(window.people)   ? window.people   : [];

  // --------- helpers ----------
  const stripDiacritics = (s) => String(s||'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const toAsciiSlug = (s) => stripDiacritics(String(s||'').trim().toLowerCase())
    .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

  const roleRank = { "Major":0, "Significant":1, "Minor":2 };

  const byAlpha = (a,b) => a.name.localeCompare(b.name);
  const byRelevant = (ch) => (a,b) => {
    const ain = (a.appearsIn||[]).includes(ch), bin = (b.appearsIn||[]).includes(ch);
    if (ain !== bin) return bin - ain;
    const rr = (roleRank[a.role]??9) - (roleRank[b.role]??9);
    if (rr) return rr;
    return a.name.localeCompare(b.name);
  };
  const byAppearance = (a,b) => {
    const fa = Math.min(...(a.appearsIn||[Infinity]));
    const fb = Math.min(...(b.appearsIn||[Infinity]));
    if (fa !== fb) return fa - fb;
    return a.name.localeCompare(b.name);
  };

  // --------- Avatars with robust fallback ----------
  const AVATAR_DIRS = ['Avatars','avatars'];
  const EXTENSIONS  = ['jpg','jpeg','png','webp'];

  const avatarCandidatesFor = (person) => {
    if (person.avatarOverride) {
      return AVATAR_DIRS.map(d => `${d}/${person.avatarOverride}`);
    }
    const slug = toAsciiSlug(person.avatarName || person.name);
    const names = [];
    for (const ext of EXTENSIONS) {
      names.push(`${slug}_avatar.${ext}`, `${slug}.${ext}`);
    }
    const paths = [];
    for (const d of AVATAR_DIRS) for (const n of names) paths.push(`${d}/${n}`);
    return paths;
  };

  function makePortraitEl(name, candidates){
    const wrap = document.createElement('div');
    wrap.className = 'portrait';

    const img = document.createElement('img');
    img.alt = `${name} portrait`;
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);

    let fallbackShown = false;
    const initials = (name||'')
      .split(/\s+/).filter(Boolean).slice(0,2)
      .map(w => stripDiacritics(w[0]||'').toUpperCase()).join('') || '?';

    const showFallback = (reason) => {
      if (fallbackShown) return;
      fallbackShown = true;
      // remove broken img so it never hides the letters
      if (img.parentNode) img.parentNode.removeChild(img);
      const fb = document.createElement('div');
      fb.className = 'fallback';
      fb.textContent = initials;
      wrap.appendChild(fb);
      if (window.DEBUG_AVATARS) console.warn('[avatar-fallback]', reason, candidates);
    };

    // preload each candidate; only set <img> src on a confirmed success
    let idx = 0;
    const tryNext = () => {
      if (idx >= candidates.length) { showFallback('exhausted'); return; }
      const src = candidates[idx++];

      const test = new Image();
      const timer = setTimeout(() => {
        test.onload = test.onerror = null;
        tryNext();
      }, 1500);

      test.onload = () => {
        clearTimeout(timer);
        img.src = src;
      };
      test.onerror = () => {
        clearTimeout(timer);
        tryNext();
      };
      test.src = src;
    };

    tryNext();
    return wrap;
  }

  // --------- DOM ----------
  const $  = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const chapterSlider = $('#chapterSlider');
  const chapterLabel  = $('#chapterLabel');
  const chapterTotal  = $('#chapterTotal');
  const chapterMeta   = $('#chapterMeta');

  const summaryEl = $('#summary');
  const eventsEl  = $('#events');
  const peopleEl  = $('#people');

  const searchEl       = $('#search');
  const roleEl         = $('#role');
  const tglHideDeceased= $('#tglHideDeceased');
  const tglHideNotAgain= $('#tglHideNotAgain');

  function setChapter(n){
    const ch = chapters.find(c => c.id === n);
    if (!ch) return;
    chapterLabel.textContent = String(ch.id);
    chapterTotal.textContent = String(chapters.length);
    chapterMeta.textContent = ch.title || '';

    summaryEl.textContent = ch.summary || '';
    eventsEl.innerHTML = '';
    (ch.events||[]).forEach(e => {
      const li = document.createElement('li');
      li.textContent = e;
      eventsEl.appendChild(li);
    });

    chapterSlider.value = String(n);
    renderPeople();
  }

  function renderPeople(){
    const currentChapter = Number(chapterSlider.value);
    const q = stripDiacritics(searchEl.value || '').toLowerCase();
    const role = roleEl.value;

    let list = PEOPLE.slice();

    if (q) {
      list = list.filter(p => {
        const hay = [
          p.name,
          ...(p.aka||[]),
          p.desc || '',
          ...Object.values(p.chapters||{})
        ].join(' ').toLowerCase();
        return stripDiacritics(hay).includes(q);
      });
    }
    if (role) list = list.filter(p => (p.role||'') === role);
    if (tglHideDeceased.checked) list = list.filter(p => !p.deceased);
    if (tglHideNotAgain.checked) list = list.filter(p => (p.lastMention||Infinity) >= currentChapter);

    const selectedSort = (document.querySelector('input[name="sort"]:checked')||{}).value || 'relevance';
    if (selectedSort === 'alpha') list.sort(byAlpha);
    else if (selectedSort === 'first') list.sort(byAppearance);
    else list.sort(byRelevant(currentChapter));

    peopleEl.innerHTML = '';
    for (const p of list) {
      const inChapter = (p.appearsIn||[]).includes(currentChapter);
      const card = document.createElement('article');
      card.className = 'person';

      const portrait = makePortraitEl(p.name, avatarCandidatesFor(p));
      card.appendChild(portrait);

      const body = document.createElement('div');
      body.className = 'person-body';

      const nameEl = document.createElement('div');
      nameEl.className = 'name';
      nameEl.textContent = p.name;

      const akaEl = (p.aka && p.aka.length)
        ? (()=>{ const el = document.createElement('div'); el.className='aka'; el.textContent = `aka: ${p.aka.join(', ')}`; return el; })()
        : null;

      const descEl = document.createElement('div');
      descEl.className = 'desc';
      descEl.textContent = p.desc || '';

      const noteEl = (p.chapters && p.chapters[currentChapter])
        ? (()=>{ const el = document.createElement('div'); el.className='note'; el.textContent = p.chapters[currentChapter]; return el; })()
        : null;

      const badges = document.createElement('div');
      badges.className = 'badges';
      const roleBadge = document.createElement('span');
      roleBadge.className = 'badge';
      roleBadge.textContent = p.role || '—';
      badges.appendChild(roleBadge);

      if (p.deceased) {
        const dead = document.createElement('span');
        dead.className = 'badge deceased';
        dead.textContent = 'Deceased';
        badges.appendChild(dead);
      }
      if (inChapter) {
        const here = document.createElement('span');
        here.className = 'badge in-ch';
        here.textContent = 'In this chapter';
        badges.appendChild(here);
      }
      if ((p.lastMention||Infinity) < currentChapter) {
        const na = document.createElement('span');
        na.className = 'badge not-again';
        na.textContent = 'Not seen after';
        badges.appendChild(na);
      }

      body.appendChild(nameEl);
      if (akaEl) body.appendChild(akaEl);
      body.appendChild(descEl);
      if (noteEl) body.appendChild(noteEl);
      body.appendChild(badges);

      card.appendChild(body);
      peopleEl.appendChild(card);
    }
  }

  function init(){
    chapterSlider.min  = chapters.length ? String(Math.min(...chapters.map(c=>c.id))) : '1';
    chapterSlider.max  = chapters.length ? String(Math.max(...chapters.map(c=>c.id))) : '1';
    chapterSlider.step = '1';
    chapterTotal.textContent = String(chapters.length);
    const firstId = chapters.length ? Math.min(...chapters.map(c=>c.id)) : 1;
    setChapter(firstId);

    chapterSlider.addEventListener('input', () => setChapter(Number(chapterSlider.value)));
    [searchEl, roleEl, tglHideDeceased, tglHideNotAgain].forEach(c => c.addEventListener('input', renderPeople));
    Array.from(document.querySelectorAll('input[name="sort"]')).forEach(r => r.addEventListener('change', renderPeople));
  }

  // window.DEBUG_AVATARS = true;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
