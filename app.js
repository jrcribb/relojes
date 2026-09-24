"use strict";
const $ = (id) => document.getElementById(id),
  core = ClockCore,
  KEY = "multiClocksV141";
const groupNames = {none: "Sin grupo", blue: "Azul", purple: "Violeta", green: "Verde", orange: "Naranja", pink: "Rosa", teal: "Turquesa"};
let clocks,
  currentIndex = 0,
  audio,
  noticeTimer;
function notify(message) {
  $("notice").textContent = message;
  $("notice").hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => ($("notice").hidden = true), 6000);
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(clocks));
  } catch {
    notify(
      "No se pudo guardar. Los relojes funcionan mientras esta página esté abierta.",
    );
  }
}
function theme(dark) {
  document.body.classList.toggle("dark", dark);
  $("theme").textContent = dark ? "Tema claro" : "Tema oscuro";
  $("theme").setAttribute("aria-pressed", String(dark));
}
try {
  theme(
    (localStorage.getItem("theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")) === "dark",
  );
  const saved = localStorage.getItem(KEY);
  clocks = saved
    ? core.restore(JSON.parse(saved))
    : Array.from({ length: 6 }, (_, i) => core.create(i));
} catch {
  clocks = Array.from({ length: 6 }, (_, i) => core.create(i));
  notify(
    "No se pudieron recuperar los datos. Se cargaron seis relojes nuevos.",
  );
}
$("theme").addEventListener("click", () => {
  theme(!document.body.classList.contains("dark"));
  try {
    localStorage.setItem(
      "theme",
      document.body.classList.contains("dark") ? "dark" : "light",
    );
  } catch {
    notify("No se pudo guardar el tema.");
  }
});
async function unlockAudio() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") await audio.resume();
    return audio.state === "running";
  } catch {
    return false;
  }
}
async function beep(mode) {
  if (mode === "off") return;
  if (!(await unlockAudio())) {
    notify(
      "El sonido no está disponible. Probá la alarma desde la configuración.",
    );
    return;
  }
  for (let i = 0; i < (mode === "long" ? 3 : 1); i++) {
    const start = audio.currentTime + 0.02 + i * 0.34,
      osc = audio.createOscillator(),
      gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.015);
    gain.gain.setValueAtTime(0.18, start + 0.14);
    gain.gain.linearRampToValueAtTime(0, start + 0.19);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(start);
    osc.stop(start + 0.2);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
}
const views = clocks.map((c, i) => {
  const card = document.createElement("section");
  card.className = "clock";
  card.innerHTML =
    '<button class="name"></button><span class="state" role="status"></span><div class="dial"><svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="45"/><circle class="progress" cx="50" cy="50" r="45" pathLength="100" stroke-dasharray="100"/></svg><div class="readout"><time class="time"></time><span class="percent"></span></div></div><div class="increments"></div><div class="controls"><button class="primary play"></button><button class="reset">Reiniciar</button></div>';
  $("grid").append(card);
  const view = {
    card,
    name: card.querySelector(".name"),
    state: card.querySelector(".state"),
    time: card.querySelector(".time"),
    percent: card.querySelector(".percent"),
    progress: card.querySelector(".progress"),
    play: card.querySelector(".play"),
    increments: card.querySelector(".increments"),
  };
  view.name.addEventListener("click", () => openConfig(i));
  view.play.addEventListener("click", () => {
    if (c.sound !== "off") void unlockAudio();
    core.toggleGrouped(clocks, i, Date.now());
    save();
    clocks.forEach((_, index) => update(index));
  });
  card.querySelector(".reset").addEventListener("click", () => {
    core.reset(c);
    save();
    update(i);
  });
  return view;
});
function setText(node, text) {
  if (node.textContent !== text) node.textContent = text;
}
function update(i) {
  const c = clocks[i],
    v = views[i];
  v.card.className = `clock ${c.type} ${c.running ? "running" : c.finishedAt !== null ? "finished" : ""}`;
  v.card.dataset.group = c.group;
  setText(v.name, c.name);
  v.name.title = `Configurar ${c.name}`;
  v.name.setAttribute("aria-label", `Configurar ${c.name}`);
  v.card
    .querySelector(".reset")
    .setAttribute("aria-label", `Reiniciar ${c.name}`);
  setText(
    v.state,
    (c.group !== "none" ? groupNames[c.group] + " · " : "") + (c.finishedAt !== null
      ? "Finalizado"
      : c.running
        ? "En marcha"
        : c.group !== "none" ? "En pausa" : c.type === "timer"
          ? "Temporizador · En pausa"
          : "Cronómetro · En pausa"),
  );
  setText(
    v.time,
    core.format(
      c.type === "timer" ? c.remainingMs : c.elapsedMs,
      c.type === "timer",
    ),
  );
  setText(
    v.play,
    c.running ? "Pausar" : c.finishedAt !== null ? "Repetir" : "Iniciar",
  );
  v.play.setAttribute("aria-label", `${v.play.textContent} ${c.name}`);
  const pct = Math.max(0, Math.min(100, (c.remainingMs / c.totalMs) * 100));
  setText(
    v.percent,
    c.type === "timer" ? `${Math.ceil(pct)} % restante` : "Cronómetro",
  );
  v.progress.style.strokeDashoffset = String(100 - pct);
  const signature = c.add.join(",");
  if (v.increments.dataset.values !== signature) {
    v.increments.dataset.values = signature;
    v.increments.replaceChildren(
      ...c.add.map((min) => {
        const b = document.createElement("button");
        b.textContent = `+${min}m`;
        b.setAttribute("aria-label", `Agregar ${min} minutos`);
        b.addEventListener("click", () => {
          if (!core.add(c, min, Date.now()))
            notify("La duración máxima es de 5999 minutos.");
          save();
          update(i);
        });
        return b;
      }),
    );
  }
}
function openConfig(i) {
  currentIndex = i;
  const c = clocks[i];
  $("cfgName").value = c.name;
  $("cfgType").value = c.type;
  $("cfgGroup").value = c.group;
  $("cfgMinutes").value = c.totalMs / 60000;
  $("cfgAdd").value = c.add.join(", ");
  $("cfgSound").value = c.sound;
  $("error").textContent = "";
  typeFields();
  $("config").showModal();
  $("cfgName").focus();
}
function typeFields() {
  document
    .querySelectorAll(".timer-field")
    .forEach((el) => (el.hidden = $("cfgType").value === "stopwatch"));
}
$("cfgType").addEventListener("change", typeFields);
for (const id of ["close", "cancel"])
  $(id).addEventListener("click", () => $("config").close());
$("testSound").addEventListener("click", () => {
  if ($("cfgSound").value === "off") {
    $("error").textContent = "Elegí una alarma para probar el sonido.";
    return;
  }
  $("error").textContent = "";
  void beep($("cfgSound").value);
});
$("configForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const c = clocks[currentIndex],
    name = $("cfgName").value.trim(),
    type = $("cfgType").value,
    minutes = Number($("cfgMinutes").value),
    add = $("cfgAdd")
      .value.split(",")
      .map((x) => Number(x.trim()));
  let error = "";
  if (!name) error = "Escribí un nombre para el reloj.";
  else if (
    type === "timer" &&
    (!Number.isInteger(minutes) || minutes < 1 || minutes > 5999)
  )
    error = "Ingresá entre 1 y 5999 minutos enteros.";
  else if (
    type === "timer" &&
    (add.length < 1 ||
      add.length > 3 ||
      !add.every((n) => Number.isInteger(n) && n > 0 && n <= 5999))
  )
    error = "Ingresá de 1 a 3 incrementos enteros entre 1 y 5999.";
  if (error) {
    $("error").textContent = error;
    return;
  }
  core.configure(c, {
    name,
    type,
    group: $("cfgGroup").value,
    totalMs: type === "timer" ? minutes * 60000 : c.totalMs,
    add: type === "timer" ? add : c.add,
    sound: $("cfgSound").value,
  });
  if (c.running) core.pauseGroup(clocks, c, Date.now());
  save();
  clocks.forEach((_, index) => update(index));
  $("config").close();
});
function refresh() {
  const now = Date.now();
  let changed = false;
  clocks.forEach((c, i) => {
    if (!c.running) return;
    if (core.tick(c, now)) {
      changed = true;
      void beep(c.sound);
    }
    update(i);
  });
  if (changed) save();
  setText(
    $("date"),
    new Date(now).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }),
  );
}
clocks.forEach((_, i) => update(i));
refresh();
setInterval(refresh, 200);
document.addEventListener("visibilitychange", () => {
  refresh();
  if (document.hidden) save();
});
window.addEventListener("pagehide", save);
