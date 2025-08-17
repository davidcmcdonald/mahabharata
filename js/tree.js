// js/tree.js
// One big zoomable D3 family tree, no dropdowns.
// Builds edges from relations: father/mother -> child and parent -> children.

import { getPeople } from './app.js';

const showDirBtn = document.getElementById('showDir');
const showTreeBtn = document.getElementById('showTree');
const treePane = document.getElementById('treePane');
const dirPane = document.getElementById('dirPane');

const fitBtn = document.getElementById('fitTree');
const rootSelect = document.getElementById('rootSelect');

let svg, g, zoomBehavior;
let initialized = false;

function toggle(toTree) {
  if (toTree) {
    treePane.style.display = 'block';
    dirPane.style.display = 'none';
    if (!initialized) buildTreeOnce();
  } else {
    treePane.style.display = 'none';
    dirPane.style.display = '';
  }
}

showTreeBtn?.addEventListener('click', () => toggle(true));
showDirBtn?.addEventListener('click', () => toggle(false));

// ===== Build a simple parent->children graph using relations =====
function computeEdges() {
  const people = getPeople();
  const byName = new Map(people.map(p => [p.name, p]));
  const children = new Map();

  // Parent listed with children
  people.forEach(p => {
    const rel = p.relations || {};
    (rel.children || []).forEach(ch => {
      if (!children.has(p.name)) children.set(p.name, new Set());
      children.get(p.name).add(ch);
    });
  });

  // Parent listed on child (father/mother)
  people.forEach(p => {
    const rel = p.relations || {};
    ['father', 'mother'].forEach(k => {
      (rel[k] || []).forEach(parent => {
        if (!children.has(parent)) children.set(parent, new Set());
        children.get(parent).add(p.name);
      });
    });
  });

  return { children, byName, people };
}

function rootCandidates(children, people) {
  const allNames = new Set(people.map(p => p.name));
  const childNames = new Set(Array.from(children.values()).flatMap(s => Array.from(s)));
  return Array.from(allNames).filter(n => !childNames.has(n)).sort();
}

function hierarchyFrom(rootName, edges) {
  const { children, byName } = edges;
  const seen = new Set();

  function build(name) {
    if (seen.has(name)) return null;
    seen.add(name);
    const p = byName.get(name) || { name };
    const kids = Array.from(children.get(name) || []);
    return {
      name,
      role: p.role || '',
      house: p.house || '',
      children: kids.map(build).filter(Boolean)
    };
  }
  return build(rootName);
}

function colorFor(house) {
  if (/Kaurava/i.test(house)) return '#d75b54';
  if (/Pandava/i.test(house)) return '#3aa76d';
  if (/Kuru/i.test(house)) return '#b47c3a';
  if (/Sage/i.test(house)) return '#6a4fbf';
  if (/Deity/i.test(house)) return '#3f6ea7';
  return '#7c5b2e';
}

function initSVG() {
  svg = d3.select('#tree');
  svg.selectAll('*').remove();
  g = svg.append('g');

  zoomBehavior = d3.zoom().scaleExtent([0.3, 3])
    .on('zoom', ev => g.attr('transform', ev.transform));
  svg.call(zoomBehavior);

  fitBtn?.addEventListener('click', fitToView);
}

function renderTree() {
  const edges = computeEdges();
  if (!rootSelect.value && rootSelect.options.length === 0) {
    const roots = rootCandidates(edges.children, edges.people);
    rootSelect.innerHTML = roots.map(n => `<option>${n}</option>`).join('');
  }
  if (!rootSelect.value && rootSelect.options.length) {
    rootSelect.selectedIndex = 0;
  }
  rootSelect.onchange = () => draw(rootSelect.value, edges);

  draw(rootSelect.value || rootSelect.options[0]?.value, edges);
}

function draw(rootName, edges) {
  if (!rootName) return;

  const data = hierarchyFrom(rootName, edges);
  const root = d3.hierarchy(data);
  const layout = d3.tree().nodeSize([140, 120]);
  layout(root);

  g.selectAll('*').remove();

  // links
  g.selectAll('.link')
    .data(root.links())
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y + 80)
      .y(d => d.x + 40)
    );

  // nodes
  const node = g.selectAll('.node')
    .data(root.descendants())
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`);

  node.append('rect')
    .attr('width', 160).attr('height', 80).attr('rx', 12).attr('ry', 12)
    .attr('fill', '#fff')
    .attr('stroke', d => colorFor(d.data.house))
    .attr('stroke-width', 2)
    .attr('filter', null);

  node.append('text')
    .attr('x', 12).attr('y', 24)
    .attr('font-weight', 700)
    .text(d => d.data.name);

  node.append('text')
    .attr('x', 12).attr('y', 44)
    .attr('opacity', 0.8)
    .text(d => d.data.role || d.data.house || '');

  fitToView();
}

function fitToView() {
  const bbox = g.node().getBBox();
  const el = document.getElementById('tree');
  const width = el.clientWidth || 1200;
  const height = el.clientHeight || 800;

  const scale = Math.min(
    width / (bbox.width + 160),
    height / (bbox.height + 160)
  );

  const tx = (width - (bbox.width * scale)) / 2 - (bbox.x * scale);
  const ty = (height - (bbox.height * scale)) / 2 - (bbox.y * scale);

  const t = d3.zoomIdentity.translate(tx, ty).scale(scale);
  svg.transition().duration(400).call(zoomBehavior.transform, t);
}

function buildTreeOnce() {
  initSVG();
  renderTree();
  initialized = true;
}

// If user lands directly on Tree (rare), ensure it renders on first click
// (Directory view is default)
