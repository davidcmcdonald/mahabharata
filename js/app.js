// js/app.js
// Assumes `people` global from data/people.js

// ===== DOM =====
const chapRange = document.getElementById('chapRange');
const chapLabel = document.getElementById('chapLabel');
const soFar = document.getElementById('soFar');
const hiLite = document.getElementById('hiLite');
const hideDead = document.getElementById('hideDead');
const hideAfterLast = document.getElementById('hideAfterLast');

const role = document.getElementById('role');
const house = document.getElementById('house');
const gen = document.getElementById('gen');
const sortSel = document.getElementById('sort');

const q = document.getElementById('q');

const count = document.getElementById('count');
const activeFilters = document.getElementById('activeFilters');
const grid = document.getElementById('grid');

const showDirBtn = document.getElementById('showDir');
const showTreeBtn = document.getElementById('showTree');
const dirPane = document.getElementById('dirPane');
const treePane = document.getElementById('treePane');

// ===== Constants =====
const TOC_CHAPTERS = 83; // Part One (1–48) + Part Two (1–35)

// ===== Utilities =====
function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function minOrInfinity(arr) {
  return (arr && arr.length) ? Math.min(...arr) : Infinity;
}
function displayNameForChapter(p, chap) {
  if (p.nameTimeline && p.nameTimeline.length) {
    for (const seg of p.nameTimeline) {
      const from = seg.from ?? 1;
      const to = seg.to ?? 9999;
      if (chap >= from && chap <= to) return seg.name;
    }
  }
  return p.name;
}

// AKA line (timeline-aware)
function akaLineForChapter(p, chap) {
  const akaParts = [];
  if (p.aliases?.length) akaParts.push(...p.aliases);
  if (p.nameTimeline?.length) {
    const ended = p.nameTimeline
      .filter(seg => (seg.to ?? 9999) < chap)
      .sort((a,b)=> (a.to??9999) - (b.to??9999));
    if (ended.length) {
      const last = ended[ended.length - 1];
      if (last.name !== displayNameForChapter(p, chap)) {
        akaParts.push(`previously ${last.name}`);
      }
    }
    const future = p.nameTimeline.find(seg => chap < (seg.from ?? 1));
    if (future && future.name !== displayNameForChapter(p, chap)) {
      akaParts.push(future.name);
    }
  }
  return akaParts.length ? `aka: ${akaParts.join(', ')}` : '';
}

// Relevance scoring for sort
function relevantScore(p, chap) {
  const first = minOrInfinity(p.appearsIn);
  let s = 0;
  if ((p.appearsIn || []).includes(chap)) s += 100; // in current chapter
  s += Math.max(0, 50 - Math.abs(chap - first));     // nearer first mention
  if (p.role && /King|Queen|Prince|Princess/i.test(p.role)) s += 10;
  if (p.house && /Pandava|Kaurava|Kuru/i.test(p.house)) s += 5;
  return s;
}

// ===== Filters & rendering =====
function matches(p) {
  const chap = parseInt(chapRange.value, 10);
  const term = q.value.trim().toLowerCase();

  // attribute filters
  if (role.value && p.role !== role.value) return false;
  if (house.value && p.house !== house.value) return false;
  if (gen.value && p.generation !== gen.value) return false;

  // introduced up to current chapter
  if (soFar.checked && !(minOrInfinity(p.appearsIn) <= chap)) return false;

  // hide deceased
  if (hideDead.checked && p.diedChapter && p.diedChapter <= chap) return false;

  // hide if not mentioned again
  if (hideAfterLast.checked && p.lastMention && p.lastMention < chap) return false;

  // search term across display name (timeline), aliases, notes
  if (!term) return true;
  const hay = [
    displayNameForChapter(p, chap),
    ...(p.aliases || []),
    p.notes || ''
  ].join(' ').toLowerCase();
  return hay.includes(term);
}

function cardHTML(p) {
  const chap = parseInt(chapRange.value, 10);
  const inThisChapter = (p.appearsIn || []).includes(chap);
  const hit = (inThisChapter && hiLite.checked) ? 'hit' : '';
  const firstMention = (p.appearsIn && p.appearsIn.length) ? Math.min(...p.appearsIn) : null;

  const dispName = displayNameForChapter(p, chap);
  const died = (p.diedChapter && p.diedChapter <= chap);
  const showName = died ? `${dispName} †` : dispName;

  const aliases = akaLineForChapter(p, chap);
  const tags = [p.role, p.house, p.generation].filter(Boolean)
    .map(t => `<span class="tag">${t}</span>`).join('');

  const rel = p.relations || {};
  const relHtml = ['father','mother','spouse','children'].map(k=>{
    if (!rel[k] || !rel[k].length) return '';
    return `<div class="rel"><strong>${k}:</strong> ${rel[k].join(', ')}</div>`;
  }).join('');

  const badges = [];
  if (firstMention) badges.push(`First: ch ${firstMention}`);
  if (p.lastMention) badges.push(`Last: ch ${p.lastMention}`);
  if ((p.appearsIn || []).length > 1) {
    const list = p.appearsIn.slice(0, 6).join(', ');
    badges.push(`Mentions: ch ${list}${p.appearsIn.length > 6 ? '…' : ''}`);
  }

  // portraits from images/characters/[slug]-portrait.jpg (fallback big letter)
  const idOrName = slug(p.id || p.name);
  const imgUrl = `images/characters/${idOrName}-portrait.jpg`;
  const fallback = `https://placehold.co/96x96/png?text=${encodeURIComponent(p.name[0])}`;
  const imgTag = `<img class="avatar" alt="" src="${imgUrl}" onerror="this.onerror=null;this.src='${fallback}';" />`;

  return `
  <article class="card ${hit}">
    ${imgTag}
    <div class="card-body">
      <div class="title">${showName}</div>
      ${aliases ? `<div class="aka">${aliases}</div>` : ''}
      <div class="meta">${tags}</div>
      ${p.notes ? `<div class="notes">${p.notes}</div>` : ''}
      ${badges.length ? `<div class="badges">${badges.map(b=>`<span class="badge">${b}</span>`).join('')}</div>` : ''}
      ${relHtml}
    </div>
  </article>`;
}

function renderDir() {
  const chap = parseInt(chapRange.value, 10);

  let list = people.filter(matches);

  // sort
  if (sortSel.value === 'relevant') {
    list = list.sort((a,b) => relevantScore(b, chap) - relevantScore(a, chap));
  } else {
    list = list.sort((a,b) =>
      displayNameForChapter(a, chap).localeCompare(displayNameForChapter(b, chap))
    );
  }

  // count & active filter chips
  count.textContent = `${list.length} of ${people.length} people shown — Chapter ${chap}`;
  activeFilters.innerHTML = '';
  [['Role', role.value], ['House', house.value], ['Gen', gen.value]].forEach(([k, v]) => {
    if (v) {
      const s = document.createElement('span');
      s.className = 'chip';
      s.textContent = `${k}: ${v}`;
      activeFilters.appendChild(s);
    }
  });

  // grid
  grid.innerHTML = list.map(cardHTML).join('');
}

// ===== Init =====
function populateFilterOptions() {
  // Build options from data
  const roles = new Set(), houses = new Set(), gens = new Set();
  for (const p of people) {
    if (p.role) roles.add(p.role);
    if (p.house) houses.add(p.house);
    if (p.generation) gens.add(p.generation);
  }
  const addOpts = (sel, items) => {
    const vals = Array.from(items).sort();
    for (const v of vals) {
      const o = document.createElement('option');
      o.value = v; o.textContent = v;
      sel.appendChild(o);
    }
  };
  addOpts(role, roles);
  addOpts(house, houses);
  addOpts(gen, gens);
}

function wireEvents() {
  chapRange.addEventListener('input', () => {
    chapLabel.textContent = chapRange.value;
    renderDir();
  });

  [soFar, hiLite, hideDead, hideAfterLast].forEach(el => el.addEventListener('change', renderDir));
  [role, house, gen, sortSel].forEach(el => el.addEventListener('change', renderDir));
  q.addEventListener('input', renderDir);

  showDirBtn.addEventListener('click', () => {
    dirPane.style.display = '';
    treePane.style.display = 'none';
  });
  showTreeBtn.addEventListener('click', () => {
    dirPane.style.display = 'none';
    treePane.style.display = 'block';
    // tree.js will render on first open
  });
}

function init() {
  // Ensure slider matches the full book
  chapRange.max = String(TOC_CHAPTERS);
  chapLabel.textContent = chapRange.value;

  populateFilterOptions();
  wireEvents();
  renderDir();
}

init();

// ===== Exported for tree.js =====
export function getPeople() {
  return people;
}
