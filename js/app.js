// /js/app.js
// expects window.chapters (from /data/chapters.js)
// and window.people   (from /data/people.js)

(() => {
  const chapters = Array.isArray(window.chapters) ? window.chapters : [];
  const PEOPLE   = Array.isArray(window.people)   ? window.people   : [];

  // ---------- helpers ----------
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

  const avatarPathFor = (person) => {
    if (person.avatarOverride) return `Avatars/${person.avatarOverride}`;
    const slug = toAsciiSlug(person.avatarName || person.name);
    return `Avatars/${slug}_avatar.jpg`;
  };

  function makePortraitEl(name, src){
    const wrap = document.createElement('div');
    wrap.className = 'portrait';

    const img = document.createElement('img');

    // Fallback (handles 404s and weird cached-zero cases)
    const showFallback = () => {
      img.style.display = 'none';
      if (!wrap.querySelector('.fallback')) {
        const fb = document.createElement('div');
        fb.className = 'fallback';
        const initials = (name||'')
          .split(/\s+/).filter(Boolean).slice(0,2)
          .map(w => stripDiacritics(w[0]||'').toUpperCase()).join('');
        fb.textContent = initials || '?';
        wrap.appendChild(fb);
      }
    };

    img.addEventListener('error', showFallback, { once:true });
    img.addEventListener('load', () => {
      // Sometimes images "load" but have zero natural size (corrupt/cached issue).
      if (!img.naturalWidth || !img.naturalHeight) showFallback();
    }, { once:true });

    img.alt = `${name} portrait`;
    img.loading = 'lazy';
    img.src = src;
    wrap.appendChild(img);
    return wrap;
  }

  // ---------- DOM ----------
  const $  = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const chapterSlider = $('#chapterSlider');
  const chapterLabel  = $('#chapterLabel');
  const chapterTotal  = $('#chapterTotal');
  const chapterMeta   = $('#chapterMeta');

  const summaryEl = $('#summary');
  const eventsEl  = $('#events');
  const placesEl  = $('#places');

  const searchEl  = $('#search');
  const roleEl    = $('#role');
  const tglHighlight    = $('#tglHighlight');
  const tglHideDeceased = $('#tglHideDeceased');
  const tglHideNotAgain = $('#tglHideNotAgain');
  const peopleEl  = $('#people');

  const sortValue = () => (document.querySelector('input[name="sort"]:checked')?.value) || 'relevant';

  // ---------- render ----------
  function setChapter(n){
    const chap = chapters.find(c => c.id === n) || chapters[0] || {id:1,title:'',summary:'',events:[],places:[]};
    chapterLabel.textContent = String(chap.id);
    chapterMeta.textContent  = chap.title || '';
    summaryEl.textContent    = chap.summary || '';
    eventsEl.innerHTML = (chap.events||[]).map(e=>`<li>${e}</li>`).join('');
    placesEl.innerHTML = (chap.places||[]).map(p=>`<li>${p}</li>`).join('');
    renderPeople();
  }

  function personHTML(p, ch){
    // Role filter
    if (roleEl.value !== 'all' && p.role !== roleEl.value) return '';

    // Hide deceased if toggled
    if (tglHideDeceased.checked && p.deceased) return '';

    // Hide if not mentioned again (last mention before current chapter)
    const last = (p.lastMention ?? Math.max(...(p.appearsIn||[0])));
    if (tglHideNotAgain.checked && last < ch) return '';

    // Search over name, aka, generic desc, and chapter notes
    const q = searchEl.value.trim().toLowerCase();
    if (q){
      const hay = [
        p.name,
        ...(p.aka||[]),
        p.desc||'',
        ...(p.chapters ? Object.values(p.chapters) : [])
      ].join(' \n ').toLowerCase();
      if (!hay.includes(q)) return '';
    }

    const inChapter = (p.appearsIn||[]).includes(ch);
    const card = document.createElement('div');
    card.className = `person ${inChapter && tglHighlight.checked ? 'in-chapter':''} ${!inChapter && tglHighlight.checked ? 'muted':''}`.trim();

    const portrait = makePortraitEl(p.name, avatarPathFor(p));
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

    const noteEl = (p.chapters && p.chapters[ch])
      ? (()=>{ const el = document.createElement('div'); el.className='note'; el.textContent = p.chapters[ch]; return el; })()
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
      here.className = 'badge';
      here.textContent = 'In this chapter';
      badges.appendChild(here);
    }

    body.appendChild(nameEl);
    if (akaEl) body.appendChild(akaEl);
    body.appendChild(descEl);
    if (noteEl) body.appendChild(noteEl);
    body.appendChild(badges);

    card.appendChild(portrait);
    card.appendChild(body);

    return card.outerHTML;
  }

  function renderPeople(){
    const ch = Number(chapterSlider.value);
    let arr = [...PEOPLE];

    // Sorting
    const s = sortValue();
    if (s === 'alpha') arr.sort(byAlpha);
    else if (s === 'appearance') arr.sort(byAppearance);
    else arr.sort(byRelevant(ch));

    // Render
    peopleEl.innerHTML = arr.map(p => personHTML(p, ch)).filter(Boolean).join('');
  }

  // ---------- init ----------
  function init(){
    const total = chapters.length || 1;
    chapterTotal.textContent = String(total);
    chapterSlider.max = String(total);
    chapterSlider.value = String(chapters[0]?.id || 1);
    setChapter(Number(chapterSlider.value));

    chapterSlider.addEventListener('input', () => setChapter(Number(chapterSlider.value)));
    [searchEl, roleEl, tglHighlight, tglHideDeceased, tglHideNotAgain].forEach(c => c.addEventListener('input', renderPeople));
    $$( 'input[name="sort"]' ).forEach(r => r.addEventListener('change', renderPeople));
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();
