(function (root) {
  "use strict";
  const MAX = 5999 * 60000;
  const create = (i) => ({
    name: `Reloj ${i + 1}`,
    type: "timer",
    totalMs: 300000,
    remainingMs: 300000,
    elapsedMs: 0,
    endTime: null,
    startTime: null,
    running: false,
    add: [1, 3, 5],
    sound: "short",
    group: "none",
    finishedAt: null,
  });
  function tick(c, now) {
    if (!c.running) return false;
    if (c.type === "stopwatch") {
      c.elapsedMs = Math.max(0, now - c.startTime);
      return false;
    }
    c.remainingMs = Math.max(0, c.endTime - now);
    if (c.remainingMs === 0) {
      c.running = false;
      c.finishedAt = c.endTime;
      return true;
    }
    return false;
  }
  function reset(c) {
    c.running = false;
    c.remainingMs = c.totalMs;
    c.elapsedMs = 0;
    c.endTime = null;
    c.startTime = null;
    c.finishedAt = null;
  }
  function toggle(c, now) {
    if (c.running) {
      tick(c, now);
      c.running = false;
      return;
    }
    if (c.type === "timer") {
      if (c.remainingMs <= 0) c.remainingMs = c.totalMs;
      c.endTime = now + c.remainingMs;
    } else c.startTime = now - c.elapsedMs;
    c.finishedAt = null;
    c.running = true;
  }
  function add(c, min, now) {
    tick(c, now);
    const extra = min * 60000;
    if (c.totalMs + extra > MAX) return false;
    c.totalMs += extra;
    c.remainingMs += extra;
    if (c.running) c.endTime += extra;
    c.finishedAt = null;
    return true;
  }
  // One timestamp keeps handoffs exact, including between different clock types.
  function pauseGroup(clocks, active, now) {
    if (active.group === "none") return;
    clocks.forEach((other) => {
      if (other !== active && other.group === active.group && other.running) {
        tick(other, now);
        other.running = false;
      }
    });
  }
  function toggleGrouped(clocks, index, now) {
    const active = clocks[index];
    if (!active.running) pauseGroup(clocks, active, now);
    toggle(active, now);
  }
  function configure(c, data) {
    const restart = c.type !== data.type || c.totalMs !== data.totalMs;
    Object.assign(c, data);
    if (restart) reset(c);
  }
  function restore(value) {
    if (!Array.isArray(value) || value.length !== 6)
      throw Error("Formato inválido");
    return value.map((v, i) => {
      if (
        !v ||
        !["timer", "stopwatch"].includes(v.type) ||
        !Number.isFinite(v.totalMs) ||
        v.totalMs < 60000 ||
        v.totalMs > MAX ||
        !Number.isFinite(v.remainingMs) ||
        v.remainingMs < 0 ||
        v.remainingMs > MAX ||
        !Number.isFinite(v.elapsedMs) ||
        v.elapsedMs < 0 ||
        !Array.isArray(v.add) ||
        v.add.length < 1 ||
        v.add.length > 3 ||
        !v.add.every((n) => Number.isInteger(n) && n > 0 && n <= 5999)
      )
        throw Error("Reloj inválido");
      const c = {
        ...create(i),
        ...v,
        name:
          typeof v.name === "string" && v.name.trim()
            ? v.name.slice(0, 40)
            : `Reloj ${i + 1}`,
        sound:
          v.sound === false
            ? "off"
            : v.sound === true
              ? "short"
              : ["off", "short", "long"].includes(v.sound)
                ? v.sound
                : "short",
        running: v.running === true,
        group: ["blue", "purple", "green", "orange", "pink", "teal"].includes(v.group) ? v.group : "none",
      };
      c.totalMs = Math.max(c.totalMs, c.remainingMs);
      if (
        c.running &&
        !Number.isFinite(c.type === "timer" ? c.endTime : c.startTime)
      )
        c.running = false;
      return c;
    });
  }
  function format(ms, timer = false) {
    const s = Math.max(0, timer ? Math.ceil(ms / 1000) : Math.floor(ms / 1000));
    return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
      .map((n) => String(n).padStart(2, "0"))
      .join(":");
  }
  const api = {
    create,
    tick,
    reset,
    toggle,
    toggleGrouped,
    pauseGroup,
    add,
    configure,
    restore,
    format,
    MAX,
  };
  if (typeof module !== "undefined") module.exports = api;
  else root.ClockCore = api;
})(globalThis);
