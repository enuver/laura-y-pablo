/* match3.js · Prueba 3: Huerta de Peñalén (tres en raya).
   Las reglas están en match3-logic.js; aquí solo está la pantalla y las animaciones.
   Las fichas son iconos originales dibujados en SVG. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h;
  const L = () => QM.logic.match3;
  const N = 7;
  const OUT = 'stroke="#2a2140" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';

  // Seis iconos de boda y banquete: cada uno con forma y color propios.
  const ICONS = [
    // 0 · anillo
    `<circle cx="50" cy="63" r="25" fill="none" stroke="#2a2140" stroke-width="17"/><circle cx="50" cy="63" r="25" fill="none" stroke="#ffc933" stroke-width="11"/><path d="M33 52a22 22 0 0 1 14-9" fill="none" stroke="#fff3b0" stroke-width="4" stroke-linecap="round"/><path d="M50 12L66 28L50 46L34 28Z" fill="#8be9fd" ${OUT}/><path d="M50 12L58 28L50 46L42 28Z" fill="#c9f6ff"/>`,
    // 1 · tarta
    `<rect x="14" y="62" width="72" height="26" rx="6" fill="#ff7fa8" ${OUT}/><rect x="24" y="42" width="52" height="22" rx="5" fill="#fff0d6" ${OUT}/><rect x="34" y="26" width="32" height="18" rx="5" fill="#ff7fa8" ${OUT}/><path d="M16 72q6 8 12 0t12 0 12 0 12 0 12 0 8 0" fill="none" stroke="#fff" stroke-width="4"/><rect x="48" y="14" width="4" height="12" fill="#fff" ${OUT}/><path d="M50 4q5 5 0 9q-5-4 0-9z" fill="#ffb703" ${OUT}/><circle cx="36" cy="55" r="3" fill="#e5173f"/><circle cx="64" cy="55" r="3" fill="#e5173f"/>`,
    // 2 · copa de cava
    `<path d="M32 10h36l-4 40a14 14 0 0 1-28 0z" fill="#e8fbff" ${OUT}/><path d="M35 28h30l-2 22a12 12 0 0 1-26 0z" fill="#ffd23f"/><path d="M50 62v22M34 90h32" fill="none" stroke="#2a2140" stroke-width="9" stroke-linecap="round"/><path d="M50 62v22M34 90h32" fill="none" stroke="#9ad6e6" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="40" r="2.6" fill="#fff"/><circle cx="55" cy="34" r="2" fill="#fff"/><circle cx="52" cy="46" r="1.8" fill="#fff"/>`,
    // 3 · ramo de flores
    `<path d="M50 54l-18 36M50 54l0 38M50 54l18 36" fill="none" stroke="#2f8a4f" stroke-width="5" stroke-linecap="round"/><path d="M36 72q-14 2-16 12q12 2 18-6zM64 72q14 2 16 12q-12 2-18-6z" fill="#3ea661" ${OUT}/><g ${OUT}><circle cx="30" cy="44" r="11" fill="#c77dff"/><circle cx="70" cy="44" r="11" fill="#c77dff"/><circle cx="50" cy="28" r="12" fill="#ff7fa8"/><circle cx="50" cy="52" r="10" fill="#fff"/></g><circle cx="30" cy="44" r="4" fill="#ffd23f"/><circle cx="70" cy="44" r="4" fill="#ffd23f"/><circle cx="50" cy="28" r="4.5" fill="#ffd23f"/><circle cx="50" cy="52" r="3.6" fill="#ff9f1c"/><path d="M42 80l8 6 8-6" fill="#ff4d6d" ${OUT}/>`,
    // 4 · naranja
    `<circle cx="50" cy="56" r="33" fill="#ff9f1c" ${OUT}/><path d="M28 44a26 26 0 0 1 16-14" fill="none" stroke="#ffd08a" stroke-width="6" stroke-linecap="round"/><path d="M50 24q2-14 18-16q-2 14-18 16z" fill="#3ea661" ${OUT}/><circle cx="50" cy="26" r="3" fill="#6b4423"/><path d="M40 62l20 0M50 52l0 20" stroke="#e07b00" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,
    // 5 · corazón
    `<path d="M50 88C20 66 10 48 18 32c8-14 26-12 32 2c6-14 24-16 32-2c8 16-2 34-32 56z" fill="#ff3d6e" ${OUT}/><path d="M26 38c2-8 10-10 15-5" fill="none" stroke="#ffb3c6" stroke-width="6" stroke-linecap="round"/>`,
  ];
  const SPECIAL = {
    row: '<path d="M8 50h84M22 38l-14 12 14 12M78 38l14 12-14 12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 50h84M22 38l-14 12 14 12M78 38l14 12-14 12" fill="none" stroke="#2a2140" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    col: '<path d="M50 8v84M38 22l12-14 12 14M38 78l12 14 12-14" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 8v84M38 22l12-14 12 14M38 78l12 14 12-14" fill="none" stroke="#2a2140" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>',
    bomb: '<circle cx="50" cy="50" r="40" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="10 7"/><path d="M50 14v14M50 72v14M14 50h14M72 50h14M25 25l10 10M65 65l10 10M75 25L65 35M35 65L25 75" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
  };
  const RAINBOW = `<circle cx="50" cy="50" r="40" fill="#2a2140"/><path d="M50 50L50 10A40 40 0 0 1 84.6 30z" fill="#ff4d6d"/><path d="M50 50L84.6 30A40 40 0 0 1 84.6 70z" fill="#ffd23f"/><path d="M50 50L84.6 70A40 40 0 0 1 50 90z" fill="#2ec4b6"/><path d="M50 50L50 90A40 40 0 0 1 15.4 70z" fill="#4d96ff"/><path d="M50 50L15.4 70A40 40 0 0 1 15.4 30z" fill="#a66bff"/><path d="M50 50L15.4 30A40 40 0 0 1 50 10z" fill="#ff9f1c"/><circle cx="50" cy="50" r="40" fill="none" ${OUT}/><path d="M50 30l5 13 14 1-11 9 4 14-12-8-12 8 4-14-11-9 14-1z" fill="#fff" ${OUT}/>`;

  function tileSvg(t, s) {
    if (s === "rainbow") return `<svg viewBox="0 0 100 100" aria-hidden="true">${RAINBOW}</svg>`;
    return `<svg viewBox="0 0 100 100" aria-hidden="true">${ICONS[t]}${s ? '<g class="sp-ov">' + SPECIAL[s] + "</g>" : ""}</svg>`;
  }
  const SPECIAL_NAME = { row: "limpia fila", col: "limpia columna", bomb: "bomba", rainbow: "arcoíris" };

  QM.games.match3 = {
    attempt(ctx) {
      return new Promise((resolve) => {
        const TX = C().TEXT.MATCH3;
        const B = C().BALANCE.MATCH3;
        const moves0 = B.MOVES + (ctx.help ? B.HELP.EXTRA_MOVES : 0);
        const goal = Math.round(B.GOAL * (ctx.help ? B.HELP.GOAL_FACTOR : 1));
        const rng = Math.random;
        const board = L().newBoard(rng);
        let moves = moves0, score = 0, busy = true, sel = null, finished = false, hintT = null;
        const els = new Map();

        const movesEl = h("b", { class: "or-moves-n", text: String(moves) });
        const scoreEl = h("b", { class: "or-score-n", text: "0" });
        const fill = h("i", { class: "or-fill" });
        const bar = h("div", { class: "or-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(goal), "aria-valuenow": "0", "aria-label": TX.GOAL }, fill, h("span", { class: "or-star", "aria-hidden": "true", text: "★" }));
        const msg = h("p", { class: "or-msg", role: "status", "aria-live": "polite", text: TX.HINT });
        const boardEl = h("div", { class: "m3-board", role: "grid", "aria-label": "Tablero de 7 por 7" });
        const fx = h("div", { class: "m3-fx", "aria-hidden": "true" });
        const hintBtn = h("button", { type: "button", class: "btn btn-alt btn-small", text: "Pista", onclick() { showHint(true); } });
        const root = h("section", { class: "orchard" },
          h("div", { class: "or-sky", "aria-hidden": "true" }, h("i", { class: "or-cloud c1" }), h("i", { class: "or-cloud c2" }), h("i", { class: "or-sun" })),
          h("div", { class: "or-top" },
            h("div", { class: "or-stat" }, h("span", { text: TX.MOVES }), movesEl),
            h("div", { class: "or-goal" }, h("div", { class: "or-goal-row" }, h("span", { text: TX.SCORE + " " }), scoreEl, h("span", { text: " / " + goal + " " + TX.GOAL.toLowerCase() })), bar),
            hintBtn),
          h("div", { class: "m3-wrap" }, h("div", { class: "m3-frame" }, boardEl, fx)),
          msg);
        ctx.root = root;
        QM.ui.show(root, "scr-orchard");

        // --- helpers de posición
        const place = (el, r, c) => { el.style.transform = `translate(${c * 100}%, ${r * 100}%)`; el.dataset.r = r; el.dataset.c = c; };
        function makeTile(t, r, c) {
          const el = h("div", { class: "tile t" + t.t + (t.s ? " special sp-" + t.s : ""), "data-id": t.id, role: "gridcell", tabindex: "-1",
            "aria-label": TX.TILES[t.t] + (t.s ? " (" + SPECIAL_NAME[t.s] + ")" : "") + ", fila " + (r + 1) + ", columna " + (c + 1), html: tileSvg(t.t, t.s) });
          if (t.s === "rainbow") el.classList.add("t-rainbow");
          place(el, r, c);
          els.set(t.id, el);
          return el;
        }
        function relabel(el, tileId) { const r = +el.dataset.r, c = +el.dataset.c; el.setAttribute("aria-label", el.getAttribute("aria-label").replace(/, fila \d+, columna \d+$/, "") + ", fila " + (r + 1) + ", columna " + (c + 1)); }
        const cellEl = (r, c) => { const t = board[r][c]; return t ? els.get(t.id) : null; };

        function setScore(v) {
          score = v; scoreEl.textContent = String(score);
          const p = Math.min(100, score / goal * 100);
          fill.style.width = p + "%"; bar.setAttribute("aria-valuenow", String(Math.min(score, goal)));
          bar.classList.toggle("full", score >= goal);
        }
        function setMoves(v) { moves = v; movesEl.textContent = String(moves); movesEl.parentElement.classList.toggle("low", moves <= 3); }
        const say = (t) => { msg.textContent = t; msg.classList.remove("pop"); void msg.offsetWidth; msg.classList.add("pop"); };

        // --- efectos
        function particles(el, color) {
          if (QM.reduceMotion) return;
          const fr = fx.getBoundingClientRect(), br = el.getBoundingClientRect();
          const cx = br.left - fr.left + br.width / 2, cy = br.top - fr.top + br.height / 2;
          for (let i = 0; i < 7; i++) {
            const p = h("i", { class: "pt", style: `left:${cx}px;top:${cy}px;background:${color}` });
            fx.append(p);
            const a = Math.random() * 6.28, d = 24 + Math.random() * 38;
            const an = p.animate([{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 }, { transform: `translate(${Math.cos(a) * d - 4}px,${Math.sin(a) * d - 4}px) scale(.2)`, opacity: 0 }], { duration: 480 + Math.random() * 200, easing: "ease-out" });
            an.onfinish = () => p.remove();
          }
        }
        function floater(text, el, cls) {
          const fr = fx.getBoundingClientRect(), br = el.getBoundingClientRect();
          const f = h("b", { class: "float " + (cls || ""), text, style: `left:${br.left - fr.left + br.width / 2}px;top:${br.top - fr.top}px` });
          fx.append(f); setTimeout(() => f.remove(), 950);
        }
        const COLORS = ["#ffc933", "#ff7fa8", "#9ad6e6", "#c77dff", "#ff9f1c", "#ff3d6e"];

        async function animateSteps(res) {
          for (const st of res.steps) {
            if (!ctx.alive) return;
            // 1 · fichas que desaparecen
            st.cleared.forEach((x) => {
              const el = els.get(x.id); if (!el) return;
              el.classList.add("pop"); particles(el, x.t >= 0 ? COLORS[x.t] : "#fff");
            });
            QM.sfx("pop", st.level);
            if (st.activated.length) QM.sfx(st.activated.some((a) => a.s === "bomb" || a.s === "rainbow") ? "boom" : "special");
            if (st.cleared.length) {
              const mid = st.cleared[Math.floor(st.cleared.length / 2)];
              const el = els.get(mid.id);
              if (el) floater("+" + st.score, el, st.level > 1 ? "big" : "");
            }
            if (st.level > 1) say(TX.COMBO[Math.min(st.level - 2, TX.COMBO.length - 1)] + " ×" + st.level);
            setScore(score + st.score);
            await QM.sleep(QM.reduceMotion ? 60 : 260);
            st.cleared.forEach((x) => { const el = els.get(x.id); if (el) { el.remove(); els.delete(x.id); } });
            // 2 · nuevas especiales
            st.created.forEach((x) => {
              const el = makeTile(x, x.r, x.c); el.classList.add("born"); boardEl.append(el);
              setTimeout(() => el.classList.remove("born"), 400);
            });
            if (st.created.length) QM.sfx("special");
            // 3 · caída
            st.falls.forEach((f) => { const el = els.get(f.id); if (el) { place(el, f.r, f.c); } });
            st.spawns.forEach((s) => {
              const el = makeTile({ id: s.id, t: s.t, s: null }, s.fromR, s.c);
              boardEl.append(el);
            });
            await QM.sleep(30);
            st.spawns.forEach((s) => { const el = els.get(s.id); if (el) place(el, s.r, s.c); });
            await QM.sleep(QM.reduceMotion ? 60 : 340);
          }
          if (res.shuffled) {
            say(TX.SHUFFLE); QM.sfx("shuffle");
            res.shuffled.forEach((m) => { const el = els.get(m.id); if (el) place(el, m.r, m.c); });
            boardEl.classList.add("shuffling"); await QM.sleep(600); boardEl.classList.remove("shuffling");
          }
          els.forEach((el) => relabel(el));
        }

        // --- jugada
        async function trySwap(a, b) {
          if (busy || finished || !ctx.alive) return;
          if (!L().adjacent(a, b)) return;
          busy = true; clearSel(); clearHint();
          const ea = cellEl(a[0], a[1]), eb = cellEl(b[0], b[1]);
          const res = L().trySwap(board, a, b, rng);
          QM.sfx("swap");
          if (!res.valid) {
            place(ea, b[0], b[1]); place(eb, a[0], a[1]);
            await QM.sleep(170);
            place(ea, a[0], a[1]); place(eb, b[0], b[1]);
            ea.classList.add("shake"); eb.classList.add("shake"); QM.sfx("nope");
            say("Esa jugada no junta nada.");
            await QM.sleep(260); ea.classList.remove("shake"); eb.classList.remove("shake");
            busy = false; armHint(); return;
          }
          place(ea, b[0], b[1]); place(eb, a[0], a[1]);
          await QM.sleep(QM.reduceMotion ? 40 : 190);
          setMoves(moves - 1);
          await animateSteps(res);
          if (!ctx.alive) return;
          if (score >= goal) { finished = true; say(TX.WIN); QM.sfx("win"); boardEl.classList.add("celebrate"); await QM.sleep(1500); resolve("win"); return; }
          if (moves <= 0) { finished = true; say(TX.LOSE); await QM.sleep(1300); resolve("lose"); return; }
          if (moves <= 3) say("¡Quedan " + moves + " movimientos!");
          busy = false; armHint();
        }

        // --- entrada: toque y arrastre
        function clearSel() { if (sel) { const el = cellEl(sel[0], sel[1]); if (el) el.classList.remove("sel"); sel = null; } }
        function select(r, c) { clearSel(); sel = [r, c]; const el = cellEl(r, c); if (el) el.classList.add("sel"); QM.sfx("click"); }
        let drag = null;
        boardEl.addEventListener("pointerdown", (e) => {
          QM.audio.unlock();
          const t = e.target.closest(".tile"); if (!t || busy) return;
          drag = { r: +t.dataset.r, c: +t.dataset.c, x: e.clientX, y: e.clientY, moved: false };
          try { boardEl.setPointerCapture(e.pointerId); } catch (err) { /* */ }
        });
        boardEl.addEventListener("pointermove", (e) => {
          if (!drag || drag.moved || busy) return;
          const cell = boardEl.getBoundingClientRect().width / N;
          const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < cell * 0.35) return;
          drag.moved = true;
          const b = Math.abs(dx) > Math.abs(dy) ? [drag.r, drag.c + Math.sign(dx)] : [drag.r + Math.sign(dy), drag.c];
          if (b[0] < 0 || b[0] >= N || b[1] < 0 || b[1] >= N) return;
          trySwap([drag.r, drag.c], b);
        });
        boardEl.addEventListener("pointerup", () => {
          if (!drag) return;
          const d = drag; drag = null;
          if (d.moved || busy) return;
          if (sel && L().adjacent(sel, [d.r, d.c])) { trySwap(sel, [d.r, d.c]); }
          else if (sel && sel[0] === d.r && sel[1] === d.c) clearSel();
          else select(d.r, d.c);
        });
        boardEl.addEventListener("pointercancel", () => { drag = null; });

        // teclado: flechas mueven el cursor, Enter selecciona/intercambia
        let cur = [3, 3];
        function onKey(e) {
          if (!ctx.alive || document.body.classList.contains("in-dialog") || document.body.classList.contains("in-modal")) return;
          const mv = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
          if (mv) {
            e.preventDefault();
            if (sel) { trySwap(sel, [sel[0] + mv[0], sel[1] + mv[1]]); return; }
            const old = cellEl(cur[0], cur[1]); if (old) old.classList.remove("kcur");
            cur = [Math.max(0, Math.min(N - 1, cur[0] + mv[0])), Math.max(0, Math.min(N - 1, cur[1] + mv[1]))];
            const el = cellEl(cur[0], cur[1]); if (el) el.classList.add("kcur");
          } else if (e.key === "Enter" || e.key === " ") {
            e.preventDefault(); if (busy) return;
            if (sel) clearSel(); else select(cur[0], cur[1]);
          }
        }
        document.addEventListener("keydown", onKey);
        const watch = setInterval(() => { if (!ctx.alive || finished) { document.removeEventListener("keydown", onKey); clearHint(); clearInterval(watch); } }, 300);

        // --- pista
        function clearHint() { clearTimeout(hintT); els.forEach((el) => el.classList.remove("hint")); }
        function showHint(force) {
          if (busy || finished || !ctx.alive) return;
          clearHint();
          const m = L().bestMove(board, rng);
          if (!m) return;
          m.forEach(([r, c]) => { const el = cellEl(r, c); if (el) el.classList.add("hint"); });
          if (force) say("Prueba a mover las fichas que se mueven.");
        }
        function armHint() { clearTimeout(hintT); hintT = setTimeout(() => showHint(false), 7000); }

        // --- arranque: las fichas caen al tablero
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
          const el = makeTile(board[r][c], -N - (N - r) * 0 - 1 - r, c);
          boardEl.append(el);
        }
        setTimeout(async () => {
          for (let r = N - 1; r >= 0; r--) {
            for (let c = 0; c < N; c++) { const el = els.get(board[r][c].id); if (el) place(el, r, c); }
            await QM.sleep(QM.reduceMotion ? 5 : 70);
          }
          await QM.sleep(300);
          els.forEach((el) => relabel(el));
          busy = false; armHint();
        }, 200);
      });
    },
  };
})();
