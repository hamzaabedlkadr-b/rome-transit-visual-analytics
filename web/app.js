// Rome scheduled transit: seven coordinated views sharing one stop selection.
// Every view can SET the selection (brush or click) and every view SHOWS it.
const $ = id => document.getElementById(id);
let rows = [], selected = null, source = null, scales = {};
const brushed = {};               // view -> [i0, i1] bin range that made the current selection
const margin = {left: 50, right: 18, top: 18, bottom: 38};
const TERMINI = {lat: 41.901308, lon: 12.500433};
const fmt = n => Number.isFinite(n) ? Math.round(n).toLocaleString('en-GB') : '—';
const pct = v => `${(100*v).toFixed(1)}%`;
const median = values => {
  if (!values.length) return NaN;
  values.sort((a,b) => a-b);
  const m = Math.floor(values.length / 2);
  return values.length % 2 ? values[m] : (values[m-1]+values[m])/2;
};

/* ---------- binned attributes used by the four bar views ---------- */
const BINS = {
  hours: {labels: Array.from({length: 24}, (_, h) => String(h).padStart(2, '0')),
    title: 'busiest scheduled hour', key: r => r.peak},
  departures: {labels: ['<10','10–24','25–49','50–99','100–199','200–399','400–799','800–1,599','1,600+'],
    edges: [0,10,25,50,100,200,400,800,1600,Infinity], title: 'scheduled departures per stop', key: r => r.depBin},
  routes: {labels: ['1','2','3','4','5','6–9','10–19','20+'],
    edges: [1,2,3,4,5,6,10,20,Infinity], title: 'distinct routes per stop', key: r => r.routeBin},
  distance: {labels: ['0–3 km','3–6 km','6–10 km','10–20 km','20+ km'],
    edges: [0,3,6,10,20,Infinity], title: 'distance from Termini', key: r => r.distBin}
};
const binOf = (edges, v) => { for (let i = 0; i < edges.length-1; i++) if (v >= edges[i] && v < edges[i+1]) return i; return edges.length-2; };
function haversine(lat, lon) {
  const R = 6371, toRad = Math.PI/180, dLat = (lat-TERMINI.lat)*toRad, dLon = (lon-TERMINI.lon)*toRad;
  const a = Math.sin(dLat/2)**2 + Math.cos(TERMINI.lat*toRad)*Math.cos(lat*toRad)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
function derive() {
  for (const r of rows) {
    let peak = 0; r.h.forEach((v, h) => { if (v > r.h[peak]) peak = h; });
    r.peak = peak;
    r.km = haversine(r.lat, r.lon);
    r.depBin = binOf(BINS.departures.edges, r.d);
    r.routeBin = binOf(BINS.routes.edges, r.r);
    r.distBin = binOf(BINS.distance.edges, r.km);
  }
}

/* ---------- views 01–02: map and PCA scatterplots (canvas) ---------- */
function extent(key) {
  let lo = Infinity, hi = -Infinity;
  for (const row of rows) { lo = Math.min(lo, row[key]); hi = Math.max(hi, row[key]); }
  const pad = (hi-lo)*.04 || 1;
  return [lo-pad, hi+pad];
}
function canvasSize(canvas) {
  const rect = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  canvas.width = Math.round(rect.width*dpr); canvas.height = Math.round(rect.height*dpr);
  const ctx = canvas.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  return {ctx, w: rect.width, h: rect.height};
}
function makeScale(w,h,xrange,yrange) {
  return {x: v => margin.left+(v-xrange[0])/(xrange[1]-xrange[0])*(w-margin.left-margin.right),
    y: v => h-margin.bottom-(v-yrange[0])/(yrange[1]-yrange[0])*(h-margin.top-margin.bottom), xrange, yrange};
}
const keys = type => type === 'map' ? ['lon','lat'] : ['pc1','pc2'];
function draw(type) {
  const {ctx,w,h} = canvasSize($(type));
  const [xkey, ykey] = keys(type);
  const scale = makeScale(w,h,extent(xkey),extent(ykey)); scales[type] = scale;
  ctx.clearRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
  ctx.font='10px Arial'; ctx.fillStyle='#607471'; ctx.strokeStyle='#edf0ef'; ctx.lineWidth=.7;
  for (let t=0; t<=4; t++) {
    const xv=scale.xrange[0]+t*(scale.xrange[1]-scale.xrange[0])/4, x=scale.x(xv);
    const yv=scale.yrange[0]+t*(scale.yrange[1]-scale.yrange[0])/4, y=scale.y(yv);
    if (t>0 && t<4) { ctx.beginPath(); ctx.moveTo(x,margin.top); ctx.lineTo(x,h-margin.bottom); ctx.moveTo(margin.left,y); ctx.lineTo(w-margin.right,y); ctx.stroke(); }
    ctx.fillText(type==='map'?xv.toFixed(2):xv.toFixed(1), x-13, h-margin.bottom+14);
    ctx.fillText(type==='map'?yv.toFixed(2):yv.toFixed(1), margin.left-34, y+3);
  }
  ctx.strokeStyle='#cad7d3'; ctx.lineWidth=1; ctx.beginPath();
  ctx.moveTo(margin.left,margin.top); ctx.lineTo(margin.left,h-margin.bottom); ctx.lineTo(w-margin.right,h-margin.bottom); ctx.stroke();
  ctx.fillStyle='#4b6462'; ctx.font='11px Arial';
  ctx.fillText(type==='map'?'Longitude':'PC1 · service volume / routes', w/2-75, h-7);
  ctx.save(); ctx.translate(10,h/2+35); ctx.rotate(-Math.PI/2);
  ctx.fillText(type==='map'?'Latitude':'PC2 · time of day',0,0); ctx.restore();
  ctx.fillStyle = type==='map' ? '#82aba4' : '#9ea9a6';
  for (let i=0; i<rows.length; i++) {
    if (selected && selected.has(i)) continue;
    const row=rows[i]; ctx.fillRect(scale.x(row[xkey]), scale.y(row[ykey]), 2.2, 2.2);
  }
  if (selected) { ctx.fillStyle='#102f35'; for (const i of selected) {
    const row=rows[i]; ctx.beginPath(); ctx.arc(scale.x(row[xkey]), scale.y(row[ykey]), 2.8, 0, Math.PI*2); ctx.fill();
  }}
}
function pick(type,x,y) {
  const sc=scales[type], [xkey,ykey]=keys(type); let best=-1, d=81;
  for (let i=0; i<rows.length; i++) { const dx=sc.x(rows[i][xkey])-x, dy=sc.y(rows[i][ykey])-y, v=dx*dx+dy*dy; if (v<d) { d=v; best=i; } }
  return best;
}
function inRectangle(type,rect) {
  const sc=scales[type], [xkey,ykey]=keys(type), hits=new Set();
  rows.forEach((r,i) => { const x=sc.x(r[xkey]), y=sc.y(r[ykey]); if (x>=rect.x0&&x<=rect.x1&&y>=rect.y0&&y<=rect.y1) hits.add(i); });
  return hits;
}
function bindScatter(type) {
  const canvas=$(type), brush=$(type+'-brush'), tip=$(type+'-tip'); let start=null;
  const point = e => { const r=canvas.getBoundingClientRect(); return {x:e.clientX-r.left, y:e.clientY-r.top}; };
  canvas.addEventListener('pointerdown', e => { start=point(e); tip.style.display='none'; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    const p=point(e);
    if (!start) {
      const i=pick(type,p.x,p.y); if (i<0) { tip.style.display='none'; return; }
      const r=rows[i]; tip.textContent=`${r.name} (${r.id}) · ${fmt(r.d)} scheduled departures · ${fmt(r.r)} routes`;
      tip.style.left=`${Math.min(p.x+12,canvas.clientWidth-220)}px`; tip.style.top=`${Math.max(8,Math.min(p.y+12,canvas.clientHeight-56))}px`; tip.style.display='block'; return;
    }
    const x=Math.min(p.x,start.x), y=Math.min(p.y,start.y);
    brush.style.cssText=`display:block;left:${x}px;top:${y}px;width:${Math.abs(p.x-start.x)}px;height:${Math.abs(p.y-start.y)}px`;
  });
  canvas.addEventListener('pointerup', e => {
    if (!start) return; const end=point(e); brush.style.display='none';
    const x0=Math.min(start.x,end.x), x1=Math.max(start.x,end.x), y0=Math.min(start.y,end.y), y1=Math.max(start.y,end.y);
    const set = x1-x0<5 && y1-y0<5 ? new Set([pick(type,end.x,end.y)].filter(i=>i>=0)) : inRectangle(type,{x0,x1,y0,y1});
    start=null;
    setSelection(set, type==='map' ? 'map' : 'pca', type==='map' ? 'a map rectangle or stop' : 'a PCA rectangle or stop');
  });
  canvas.addEventListener('pointercancel', () => { start=null; brush.style.display='none'; });
  canvas.addEventListener('pointerleave', () => { tip.style.display='none'; });
}

/* ---------- views 03–06: grouped bar charts (SVG), brushable along x ---------- */
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs={}, parent) => { const n=document.createElementNS(NS,tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.append(n); return n; };
const barGeom = {};
function renderBars(view, allShare, selShare, tips) {
  const holder=$(view+'-chart'); holder.replaceChildren();
  const W=holder.clientWidth || 600, H=250, ml=46, mr=10, mt=14, mb=34, n=allShare.length;
  const bw=(W-ml-mr)/n, max=Math.min(1, Math.max(...allShare, ...selShare, 0.01)*1.08);
  barGeom[view] = {ml, bw, n};
  const svg=el('svg', {width:W, height:H, viewBox:`0 0 ${W} ${H}`, role:'img', 'aria-label':`Bar chart of ${BINS[view].title}`}, holder);
  const y = v => H-mb-(v/max)*(H-mt-mb);
  for (let t=0; t<=2; t++) {
    const v=max*t/2, yy=y(v);
    el('line', {x1:ml, x2:W-mr, y1:yy, y2:yy, class:'grid'}, svg);
    const tx=el('text', {x:ml-6, y:yy+3, class:'tick', 'text-anchor':'end'}, svg); tx.textContent=`${Math.round(100*v)}%`;
  }
  const range = brushed[view];
  if (range) el('rect', {x:ml+range[0]*bw, y:mt-6, width:(range[1]-range[0]+1)*bw, height:H-mt-mb+6, class:'bin-brushed'}, svg);
  for (let i=0; i<n; i++) {
    const x=ml+i*bw, gap=Math.max(1, bw*.12), half=(bw-2*gap)/2;
    const a=el('rect', {x:x+gap, y:y(allShare[i]), width:Math.max(half,1), height:H-mb-y(allShare[i]), class:'bar-all'}, svg);
    const s=el('rect', {x:x+gap+half, y:y(selShare[i]), width:Math.max(half,1), height:H-mb-y(selShare[i]), class:'bar-sel'}, svg);
    const hit=el('rect', {x, y:mt, width:bw, height:H-mt-mb, class:'bar-hit'}, svg);
    for (const node of [a,s,hit]) { const t=el('title', {}, node); t.textContent=tips[i]; }
    const lbl = BINS[view].labels[i];
    if (n<=12 || i%3===0) { const tx=el('text', {x:x+bw/2, y:H-mb+16, class:'tick', 'text-anchor':'middle'}, svg); tx.textContent=lbl; }
  }
  el('line', {x1:ml, x2:W-mr, y1:H-mb, y2:H-mb, class:'axis'}, svg);
  el('rect', {x:0, y:0, width:0, height:H-mb, class:'bin-brush', id:view+'-binbrush'}, svg);
}
function binFromX(view, x) { const g=barGeom[view]; return Math.max(0, Math.min(g.n-1, Math.floor((x-g.ml)/g.bw))); }
function bindBars(view, describe) {
  const holder=$(view+'-chart'); let start=null;
  const xOf = e => e.clientX-holder.getBoundingClientRect().left;
  holder.addEventListener('pointerdown', e => { start=binFromX(view, xOf(e)); holder.setPointerCapture(e.pointerId); });
  holder.addEventListener('pointermove', e => {
    if (start===null) return; const b=binFromX(view, xOf(e)), g=barGeom[view], lo=Math.min(start,b), hi=Math.max(start,b);
    const r=$(view+'-binbrush'); if (r) { r.setAttribute('x', g.ml+lo*g.bw); r.setAttribute('width', (hi-lo+1)*g.bw); }
  });
  holder.addEventListener('pointerup', e => {
    if (start===null) return; const b=binFromX(view, xOf(e)), lo=Math.min(start,b), hi=Math.max(start,b); start=null;
    const key=BINS[view].key, set=new Set();
    rows.forEach((r,i) => { const k=key(r); if (k>=lo && k<=hi) set.add(i); });
    const labels=BINS[view].labels, span = lo===hi ? labels[lo] : `${labels[lo]} to ${labels[hi]}`;
    setSelection(set, view, describe(span), [lo,hi]);
  });
  holder.addEventListener('pointercancel', () => { start=null; });
}
// Share of a group's STOPS falling in each bin (so a small selection and all stops are comparable).
function shares(view, group) {
  const out=Array(BINS[view].labels.length).fill(0);
  for (const r of group) out[BINS[view].key(r)]++;
  return group.length ? out.map(v=>v/group.length) : out;
}
function hourShares(group) {
  const out=Array(24).fill(0); let total=0;
  for (const r of group) r.h.forEach((v,h) => { out[h]+=v; total+=v; });
  return total ? out.map(v=>v/total) : out;
}
let allCache = null;
function renderAllBars(chosen) {
  if (!allCache) allCache = {hours: hourShares(rows), departures: shares('departures', rows), routes: shares('routes', rows), distance: shares('distance', rows)};
  // Hours: bars are the share of DEPARTURES per clock hour; brushing selects stops by their busiest hour.
  const selH = hourShares(chosen);
  renderBars('hours', allCache.hours, selH, allCache.hours.map((v,h) =>
    `${BINS.hours.labels[h]}:00 · all stops ${pct(v)} of departures · selection ${chosen.length?pct(selH[h]):'—'} · drag to select stops whose busiest hour is here`));
  for (const view of ['departures','routes','distance']) {
    const sel = shares(view, chosen), counts = Array(sel.length).fill(0), countsAll = Array(sel.length).fill(0);
    for (const r of chosen) counts[BINS[view].key(r)]++;
    for (const r of rows) countsAll[BINS[view].key(r)]++;
    renderBars(view, allCache[view], sel, allCache[view].map((v,i) =>
      `${BINS[view].labels[i]} · all: ${fmt(countsAll[i])} stops (${pct(v)}) · selection: ${chosen.length?`${fmt(counts[i])} stops (${pct(sel[i])})`:'—'}`));
  }
}

/* ---------- view 07: ranked busiest stops, within the current selection ---------- */
function renderTopStops(chosenIdx) {
  const holder=$('top-stops'); holder.replaceChildren();
  const pool = chosenIdx.length ? chosenIdx : rows.map((_,i)=>i);
  const top = [...pool].sort((a,b)=>rows[b].d-rows[a].d).slice(0,12), max = top.length ? rows[top[0]].d : 1;
  $('top-title').textContent = chosenIdx.length ? `Busiest stops in the selection (${fmt(chosenIdx.length)})` : 'Busiest stops citywide';
  for (const i of top) {
    const row=rows[i], button=document.createElement('button'); button.className='district'; button.dataset.id=row.id;
    button.classList.toggle('active', !!selected && selected.size===1 && selected.has(i));
    const name=document.createElement('span'); name.className='name'; name.textContent=row.name; name.title=`${row.name} (${row.id})`;
    const bar=document.createElement('span'); bar.className='bar'; bar.style.width=`${100*row.d/max}%`;
    const value=document.createElement('span'); value.className='value'; value.textContent=fmt(row.d);
    button.append(name,bar,value);
    button.onclick=()=>setSelection(new Set([i]), 'top', `the ranked list (${row.name})`);
    holder.append(button);
  }
}

/* ---------- shared selection and the triggered computation ---------- */
const VIEW_NAMES = {map:'View 01 map', pca:'View 02 PCA', hours:'View 03 hourly profile', departures:'View 04 departures histogram',
  routes:'View 05 routes histogram', distance:'View 06 distance bands', top:'View 07 ranked stops'};
function setSelection(set, view, description, range) {
  for (const k in brushed) delete brushed[k];
  if (range) brushed[view] = range;
  selected = set && set.size ? set : null;
  source = selected ? `${VIEW_NAMES[view]}: ${description}` : null;
  analyze();
}
function analyze() {
  const chosenIdx = selected ? [...selected] : [];
  const chosen = chosenIdx.map(i=>rows[i]);
  const rest = selected ? rows.filter((_,i)=>!selected.has(i)) : [];
  const value=median(chosen.map(r=>r.d)), base=median(rest.map(r=>r.d));
  $('count').textContent = selected ? fmt(chosen.length) : '—';
  $('departures').textContent = fmt(value); $('baseline').textContent = fmt(base);
  $('delta').textContent = Number.isFinite(value)&&Number.isFinite(base) ? `${value-base>=0?'+':'−'}${fmt(Math.abs(value-base))}` : '—';
  $('status').textContent = selected
    ? `${fmt(chosen.length)} of ${fmt(rows.length)} scheduled stops selected via ${source}. All seven views and the comparison were recomputed.${chosen.length===1?' '+chosen[0].name+' ('+chosen[0].id+').':''}`
    : `${fmt(rows.length)} scheduled stops. Brush or click any of the seven views to select stops.`;
  const deps = chosen.reduce((n,r)=>n+r.d,0);
  $('mix').textContent = chosen.length
    ? `Selected group: ${fmt(median(chosen.map(r=>r.r)))} median routes / stop · ${fmt(deps)} scheduled departures · ${(100*chosen.reduce((n,r)=>n+r.rail,0)/deps).toFixed(1)}% rail-mode departures · median ${median(chosen.map(r=>r.km)).toFixed(1)} km from Termini.`
    : '';
  draw('map'); draw('pca'); renderAllBars(chosen); renderTopStops(chosenIdx);
}

fetch('data/rome_transport.json').then(response => { if (!response.ok) throw Error('Data file unavailable'); return response.json(); }).then(data => {
  rows = data.rows; derive();
  $('variance').textContent = `${Math.round(100*(data.variance[0]+data.variance[1]))}%`;
  $('pca-note').textContent = `PC1 explains ${Math.round(100*data.variance[0])}%, PC2 ${Math.round(100*data.variance[1])}% of feature variance. Each dot is one stop.`;
  bindScatter('map'); bindScatter('pca');
  bindBars('hours', s => `stops whose busiest hour is ${s}`);
  bindBars('departures', s => `stops with ${s} scheduled departures`);
  bindBars('routes', s => `stops served by ${s} routes`);
  bindBars('distance', s => `stops ${s} from Termini`);
  analyze();
  $('clear').onclick = () => setSelection(null);
  let t; window.addEventListener('resize', () => { clearTimeout(t); t=setTimeout(analyze, 120); });
}).catch(error => { $('status').textContent = 'Could not load the timetable: '+error.message; });
