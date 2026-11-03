/* trivia.js · Prueba 1: concurso de televisión (trivial de cultura general).
   Seis categorías, dos aciertos por medalla, cinco fallos máximo. Los textos y
   las preguntas están en content.js. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h;

  const CATS = ["geo", "his", "cie", "arte", "dep", "ent"];
  const COLOR = { geo: "#1fb6d0", his: "#a58bff", cie: "#7bd35b", arte: "#ff7aa8", dep: "#ffb43b", ent: "#ff6a4d" };

  // Barajas sin repetición: una por categoría, se reparten hasta agotarlas.
  const decks = {};
  function draw(cat) {
    const qs = C().TRIVIA_QUESTIONS[cat];
    let d = decks[cat];
    if (!d || d.pos >= d.order.length || d.len !== qs.length) {
      const last = d && d.order[d.order.length - 1];
      const order = QM.shuffle(qs.map((_, i) => i));
      if (last !== undefined && order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
      d = decks[cat] = { order, pos: 0, len: qs.length };
    }
    return qs[d.order[d.pos++]];
  }
  QM.trivia = { draw, CATS };

  QM.games.trivia = {
    attempt(ctx) {
      return new Promise((resolve) => {
        const TX = C().TEXT.TRIVIA;
        const bal = Object.assign({}, C().BALANCE.TRIVIA, ctx.help ? C().BALANCE.TRIVIA.HELP : {});
        const need = bal.CORRECT_PER_MEDAL;
        const got = {}; CATS.forEach((c) => (got[c] = 0));
        let strikes = 0, lifelines = bal.LIFELINES, tId = null, cur = null, locked = true, finished = false, llUsed = false, count = 0;

        const root = h("section", { class: "studio" }, h("div", { class: "beams", "aria-hidden": "true" }, h("i"), h("i"), h("i")));
        const sbEl = h("div", { class: "sb", role: "group", "aria-label": "Marcador de medallas" });
        const strikeEl = h("div", { class: "strikes", role: "status" });
        const hostCv = h("div", { class: "host-cv" });
        const bubble = h("p", { class: "bubble", "aria-live": "polite" });
        const stageEl = h("div", { class: "studio-stage" }, hostCv, h("div", { class: "bubble-wrap" }, bubble));
        const mainEl = h("div", { class: "studio-main" });
        root.append(h("div", { class: "studio-top" }, sbEl, strikeEl), stageEl, mainEl);
        ctx.root = root;
        QM.ui.show(root, "scr-studio");

        const pip = (n) => Array.from({ length: need }, (_, i) => h("i", { class: "pip" + (i < n ? " on" : "") }));
        function renderBoard() {
          sbEl.replaceChildren(...CATS.map((c) => h("div", { class: "mcell" + (got[c] >= need ? " on" : ""), style: "--c:" + COLOR[c], title: TX.CATEGORIES[c],
            "aria-label": TX.CATEGORIES[c] + ": " + got[c] + " de " + need + (got[c] >= need ? " (medalla conseguida)" : "") },
            h("span", { class: "ico", html: QM.sprites.catIcon(c) }), h("span", { class: "pips" }, pip(got[c])))));
          strikeEl.replaceChildren(h("span", { class: "strike-label", text: TX.STRIKES + " " + strikes + "/" + bal.MAX_STRIKES }),
            ...Array.from({ length: bal.MAX_STRIKES }, (_, i) => h("i", { class: "x" + (i < strikes ? " on" : ""), text: i < strikes ? "✕" : "·" })));
          strikeEl.setAttribute("aria-label", TX.STRIKES + ": " + strikes + " de " + bal.MAX_STRIKES);
        }
        function host(text, pose) {
          bubble.textContent = text;
          bubble.classList.remove("pop"); void bubble.offsetWidth; bubble.classList.add("pop");
          hostCv.replaceChildren(QM.sprites.char("host", { pose: pose || "idle", prop: "mic", bust: false }));
        }
        function hostLine() {
          const r = Math.random();
          if (count === 0 || r < 0.12) return QM.pick(TX.HOST_LAURA);
          if (r < 0.2) return QM.pick(TX.HOST_PABLO);
          return null;
        }

        // ------------------------------------------------ elegir categoría
        function showPicker(msg, pose) {
          locked = true; cur = null;
          renderBoard();
          host(msg || TX.PICK + ".", pose);
          const grid = h("div", { class: "picker", role: "group", "aria-label": TX.PICK });
          CATS.forEach((c, k) => {
            const done = got[c] >= need;
            grid.append(h("button", { type: "button", class: "pk" + (done ? " done" : ""), style: "--c:" + COLOR[c], disabled: done, "data-k": k + 1,
              "aria-label": TX.CATEGORIES[c] + ", " + got[c] + " de " + need + (done ? ", medalla conseguida" : ""),
              onclick() { QM.sfx("click"); ask(c); } },
              h("span", { class: "pk-ico", html: QM.sprites.catIcon(c) }),
              h("span", { class: "pk-name", text: TX.CATEGORIES[c] }),
              h("span", { class: "pk-pips" }, done ? h("b", { text: "✓ Medalla" }) : pip(got[c]))));
          });
          mainEl.replaceChildren(h("h2", { class: "pick-title", text: TX.PICK }), grid);
          locked = false;
        }

        // ------------------------------------------------------ pregunta
        function ask(cat) {
          if (locked && cur) return;
          const row = draw(cat);
          const opts = QM.shuffle([row[1], row[2], row[3], row[4]].map((t, i) => ({ t, ok: i === 0 })));
          cur = { cat, q: row[0], opts, ll: false };
          locked = false; llUsed = false;
          let remain = bal.SECONDS_PER_QUESTION;
          const barFill = h("i", { class: "tfill" });
          const tnum = h("b", { class: "tnum", text: String(remain) });
          const timer = h("div", { class: "timer", role: "timer", "aria-label": "Tiempo restante" }, h("div", { class: "tbar" }, barFill), h("span", { class: "tlabel" }, tnum, " s"));
          const letters = ["A", "B", "C", "D"];
          const btns = opts.map((o, i) => h("button", { type: "button", class: "ans", "data-i": i,
            onclick() { answer(i); } },
            h("span", { class: "letter", text: letters[i] }), h("span", { class: "atext", text: o.t }), h("span", { class: "mark", "aria-hidden": "true" })));
          const llBtn = h("button", { type: "button", class: "btn btn-alt btn-small ll-btn", disabled: lifelines <= 0,
            text: TX.LIFELINE + " (" + lifelines + ")", onclick: useLifeline });
          const card = h("div", { class: "qcard", style: "--c:" + COLOR[cat] },
            h("div", { class: "qcat" }, h("span", { class: "qico", html: QM.sprites.catIcon(cat) }), h("span", { text: TX.CATEGORIES[cat] })),
            h("h2", { class: "qtext", text: row[0] }), timer);
          mainEl.replaceChildren(card, h("div", { class: "answers" }, btns), h("div", { class: "ll-row" }, llBtn));
          host(QM.pick(["Pregunta de " + TX.CATEGORIES[cat] + ".", "Vamos con " + TX.CATEGORIES[cat] + "…", "¡" + TX.CATEGORIES[cat] + "! Allá vamos."]), "idle");
          cur.btns = btns; cur.ll = false;

          const end = performance.now() + remain * 1000, total = remain * 1000;
          clearInterval(tId);
          tId = setInterval(() => {
            if (!ctx.alive) { clearInterval(tId); return; }
            const left = Math.max(0, end - performance.now());
            barFill.style.width = (left / total * 100) + "%";
            const s = Math.ceil(left / 1000);
            tnum.textContent = String(s);
            timer.classList.toggle("low", s <= 5);
            if (s <= 5 && s !== cur.lastTick) { cur.lastTick = s; QM.sfx("tick"); }
            if (left <= 0) { clearInterval(tId); answer(-1); }
          }, 100);

          function useLifeline() {
            if (lifelines <= 0 || cur.ll || locked) return;
            lifelines--; cur.ll = true; QM.sfx("buff");
            const wrong = opts.map((o, i) => i).filter((i) => !opts[i].ok);
            QM.shuffle(wrong).slice(0, 2).forEach((i) => { btns[i].disabled = true; btns[i].classList.add("struck"); btns[i].querySelector(".mark").textContent = "✕"; });
            llBtn.disabled = true; llBtn.textContent = TX.LIFELINE + " (" + lifelines + ")";
            host("El público susurra… y dos opciones se apagan.", "idle");
          }
        }

        async function answer(i) {
          if (locked || !cur || finished) return;
          locked = true; clearInterval(tId); count++;
          const q = cur, okIdx = q.opts.findIndex((o) => o.ok);
          const right = i === okIdx;
          q.btns.forEach((b, k) => {
            b.disabled = true;
            if (k === okIdx) { b.classList.add("right"); b.querySelector(".mark").textContent = "✓"; }
            else if (k === i) { b.classList.add("wrong"); b.querySelector(".mark").textContent = "✕"; }
          });
          const llb = mainEl.querySelector(".ll-btn"); if (llb) llb.disabled = true;
          if (right) {
            got[q.cat]++; QM.sfx("ok");
            const earned = got[q.cat] >= need;
            renderBoard();
            host(earned ? TX.MEDAL.replace("{cat}", TX.CATEGORIES[q.cat]) : QM.pick(TX.RIGHT) + " " + (hostLine() || QM.pick(TX.HOST_RIGHT)), "cheer");
            if (earned) { QM.sfx("medal"); const cells = sbEl.children; cells[CATS.indexOf(q.cat)].classList.add("flash"); }
          } else {
            strikes++; QM.sfx("bad");
            renderBoard();
            host((i === -1 ? TX.TIMEOUT + " " : QM.pick(TX.WRONG) + " ") + QM.pick(TX.HOST_WRONG), "hurt");
          }
          await QM.sleep(1700);
          if (!ctx.alive) return;
          if (CATS.every((c) => got[c] >= need)) {
            finished = true; host(TX.WIN, "cheer"); QM.sfx("win"); await QM.sleep(1400); cleanup(); resolve("win"); return;
          }
          if (strikes >= bal.MAX_STRIKES) {
            finished = true; host(TX.LOSE, "hurt"); QM.sfx("buzzer"); await QM.sleep(1500); cleanup(); resolve("lose"); return;
          }
          showPicker(right ? "¡Seguimos! " + TX.PICK + "." : "Ánimo. " + TX.PICK + ".", right ? "idle" : "idle");
        }

        function onKey(e) {
          if (!ctx.alive || document.body.classList.contains("in-dialog") || document.body.classList.contains("in-modal")) return;
          const k = e.key.toLowerCase();
          if (k.length !== 1) return;
          if (cur && !locked) {
            const idx = "1234".indexOf(k) >= 0 ? "1234".indexOf(k) : "abcd".indexOf(k);
            if (idx >= 0 && !cur.btns[idx].disabled) answer(idx);
          } else if (!cur && !locked) {
            const n = "123456".indexOf(k);
            const b = n >= 0 ? mainEl.querySelectorAll(".pk")[n] : null;
            if (b && !b.disabled) b.click();
          }
        }
        function cleanup() { clearInterval(tId); document.removeEventListener("keydown", onKey); }
        document.addEventListener("keydown", onKey);
        const watch = setInterval(() => { if (!ctx.alive) { cleanup(); clearInterval(watch); } }, 300);

        showPicker("¡Bienvenidos al concurso! " + QM.pick(TX.HOST_LAURA), "cheer");
      });
    },
  };
})();
