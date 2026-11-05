/* core.js · utilidades, progreso guardado, fecha de la boda y piezas de interfaz comunes
   (diálogos, ventanas, recompensas, pantalla de fallo). */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  QM.games = QM.games || {};
  QM.logic = QM.logic || {};

  // ------------------------------------------------------------------ helpers
  const $ = (s, r) => (r || document).querySelector(s);
  QM.$ = $;
  QM.h = function (tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === false || v == null) continue;
      if (k === "class") el.className = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    for (let i = 2; i < arguments.length; i++) {
      [].concat(arguments[i]).forEach((c) => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c)); });
    }
    return el;
  };
  const h = QM.h;
  QM.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  QM.rnd = (n) => Math.floor(Math.random() * n);
  QM.pick = (a) => a[QM.rnd(a.length)];
  QM.shuffle = function (a, rng) {
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  QM.reduceMotion = !!(globalThis.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  QM.snow = (n) => { const d = h("div", { class: "snow", "aria-hidden": "true" }); for (let i = 0; i < (n || 24); i++) d.append(h("i", { style: `left:${(i * 37) % 100}%;animation-delay:${-(i * 7 % 9)}s;animation-duration:${7 + (i % 5)}s;width:${5 + i % 4 * 2}px;height:${5 + i % 4 * 2}px` })); return d; };
  QM.sfx = (n, a) => { try { QM.audio.sfx[n](a); } catch (e) { /* sin audio */ } };

  // --------------------------------------------------------- progreso guardado
  const KEY = "queda-un-mes-v1";
  const DEFAULT = () => ({ v: 1, items: [false, false, false, false], fails: [0, 0, 0, 0], skipped: [false, false, false, false], helped: [false, false, false, false], seen: [false, false, false, false], muted: false, introSeen: false, difficulty: "standard" });
  QM.state = DEFAULT();
  QM.save = {
    load() { try { const s = localStorage.getItem(KEY); if (s) QM.state = Object.assign(DEFAULT(), JSON.parse(s)); } catch (e) { /* sin localStorage */ } },
    write() { try { localStorage.setItem(KEY, JSON.stringify(QM.state)); } catch (e) { /* sin localStorage */ } },
    reset() { const m = QM.state.muted; QM.state = DEFAULT(); QM.state.muted = m; this.write(); },
  };
  QM.progress = () => QM.state.items.filter(Boolean).length;
  QM.nextTrial = () => QM.state.items.indexOf(false);

  // ------------------------------------------------------------ fecha de boda
  const MADRID = "Europe/Madrid";
  QM.time = {
    target() { return Date.parse(C().WEDDING.DATE_ISO); },
    ms(now) { return this.target() - (now === undefined ? Date.now() : now); },
    parts(ms) {
      const t = Math.max(0, Math.floor(ms / 1000));
      return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
    },
    ymd(date) {
      try { return new Intl.DateTimeFormat("en-CA", { timeZone: MADRID, year: "numeric", month: "2-digit", day: "2-digit" }).format(date); }
      catch (e) { return date.toISOString().slice(0, 10); }
    },
    phase(now) {
      const ms = this.ms(now);
      if (ms <= 0) return "after";
      return this.ymd(new Date(now === undefined ? Date.now() : now)) === this.ymd(new Date(this.target())) ? "today" : "before";
    },
    text(now) {
      const ms = this.ms(now);
      if (ms <= 0) return "Ya ha llegado el gran día";
      const p = this.parts(ms);
      if (p.d >= 2) return "Faltan " + p.d + " días";
      if (p.d === 1) return "Falta 1 día";
      if (p.h >= 2) return "Faltan " + p.h + " horas";
      if (p.h === 1) return "Falta 1 hora";
      if (p.m >= 2) return "Faltan " + p.m + " minutos";
      if (p.m === 1) return "Falta 1 minuto";
      return "Falta menos de un minuto";
    },
    longDate() {
      try {
        return new Intl.DateTimeFormat("es-ES", { timeZone: MADRID, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(this.target()));
      } catch (e) { return "5 de diciembre de 2026"; }
    },
    clock() {
      try { return new Intl.DateTimeFormat("es-ES", { timeZone: MADRID, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(this.target())) + " h"; }
      catch (e) { return "12:00 h"; }
    },
  };

  QM.fmt = function (s) {
    return String(s)
      .replace(/\{apodo\}/g, C().NICKNAME_PABLO)
      .replace(/\{faltan\}/g, QM.time.text())
      .replace(/\{who\}/g, "");
  };

  // ------------------------------------------------------ dificultad / modo caos
  QM.applyMods = function (base, mods) {
    const out = Object.assign({}, base);
    (mods || []).forEach((m) => {
      const set = (k, f) => {
        if (k === "ATTACKS_DMG") { out.ATTACKS = out.ATTACKS.map((a) => Object.assign({}, a, { dmg: Math.max(1, Math.round(f(a.dmg))) })); return; }
        if (typeof out[k] !== "number") return;
        const b = out[k]; let v = f(b);
        if (Number.isInteger(b)) { v = Math.round(v); if (b > 0 && v < 1 && !(m.mul && m.mul[k] === 0)) v = 1; if (v < 0) v = 0; }
        out[k] = v;
      };
      Object.keys(m.mul || {}).forEach((k) => set(k, (x) => x * m.mul[k]));
      Object.keys(m.add || {}).forEach((k) => set(k, (x) => x + m.add[k]));
    });
    return out;
  };
  QM.chaosPick = function (game) {
    const pool = (C().CHAOS_MODS[game] || []).slice();
    QM.shuffle(pool);
    const out = [];
    pool.forEach((m) => { if (out.length < 2 && !out.some((o) => o.group === m.group)) out.push(m); });
    return out;
  };

  // ------------------------------------------------------------------ sonido
  QM.setMuted = function (m) {
    QM.state.muted = !!m;
    QM.audio.setMuted(m);
    QM.save.write();
    QM.ui.hud.update();
  };

  // ---------------------------------------------------------------- interfaz
  const UI = (QM.ui = {});
  const screen = () => $("#screen");

  UI.show = function (el, cls) {
    const s = screen();
    s.className = cls || "";
    s.replaceChildren(el);
    return el;
  };

  const ICON_SOUND_ON = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const ICON_SOUND_OFF = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  const ICON_MENU = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

  UI.hud = {
    init() {
      $("#btn-mute").addEventListener("click", () => { QM.audio.unlock(); QM.setMuted(!QM.state.muted); QM.sfx("click"); });
      $("#btn-menu").addEventListener("click", () => { QM.audio.unlock(); QM.sfx("click"); UI.menu(); });
      this.update();
    },
    show(items, menu) {
      $("#hud").hidden = false;
      $("#hud-items").hidden = !items;
      $("#btn-menu").hidden = !menu;
    },
    update() {
      const u = C().UI, m = QM.state.muted;
      const b = $("#btn-mute");
      b.innerHTML = m ? ICON_SOUND_OFF : ICON_SOUND_ON;
      b.setAttribute("aria-pressed", String(m));
      b.setAttribute("aria-label", m ? u.MUTE_OFF + " (pulsa para activar)" : u.MUTE_ON + " (pulsa para silenciar)");
      b.title = m ? u.MUTE_OFF : u.MUTE_ON;
      $("#btn-menu").innerHTML = ICON_MENU;
      $("#btn-menu").setAttribute("aria-label", u.MENU);
      const box = $("#hud-items");
      box.replaceChildren();
      C().ITEMS.forEach((it, i) => {
        const got = QM.state.items[i];
        const slot = h("span", { class: "slot" + (got ? " got" : ""), role: "img", "aria-label": it.name + (got ? " (conseguido)" : " (pendiente)"), title: it.name });
        slot.append(QM.sprites.item(i, !got));
        box.append(slot);
      });
      box.append(h("span", { class: "hud-count", text: QM.progress() + "/4" }));
    },
  };

  // ---- toast
  let toastT = null;
  UI.toast = function (text) {
    const t = $("#toast");
    t.textContent = text; t.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("on"), 2200);
  };

  // ---- diálogo con máquina de escribir
  const BLIP = { laura: [520, 760], pablo: [170, 210], leire: [440, 600], host: [330, 420], caos: [90, 140] };
  UI.dialog = function (lines) {
    if (typeof lines === "string") lines = C().DIALOGS[lines];
    return new Promise((resolve) => {
      const root = $("#dialog");
      const pEl = $(".dlg-portrait", root), nameEl = $(".dlg-name", root), textEl = $(".dlg-text", root), live = $("#dlg-live");
      let i = 0, timer = null, full = "", pos = 0, typing = false, done = false;
      root.hidden = false;
      document.body.classList.add("in-dialog");

      function blip(who) {
        const b = BLIP[who]; if (!b) return;
        try { QM.audio.tone(b[0] + Math.random() * (b[1] - b[0]), 0.035, { type: "square", vol: 0.04 }); } catch (e) { /* */ }
      }
      function stopTyping() { clearInterval(timer); typing = false; textEl.textContent = full; root.classList.remove("typing"); }
      function show() {
        const [who, raw] = lines[i];
        full = QM.fmt(raw); pos = 0; textEl.textContent = "";
        pEl.replaceChildren(QM.sprites.portrait(who));
        root.dataset.who = who;
        nameEl.textContent = C().NAMES[who] || ""; nameEl.hidden = !nameEl.textContent;
        live.textContent = (C().NAMES[who] ? C().NAMES[who] + ": " : "") + full;
        if (QM.reduceMotion) { textEl.textContent = full; return; }
        typing = true; root.classList.add("typing");
        let tick = 0;
        timer = setInterval(() => {
          pos += 1; textEl.textContent = full.slice(0, pos);
          if (++tick % 3 === 0 && full[pos - 1] !== " ") blip(who);
          if (pos >= full.length) stopTyping();
        }, C().UI.TYPE_MS || 34);
      }
      function advance() {
        if (done) return;
        QM.audio.unlock();
        if (typing) { stopTyping(); return; }
        i++;
        if (i >= lines.length) finish(); else { QM.sfx("click"); show(); }
      }
      function finish() {
        if (done) return; done = true;
        clearInterval(timer);
        root.hidden = true; document.body.classList.remove("in-dialog");
        root.removeEventListener("click", onClick);
        document.removeEventListener("keydown", onKey, true);
        resolve();
      }
      function onClick(e) {
        if (e.target.closest(".dlg-skip")) { finish(); return; }
        advance();
      }
      function onKey(e) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); advance(); }
        else if (e.key === "Escape") { e.preventDefault(); finish(); }
      }
      $(".dlg-skip", root).textContent = C().UI.SKIP + " ⏭";
      root.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey, true);
      show();
    });
  };

  // ---- ventanas modales
  UI.modal = function (o) {
    return new Promise((resolve) => {
      const root = $("#modal");
      const card = h("div", { class: "card modal-card", role: "dialog", "aria-modal": "true", "aria-label": o.title || "Aviso" });
      if (o.icon) card.append(h("div", { class: "modal-icon" }, o.icon));
      if (o.title) card.append(h("h2", { class: "modal-title", text: o.title }));
      if (o.text) card.append(h("p", { class: "modal-text", text: o.text }));
      if (o.node) card.append(o.node);
      const row = h("div", { class: "btn-row" });
      (o.buttons || [{ id: "ok", label: "Vale", primary: true }]).forEach((b) => {
        row.append(h("button", { class: "btn" + (b.primary ? "" : " btn-alt") + (b.small ? " btn-small" : ""), type: "button", "data-id": b.id, text: b.label,
          onclick() { QM.sfx("click"); close(b.id); } }));
      });
      card.append(row);
      root.replaceChildren(card);
      root.hidden = false;
      document.body.classList.add("in-modal");
      const first = card.querySelector("button"); if (first) first.focus({ preventScroll: true });
      function close(id) {
        root.hidden = true; root.replaceChildren(); document.body.classList.remove("in-modal");
        document.removeEventListener("keydown", onKey, true);
        resolve(id);
      }
      function onKey(e) { if (e.key === "Escape" && o.cancel) { e.preventDefault(); close(o.cancel); } }
      document.addEventListener("keydown", onKey, true);
    });
  };

  UI.confirm = (text) => UI.modal({ text, buttons: [{ id: "yes", label: C().UI.YES, primary: true }, { id: "no", label: C().UI.NO }], cancel: "no" }).then((r) => r === "yes");

  UI.menu = async function () {
    const buttons = [{ id: "close", label: "Seguir jugando", primary: true }];
    if (UI.canQuit && UI.canQuit()) buttons.push({ id: "quit", label: C().UI.BACK_TO_MAP });
    else {
      if (QM.progress() > 0) buttons.push({ id: "map", label: "Mapa: volver a jugar una prueba" });
      buttons.push({ id: "diff", label: C().DIFFICULTY.SWITCH });
    }
    buttons.push({ id: "restart", label: C().GAME.NEW_GAME });
    const r = await UI.modal({ title: C().UI.MENU, buttons, cancel: "close" });
    if (r === "quit") UI.doQuit && UI.doQuit();
    if (r === "diff") QM.flow.pickDifficulty(false);
    if (r === "map") QM.flow.openMap();
    if (r === "restart" && (await UI.confirm(C().UI.RESTART_CONFIRM))) { QM.flow.restart(); }
  };

  // ---- recompensa de objeto
  UI.reward = async function (idx) {
    const it = C().ITEMS[idx];
    const big = QM.sprites.item(idx, false); big.classList.add("item-big");
    const wrap = h("div", { class: "reward" }, h("div", { class: "rays", "aria-hidden": "true" }), big,
      h("div", { class: "sparks", "aria-hidden": "true" }, [1, 2, 3, 4, 5, 6].map((n) => h("i", { class: "sp sp" + n }))));
    QM.sfx("item");
    await UI.modal({ title: "¡Objeto conseguido!", node: h("div", null, wrap, h("p", { class: "item-name", text: it.name }), h("p", { class: "modal-text", text: it.desc })), buttons: [{ id: "ok", label: C().UI.NEXT, primary: true }] });
  };

  // ---- pantalla de fallo: devuelve 'retry' | 'help' | 'skip' | 'quit'
  UI.fail = async function (idx, extra) {
    const u = C().UI, B = C().BALANCE;
    const fails = QM.state.fails[idx];
    const canHelp = fails >= B.HELP_AFTER_FAILS;
    const t = u.FAIL_TITLES[Math.min(fails - 1, u.FAIL_TITLES.length - 1)] || u.FAIL_TITLES[0];
    const buttons = [{ id: "retry", label: u.RETRY, primary: true }];
    const canLower = canHelp && QM.state.difficulty !== "easy" && !QM.state.helped[idx];
    if (canHelp) {
      if (canLower) buttons.push({ id: "help", label: C().DIFFICULTY.HELP_BTN });
      buttons.push({ id: "skip", label: u.SKIP_BTN });
    }
    buttons.push({ id: "quit", label: u.BACK_TO_MAP, small: true });
    QM.sfx("lose");
    return UI.modal({
      title: extra && extra.title ? extra.title : t,
      text: (extra && extra.text ? extra.text + " " : "") + (canHelp ? (canLower ? C().DIFFICULTY.RECOMMEND : C().DIFFICULTY.RECOMMEND_EASY) : QM.pick(u.FAIL_TEXTS)),
      node: h("p", { class: "fail-count", text: "Intentos fallidos: " + fails }),
      buttons,
    });
  };
})();
