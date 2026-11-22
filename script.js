/* =====================================================================
   LOST PHONE ENGINE: you shouldn't need to edit this file.
   The whole story lives in story.js.
   ===================================================================== */
"use strict";
const S = STORY;
const PH = document.getElementById("ph"),
  SCR = document.getElementById("scr");
const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
const p2 = (n) => String(n).padStart(2, "0");
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const strip = (s) =>
  String(s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

/* ------------------------------------------------------------ time */
function D(s) {
  if (s instanceof Date) return new Date(s);
  if (!s) return null;
  let m = /^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d?):(\d\d))?$/.exec(s);
  if (m) return new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  m = /^(\d\d?):(\d\d)$/.exec(s);
  if (m) {
    const d = new Date(START);
    d.setHours(+m[1], +m[2], 0, 0);
    return d;
  }
  return null;
}
const START = D(S.start);
let clock0 = 0;
const now = () =>
  new Date(
    START.getTime() + (clock0 ? (Date.now() - clock0) * (S.speed || 1) : 0)
  );
const WD = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MS = MO.map((m) => m.slice(0, 3));
const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const ddiff = (d) => Math.round((sod(now()) - sod(D(d))) / 864e5);
const hm = (d) => p2(D(d).getHours()) + ":" + p2(D(d).getMinutes());
const dmy = (d) =>
  p2(d.getDate()) + "/" + p2(d.getMonth() + 1) + "/" + d.getFullYear();
const stamp = (d) =>
  `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${hm(d)}`;
function fList(s) {
  const d = D(s),
    k = ddiff(d);
  return k <= 0
    ? hm(d)
    : k == 1
    ? "Yesterday"
    : k < 7
    ? WD[d.getDay()]
    : dmy(d);
}
function fDiv(s) {
  const d = D(s),
    k = ddiff(d);
  if (k <= 0) return `<b>Today</b> ${hm(d)}`;
  if (k == 1) return `<b>Yesterday</b> ${hm(d)}`;
  if (k < 7) return `<b>${WD[d.getDay()]}</b> ${hm(d)}`;
  return `<b>${WS[d.getDay()]} ${d.getDate()} ${MS[d.getMonth()]}${
    d.getFullYear() != now().getFullYear() ? " " + d.getFullYear() : ""
  }</b> at ${hm(d)}`;
}
const fDate = (s) => {
  const d = D(s);
  return `${d.getDate()} ${MO[d.getMonth()]} ${d.getFullYear()}`;
};
const fLong = (s) => `${fDate(s)} at ${hm(s)}`;
function fDay(s) {
  const k = ddiff(s);
  return k <= 0
    ? "Today"
    : k == 1
    ? "Yesterday"
    : k < 7
    ? WD[D(s).getDay()]
    : fDate(s);
}
function fAgo(s) {
  const m = Math.floor((now() - D(s)) / 6e4);
  if (m < 1) return "now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  return h < 24 ? h + "h ago" : fList(s);
}
const durS = (s) => {
  const [m, x] = String(s || "0:10").split(":");
  return +m * 60 + +x;
};
const durF = (n) => Math.floor(n / 60) + ":" + p2(Math.floor(n % 60));

/* ------------------------------------------------------------ state */
const seen = new Set(),
  fired = {},
  flags = {},
  ok = {};
let state = "boot"; // boot | lock | pass | home | off | end
let battery = S.battery ?? 20,
  lowPower = false,
  silent = false,
  vol = 0.8;
let sndOn = S.sound !== false,
  ambOn = S.ambience !== false;
let W = null,
  BACKL = null,
  finale = false,
  finT = 0,
  ended = false,
  pendingGo = null;
let lockList = (S.lockNotifs || []).map((n) => ({ ...n }));
let lowWarned = false;

/* ------------------------------------------------------------ people / threads */
const CT = (id) => (S.contacts || {})[id] || { name: id };
const nm = (id) => (id === "me" ? S.owner : CT(id).name || id);
const first = (id) => strip(nm(id)).split(/\s+/)[0];
function ini(id) {
  if (id === "me") return S.owner[0].toUpperCase();
  const n = strip(CT(id).full || CT(id).name || id)
    .replace(/[^\p{L}\s]/gu, "")
    .trim();
  const p = n.split(/\s+/).filter((w) => !/^(prof|dr|mr|ms)$/i.test(w));
  return ((p[0] || "?")[0] + (p[1] ? p[1][0] : "")).toUpperCase();
}
const TH = (id) => S.threads.find((t) => t.id === id);
const thName = (t) => t.name || nm(t.with[0]);
function lastTime(t) {
  for (let i = t.msgs.length - 1; i >= 0; i--)
    if (t.msgs[i][0] === "~") {
      const d = D(t.msgs[i][1]);
      if (d) return d;
    }
  return START;
}
function lastMsg(t) {
  for (let i = t.msgs.length - 1; i >= 0; i--)
    if (t.msgs[i][0] !== "~") return t.msgs[i];
}
const threadFor = (cid) =>
  S.threads.find((t) => t.with.length === 1 && t.with[0] === cid);

/* ------------------------------------------------------------ clues */
const CLUES = new Set();
(function () {
  const add = (p, a) => (a || []).forEach((o) => o.clue && CLUES.add(p + o.id));
  add("t:", S.threads);
  add("n:", S.notes);
  add("e:", S.mails);
  add("p:", S.photos);
  add("p:", S.hidden);
  add("p:", S.deleted);
  add("m:", S.memos);
  add("v:", S.voicemails);
  add("c:", S.calendar);
  add("s:", (S.safari || {}).tabs);
  (S.wallet || []).forEach((w) => w.clue && CLUES.add("w:" + w.id));
  (S.reminders || []).forEach((r) => r.clue && CLUES.add("r:" + r.text));
  if ((S.findmy || []).some((f) => f.clue)) CLUES.add("f:dei");
  if (S.deletedMsgs) CLUES.add("x:deleted");
  if (S.hiddenPassword) CLUES.add("x:hidden");
  CLUES.add("x:edit");
  if (S.safari && S.safari.account) CLUES.add("s:orders");
})();
const nClues = () => [...seen].filter((k) => CLUES.has(k)).length;
function see(k) {
  if (seen.has(k)) return;
  seen.add(k);
  prog();
  setTimeout(tick, 30);
}
function prog() {
  const e = $("#prog");
  if (e)
    e.textContent =
      S.showProgress === false ? "" : `discovered ${nClues()} / ${CLUES.size}`;
}

/* ===================================================================== AUDIO
      Everything is synthesised with the Web Audio API (original tones). */
const AU = { c: null };
function ac() {
  if (!AU.c) {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      const c = (AU.c = new C());
      AU.m = c.createGain();
      AU.m.gain.value = vol;
      const k = c.createDynamicsCompressor();
      k.threshold.value = -16;
      AU.m.connect(k);
      k.connect(c.destination);
      AU.r = c.createConvolver();
      AU.r.buffer = impulse(1.7, 2.6);
      const rg = c.createGain();
      rg.gain.value = 0.45;
      AU.r.connect(rg);
      rg.connect(AU.m);
      const n = c.sampleRate * 2,
        b = c.createBuffer(1, n, c.sampleRate),
        d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      AU.nb = b;
    } catch (e) {
      AU.c = null;
      return null;
    }
  }
  if (AU.c.state === "suspended") AU.c.resume();
  return AU.c;
}
function impulse(sec, dec) {
  const c = AU.c,
    n = Math.floor(c.sampleRate * sec),
    b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < n; i++)
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, dec);
  }
  return b;
}
function route(node, wet) {
  node.connect(AU.m);
  if (wet) {
    const g = AU.c.createGain();
    g.gain.value = wet;
    node.connect(g);
    g.connect(AU.r);
  }
}
function envl(g, t, a, d, peak) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function tone(f, t0, d, g, o = {}) {
  const c = AU.c;
  if (!c) return;
  const t = c.currentTime + t0,
    os = c.createOscillator(),
    v = c.createGain();
  os.type = o.type || "sine";
  os.frequency.setValueAtTime(f, t);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + (o.glide || d));
  envl(v, t, o.a || 0.004, d, g);
  let n = os;
  if (o.lp) {
    const fl = c.createBiquadFilter();
    fl.type = "lowpass";
    fl.frequency.value = o.lp;
    os.connect(fl);
    n = fl;
  }
  n.connect(v);
  route(v, o.wet || 0);
  os.start(t);
  os.stop(t + d + 0.1);
}
function fm(f, t0, d, g, ratio = 3.5, idx = 2, wet = 0.35) {
  const c = AU.c;
  if (!c) return;
  const t = c.currentTime + t0,
    car = c.createOscillator(),
    mod = c.createOscillator(),
    mg = c.createGain(),
    v = c.createGain();
  car.frequency.value = f;
  mod.frequency.value = f * ratio;
  mg.gain.setValueAtTime(f * idx, t);
  mg.gain.exponentialRampToValueAtTime(f * 0.02, t + d * 0.5);
  mod.connect(mg);
  mg.connect(car.frequency);
  envl(v, t, 0.003, d, g);
  car.connect(v);
  route(v, wet);
  car.start(t);
  mod.start(t);
  car.stop(t + d + 0.1);
  mod.stop(t + d + 0.1);
}
function nz(t0, d, g, o = {}) {
  const c = AU.c;
  if (!c) return;
  const t = c.currentTime + t0,
    s = c.createBufferSource();
  s.buffer = AU.nb;
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = o.type || "bandpass";
  f.frequency.setValueAtTime(o.f || 2000, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + d);
  f.Q.value = o.q || 1;
  const v = c.createGain();
  envl(v, t, o.a || 0.002, d, g);
  s.connect(f);
  f.connect(v);
  route(v, o.wet || 0);
  s.start(t, Math.random());
  s.stop(t + d + 0.1);
}
const mallet = (f, t, g = 0.2, d = 0.8) => {
  tone(f, t, d, g, { wet: 0.3 });
  tone(f * 3.99, t, d * 0.15, g * 0.3, { wet: 0.2 });
  tone(f * 10.4, t, 0.03, g * 0.07);
};
const vib = (p) => {
  try {
    navigator.vibrate && navigator.vibrate(p);
  } catch (e) {}
};
function buzz(t0 = 0, d = 0.38, g = 0.3) {
  tone(56, t0, d, g, { type: "square", lp: 170, a: 0.02 });
  tone(112, t0, d, g * 0.35, { type: "sawtooth", lp: 230, a: 0.02 });
}
function fileSnd(k) {
  const u = (S.sounds || {})[k];
  if (!u) return null;
  const a = new Audio(u);
  a.volume = vol;
  return a;
}
function sfx(k) {
  if (!sndOn || !ac()) return;
  if (silent && ["text", "notif"].includes(k)) {
    buzz();
    vib(300);
    return;
  }
  const f = fileSnd(k);
  if (f) {
    f.play().catch(() => {});
    return;
  }
  switch (k) {
    case "text":
      fm(1397, 0, 0.55, 0.13, 3, 1.3);
      fm(1865, 0.1, 0.6, 0.12, 3, 1.3);
      fm(2794, 0.2, 1.1, 0.1, 3, 1.1);
      vib([50, 40, 50]);
      break;
    case "notif":
      fm(1175, 0, 0.9, 0.15, 2, 1.3);
      fm(1568, 0.14, 1.2, 0.13, 2, 1.3);
      vib(80);
      break;
    case "recv":
      tone(480, 0, 0.1, 0.11, { f2: 990, glide: 0.06, wet: 0.15 });
      tone(1480, 0.035, 0.07, 0.04, { wet: 0.2 });
      break;
    case "send":
      nz(0, 0.24, 0.2, { f: 450, f2: 4500, q: 0.9, wet: 0.15 });
      break;
    case "key":
      tone(1050, 0, 0.035, 0.11, { type: "triangle" });
      nz(0, 0.014, 0.07, { f: 3800, q: 2 });
      break;
    case "kb":
      nz(0, 0.02, 0.22, { f: 2300, q: 1.4 });
      tone(170, 0, 0.02, 0.05);
      break;
    case "lock":
      nz(0, 0.012, 0.3, { type: "highpass", f: 2500 });
      tone(140, 0, 0.05, 0.16, { lp: 400 });
      nz(0.055, 0.01, 0.18, { type: "highpass", f: 3000 });
      break;
    case "fail":
      buzz(0, 0.12, 0.28);
      buzz(0.18, 0.12, 0.28);
      vib([80, 60, 80]);
      break;
    case "shutter":
      nz(0, 0.035, 0.45, { type: "lowpass", f: 5000 });
      nz(0.07, 0.05, 0.35, { type: "lowpass", f: 3500 });
      break;
    case "end":
      [0, 0.2, 0.4].forEach((t) => tone(425, t, 0.11, 0.1));
      break;
    case "connect":
      tone(900, 0, 0.05, 0.05);
      break;
    case "sit":
      tone(913.8, 0, 0.27, 0.12);
      tone(1370.6, 0.3, 0.27, 0.12);
      tone(1776.7, 0.6, 0.36, 0.12);
      break;
    case "tick":
      nz(0, 0.008, 0.12, { type: "highpass", f: 4000 });
      break;
  }
}
/* ringtone (original marimba motif) + alarm */
let ringT = 0,
  ringA = null;
const MOTIF = [
  [0, 659.3],
  [0.14, 987.8],
  [0.28, 830.6],
  [0.42, 1318.5],
  [0.7, 987.8],
  [0.84, 1108.7],
  [0.98, 830.6],
  [1.12, 987.8],
];
function ringStart() {
  ringStop();
  if (!sndOn || !ac()) return;
  const f = fileSnd("ring");
  if (f && !silent) {
    f.loop = true;
    f.play().catch(() => {});
    ringA = f;
    return;
  }
  const once = () => {
    if (silent) {
      buzz(0, 0.5, 0.3);
      vib(500);
      return;
    }
    MOTIF.forEach(([t, fr]) => mallet(fr, t, 0.2, 0.7));
    buzz(1.5, 0.45, 0.22);
    vib([400, 250, 400]);
  };
  once();
  ringT = setInterval(once, silent ? 1300 : 2500);
}
function alarmStart() {
  ringStop();
  if (!sndOn || !ac()) return; // alarms ignore silent mode, like a real phone
  const f = fileSnd("alarm");
  if (f) {
    f.loop = true;
    f.play().catch(() => {});
    ringA = f;
    return;
  }
  const once = () => {
    for (let i = 0; i < 4; i++)
      tone(1480, i * 0.11, 0.07, 0.1, { type: "square", lp: 3200 });
    for (let i = 0; i < 4; i++)
      tone(1760, 0.55 + i * 0.11, 0.07, 0.1, { type: "square", lp: 3200 });
    vib([200, 100, 200]);
  };
  once();
  ringT = setInterval(once, 1150);
}
function ringStop() {
  clearInterval(ringT);
  ringT = 0;
  if (ringA) {
    ringA.pause();
    ringA = null;
  }
  vib(0);
}
const DT = {
  1: [697, 1209],
  2: [697, 1336],
  3: [697, 1477],
  4: [770, 1209],
  5: [770, 1336],
  6: [770, 1477],
  7: [852, 1209],
  8: [852, 1336],
  9: [852, 1477],
  "*": [941, 1209],
  0: [941, 1336],
  "#": [941, 1477],
};
function dtmf(k) {
  if (!sndOn || !ac() || !DT[k]) return;
  tone(DT[k][0], 0, 0.15, 0.06);
  tone(DT[k][1], 0, 0.15, 0.06);
}
/* ambience: waves on the beach */
let amb = null;
function ambStart() {
  if (!ambOn || !sndOn || amb || !ac()) return;
  const c = AU.c,
    g = c.createGain();
  g.gain.value = 0;
  g.connect(AU.m);
  const s = c.createBufferSource();
  s.buffer = AU.nb;
  s.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 420;
  const sw = c.createGain();
  sw.gain.value = 0.3;
  s.connect(lp);
  lp.connect(sw);
  sw.connect(g);
  const s2 = c.createBufferSource();
  s2.buffer = AU.nb;
  s2.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2600;
  bp.Q.value = 0.6;
  const fo = c.createGain();
  fo.gain.value = 0;
  s2.connect(bp);
  bp.connect(fo);
  fo.connect(g);
  s.start();
  s2.start(c.currentTime, 0.7);
  g.gain.linearRampToValueAtTime(0.12, c.currentTime + 4);
  amb = { g, srcs: [s, s2] };
  const wave = () => {
    if (!amb) return;
    const t = c.currentTime,
      per = 6 + Math.random() * 5;
    [sw.gain, lp.frequency, fo.gain].forEach((p) => p.cancelScheduledValues(t));
    sw.gain.setValueAtTime(0.28, t);
    sw.gain.linearRampToValueAtTime(0.95, t + per * 0.45);
    sw.gain.linearRampToValueAtTime(0.25, t + per);
    lp.frequency.setValueAtTime(380, t);
    lp.frequency.linearRampToValueAtTime(950, t + per * 0.45);
    lp.frequency.linearRampToValueAtTime(380, t + per);
    fo.gain.setValueAtTime(0, t);
    fo.gain.linearRampToValueAtTime(0, t + per * 0.4);
    fo.gain.linearRampToValueAtTime(0.11, t + per * 0.52);
    fo.gain.linearRampToValueAtTime(0, t + per * 0.95);
    amb.to = setTimeout(wave, per * 1000);
  };
  wave();
}
function ambStop() {
  if (!amb) return;
  const a = amb;
  amb = null;
  clearTimeout(a.to);
  const t = AU.c.currentTime;
  a.g.gain.cancelScheduledValues(t);
  a.g.gain.setValueAtTime(a.g.gain.value, t);
  a.g.gain.linearRampToValueAtTime(0, t + 0.8);
  setTimeout(
    () =>
      a.srcs.forEach((s) => {
        try {
          s.stop();
        } catch (e) {}
      }),
    900
  );
}
/* playback beds for voice memos, voicemail, calls */
let bed = null;
function bedStart(kind) {
  bedStop();
  if (!sndOn || !ac()) return;
  const c = AU.c,
    g = c.createGain();
  g.gain.value = 0;
  g.connect(AU.m);
  const s = c.createBufferSource();
  s.buffer = AU.nb;
  s.loop = true;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = kind === "train" ? 160 : kind === "sea" ? 520 : 3200;
  f.Q.value = kind === "train" ? 0.8 : 0.5;
  s.connect(f);
  f.connect(g);
  s.start();
  g.gain.linearRampToValueAtTime(
    kind === "train" ? 0.25 : kind === "sea" ? 0.08 : 0.03,
    c.currentTime + 0.3
  );
  bed = { g, s, iv: 0 };
  if (kind === "train")
    bed.iv = setInterval(() => {
      tone(70, 0, 0.08, 0.22, { lp: 200 });
      tone(70, 0.14, 0.08, 0.18, { lp: 200 });
    }, 1400);
  if (kind === "kitchen")
    bed.iv = setInterval(() => {
      if (Math.random() < 0.5)
        fm(2300 + Math.random() * 900, 0, 0.25, 0.02, 1.4, 0.8, 0.3);
    }, 900);
}
function bedStop() {
  if (!bed) return;
  clearInterval(bed.iv);
  const b = bed;
  bed = null;
  try {
    b.g.gain.linearRampToValueAtTime(0, AU.c.currentTime + 0.2);
    setTimeout(() => b.s.stop(), 300);
  } catch (e) {}
}
function setVol(v) {
  vol = Math.max(0, Math.min(1, v));
  if (AU.m) AU.m.gain.value = vol;
  const h = $("#volhud");
  h.querySelector("i").style.height = vol * 100 + "%";
  h.classList.add("on");
  clearTimeout(h._t);
  h._t = setTimeout(() => h.classList.remove("on"), 1300);
  sfx("tick");
}

/* ===================================================================== ICONS
      UI glyphs and app icons are simple original drawings. */
const IP = {
  back: '<path d="M15.5 3.5 7 12l8.5 8.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  chev: '<path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  down: '<path d="m5 9 7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  search:
    '<circle cx="10.5" cy="10.5" r="6.3" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="m15.4 15.4 5 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  compose:
    '<path d="M4 20h3.8L19 8.8 15.2 5 4 16.2z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path d="m13.6 6.6 3.8 3.8" stroke="currentColor" stroke-width="1.9"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  up: '<path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  phone:
    '<path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"/>',
  video:
    '<rect x="2.5" y="6" width="13" height="12" rx="3"/><path d="m16.5 10 5-3v10l-5-3z"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  msg: '<path d="M12 3.5c-5 0-9 3.3-9 7.4 0 2.3 1.2 4.3 3.2 5.7-.2 1.2-.8 2.3-1.6 3.1 2-.2 3.7-.9 4.8-1.7.8.2 1.7.3 2.6.3 5 0 9-3.3 9-7.4S17 3.5 12 3.5z"/>',
  info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 10.5v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1.2"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  unlock:
    '<rect x="5" y="10.5" width="14" height="10.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 7.7-1.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  trash:
    '<path d="M4.5 6.5h15M9.5 6.5v-2h5v2M6.5 6.5l1 13.5h9l1-13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  share:
    '<path d="M12 3.5v11M8 7.5l4-4 4 4M6.5 11H5v9.5h14V11h-1.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  heart:
    '<path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  pause:
    '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
  b15: '<path d="M12 4.5a7.5 7.5 0 1 1-7 4.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 1.6v5.8L8.6 4.5z"/><text x="12.3" y="15.6" font-size="7" text-anchor="middle" font-weight="700" font-family="-apple-system,sans-serif">15</text>',
  f15: '<path d="M12 4.5a7.5 7.5 0 1 0 7 4.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M12 1.6v5.8l3.4-2.9z"/><text x="11.7" y="15.6" font-size="7" text-anchor="middle" font-weight="700" font-family="-apple-system,sans-serif">15</text>',
  quote:
    '<path d="M5 5.5h14v10H9.5L5 19z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 9h7M8.5 12h4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  star: '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.8z"/>',
  clock:
    '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7v5.2l3.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  person:
    '<circle cx="12" cy="8" r="4"/><path d="M4 20.5c.8-4 4-6 8-6s7.2 2 8 6z"/>',
  keypad:
    "<g>" +
    [0, 1, 2, 3]
      .map((r) =>
        [0, 1, 2]
          .map((c) => `<circle cx="${6 + c * 6}" cy="${3.5 + r * 5.6}" r="2"/>`)
          .join("")
      )
      .join("") +
    "</g>",
  vm: '<circle cx="6.5" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.9"/><circle cx="17.5" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M6.5 15.5h11" stroke="currentColor" stroke-width="1.9"/>',
  photo:
    '<rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="10" r="1.6"/><path d="M4 17.5l5-4.5 3.5 3 3-2.5 4.5 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  albums:
    '<rect x="4" y="7" width="16" height="12.5" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 3.8h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  foryou:
    '<rect x="3.5" y="4" width="17" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 16s-4-2.4-4-5.2A2.2 2.2 0 0 1 12 9.6a2.2 2.2 0 0 1 4 1.2C16 13.6 12 16 12 16z"/>',
  book: '<path d="M3.5 5.5c3-1 6-1 8.5 1 2.5-2 5.5-2 8.5-1v13c-3-1-6-1-8.5 1-2.5-2-5.5-2-8.5-1z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 6.5v13" stroke="currentColor" stroke-width="1.7"/>',
  tabs: '<rect x="3.5" y="7.5" width="13" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7.5 4h10.5a2.5 2.5 0 0 1 2.5 2.5V17" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  reload:
    '<path d="M19 12a7 7 0 1 1-2.1-5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M17.5 3v4.5H13" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  flash: '<path d="M8.5 2h7v3.5l-1.5 2.2V20a2 2 0 0 1-4 0V7.7L8.5 5.5z"/>',
  cam: '<path fill-rule="evenodd" d="M9 4.5h6l1.5 2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2h2.5zM12 9a3.8 3.8 0 1 0 0 7.6A3.8 3.8 0 0 0 12 9z"/>',
  face: '<path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16M8.5 8.5v1.5M15.5 8.5v1.5M12 9v4h-1M9 16c1.6 1.4 4.4 1.4 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  hour: '<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  bellx:
    '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  spk: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  mute: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M4 4l16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  add: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  check:
    '<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  x: '<path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  folder:
    '<path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" fill="none" stroke="currentColor" stroke-width="1.8"/>',
  reply:
    '<path d="M10 5 3.5 11 10 17M4 11h9.5a6.5 6.5 0 0 1 6.5 6.5V19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  dots: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="7.6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="16.4" cy="12" r="1.4"/>',
  loc: '<path d="M20.5 3.5 3.5 10.6l7.4 2.5 2.5 7.4z"/>',
  list: '<path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="4.5" cy="6.5" r="1.3"/><circle cx="4.5" cy="12" r="1.3"/><circle cx="4.5" cy="17.5" r="1.3"/>',
  flip: '<path d="M4 9.5A8 8 0 0 1 18.5 7M20 14.5A8 8 0 0 1 5.5 17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18.5 3v4h-4M5.5 21v-4h4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  bolt: '<path d="M13 2 5 13.5h6L10 22l8.5-11.5h-6z"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.3a9.5 9.5 0 0 1 13 0M8.5 15.5a5 5 0 0 1 7 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="19" r="1.6"/>',
  bt: '<path d="m7 7.5 10 9-5 4.5V3l5 4.5-10 9" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
  plane:
    '<path d="M21 15.5v-2L13.5 9V4a1.5 1.5 0 0 0-3 0v5L3 13.5v2l7.5-2.3v4.6l-2 1.5v1.7l3.5-1 3.5 1v-1.7l-2-1.5v-4.6z"/>',
  ant: '<path d="M12 10v11M8 6.5a5.5 5.5 0 0 0 0 7M16 6.5a5.5 5.5 0 0 1 0 7M5.2 4a9.5 9.5 0 0 0 0 12M18.8 4a9.5 9.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="10" r="1.8"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  gear: '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  batt: '<rect x="2.5" y="7" width="17" height="10" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="4.8" y="9.3" width="6" height="5.4" rx="1"/><path d="M21.5 10.5v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-5a1.5 1.5 0 0 1 3 0v8.5a6.5 6.5 0 0 1-6.5 6.5c-2.4 0-3.6-1-5-3l-2.6-4a1.5 1.5 0 0 1 2.4-1.7L8 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
  key: '<circle cx="8" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M12.5 12H21M18 12v3.5M15.5 12v2.5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>',
};
const I = (n, s = 22, st = "") =>
  `<svg class="ico" viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor"${
    st ? ` style="${st}"` : ""
  } aria-hidden="true">${IP[n] || ""}</svg>`;
const G = (inner, sz = "62%", st = "") =>
  `<svg viewBox="0 0 24 24" width="${sz}" height="${sz}" fill="#fff" style="${st}">${inner}</svg>`;
const petals = [...Array(8)]
  .map(
    (_, i) =>
      `<ellipse cx="12" cy="6.6" rx="2.5" ry="4.5" fill="hsl(${
        i * 45 + 10
      } 88% 60%)" transform="rotate(${i * 45} 12 12)"/>`
  )
  .join("");
const APPN = {
  findmy: "Find My",
  wallet: "Wallet",
  reminders: "Reminders",
  messages: "Messages",
  phone: "Phone",
  mail: "Mail",
  safari: "Safari",
  music: "Music",
  photos: "Photos",
  camera: "Camera",
  settings: "Settings",
  notes: "Notes",
  calendar: "Calendar",
  clock: "Clock",
  maps: "Maps",
  weather: "Weather",
  voice: "Voice Memos",
};
const APPI = {
  findmy: () => [
    "linear-gradient(#34c759,#1f9d3e)",
    `<svg viewBox="0 0 24 24" width="76%" height="76%"><circle cx="12" cy="12" r="9.5" fill="#fff"/><circle cx="12" cy="12" r="6" fill="none" stroke="#1f9d3e" stroke-width="1.5"/><circle cx="12" cy="12" r="2.6" fill="#1f9d3e"/></svg>`,
  ],
  wallet: () => [
    "#000",
    `<svg viewBox="0 0 24 24" width="78%" height="78%"><rect x="3" y="5" width="18" height="5" rx="1.5" fill="#3aa0ff"/><rect x="3" y="8" width="18" height="5" rx="1.5" fill="#ffcc00"/><rect x="3" y="11" width="18" height="5" rx="1.5" fill="#ff6b3d"/><rect x="2.5" y="13" width="19" height="7" rx="2" fill="#d9d9de"/></svg>`,
  ],
  reminders: () => [
    "#fff",
    `<svg viewBox="0 0 24 24" width="74%" height="74%"><circle cx="5" cy="6" r="2.2" fill="#0a84ff"/><circle cx="5" cy="12" r="2.2" fill="#ff3b30"/><circle cx="5" cy="18" r="2.2" fill="#ff9500"/><path d="M9.5 6h11M9.5 12h11M9.5 18h11" stroke="#c7c7cc" stroke-width="1.3"/></svg>`,
  ],
  messages: () => ["linear-gradient(#5df679,#0dbe2c)", G(IP.msg, "66%")],
  phone: () => ["linear-gradient(#5df679,#0dbe2c)", G(IP.phone, "58%")],
  mail: () => [
    "linear-gradient(#3fb2ff,#0a5dff)",
    G(
      '<rect x="2.5" y="5.5" width="19" height="13" rx="2.4"/><path d="m3.4 7 8.6 6.3L20.6 7" fill="none" stroke="#1d6bff" stroke-width="1.5"/>',
      "70%"
    ),
  ],
  safari: () => [
    "linear-gradient(#fff,#e7eaf0)",
    `<svg viewBox="0 0 24 24" width="84%" height="84%"><circle cx="12" cy="12" r="10" fill="url(#sfg)"/><defs><linearGradient id="sfg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#29b6ff"/><stop offset="1" stop-color="#0f62ff"/></linearGradient></defs><g stroke="#fff" stroke-width=".5" opacity=".75">${[
      ...Array(24),
    ]
      .map(
        (_, i) =>
          `<path d="M12 2.6v${i % 2 ? 1 : 1.8}" transform="rotate(${
            i * 15
          } 12 12)"/>`
      )
      .join(
        ""
      )}</g><path d="M16.8 7.2 13 13l-5.8 3.8L11 11z" fill="#fff"/><path d="M16.8 7.2 11 11l2 2z" fill="#ff3b30"/></svg>`,
  ],
  music: () => [
    "linear-gradient(#ff6b81,#fa233b)",
    G(
      '<path d="M9.5 17.2V6.6l9-2v10.3" fill="none" stroke="#fff" stroke-width="2"/><ellipse cx="7.3" cy="17.3" rx="2.6" ry="2.1"/><ellipse cx="16.3" cy="15" rx="2.6" ry="2.1"/>'
    ),
  ],
  photos: () => [
    "#fff",
    `<svg viewBox="0 0 24 24" width="84%" height="84%"><g style="mix-blend-mode:multiply" opacity=".9">${petals}</g></svg>`,
  ],
  camera: () => [
    "linear-gradient(#e2e4e8,#9a9da5)",
    `<svg viewBox="0 0 24 24" width="66%" height="66%"><rect x="2.5" y="6.5" width="19" height="13" rx="3" fill="#2b2c30"/><path d="M8.5 6.5 10 4.5h4l1.5 2z" fill="#2b2c30"/><circle cx="12" cy="13" r="4.2" fill="#55575e"/><circle cx="12" cy="13" r="2.6" fill="#1a1b1e"/><circle cx="18.2" cy="9.2" r=".9" fill="#ffd60a"/></svg>`,
  ],
  settings: () => [
    "linear-gradient(#cdd0d6,#7d8088)",
    `<svg viewBox="0 0 24 24" width="78%" height="78%"><circle cx="12" cy="12" r="7.2" fill="none" stroke="#3f4147" stroke-width="3.2" stroke-dasharray="2.4 1.8"/><circle cx="12" cy="12" r="5.4" fill="#9a9da4"/><circle cx="12" cy="12" r="3.6" fill="none" stroke="#3f4147" stroke-width="1.6"/><g stroke="#3f4147" stroke-width="1.1">${[
      0, 60, 120,
    ]
      .map((a) => `<path d="M12 8.4v7.2" transform="rotate(${a} 12 12)"/>`)
      .join("")}</g></svg>`,
  ],
  notes: () => [
    "linear-gradient(#ffd54a 0 27%,#fffef7 27%)",
    `<svg viewBox="0 0 24 24" width="74%" height="74%" style="margin-top:28%"><path d="M2 3h20M2 8h20M2 13h20" stroke="#d6d2c4" stroke-width="1.1"/></svg>`,
  ],
  calendar: () => {
    const n = now();
    return [
      "#fff",
      `<div class="cal-ic"><b>${WS[
        n.getDay()
      ].toUpperCase()}</b><span>${n.getDate()}</span></div>`,
    ];
  },
  clock: () => {
    const n = now(),
      hA = ((n.getHours() % 12) + n.getMinutes() / 60) * 30,
      mA = n.getMinutes() * 6;
    return [
      "#000",
      `<svg viewBox="0 0 24 24" width="88%" height="88%"><circle cx="12" cy="12" r="11" fill="#fff"/>${[
        ...Array(12),
      ]
        .map(
          (_, i) =>
            `<path d="M12 2.4v1.3" stroke="#222" stroke-width=".8" transform="rotate(${
              i * 30
            } 12 12)"/>`
        )
        .join(
          ""
        )}<path d="M12 12V6.8" stroke="#111" stroke-width="1.5" stroke-linecap="round" transform="rotate(${hA} 12 12)"/><path d="M12 12V3.9" stroke="#111" stroke-width="1" stroke-linecap="round" transform="rotate(${mA} 12 12)"/><path d="M12 13.5V3.6" stroke="#ff9500" stroke-width=".55" transform="rotate(${
        n.getSeconds() * 6
      } 12 12)"/><circle cx="12" cy="12" r="1" fill="#ff9500"/></svg>`,
    ];
  },
  maps: () => [
    "linear-gradient(135deg,#bfe3a7,#f2efe2 55%,#cfe8f7)",
    `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M-2 17 9 8l6 6 11-9" fill="none" stroke="#fff" stroke-width="3.2"/><path d="M-2 17 9 8l6 6 11-9" fill="none" stroke="#f7c948" stroke-width="1.4"/><path d="M14 -2v28" stroke="#fff" stroke-width="2"/><circle cx="15.5" cy="9" r="3.3" fill="#ff3b30"/><circle cx="15.5" cy="9" r="1.2" fill="#fff"/></svg>`,
  ],
  weather: () => [
    "linear-gradient(#3f8ff2,#1d5ad3)",
    `<svg viewBox="0 0 24 24" width="74%" height="74%"><circle cx="9" cy="9.5" r="4" fill="#ffd60a"/><path d="M7.5 18.5h9a3.3 3.3 0 0 0 .3-6.6 4.5 4.5 0 0 0-8.6 1.3A2.7 2.7 0 0 0 7.5 18.5z" fill="#fff"/></svg>`,
  ],
  voice: () => [
    "#1c1c1e",
    `<svg viewBox="0 0 24 24" width="70%" height="70%"><g stroke="#ff453a" stroke-width="1.7" stroke-linecap="round">${[
      3, 6, 10, 7, 4, 8, 11, 6, 3,
    ]
      .map((hgt, i) => `<path d="M${3.5 + i * 2.1} ${12 - hgt / 2}v${hgt}"/>`)
      .join("")}</g></svg>`,
  ],
};
const appIc = (k, s = 38) => {
  const [b, g] = APPI[k]();
  return `<span class="mi" style="width:${s}px;height:${s}px;background:${b}">${g}</span>`;
};

/* ------------------------------------------------------------ avatars & photo scenes */
const av = (c, s) =>
  `<span class="av" style="width:${s}px;height:${s}px;font-size:${(
    s * 0.4
  ).toFixed(1)}px">${ini(c)}</span>`;
function avt(t, s) {
  if (t.with.length > 1)
    return `<span class="avg" style="width:${s}px;height:${s}px">${t.with
      .slice(0, 2)
      .map((c) => av(c, Math.round(s * 0.64)))
      .join("")}</span>`;
  return av(t.with[0], s);
}
const SC = {
  seanight:
    "radial-gradient(circle at 72% 24%, rgba(235,240,255,.9) 0 1.6%, rgba(170,190,240,.25) 3%, transparent 14%), linear-gradient(90deg, transparent 64%, rgba(190,205,255,.13) 70%, transparent 76%) 0 52%/100% 48% no-repeat, linear-gradient(#04060d 0%, #0b1226 50.5%, #1a2440 51%, #0b1020 62%, #05070c 100%)",
  seaday:
    "radial-gradient(ellipse at 60% 30%, rgba(255,240,220,.7), transparent 40%), linear-gradient(#c9d6e2 0%, #e8dccd 42%, #93abc0 49%, #6d88a0 63%, #e4d4b7 72%, #c8b190 100%)",
  beach:
    "radial-gradient(ellipse at 50% 38%, rgba(255,226,200,.75), transparent 42%), linear-gradient(#7f8ea6 0%, #c9b4a6 40%, #8297ad 47%, #5c7390 62%, #b7a487 70%, #a08d70 100%)",
  train:
    "radial-gradient(circle at 22% 62%, rgba(255,186,105,.55), transparent 9%), radial-gradient(circle at 64% 54%, rgba(255,220,160,.35), transparent 7%), radial-gradient(circle at 85% 66%, rgba(255,200,130,.3), transparent 6%), linear-gradient(100deg, transparent 30%, rgba(255,255,255,.06) 31%, transparent 40%), linear-gradient(170deg,#0c0e14,#1b1e29 60%,#090a0e)",
  door: "radial-gradient(ellipse at 50% 15%, rgba(255,210,150,.35), transparent 55%), linear-gradient(90deg, #3a2f28 0 30%, #5e4b3c 30% 70%, #3a2f28 70%)",
  cat: "radial-gradient(ellipse at 30% 25%, rgba(255,220,170,.45), transparent 50%), linear-gradient(160deg,#6b5847,#2b231e)",
  cake: "radial-gradient(ellipse at 50% 62%, #f4e7b4 0 24%, #d9c17a 25% 27%, transparent 28%), linear-gradient(#cdb89a,#8b765c)",
  candle:
    "radial-gradient(circle at 50% 30%, rgba(255,200,110,.85) 0 3%, rgba(255,170,80,.25) 9%, transparent 30%), radial-gradient(ellipse at 50% 70%, #e9d9a8 0 26%, transparent 27%), linear-gradient(#1c130c,#3a2a1b)",
  bar: "radial-gradient(circle at 20% 30%, rgba(255,140,60,.55), transparent 10%), radial-gradient(circle at 75% 22%, rgba(190,90,255,.4), transparent 11%), radial-gradient(circle at 60% 70%, rgba(255,90,120,.35), transparent 12%), radial-gradient(circle at 35% 80%, rgba(255,200,90,.3), transparent 9%), linear-gradient(#1a0f1f,#0c0710)",
  cloud:
    "radial-gradient(ellipse at 50% 40%, #fff 0 12%, transparent 40%), linear-gradient(#5d9bd8,#a9cbe9)",
  book: "linear-gradient(135deg,#3a3f5c,#1d2035)",
  bun: "radial-gradient(ellipse at 50% 55%, rgba(255,240,210,.6), transparent 50%), linear-gradient(#e7cfa8,#b4865a)",
  snow: "radial-gradient(circle, rgba(255,255,255,.8) 0 1px, transparent 1.5px) 0 0/18px 18px, radial-gradient(circle, rgba(255,255,255,.5) 0 1px, transparent 1.5px) 9px 9px/22px 22px, linear-gradient(#59647a,#2a3140)",
  honey:
    "radial-gradient(ellipse at 40% 30%, rgba(255,230,150,.6), transparent 45%), linear-gradient(#d9a441,#6e4613)",
  kitchen:
    "radial-gradient(ellipse at 28% 30%, rgba(255,200,120,.42), transparent 42%), linear-gradient(90deg, transparent 18%, rgba(255,210,140,.12) 19% 36%, transparent 37%), linear-gradient(#1a1410,#0b0806)",
  makeup:
    "radial-gradient(circle at 15% 15%, #fff7e0 0 4%, transparent 6%), radial-gradient(circle at 85% 15%, #fff7e0 0 4%, transparent 6%), radial-gradient(circle at 15% 85%, #fff7e0 0 4%, transparent 6%), radial-gradient(circle at 85% 85%, #fff7e0 0 4%, transparent 6%), radial-gradient(ellipse at 50% 50%, #e9a9b0, #7a3a48 75%)",
  couch:
    "radial-gradient(ellipse at 75% 20%, rgba(255,235,200,.45), transparent 45%), linear-gradient(120deg,#6b6a78,#2f2e38)",
  def: "linear-gradient(#3a3a3c,#1c1c1e)",
};
function scene(p, cls) {
  if (p.src)
    return `<div class="scn real ${cls}" style="background:${
      cls === "v" ? "#000" : "#111"
    } url('${p.src}') center/${
      cls === "v" ? "contain no-repeat" : "cover"
    }"></div>`;
  if (p.scene === "shot")
    return `<div class="scn shot ${cls}"><div class="shot-in">${(p.shot || [])
      .map((l) => `<div>${l}</div>`)
      .join("")}</div></div>`;
  return `<div class="scn ${cls}" style="background:${SC[p.scene] || SC.def}">${
    p.emoji ? `<i>${p.emoji}</i>` : ""
  }</div>`;
}

/* ===================================================================== WINDOW / NAV */
function rel(e) {
  const r = e.getBoundingClientRect(),
    p = PH.getBoundingClientRect(),
    k = p.width / PH.offsetWidth;
  return {
    x: (r.left - p.left) / k,
    y: (r.top - p.top) / k,
    w: r.width / k,
    h: r.height / k,
  };
}
const isMob = () => document.body.classList.contains("full");
const topP = () => W && W.stack[W.stack.length - 1];
function mk(fn, args) {
  const P = fn(...args) || {};
  const e = el("div", "page " + (P.cls || ""));
  e.innerHTML = P.html || "";
  return { fn, args, el: e, P, title: P.title || "" };
}
function sbMode() {
  const t = state === "home" && W && topP();
  PH.classList.toggle("sbd", !!(t && t.P && t.P.light));
}
function mountP(e) {
  setTimeout(sbMode, 0);
  if (e.P.mount) e.P.mount(e.el);
  const sc = $(".sc", e.el);
  if (sc) {
    const f = () => {
      e.el.classList.toggle("scr", sc.scrollTop > 4);
      e.el.classList.toggle("tt", sc.scrollTop > 40);
    };
    sc.addEventListener("scroll", f, { passive: true });
    f();
  }
}
function clipFor(r) {
  const pw = PH.offsetWidth,
    ph = PH.offsetHeight;
  return `inset(${r.y}px ${pw - r.x - r.w}px ${ph - r.y - r.h}px ${
    r.x
  }px round 15px)`;
}
function openApp(app, from, then) {
  if (ended || state === "off" || state === "boot" || state === "end") return;
  if ((state === "lock" || state === "pass") && app !== "camera") return;
  if (!APPS[app]) return;
  ac();
  if (W) killWin();
  const w = el(
    "div",
    "win" + (state === "lock" || state === "pass" ? " ovl" : "")
  );
  SCR.appendChild(w);
  W = { app, el: w, stack: [] };
  push(APPS[app], [], false);
  if (then) then();
  const ic =
    (from && from.querySelector && from.querySelector(".ai")) ||
    (state === "home" && $(`#home [data-app="${app}"] .ai`));
  if (ic && !reduce) {
    const r = rel(ic);
    w.style.transition = "none";
    w.style.clipPath = clipFor(r);
    w.style.transformOrigin = `${r.x + r.w / 2}px ${r.y + r.h / 2}px`;
    w.style.transform = "scale(.94)";
    w.firstElementChild && (w.firstElementChild.style.opacity = ".2");
    w.getBoundingClientRect();
    requestAnimationFrame(() => {
      w.style.transition = "";
      w.classList.add("zoom");
      w.style.clipPath = `inset(0 0 0 0 round ${isMob() ? 0 : 55}px)`;
      w.style.transform = "";
      w.firstElementChild && (w.firstElementChild.style.opacity = "");
      setTimeout(() => {
        w.classList.remove("zoom");
        w.style.clipPath = "";
      }, 520);
    });
  } else w.classList.add("fadein");
  $("#home") && $("#home").classList.add("behind");
}
function closeApp() {
  if (!W) return;
  const w = W;
  W = null;
  hreset();
  stopMedia();
  kbClose(true);
  PH.classList.remove("sbd");
  const home = $("#home");
  if (state === "home" && home) {
    renderHome();
    home.classList.remove("behind");
  }
  const ic = state === "home" && $(`#home [data-app="${w.app}"] .ai`);
  if (ic && !reduce) {
    const r = rel(ic);
    w.el.style.clipPath = `inset(0 0 0 0 round ${isMob() ? 0 : 55}px)`;
    w.el.style.transformOrigin = `${r.x + r.w / 2}px ${r.y + r.h / 2}px`;
    w.el.getBoundingClientRect();
    w.el.classList.add("zoomout");
    w.el.style.clipPath = clipFor(r);
    w.el.style.transform = "scale(.94)";
    setTimeout(() => w.el.remove(), 430);
  } else {
    w.el.classList.add("fadeout");
    setTimeout(() => w.el.remove(), 260);
  }
  if (state === "lock") renderLock();
}
function killWin() {
  if (!W) return;
  stopMedia();
  kbClose(true);
  W.el.remove();
  W = null;
  hreset();
}
function push(fn, args = [], anim = true) {
  if (!W) return;
  const prev = topP();
  BACKL = prev
    ? strip(prev.title).length > 13
      ? "Back"
      : strip(prev.title)
    : null;
  const e = mk(fn, args);
  e.back = BACKL;
  W.el.appendChild(e.el);
  W.stack.push(e);
  mountP(e);
  if (prev) {
    if (anim && !reduce) {
      animOn();
      e.el.classList.add("a-in");
      prev.el.classList.add("a-under");
      setTimeout(() => {
        e.el.classList.remove("a-in");
        prev.el.classList.remove("a-under");
        if (W && topP() !== prev) prev.el.classList.add("hid");
      }, 400);
    } else prev.el.classList.add("hid");
    hpush();
  }
}
let animT = 0;
function animOn(ms = 430) {
  if (!W) return;
  const w = W.el;
  w.classList.add("anim");
  clearTimeout(animT);
  animT = setTimeout(() => w.classList.remove("anim"), ms);
}
function goBack(fromPop) {
  if (!W) return;
  if (KB) {
    kbClose();
    return;
  }
  if (W.stack.length < 2) {
    closeApp();
    return;
  }
  const t = W.stack.pop(),
    p = topP();
  t.P.unmount && t.P.unmount();
  rerender(p);
  p.el.classList.remove("hid");
  if (!reduce) {
    animOn();
    t.el.classList.add("a-out");
    p.el.classList.add("a-back");
    setTimeout(() => {
      t.el.remove();
      p.el.classList.remove("a-back");
    }, 380);
  } else t.el.remove();
  if (!fromPop) hback();
  sbMode();
}
function rerender(e) {
  if (!e) return;
  const sc = $(".sc", e.el),
    y = sc ? sc.scrollTop : 0;
  BACKL = e.back;
  const P = e.fn(...e.args) || {};
  e.P = P;
  const hid = e.el.classList.contains("hid");
  e.el.className = "page " + (P.cls || "") + (hid ? " hid" : "");
  e.el.innerHTML = P.html || "";
  mountP(e);
  const n = $(".sc", e.el);
  if (n && !P.keepBottom) n.scrollTop = y;
}
function replace(fn, args = []) {
  if (!W) return;
  const t = W.stack.pop();
  t && t.el.remove();
  BACKL = t ? t.back : null;
  const e = mk(fn, args);
  e.back = BACKL;
  W.el.appendChild(e.el);
  W.stack.push(e);
  mountP(e);
}
function refresh() {
  if (state === "home" && W) rerenderTopSoft();
  else if (state === "home") renderHome();
  else if (state === "lock") renderLockNs();
}
function rerenderTopSoft() {
  const t = topP();
  if (!t) return;
  if (t.fn === threadPage) {
    updInput();
    return;
  } // threads update in place
  rerender(t);
}
let hdep = 0,
  ignorePop = 0;
function hpush() {
  try {
    history.pushState({ p: 1 }, "");
    hdep++;
  } catch (e) {}
}
function hback() {
  if (hdep > 0) {
    hdep--;
    ignorePop++;
    try {
      history.back();
    } catch (e) {
      ignorePop--;
    }
  }
}
function hreset() {
  if (hdep > 0) {
    ignorePop++;
    try {
      history.go(-hdep);
    } catch (e) {
      ignorePop--;
    }
    hdep = 0;
  }
}
addEventListener("popstate", () => {
  if (ignorePop > 0) {
    ignorePop--;
    return;
  }
  if (hdep > 0) hdep--;
  if (W && state === "home") goBack(true);
});
/* swipe from the left edge to go back */
PH.addEventListener("pointerdown", (e) => {
  if (!W || W.stack.length < 2 || state !== "home" || KB) return;
  if (e.target.closest("button, a, input, textarea, select")) return; // taps on the back button are not swipes
  const p = PH.getBoundingClientRect(),
    k = p.width / PH.offsetWidth,
    x = (e.clientX - p.left) / k;
  if (x > 22) return;
  const t = topP(),
    pv = W.stack[W.stack.length - 2],
    x0 = e.clientX,
    wpx = PH.offsetWidth;
  let dx = 0;
  pv.el.classList.remove("hid");
  W.el.classList.add("anim");
  t.el.style.transition = pv.el.style.transition = "none";
  pv.el.style.transform = "translateX(-30%)";
  const mv = (ev) => {
    dx = Math.max(0, (ev.clientX - x0) / k);
    t.el.style.transform = `translateX(${dx}px)`;
    pv.el.style.transform = `translateX(${-30 + (dx / wpx) * 30}%)`;
  };
  const up = () => {
    removeEventListener("pointermove", mv);
    removeEventListener("pointerup", up);
    removeEventListener("pointercancel", up);
    t.el.style.transition = pv.el.style.transition = "transform .25s ease-out";
    animOn(300);
    if (dx > wpx * 0.33) {
      t.el.style.transform = "translateX(100%)";
      pv.el.style.transform = "translateX(0)";
      setTimeout(() => {
        t.el.remove();
        pv.el.style.cssText = "";
        if (W && W.stack[W.stack.length - 1] === t) {
          W.stack.pop();
          t.P.unmount && t.P.unmount();
          rerender(pv);
          hback();
        }
      }, 250);
    } else {
      t.el.style.transform = "";
      pv.el.style.transform = "translateX(-30%)";
      setTimeout(() => {
        t.el.style.cssText = "";
        pv.el.style.cssText = "";
        if (W && topP() !== pv) pv.el.classList.add("hid");
      }, 250);
    }
  };
  addEventListener("pointermove", mv);
  addEventListener("pointerup", up);
  addEventListener("pointercancel", up);
});

/* ------------------------------------------------------------ page chrome */
function pg(o) {
  const title = o.title || "";
  const nav = o.noNav
    ? ""
    : `<div class="nbw"><div class="nb">${
        o.left != null
          ? o.left
          : BACKL
          ? `<button class="bk" onclick="goBack()">${I(
              "back",
              22
            )}<span>${BACKL}</span></button>`
          : "<span></span>"
      }<div class="nbt">${o.small || title}</div><div class="nbr">${
        o.right || ""
      }</div></div>${o.sub || ""}</div>`;
  return `${nav}<div class="sc${o.tab ? " hastab" : ""}${
    o.scls ? " " + o.scls : ""
  }">${o.large !== false && title ? `<h1 class="lt">${title}</h1>` : ""}${
    o.search
      ? `<div class="srch">${I("search", 16)}<span>Search</span>${I(
          "mic",
          16
        )}</div>`
      : ""
  }${o.body || ""}</div>${o.tab || ""}${o.foot || ""}`;
}
const tabbar = (items, cur, fn) =>
  `<div class="tab">${items
    .map(
      ([k, l, ic, b]) =>
        `<button class="${cur === k ? "on" : ""}" onclick="${fn}('${k}')">${I(
          ic,
          25
        )}<span>${l}</span>${b ? `<i class="tbd">${b}</i>` : ""}</button>`
    )
    .join("")}</div>`;
const tog = (on, fn) =>
  `<button class="tg${on ? " on" : ""}" onclick="${fn || ""}"><i></i></button>`;

/* ===================================================================== STATUS BAR */
function sbHTML() {
  const sig = [0, 1, 2, 3]
    .map(
      (i) =>
        `<rect x="${i * 5}" y="${8 - i * 2.4}" width="3.2" height="${
          4 + i * 2.4
        }" rx=".9" opacity="${i < (S.signal ?? 4) ? 1 : 0.3}"/>`
    )
    .join("");
  const b = Math.max(0, Math.min(100, Math.round(battery)));
  const col = lowPower ? "#ffd60a" : b <= 20 ? "#ff453a" : "#fff";
  return `<div class="sbl"><span id="clk">${hm(
    now()
  )}</span></div><div class="sbr"><svg width="18" height="12" viewBox="0 0 18 12" fill="#fff">${sig}</svg><span class="net">${
    S.network || ""
  }</span><span class="bat"><svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="#fff" stroke-opacity=".4"/><rect x="2" y="2" width="${Math.max(
    1.5,
    (20 * b) / 100
  )}" height="9" rx="2.2" fill="${col}"/><path d="M25 4.6v3.8c.8-.3 1.4-1.1 1.4-1.9s-.6-1.6-1.4-1.9z" fill="#fff" fill-opacity=".4"/></svg><b>${b}</b></span></div>`;
}
const renderSB = () => {
  $("#sb").innerHTML = sbHTML();
};

/* ===================================================================== LOCK SCREEN */
let LIBW = null;
function librarySVG() {
  if (LIBW) return LIBW;
  let seed = 7;
  const r = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const pal = [
    "#7a2a24",
    "#2f4a3a",
    "#8a6a2a",
    "#3b2f55",
    "#5a3a22",
    "#9a7a3a",
    "#2a3c5a",
    "#6b1f2a",
    "#4a3020",
    "#7d5a2e",
  ];
  let s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 393 852' preserveAspectRatio='xMidYMid slice'><defs><radialGradient id='l' cx='.5' cy='.16' r='.85'><stop offset='0' stop-color='#ffd28a' stop-opacity='.6'/><stop offset='.45' stop-color='#b06a22' stop-opacity='.18'/><stop offset='1' stop-color='#000' stop-opacity='.35'/></radialGradient><linearGradient id='b' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#2c1b10'/><stop offset='1' stop-color='#0f0805'/></linearGradient></defs><rect width='393' height='852' fill='url(#b)'/>`;
  s += `<path d='M126 262V128a70 70 0 0 1 140 0v134z' fill='#f6cf86' opacity='.22'/><path d='M196 58v204M126 175h140' stroke='#2c1b10' stroke-width='5' opacity='.6'/>`;
  [330, 460, 590, 720, 850].forEach((y) => {
    let x = 6;
    while (x < 385) {
      const w = 8 + r() * 15,
        h = Math.min(112, 74 + r() * 40),
        lean = r() < 0.07;
      const c = pal[Math.floor(r() * pal.length)];
      s += `<rect x='${x.toFixed(1)}' y='${(y - h).toFixed(
        1
      )}' width='${w.toFixed(1)}' height='${h.toFixed(
        1
      )}' rx='1.5' fill='${c}'${
        lean ? ` transform='rotate(-8 ${x} ${y})'` : ""
      }/>`;
      if (r() < 0.45)
        s += `<rect x='${x.toFixed(1)}' y='${(y - h + 10).toFixed(
          1
        )}' width='${w.toFixed(1)}' height='2' fill='#d9b35a' opacity='.55'/>`;
      x += w + (r() < 0.12 ? 10 : 1.2);
    }
    s += `<rect x='0' y='${y}' width='393' height='9' fill='#3a2412'/><rect x='0' y='${y}' width='393' height='2' fill='#5c3a1c'/>`;
  });
  s += `<rect width='393' height='852' fill='url(#l)'/></svg>`;
  LIBW = `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
  return LIBW;
}
function wallCSS(kind) {
  const v = kind === "home" ? S.homeWallpaper : S.lockWallpaper;
  const dim =
    kind === "home" ? "linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.28)), " : "";
  if (v === "library") return `${dim}${librarySVG()} center/cover`;
  if (v && v !== "gradient") return `${dim}url('${v}') center/cover`;
  const w = S.wallpaper;
  return `radial-gradient(ellipse at 20% 15%, ${w[1]}cc, transparent 55%), radial-gradient(ellipse at 85% 80%, ${w[2]}dd, transparent 60%), linear-gradient(165deg, ${w[0]}, ${w[1]} 55%, ${w[2]})`;
}
function lockNt(n, i) {
  return `<button class="nt${
    n.more ? " stk" : ""
  }" onclick="lockTap(${i})">${appIc(
    n.app,
    38
  )}<span class="ntx"><span class="ntt"><b>${n.title}</b><span>${fAgo(
    n.time
  )}</span></span><span class="ntb">${n.text}</span>${
    n.more
      ? `<span class="ntm">${n.more} more notification${
          n.more > 1 ? "s" : ""
        }</span>`
      : ""
  }</span></button>`;
}
function renderLock() {
  let L = $("#lock");
  if (!L) {
    L = el("div", "lock");
    L.id = "lock";
    SCR.appendChild(L);
  }
  L.className = "lock";
  L.style.background = wallCSS("lock");
  const n = now();
  L.innerHTML = `<div class="lk-in"><div class="lk-pad" id="lkpad">${I(
    "lock",
    20
  )}</div><div class="lk-date">${WD[n.getDay()]} ${n.getDate()} ${
    MO[n.getMonth()]
  }</div><div class="lk-time" id="lktime">${hm(
    n
  )}</div><div class="lk-ns" id="lkns"></div><div class="lk-bot"><button class="lkb" id="flb" onclick="torch()">${I(
    "flash",
    22
  )}</button><button class="lkb" onclick="openApp('camera')">${I(
    "cam",
    22
  )}</button></div><button class="lk-sw" onclick="faceFail()">Swipe up to open</button></div>`;
  renderLockNs();
  lockSwipe(L);
}
function renderLockNs() {
  const b = $("#lkns");
  if (b) b.innerHTML = lockList.map(lockNt).join("");
}
function lockTap(i) {
  const n = lockList[i];
  if (n) {
    const t =
      n.app === "messages" &&
      S.threads.find((x) => strip(thName(x)) === strip(n.title));
    pendingGo =
      n.go ||
      (t
        ? { app: "messages", thread: t.id }
        : ["phone", "mail", "calendar"].includes(n.app)
        ? { app: n.app }
        : null);
  }
  faceFail();
}
let torchOn = false;
function torch() {
  torchOn = !torchOn;
  $("#flb").classList.toggle("on", torchOn);
  sfx("tick");
  vib(20);
}
function lockSwipe(L) {
  let y0 = null,
    dy = 0;
  L.onpointerdown = (e) => {
    if (e.target.closest("button")) return;
    y0 = e.clientY;
    dy = 0;
    const inn = $(".lk-in", L);
    inn.style.transition = "none";
    const mv = (ev) => {
      dy = Math.min(0, ev.clientY - y0);
      inn.style.transform = `translateY(${dy * 0.6}px)`;
      inn.style.opacity = 1 + dy / 500;
    };
    const up = () => {
      removeEventListener("pointermove", mv);
      removeEventListener("pointerup", up);
      inn.style.transition = "transform .3s, opacity .3s";
      inn.style.transform = "";
      inn.style.opacity = "";
      if (dy < -70) faceFail();
    };
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
  };
}
function faceFail() {
  if (state !== "lock") return;
  const p = $("#lkpad");
  if (p) {
    p.classList.remove("shake");
    p.getBoundingClientRect();
    p.classList.add("shake");
  }
  vib([30, 40, 30]);
  setTimeout(pass, 450);
}
/* passcode */
let pin = "",
  bad = 0;
function keypad(fn) {
  const L = ["", "", "ABC", "DEF", "GHI", "JKL", "MNO", "PQRS", "TUV", "WXYZ"];
  return `<div class="kp">${[1, 2, 3, 4, 5, 6, 7, 8, 9]
    .map(
      (d) =>
        `<button onclick="${fn}('${d}')"><span>${d}</span><small>${L[d]}</small></button>`
    )
    .join(
      ""
    )}<span></span><button onclick="${fn}('0')"><span>0</span><small></small></button><span></span></div>`;
}
function pass() {
  if (state !== "lock") return;
  state = "pass";
  pin = "";
  const L = $("#lock");
  const o = el("div", "pw");
  o.id = "pw";
  o.innerHTML = `<div class="pw-t" id="pwt">Enter Passcode</div><div class="dots" id="pd">${"<i></i>".repeat(
    S.passcode.length
  )}</div><div class="pw-h" id="pwh"></div>${keypad(
    "pkey"
  )}<div class="pw-b"><button>Emergency</button><button id="pwc" onclick="pdel()">Cancel</button></div>`;
  L.appendChild(o);
  $(".lk-in", L).classList.add("dim");
}
function pdots() {
  $$("#pd i").forEach((d, i) => d.classList.toggle("on", i < pin.length));
  const c = $("#pwc");
  if (c) c.textContent = pin ? "Delete" : "Cancel";
}
function pdel() {
  if (pin) {
    pin = pin.slice(0, -1);
    pdots();
    return;
  }
  $("#pw") && $("#pw").remove();
  $(".lk-in") && $(".lk-in").classList.remove("dim");
  state = "lock";
}
function pkey(d) {
  if (state !== "pass" || pin.length >= S.passcode.length) return;
  sfx("key");
  pin += d;
  pdots();
  if (pin.length < S.passcode.length) return;
  if (pin === S.passcode) {
    setTimeout(unlock, 160);
    return;
  }
  bad++;
  sfx("fail");
  const pd = $("#pd");
  pd.classList.add("shake");
  $("#pwt").textContent = "Wrong Passcode";
  if (bad >= (S.passHintAfter ?? 3) && S.passHint)
    $("#pwh").textContent = S.passHint;
  setTimeout(() => {
    pin = "";
    pdots();
    pd.classList.remove("shake");
  }, 450);
}
function unlock() {
  const first = !fired.unlock;
  state = "home";
  bad = 0;
  lockList = [];
  const L = $("#lock");
  if (L) {
    L.classList.add("out");
    setTimeout(() => L.remove(), 480);
  }
  PH.classList.remove("locked");
  if (!$("#home")) {
    const hm_ = el("div", "home");
    hm_.id = "home";
    SCR.insertBefore(hm_, SCR.firstChild);
  }
  renderHome();
  if (!W) {
    $("#home").classList.remove("behind");
    $("#home").classList.add("zin");
    setTimeout(() => $("#home") && $("#home").classList.remove("zin"), 600);
  }
  if (first) fired.unlock = Date.now();
  if (pendingGo) {
    const g = pendingGo;
    pendingGo = null;
    setTimeout(() => go(g), 350);
  }
}
function lockPhone() {
  // side button
  ac();
  if (state === "boot" || state === "end" || ended) return;
  if (CALL && CALL.st === "ring") {
    ringStop();
    return;
  }
  if (ALM) {
    alarmStop(true);
    return;
  }
  if (state === "off") {
    wake();
    return;
  }
  sfx("lock");
  if (finale) {
    darkEnd();
    return;
  }
  if (CALL) callEnd();
  kbClose(true);
  stopMedia();
  state = "off";
  PH.classList.add("locked");
  renderLock();
  $("#off").classList.add("on");
}
function wake() {
  if (state !== "off") return;
  state = "lock";
  renderLock();
  $("#off").classList.remove("on");
}

/* ===================================================================== HOME */
function badge(k) {
  if (k === "messages")
    return S.threads.reduce((a, t) => a + (t.unread || 0), 0);
  if (k === "phone")
    return (
      S.calls.filter(
        (c) => c.kind === "missed" && !c.viewed && ddiff(c.time) <= 0
      ).length + S.voicemails.filter((v) => !v.heard).length
    );
  if (k === "mail") return S.mails.filter((m) => m.unread).length;
  return 0;
}
function appIcon(k, dock) {
  const b = badge(k),
    [bg, gl] = APPI[k]();
  return `<button class="ap" data-app="${k}" onclick="openApp('${k}',this)"><span class="ai" style="background:${bg}">${gl}</span>${
    dock ? "" : `<span class="al">${APPN[k]}</span>`
  }${b ? `<span class="bd">${b}</span>` : ""}</button>`;
}
function calToday() {
  const n = now();
  return evOn(n).sort(
    (a, b) =>
      (a.allDay ? -1 : 1) - (b.allDay ? -1 : 1) || D(a.start) - D(b.start)
  );
}
function renderHome() {
  const H = $("#home");
  if (!H) return;
  H.style.background = wallCSS("home");
  const n = now(),
    wx = S.weather || {},
    ev = calToday()
      .filter((e) => e.allDay || D(e.end || e.start) > n)
      .slice(0, 2);
  H.innerHTML = `<div class="grid">
       <button class="wd wx" data-app="weather" onclick="openApp('weather',this)"><span class="ai wdi"></span><span class="wx-p">${
         wx.place
       } ${I("loc", 10)}</span><span class="wx-t">${
    wx.temp
  }°</span><span class="wx-c">☁️</span><span class="wx-s">${wx.cond}<br>H:${
    wx.hi
  }° L:${wx.lo}°</span></button>
       <button class="wd wc" data-app="calendar" onclick="openApp('calendar',this)"><span class="ai wdi"></span><span class="wc-d">${WD[
         n.getDay()
       ].toUpperCase()}</span><span class="wc-n">${n.getDate()}</span>${
    ev.length
      ? ev
          .map(
            (e) =>
              `<span class="wc-e"><b>${e.title}</b><span>${
                e.allDay ? "All day" : hm(e.start) + "–" + hm(e.end || e.start)
              }</span></span>`
          )
          .join("")
      : `<span class="wc-e"><span>No more events today</span></span>`
  }</button>
       ${[
         "mail",
         "calendar",
         "photos",
         "camera",
         "notes",
         "reminders",
         "clock",
         "maps",
         "findmy",
         "wallet",
         "voice",
         "settings",
       ]
         .map((k) => appIcon(k))
         .join("")}
     </div><div class="spot">${I(
       "search",
       13
     )} Search</div><div class="dock">${["phone", "safari", "messages", "music"]
    .map((k) => appIcon(k, true))
    .join("")}</div>`;
}
function goHome() {
  if ((state === "lock" || state === "pass") && W) {
    closeApp();
    return;
  }
  if (state === "lock") {
    faceFail();
    return;
  }
  if (state !== "home") return;
  if (KB) {
    kbClose();
  }
  if (W) closeApp();
}

/* ===================================================================== NOTIFICATIONS */
let bnT = 0;
function notify(n) {
  if (ended) return;
  if (state === "lock" || state === "pass" || state === "off") {
    lockList.unshift({ ...n, time: stamp(now()) });
    if (state === "off") wake();
    else renderLockNs();
    sfx(n.sound || "notif");
    return;
  }
  sfx(n.sound || "notif");
  const box = $("#bns");
  box.innerHTML = "";
  const b = el("button", "bn");
  b.innerHTML = `${appIc(n.app, 38)}<span class="ntx"><span class="ntt"><b>${
    n.title
  }</b><span>now</span></span><span class="ntb">${n.text}</span></span>`;
  let y0 = null,
    dy = 0;
  b.onpointerdown = (e) => {
    y0 = e.clientY;
    dy = 0;
  };
  b.onpointermove = (e) => {
    if (y0 == null) return;
    dy = Math.min(0, e.clientY - y0);
    b.style.transform = `translateY(${dy}px)`;
  };
  b.onpointerup = () => {
    if (dy < -25) {
      b.classList.add("out");
      setTimeout(() => b.remove(), 280);
    } else b.style.transform = "";
    y0 = null;
  };
  b.onclick = () => {
    if (dy < -5) return;
    b.remove();
    if (n.go) go(n.go);
  };
  box.appendChild(b);
  clearTimeout(bnT);
  bnT = setTimeout(() => {
    b.classList.add("out");
    setTimeout(() => b.remove(), 300);
  }, 5200);
}
function go(g) {
  if (state !== "home") {
    pendingGo = g;
    if (state === "lock") faceFail();
    return;
  }
  if (CALL || ended) return;
  const deep = () => {
    if (g.thread) push(threadPage, [g.thread], false);
    else if (g.mail) push(mailView, [g.mail], false);
  };
  if (g.app === "phone" && g.vm) phTab = "vm";
  if (g.app === "phone" && !g.vm) phTab = "recents";
  if (W && W.app === g.app) {
    while (W.stack.length > (g.app === "mail" || g.app === "notes" ? 2 : 1)) {
      const t = W.stack.pop();
      t.el.remove();
    }
    topP().el.classList.remove("hid");
    rerender(topP());
    if (g.thread) push(threadPage, [g.thread]);
    return;
  }
  openApp(g.app, null, deep);
}
function alertBox(o) {
  const a = el("div", "alw");
  a.innerHTML = `<div class="alb pop"><div class="alt">${o.title}</div>${
    o.msg ? `<div class="alm">${o.msg}</div>` : ""
  }${
    o.input
      ? `<input class="ali" id="ali" type="password" autocomplete="off" placeholder="${o.input}">`
      : ""
  }<div class="albs${o.btns.length > 2 ? " v" : ""}">${o.btns
    .map(
      (b, i) =>
        `<button class="${b.b ? "b" : ""}${
          b.red ? " red" : ""
        }" data-i="${i}">${b.t}</button>`
    )
    .join("")}</div></div>`;
  $$("button", a).forEach(
    (b) =>
      (b.onclick = () => {
        const x = o.btns[+b.dataset.i];
        if (!x.keep) a.remove();
        x.fn && x.fn(a);
      })
  );
  PH.appendChild(a);
  if (o.input)
    setTimeout(() => {
      const i = $("#ali");
      i && i.focus();
      i &&
        (i.onkeydown = (e) => {
          if (e.key === "Enter") {
            const ok_ = o.btns.find((b) => b.b);
            ok_ && ok_.fn && ok_.fn(a);
          }
        });
    }, 50);
  return a;
}
function sheet(opts) {
  const a = el("div", "shw");
  a.innerHTML = `<div class="sh pop-up"><div class="shg">${
    opts.title ? `<div class="sht">${opts.title}</div>` : ""
  }${opts.btns
    .map(
      (b, i) =>
        `<button data-i="${i}" class="${b.red ? "red" : ""}">${b.t}</button>`
    )
    .join(
      ""
    )}</div><div class="shg"><button class="b" data-i="-1">Cancel</button></div></div>`;
  $$("button", a).forEach(
    (b) =>
      (b.onclick = () => {
        a.remove();
        const i = +b.dataset.i;
        if (i >= 0 && opts.btns[i].fn) opts.btns[i].fn();
      })
  );
  a.onclick = (e) => {
    if (e.target === a) a.remove();
  };
  PH.appendChild(a);
}
function toast(t) {
  const d = el("div", "toast pop", t);
  PH.appendChild(d);
  setTimeout(() => d.remove(), 1700);
}

/* ===================================================================== DYNAMIC ISLAND */
function islandOpen(html, kind) {
  const i = $("#isl");
  i.className = "isl x " + kind;
  i.innerHTML = `<div class="isw">${html}</div>`;
}
function islandClose() {
  const i = $("#isl");
  if (i.classList.contains("x")) {
    i.className = "isl";
    i.innerHTML = "";
  }
}
function islandPill(html, ms = 1700) {
  const i = $("#isl");
  if (i.classList.contains("x")) return;
  i.className = "isl p";
  i.innerHTML = `<div class="isw">${html}</div>`;
  clearTimeout(i._t);
  i._t = setTimeout(() => {
    if (i.classList.contains("p")) {
      i.className = "isl";
      i.innerHTML = "";
    }
  }, ms);
}
function toggleSilent() {
  ac();
  silent = !silent;
  sfx("tick");
  vib(40);
  islandPill(
    `<span class="sil${silent ? " on" : ""}">${I(
      silent ? "bellx" : "bell",
      17
    )}</span><span>${silent ? "Silent Mode" : "Ring"}</span>`
  );
  if (W && topP() && topP().fn === soundsPage) rerender(topP());
}

/* ===================================================================== MESSAGES */
let msgFilter = "";
function msgsRoot() {
  const ts = S.threads.slice().sort((a, b) => lastTime(b) - lastTime(a));
  const pins = ts.filter((t) => t.pinned),
    rest = ts.filter((t) => !t.pinned);
  const body = `${
    pins.length
      ? `<div class="pins">${pins
          .map(
            (t) =>
              `<button class="pin" onclick="openThread('${
                t.id
              }')"><span class="pinav">${avt(t, 70)}${
                t.unread ? '<i class="ud"></i>' : ""
              }</span><span>${strip(thName(t))}</span></button>`
          )
          .join("")}</div>`
      : ""
  }<div class="mlist">${rest.map(mrow).join("")}</div>`;
  const dl = S.deletedMsgs,
    badge = dl && seen.has(dl.badgeAfter) && !seen.has("x:deleted");
  return {
    title: "Messages",
    html: pg({
      title: "Messages",
      left: `<button class="nbl" onclick="push(filtersPage)">Filters${
        badge ? '<i class="fdot"></i>' : ""
      }</button>`,
      right: `<button class="nbi">${I("compose", 25)}</button>`,
      body,
      search: true,
    }),
  };
}
function filtersPage() {
  const dl = S.deletedMsgs || { items: [] },
    badge = seen.has(dl.badgeAfter) && !seen.has("x:deleted");
  const r = (ic, l, fn, extra) =>
    `<button class="row" onclick="${
      fn || "goBack()"
    }"><span class="rico blue">${I(
      ic,
      20
    )}</span><span class="rl">${l}</span><span class="rv">${
      extra || ""
    }</span>${I("chev", 13, "color:#5a5a5e")}</button>`;
  return {
    title: "Filters",
    html: pg({
      title: "Filters",
      body: `<div class="grp">${r("msg", "All Messages")}${r(
        "person",
        "Known Senders"
      )}${r("person", "Unknown Senders")}${r(
        "msg",
        "Unread Messages"
      )}</div><div class="grp">${r(
        "trash",
        "Recently Deleted",
        "push(deletedPage)",
        badge ? `<span class="cnt">${dl.items.length}</span>` : ""
      )}</div>`,
      scls: "gbg",
    }),
  };
}
function deletedPage() {
  see("x:deleted");
  const it = (S.deletedMsgs || { items: [] }).items
    .slice()
    .sort((a, b) => D(b.deleted) - D(a.deleted));
  const left = (d) => Math.max(1, 30 - ddiff(d));
  return {
    title: "Recently Deleted",
    cls: "nolt",
    html: pg({
      title: "Recently Deleted",
      large: true,
      body: `<div class="pnote">Messages show the days remaining before deletion. After that, they’ll be permanently deleted.</div><div class="plain">${it
        .map(
          (m) =>
            `<div class="mrow dl">${av(
              m.who,
              44
            )}<span class="mx"><span class="mt"><b>${nm(
              m.who
            )}</b><span class="tm">${left(
              m.deleted
            )} days</span></span><span class="mp">${
              m.text
            }</span><span class="dlt">Sent ${fList(m.time)} ${
              fDay(m.time) === "Today" || fDay(m.time) === "Yesterday" ? "" : ""
            }· deleted ${fDay(m.deleted)} at ${hm(
              m.deleted
            )}</span></span></div>`
        )
        .join("")}</div>`,
      scls: "gbg",
    }),
  };
}
function mrow(t) {
  const m = lastMsg(t);
  let pv = m ? (m[2] && m[2].photo ? "Image" : strip(m[1])) : "";
  if (t.with.length > 1 && m && m[0] !== "me") pv = first(m[0]) + ": " + pv;
  return `<button class="mrow" onclick="openThread('${t.id}')"><i class="${
    t.unread ? "ud" : "ud0"
  }"></i>${avt(t, 44)}<span class="mx"><span class="mt"><b>${thName(
    t
  )}</b><span class="tm">${fList(lastTime(t))} ${I(
    "chev",
    12
  )}</span></span><span class="mp">${pv}</span></span></button>`;
}
function openThread(id) {
  if (W && W.app === "messages") push(threadPage, [id]);
  else openApp("messages", null, () => push(threadPage, [id], false));
}
const isViewing = (id) =>
  state === "home" &&
  W &&
  W.app === "messages" &&
  topP() &&
  topP().fn === threadPage &&
  topP().args[0] === id;
function nb(t, i, dir) {
  for (let j = i + dir; j >= 0 && j < t.msgs.length; j += dir) {
    const m = t.msgs[j];
    if (m[0] === "~") return null;
    return m;
  }
  return null;
}
const isEmo = (s) =>
  /^(?:\p{Extended_Pictographic}[️‍\p{Extended_Pictographic}]*\s*){1,3}$/u.test(
    String(s).trim()
  );
function bub(t, i) {
  const m = t.msgs[i];
  if (m[0] === "~")
    return `<div class="dv">${D(m[1]) ? fDiv(m[1]) : m[1]}</div>`;
  const multi = t.with.length > 1,
    me = m[0] === "me",
    who = me ? "me" : multi ? m[0] : t.with[0];
  const pr = nb(t, i, -1),
    nx = nb(t, i, 1),
    sameP = pr && pr[0] === m[0],
    sameN = nx && nx[0] === m[0];
  const photo = m[2] && m[2].photo;
  const emo = !photo && isEmo(m[1]);
  let s = "";
  if (multi && !me && !sameP) s += `<div class="sn">${first(who)}</div>`;
  let b = `<div class="b ${me ? "me" : "them"}${!sameN ? " tl" : ""}${
    sameP ? " gp" : ""
  }${emo ? " emo" : ""}${photo ? " pb" : ""}">${
    photo ? scene(photo, "bp") : m[1]
  }</div>`;
  if (m[2] && m[2].edited)
    b = `<div class="edw${me ? " me" : ""}"><div class="b ${
      me ? "me" : "them"
    } old">${
      m[2].edited
    }</div>${b}<button class="edl" onclick="this.parentNode.classList.toggle('open');see('x:edit')">Edited</button></div>`;
  s +=
    multi && !me
      ? `<div class="gr">${
          !sameN ? av(who, 28) : '<span class="avsp"></span>'
        }${b}</div>`
      : b;
  return s;
}
function rcHTML(t) {
  const m = lastMsg(t);
  return m && m[0] === "me" && t.with.length === 1
    ? `<div class="rc">${t.receipt || "Delivered"}</div>`
    : "";
}
const typHTML = (t) =>
  t.typing
    ? `<div class="gr typr">${
        t.with.length > 1 ? '<span class="avsp"></span>' : ""
      }<div class="typ"><i></i><i></i><i></i></div></div>`
    : "";
function threadHTML(t) {
  return (
    t.msgs.map((_, j) => bub(t, j)).join("") +
    rcHTML(t) +
    typHTML(t) +
    '<div class="mpad"></div>'
  );
}
function threadPage(id) {
  const t = TH(id);
  t.unread = 0;
  see("t:" + id);
  const others = S.threads.reduce(
    (a, x) => a + (x.id !== id ? x.unread || 0 : 0),
    0
  );
  const head = `<div class="nbw thnb"><div class="nb"><button class="bk" onclick="goBack()">${I(
    "back",
    22
  )}${
    others ? `<span class="bkc">${others}</span>` : ""
  }</button><button class="thw" onclick="${
    t.with.length === 1 ? `push(contactPage,['${t.with[0]}'])` : ""
  }">${avt(t, 50)}<span>${thName(t)} ${I(
    "chev",
    9
  )}</span></button><div class="nbr"><button class="nbi">${I(
    "video",
    27
  )}</button></div></div></div>`;
  return {
    title: strip(thName(t)),
    cls: "thp nolt",
    keepBottom: true,
    html: `${head}<div class="sc msgs" id="msgs-${id}">${threadHTML(
      t
    )}</div>${inputBar(t)}`,
    mount(e) {
      const sc = $(".sc", e);
      sc.scrollTop = sc.scrollHeight;
      badgesRefresh();
    },
  };
}
function inputBar(t) {
  const r = finale && ((S.finale || {}).replies || {})[t.id];
  const dr = !r && t.draft;
  return `<div class="ib"><button class="ibp">${I(
    "plus",
    20
  )}</button><div class="ibf${r ? " live" : ""}${dr ? " has" : ""}" ${
    r ? `onclick="kbOpen('${t.id}')"` : dr ? `onclick="see('x:draft')"` : ""
  }><span class="ibt">${
    dr ? t.draft : ""
  }</span><span class="ibph">iMessage</span><span class="ibm">${I(
    "mic",
    17
  )}</span><button class="ibs" onclick="event.stopPropagation();sendReply('${
    t.id
  }')">${I("up", 17)}</button></div></div>`;
}
function updInput() {
  const t = topP();
  if (!t || t.fn !== threadPage) return;
  const ib = $(".ib", t.el);
  if (ib && !KB) ib.outerHTML = inputBar(TH(t.args[0]));
}
function redrawThread(t, animLast) {
  const sc = $(`#msgs-${t.id}`);
  if (!sc) return;
  const atB = sc.scrollHeight - sc.scrollTop - sc.clientHeight < 160;
  sc.innerHTML = threadHTML(t);
  if (animLast) {
    const bs = $$(".b", sc);
    bs.length && bs[bs.length - 1].classList.add("in");
  }
  if (atB) sc.scrollTop = sc.scrollHeight;
}
function deliver(tid, list) {
  const t = TH(tid);
  if (!t) return;
  t.q = (t.q || []).concat(list.map((x) => x.slice()));
  pump(t);
}
function pump(t) {
  if (t.busy || !t.q.length) return;
  t.busy = 1;
  const m = t.q[0],
    len = strip(m[1]).length;
  const wait = m[0] === "me" ? 400 : Math.min(3400, 1000 + len * 38);
  if (isViewing(t.id) && m[0] !== "me") showTyping(t, true);
  setTimeout(() => {
    t.q.shift();
    t.typing = false;
    arrive(t, m);
    t.busy = 0;
    setTimeout(() => pump(t), 700);
  }, wait);
}
function arrive(t, m) {
  const lt = lastTime(t),
    n = now();
  if (n - lt > 15 * 6e4) t.msgs.push(["~", stamp(n)]);
  t.msgs.push(m);
  const v = isViewing(t.id);
  if (v) redrawThread(t, true);
  if (m[0] !== "me") {
    if (v) sfx("recv");
    else {
      t.unread = (t.unread || 0) + 1;
      const pre = t.with.length > 1 ? first(m[0]) + ": " : "";
      notify({
        app: "messages",
        title: thName(t),
        text: pre + strip(m[1]),
        go: { app: "messages", thread: t.id },
        sound: "text",
      });
    }
  }
  badgesRefresh();
  if (W && W.app === "messages" && topP().fn === msgsRoot) rerender(topP());
}
function showTyping(t, on) {
  t.typing = on;
  if (isViewing(t.id)) redrawThread(t);
}
function badgesRefresh() {
  if (state === "home" && !W) renderHome();
  const bk = W && topP() && topP().fn === threadPage && $(".bkc", topP().el);
  if (W && topP() && topP().fn === threadPage) {
    const id = topP().args[0],
      o = S.threads.reduce((a, x) => a + (x.id !== id ? x.unread || 0 : 0), 0);
    const b = $(".bk", topP().el);
    if (b) {
      const c = $(".bkc", b);
      if (o) {
        if (c) c.textContent = o;
        else b.insertAdjacentHTML("beforeend", `<span class="bkc">${o}</span>`);
      } else if (c) c.remove();
    }
  }
  void bk;
}
/* keyboard for the finale */
let KB = null;
const KROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
function kbOpen(tid) {
  const r = finale && S.finale.replies[tid];
  if (!r || KB) return;
  KB = { tid, text: r.text, i: 0 };
  const pgEl = topP().el;
  pgEl.classList.add("kbon");
  const k = el("div", "kb");
  k.innerHTML = `<div class="qt"><button onclick="kbFill()">“${strip(r.text)
    .split(" ")
    .slice(0, 4)
    .join(" ")}…”</button></div><div class="kr">${[...KROWS[0]]
    .map((c) => `<button onclick="kbKey()">${c}</button>`)
    .join("")}</div><div class="kr r2">${[...KROWS[1]]
    .map((c) => `<button onclick="kbKey()">${c}</button>`)
    .join(
      ""
    )}</div><div class="kr"><button class="fn" onclick="kbKey()">⇧</button>${[
    ...KROWS[2],
  ]
    .map((c) => `<button onclick="kbKey()">${c}</button>`)
    .join(
      ""
    )}<button class="fn" onclick="kbKey()">⌫</button></div><div class="kr"><button class="fn w" onclick="kbKey()">123</button><button class="fn" onclick="kbKey()">☺</button><button class="sp" onclick="kbKey()">space</button><button class="fn w" onclick="kbKey()">return</button></div>`;
  pgEl.appendChild(k);
  requestAnimationFrame(() => k.classList.add("on"));
  const sc = $(".sc", pgEl);
  setTimeout(() => (sc.scrollTop = sc.scrollHeight), 320);
}
function kbKey() {
  if (!KB) return;
  sfx("kb");
  const t = KB.text;
  if (KB.i >= t.length) return;
  let j = t.indexOf(" ", KB.i + 1);
  KB.i = j < 0 ? t.length : j + 1;
  updField();
}
function kbFill() {
  if (!KB) return;
  sfx("kb");
  KB.i = KB.text.length;
  updField();
}
function updField() {
  const f = $(".ibf", topP().el);
  if (!f) return;
  $(".ibt", f).textContent = KB.text.slice(0, KB.i);
  f.classList.toggle("has", KB.i > 0);
  f.classList.toggle("full", KB.i >= KB.text.length);
}
function kbClose(silentClose) {
  if (!KB) return;
  KB = null;
  const k = $(".kb");
  if (k) {
    if (silentClose) k.remove();
    else {
      k.classList.remove("on");
      setTimeout(() => k.remove(), 260);
    }
  }
  $$(".kbon").forEach((x) => x.classList.remove("kbon"));
}
function sendReply(tid) {
  if (!KB || KB.i < KB.text.length || KB.tid !== tid) return;
  const r = S.finale.replies[tid],
    t = TH(tid);
  kbClose();
  finale = false;
  sfx("send");
  t.receipt = "Delivered";
  arrive(t, ["me", r.text]);
  updInput();
  setTimeout(() => {
    t.receipt = "Read " + hm(now());
    if (isViewing(tid)) redrawThread(t);
  }, 1800);
  setTimeout(() => showTyping(t, true), 2700);
  setTimeout(() => {
    showTyping(t, false);
    if (r.answer)
      deliver(
        tid,
        r.answer.map((x) => ["them", x])
      );
  }, 6200);
  setTimeout(
    () => ending(r.end),
    8200 + (r.answer ? r.answer.length * 2600 : 0)
  );
}

/* ===================================================================== PHONE */
let phTab = "recents",
  recF = "all",
  vmOpen = null,
  dialed = "";
function phTabGo(k) {
  phTab = k;
  replace(phoneRoot);
}
const vmNew = () => S.voicemails.filter((v) => !v.heard).length;
function phoneRoot() {
  const tb = tabbar(
    [
      ["fav", "Favourites", "star"],
      ["recents", "Recents", "clock"],
      ["contacts", "Contacts", "person"],
      ["keypad", "Keypad", "keypad"],
      ["vm", "Voicemail", "vm", vmNew()],
    ],
    phTab,
    "phTabGo"
  );
  if (phTab === "recents") {
    const cs = S.calls
      .slice()
      .sort((a, b) => D(b.time) - D(a.time))
      .filter((c) => recF === "all" || c.kind === "missed");
    const g = [];
    for (const c of cs) {
      const l = g[g.length - 1];
      if (
        l &&
        l.who === c.who &&
        l.kind === c.kind &&
        ddiff(l.time) === ddiff(c.time)
      )
        l.n++;
      else g.push({ ...c, n: 1 });
    }
    setTimeout(() => S.calls.forEach((c) => (c.viewed = true)), 50);
    const body = `<div class="plain">${g
      .map(
        (c) =>
          `<div class="crow"><button class="cx" onclick="dial('${
            c.who
          }')"><span class="cn${c.kind === "missed" ? " red" : ""}">${nm(
            c.who
          )}${c.n > 1 ? ` (${c.n})` : ""}</span><span class="cs">${
            c.kind === "out" ? I("phone", 11) + " " : ""
          }mobile</span></button><span class="ct">${fList(
            c.time
          )}</span><button class="ci" onclick="push(contactPage,['${
            c.who
          }'])">${I("info", 23)}</button></div>`
      )
      .join("")}</div>`;
    return {
      title: "Recents",
      html: pg({
        title: "Recents",
        left: `<button class="nbl">Edit</button>`,
        sub: `<div class="seg"><button class="${
          recF === "all" ? "on" : ""
        }" onclick="recF='all';replace(phoneRoot)">All</button><button class="${
          recF === "missed" ? "on" : ""
        }" onclick="recF='missed';replace(phoneRoot)">Missed</button></div>`,
        body,
        tab: tb,
        large: true,
      }),
      cls: "hasseg",
    };
  }
  if (phTab === "fav") {
    const fs = Object.keys(S.contacts).filter((k) => S.contacts[k].fav);
    return {
      title: "Favourites",
      html: pg({
        title: "Favourites",
        left: `<button class="nbl">Edit</button>`,
        right: `<button class="nbi">${I("plus", 22)}</button>`,
        body: `<div class="plain">${fs
          .map(
            (c) =>
              `<div class="crow fv">${av(
                c,
                40
              )}<button class="cx" onclick="dial('${c}')"><span class="cn">${nm(
                c
              )}</span><span class="cs">${I(
                "phone",
                11
              )} mobile</span></button><button class="ci" onclick="push(contactPage,['${c}'])">${I(
                "info",
                23
              )}</button></div>`
          )
          .join("")}</div>`,
        tab: tb,
      }),
    };
  }
  if (phTab === "contacts") {
    const cs = Object.keys(S.contacts).sort((a, b) =>
      strip(nm(a)).localeCompare(strip(nm(b)))
    );
    return {
      title: "Contacts",
      html: pg({
        title: "Contacts",
        left: `<span></span>`,
        right: `<button class="nbi">${I("plus", 22)}</button>`,
        search: true,
        body: `<button class="mycard">${av("me", 60)}<span><b>${
          S.owner
        }</b><small>My Card</small></span></button><div class="plain">${cs
          .map(
            (c) =>
              `<button class="lrow" onclick="push(contactPage,['${c}'])">${
                CT(c).full
                  ? `${strip(nm(c))} <span class="l2">· ${CT(c).full}</span>`
                  : nm(c)
              }</button>`
          )
          .join("")}</div>`,
        tab: tb,
      }),
    };
  }
  if (phTab === "keypad") {
    return {
      title: "Keypad",
      cls: "nolt",
      html: pg({
        title: "",
        noNav: true,
        large: false,
        scls: "kpage",
        body: `<div class="kdisp" id="kdisp">${dialed}</div>${keypad(
          "dkey"
        ).replace(
          'class="kp"',
          'class="kp dk"'
        )}<div class="kcall"><span></span><button class="cbig green" onclick="dialed&&callFail(null,dialed)">${I(
          "phone",
          32
        )}</button><button class="kdel${
          dialed ? "" : " hidden"
        }" onclick="dialed=dialed.slice(0,-1);replace(phoneRoot)">⌫</button></div>`,
        tab: tb,
      }),
    };
  }
  const vms = S.voicemails.slice().sort((a, b) => D(b.time) - D(a.time));
  return {
    title: "Voicemail",
    html: pg({
      title: "Voicemail",
      left: `<button class="nbl">Greeting</button>`,
      right: `<button class="nbl">Edit</button>`,
      body: `<div class="plain">${vms.map(vmRow).join("")}</div>`,
      tab: tb,
    }),
  };
}
function dkey(d) {
  dtmf(d);
  dialed = (dialed + d).slice(0, 15);
  const k = $("#kdisp");
  if (k) k.textContent = dialed;
  $(".kdel") && $(".kdel").classList.remove("hidden");
}
function vmRow(v) {
  const o = vmOpen === v.id,
    playing = MED && MED.id === v.id;
  return `<div class="vrow${o ? " open" : ""}" data-med="vm-${
    v.id
  }"><button class="vh" onclick="vmTap('${v.id}')"><i class="${
    v.heard ? "ud0" : "ud"
  }"></i><span class="vx"><span class="mt"><b>${nm(
    v.who
  )}</b><span class="tm">${fList(
    v.time
  )}</span></span><span class="vs">mobile<span>${
    v.len
  }</span></span></span></button>${
    o
      ? `<div class="vb"><div class="prg"><i></i></div><div class="vt"><span class="t0">0:00</span><span>-${
          v.len
        }</span></div><div class="vc"><button class="vbtn" onclick="vmPlay('${
          v.id
        }')">${I(
          playing ? "pause" : "play",
          26
        )}</button><button class="vbtn sm">${I(
          "spk",
          22
        )}</button><button class="vbtn sm" onclick="dial('${v.who}')">${I(
          "phone",
          20
        )}</button><button class="vbtn sm red">${I(
          "trash",
          21
        )}</button></div><div class="vtr"><small>Transcription</small><p>${words(
          v.text
        )}</p></div></div>`
      : ""
  }</div>`;
}
function vmTap(id) {
  vmOpen = vmOpen === id ? null : id;
  const v = S.voicemails.find((x) => x.id === id);
  if (vmOpen) {
    v.heard = true;
    see("v:" + id);
  }
  if (!vmOpen) stopMedia();
  rerender(topP());
}
function vmPlay(id) {
  const v = S.voicemails.find((x) => x.id === id);
  playMedia("vm", id, v.len, "room");
  rerender(topP());
}
const words = (t) =>
  strip(t)
    .split(/(\s+)/)
    .map((w) => (/\s/.test(w) ? w : `<span class="tw">${w}</span>`))
    .join("");
function contactPage(c) {
  const ct = CT(c),
    calls = S.calls
      .filter((x) => x.who === c)
      .sort((a, b) => D(b.time) - D(a.time))
      .slice(0, 4),
    th = threadFor(c);
  const body = `<div class="cp">${av(c, 104)}<h2>${
    ct.full ? `${ct.full}` : nm(c)
  }</h2>${
    ct.full ? `<div class="l2">${nm(c)}</div>` : ""
  }<div class="cpb"><button onclick="${th ? `openThread('${th.id}')` : ""}">${I(
    "msg",
    22
  )}<span>message</span></button><button onclick="dial('${c}')">${I(
    "phone",
    22
  )}<span>call</span></button><button>${I(
    "video",
    22
  )}<span>video</span></button><button>${I(
    "mail",
    22
  )}<span>mail</span></button></div></div>${
    calls.length
      ? `<div class="grp"><div class="row col"><small>${fDay(
          calls[0].time
        )}</small>${calls
          .map(
            (x) =>
              `<span class="cph">${hm(x.time)} <span class="${
                x.kind === "missed" ? "red" : ""
              }">${
                x.kind === "missed"
                  ? "Missed Call"
                  : x.kind === "out"
                  ? "Outgoing Call"
                  : "Incoming Call"
              }</span><span class="l2">${x.len || ""}</span></span>`
          )
          .join("")}</div></div>`
      : ""
  }<div class="grp"><div class="row col"><small>mobile</small><span class="blue">${
    ct.num || "+33 6 •• •• •• ••"
  }</span></div></div>${
    ct.notes
      ? `<div class="grp"><div class="row col"><small>Notes</small><span>${ct.notes}</span></div></div>`
      : ""
  }<div class="grp"><button class="row blue">Send Message</button><button class="row blue">Share Contact</button><button class="row blue">Add to Favourites</button></div>`;
  return {
    title: strip(nm(c)),
    cls: "nolt",
    html: pg({
      title: "",
      large: false,
      right: `<button class="nbl">Edit</button>`,
      body,
    }),
  };
}
function dial(who) {
  callFail(who);
}

/* ===================================================================== CALLS */
let CALL = null;
function callOv() {
  let o = $("#call");
  if (!o) {
    o = el("div", "call");
    o.id = "call";
    PH.appendChild(o);
  }
  o.className = "call";
  return o;
}
function incoming(c, evId) {
  if (CALL) return;
  CALL = { ...c, evId, st: "ring" };
  ringStart();
  if (state === "home") islandCall();
  else {
    if (state === "off") wake();
    fullCall();
  }
  CALL.to = setTimeout(() => callMissed(), c.ring || 25000);
}
function islandCall() {
  const c = CALL;
  islandOpen(
    `<div class="isc">${av(
      c.who,
      44
    )}<button class="isn" onclick="fullCall()"><small>mobile</small><b>${nm(
      c.who
    )}</b></button><button class="cr red" onclick="callDecline()">${I(
      "phone",
      24,
      "transform:rotate(135deg)"
    )}</button><button class="cr green" onclick="callAccept()">${I(
      "phone",
      24
    )}</button></div>`,
    "icall"
  );
}
function fullCall() {
  if (!CALL) return;
  islandClose();
  const o = callOv();
  o.innerHTML = `<div class="cl-top"><div class="cl-s">mobile</div><div class="cl-n">${nm(
    CALL.who
  )}</div></div><div class="cl-mid"></div><div class="cl-bot"><div class="cl-row sm"><button>${I(
    "clock",
    26
  )}<span>Remind Me</span></button><button>${I(
    "msg",
    26
  )}<span>Message</span></button></div><div class="cl-row"><button class="cbig red" onclick="callDecline()">${I(
    "phone",
    34,
    "transform:rotate(135deg)"
  )}<span>Decline</span></button><button class="cbig green" onclick="callAccept()">${I(
    "phone",
    34
  )}<span>Accept</span></button></div></div>`;
}
const callGrid = () =>
  `<div class="cl-grid">${[
    ["mute", "mute"],
    ["keypad", "keypad"],
    ["spk", "audio"],
    ["add", "add call"],
    ["video", "FaceTime"],
    ["person", "contacts"],
  ]
    .map(([i, l]) => `<button class="cg">${I(i, 28)}<span>${l}</span></button>`)
    .join("")}</div>`;
function callAccept() {
  const c = CALL;
  if (!c || c.st !== "ring") return;
  clearTimeout(c.to);
  ringStop();
  islandClose();
  c.st = "talk";
  c.t0 = Date.now();
  if (c.flag) flags[c.flag] = "answered";
  sfx("connect");
  bedStart("sea");
  const o = callOv();
  o.classList.add("talk");
  o.innerHTML = `<div class="cl-top"><div class="cl-n">${nm(
    c.who
  )}</div><div class="cl-s" id="cls">00:00</div></div><div class="cl-mid"><div class="cap"><div class="capl">${I(
    "quote",
    13
  )} Live Captions</div><div class="capb" id="capb"></div></div></div><div class="cl-bot">${callGrid()}<button class="cbig red hang" onclick="callEnd()">${I(
    "phone",
    34,
    "transform:rotate(135deg)"
  )}</button></div>`;
  c.iv = setInterval(() => {
    const s = Math.floor((Date.now() - c.t0) / 1000),
      e = $("#cls");
    if (e) e.textContent = p2(Math.floor(s / 60)) + ":" + p2(s % 60);
  }, 500);
  const lines = c.talk && c.talk.length ? c.talk : ["(silence)"];
  let n = 0;
  const nx = () => {
    if (CALL !== c) return;
    if (n < lines.length) {
      const b = $("#capb");
      if (b) {
        b.insertAdjacentHTML("beforeend", `<p class="in">${lines[n++]}</p>`);
        b.scrollTop = b.scrollHeight;
      }
      c.lt = setTimeout(nx, 2900);
    } else c.lt = setTimeout(() => callEnd(), 2600);
  };
  c.lt = setTimeout(nx, 900);
}
function callDecline() {
  if (CALL && CALL.st === "ring") callMissed();
}
function callMissed() {
  const c = CALL;
  if (!c) return;
  clearTimeout(c.to);
  ringStop();
  islandClose();
  $("#call") && $("#call").remove();
  CALL = null;
  if (c.flag) flags[c.flag] = "missed";
  S.calls.push({ who: c.who, kind: "missed", time: stamp(now()) });
  notify({
    app: "phone",
    title: "Missed Call",
    text: nm(c.who),
    go: { app: "phone" },
  });
  if (c.vm)
    setTimeout(() => {
      S.voicemails.push({
        id: "vlive" + Date.now(),
        who: c.who,
        time: stamp(now()),
        len: durF(Math.max(8, strip(c.vm).split(/\s+/).length * 0.42)),
        text: c.vm,
      });
      notify({
        app: "phone",
        title: "Voicemail",
        text: `${nm(c.who)} left a voicemail`,
        go: { app: "phone", vm: 1 },
      });
      refresh();
    }, 5500);
  callDone(c);
}
function callEnd() {
  const c = CALL;
  if (!c) return;
  clearInterval(c.iv);
  clearTimeout(c.to);
  clearTimeout(c.lt);
  bedStop();
  sfx("end");
  const o = $("#call");
  if (o) {
    const s = $("#cls", o);
    if (s) s.textContent = "Call Ended";
    o.classList.add("ending");
    setTimeout(() => o.remove(), 1200);
  }
  CALL = null;
  if (c.st === "talk")
    S.calls.push({
      who: c.who,
      kind: "in",
      time: stamp(now()),
      len:
        Math.max(1, Math.round((Date.now() - c.t0) / 6e4)) +
        " minute" +
        (Math.round((Date.now() - c.t0) / 6e4) > 1 ? "s" : ""),
    });
  callDone(c);
}
function callDone(c) {
  if (c.evId) {
    fired[c.evId] = Date.now();
  }
  refresh();
}
function callFail(who, num) {
  if (CALL) return;
  const o = callOv();
  o.classList.add("talk");
  o.innerHTML = `<div class="cl-top"><div class="cl-n">${
    who ? nm(who) : num
  }</div><div class="cl-s" id="cls">calling mobile…</div></div><div class="cl-mid"></div><div class="cl-bot">${callGrid()}<button class="cbig red hang" onclick="$('#call').remove()">${I(
    "phone",
    34,
    "transform:rotate(135deg)"
  )}</button></div>`;
  sfx("connect");
  setTimeout(() => {
    if (!$("#call") || CALL) return;
    $("#cls").textContent = "Call Failed";
    sfx("sit");
    $(
      ".cl-bot",
      o
    ).innerHTML = `<div class="cl-row"><button class="cbig grey" onclick="$('#call').remove()">${I(
      "x",
      30
    )}<span>Cancel</span></button><button class="cbig green" onclick="$('#call').remove();callFail(${
      who ? `'${who}'` : "null"
    },'${num || ""}')">${I("phone", 32)}<span>Call Back</span></button></div>`;
  }, 2200);
}

/* ===================================================================== ALARM */
let ALM = null,
  snz = null;
function alarmRing(id) {
  const a = (S.alarms || []).find((x) => x.id === id);
  if (!a || ALM || ended) return;
  ALM = a;
  alarmStart();
  if (state === "home")
    islandOpen(
      `<div class="isa"><div class="isa-l">${I(
        "clock",
        20,
        "color:#ff9f0a"
      )}<span><small>Alarm</small><b>${
        a.label
      }</b></span></div><div class="isa-b"><button class="snz" onclick="alarmStop(true)">Snooze</button><button class="stp" onclick="alarmStop()">Stop</button></div></div>`,
      "alarm"
    );
  else {
    if (state === "off") wake();
    const o = el("div", "almf");
    o.id = "almf";
    o.style.background = wallCSS("lock");
    o.innerHTML = `<div class="almf-in"><div class="lk-time">${hm(
      now()
    )}</div><div class="almf-l">${
      a.label
    }</div><button class="snz big" onclick="alarmStop(true)">Snooze</button><button class="stp big" onclick="alarmStop()">Stop</button></div>`;
    PH.appendChild(o);
  }
  ALM.to = setTimeout(() => alarmStop(), 40000);
}
function alarmStop(snooze) {
  if (!ALM) return;
  clearTimeout(ALM.to);
  ringStop();
  islandClose();
  $("#almf") && $("#almf").remove();
  if (snooze) snz = { id: ALM.id, at: new Date(now().getTime() + 9 * 6e4) };
  ALM = null;
}

/* ===================================================================== MEDIA PLAYBACK */
let MED = null;
function playMedia(kind, id, len, bedK) {
  if (MED && MED.id === id) {
    stopMedia();
    return;
  }
  stopMedia();
  MED = { kind, id, dur: durS(len), t0: Date.now() };
  bedStart(bedK || "room");
  MED.iv = setInterval(() => {
    if (!MED) return;
    const e = $(`[data-med="${kind}-${id}"]`),
      p = Math.min(1, (Date.now() - MED.t0) / (MED.dur * 1000));
    if (e) {
      const b = $(".prg i", e);
      b && (b.style.width = p * 100 + "%");
      const t0 = $(".t0", e);
      t0 && (t0.textContent = durF(p * MED.dur));
      const ws = $$(".tw", e),
        k = Math.floor(p * ws.length);
      ws.forEach((w, j) => w.classList.toggle("on", j < k));
    }
    if (p >= 1) {
      stopMedia();
      W && rerender(topP());
    }
  }, 150);
}
function stopMedia() {
  if (!MED) return;
  clearInterval(MED.iv);
  MED = null;
  bedStop();
}

/* ===================================================================== MAIL */
function mailRoot() {
  const u = S.mails.filter((m) => m.unread).length;
  const r = (ic, l, n, fn) =>
    `<button class="row" onclick="${fn || ""}"><span class="rico blue">${I(
      ic,
      22
    )}</span><span class="rl">${l}</span><span class="rv">${n || ""}</span>${I(
      "chev",
      13,
      "color:#5a5a5e"
    )}</button>`;
  const body = `<div class="grp">${r(
    "mail",
    "All Inboxes",
    u,
    "push(inboxPage)"
  )}${r("mail", "Inbox", u, "push(inboxPage)")}${r("star", "VIP")}${r(
    "folder",
    "Flagged"
  )}</div><div class="sech">Phainon</div><div class="grp">${r(
    "folder",
    "Drafts"
  )}${r("share", "Sent")}${r("folder", "Junk")}${r("trash", "Bin")}${r(
    "albums",
    "Archive"
  )}</div>`;
  return {
    title: "Mailboxes",
    html: pg({
      title: "Mailboxes",
      left: "<span></span>",
      right: `<button class="nbl">Edit</button>`,
      body,
      scls: "gbg",
    }),
  };
}
function inboxPage() {
  const ms = S.mails.slice().sort((a, b) => D(b.time) - D(a.time));
  const body = `<div class="plain">${ms
    .map(
      (m) =>
        `<button class="mlr" onclick="push(mailView,['${m.id}'])"><i class="${
          m.unread ? "ud" : "ud0"
        }"></i><span class="mx"><span class="mt"><b>${
          m.from
        }</b><span class="tm">${fList(m.time)} ${I(
          "chev",
          12
        )}</span></span><span class="ms">${
          m.subj
        }</span><span class="mp">${strip(m.body).replace(
          /\n+/g,
          " "
        )}</span></span></button>`
    )
    .join("")}</div>`;
  return {
    title: "Inbox",
    html: pg({
      title: "Inbox",
      right: `<button class="nbl">Edit</button>`,
      body,
      search: true,
      foot: `<div class="tbar"><span>${I(
        "list",
        22
      )}</span><span class="tbc">Updated Just Now</span><span>${I(
        "compose",
        23
      )}</span></div>`,
    }),
  };
}
function mailView(id) {
  const m = S.mails.find((x) => x.id === id);
  m.unread = false;
  see("e:" + id);
  badgesRefresh();
  const body = `<div class="mv"><div class="mvh"><span class="av" style="width:42px;height:42px;font-size:16px">${(m.from.match(
    /\p{L}/u
  ) || ["?"])[0].toUpperCase()}</span><span class="mvf"><span class="mt"><b>${
    m.from
  }</b><span class="tm">${
    fDay(m.time) === "Today" || fDay(m.time) === "Yesterday"
      ? fDay(m.time) + " at " + hm(m.time)
      : fList(m.time)
  }</span></span><span class="l2">To: ${
    S.owner
  }</span></span></div><h2 class="mvs">${m.subj}</h2><div class="mvb">${
    m.body
  }</div></div>`;
  return {
    title: "",
    cls: "nolt",
    html: pg({
      title: "",
      large: false,
      right: `<button class="nbi">${I(
        "up",
        22,
        "transform:rotate(180deg)"
      )}</button><button class="nbi">${I("up", 22)}</button>`,
      body,
      foot: `<div class="tbar"><span>${I("trash", 22)}</span><span>${I(
        "folder",
        22
      )}</span><span>${I("reply", 22)}</span><span>${I(
        "compose",
        23
      )}</span></div>`,
    }),
  };
}

/* ===================================================================== NOTES */
function notesRoot() {
  const body = `<div class="sech">On My Phone</div><div class="grp"><button class="row" onclick="push(notesList)"><span class="rico yl">${I(
    "folder",
    22
  )}</span><span class="rl">Notes</span><span class="rv">${
    S.notes.length
  }</span>${I(
    "chev",
    13,
    "color:#5a5a5e"
  )}</button><button class="row"><span class="rico yl">${I(
    "trash",
    22
  )}</span><span class="rl">Recently Deleted</span><span class="rv">0</span>${I(
    "chev",
    13,
    "color:#5a5a5e"
  )}</button></div>`;
  return {
    title: "Folders",
    cls: "yel",
    html: pg({
      title: "Folders",
      left: "<span></span>",
      right: `<button class="nbl">Edit</button>`,
      body,
      scls: "gbg",
      search: true,
      foot: `<div class="tbar yl"><span>${I(
        "folder",
        22
      )}</span><span></span><span>${I("compose", 23)}</span></div>`,
    }),
  };
}
function noteGroup(t) {
  const k = ddiff(t),
    d = D(t),
    n = now();
  if (k <= 7) return "Previous 7 Days";
  if (k <= 30) return "Previous 30 Days";
  if (d.getFullYear() === n.getFullYear()) return MO[d.getMonth()];
  return String(d.getFullYear());
}
function notesList() {
  const ns = S.notes.slice().sort((a, b) => D(b.time) - D(a.time));
  let html = "",
    g = null;
  ns.forEach((n) => {
    const gg = noteGroup(n.time);
    if (gg !== g) {
      if (g) html += "</div>";
      html += `<div class="sech big">${gg}</div><div class="grp">`;
      g = gg;
    }
    const lk = n.lock && !ok["n:" + n.id];
    const prev = lk
      ? "Locked"
      : strip(n.check ? n.check.map((c) => c[1]).join(" ") : n.body).replace(
          /\n+/g,
          " "
        );
    html += `<button class="row col nr" onclick="push(noteView,['${
      n.id
    }'])"><b>${
      n.lock
        ? I(
            ok["n:" + n.id] ? "unlock" : "lock",
            14,
            "vertical-align:-1px;margin-right:3px"
          )
        : ""
    }${n.title}</b><span class="l2"><span class="nd">${
      ddiff(n.time) <= 0 ? hm(n.time) : fList(n.time)
    }</span> ${prev}</span></button>`;
  });
  html += "</div>";
  return {
    title: "Notes",
    cls: "yel",
    html: pg({
      title: "Notes",
      right: `<button class="nbi">${I("dots", 25)}</button>`,
      body: html,
      scls: "gbg",
      search: true,
      foot: `<div class="tbar yl"><span></span><span class="tbc">${
        S.notes.length
      } Notes</span><span>${I("compose", 23)}</span></div>`,
    }),
  };
}
function noteView(id) {
  const n = S.notes.find((x) => x.id === id);
  if (n.lock && !ok["n:" + id]) {
    return {
      title: "",
      cls: "yel nolt",
      html: pg({
        title: "",
        large: false,
        right: `<button class="nbi">${I("lock", 20)}</button>`,
        body: `<div class="nlk">${I(
          "lock",
          46
        )}<h3>This note is locked.</h3><p>To view this note, enter the note password.</p><button onclick="noteUnlock('${id}')">View Note</button></div>`,
      }),
    };
  }
  see("n:" + id);
  const ck = n.check
    ? `<div class="ck">${n.check
        .map(
          (c) =>
            `<div class="cki${c[0] ? " d" : ""}"><span class="ckb">${
              c[0] ? I("check", 14) : ""
            }</span><span>${c[1]}</span></div>`
        )
        .join("")}</div>`
    : "";
  return {
    title: "",
    cls: "yel nolt",
    html: pg({
      title: "",
      large: false,
      right: `${
        n.lock ? `<button class="nbi">${I("unlock", 20)}</button>` : ""
      }<button class="nbi">${I("share", 22)}</button><button class="nbi">${I(
        "dots",
        24
      )}</button>`,
      body: `<div class="ndt">${fLong(n.time)}</div><div class="nv"><h1>${
        n.title
      }</h1>${ck}${n.body ? `<div class="nb_">${n.body}</div>` : ""}</div>`,
    }),
  };
}
function noteUnlock(id) {
  const n = S.notes.find((x) => x.id === id);
  let tries = 0;
  const show = (msg) =>
    alertBox({
      title: "Enter Password",
      msg,
      input: "Password",
      btns: [
        { t: "Cancel" },
        {
          t: "OK",
          b: 1,
          keep: 1,
          fn: (a) => {
            const norm = (x) =>
              String(x)
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]/gu, "");
            if (
              []
                .concat(n.lock)
                .map(norm)
                .includes(norm($("#ali").value || ""))
            ) {
              a.remove();
              ok["n:" + id] = 1;
              sfx("tick");
              rerender(topP());
              return;
            }
            tries++;
            a.remove();
            sfx("fail");
            show(
              `Incorrect password.${
                n.hint && tries >= 1 ? `<br><br><b>Hint:</b> ${n.hint}` : ""
              }`
            );
          },
        },
      ],
    });
  show(`Enter the password for “${n.title}”.`);
}

/* ===================================================================== PHOTOS */
let phoT = "lib";
const camShots = [];
const allLib = () =>
  S.photos.concat(camShots).sort((a, b) => D(a.time) - D(b.time));
const pset = (k) =>
  k === "lib" ? allLib() : k === "hid" ? S.hidden : S.deleted;
function phoTab(k) {
  phoT = k;
  replace(photosRoot);
}
function grid3(k) {
  const a = pset(k);
  let html = "",
    m = null;
  a.forEach((p, i) => {
    const d = D(p.time),
      mm = d.getFullYear() * 12 + d.getMonth();
    if (k === "lib" && mm !== m) {
      if (m !== null) html += "</div>";
      html += `<div class="pmh">${
        MO[d.getMonth()]
      } ${d.getFullYear()}</div><div class="pgrid">`;
      m = mm;
    }
    html += `<button class="pt" onclick="push(viewer,['${k}',${i}])">${scene(
      p,
      "t"
    )}${k === "del" ? `<span class="pdl">29 days</span>` : ""}</button>`;
  });
  if (k !== "lib") return `<div class="pgrid">${html}</div>`;
  return html + "</div>";
}
function photosRoot() {
  const tb = tabbar(
    [
      ["lib", "Library", "photo"],
      ["you", "For You", "foryou"],
      ["alb", "Albums", "albums"],
      ["srch", "Search", "search"],
    ],
    phoT,
    "phoTab"
  );
  if (phoT === "lib") {
    const L = allLib(),
      last = L[L.length - 1];
    return {
      title: "Library",
      cls: "pho",
      keepBottom: true,
      html: pg({
        title: "Library",
        large: false,
        left: `<span class="phd"><b>${fDay(last.time)}</b></span>`,
        right: `<button class="pill">Select</button>`,
        body: grid3("lib") + `<div class="pcount">${L.length} Photos</div>`,
        tab: tb,
      }),
      mount(e) {
        const sc = $(".sc", e);
        sc.scrollTop = sc.scrollHeight;
      },
    };
  }
  if (phoT === "alb") {
    const L = allLib(),
      cover = (p) => (p ? scene(p, "t") : "");
    const body = `<div class="sech big rowh">My Albums <span class="blue">See All</span></div><div class="agrid"><button class="alc" onclick="phoTab('lib')">${cover(
      L[L.length - 1]
    )}<b>Recents</b><span>${
      L.length
    }</span></button><button class="alc"><span class="scn t" style="background:#2c2c2e"></span><b>Favourites</b><span>0</span></button></div>${
      ok.hid
        ? `<div class="sech big">People</div><div class="agrid"><button class="alc" onclick="push(albumPage,['hid'])">${scene(
            S.hidden[3] || S.hidden[0],
            "t face"
          )}<b>Dei</b><span>${S.hidden.length}</span></button></div>`
        : ""
    }<div class="sech big">Utilities</div><div class="grp"><button class="row" onclick="lockedAlbum('hid')"><span class="rico blue">${I(
      "lock",
      20
    )}</span><span class="rl">Hidden</span><span class="rv">${I(
      "lock",
      13
    )}</span>${I(
      "chev",
      13,
      "color:#5a5a5e"
    )}</button><button class="row" onclick="lockedAlbum('del')"><span class="rico blue">${I(
      "trash",
      20
    )}</span><span class="rl">Recently Deleted</span><span class="rv">${I(
      "lock",
      13
    )}</span>${I("chev", 13, "color:#5a5a5e")}</button></div>`;
    return {
      title: "Albums",
      html: pg({
        title: "Albums",
        left: `<button class="nbi">${I("plus", 22)}</button>`,
        body,
        tab: tb,
      }),
    };
  }
  if (phoT === "you") {
    const cats = allLib().filter((p) => /cat|door/.test(p.scene));
    const ica = allLib().find((p) => p.id === "ica") || cats[cats.length - 1];
    const mem = ok.hid
      ? `<button class="mem" onclick="see('x:memory');push(albumPage,['hid'])">${scene(
          S.hidden[7] || S.hidden[0],
          "t"
        )}<span><b>${
          S.memoryTitle || "Together"
        }</b><small>Memory · new</small></span></button><div style="height:14px"></div>`
      : "";
    return {
      title: "For You",
      html: pg({
        title: "For You",
        body: `<div class="sech big">Memories</div>${mem}<button class="mem" onclick="phoTab('lib')">${
          ica ? scene(ica, "t") : ""
        }<span><b>Ica</b><small>Over the Years</small></span></button>`,
        tab: tb,
      }),
    };
  }
  return {
    title: "Search",
    html: pg({
      title: "Search",
      search: true,
      body: `<div class="sech big">Places</div><div class="grp"><div class="row">Aedes Beach <span class="rv">2</span></div><div class="row">Okhema <span class="rv">${
        allLib().length - 3
      }</span></div></div>`,
      tab: tb,
    }),
  };
}
function lockedAlbum(k) {
  if (k === "hid" && S.hiddenPassword) {
    if (ok.hid) {
      push(albumPage, [k]);
      return;
    }
    let tries = 0;
    const ask = (msg) =>
      alertBox({
        title: "Hidden",
        msg,
        input: "Password",
        btns: [
          { t: "Cancel" },
          {
            t: "OK",
            b: 1,
            keep: 1,
            fn: (a) => {
              const norm = (x) =>
                String(x)
                  .toLowerCase()
                  .replace(/[^\p{L}\p{N}]/gu, "");
              if (
                []
                  .concat(S.hiddenPassword)
                  .map(norm)
                  .includes(norm($("#ali").value || ""))
              ) {
                a.remove();
                ok.hid = 1;
                sfx("tick");
                push(albumPage, [k]);
                return;
              }
              tries++;
              a.remove();
              sfx("fail");
              ask(
                `Incorrect password.${
                  S.hiddenHint && tries >= 2
                    ? `<br><br><b>Hint:</b> ${S.hiddenHint}`
                    : ""
                }`
              );
            },
          },
        ],
      });
    ask("Enter the password for this album.");
    return;
  }
  if (ok.photos) {
    push(albumPage, [k]);
    return;
  }
  const f = el("div", "fid");
  f.innerHTML = `<div class="fid-b">${I("face", 54)}<span>Face ID</span></div>`;
  PH.appendChild(f);
  setTimeout(() => f.classList.add("shake"), 650);
  setTimeout(() => {
    f.remove();
    push(codePage, [
      "Enter iPhone Passcode",
      S.passcode,
      () => {
        ok.photos = 1;
        replace(albumPage, [k]);
      },
      "",
      "Hidden album",
    ]);
  }, 1250);
}
function codePage(title, code, cb, hint, sub) {
  CODE = { code, cb, hint, pin: "", bad: 0 };
  return {
    title: "",
    cls: "codep nolt",
    html: pg({
      title: "",
      large: false,
      body: `<div class="cdw">${
        sub ? `<div class="cd-sub">${sub}</div>` : ""
      }<div class="pw-t" id="cdt">${title}</div><div class="dots" id="cdd">${"<i></i>".repeat(
        code.length
      )}</div><div class="pw-h" id="cdh"></div>${keypad(
        "ckey"
      )}<div class="pw-b"><span></span><button onclick="cdel()">Delete</button></div></div>`,
    }),
  };
}
let CODE = null;
function ckey(d) {
  if (!CODE || CODE.pin.length >= CODE.code.length) return;
  sfx("key");
  CODE.pin += d;
  $$("#cdd i").forEach((x, i) => x.classList.toggle("on", i < CODE.pin.length));
  if (CODE.pin.length < CODE.code.length) return;
  if (CODE.pin === CODE.code) {
    const cb = CODE.cb;
    CODE = null;
    setTimeout(cb, 180);
    return;
  }
  CODE.bad++;
  sfx("fail");
  const dd = $("#cdd");
  dd.classList.add("shake");
  if (CODE.bad >= 3 && CODE.hint) $("#cdh").textContent = CODE.hint;
  setTimeout(() => {
    if (!CODE) return;
    CODE.pin = "";
    $$("#cdd i").forEach((x) => x.classList.remove("on"));
    dd.classList.remove("shake");
  }, 450);
}
function cdel() {
  if (!CODE) return;
  CODE.pin = CODE.pin.slice(0, -1);
  $$("#cdd i").forEach((x, i) => x.classList.toggle("on", i < CODE.pin.length));
}
function albumPage(k) {
  const t = k === "hid" ? "Hidden" : "Recently Deleted";
  if (k === "hid") see("x:hidden");
  return {
    title: t,
    html: pg({
      title: t,
      right: `<button class="pill">Select</button>`,
      body:
        (k === "del"
          ? `<div class="pnote">Photos and videos show the days remaining before deletion. After that time, items will be permanently deleted.</div>`
          : "") + grid3(k),
    }),
  };
}
let pinfo = true;
function viewer(k, i) {
  const a = pset(k),
    p = a[i];
  see("p:" + p.id);
  const shot = p.scene === "shot";
  const body = `<div class="pvw"><div class="pv-img" id="pvimg">${scene(
    p,
    "v"
  )}</div>${
    pinfo
      ? `<div class="pv-info"><div class="pv-cap${p.caption ? "" : " ph"}">${
          p.caption || "Add a Caption"
        }</div><div class="pv-meta"><b>${WD[D(p.time).getDay()]} • ${fDate(
          p.time
        )} • ${hm(p.time)}</b><span>${
          shot ? "Screenshot" : "Main Camera — 26 mm ƒ1.5"
        }</span>${
          shot ? "" : `<span class="l2">${p.place || ""}</span>`
        }</div>${
          !shot && p.place
            ? `<div class="pv-map"><span class="pin_">📍</span><span>${p.place}</span></div>`
            : ""
        }</div>`
      : ""
  }</div>`;
  return {
    title: "",
    cls: "pvp nolt",
    html: pg({
      title: "",
      large: false,
      small: `<span class="pvd"><b>${fDay(p.time)}</b><small>${hm(
        p.time
      )}</small></span>`,
      right: `<button class="pill">Edit</button>`,
      body,
      foot: `<div class="tbar pvb"><span>${I("share", 23)}</span><span>${I(
        "heart",
        23
      )}</span><button onclick="pinfo=!pinfo;replace(viewer,['${k}',${i}])" class="${
        pinfo ? "blue" : ""
      }">${I("info", 24)}</button><span>${I("trash", 23)}</span></div>`,
    }),
    mount(e) {
      const im = $("#pvimg", e);
      let x0 = null;
      im.onpointerdown = (ev) => (x0 = ev.clientX);
      im.onpointerup = (ev) => {
        if (x0 == null) return;
        const dx = ev.clientX - x0;
        x0 = null;
        if (Math.abs(dx) < 40) return;
        const j = i + (dx < 0 ? 1 : -1);
        if (j >= 0 && j < a.length) replace(viewer, [k, j]);
      };
    },
  };
}

/* ===================================================================== CALENDAR */
let calM = null,
  calSel = null;
function evOn(d) {
  return S.calendar.filter((e) => {
    const s = D(e.start);
    if (e.repeat === "yearly")
      return (
        s.getMonth() === d.getMonth() &&
        s.getDate() === d.getDate() &&
        d.getFullYear() >= s.getFullYear()
      );
    return sod(s).getTime() === sod(d).getTime();
  });
}
function calRoot() {
  const n = now();
  calM = calM || new Date(n.getFullYear(), n.getMonth(), 1);
  calSel = calSel || sod(n);
  const y = calM.getFullYear(),
    m = calM.getMonth(),
    off = (new Date(y, m, 1).getDay() + 6) % 7,
    days = new Date(y, m + 1, 0).getDate();
  let cells = "";
  for (let i = 0; i < off; i++) cells += "<span></span>";
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m, d),
      isT = sod(n).getTime() === dt.getTime(),
      isS = calSel.getTime() === dt.getTime(),
      has = evOn(dt).length;
    cells += `<button class="cd${isT ? " today" : ""}${
      isS ? " sel" : ""
    }" onclick="calSel=new Date(${y},${m},${d});replace(calRoot)"><span>${d}</span>${
      has ? "<i></i>" : ""
    }</button>`;
  }
  const evs = evOn(calSel).sort(
    (a, b) =>
      (a.allDay ? -1 : 1) - (b.allDay ? -1 : 1) || D(a.start) - D(b.start)
  );
  const list = evs.length
    ? evs
        .map(
          (e) =>
            `<button class="evr" onclick="push(evPage,['${
              e.id
            }'])"><span class="evt">${
              e.allDay
                ? "all-day"
                : `${hm(e.start)}<br><small>${hm(e.end || e.start)}</small>`
            }</span><i class="evc"></i><span class="evx"><b>${e.title}</b>${
              e.where ? `<small>${e.where}</small>` : ""
            }</span></button>`
        )
        .join("")
    : `<div class="evn">No Events</div>`;
  const body = `<div class="calh"><button onclick="calM=new Date(${y},${
    m - 1
  },1);replace(calRoot)">${I("back", 18)}</button><h1 class="lt">${MO[m]}${
    y !== n.getFullYear() ? " " + y : ""
  }</h1><button onclick="calM=new Date(${y},${m + 1},1);replace(calRoot)">${I(
    "chev",
    18
  )}</button></div><div class="cwk">${"MTWTFSS"
    .split("")
    .map((c) => `<span>${c}</span>`)
    .join("")}</div><div class="cgr">${cells}</div><div class="cdl">${
    WD[calSel.getDay()]
  } ${calSel.getDate()} ${
    MO[calSel.getMonth()]
  } ${calSel.getFullYear()}</div><div class="evl">${list}</div>`;
  return {
    title: MO[m],
    cls: "nolt cal",
    html: pg({
      title: "",
      large: false,
      left: `<button class="bk" onclick="calM=null;calSel=null;replace(calRoot)">${I(
        "back",
        22
      )}<span>${y}</span></button>`,
      right: `<button class="nbi">${I(
        "list",
        23
      )}</button><button class="nbi">${I(
        "search",
        21
      )}</button><button class="nbi">${I("plus", 23)}</button>`,
      body,
      foot: `<div class="tbar rd"><span>Today</span><span>Calendars</span><span>Inbox</span></div>`,
    }),
  };
}
function evPage(id) {
  const e = S.calendar.find((x) => x.id === id);
  see("c:" + id);
  const d = calSel || sod(now());
  const when = e.allDay
    ? `${WD[d.getDay()]} ${d.getDate()} ${
        MO[d.getMonth()]
      } ${d.getFullYear()}<br>all-day`
    : `${WD[D(e.start).getDay()]} ${fDate(e.start)}<br>from ${hm(
        e.start
      )} to ${hm(e.end || e.start)}`;
  const body = `<div class="evd"><h2>${e.title}</h2>${
    e.where ? `<div class="l2">${e.where}</div>` : ""
  }<div class="evw">${when}</div>${
    e.repeat ? `<div class="l2">Repeats every year</div>` : ""
  }</div><div class="grp"><div class="row"><span class="rl">Calendar</span><span class="rv"><i class="evc dot"></i> Home</span></div><div class="row"><span class="rl">Alert</span><span class="rv">${
    e.allDay ? "None" : "At time of event"
  }</span></div></div>${
    e.notes != null
      ? `<div class="grp"><div class="row col"><small>Notes</small><span class="pre">${
          e.notes || " "
        }</span></div></div>`
      : ""
  }<div class="grp"><button class="row red ctr">Delete Event</button></div>`;
  return {
    title: "Event Details",
    cls: "nolt",
    html: pg({
      title: "Event Details",
      large: false,
      right: `<button class="nbl">Edit</button>`,
      body,
      scls: "gbg",
    }),
  };
}

/* ===================================================================== VOICE MEMOS */
let memOpen = null;
function wave(id, n = 46) {
  let s = 0;
  for (const c of id) s = (s * 31 + c.charCodeAt(0)) % 9973;
  const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  return `<div class="wv">${[...Array(n)]
    .map(() => `<i style="height:${(15 + r() * 85).toFixed(0)}%"></i>`)
    .join("")}</div>`;
}
function memosRoot() {
  const ms = S.memos.slice().sort((a, b) => D(b.time) - D(a.time));
  const body = `<div class="plain">${ms
    .map((m) => {
      const o = memOpen === m.id,
        pl = MED && MED.id === m.id;
      return `<div class="mmr${o ? " open" : ""}" data-med="mm-${
        m.id
      }"><button class="mmh" onclick="memTap('${m.id}')"><b>${
        m.title
      }</b><span class="mt"><span class="l2">${
        fDay(m.time) === "Today" ? hm(m.time) : fDate(m.time)
      }</span><span class="l2">${m.len}</span></span></button>${
        o
          ? `<div class="mmb">${wave(
              m.id
            )}<div class="prg"><i></i></div><div class="vt"><span class="t0">0:00</span><span>-${
              m.len
            }</span></div><div class="vc"><button class="vbtn sm">${I(
              "b15",
              28
            )}</button><button class="vbtn pl" onclick="memPlay('${m.id}')">${I(
              pl ? "pause" : "play",
              30
            )}</button><button class="vbtn sm">${I(
              "f15",
              28
            )}</button></div><div class="vtr"><small>${I(
              "quote",
              12
            )} Transcript</small><p>${words(m.text)}</p></div></div>`
          : ""
      }</div>`;
    })
    .join("")}</div>`;
  return {
    title: "All Recordings",
    html: pg({
      title: "All Recordings",
      left: `<button class="bk">${I("back", 22)}<span>Back</span></button>`,
      right: `<button class="nbl">Edit</button>`,
      body,
      search: true,
      foot: `<div class="rec"><button><i></i></button></div>`,
    }),
  };
}
function memTap(id) {
  if (memOpen !== id) stopMedia();
  memOpen = memOpen === id ? null : id;
  if (memOpen) see("m:" + id);
  rerender(topP());
}
function memPlay(id) {
  const m = S.memos.find((x) => x.id === id);
  playMedia("mm", id, m.len, m.bed);
  rerender(topP());
}

/* ===================================================================== SAFARI */
let safTab = null;
function safariRoot() {
  const sf = S.safari || { tabs: [] };
  if (!ok.safari && sf.code) {
    return {
      title: "",
      cls: "nolt stl",
      html: pg({
        title: "",
        noNav: true,
        large: false,
        body: `<div class="stw"><span class="sti">${I(
          "hour",
          40
        )}</span><h2>Time Limit</h2><p>You’ve reached your limit on Safari.</p><button class="stb" onclick="stAsk()">Ask For More Time</button></div>`,
      }),
    };
  }
  const t = sf.tabs.find((x) => x.id === safTab) || sf.tabs[0];
  safTab = t.id;
  see("s:" + t.id);
  return {
    title: t.title,
    cls: "nolt saf",
    light: t.light !== false,
    html: `<div class="sc web" style="background:${t.bg || "#fff"}">${
      t.html
    }</div><div class="sfb"><div class="sfa"><span class="aa">aA</span><span class="sfu">${I(
      "lock",
      11
    )} ${t.url}</span><span>${I(
      "reload",
      18
    )}</span></div><div class="sft"><span>${I(
      "back",
      22
    )}</span><span class="dim">${I("chev", 22)}</span><span>${I(
      "share",
      23
    )}</span><button onclick="push(histPage)">${I(
      "book",
      24
    )}</button><button onclick="push(tabsPage)">${I(
      "tabs",
      23
    )}</button></div></div>`,
  };
}
let acctSent = false;
function acct() {
  push(acctPage);
}
function acctPage() {
  const A = S.safari.account,
    wrap = (h) =>
      `<div class="sc web" style="background:#f6efe3">${h}</div><div class="sfb"><div class="sfa"><span class="aa">aA</span><span class="sfu">${I(
        "lock",
        11
      )} goldenhoneycake.kr</span><span>${I(
        "reload",
        18
      )}</span></div><div class="sft"><button onclick="goBack()">${I(
        "back",
        22
      )}</button><span class="dim">${I("chev", 22)}</span><span>${I(
        "share",
        23
      )}</span><span>${I("book", 24)}</span><span>${I(
        "tabs",
        23
      )}</span></div></div>`;
  const top_ = `<div class="acc"><div class="acc-h">Golden Honeycake</div>`;
  if (ok.acct) {
    see("s:orders");
    return {
      title: "My orders",
      cls: "nolt saf",
      light: true,
      html: wrap(
        `${top_}<h2>My orders</h2><div class="acc-e">${A.email}</div>${A.orders
          .map(
            (o) =>
              `<div class="ord"><div class="ord-t"><b>Order ${
                o.id
              }</b><span>${fDate(o.date)}</span></div><div>${
                o.items
              }</div><div class="ord-s">${o.status}</div></div>`
          )
          .join("")}</div>`
      ),
    };
  }
  return {
    title: "Log in",
    cls: "nolt saf",
    light: true,
    html: wrap(
      `${top_}<h2>Log in</h2><label>Email</label><input class="acc-i" value="${
        A.email
      }" readonly><label>Password</label><input class="acc-i" type="password" placeholder="••••••••" id="accpw"><button class="acc-b" onclick="acctTry()">Log in</button><div class="acc-err" id="accerr"></div>${
        acctSent
          ? `<label>Enter the 6-digit code we sent to your email</label><input class="acc-i" id="acccode" inputmode="numeric" maxlength="6" placeholder="000000"><button class="acc-b" onclick="acctCode()">Continue</button>`
          : `<button class="acc-l" onclick="acctForgot()">Forgot password?</button>`
      }</div>`
    ),
  };
}
function acctTry() {
  const e = $("#accerr");
  if (e) e.textContent = "Incorrect password. Try again or reset it.";
  sfx("fail");
}
function acctForgot() {
  if (acctSent) return;
  acctSent = true;
  rerender(topP());
  const A = S.safari.account;
  setTimeout(() => {
    S.mails.push({
      id: "reset",
      from: "Golden Honeycake",
      time: stamp(now()),
      unread: true,
      subj: "Your login code",
      body: `Your one-time code is ${A.code}.\n\nIt expires in 10 minutes. If you didn’t ask for this, you can ignore this email.`,
    });
    notify({
      app: "mail",
      title: "Golden Honeycake",
      text: `<b>Your login code</b><br>Your one-time code is ${A.code}.`,
      go: { app: "mail", mail: "reset" },
    });
  }, 2500);
}
function acctCode() {
  const v = ($("#acccode").value || "").replace(/\D/g, "");
  if (v === S.safari.account.code) {
    ok.acct = 1;
    sfx("tick");
    rerender(topP());
  } else {
    const e = $("#accerr");
    if (e) e.textContent = "That code doesn’t match.";
    sfx("fail");
  }
}
function stAsk() {
  sheet({
    btns: [
      {
        t: "Enter Screen Time Passcode",
        fn: () =>
          push(codePage, [
            "Enter Screen Time Passcode",
            S.safari.code,
            () => {
              ok.safari = 1;
              W.stack
                .splice(0, W.stack.length - 1)
                .forEach((x) => x.el.remove());
              replace(safariRoot);
            },
            S.safari.hint,
            "",
          ]),
      },
    ],
  });
}
function tabsPage() {
  const ts = S.safari.tabs;
  return {
    title: "Tabs",
    cls: "nolt tabsp",
    html: pg({
      title: "",
      noNav: true,
      large: false,
      body: `<div class="tbg">${ts
        .map(
          (t) =>
            `<button class="tcard${
              t.id === safTab ? " cur" : ""
            }" onclick="safTab='${
              t.id
            }';goBack();setTimeout(()=>rerender(topP()),400)"><span class="tcw"><span class="tcs">${
              t.html
            }</span></span><b>${t.title}</b></button>`
        )
        .join("")}</div>`,
      foot: `<div class="tbar"><span>${I("plus", 24)}</span><span class="tbc">${
        ts.length
      } Tabs ${I(
        "down",
        11
      )}</span><button class="blue" onclick="goBack()">Done</button></div>`,
    }),
  };
}
function histPage() {
  see("s:history");
  let html = "",
    g = null;
  S.safari.history.forEach((x) => {
    const gg = fDay(x.time);
    if (gg !== g) {
      if (g) html += "</div>";
      html += `<div class="sech">${gg}</div><div class="grp">`;
      g = gg;
    }
    const srch = x.url === "Search";
    html += `<div class="row hr"><span class="hico">${
      srch ? I("search", 15) : x.title[0] || "•"
    }</span><span class="col"><b>${x.title}</b><small class="l2">${
      srch ? "Search" : x.url
    }</small></span></div>`;
  });
  html += "</div>";
  return {
    title: "History",
    cls: "nolt",
    html: pg({
      title: "History",
      large: true,
      right: `<button class="nbl b" onclick="goBack()">Done</button>`,
      left: "<span></span>",
      body:
        `<div class="seg wide"><button>${I(
          "book",
          16
        )}</button><button>▭</button><button class="on">${I(
          "clock",
          16
        )}</button></div>` + html,
      scls: "gbg",
    }),
  };
}

/* ===================================================================== SMALL APPS */
function setRow(ic, color, label, val, fn, chev = true) {
  return `<button class="row" onclick="${
    fn || ""
  }"><span class="sico" style="background:${color}">${I(
    ic,
    18
  )}</span><span class="rl">${label}</span><span class="rv">${
    val || ""
  }</span>${chev ? I("chev", 13, "color:#5a5a5e") : ""}</button>`;
}
function settingsRoot() {
  const body = `<div class="grp"><button class="row prof">${av(
    "me",
    58
  )}<span class="col"><b>${
    S.owner
  }</b><small class="l2">Account, Cloud &amp; more</small></span>${I(
    "chev",
    13,
    "color:#5a5a5e"
  )}</button></div>
     <div class="grp">${`<div class="row"><span class="sico" style="background:#ff9f0a">${I(
       "plane",
       18
     )}</span><span class="rl">Airplane Mode</span>${tog(
       false
     )}</div>`}${setRow("wifi", "#0a84ff", "Wi‑Fi", "Not Connected")}${setRow(
    "bt",
    "#0a84ff",
    "Bluetooth",
    "On"
  )}${setRow("ant", "#30d158", "Mobile Service", S.network)}</div>
     <div class="grp">${setRow("bell", "#ff453a", "Notifications")}${setRow(
    "spk",
    "#ff375f",
    "Sounds &amp; Haptics",
    "",
    "push(soundsPage)"
  )}${setRow("moon", "#5e5ce6", "Focus")}${setRow(
    "hour",
    "#5e5ce6",
    "Screen Time",
    "",
    "push(stPage)"
  )}</div>
     <div class="grp">${setRow("gear", "#8e8e93", "General")}${setRow(
    "sun",
    "#0a84ff",
    "Display &amp; Brightness"
  )}${setRow("photo", "#32ade6", "Wallpaper")}${setRow(
    "batt",
    "#30d158",
    "Battery",
    Math.round(battery) + "%",
    "push(battPage)"
  )}</div>
     <div class="grp">${setRow(
       "hand",
       "#0a84ff",
       "Privacy &amp; Security"
     )}${setRow("key", "#8e8e93", "Passwords")}</div>`;
  return {
    title: "Settings",
    html: pg({
      title: "Settings",
      left: "<span></span>",
      body,
      search: true,
      scls: "gbg",
    }),
  };
}
function battPage() {
  const b = Math.round(battery);
  return {
    title: "Battery",
    cls: "nolt",
    html: pg({
      title: "Battery",
      large: true,
      body: `<div class="grp"><div class="row"><span class="rl">Battery Percentage</span>${tog(
        true
      )}</div><div class="row"><span class="rl">Low Power Mode</span>${tog(
        lowPower,
        "lowPower=!lowPower;renderSB();rerender(topP())"
      )}</div></div><div class="foot">Low Power Mode temporarily reduces background activity like downloads and mail fetch until you can fully charge your iPhone.</div><div class="grp"><div class="row col"><small>Last Charged to 100%</small><span>Yesterday at 17:40</span></div><div class="row col"><small>Battery Level</small><span class="bigp">${b}%</span><span class="battbar"><i style="width:${b}%;background:${
        b <= 20 ? "#ff453a" : "#30d158"
      }"></i></span></div></div>`,
      scls: "gbg",
    }),
  };
}
function stPage() {
  return {
    title: "Screen Time",
    cls: "nolt",
    html: pg({
      title: "Screen Time",
      large: true,
      body: `<div class="grp"><div class="row col"><small>Daily Average</small><span class="bigp">6h 48m</span><span class="stbars">${[
        62, 80, 71, 90, 55, 88, 96,
      ]
        .map((x) => `<i style="height:${x}%"></i>`)
        .join(
          ""
        )}</span></div><div class="row col"><small>Most Used</small><span>Messages · 2h 10m</span><span>Safari · 1h 52m</span><span>Photos · 48m</span></div></div><div class="grp"><div class="row"><span class="rl">App Limits</span><span class="rv">Safari · 30 min</span></div><div class="row"><span class="rl">Screen Time Passcode</span><span class="rv">On</span></div></div>`,
      scls: "gbg",
    }),
  };
}
function soundsPage() {
  return {
    title: "Sounds & Haptics",
    cls: "nolt",
    html: pg({
      title: "Sounds &amp; Haptics",
      large: true,
      body: `<div class="grp"><div class="row"><span class="rl">Silent Mode</span>${tog(
        silent,
        "toggleSilent()"
      )}</div></div><div class="grp"><div class="row col"><small>Ringtone and Alerts</small><span class="slider"><i style="width:${
        vol * 100
      }%"></i></span></div></div><div class="grp"><div class="row"><span class="rl">Ringtone</span><span class="rv">Opening (default)</span></div><div class="row"><span class="rl">Text Tone</span><span class="rv">Note</span></div></div>`,
      scls: "gbg",
    }),
  };
}
let clkT = "alm";
function clockRoot() {
  const tb = tabbar(
    [
      ["wc", "World Clock", "clock"],
      ["alm", "Alarms", "bell"],
      ["sw", "Stopwatch", "clock"],
      ["tm", "Timers", "hour"],
    ],
    clkT,
    "clkTab"
  );
  if (clkT === "alm")
    return {
      title: "Alarms",
      cls: "orn",
      html: pg({
        title: "Alarms",
        left: `<button class="nbl o">Edit</button>`,
        right: `<button class="nbi o">${I("plus", 23)}</button>`,
        body: `<div class="sech">Other</div><div class="plain">${S.alarms
          .map(
            (a) =>
              `<div class="alr${
                a.on ? "" : " off"
              }"><span class="col"><span class="alt_">${a.time}</span><small>${
                a.label
              }, ${a.repeat}</small></span>${tog(a.on)}</div>`
          )
          .join("")}</div>`,
        tab: tb,
      }),
    };
  if (clkT === "wc")
    return {
      title: "World Clock",
      cls: "orn",
      html: pg({
        title: "World Clock",
        left: `<button class="nbl o">Edit</button>`,
        body: `<div class="plain"><div class="alr"><span class="col"><small>Today, +0HRS</small><span class="wcn">Okhema</span></span><span class="alt_">${hm(
          now()
        )}</span></div><div class="alr"><span class="col"><small>Today, +0HRS</small><span class="wcn">Kremnos</span></span><span class="alt_">${hm(
          now()
        )}</span></div></div>`,
        tab: tb,
      }),
    };
  if (clkT === "sw")
    return {
      title: "",
      cls: "nolt orn",
      html: pg({
        title: "",
        noNav: true,
        large: false,
        body: `<div class="swt">00:00,00</div><div class="swb"><button>Lap</button><button class="g">Start</button></div>`,
        tab: tb,
      }),
    };
  return {
    title: "Timers",
    cls: "orn",
    html: pg({
      title: "Timers",
      body: `<div class="swt sm">0 hours  15 min  0 sec</div><div class="swb"><button>Cancel</button><button class="g">Start</button></div>`,
      tab: tb,
    }),
  };
}
function clkTab(k) {
  clkT = k;
  replace(clockRoot);
}
function weatherRoot() {
  const w = S.weather;
  return {
    title: "",
    cls: "nolt wxp",
    html: pg({
      title: "",
      noNav: true,
      large: false,
      body: `<div class="wxh"><small>MY LOCATION</small><h2>${
        w.place
      }</h2><div class="wxt">${w.temp}°</div><div>${w.cond}</div><div>H:${
        w.hi
      }°  L:${w.lo}°</div></div><div class="wxc"><div class="wxn">${
        w.note
      }</div><div class="wxhr">${w.hourly
        .map(
          ([t, ic, tp]) =>
            `<span><small>${t}</small><i>${ic}</i><b>${tp}°</b></span>`
        )
        .join("")}</div></div><div class="wxc"><div class="wxn l2">${I(
        "clock",
        12
      )} 10-DAY FORECAST</div>${["Today", "Sun", "Mon", "Tue", "Wed"]
        .map(
          (d, i) =>
            `<div class="wxd"><b>${d}</b><i>${
              ["☁️", "🌧️", "🌦️", "☁️", "🌤️"][i]
            }</i><span class="l2">${
              [6, 5, 7, 6, 8][i]
            }°</span><span class="wxbar"><i></i></span><span>${
              [12, 10, 11, 12, 13][i]
            }°</span></div>`
        )
        .join("")}</div>`,
    }),
  };
}
function mapsRoot() {
  const body = `<div class="map"><svg viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice"><rect width="400" height="600" fill="#2b3a2f"/><path d="M0 330 C80 310 120 360 190 340 S320 300 400 320 V600 H0Z" fill="#1d3a55"/><path d="M0 330 C80 310 120 360 190 340 S320 300 400 320" fill="none" stroke="#c9b58a" stroke-width="10" opacity=".55"/><path d="M40 0 L120 200 L210 260 L400 230" fill="none" stroke="#7a7f88" stroke-width="5"/><path d="M210 260 L260 0" fill="none" stroke="#7a7f88" stroke-width="3.5"/><path d="M120 200 L0 240" fill="none" stroke="#61666e" stroke-width="3"/><text x="150" y="185" fill="#cfd3da" font-size="15" font-family="-apple-system,sans-serif" font-weight="600">Aedes</text><text x="250" y="420" fill="#8fb3d6" font-size="12" font-family="-apple-system,sans-serif" font-style="italic">Sea</text><text x="232" y="250" fill="#aab0b8" font-size="10" font-family="-apple-system,sans-serif">Aedes Station</text></svg><span class="me_"><i></i></span></div><div class="msh"><span class="grab"></span><div class="srch">${I(
    "search",
    16
  )}<span>Search Maps</span>${I(
    "mic",
    16
  )}</div><div class="sech">Recents</div><div class="grp">${(S.maps || [])
    .map(
      (r) =>
        `<div class="row"><span class="mic_">${r.icon}</span><span class="col"><b>${r.title}</b><small class="l2">${r.sub}</small></span></div>`
    )
    .join("")}</div></div>`;
  return {
    title: "",
    cls: "nolt mapp",
    html: pg({ title: "", noNav: true, large: false, body }),
  };
}
function musicRoot() {
  const body = `<div class="sech big">Recently Played</div><div class="mus">${(
    S.music || []
  )
    .map(
      (m) =>
        `<button class="mc"><span class="mart" style="background:linear-gradient(135deg,${
          m.color[0]
        },${m.color[1]})">${I("play", 26)}</span><b>${
          m.title
        }</b><small class="l2">${m.sub}</small></button>`
    )
    .join("")}</div>`;
  return {
    title: "Library",
    cls: "rdac",
    html: pg({
      title: "Library",
      left: "<span></span>",
      right: `<button class="nbl">Edit</button>`,
      body,
      foot: `<div class="mini"><span class="mart sm"></span><span>Not Playing</span>${I(
        "play",
        22
      )}</div>${tabbar(
        [
          ["l", "Library", "albums"],
          ["s", "Search", "search"],
        ],
        "l",
        "void"
      )}`,
    }),
  };
}
function cameraRoot() {
  const lastShot =
    camShots[camShots.length - 1] || allLib()[allLib().length - 1];
  return {
    title: "",
    cls: "nolt camp",
    html: `<div class="cam-t">${I("bolt", 20)}<span class="cam-c">${I(
      "down",
      14
    )}</span><span class="cam-live"></span></div><div class="vf"><div class="vfi">${scene(
      { scene: "beach" },
      "v"
    )}<span class="wv1"></span><span class="wv2"></span></div><div class="zm"><span>.5</span><span class="on">1×</span><span>2</span></div></div><div class="modes"><span>TIME-LAPSE</span><span>SLO-MO</span><span>VIDEO</span><span class="on">PHOTO</span><span>PORTRAIT</span><span>PANO</span></div><div class="cam-b"><button class="cam-th" onclick="${
      state === "home" ? "openApp('photos')" : ""
    }">${
      lastShot ? scene(lastShot, "t") : ""
    }</button><button class="shut" onclick="shoot()"><i></i></button><button class="cam-fl">${I(
      "flip",
      24
    )}</button></div>`,
  };
}
function shoot() {
  sfx("shutter");
  vib(20);
  const f = el("div", "flashw");
  PH.appendChild(f);
  setTimeout(() => f.remove(), 260);
  camShots.push({
    id: "cam" + Date.now(),
    time: stamp(now()),
    scene: "beach",
    place: "Aedes Beach",
    caption: "",
  });
  setTimeout(() => W && W.app === "camera" && rerender(topP()), 150);
}
function findRoot() {
  const P = {
    okhema: [118, 150],
    okhemaStation: [140, 175],
    aedes: [292, 300],
    aedesWalk: [286, 318],
    aedesBeach: [280, 336],
    kremnos: [92, 470],
    train1: [215, 238],
    train2: [130, 380],
  };
  const people = (S.findmy || []).map((f) => {
    let st = f.steps[0];
    f.steps.forEach((x) => {
      if (x[0] === "start" || fired[x[0]]) st = x;
    });
    return { ...f, st };
  });
  if (people.some((p) => p.who === "dei")) see("f:dei");
  const dots = people
    .map((p) => {
      const [x, y] = P[p.st[1]] || [200, 200];
      return `<span class="fm-dot" style="left:${
        (x / 393) * 100
      }%;top:${y}px">${av(p.who, 34)}</span>`;
    })
    .join("");
  const body = `<div class="fm-map"><svg viewBox="0 0 393 560" preserveAspectRatio="xMidYMin slice"><rect width="393" height="560" fill="#1e2a22"/><path d="M393 250 C330 270 300 330 250 360 S170 430 160 560 H393Z" fill="#163650"/><path d="M118 150 L215 238 L292 300 M118 150 L92 470" stroke="#5a6170" stroke-width="3" stroke-dasharray="7 5" fill="none"/><text x="90" y="140" fill="#c9ced6" font-size="14" font-weight="600" font-family="-apple-system,sans-serif">Okhema</text><text x="300" y="292" fill="#c9ced6" font-size="14" font-weight="600" font-family="-apple-system,sans-serif">Aedes</text><text x="60" y="500" fill="#c9ced6" font-size="14" font-weight="600" font-family="-apple-system,sans-serif">Kremnos</text></svg>${dots}<span class="fm-me" style="left:${
    (280 / 393) * 100
  }%;top:346px"></span></div><div class="msh fm-sh"><span class="grab"></span><div class="sech big" style="margin-top:4px">People</div><div class="grp">${people
    .map(
      (p) =>
        `<div class="row">${av(p.who, 36)}<span class="col"><b>${nm(
          p.who
        )}</b><small class="l2">${p.st[2]}${
          p.note ? " · " + p.note : ""
        }</small></span><span class="rv">Now</span></div>`
    )
    .join("")}<div class="row">${av(
    "me",
    36
  )}<span class="col"><b>Me</b><small class="l2">Aedes Beach</small></span><span class="rv">Now</span></div></div></div>`;
  return {
    title: "",
    cls: "nolt mapp",
    html: pg({
      title: "",
      noNav: true,
      large: false,
      body,
      tab: tabbar(
        [
          ["p", "People", "person"],
          ["d", "Devices", "phone"],
          ["i", "Items", "dots"],
          ["m", "Me", "person"],
        ],
        "p",
        "void"
      ),
    }),
    mount(e) {
      clearInterval(window._fmT);
      window._fmT = setInterval(() => {
        if (!W || topP().fn !== findRoot) return clearInterval(window._fmT);
        rerender(topP());
      }, 4000);
    },
  };
}
function walletRoot() {
  const cards = (S.wallet || [])
    .map(
      (c, i) =>
        `<button class="wcard" style="background:linear-gradient(135deg,${
          c.color[0]
        },${c.color[1]});margin-top:${
          i ? -118 : 0
        }px" onclick="push(passPage,['${c.id}'])"><b>${c.title}</b><span>${
          c.sub
        }</span></button>`
    )
    .join("");
  return {
    title: "Wallet",
    html: pg({
      title: "Wallet",
      left: "<span></span>",
      right: `<button class="nbi">${I("plus", 23)}</button>`,
      body: `<div class="wstack">${cards}</div>`,
    }),
  };
}
function passPage(id) {
  const c = S.wallet.find((x) => x.id === id);
  see("w:" + id);
  if (c.tx) {
    const rows = c.tx
      .filter((t) => D(t.time) <= now())
      .map((t) => {
        const plus = t.amount[0] === "+";
        return `<div class="row txr"><span class="txi">${
          (t.who.match(/\p{L}/u) || ["?"])[0]
        }</span><span class="col"><b>${t.who}</b><small class="l2">${
          t.what
        }</small><small class="l2">${fDay(t.time)}, ${hm(
          t.time
        )}</small></span><span class="txa${plus ? " plus" : ""}">${
          plus ? "+" : ""
        }€${t.amount.replace(/^[-+]/, "")}</span></div>`;
      })
      .join("");
    return {
      title: c.title,
      cls: "nolt",
      html: pg({
        title: c.title,
        large: false,
        right: `<button class="nbl">Done</button>`,
        body: `<div class="wpass bank" style="background:linear-gradient(160deg,${c.color[0]},${c.color[1]})"><b>${c.title}</b><span>${c.sub}</span></div><div class="sech big">Latest Transactions</div><div class="grp">${rows}</div>`,
      }),
    };
  }
  return {
    title: c.title,
    cls: "nolt",
    html: pg({
      title: c.title,
      large: false,
      right: `<button class="nbl">Done</button>`,
      body: `<div class="wpass" style="background:linear-gradient(160deg,${c.color[0]},${c.color[1]})"><b>${c.title}</b><span>${c.sub}</span><div class="wdet">${c.detail}</div><div class="wqr">▚▞▚▞▚<br>▞▚▞▚▞<br>▚▞▚▞▚</div></div>`,
    }),
  };
}
function remindersRoot() {
  const n = now();
  const rs = (S.reminders || [])
    .slice()
    .sort((a, b) => a.done - b.done || D(a.due) - D(b.due));
  rs.forEach((r) => r.clue && see("r:" + r.text));
  const body = `<div class="plain">${rs
    .map((r) => {
      const od = !r.done && D(r.due) < n;
      return `<div class="rrow${r.done ? " done" : ""}"><span class="rck${
        r.done ? " on" : ""
      }"></span><span class="col"><span>${r.text}</span><small class="${
        od ? "red" : "l2"
      }">${fDay(r.due)}, ${hm(r.due)}${
        od ? " · overdue" : ""
      }</small></span></div>`;
    })
    .join("")}</div>`;
  return {
    title: "Reminders",
    cls: "remp",
    html: pg({
      title: "Reminders",
      left: `<button class="bk">${I("back", 22)}<span>Lists</span></button>`,
      right: `<button class="nbi">${I("dots", 24)}</button>`,
      body,
    }),
  };
}
const APPS = {
  findmy: findRoot,
  wallet: walletRoot,
  reminders: remindersRoot,
  messages: msgsRoot,
  phone: phoneRoot,
  mail: mailRoot,
  notes: notesRoot,
  photos: photosRoot,
  calendar: calRoot,
  voice: memosRoot,
  safari: safariRoot,
  settings: settingsRoot,
  clock: clockRoot,
  weather: weatherRoot,
  maps: mapsRoot,
  music: musicRoot,
  camera: cameraRoot,
};
// apps that open one level deep (like iOS remembering where you were)
const _open = openApp;
openApp = function (app, from, then) {
  const deep = {
    mail: () => push(inboxPage, [], false),
    notes: () => push(notesList, [], false),
  }[app];
  return _open(
    app,
    from,
    then
      ? () => {
          deep && !then.noDeep && deep();
          then();
        }
      : deep
  );
};

/* ===================================================================== EVENTS / TICK */
function evReady(ev) {
  if (fired[ev.id] || ev._live) return false;
  if (ev.call && (CALL || ALM)) return false;
  if (ev.alarm && (CALL || ALM)) return false;
  const af = (ev.after || (ev.at ? "start" : "unlock"))
    .split(",")
    .map((s) => s.trim());
  let tA = 0;
  for (const a of af) {
    const ft = fired[a];
    if (!ft) return false;
    tA = Math.max(tA, ft);
  }
  if (Date.now() < tA + (ev.delay || 0)) return false;
  if (ev.at && now() < D(ev.at)) return false;
  if (ev.seen && !ev.seen.split(",").every((k) => seen.has(k.trim())))
    return false;
  if (ev.any && !ev.any.split(",").some((k) => seen.has(k.trim())))
    return false;
  if (ev.clues && nClues() < ev.clues) return false;
  if (ev.flag) {
    const [k, v] = ev.flag.split("=");
    if (flags[k] !== v) return false;
  }
  return true;
}
function fire(ev) {
  fired[ev.id] = Date.now();
  if (ev.thread && ev.msgs) deliver(ev.thread, ev.msgs);
  if (ev.receipt) {
    const t = TH(ev.receipt.thread);
    t.receipt =
      ev.receipt.text + (/read/i.test(ev.receipt.text) ? " " + hm(now()) : "");
    if (isViewing(t.id)) {
      redrawThread(t);
      const r = $(`#msgs-${t.id} .rc`);
      r && r.classList.add("flip");
    }
  }
  if (ev.typing) {
    const t = TH(ev.typing.thread);
    showTyping(t, true);
    setTimeout(() => showTyping(t, false), ev.typing.ms || 5000);
  }
  if (ev.call) {
    delete fired[ev.id];
    ev._live = 1;
    incoming(ev.call, ev.id);
  }
  if (ev.alarm) alarmRing(ev.alarm);
  if (ev.notif) notify({ ...ev.notif, sound: "notif" });
  if (ev.mail) {
    S.mails.push({ ...ev.mail, unread: true, time: stamp(now()) });
    notify({
      app: "mail",
      title: ev.mail.from,
      text: `<b>${ev.mail.subj}</b>`,
      go: { app: "mail" },
    });
  }
  if (ev.finale) {
    const t = ev.thread && TH(ev.thread);
    const wait = () => {
      if (t && (t.busy || (t.q && t.q.length))) return setTimeout(wait, 400);
      finale = true;
      finT = Date.now();
      refresh();
    };
    wait();
  }
}
let lastMin = "";
function tick() {
  if (!clock0 || ended) return;
  const n = now(),
    t = hm(n);
  if (t !== lastMin) {
    lastMin = t;
    const c = $("#clk");
    c && (c.textContent = t);
    const lt = $("#lktime");
    lt && (lt.textContent = t);
    if (state === "lock") renderLockNs();
    if (state === "home" && !W) renderHome();
  }
  // battery: drains 1% every 150 s, never below 3% before the end
  const nb = Math.max(
    3,
    (S.battery ?? 20) - Math.floor((Date.now() - clock0) / 150000)
  );
  if (nb !== Math.round(battery)) {
    battery = nb;
    renderSB();
  }
  if (battery <= 10 && !lowWarned && state === "home" && !CALL && !ALM) {
    lowWarned = true;
    sfx("notif");
    alertBox({
      title: "Low Battery",
      msg: `${Math.round(battery)}% battery remaining`,
      btns: [
        {
          t: "Low Power Mode",
          fn: () => {
            lowPower = true;
            renderSB();
          },
        },
        { t: "Close", b: 1 },
      ],
    });
  }
  if (snz && n >= snz.at) {
    const id = snz.id;
    snz = null;
    alarmRing(id);
  }
  (S.events || []).forEach((ev) => {
    if (evReady(ev)) fire(ev);
  });
  if (
    finale &&
    S.finale &&
    S.finale.idle &&
    Date.now() - finT > S.finale.idle &&
    !KB
  )
    darkEnd();
}
setInterval(tick, 500);

/* ===================================================================== ENDINGS */
function darkEnd() {
  if (ended) return;
  finale = false;
  kbClose(true);
  ringStop();
  stopMedia();
  battery = 1;
  renderSB();
  if (state === "home")
    notify({
      app: "messages",
      title: nm("dei"),
      text: S.finale.lastText || "I’m on my way.",
      sound: "text",
    });
  setTimeout(() => {
    const o = $("#off");
    o.classList.add("on", "slow");
  }, 2200);
  setTimeout(() => ending("dark"), 4800);
}
function ending(k) {
  if (state === "end") return;
  ended = true;
  state = "end";
  ringStop();
  stopMedia();
  islandClose();
  const e = S.finale.endings[k];
  let found = [];
  try {
    found = JSON.parse(localStorage.getItem("lostphone-endings") || "[]");
    if (!found.includes(k)) found.push(k);
    localStorage.setItem("lostphone-endings", JSON.stringify(found));
  } catch (x) {
    found = [k];
  }
  const tot = Object.keys(S.finale.endings).length;
  const o = el("div", "end fadein");
  o.innerHTML = `<div class="end-in"><div class="end-k">${found.length} of ${tot} endings</div><h2>${e.title}</h2><div class="end-tx">${e.text}</div><p class="end-res">${S.resources}</p><button onclick="location.reload()">Read again</button></div>`;
  PH.appendChild(o);
  $("#off").classList.remove("on");
}

/* ===================================================================== BOOT */
function scrn(html, btn, fn) {
  const o = el("div", "end fadein");
  o.id = "intro";
  o.innerHTML = `<div class="end-in">${html}<button id="introbtn">${btn}</button></div>`;
  PH.appendChild(o);
  $("#introbtn").onclick = () => {
    o.remove();
    fn();
  };
}
function boot() {
  state = "boot";
  scrn(
    `<h2>Content warning</h2><div class="end-tx">${
      S.warning
    }</div><p class="end-res">${
      S.resources
    }</p><div class="sndrow"><button id="snd1" class="chip${
      sndOn ? " on" : ""
    }">${
      sndOn ? "🔊 Sound on" : "🔇 Sound off"
    }</button><span class="l2">Best with headphones.</span></div>`,
    "I understand, continue",
    () => scrn(`<div class="end-tx big">${S.intro}</div>`, "Pick it up", pickUp)
  );
  $("#snd1").onclick = () => {
    sndOn = !sndOn;
    $("#snd1").textContent = sndOn ? "🔊 Sound on" : "🔇 Sound off";
    $("#snd1").classList.toggle("on", sndOn);
    hudSync();
  };
}
function pickUp() {
  ac();
  clock0 = Date.now();
  fired.start = Date.now();
  state = "lock";
  PH.classList.add("locked");
  renderSB();
  renderLock();
  $("#lock").classList.add("wakeup");
  ambStart();
  setTimeout(() => {
    buzz(0, 0.3, 0.25);
    vib(200);
  }, 400);
  prog();
}
function hudSync() {
  const s = $("#hsnd"),
    a = $("#hamb");
  if (s) s.textContent = sndOn ? "🔊" : "🔇";
  if (a) {
    a.classList.toggle("off", !ambOn);
    a.title = ambOn ? "Waves: on" : "Waves: off";
  }
}
function hudSnd() {
  sndOn = !sndOn;
  if (!sndOn) {
    ringStop();
    ambStop();
    bedStop();
  } else if (state !== "boot") ambStart();
  hudSync();
}
function hudAmb() {
  ambOn = !ambOn;
  ambOn ? ambStart() : ambStop();
  hudSync();
}
let fullPref = false;
try {
  fullPref = localStorage.getItem("lp-full") === "1";
} catch (e) {}
function hudFull() {
  fullPref = !fullPref;
  try {
    localStorage.setItem("lp-full", fullPref ? "1" : "0");
  } catch (e) {}
  fit();
}
function fit() {
  const m =
    innerWidth <= 520 ||
    (innerHeight <= 520 && matchMedia("(pointer: coarse)").matches);
  const full = m && fullPref;
  document.body.classList.toggle("mob", m);
  document.body.classList.toggle("full", full);
  const hf = $("#hfull");
  if (hf) {
    hf.textContent = full ? "▢" : "⛶";
    hf.title = full ? "Show phone frame" : "Fullscreen";
  }
  const vh = window.visualViewport ? visualViewport.height : innerHeight;
  const k = full
    ? 1
    : m
    ? Math.min(1, (vh - 54) / 852, (innerWidth - 30) / 393)
    : Math.min(1, (innerHeight - 70) / 852, (innerWidth - 40) / 393);
  document.documentElement.style.setProperty("--k", k.toFixed(4));
}
if (window.visualViewport) visualViewport.addEventListener("resize", fit);
addEventListener("resize", fit);
fit();
renderSB();
hudSync();
boot();
