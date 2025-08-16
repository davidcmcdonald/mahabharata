// Directory + Chapter Timeline
export function P(base, rel={}){
  return {
    ...base,
    aliases: base.aliases||[],
    appearsIn: base.appearsIn||[],
    relations: { father:[], mother:[], spouse:[], children:[], ...(rel||{} ) }
  };
}

const grid = document.getElementById('grid');
const count = document.getElementById('count');
const activeFilters = document.getElementById('activeFilters');
const q = document.getElementById('q');
const role = document.getElementById('role');
const house = document.getElementById('house');
const gen = document.getElementById('gen');
const chapRange = document.getElementById('chapRange');
const chapLabel = document.getElementById('chapLabel');
const soFar = document.getElementById('soFar');
const hiLite = document.getElementById('hiLite');

let people = [];

init();

async function init(){
  const res = await fetch('./data/people.json');
  people = await res.json();
  const maxInData = people.reduce((m,p)=>Math.max(m, ...(p.appearsIn&&p.appearsIn.length?p.appearsIn:[1])), 1);
  chapRange.max = Math.max(maxInData, 10);
  hookEvents();
  renderDir();
}

function hookEvents(){
  [q,role,house,gen].forEach(el=>el.addEventListener('input', renderDir));
  chapRange.addEventListener('input', ()=>{ chapLabel.textContent = chapRange.value; renderDir(); });
  soFar.addEventListener('change', renderDir);
  hiLite.addEventListener('change', renderDir);
}

function matches(p){
  const term = q.value.trim().toLowerCase();
  const chap = parseInt(chapRange.value,10);
  const firstMention = (p.appearsIn && p.appearsIn.length) ? Math.min(...p.appearsIn) : Infinity;
  if(role.value && p.role!==role.value) return false;
  if(house.value && p.house!==house.value) return false;
  if(gen.value && p.generation!==gen.value) return false;
  if(soFar.checked && !(firstMention <= chap)) return false;
  if(!term) return true;
  const hay = [p.name, ...(p.aliases||[]), p.notes||''].join(' ').toLowerCase();
  return hay.includes(term);
}

function cardHTML(p){
  const chap = parseInt(chapRange.value,10);
  const hit = (p.appearsIn||[]).includes(chap) && hiLite.checked;
  const firstMention = (p.appearsIn && p.appearsIn.length) ? Math.min(...p.appearsIn) : null;
  const aliases = p.aliases && p.aliases.length? `<div class="aka">aka: ${p.aliases.join(', ')}</div>`:'';
  const tags = [p.role,p.house,p.generation].filter(Boolean).map(t=>`<span class="tag">${t}</span>`).join('');
  const rel = p.relations||{};
  const relHtml = ['father','mother','spouse','children'].map(k=>{
    if(!rel[k]||!rel[k].length) return '';
    return `<div class="rel"><strong>${k}:</strong> ${rel[k].join(', ')}</div>`
  }).join('');
  const badges = [];
  if(firstMention) badges.push(`First: ch ${firstMention}`);
  if((p.appearsIn||[]).length>1) badges.push(`Mentions: ch ${(p.appearsIn||[]).slice(0,6).join(', ')}${(p.appearsIn||[]).length>6?'…':''}`);
  return `<article class="card ${hit?'hit':''}">
    <img class="avatar" alt="" src="https://placehold.co/96x96/png?text=${encodeURIComponent(p.name[0])}" />
    <div>
      <div class="title">${p.name}</div>
      ${aliases}
      <div class="meta">${tags}</div>
      <div class="notes">${p.notes||''}</div>
      ${badges.length?`<div class="badges">${badges.map(b=>`<span class='badge'>${b}</span>`).join('')}</div>`:''}
      ${relHtml}
    </div>
  </article>`
}

function renderDir(){
  const list = people.filter(matches).sort((a,b)=>a.name.localeCompare(b.name));
  count.textContent = `${list.length} of ${people.length} people shown — Chapter ${chapRange.value}`;
  activeFilters.innerHTML = '';
  [['Role',role.value],['House',house.value],['Gen',gen.value]].forEach(([k,v])=>{ if(v){ const s=document.createElement('span'); s.className='chip'; s.textContent=`${k}: ${v}`; activeFilters.appendChild(s)}});
  grid.innerHTML = list.map(cardHTML).join('');
}

// expose to tree.js
export function getPeople(){ return people; }