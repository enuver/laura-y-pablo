/* audio.js · Todo el sonido se genera con la Web Audio API (sin archivos de audio).
   Las melodías son originales y están escritas más abajo como texto. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const A = (QM.audio = {});

  let ctx = null, master = null, sfxGain = null, musicGain = null;
  let muted = false;

  // ---------- notas ----------
  const BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(n) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(n);
    if (!m) return 60;
    return 12 * (parseInt(m[3], 10) + 1) + BASE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  }
  const freq = (n) => 440 * Math.pow(2, (midi(n) - 69) / 12);
  A.freq = freq;

  // ---------- contexto ----------
  // iOS: el audio solo arranca dentro de un toque, y el interruptor de silencio del iPhone
  // calla Web Audio salvo que suene un <audio> normal. Por eso se reproduce un audio mudo en bucle.
  let keep = null;
  function startKeepAlive() {
    if (keep) { if (keep.paused) keep.play().catch(() => {}); return; }
    try {
      const n = 800, b = new Uint8Array(44 + n), dv = new DataView(b.buffer);
      const w = (o, t) => { for (let i = 0; i < t.length; i++) b[o + i] = t.charCodeAt(i); };
      w(0, "RIFF"); dv.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
      dv.setUint32(24, 8000, true); dv.setUint32(28, 8000, true); dv.setUint16(32, 1, true); dv.setUint16(34, 8, true); w(36, "data"); dv.setUint32(40, n, true);
      for (let i = 0; i < n; i++) b[44 + i] = 128;
      keep = new Audio(URL.createObjectURL(new Blob([b], { type: "audio/wav" })));
      keep.loop = true; keep.volume = 0.01; keep.setAttribute("playsinline", ""); keep.play().catch(() => {});
    } catch (e) { /* sin audio de apoyo */ }
  }
  A.unlock = function () {
    try {
      if (!ctx) {
        const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = muted ? 0 : 0.9;
        sfxGain = ctx.createGain(); sfxGain.gain.value = 0.9;
        musicGain = ctx.createGain(); musicGain.gain.value = 0.55;
        sfxGain.connect(master); musicGain.connect(master); master.connect(ctx.destination);
      }
      if (ctx.state !== "running") { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
      startKeepAlive();
      // sonido casi mudo para «despertar» el audio en iOS
      try { const o = ctx.createOscillator(), g = ctx.createGain(); g.gain.value = 0.0001; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.05); } catch (e) { /* */ }
      return true;
    } catch (e) { return false; }
  };
  A.setMuted = function (m) {
    muted = !!m;
    if (master) master.gain.value = muted ? 0 : 0.9;
  };
  A.isMuted = () => muted;
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend(); if (keep) keep.pause(); } else if (!muted) { ctx.resume(); if (keep) keep.play().catch(() => {}); }
  });

  // ---------- primitivas ----------
  function tone(f, dur, o) {
    if (!ctx || muted) return;
    o = o || {};
    const t = o.when !== undefined ? o.when : ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(f, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    const v = o.vol !== undefined ? o.vol : 0.25;
    const a = o.attack !== undefined ? o.attack : 0.008;
    const r = Math.min(o.release !== undefined ? o.release : 0.08, dur * 0.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.setValueAtTime(v, t + Math.max(a, dur - r));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || sfxGain);
    osc.start(t); osc.stop(t + dur + 0.05);
  }
  A.tone = tone;

  function noise(dur, o) {
    if (!ctx || muted) return;
    o = o || {};
    const t = o.when !== undefined ? o.when : ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = o.filter || "lowpass"; f.frequency.value = o.freq || 1200;
    const g = ctx.createGain(); g.gain.value = o.vol !== undefined ? o.vol : 0.3;
    src.connect(f); f.connect(g); g.connect(sfxGain);
    src.start(t);
  }

  // Voz de coro: tres sierras desafinadas + filtro + vibrato suave.
  A.voice = function (f, dur, o) {
    if (!ctx || muted) return;
    o = o || {};
    dur = dur || 0.5;
    const t = ctx.currentTime;
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = Math.min(2600, f * 5); lp.Q.value = 1.5;
    const fm = ctx.createBiquadFilter(); fm.type = "peaking"; fm.frequency.value = 900; fm.gain.value = 7; fm.Q.value = 1.2;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.4;
    const lfoG = ctx.createGain(); lfoG.gain.value = 9; lfo.connect(lfoG);
    [-8, 0, 8].forEach((det) => {
      const osc = ctx.createOscillator();
      osc.type = o.type || "sawtooth"; osc.frequency.value = f; osc.detune.value = det;
      lfoG.connect(osc.detune);
      const og = ctx.createGain(); og.gain.value = 0.11;
      osc.connect(og); og.connect(lp);
      osc.start(t); osc.stop(t + dur + 0.2);
    });
    lp.connect(fm); fm.connect(g); g.connect(sfxGain);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9, t + 0.05);
    g.gain.setValueAtTime(0.9, t + Math.max(0.06, dur - 0.1));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    lfo.start(t); lfo.stop(t + dur + 0.2);
  };

  // ---------- efectos ----------
  const seq = (notes, step, o) => notes.forEach((n, i) => tone(freq(n), step * 1.4, Object.assign({ when: ctx ? ctx.currentTime + i * step : 0 }, o)));

  A.sfx = {
    click() { tone(660, 0.05, { type: "square", vol: 0.1 }); },
    ok() { seq(["E5", "A5"], 0.09, { type: "triangle", vol: 0.25 }); },
    bad() { tone(160, 0.28, { type: "sawtooth", vol: 0.18, slide: 90 }); },
    tick() { tone(1200, 0.025, { type: "square", vol: 0.05 }); },
    swap() { tone(420, 0.07, { type: "triangle", vol: 0.15, slide: 640 }); },
    nope() { tone(220, 0.12, { type: "square", vol: 0.12, slide: 150 }); },
    pop(level) {
      const base = ["C5", "D5", "E5", "G5", "A5", "C6", "E6"][Math.min(6, Math.max(0, (level || 1) - 1))];
      tone(freq(base), 0.14, { type: "triangle", vol: 0.22 });
      tone(freq(base) * 1.5, 0.1, { type: "sine", vol: 0.1, when: ctx ? ctx.currentTime + 0.04 : 0 });
    },
    special() { seq(["C5", "E5", "G5", "C6", "E6"], 0.05, { type: "square", vol: 0.12 }); },
    boom() { noise(0.4, { freq: 700, vol: 0.4 }); tone(90, 0.3, { type: "sine", vol: 0.3, slide: 40 }); },
    shuffle() { seq(["G4", "B4", "D5", "G5"], 0.07, { type: "triangle", vol: 0.18 }); },
    hit() { noise(0.18, { freq: 1800, vol: 0.35 }); tone(140, 0.15, { type: "square", vol: 0.15, slide: 70 }); },
    hurt() { noise(0.25, { freq: 900, vol: 0.3 }); tone(200, 0.25, { type: "sawtooth", vol: 0.14, slide: 80 }); },
    heal() { seq(["C5", "E5", "G5", "C6", "E6", "G6"], 0.07, { type: "sine", vol: 0.2 }); },
    buff() { seq(["G4", "C5", "E5"], 0.08, { type: "triangle", vol: 0.2 }); },
    duo() { seq(["C4", "G4", "C5", "E5", "G5", "C6"], 0.08, { type: "square", vol: 0.14 }); noise(0.3, { freq: 3000, vol: 0.12 }); },
    clumsy() { seq(["E5", "D5", "C5", "A4", "F4"], 0.08, { type: "sawtooth", vol: 0.12 }); },
    stun() { seq(["A5", "F5", "A5", "F5"], 0.06, { type: "square", vol: 0.1 }); },
    medal() { seq(["G5", "C6", "E6", "G6"], 0.07, { type: "triangle", vol: 0.25 }); },
    buzzer() { tone(120, 0.5, { type: "sawtooth", vol: 0.22 }); },
    lose() { seq(["E4", "D4", "C4", "A3"], 0.18, { type: "triangle", vol: 0.22 }); },
    win() { seq(["C5", "E5", "G5", "C6", "G5", "C6", "E6"], 0.1, { type: "triangle", vol: 0.26 }); },
    item() {
      seq(["C5", "E5", "G5", "C6", "E6", "G6", "C7"], 0.11, { type: "triangle", vol: 0.26 });
      seq(["C4", "G4", "C5"], 0.2, { type: "sine", vol: 0.2 });
    },
    whoosh() { noise(0.25, { freq: 2200, vol: 0.18, filter: "bandpass" }); },
  };

  // ---------- música ----------
  // Cada compás son 8 pasos (corcheas). Notas: "E5:2" = mi 5 durante 2 pasos; "-:2" = silencio.
  const CHORDS = {
    C: ["C4", "E4", "G4"], Am: ["A3", "C4", "E4"], F: ["F3", "A3", "C4"], G: ["G3", "B3", "D4"],
    Em: ["E3", "G3", "B3"], Dm: ["D4", "F4", "A4"],
  };
  const BASS = { C: "C3", Am: "A2", F: "F2", G: "G2", Em: "E2", Dm: "D3" };

  const TRACKS = {
    // Melodía de celebración: original, escrita para este juego.
    final: {
      bpm: 112, lead: "triangle", leadVol: 0.2, arpVol: 0.07, bell: true,
      bars: [
        { c: "C",  m: "E5:2 G5:2 C6:2 B5:1 G5:1" },
        { c: "Am", m: "A5:2 G5:2 E5:2 C5:2" },
        { c: "F",  m: "F5:2 A5:2 C6:2 A5:2" },
        { c: "G",  m: "B5:2 G5:2 D5:4" },
        { c: "C",  m: "E5:2 G5:2 C6:2 E6:2" },
        { c: "Am", m: "D6:2 C6:2 A5:2 G5:2" },
        { c: "F",  m: "F5:2 A5:1 G5:1 F5:2 D5:2" },
        { c: "C",  m: "C5:6 -:2" },
        { c: "C",  m: "G5:2 E6:2 D6:2 C6:2" },
        { c: "Em", m: "B5:2 G5:2 E5:4" },
        { c: "F",  m: "A5:2 C6:2 F6:2 E6:2" },
        { c: "G",  m: "D6:4 B5:2 G5:2" },
        { c: "Am", m: "C6:2 E6:2 A5:2 C6:2" },
        { c: "F",  m: "A5:2 F5:2 C6:4" },
        { c: "G",  m: "B5:2 D6:2 G6:4" },
        { c: "C",  m: "C6:6 -:2" },
      ],
    },
    // Tablero: calmada y juguetona.
    map: {
      bpm: 92, lead: "sine", leadVol: 0.12, arpVol: 0.06,
      bars: [
        { c: "C",  m: "-:2 G5:2 E5:2 -:2" },
        { c: "Am", m: "-:2 A5:2 C6:2 -:2" },
        { c: "F",  m: "-:2 A5:2 F5:2 -:2" },
        { c: "G",  m: "D5:2 B5:2 G5:4" },
        { c: "C",  m: "-:2 E5:2 G5:2 -:2" },
        { c: "Am", m: "C6:2 A5:2 E5:2 -:2" },
        { c: "F",  m: "A5:2 -:2 C6:4" },
        { c: "G",  m: "B5:2 A5:2 G5:4" },
      ],
    },
    // Batalla: más tensa y rápida.
    battle: {
      bpm: 150, lead: "square", leadVol: 0.07, arpVol: 0.05, bassPulse: true,
      bars: [
        { c: "Am", m: "A5:1 -:1 C6:1 -:1 E6:2 D6:1 C6:1" },
        { c: "F",  m: "A5:1 -:1 C6:1 -:1 F6:2 E6:1 C6:1" },
        { c: "C",  m: "G5:1 -:1 C6:1 -:1 E6:2 D6:1 C6:1" },
        { c: "G",  m: "B5:2 D6:2 G6:2 F6:1 D6:1" },
        { c: "Am", m: "E6:2 C6:1 A5:1 E6:2 C6:2" },
        { c: "F",  m: "F6:2 C6:1 A5:1 F6:2 E6:2" },
        { c: "Dm", m: "D6:2 A5:1 F5:1 D6:2 F6:2" },
        { c: "G",  m: "G5:1 B5:1 D6:1 G6:1 F6:2 D6:2" },
      ],
    },
  };

  function parseBar(str) {
    const out = []; let pos = 0;
    str.split(/\s+/).forEach((tok) => {
      const [n, d] = tok.split(":");
      const dur = parseInt(d || "1", 10);
      if (n !== "-") out.push({ at: pos, note: n, dur });
      pos += dur;
    });
    return out;
  }

  let song = { name: null, timer: null, step: 0, next: 0 };
  function scheduleStep(tr, step, t, stepDur) {
    const barIdx = Math.floor(step / 8) % tr.bars.length;
    const inBar = step % 8;
    const bar = tr.bars[barIdx];
    if (!bar._p) bar._p = parseBar(bar.m);
    // melodía
    bar._p.forEach((ev) => {
      if (ev.at === inBar) {
        const f = freq(ev.note);
        tone(f, ev.dur * stepDur * 0.95, { when: t, type: tr.lead, vol: tr.leadVol, dest: musicGain, attack: 0.012, release: 0.06 });
        if (tr.bell) tone(f * 2, ev.dur * stepDur * 0.6, { when: t, type: "sine", vol: 0.035, dest: musicGain });
      }
    });
    // arpegio
    const ch = CHORDS[bar.c];
    const an = ch[[0, 1, 2, 1][inBar % 4]];
    tone(freq(an), stepDur * 0.9, { when: t, type: "triangle", vol: tr.arpVol, dest: musicGain, attack: 0.01, release: 0.05 });
    // bajo
    if (tr.bassPulse) {
      tone(freq(BASS[bar.c]), stepDur * 0.8, { when: t, type: "triangle", vol: 0.12, dest: musicGain });
    } else if (inBar === 0 || inBar === 4) {
      tone(freq(BASS[bar.c]), stepDur * 3.6, { when: t, type: "sine", vol: 0.16, dest: musicGain, release: 0.2 });
    }
  }

  A.music = function (name) {
    if (song.name === name) return;
    if (song.timer) { clearInterval(song.timer); song.timer = null; }
    song.name = name || null;
    if (!name || !TRACKS[name]) { song.name = null; return; }
    const tr = TRACKS[name];
    song.step = 0; song.next = 0; song.started = false;
    const stepDur = 60 / tr.bpm / 2;
    song.timer = setInterval(() => {
      if (!ctx || muted || ctx.state !== "running") { song.started = false; return; }
      if (!song.started) { song.next = ctx.currentTime + 0.05; song.started = true; }
      while (song.next < ctx.currentTime + 0.3) {
        scheduleStep(tr, song.step, song.next, stepDur);
        song.next += stepDur; song.step++;
      }
    }, 90);
  };
  A.currentMusic = () => song.name;
})();
