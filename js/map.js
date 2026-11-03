/* map.js · el tablero. Cada zona empieza en gris y gana color al superar su prueba. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = (...a) => QM.h(...a);
  const NS = "http://www.w3.org/2000/svg";

  // Coordenadas en un tablero de 100 × 120.
  const N = {
    castellon: { x: 16, y: 25 }, albal: { x: 15, y: 104 },
    t1: { x: 38, y: 62 }, t2: { x: 64, y: 84 }, t3: { x: 80, y: 56 }, t4: { x: 54, y: 38 }, boda: { x: 82, y: 31 },
  };
  const NODES = [N.t1, N.t2, N.t3, N.t4, N.boda];
  const SEGS = [
    [N.t1, { x: 48, y: 70 }, { x: 56, y: 78 }, N.t2],
    [N.t2, { x: 74, y: 80 }, { x: 80, y: 70 }, N.t3],
    [N.t3, { x: 74, y: 50 }, { x: 66, y: 44 }, N.t4],
    [N.t4, { x: 62, y: 36 }, { x: 72, y: 34 }, N.boda],
  ];
  const START_L = [N.castellon, { x: 26, y: 32 }, { x: 32, y: 43 }, { x: 36, y: 53 }, N.t1];
  const START_P = [N.albal, { x: 25, y: 97 }, { x: 31, y: 88 }, { x: 35, y: 76 }, N.t1];
  const TILE_COLORS = ["#d62839", "#2f9e5b", "#ffd166", "#ffffff", "#0f5132"];

  function densify(pts, step) {
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(d); total += d; }
    const n = Math.max(2, Math.round(total / step));
    const out = [];
    for (let k = 0; k <= n; k++) {
      let t = (k / n) * total, i = 0;
      while (i < seg.length - 1 && t > seg[i]) { t -= seg[i]; i++; }
      const f = seg[i] ? Math.min(1, t / seg[i]) : 0;
      out.push({ x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f });
    }
    return out;
  }
  const PATH_L0 = densify(START_L, 5), PATH_P0 = densify(START_P, 5), PATH_S = SEGS.map((s) => densify(s, 5));

  function svg(inner, cls) {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 100 120"); s.setAttribute("preserveAspectRatio", "none");
    s.setAttribute("class", "layer-svg " + (cls || "")); s.setAttribute("aria-hidden", "true");
    s.innerHTML = inner; return s;
  }
  function layer(cls, inner) { const d = h("div", { class: "layer " + cls }); d.append(svg(inner)); return d; }

  function tiles(path, seed) {
    let out = "";
    path.slice(1, -1).forEach((p, i) => {
      const c = TILE_COLORS[(i + seed) % TILE_COLORS.length];
      out += `<rect x="${p.x - 2.3}" y="${p.y - 2.3}" width="4.6" height="4.6" rx="1" fill="${c}" stroke="#2a2140" stroke-width=".6"/><rect x="${p.x - 1.6}" y="${p.y - 1.6}" width="1.6" height="1" rx=".4" fill="#fff" opacity=".55"/>`;
    });
    return out;
  }

  // ---- dibujos de cada zona
  const house = (x, y, c) => `<rect x="${x}" y="${y}" width="6" height="5" fill="#fff4dc" stroke="#2a2140" stroke-width=".5"/><path d="M${x - 1} ${y}L${x + 3} ${y - 3.5}L${x + 7} ${y}z" fill="${c}" stroke="#2a2140" stroke-width=".5"/><rect x="${x + 2.2}" y="${y + 2}" width="1.6" height="3" fill="#8a5a33"/>`;
  const tree = (x, y, c) => `<rect x="${x - .6}" y="${y}" width="1.2" height="3" fill="#6b4423"/><circle cx="${x}" cy="${y - 1}" r="3.2" fill="${c}" stroke="#2a2140" stroke-width=".4"/>`;
  const pine = (x, y) => `<path d="M${x} ${y - 6}L${x + 3} ${y}L${x - 3} ${y}z" fill="#2f8a4f" stroke="#2a2140" stroke-width=".4"/><path d="M${x} ${y - 9}L${x + 2.4} ${y - 4}L${x - 2.4} ${y - 4}z" fill="#3ea661" stroke="#2a2140" stroke-width=".4"/><rect x="${x - .5}" y="${y}" width="1" height="2" fill="#6b4423"/>`;

  const ART_BASE = `
    <defs><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8f3e0"/><stop offset="1" stop-color="#9fd0a4"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fc8f0"/><stop offset="1" stop-color="#4aa3e0"/></linearGradient></defs>
    <rect width="100" height="120" fill="url(#land)"/>
    <path d="M91 0C87 14 95 24 90 38C85 52 94 66 90 82C87 96 94 108 91 120L100 120L100 0z" fill="url(#sea)"/>
    <path d="M91 0C87 14 95 24 90 38C85 52 94 66 90 82C87 96 94 108 91 120" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray="2 2" opacity=".8"/>
    <g opacity=".35" stroke="#5b8a4a" stroke-width=".3">${[...Array(9)].map((_, i) => `<path d="M${i * 11} 0V120"/>`).join("")}${[...Array(11)].map((_, i) => `<path d="M0 ${i * 11}H100"/>`).join("")}</g>
    <g fill="#fff" opacity=".7"><path d="M94 20q2-2 4 0q2 2 4 0"/><path d="M93 70q2-2 4 0q2 2 4 0"/><path d="M95 98q2-2 4 0"/></g>`;

  const ART_R1 = `
    ${house(8, 14, "#c1121f")}${house(16, 11, "#2f9e5b")}${house(21, 16, "#c1121f")}
    ${house(8, 100, "#2f9e5b")}${house(16, 104, "#2f9e5b")}${house(21, 99, "#2f9e5b")}
    <rect x="26" y="44" width="22" height="13" rx="1" fill="#2d2a55" stroke="#2a2140" stroke-width=".6"/>
    <rect x="28" y="46" width="12" height="9" rx=".8" fill="#9fe7ff"/><path d="M34 47.5l1.4 2.9 3.1.4-2.3 2.1.6 3.1-2.8-1.6-2.8 1.6.6-3.1-2.3-2.1 3.1-.4z" fill="#ffd23f" stroke="#2a2140" stroke-width=".3"/>
    <rect x="42" y="47" width="4" height="2" fill="#ff4d6d"/><rect x="42" y="51" width="4" height="2" fill="#ffd23f"/>
    <path d="M32 44l-3-6M40 44l3-6" stroke="#2a2140" stroke-width=".7"/><circle cx="29" cy="37" r="1" fill="#ff4d6d"/><circle cx="43" cy="37" r="1" fill="#ff4d6d"/>
    <path d="M18 54l8-8M54 54l-8-8" stroke="#ffe27a" stroke-width="1.4" opacity=".7"/>`;
  const ART_R2 = `
    <rect x="56" y="64" width="22" height="12" fill="#f3e9d7" stroke="#2a2140" stroke-width=".6"/>
    <path d="M54 64L67 56L80 64z" fill="#c1121f" stroke="#2a2140" stroke-width=".6"/>
    ${[58, 63, 68, 73].map((x) => `<rect x="${x}" y="65" width="2" height="10" fill="#fff" stroke="#2a2140" stroke-width=".3"/>`).join("")}
    <path d="M58 65q4 5 4 9h-4zM76 65q-4 5-4 9h4z" fill="#d90429" opacity=".9"/>
    <circle cx="67" cy="60.5" r="2" fill="#ffd23f" stroke="#2a2140" stroke-width=".4"/>
    <path d="M52 58v-6a2 2 0 1 0-2 2M52 58l0-6" fill="none" stroke="#2a2140" stroke-width=".8"/><ellipse cx="50" cy="55" rx="2" ry="1.5" fill="#c1121f"/>`;
  const ART_R3 = `
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => tree(68 + c * 7, 38 + r * 7, "#ff9f1c")).join("")).join("")}
    ${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${68.5 + c * 7}" cy="${37 + r * 7}" r=".8" fill="#2f8a4f"/>`).join("")).join("")}
    ${house(80, 60, "#e63946")}`;
  const ART_R4 = `
    ${pine(40, 40)}${pine(46, 44)}${pine(34, 28)}${pine(44, 24)}${pine(52, 20)}${pine(60, 46)}${pine(66, 32)}
    <path d="M48 40h6v4h-6z" fill="#fff4dc" stroke="#2a2140" stroke-width=".4"/><path d="M50 40v-4h6" stroke="#2a2140" stroke-width=".5" fill="none"/>`;
  const ART_R5 = `<g transform="translate(0,19)">
    <rect x="72" y="8" width="20" height="10" fill="#f3e9d7" stroke="#2a2140" stroke-width=".6"/>
    <path d="M70 8L82 4L94 8z" fill="#c8553d" stroke="#2a2140" stroke-width=".6"/>
    <rect x="78" y="-2" width="8" height="12" fill="#f3e9d7" stroke="#2a2140" stroke-width=".6"/><path d="M77 -2L82 -8L87 -2z" fill="#c8553d" stroke="#2a2140" stroke-width=".6"/>
    <path d="M82 -14v6M80 -12h4" stroke="#ffd23f" stroke-width="1.2"/>
    <rect x="80" y="12" width="4" height="6" rx="2" fill="#7a4a2b"/><rect x="74" y="10" width="2.4" height="4" fill="#6aa6d8"/><rect x="88" y="10" width="2.4" height="4" fill="#6aa6d8"/>
    <path d="M62 18a10 10 0 0 1 18-9" fill="none" stroke="#c1121f" stroke-width="1.4"/><path d="M63 18a9 9 0 0 1 16-8" fill="none" stroke="#ffd166" stroke-width="1.4"/><path d="M64 18a8 8 0 0 1 14-7" fill="none" stroke="#2f9e5b" stroke-width="1.4"/>
    ${[[66, 24], [70, 26], [90, 24], [94, 22]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${["#c1121f", "#ffd23f", "#2f9e5b", "#ffffff"][i]}"/>`).join("")}</g>`;

  QM.map = {
    NODES, N,
    // posición (0 = salidas, 1..4 = pruebas, 5 = boda) → coordenadas de cada personaje
    posFor(p, who) {
      if (p === 0) return who === "laura" ? N.castellon : N.albal;
      const n = NODES[p - 1];
      return { x: n.x + (who === "laura" ? -7 : 7), y: n.y - 4.5 };
    },
    build(onNode) {
      const board = h("div", { class: "board", "data-stage": "0" });
      board.append(layer("l-base", ART_BASE));
      board.append(layer("l-reg reg1", ART_R1), layer("l-reg reg2", ART_R2), layer("l-reg reg3", ART_R3), layer("l-reg reg4", ART_R4), layer("l-reg reg5", ART_R5));
      board.append(layer("l-seg seg0", tiles(PATH_L0, 0) + tiles(PATH_P0, 2)));
      PATH_S.forEach((p, i) => board.append(layer("l-seg seg" + (i + 1), tiles(p, i + 1))));

      const lab = (txt, x, y, cls) => h("span", { class: "pin " + (cls || ""), style: `left:${x}%;top:${y / 1.2}%`, text: txt });
      board.append(lab("Castellón", N.castellon.x + 1, N.castellon.y + 9, "pin-town"), lab("Albal", N.albal.x + 1, N.albal.y + 8, "pin-town"));

      // nodos de pruebas (+ boda)
      const nodes = [];
      C().TRIALS.forEach((T, i) => nodes.push({ i, x: NODES[i].x, y: NODES[i].y, name: T.name, num: String(i + 1) }));
      nodes.push({ i: 4, x: N.boda.x, y: N.boda.y, name: "Parroquia de San José Obrero", num: "♥" });
      nodes.forEach((n) => {
        const b = h("button", { class: "node", type: "button", "data-i": n.i, style: `left:${n.x}%;top:${n.y / 1.2}%`,
          onclick() { onNode && onNode(n.i); } },
          h("span", { class: "node-num", "aria-hidden": "true", text: n.num }),
          h("span", { class: "node-badge", "aria-hidden": "true" }));
        const label = h("span", { class: "node-label", style: `left:${n.x}%;top:${(n.i === 4 ? 2.4 : n.y + 7.4) / 1.2}%`, text: n.name });
        board.append(b, label);
      });

      // fichas de los protagonistas
      ["laura", "pablo"].forEach((who) => {
        const t = h("div", { class: "token token-" + who, "data-who": who });
        t.append(QM.sprites.char(who, { pose: "idle" }), h("span", { class: "token-name", text: C().NAMES[who] }));
        board.append(t);
      });
      return board;
    },

    setTokenPos(board, who, pt) {
      const t = board.querySelector(".token-" + who);
      t.style.left = pt.x + "%"; t.style.top = (pt.y / 1.2) + "%";
    },
    place(board, p) {
      ["laura", "pablo"].forEach((who) => this.setTokenPos(board, who, this.posFor(p, who)));
    },

    // Camino de cada personaje al ir de la posición a → b
    route(a, b, who) {
      if (b <= a) return [this.posFor(b, who)];
      let path;
      if (a === 0) path = who === "laura" ? PATH_L0 : PATH_P0;
      else path = PATH_S[a - 1];
      return path.map((q) => ({ x: q.x + (a === 0 ? 0 : (who === "laura" ? -7 : 7)), y: q.y + (a === 0 ? 0 : -4.5) })).concat([this.posFor(b, who)]);
    },
    async walk(board, a, b) {
      const rl = this.route(a, b, "laura"), rp = this.route(a, b, "pablo");
      const n = Math.max(rl.length, rp.length);
      const tl = board.querySelector(".token-laura"), tp = board.querySelector(".token-pablo");
      for (let k = 0; k < n; k++) {
        this.setTokenPos(board, "laura", rl[Math.min(k, rl.length - 1)]);
        this.setTokenPos(board, "pablo", rp[Math.min(k, rp.length - 1)]);
        tl.classList.remove("hop"); tp.classList.remove("hop"); void tl.offsetWidth;
        tl.classList.add("hop"); tp.classList.add("hop");
        QM.sfx("tick");
        await QM.sleep(QM.reduceMotion ? 20 : 150);
      }
      tl.classList.remove("hop"); tp.classList.remove("hop");
    },

    // Aplica el estado: colores, candados, tick de superadas…
    refresh(board, p) {
      const items = QM.state.items, done = items.filter(Boolean).length;
      board.dataset.stage = String(p);
      board.style.setProperty("--prog", String(done / 4));
      for (let k = 1; k <= 4; k++) board.classList.toggle("has-" + k, !!items[k - 1]);
      board.classList.toggle("has-5", done === 4);
      for (let k = 0; k <= 4; k++) board.classList.toggle("walked-" + k, p > k);
      const next = QM.nextTrial();
      board.querySelectorAll(".node").forEach((b) => {
        const i = +b.dataset.i;
        const isBoda = i === 4;
        const isDone = isBoda ? false : items[i];
        const isCurrent = isBoda ? next === -1 : next === i;
        const locked = !isDone && !isCurrent;
        b.classList.toggle("done", isDone); b.classList.toggle("current", isCurrent); b.classList.toggle("locked", locked);
        b.disabled = locked || isDone;
        const badge = b.querySelector(".node-badge");
        badge.textContent = isDone ? "✓" : locked ? "🔒" : "▶";
        const nm = isBoda ? "Parroquia de San José Obrero" : "Prueba " + (i + 1) + ": " + C().TRIALS[i].name;
        const st = isDone ? C().UI.DONE : locked ? C().UI.LOCKED : isBoda ? "Ir a la boda" : "Disponible";
        b.setAttribute("aria-label", nm + ". " + st);
      });
    },
  };
})();
