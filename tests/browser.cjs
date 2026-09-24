const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname, "../relojes.html")).href);
  for (const [width, height] of [
    [320, 568],
    [360, 640],
    [390, 844],
    [568, 320],
    [844, 390],
    [1280, 720],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width, height });
    await page.locator(".name").first().click();
    const result = await page.evaluate(() => {
      const clipped = [
        ...document.querySelectorAll(".controls,.increments,.readout"),
      ].filter((el) => {
        const r = el.getBoundingClientRect(),
          c = el.closest(".clock").getBoundingClientRect();
        return (
          r.bottom > c.bottom + 1 ||
          r.top < c.top ||
          r.right > c.right + 1 ||
          r.left < c.left - 1
        );
      });
      const d = document.querySelector("dialog").getBoundingClientRect(),
        f = document.querySelector("form").getBoundingClientRect();
      return {
        overflow:
          document.documentElement.scrollHeight > innerHeight ||
          document.documentElement.scrollWidth > innerWidth,
        clipped: clipped.length,
        dialogFits:
          f.bottom <= d.bottom && d.bottom <= innerHeight && d.top >= 0,
      };
    });
    console.log(width, height, result);
    assert.deepEqual(result, {overflow:false, clipped:0, dialogFits:true});
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "tests/mobile.png" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: "tests/desktop.png" });
  await page.locator('#theme').click();
  const dark = await page.locator('body').evaluate(el=>el.classList.contains('dark'));
  await page.reload();
  assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('dark')),dark);
  await page.locator('.name').first().click();
  await page.locator('#cfgMinutes').fill('0');
  await page.locator('button[type=submit]').click();
  assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);
  assert.match(await page.locator('#error').textContent(),/5999/);
  await page.locator('#cfgMinutes').fill('1');
  await page.locator('#cfgSound').selectOption('long');
  await page.locator('button[type=submit]').click();
  await page.locator('.play').first().click();
  await page.evaluate(()=>{clocks[0].endTime=Date.now()-1;refresh();});
  assert.equal(await page.locator('.state').first().textContent(),'Finalizado');
  assert.equal(await page.locator('.play').first().textContent(),'Repetir');
  await page.reload();
  assert.equal(await page.locator('.state').first().textContent(),'Finalizado');
  const tones=await page.evaluate(async()=>{
    const starts=[];
    audio={state:'running',currentTime:0,destination:{},createOscillator(){return {frequency:{},connect(){},start(t){starts.push(t)},stop(){},disconnect(){}}},createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){}},connect(){},disconnect(){}}}};
    await beep('short');const short=starts.length;starts.length=0;
    await beep('long');const long=starts.length;starts.length=0;
    await beep('off');return {short,long,off:starts.length};
  });
  assert.deepEqual(tones,{short:1,long:3,off:0});
  await page.addInitScript(()=>localStorage.setItem('multiClocksV141','invalid json'));
  await page.reload();
  assert.equal(await page.locator('.clock').count(),6);
  assert.match(await page.locator('#notice').textContent(),/recuperar/);
  assert.deepEqual(errors,[]);
  console.log('Guardado, validación, finalización, recuperación y secuencias de sonido: OK');
  console.log({ errors });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
