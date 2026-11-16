const $ = id => document.getElementById(id);
let rows = [], selected = null, scales = {};
const margin = {left: 50, right: 18, top: 18, bottom: 38};
const fmt = n => Number.isFinite(n) ? Math.round(n).toLocaleString('en-GB') : '—';
const median = values => {
  if (!values.length) return NaN;
  values.sort((a,b) => a-b);
  const m = Math.floor(values.length / 2);
  return values.length % 2 ? values[m] : (values[m-1]+values[m])/2;
};
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
  return {ctx,w:rect.width,h:rect.height};
}
function makeScale(w,h,xrange,yrange) {
  return {x:v=>margin.left+(v-xrange[0])/(xrange[1]-xrange[0])*(w-margin.left-margin.right),
    y:v=>h-margin.bottom-(v-yrange[0])/(yrange[1]-yrange[0])*(h-margin.top-margin.bottom),xrange,yrange};
}
function draw(type) {
  const {ctx,w,h} = canvasSize($(type));
  const xkey = type==='map'?'lon':'pc1', ykey = type==='map'?'lat':'pc2';
  const scale = makeScale(w,h,extent(xkey),extent(ykey)); scales[type]=scale;
  ctx.clearRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
  ctx.font='10px Arial';ctx.fillStyle='#607471';ctx.strokeStyle='#edf0ef';ctx.lineWidth=.7;
  for(let t=0;t<=4;t++){
    const xv=scale.xrange[0]+t*(scale.xrange[1]-scale.xrange[0])/4,x=scale.x(xv);
    const yv=scale.yrange[0]+t*(scale.yrange[1]-scale.yrange[0])/4,y=scale.y(yv);
    if(t>0&&t<4){ctx.beginPath();ctx.moveTo(x,margin.top);ctx.lineTo(x,h-margin.bottom);ctx.moveTo(margin.left,y);ctx.lineTo(w-margin.right,y);ctx.stroke();}
    ctx.fillText(type==='map'?xv.toFixed(2):xv.toFixed(1),x-13,h-margin.bottom+14);
    ctx.fillText(type==='map'?yv.toFixed(2):yv.toFixed(1),margin.left-34,y+3);
  }
  ctx.strokeStyle='#cad7d3'; ctx.lineWidth=1; ctx.beginPath();
  ctx.moveTo(margin.left,margin.top);ctx.lineTo(margin.left,h-margin.bottom);
  ctx.lineTo(w-margin.right,h-margin.bottom);ctx.stroke();
  ctx.fillStyle='#4b6462';ctx.font='11px Arial';
  ctx.fillText(type==='map'?'Longitude':'PC1 · service volume / routes',w/2-75,h-7);
  ctx.save();ctx.translate(10,h/2+35);ctx.rotate(-Math.PI/2);
  ctx.fillText(type==='map'?'Latitude':'PC2 · time of day',0,0);ctx.restore();
  ctx.fillStyle=type==='map'?'#82aba4':'#9ea9a6';
  for (let i=0;i<rows.length;i++) {
    if (selected && selected.has(i)) continue;
    const row=rows[i];ctx.fillRect(scale.x(row[xkey]),scale.y(row[ykey]),2.2,2.2);
  }
  if (selected) {ctx.fillStyle='#102f35';for (const i of selected) {
    const row=rows[i];ctx.beginPath();ctx.arc(scale.x(row[xkey]),scale.y(row[ykey]),2.8,0,Math.PI*2);ctx.fill();
  }}
}
function renderHours(chosen) {
  const holder=$('hours');holder.replaceChildren();
  const totals=Array(24).fill(0);
  for (const row of chosen) row.h.forEach((v,h)=>totals[h]+=v);
  const sum=totals.reduce((a,b)=>a+b,0),max=Math.max(...totals,1);
  $('hour-scale').textContent=sum?`Share of selected departures per hour · vertical scale 0–${(100*max/sum).toFixed(1)}%`:'Select stops to show the share scale.';
  totals.forEach((v,h)=>{
    const column=document.createElement('div');column.className='hour-col';
    const bar=document.createElement('div');bar.className='hour-bar';
    bar.style.height=`${sum?100*v/max:0}%`;
    bar.title=`${String(h).padStart(2,'0')}:00 · ${fmt(v)} scheduled departures · ${sum?(100*v/sum).toFixed(1):'0.0'}%`;
    const label=document.createElement('span');label.textContent=h%3===0?String(h).padStart(2,'0'):'';
    column.append(bar,label);holder.append(column);
  });
}
function analyze() {
  const chosen=selected?[...selected].map(i=>rows[i]):[];
  const rest=selected?rows.filter((_,i)=>!selected.has(i)):[];
  const value=median(chosen.map(r=>r.d)), base=median(rest.map(r=>r.d));
  $('count').textContent=selected?fmt(chosen.length):'—';
  $('departures').textContent=fmt(value);$('baseline').textContent=fmt(base);
  $('delta').textContent=Number.isFinite(value)&&Number.isFinite(base)?`${value-base>=0?'+':'−'}${fmt(Math.abs(value-base))}`:'—';
  $('status').textContent=selected?`${fmt(chosen.length)} of ${fmt(rows.length)} scheduled stops selected. Comparison recomputed from this selection.${chosen.length===1?' '+chosen[0].name+' ('+chosen[0].id+').':''}`:`${fmt(rows.length)} scheduled stops. Brush either plot, click a point, or choose a top stop.`;
  $('mix').textContent=chosen.length?`Selected group: ${fmt(median(chosen.map(r=>r.r)))} median routes / stop · ${fmt(chosen.reduce((n,r)=>n+r.d,0))} scheduled departures · ${(100*chosen.reduce((n,r)=>n+r.rail,0)/chosen.reduce((n,r)=>n+r.d,0)).toFixed(1)}% rail-mode departures.`:'';
  document.querySelectorAll('.district').forEach(el=>el.classList.toggle('active',selected&&selected.size===1&&rows[[...selected][0]].id===el.dataset.id));
  renderHours(chosen);draw('map');draw('pca');
}
function pick(type,x,y) {
  const sc=scales[type],xkey=type==='map'?'lon':'pc1',ykey=type==='map'?'lat':'pc2';
  let best=-1,d=81;
  for(let i=0;i<rows.length;i++) {const dx=sc.x(rows[i][xkey])-x,dy=sc.y(rows[i][ykey])-y,v=dx*dx+dy*dy;if(v<d){d=v;best=i;}}
  return best;
}
function inRectangle(type,rect) {
  const sc=scales[type],xkey=type==='map'?'lon':'pc1',ykey=type==='map'?'lat':'pc2',hits=new Set();
  rows.forEach((r,i)=>{const x=sc.x(r[xkey]),y=sc.y(r[ykey]);if(x>=rect.x0&&x<=rect.x1&&y>=rect.y0&&y<=rect.y1)hits.add(i)});
  return hits;
}
function bind(type) {
  const canvas=$(type),brush=$(type+'-brush'),tip=$(type+'-tip');let start=null;
  const point=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};
  canvas.addEventListener('pointerdown',e=>{start=point(e);tip.style.display='none';canvas.setPointerCapture(e.pointerId)});
  canvas.addEventListener('pointermove',e=>{const p=point(e);if(!start){const i=pick(type,p.x,p.y);if(i<0){tip.style.display='none';return;}const r=rows[i];tip.textContent=`${r.name} (${r.id}) · ${fmt(r.d)} scheduled departures · ${fmt(r.r)} routes`;tip.style.left=`${Math.min(p.x+12,canvas.clientWidth-220)}px`;tip.style.top=`${Math.max(8,Math.min(p.y+12,canvas.clientHeight-56))}px`;tip.style.display='block';return;}const x=Math.min(p.x,start.x),y=Math.min(p.y,start.y);brush.style.cssText=`display:block;left:${x}px;top:${y}px;width:${Math.abs(p.x-start.x)}px;height:${Math.abs(p.y-start.y)}px`});
  canvas.addEventListener('pointerup',e=>{if(!start)return;const end=point(e);brush.style.display='none';const x0=Math.min(start.x,end.x),x1=Math.max(start.x,end.x),y0=Math.min(start.y,end.y),y1=Math.max(start.y,end.y);selected=x1-x0<5&&y1-y0<5?new Set([pick(type,end.x,end.y)].filter(i=>i>=0)):inRectangle(type,{x0,x1,y0,y1});start=null;analyze()});
  canvas.addEventListener('pointercancel',()=>{start=null;brush.style.display='none'});
  canvas.addEventListener('pointerleave',()=>{tip.style.display='none'});
}
function renderTopStops() {
  const holder=$('top-stops'),top=[...rows].sort((a,b)=>b.d-a.d).slice(0,12),max=top[0].d;
  for(const row of top) {const button=document.createElement('button');button.className='district';button.dataset.id=row.id;
    const name=document.createElement('span');name.className='name';name.textContent=row.name;name.title=row.name;
    const bar=document.createElement('span');bar.className='bar';bar.style.width=`${100*row.d/max}%`;
    const value=document.createElement('span');value.className='value';value.textContent=fmt(row.d);
    button.append(name,bar,value);button.onclick=()=>{selected=new Set([rows.indexOf(row)]);analyze()};holder.append(button);
  }
}
fetch('data/rome_transport.json').then(response=>{if(!response.ok)throw Error('Data file unavailable');return response.json()}).then(data=>{
  rows=data.rows;$('variance').textContent=`${Math.round(100*(data.variance[0]+data.variance[1]))}%`;
  $('pca-note').textContent=`PC1 explains ${Math.round(100*data.variance[0])}%, PC2 ${Math.round(100*data.variance[1])}% of feature variance. Each dot is one stop.`;
  bind('map');bind('pca');renderTopStops();analyze();
  $('clear').onclick=()=>{selected=null;analyze()};window.addEventListener('resize',()=>{draw('map');draw('pca')});
}).catch(error=>{$('status').textContent='Could not load the timetable: '+error.message});
