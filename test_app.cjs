const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const start=Date.now();
  await page.goto('http://localhost:8765/web/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('scheduled stops'));
  const loadMs=Date.now()-start;
  const payload=await page.evaluate(async()=>await (await fetch('data/rome_transport.json')).json());
  if(payload.rows.length!==8252)throw Error('Unexpected prepared stop count');
  const top=[...payload.rows].sort((a,b)=>b.d-a.d)[0];
  await page.locator('.district').first().click();
  if((await page.locator('#count').innerText())!=='1')throw Error('Top-stop selection failed');
  if((await page.locator('#departures').innerText())!==top.d.toLocaleString('en-GB'))throw Error('Top-stop departure value disagrees with source data');
  const selectedStatus=await page.locator('#status').innerText();
  if(!selectedStatus.includes(top.id))throw Error('Stop detail missing');
  await page.locator('#clear').click();
  if((await page.locator('#count').innerText())!=='—')throw Error('Clear failed');
  for(const type of ['map','pca']){
    const box=await page.locator('#'+type).boundingBox(),begin=Date.now();
    await page.mouse.move(box.x+box.width*.36,box.y+box.height*.35);await page.mouse.down();
    await page.mouse.move(box.x+box.width*.57,box.y+box.height*.67);await page.mouse.up();
    const value=await page.locator('#count').innerText();
    if(value==='—'||value==='0')throw Error(type+' brush failed');
    console.log(type+' brush '+value+' stops, '+(Date.now()-begin)+' ms including browser input');
  }
  if(errors.length)throw Error(errors.join('\n'));
  await page.locator('.views').first().screenshot({path:path.join(__dirname,'report/coordinated_views.png')});
  await page.screenshot({path:path.join(__dirname,'prototype.png'),fullPage:true});
  console.log(JSON.stringify({loadMs,stops:payload.rows.length,top:top.name,topDepartures:top.d,errors}));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
