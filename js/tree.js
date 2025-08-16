import { getPeople } from './app.js';

const showDirBtn = document.getElementById('showDir');
const showTreeBtn = document.getElementById('showTree');
const treePane = document.getElementById('treePane');
const treeSVG = d3.select('#tree');
const rootSelect = document.getElementById('rootSelect');
const fitBtn = document.getElementById('fitTree');

showDirBtn.onclick = ()=>{ treePane.style.display='none'; document.getElementById('grid').style.display='grid'; };
showTreeBtn.onclick = ()=>{ document.getElementById('grid').style.display='none'; treePane.style.display='block'; initTree(); };
fitBtn.onclick = ()=> fitToView();

function colorFor(p){
  switch(p.house){
    case 'Kaurava': return '#d75b54';
    case 'Pandava': return '#3aa76d';
    case 'Kuru': return '#b47c3a';
    case 'Yadava': return '#3f6ea7';
    default:
      if(p.role==='Sage') return '#6a4fbf';
      if(p.role==='Deity') return '#3f6ea7';
      return '#8c8c8c';
  }
}

function initTree(){
  const people = getPeople();
  const roots = people.filter(p=>p.relations && p.relations.children && p.relations.children.length);
  rootSelect.innerHTML = roots.map(r=>`<option>${r.name}</option>`).join('');
  if(!rootSelect.value) rootSelect.value = 'Shantanu';
  rootSelect.onchange = ()=> renderTree(rootSelect.value);
  renderTree(rootSelect.value);
}

function buildHierarchy(rootName){
  const people = getPeople();
  const byName = new Map(people.map(p=>[p.name,p]));
  const seen = new Set();
  function makeNode(name){
    const p = byName.get(name);
    const safe = p || {name, role:'Other', house:'Other', generation:'', relations:{children:[]}, notes:''};
    if(seen.has(name)) return safe;
    seen.add(name);
    const kids = (safe.relations && safe.relations.children) ? safe.relations.children : [];
    return { data: safe, children: kids.map(makeNode) };
  }
  return makeNode(rootName);
}

function renderTree(rootName){
  treeSVG.selectAll('*').remove();
  const rootObj = buildHierarchy(rootName);
  const root = d3.hierarchy(rootObj, d=>d.children);
  const dx = 90, dy = 220;
  const treeLayout = d3.tree().nodeSize([dx, dy]);
  treeLayout(root);

  let x0 = Infinity, x1 = -Infinity;
  root.each(d=>{ if(d.x < x0) x0 = d.x; if(d.x > x1) x1 = d.x; });
  const width = Math.max(1200, root.height * dy + 200);
  const height = Math.max(800, x1 - x0 + dx*2);
  treeSVG.attr('viewBox', [(-dy*0.6), (x0 - dx), width, height]);

  treeSVG.append('g')
    .attr('fill','none')
    .attr('stroke','#7c5b2e')
    .attr('stroke-opacity',0.75)
    .attr('stroke-width',2)
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('class','link')
    .attr('d', d3.linkHorizontal().x(d=>d.y).y(d=>d.x));

  const node = treeSVG.append('g')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
      .attr('class','node')
      .attr('transform', d=>`translate(${d.y},${d.x})`);

  node.append('rect')
    .attr('x', -85).attr('y', -30).attr('width', 170).attr('height', 60)
    .attr('stroke', d=>colorFor(d.data.data))
    .attr('fill', '#fffaf0');

  node.append('text')
    .attr('class','name')
    .attr('text-anchor','middle')
    .attr('y', -6)
    .text(d=>d.data.data.name);

  node.append('text')
    .attr('class','role')
    .attr('text-anchor','middle')
    .attr('y', 14)
    .text(d=> `${d.data.data.role||''} · ${d.data.data.house||''}`.replace(/^ ·\s*/,'') );

  fitToView();
}

function fitToView(){ /* viewBox already fits */ }