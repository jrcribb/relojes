const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(pathToFileURL(path.resolve(__dirname,'../relojes.html')).href);
 async function configure(i,group){
  await page.locator('.name').nth(i).click();
  await page.locator('#cfgType').selectOption('stopwatch');
  await page.locator('#cfgGroup').selectOption(group);
  await page.locator('button[type=submit]').click();
 }
 await configure(0,'blue');await configure(1,'blue');await configure(2,'green');
 await page.locator('.play').nth(0).click();
 await page.evaluate(()=>{clocks[0].startTime=Date.now()-5000;refresh();});
 await page.locator('.play').nth(2).click();
 await page.locator('.play').nth(1).click();
 let state=await page.evaluate(()=>clocks.map(c=>({running:c.running,elapsed:c.elapsedMs,group:c.group})));
 assert.equal(state[0].running,false);assert.ok(state[0].elapsed>=5000);
 assert.equal(state[1].running,true);assert.equal(state[2].running,true);
 const elapsed=state[0].elapsed;
 await page.locator('.play').nth(0).click();
 state=await page.evaluate(()=>clocks.map(c=>({running:c.running,elapsed:c.elapsedMs})));
 assert.equal(state[0].running,true);assert.equal(state[1].running,false);assert.equal(state[2].running,true);assert.ok(state[0].elapsed>=elapsed);
 await page.reload();
 assert.equal(await page.locator('.clock').nth(0).getAttribute('data-group'),'blue');
 assert.equal(await page.locator('.clock').nth(1).getAttribute('data-group'),'blue');
 const colors=await page.locator('.clock').evaluateAll(els=>els.slice(0,3).map(el=>getComputedStyle(el).borderColor));
 assert.equal(colors[0],colors[1]);assert.notEqual(colors[0],colors[2]);
 assert.ok(await page.locator('header').evaluate(el=>el.getBoundingClientRect().top>=16));
 await page.screenshot({path:'tests/groups-mobile.png'});
 await page.locator('#theme').click();
 await page.screenshot({path:'tests/groups-mobile-dark.png'});
 for(const [width,height] of [[320,568],[390,844],[568,320],[844,390]]){
  await page.setViewportSize({width,height});await page.locator('.name').nth(3).click();
  await page.locator('#cfgMinutes').fill('0');await page.locator('button[type=submit]').click();
  assert.ok(await page.locator('dialog').evaluate(el=>{const r=el.getBoundingClientRect(), f=el.querySelector('form').getBoundingClientRect();return f.bottom<=r.bottom&&r.bottom<=innerHeight}));
  await page.keyboard.press('Escape');
 }
 console.log('Grupos en interfaz, alternancia, colores, persistencia, margen móvil y diálogo con errores: OK');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
