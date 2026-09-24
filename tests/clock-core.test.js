const { test } = require("node:test");
const assert = require("node:assert/strict");
const core = require("../clock-core.js");
test("pausa y reanudación conservan el tiempo", () => {
  const c = core.create(0);
  core.toggle(c, 1000);
  core.toggle(c, 11000);
  assert.equal(c.remainingMs, 290000);
  core.toggle(c, 21000);
  core.tick(c, 31000);
  assert.equal(c.remainingMs, 280000);
});
test("finalización se emite una sola vez y se puede repetir", () => {
  const c = core.create(0);
  core.toggle(c, 1000);
  assert.equal(core.tick(c, 301000), true);
  assert.equal(core.tick(c, 302000), false);
  assert.equal(c.running, false);
  assert.equal(c.remainingMs, 0);
  core.toggle(c, 303000);
  assert.equal(c.remainingMs, 300000);
  assert.equal(c.finishedAt, null);
});
test("editar duración o tipo restablece los tiempos", () => {
  const c = core.create(0);
  core.toggle(c, 1000);
  core.configure(c, { type: "timer", totalMs: 60000 });
  assert.equal(c.running, false);
  assert.equal(c.endTime, null);
  assert.equal(c.remainingMs, 60000);
  core.configure(c, { type: "stopwatch", totalMs: 60000 });
  core.toggle(c, 2000);
  core.tick(c, 6000);
  assert.equal(c.elapsedMs, 4000);
});
test("editar nombre no interrumpe el reloj", () => {
  const c = core.create(0);
  core.toggle(c, 1000);
  core.configure(c, { name: "Nuevo", type: c.type, totalMs: c.totalMs });
  assert.equal(c.running, true);
  assert.equal(c.endTime, 301000);
});
test("incrementos actualizan total y vencimiento", () => {
  const c = core.create(0);
  core.toggle(c, 1000);
  core.add(c, 3, 11000);
  assert.equal(c.totalMs, 480000);
  assert.equal(c.remainingMs, 470000);
  assert.equal(c.endTime, 481000);
  assert.ok(c.remainingMs / c.totalMs <= 1);
});
test("restauración migra sonidos y rechaza datos corruptos", () => {
  const data = Array.from({ length: 6 }, (_, i) => core.create(i));
  data[0].sound = true;
  data[1].sound = false;
  const restored = core.restore(data);
  assert.equal(restored[0].sound, "short");
  assert.equal(restored[1].sound, "off");
  assert.throws(() => core.restore({}));
  data[2].totalMs = 0;
  assert.throws(() => core.restore(data));
});
test("un reloj activo sobrevive la recarga sin perder precisión", () => {
  const data = Array.from({ length: 6 }, (_, i) => core.create(i));
  core.toggle(data[0], 1000);
  const c = core.restore(JSON.parse(JSON.stringify(data)))[0];
  core.tick(c, 121000);
  assert.equal(c.remainingMs, 180000);
});
test("cronómetro pausa y reanuda, cuenta regresiva redondea hacia arriba", () => {
  const c = core.create(0);
  c.type = "stopwatch";
  core.toggle(c, 1000);
  core.toggle(c, 4500);
  core.toggle(c, 10000);
  core.tick(c, 12000);
  assert.equal(c.elapsedMs, 5500);
  assert.equal(core.format(1, true), "00:00:01");
  assert.equal(core.format(-1, true), "00:00:00");
});
test('grupos: alternar cronómetros conserva tiempo y no afecta otros grupos',()=>{
 const clocks=Array.from({length:6},(_,i)=>core.create(i));
 clocks.forEach(c=>c.type='stopwatch');
 clocks[0].group=clocks[1].group='blue';clocks[2].group='green';
 core.toggleGrouped(clocks,0,1000);core.toggleGrouped(clocks,2,2000);
 core.toggleGrouped(clocks,1,6000);
 assert.equal(clocks[0].running,false);assert.equal(clocks[0].elapsedMs,5000);
 assert.equal(clocks[1].running,true);assert.equal(clocks[2].running,true);
 core.toggleGrouped(clocks,0,10000);
 assert.equal(clocks[1].elapsedMs,4000);assert.equal(clocks[1].running,false);
 core.tick(clocks[0],12000);assert.equal(clocks[0].elapsedMs,7000);
 core.toggleGrouped(clocks,0,13000);assert.equal(clocks[0].running,false);assert.equal(clocks[1].running,false);
});
test('grupos: temporizadores y relojes sin grupo',()=>{
 const clocks=Array.from({length:6},(_,i)=>core.create(i));
 clocks[0].group=clocks[1].group=clocks[2].group='purple';
 core.toggleGrouped(clocks,0,1000);core.toggleGrouped(clocks,1,11000);
 assert.equal(clocks[0].remainingMs,290000);assert.equal(clocks[0].running,false);
 core.toggleGrouped(clocks,2,21000);assert.equal(clocks[1].remainingMs,290000);
 core.toggleGrouped(clocks,3,22000);core.toggleGrouped(clocks,4,23000);
 assert.ok(clocks[2].running&&clocks[3].running&&clocks[4].running);
 const restored=core.restore(JSON.parse(JSON.stringify(clocks)));
 assert.equal(restored[0].group,'purple');assert.equal(restored[3].group,'none');
});
test('grupos: un reloj en marcha que cambia de grupo pausa sus nuevos compañeros',()=>{
 const clocks=Array.from({length:6},(_,i)=>core.create(i));
 clocks[0].group='green';core.toggleGrouped(clocks,0,1000);core.toggleGrouped(clocks,1,2000);
 core.configure(clocks[1],{type:'timer',totalMs:300000,group:'green'});
 core.pauseGroup(clocks,clocks[1],3000);
 assert.equal(clocks[0].remainingMs,298000);assert.equal(clocks[0].running,false);assert.equal(clocks[1].running,true);
});
