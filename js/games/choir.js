/* choir.js · Prueba 2: ensayo del coro Betsaida (memoria musical tipo «Simon»).
   Cuatro voces; cada una tiene COLOR, FORMA, POSICIÓN, NOMBRE y NOTA propios,
   así que se puede jugar sin fijarse solo en el color ni solo en el sonido. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h;

  // Do–Mi–Sol–Do agudo: un acorde mayor que suena bien aunque se pulse a lo loco.
  const VOICES = [
    { id: 0, note: "C5", name: "Altas",   shape: "circle",   pos: "top",    color: "#ffd23f", dark: "#a67c00", key: "ArrowUp",    label: "Do agudo" },
    { id: 1, note: "G4", name: "Medias",  shape: "square",   pos: "right",  color: "#ff4d5e", dark: "#9d1020", key: "ArrowRight", label: "Sol" },
    { id: 2, note: "E4", name: "Chicos",  shape: "triangle", pos: "bottom", color: "#3ddc84", dark: "#0d7a3d", key: "ArrowDown",  label: "Mi" },
    { id: 3, note: "C4", name: "Músicos", shape: "diamond",  pos: "left",   color: "#e8f1ff", dark: "#5d6b88", key: "ArrowLeft",  label: "Do · guitarra y percusión" },
  ];
  const SHAPES = {
    circle: '<circle cx="50" cy="50" r="34" />',
    square: '<rect x="18" y="18" width="64" height="64" rx="8" />',
    triangle: '<path d="M50 14 L88 82 L12 82 Z" stroke-linejoin="round" />',
    diamond: '<path d="M50 10 L90 50 L50 90 L10 50 Z" stroke-linejoin="round" />',
  };
  // altura de cada nota sobre el pentagrama (0 = línea inferior, en medios espacios)
  const STAFF_Y = { C4: -2, E4: 0, G4: 2, C5: 5 };
  QM.choir = { VOICES };

  QM.games.choir = {
    attempt(ctx) {
      return new Promise((resolve) => {
        const TX = C().TEXT.CHOIR;
        const bal = Object.assign({}, C().BALANCE.CHOIR, ctx.help ? C().BALANCE.CHOIR.HELP : {});
        let seq = [], step = 0, playing = false, finished = false, accepting = false, round = 0;

        const stage = h("section", { class: "stage" });
        const curtainL = h("i", { class: "curtain cl", "aria-hidden": "true" }), curtainR = h("i", { class: "curtain cr", "aria-hidden": "true" });
        const status = h("p", { class: "ch-status", role: "status", "aria-live": "polite" });
        const roundEl = h("div", { class: "ch-round" });
        const staff = h("div", { class: "staff", "aria-hidden": "true" });
        for (let i = 0; i < 5; i++) staff.append(h("i", { class: "sline", style: "bottom:" + (30 + i * 10) + "%" }));
        const voiceLabel = h("p", { class: "voice-label", "aria-hidden": "true", text: " " });
        const pads = VOICES.map((v) => {
          const b = h("button", { type: "button", class: "pad pad-" + v.pos, "data-id": v.id, style: "--c:" + v.color + ";--d:" + v.dark,
            "aria-label": v.name + ", nota " + v.label + ", " + v.pos.replace("top", "arriba").replace("bottom", "abajo").replace("left", "izquierda").replace("right", "derecha") },
            h("span", { class: "pad-shape", html: '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="var(--c)" stroke="var(--d)" stroke-width="5">' + SHAPES[v.shape] + "</g></svg>" }),
            h("span", { class: "pad-name", text: v.name }), h("span", { class: "pad-note", text: v.label }));
          b.addEventListener("pointerdown", (e) => { e.preventDefault(); press(v.id); });
          b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); press(v.id); } });
          return b;
        });
        const padBox = h("div", { class: "pads" }, pads, h("div", { class: "pad-center", "aria-hidden": "true" }, voiceLabel));
        const conductor = h("div", { class: "conductor" });
        const lauraCv = () => QM.sprites.char("laura", { pose: "sing", prop: "baton" });
        conductor.append(lauraCv());
        stage.append(curtainL, curtainR, h("div", { class: "ch-top" }, roundEl, status), h("div", { class: "pads-zone" }, padBox), h("div", { class: "staff-wrap" }, staff), conductor);
        ctx.root = stage;
        QM.ui.show(stage, "scr-choir");

        function setStatus(t) { status.textContent = t; }
        function renderRound() { roundEl.replaceChildren(h("span", { text: TX.ROUND + " " + Math.max(1, seq.length) }), h("b", { text: " · " + TX.GOAL + " " + bal.TARGET_LENGTH })); }
        function stepMs() { return Math.max(bal.MIN_MS, bal.START_MS - Math.max(0, seq.length - 1) * bal.SPEEDUP_MS); }

        function light(id, ms) {
          const v = VOICES[id], b = pads[id];
          b.classList.add("lit"); voiceLabel.textContent = v.name + " · " + v.label;
          QM.audio.voice(QM.audio.freq(v.note), Math.max(0.18, ms / 1000 * 0.9));
          addStaffNote(id);
          setTimeout(() => { b.classList.remove("lit"); }, ms * 0.8);
        }
        function addStaffNote(id) {
          const v = VOICES[id];
          const count = staff.querySelectorAll(".snote").length;
          const n = h("i", { class: "snote s-" + v.shape, style: "--c:" + v.color + ";left:" + (6 + (count % 14) * 6.4) + "%;bottom:" + (30 + STAFF_Y[v.note] * 5 - 5) + "%" });
          staff.append(n);
          if (count + 1 > 14) staff.querySelector(".snote").remove();
          setTimeout(() => n.classList.add("fade"), 1200);
          setTimeout(() => n.remove(), 2400);
        }

        async function playSequence() {
          playing = true; accepting = false; step = 0;
          padBox.classList.add("locked");
          setStatus(TX.LISTEN);
          conductor.classList.add("sing");
          await QM.sleep(650);
          const ms = stepMs();
          for (let i = 0; i < seq.length; i++) {
            if (!ctx.alive) return;
            light(seq[i], ms);
            await QM.sleep(ms);
          }
          conductor.classList.remove("sing");
          if (!ctx.alive) return;
          playing = false; accepting = true;
          padBox.classList.remove("locked");
          setStatus(TX.REPEAT + " (" + 0 + "/" + seq.length + ")");
        }

        async function nextRound() {
          if (!ctx.alive) return;
          seq.push(QM.rnd(4));
          round = seq.length; renderRound();
          await playSequence();
        }

        async function press(id) {
          if (!ctx.alive || finished) return;
          QM.audio.unlock();
          if (!accepting) { if (!playing) light(id, 250); return; }
          light(id, 260);
          if (id !== seq[step]) {
            accepting = false; finished = true; padBox.classList.add("locked");
            QM.sfx("bad"); setStatus(TX.LOSE);
            pads[id].classList.add("oops");
            pads[seq[step]].classList.add("hint");
            document.removeEventListener("keydown", onKey);
            await QM.sleep(1700);
            resolve("lose"); return;
          }
          step++;
          setStatus(TX.REPEAT + " (" + step + "/" + seq.length + ")");
          if (step >= seq.length) {
            accepting = false;
            if (seq.length >= bal.TARGET_LENGTH) {
              finished = true; padBox.classList.add("locked");
              setStatus(TX.WIN); QM.sfx("win"); conductor.classList.add("sing");
              document.removeEventListener("keydown", onKey);
              await QM.sleep(1700); resolve("win"); return;
            }
            setStatus(TX.RIGHT); QM.sfx("ok");
            await QM.sleep(700);
            nextRound();
          }
        }

        const keyMap = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, "1": 0, "2": 1, "3": 2, "4": 3 };
        function onKey(e) {
          if (!ctx.alive || document.body.classList.contains("in-dialog") || document.body.classList.contains("in-modal")) return;
          if (e.key in keyMap && !e.repeat) { e.preventDefault(); press(keyMap[e.key]); }
        }
        document.addEventListener("keydown", onKey);
        const watch = setInterval(() => { if (!ctx.alive) { document.removeEventListener("keydown", onKey); clearInterval(watch); } }, 300);

        setStatus(TX.HINT);
        renderRound();
        setTimeout(() => { if (ctx.alive) nextRound(); }, 1400);
      });
    },
  };
})();
