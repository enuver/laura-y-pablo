/* finale.js · escena final: mapa a todo color, confeti, dedicatoria, datos de la boda,
   cuenta atrás real y botón para volver a jugar. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h;

  let timer = null, raf = null;

  function confetti(cv) {
    const ctx = cv.getContext("2d");
    const colors = ["#ff5c93", "#ffd23f", "#2ec4b6", "#8f7bff", "#ff9f1c", "#ffffff", "#4dd0ff"];
    let W = 0, H = 0;
    const size = () => { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; };
    size(); window.addEventListener("resize", size);
    const parts = [];
    const spawn = (n, burst) => {
      for (let i = 0; i < n; i++) parts.push({
        x: burst ? W / 2 + (Math.random() - 0.5) * 80 : Math.random() * W,
        y: burst ? H * 0.35 : -12,
        vx: burst ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 1.6,
        vy: burst ? -Math.random() * 9 - 3 : Math.random() * 1.6 + 1,
        w: 5 + Math.random() * 6, hgt: 8 + Math.random() * 8, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
        c: colors[(Math.random() * colors.length) | 0], life: 0,
      });
    };
    if (QM.reduceMotion) { // una sola «foto» de confeti, sin movimiento
      spawn(70, false); parts.forEach((p) => { p.y = Math.random() * H; });
      ctx.clearRect(0, 0, W, H);
      parts.forEach((p) => { ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.w, p.hgt); });
      return;
    }
    spawn(110, true);
    let t0 = performance.now(), last = t0;
    function frame(now) {
      if (!cv.isConnected) { window.removeEventListener("resize", size); return; }
      const dt = Math.min(2, (now - last) / 16.7); last = now;
      const elapsed = (now - t0) / 1000;
      if (elapsed < 12 && Math.random() < 0.5) spawn(2, false);
      else if (Math.random() < 0.06) spawn(1, false);
      if (Math.random() < 0.004) spawn(60, true);
      ctx.clearRect(0, 0, W, H);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.vy += 0.12 * dt; p.vx *= 0.995; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life += dt;
        if (p.y > H + 20) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.hgt / 2, p.w, p.hgt * Math.abs(Math.cos(p.r * 0.7)) + 2); ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  QM.finale = {
    stop() { clearInterval(timer); timer = null; if (raf) cancelAnimationFrame(raf); raf = null; },
    show() {
      this.stop();
      const TX = C().TEXT.FINAL, W = C().WEDDING;
      QM.audio.music("final");
      QM.ui.hud.show(true, true); QM.ui.hud.update();

      const bgBoard = QM.map.build(null);
      QM.map.place(bgBoard, 5); QM.map.refresh(bgBoard, 5);
      bgBoard.querySelectorAll("button").forEach((b) => { b.tabIndex = -1; b.setAttribute("aria-hidden", "true"); });
      const mapCard = h("div", { class: "fin-map", role: "img", "aria-label": "El mapa del tablero, ya a todo color, con Laura y Pablo junto a la parroquia" }, bgBoard);
      const cv = h("canvas", { class: "confetti", "aria-hidden": "true" });

      const lauraC = h("div", { class: "fc fc-laura" }, h("div", { class: "fc-bubble", text: "¡¡LO HEMOS CONSEGUIDO!!" }), QM.sprites.char("laura", { pose: "cheer" }), h("b", { text: C().NAMES.laura }));
      const pabloC = h("div", { class: "fc fc-pablo" }, h("div", { class: "fc-bubble", text: "..." }), QM.sprites.char("pablo", { pose: "idle" }), h("b", { text: C().NAMES.pablo }));
      const items = h("ul", { class: "fin-items", "aria-label": "Objetos conseguidos" }, C().ITEMS.map((it, i) => h("li", null, QM.sprites.item(i, false), h("span", { text: it.name.replace(/^(El|La|Las|Los) /, "") }))));

      const phase = QM.time.phase();
      const cd = h("div", { class: "cd" });
      const cdBox = h("div", { class: "card fin-card cd-card" });
      const cdText = h("p", { class: "cd-text", "aria-live": "polite" });
      function buildCountdown() {
        const ms = QM.time.ms();
        const ph = QM.time.phase();
        cdBox.replaceChildren(h("h2", { text: ph === "after" ? W.AFTER_TITLE : TX.COUNTDOWN_TITLE }));
        if (ph === "after") {
          cdBox.append(h("p", { class: "cd-after", text: W.AFTER_TEXT }));
          clearInterval(timer); timer = null;
          return;
        }
        const p = QM.time.parts(ms);
        const unit = (n, l) => h("div", { class: "cd-unit" }, h("b", { text: String(n).padStart(2, "0") }), h("span", { text: l }));
        cd.replaceChildren(unit(p.d, TX.DAYS), unit(p.h, TX.HOURS), unit(p.m, TX.MINUTES), unit(p.s, TX.SECONDS));
        cdText.textContent = (ph === "today" ? W.TODAY_TEXT : QM.time.text() + " para la boda");
        cdBox.append(cd, cdText);
        cd.setAttribute("role", "timer"); cd.setAttribute("aria-label", QM.time.text());
      }
      let lastPhase = null;
      function tickCd() {
        const ph = QM.time.phase();
        if (ph !== lastPhase) { lastPhase = ph; buildCountdown(); return; }
        if (ph === "after") return;
        const p = QM.time.parts(QM.time.ms());
        const u = cd.querySelectorAll(".cd-unit b");
        if (u.length === 4) [p.d, p.h, p.m, p.s].forEach((v, i) => { u[i].textContent = String(v).padStart(2, "0"); });
        cdText.textContent = (ph === "today" ? W.TODAY_TEXT : QM.time.text() + " para la boda");
        cd.setAttribute("aria-label", QM.time.text());
      }
      buildCountdown(); lastPhase = phase;
      timer = setInterval(() => { if (!cv.isConnected) { QM.finale.stop(); return; } tickCd(); }, 1000);

      const D = C().DEDICATION;
      const scroll = h("div", { class: "fin-scroll" },
        h("h1", { class: "fin-title", text: TX.TITLE }),
        h("div", { class: "fin-left" },
          h("div", { class: "fin-chars" }, lauraC, h("span", { class: "title-heart big", "aria-hidden": "true", text: "♥" }), pabloC),
          mapCard),
        h("div", { class: "fin-right" },
          items,
          h("div", { class: "card fin-card data-card" },
            h("h2", { text: TX.DATA_TITLE }),
            h("dl", null,
              h("dt", { text: "Fecha" }), h("dd", { text: capital(QM.time.longDate()) }),
              h("dt", { text: "Hora" }), h("dd", { text: QM.time.clock() }),
              h("dt", { text: "Ceremonia" }), h("dd", { text: W.CEREMONY }),
              h("dt", { text: "Convite" }), h("dd", { text: W.PARTY.replace(/^Convite en /, "") }))),
          cdBox,
          h("p", { class: "moral", text: TX.MORAL }),
          h("button", { class: "btn btn-big", type: "button", text: C().UI.PLAY_AGAIN, onclick: async () => {
            if (await QM.ui.confirm(C().UI.RESTART_CONFIRM)) { QM.finale.stop(); QM.flow.restart(); }
          } })));

      const root = h("section", { class: "finale" }, h("div", { class: "fin-bg", "aria-hidden": "true" }), QM.snow(30), cv, scroll);
      QM.ui.show(root, "scr-finale");
      confetti(cv);
      QM.sfx("win");
    },
  };
  const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
})();
