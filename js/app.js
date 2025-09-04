// /js/app.js
// expects window.chapters (from /data/chapters.js) and window.people (from /data/people.js)

const chapters = Array.isArray(window.chapters) ? window.chapters : [];
const people   = Array.isArray(window.people)   ? window.people   : [];

// ---------- helpers ----------
const stripDiacritics = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const toAsciiSlug = (s) => stripDiacritics(String(s||'').trim().toLowerCase())
  .replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

const byAlpha = (a,b) => a.name.localeCompare(b.name);
const roleRank = {"Major":0,"Significant":1,"Minor":2};
const byRelevant = (chapter) => (a,b) => {
  const ain = (a.appearsIn||[]).includes(chapter), bin = (b.appearsIn||[]).includes(chapter);
  if (ain !== bin) return bin - ain;           // in-chapter first
  const rr = (roleRank[a.role] ?? 9) - (roleRank[b.role] ?? 9);
  if (rr) return rr;
  return a.name.localeCompare(b.name);
};
const byAppearance = (a,b) => {
  const fa = Math.min(...(a.appearsIn||[Infinity])), fb = Math.min(...(b.appearsIn||[Infinity]));
  if (fa !== fb) return fa - fb;
  return a.name.localeCompare(b.name);
};

const avatarPathFor = (person) => {
  if (person.avatarOverride) return `Avatars/${person.avatarOverride}`;
  const slug = toAsciiSlug(person.avatarName || person.name);
  return `Avatars/${slug}_avatar.jpg`;
};

function attachAvatarFallback(img, name){
  const holder = img.closest('.avatar');
  img.addEventListener('error', ()=>{
    img.style.display = 'none';
    const fb = document.createElement('div');
    fb.className = 'fallback';
    const initials = (name||'')
      .split(/\s+/).filter(Boolean).slice(0,2)
      .map(w=>stripDiacritics(w[0]||'').toUpperCase()).join('');
    fb.textContent = initials || '?';
    holder.appendChild(fb);
  }, {once:true});
}

// ---------- DOM ----------
const $ = (s)=>document.querySelector(s);
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
const tglHighlight   = $('#tglHighlight');
const tglHideDeceased= $('#tglHideDeceased');
const tglHideNotAgain= $('#tglHideNotAgain');
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

function personCard(p, currentChapter){
  if (roleEl.value !== 'all' && p.role !== roleEl.value) return '';

  if (tglHideDeceased.checked) {
    const isAlive = (typeof p.alive === 'boolean') ? p.alive : !(p.diedChapter && p.diedChapter <= currentChapter);
    if (!isAlive) return '';
  }

  if (tglHideNotAgain.checked) {
    const last = (p.lastMention ?? (Array.isArray(p.appearsIn) ? Math.max(...p.appearsIn) : 999));
    if (last < currentChapter) return '';
  }

  const q = searchEl.value.trim().toLowerCase();
  if (q){
    const hay = [p.name, ...(p.aka||p.aliases||[]), p.desc||p.notes||''].join(' \n ').toLowerCase();
    if (!hay.includes(q)) return '';
  }

  const inChapter = (p.appearsIn||[]).includes(currentChapter);
  const alive = (typeof p.alive === 'boolean') ? p.alive : !(p.diedChapter && p.diedChapter <= currentChapter);
  const lifeCls = alive ? 'alive' : 'deceased';
  const lifeTxt = alive ? 'Alive' : 'Deceased';

  const card = document.createElement('div');
  card.className = `person ${inChapter && tglHighlight.checked ? 'in-chapter':''} ${!inChapter && tglHighlight.checked ? 'muted':''}`.trim();
  card.innerHTML = `
    <div class="avatar"><img alt="${p.name} avatar" loading="lazy" src="${avatarPathFor(p)}"></div>
    <div>
      <div class="name">${p.name}</div>
      ${p.aka?.length || p.aliases?.length ? `<div class="aka">aka: ${(p.aka||p.aliases).join(', ')}</div>`:''}
      <div class="desc">${p.desc||p.notes||''}</div>
      <div class="badges">
        <span class="badge">${p.role||'—'}</span>
        <span class="badge ${`life ${lifeCls}`}">${lifeTxt}</span>
        ${inChapter ? '<span class="badge">In this chapter</span>':''}
      </div>
    </div>`;
  attachAvatarFallback(card.querySelector('img'), p.name);
  return card.outerHTML;
}

function renderPeople(){
  const current = Number(chapterSlider.value);
  let arr = [...people];

  // Sort
  const s = sortValue();
  if (s === 'alpha') arr.sort(byAlpha);
  else if (s === 'appearance') arr.sort(byAppearance);
  else arr.sort(byRelevant(current));

  peopleEl.innerHTML = arr.map(p => personCard(p, current)).filter(Boolean).join('');
}

// ---------- init ----------
(function init(){
  const total = chapters.length || 1;
  chapterTotal.textContent = String(total);
  chapterSlider.max = String(total);
  chapterSlider.value = String(chapters[0]?.id || 1);
  setChapter(Number(chapterSlider.value));

  chapterSlider.addEventListener('input', () => setChapter(Number(chapterSlider.value)));
  [searchEl, roleEl, tglHighlight, tglHideDeceased, tglHideNotAgain].forEach(c => c.addEventListener('input', renderPeople));
  $$('input[name="sort"]').forEach(r => r.addEventListener('change', renderPeople));
})();
