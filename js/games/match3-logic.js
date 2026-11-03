/* match3-logic.js · reglas puras del tres en raya (sin pantalla), para poder probarlas.
   Tablero 7×7, 6 tipos de ficha. Fichas especiales:
     'row'/'col'  (línea de 4)       limpia una fila / columna
     'bomb'       (L o T)            limpia un área 3×3
     'rainbow'    (línea de 5)       al intercambiarla, limpia todas las fichas de un tipo */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  QM.logic = QM.logic || {};
  const N = 7, TYPES = 6;
  let uid = 1;
  const nid = () => uid++;
  const key = (r, c) => r * N + c;
  const unkey = (k) => [Math.floor(k / N), k % N];

  function mulberry(seed) {
    let a = seed >>> 0;
    return function () { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const newTile = (rng, t) => ({ id: nid(), t: t === undefined ? Math.floor(rng() * TYPES) : t, s: null });
  const cloneBoard = (b) => b.map((row) => row.map((t) => (t ? { id: t.id, t: t.t, s: t.s } : null)));

  function cfgOf(cfg) {
    const B = (globalThis.CONTENT && globalThis.CONTENT.BALANCE && globalThis.CONTENT.BALANCE.MATCH3) || {};
    return Object.assign({ POINTS_PER_TILE: 20, SPECIAL_BONUS: 60 }, B, cfg || {});
  }

  // ---- detección de grupos
  function runs(board) {
    const out = [];
    for (let r = 0; r < N; r++) {
      let c = 0;
      while (c < N) {
        const t = board[r][c];
        if (!t || t.t < 0) { c++; continue; }
        let e = c + 1;
        while (e < N && board[r][e] && board[r][e].t === t.t) e++;
        if (e - c >= 3) { const cells = []; for (let k = c; k < e; k++) cells.push(key(r, k)); out.push({ dir: "h", t: t.t, cells }); }
        c = e;
      }
    }
    for (let c = 0; c < N; c++) {
      let r = 0;
      while (r < N) {
        const t = board[r][c];
        if (!t || t.t < 0) { r++; continue; }
        let e = r + 1;
        while (e < N && board[e][c] && board[e][c].t === t.t) e++;
        if (e - r >= 3) { const cells = []; for (let k = r; k < e; k++) cells.push(key(k, c)); out.push({ dir: "v", t: t.t, cells }); }
        r = e;
      }
    }
    return out;
  }
  function groups(board) {
    const rs = runs(board);
    const parent = rs.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) {
      if (rs[i].t === rs[j].t && rs[i].cells.some((k) => rs[j].cells.includes(k))) parent[find(i)] = find(j);
    }
    const map = new Map();
    rs.forEach((run, i) => {
      const g = find(i);
      if (!map.has(g)) map.set(g, { t: run.t, runs: [], cells: new Set() });
      const o = map.get(g); o.runs.push(run); run.cells.forEach((k) => o.cells.add(k));
    });
    return [...map.values()];
  }

  // qué ficha especial crea un grupo y dónde
  function specialFor(board, g, swapKeys) {
    const maxRun = Math.max(...g.runs.map((r) => r.cells.length));
    const hasH = g.runs.some((r) => r.dir === "h"), hasV = g.runs.some((r) => r.dir === "v");
    let s = null, pos = null;
    const pickIn = (cells) => cells.find((k) => swapKeys.includes(k));
    if (maxRun >= 5) {
      s = "rainbow";
      const run = g.runs.find((r) => r.cells.length === maxRun);
      pos = pickIn(run.cells); if (pos === undefined) pos = run.cells[Math.floor(run.cells.length / 2)];
    } else if (hasH && hasV) {
      s = "bomb";
      const hs = g.runs.filter((r) => r.dir === "h"), vs = g.runs.filter((r) => r.dir === "v");
      const inter = [];
      hs.forEach((a) => vs.forEach((b) => a.cells.forEach((k) => { if (b.cells.includes(k)) inter.push(k); })));
      pos = inter.find((k) => swapKeys.includes(k));
      if (pos === undefined) pos = inter[0];
    } else if (maxRun === 4) {
      const run = g.runs.find((r) => r.cells.length === 4);
      s = run.dir === "h" ? "col" : "row";
      pos = pickIn(run.cells); if (pos === undefined) pos = run.cells[1];
    }
    if (s === null || pos === undefined) return null;
    const [r, c] = unkey(pos);
    if (board[r][c] && board[r][c].s) return null; // no se pisa otra especial
    return { s, pos };
  }

  function mostCommon(board) {
    const cnt = new Array(TYPES).fill(0);
    board.forEach((row) => row.forEach((t) => { if (t && t.t >= 0) cnt[t.t]++; }));
    let best = 0; cnt.forEach((n, i) => { if (n > cnt[best]) best = i; });
    return best;
  }

  // Amplía el conjunto con el efecto de las especiales que contiene
  function expand(board, set, protect) {
    const activated = [];
    const queue = [...set];
    const seen = new Set();
    while (queue.length) {
      const k = queue.pop();
      if (seen.has(k)) continue; seen.add(k);
      const [r, c] = unkey(k);
      const t = board[r][c];
      if (!t || !t.s || protect.has(k)) continue;
      activated.push({ r, c, s: t.s });
      const add = (rr, cc) => { if (rr >= 0 && rr < N && cc >= 0 && cc < N) { const kk = key(rr, cc); if (!set.has(kk)) { set.add(kk); queue.push(kk); } } };
      if (t.s === "row") for (let cc = 0; cc < N; cc++) add(r, cc);
      else if (t.s === "col") for (let rr = 0; rr < N; rr++) add(rr, c);
      else if (t.s === "bomb") for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(r + dr, c + dc);
      else if (t.s === "rainbow") { const mc = mostCommon(board); for (let rr = 0; rr < N; rr++) for (let cc = 0; cc < N; cc++) if (board[rr][cc] && board[rr][cc].t === mc) add(rr, cc); }
    }
    return activated;
  }

  function adjacent(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1; }
  function swapCells(board, a, b) { const t = board[a[0]][a[1]]; board[a[0]][a[1]] = board[b[0]][b[1]]; board[b[0]][b[1]] = t; }

  function wouldMove(board, a, b) {
    swapCells(board, a, b);
    const ta = board[a[0]][a[1]], tb = board[b[0]][b[1]];
    const ok = groups(board).length > 0 || (ta && ta.s === "rainbow") || (tb && tb.s === "rainbow");
    swapCells(board, a, b);
    return ok;
  }
  function findMoves(board) {
    const out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      if (c + 1 < N && wouldMove(board, [r, c], [r, c + 1])) out.push([[r, c], [r, c + 1]]);
      if (r + 1 < N && wouldMove(board, [r, c], [r + 1, c])) out.push([[r, c], [r + 1, c]]);
    }
    return out;
  }

  function newBoard(rng) {
    for (let tries = 0; tries < 200; tries++) {
      const b = [];
      for (let r = 0; r < N; r++) {
        b.push([]);
        for (let c = 0; c < N; c++) {
          let t, guard = 0;
          do {
            t = Math.floor(rng() * TYPES); guard++;
          } while (guard < 20 && ((c >= 2 && b[r][c - 1].t === t && b[r][c - 2].t === t) || (r >= 2 && b[r - 1][c].t === t && b[r - 2][c].t === t)));
          b[r].push({ id: nid(), t, s: null });
        }
      }
      if (groups(b).length === 0 && findMoves(b).length > 0) return b;
    }
    throw new Error("no se pudo crear tablero");
  }

  // Baraja las fichas existentes hasta que haya jugadas y no haya tríos hechos.
  function shuffle(board, rng) {
    const tiles = []; board.forEach((row) => row.forEach((t) => tiles.push(t)));
    for (let tries = 0; tries < 300; tries++) {
      const arr = tiles.slice();
      for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      let k = 0;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) board[r][c] = arr[k++];
      if (groups(board).length === 0 && findMoves(board).length > 0) break;
      if (tries === 299) { // plan B: recolocar tipos manteniendo los ids
        const nb = newBoard(rng);
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { board[r][c].t = nb[r][c].t; board[r][c].s = null; }
      }
    }
    const moves = []; board.forEach((row, r) => row.forEach((t, c) => moves.push({ id: t.id, r, c })));
    return moves;
  }

  // ------------------------------------------------------------ intercambio
  function trySwap(board, a, b, rng, cfg) {
    cfg = cfgOf(cfg);
    if (!adjacent(a, b)) return { valid: false };
    swapCells(board, a, b);
    const ta = board[a[0]][a[1]], tb = board[b[0]][b[1]];
    let extra = null;
    const rA = ta.s === "rainbow", rB = tb.s === "rainbow";
    if (rA || rB) {
      extra = new Set();
      if (rA && rB) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) extra.add(key(r, c)); }
      else {
        const rk = rA ? a : b, ok = rA ? tb : ta;
        extra.add(key(rk[0], rk[1]));
        if (ok.t >= 0) for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c].t === ok.t) extra.add(key(r, c));
      }
    }
    if (!extra && groups(board).length === 0) { swapCells(board, a, b); return { valid: false }; }

    const swapKeys = [key(a[0], a[1]), key(b[0], b[1])];
    const steps = []; let total = 0, level = 0;
    while (true) {
      const gs = groups(board);
      if (!gs.length && !extra) break;
      level++;
      const set = new Set(extra || []);
      const creations = new Map();
      gs.forEach((g) => {
        g.cells.forEach((k) => set.add(k));
        const sp = specialFor(board, g, level === 1 ? swapKeys : []);
        if (sp) creations.set(sp.pos, { t: g.t, s: sp.s });
      });
      const protect = new Set(creations.keys());
      const activated = expand(board, set, protect);
      // se quita lo que se convierte en especial del resto de efectos
      const cleared = [];
      set.forEach((k) => { const [r, c] = unkey(k); const t = board[r][c]; if (t) cleared.push({ id: t.id, r, c, t: t.t, s: t.s }); });
      cleared.forEach((x) => { board[x.r][x.c] = null; });
      const created = [];
      creations.forEach((v, k) => { const [r, c] = unkey(k); const t = { id: nid(), t: v.t, s: v.s }; board[r][c] = t; created.push({ id: t.id, r, c, t: t.t, s: t.s }); });
      const score = cleared.length * cfg.POINTS_PER_TILE * level + activated.length * cfg.SPECIAL_BONUS * level;
      total += score;
      // gravedad
      const falls = [], spawns = [];
      for (let c = 0; c < N; c++) {
        let w = N - 1;
        for (let r = N - 1; r >= 0; r--) {
          const t = board[r][c];
          if (t) { if (r !== w) { board[w][c] = t; board[r][c] = null; falls.push({ id: t.id, r: w, c }); } w--; }
        }
        const n = w + 1;
        for (let k = 0; k < n; k++) { const t = newTile(rng); board[k][c] = t; spawns.push({ id: t.id, r: k, c, t: t.t, fromR: k - n }); }
      }
      steps.push({ level, cleared, created, activated, score, falls, spawns });
      extra = null;
    }
    let shuffled = null;
    if (findMoves(board).length === 0) shuffled = shuffle(board, rng);
    return { valid: true, steps, score: total, shuffled };
  }

  // ---------------------------------------------------------- jugador automático (pruebas)
  function bestMove(board, rng, cfg) {
    const moves = findMoves(board);
    let best = -1, pick = [];
    moves.forEach((m) => {
      const cb = cloneBoard(board);
      const r = trySwap(cb, m[0], m[1], mulberry(1234), cfg);
      if (r.score > best) { best = r.score; pick = [m]; } else if (r.score === best) pick.push(m);
    });
    return pick.length ? pick[Math.floor(rng() * pick.length)] : null;
  }
  function simulate(opts) {
    const cfg = cfgOf(opts.cfg);
    const rng = mulberry(opts.seed || 1);
    const board = newBoard(rng);
    let score = 0, moves = opts.moves, used = 0;
    const policy = opts.policy || "greedy";
    while (moves > 0) {
      let m;
      if (policy === "random") { const all = findMoves(board); m = all[Math.floor(rng() * all.length)]; }
      else m = bestMove(board, rng, cfg);
      if (!m) break;
      const r = trySwap(board, m[0], m[1], rng, cfg);
      score += r.score; moves--; used++;
      if (opts.goal && score >= opts.goal) break;
    }
    return { score, used };
  }

  QM.logic.match3 = { N, TYPES, newBoard, trySwap, findMoves, shuffle, groups, bestMove, simulate, mulberry, cloneBoard, adjacent };
  if (typeof module !== "undefined") module.exports = QM.logic.match3;
})();
