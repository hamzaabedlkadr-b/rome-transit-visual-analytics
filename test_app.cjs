// Browser check: every one of the seven views can set the shared selection,
// and every view then reflects it. Run with the local server on port 8765.
const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:process.env.PW_CHANNEL||undefined});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const start=Date.now();
  await page.goto(process.env.APP_URL||'http://localhost:8765/web/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('scheduled stops'));
  const loadMs=Date.now()-start;
  const payload=await page.evaluate(async()=>await (await fetch('data/rome_transport.json')).json());
  if(payload.rows.length!==8252)throw Error('Unexpected prepared stop count');
  const figuresLoaded=await page.locator('#research-figures img').evaluateAll(images=>images.length===2&&images.every(image=>image.complete&&image.naturalWidth>0));
  if(!figuresLoaded)throw Error('Analysis figures failed to load');

  // Snapshot of what every view shows, used to prove that each view reflects a selection made elsewhere.
  const snapshot=()=>page.evaluate(()=>{
    const px=id=>{const c=document.getElementById(id),x=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let dark=0;for(let i=0;i<x.length;i+=4)if(x[i]<40&&x[i+1]<60&&x[i+2]<70)dark++;return dark;};
    const bars=id=>[...document.querySelectorAll(`#${id}-chart .bar-sel`)].map(r=>Number(r.getAttribute('height')).toFixed(1)).join(',');
    return {map:px('map'),pca:px('pca'),hours:bars('hours'),departures:bars('departures'),routes:bars('routes'),distance:bars('distance'),
      top:document.querySelector('#top-title').textContent+'|'+[...document.querySelectorAll('#top-stops .district')].map(b=>b.dataset.id).join(','),count:document.querySelector('#count').innerText};
  });
  const views=['map','pca','hours','departures','routes','distance','top'];
  const results=[];
  for(const source of views){
    await page.locator('#clear').click();
    const before=await snapshot(),t0=Date.now();
    if(source==='map'||source==='pca'){
      await page.locator('#'+source).scrollIntoViewIfNeeded();const box=await page.locator('#'+source).boundingBox();
      await page.mouse.move(box.x+box.width*.36,box.y+box.height*.35);await page.mouse.down();
      await page.mouse.move(box.x+box.width*.57,box.y+box.height*.67,{steps:4});await page.mouse.up();
    }else if(source==='top'){
      await page.locator('.district').nth(3).click();
    }else{
      await page.locator('#'+source+'-chart').scrollIntoViewIfNeeded();const box=await page.locator('#'+source+'-chart').boundingBox(),f=source==='hours'?[.30,.45]:[.40,.62];
      await page.mouse.move(box.x+box.width*f[0],box.y+box.height*.5);await page.mouse.down();
      await page.mouse.move(box.x+box.width*f[1],box.y+box.height*.5,{steps:4});await page.mouse.up();
    }
    const after=await snapshot(),ms=Date.now()-t0;
    if(after.count==='—'||after.count==='0')throw Error(source+' did not set a selection');
    const status=await page.locator('#status').innerText();
    if(!status.includes('selected via'))throw Error(source+' selection not reported');
    // Every OTHER view must have changed (the ranked list only changes if the selection's top-12 differs from citywide).
    const changed=views.filter(v=>v!==source&&JSON.stringify(before[v])!==JSON.stringify(after[v]));
    const expected=views.filter(v=>v!==source&&!(v==='top'&&source==='top'));
    const missing=expected.filter(v=>!changed.includes(v)&&!(v==='top'&&after.top===before.top&&source!=='top'));
    if(missing.length)throw Error(`${source} selection was not reflected in: ${missing.join(', ')}`);
    results.push({source,stops:after.count,reflectedIn:changed.length,ms});
    console.log(`${source}: ${after.count} stops selected, reflected in ${changed.length} other views, ${ms} ms incl. input`);
  }
  // Exact-value check for a named stop from the ranked list.
  await page.locator('#clear').click();
  const top=[...payload.rows].sort((a,b)=>b.d-a.d)[0];
  await page.locator('.district').first().click();
  if((await page.locator('#count').innerText())!=='1')throw Error('Top-stop selection failed');
  if((await page.locator('#departures').innerText())!==top.d.toLocaleString('en-GB'))throw Error('Top-stop departure value disagrees with source data');
  await page.locator('#clear').click();
  if((await page.locator('#count').innerText())!=='—')throw Error('Clear failed');
  if(errors.length)throw Error(errors.join('\n'));
  if(!process.env.NO_SHOTS){
    // Figure for the paper: a distance-band selection shown across all views.
    await page.locator('#distance-chart').scrollIntoViewIfNeeded();const box=await page.locator('#distance-chart').boundingBox();
    await page.mouse.move(box.x+box.width*.15,box.y+box.height*.5);await page.mouse.down();
    await page.mouse.move(box.x+box.width*.16,box.y+box.height*.5);await page.mouse.up();
    await page.locator('#linked-views').screenshot({path:path.join(__dirname,'report/coordinated_views.png')});
    await page.locator('#detail-views').screenshot({path:path.join(__dirname,'report/coordinated_detail.png')});
    await page.screenshot({path:path.join(__dirname,'prototype.png'),fullPage:true});
  }
  console.log(JSON.stringify({loadMs,stops:payload.rows.length,top:top.name,topDepartures:top.d,results,errors}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
