/* battle-logic.js · reglas puras del combate por turnos (sin pantalla), para poder probarlas.
   Orden de cada ronda: Laura → Pablo → El Caos. El Caos anuncia su ataque al empezar la ronda. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  QM.logic = QM.logic || {};

  const ORDER = ["laura", "pablo"];
  const SKILLS = {
    laura: ["l_basic", "l_do", "l_lesson", "l_cromos"],
    pablo: ["p_basic", "p_silence", "p_analysis", "p_guard"],
  };
  const CAT = { l_basic: "atk", l_do: "atk", l_lesson: "atk", p_basic: "atk", l_cromos: "sup", p_silence: "sup", p_analysis: "sup", p_guard: "sup", duo: "duo" };
  const CD_KEY = { l_do: "L_DO", l_lesson: "L_LESSON", l_cromos: "L_CROMOS", p_silence: "P_SILENCE", p_analysis: "P_ANALYSIS", p_guard: "P_GUARD" };

  function cfgOf(extra) {
    const B = (globalThis.CONTENT && globalThis.CONTENT.BALANCE && globalThis.CONTENT.BALANCE.BATTLE) || {};
    return Object.assign({ HERO_VARIANCE: 0.1 }, B, extra || {});
  }
  const vary = (rng, v) => 1 + (rng() * 2 - 1) * v;

  function create(opts) {
    opts = opts || {};
    const cfg = cfgOf(opts.cfg);
    const rng = opts.rng || Math.random;
    const hf = opts.help ? cfg.HELP.HERO_HP_FACTOR : 1, ef = opts.help ? cfg.HELP.ENEMY_HP_FACTOR : 1;
    const s = {
      cfg, rng, help: !!opts.help, round: 1, phase: "heroes", idx: 0, over: null,
      heroes: {
        laura: { hp: Math.round(cfg.LAURA_HP * hf), max: Math.round(cfg.LAURA_HP * hf), ko: false, cd: { l_do: 0, l_lesson: 0, l_cromos: 0 }, streak: 0 },
        pablo: { hp: Math.round(cfg.PABLO_HP * hf), max: Math.round(cfg.PABLO_HP * hf), ko: false, cd: { p_silence: 0, p_analysis: 0, p_guard: 0 }, streak: 0 },
      },
      enemy: { hp: Math.round(cfg.ENEMY_HP * ef), max: Math.round(cfg.ENEMY_HP * ef), stun: false, weak: 0, silence: 0, phase2: false, last: null, intent: null },
      team: { charge: 0, blessed: false, guard: false, guardFactor: cfg.P_GUARD.factor, leireUsed: false, lastCat: null },
      stats: { actions: 0, clumsy: 0 },
    };
    chooseIntent(s);
    return s;
  }

  const actor = (s) => ORDER[s.idx];
  const alive = (s) => ORDER.filter((w) => !s.heroes[w].ko);

  function chooseIntent(s) {
    const cfg = s.cfg;
    const pool = cfg.ATTACKS.filter((a) => (!a.phase2 || s.enemy.phase2) && a.id !== s.enemy.last);
    let tot = pool.reduce((n, a) => n + a.weight, 0), r = s.rng() * tot, pick = pool[0];
    for (const a of pool) { r -= a.weight; if (r <= 0) { pick = a; break; } }
    const al = alive(s);
    const target = pick.target === "both" ? "both" : al[Math.floor(s.rng() * al.length)];
    s.enemy.intent = { id: pick.id, name: pick.name, dmg: pick.dmg, target, heavy: !!pick.heavy, effect: pick.effect || null };
  }

  function startTurn(s) {
    while (s.idx < ORDER.length && s.heroes[ORDER[s.idx]].ko) s.idx++;
    if (s.idx >= ORDER.length) { s.phase = "enemy"; return; }
    const h = s.heroes[actor(s)];
    Object.keys(h.cd).forEach((k) => { if (h.cd[k] > 0) h.cd[k]--; });
    s.phase = "heroes";
  }
  function begin(s) { s.idx = 0; startTurn(s); return s; }

  // --------------------------------------------------------------- consultas
  function buffCount(s) {
    return (s.team.blessed ? 1 : 0) + (s.enemy.weak > 0 ? 1 : 0) + (s.enemy.silence > 0 ? 1 : 0) + (s.team.guard ? 1 : 0);
  }
  function actions(s) {
    const who = actor(s), h = s.heroes[who], cfg = s.cfg;
    const list = SKILLS[who].map((id) => ({ id, avail: !(h.cd[id] > 0), cd: h.cd[id] || 0, reason: h.cd[id] > 0 ? "cooldown" : null, free: false }));
    const bothAlive = alive(s).length === 2;
    list.push({ id: "duo", avail: s.team.charge >= cfg.DUO_CHARGE_NEEDED && bothAlive, cd: 0, reason: !bothAlive ? "ko" : "charge", free: false });
    list.push({ id: "leire", avail: !s.team.leireUsed, cd: 0, reason: s.team.leireUsed ? "used" : null, free: !cfg.LEIRE_USES_TURN });
    return list;
  }

  // ----------------------------------------------------------------- daño
  function hurt(s, who, amount, ev) {
    const h = s.heroes[who];
    if (h.ko) return;
    amount = Math.max(1, Math.round(amount));
    h.hp = Math.max(0, h.hp - amount);
    ev.push({ t: "dmg", target: who, amount, hp: h.hp });
    if (h.hp <= 0) { h.ko = true; ev.push({ t: "ko", target: who }); }
    if (alive(s).length === 0) { s.over = "lose"; s.phase = "over"; ev.push({ t: "end", result: "lose" }); }
  }
  function hitEnemy(s, base, ev, opts) {
    opts = opts || {};
    let d = base * vary(s.rng, s.cfg.HERO_VARIANCE);
    if (!opts.fixed) d *= (opts.mult || 1) * (s.enemy.weak > 0 ? 1 + s.cfg.P_ANALYSIS.bonus : 1);
    d = Math.max(1, Math.round(d));
    s.enemy.hp = Math.max(0, s.enemy.hp - d);
    ev.push({ t: "dmg", target: "enemy", amount: d, weak: s.enemy.weak > 0 && !opts.fixed, hp: s.enemy.hp });
    if (s.enemy.hp <= 0 && !s.over) { s.over = "win"; s.phase = "over"; ev.push({ t: "end", result: "win" }); }
  }

  function endTurn(s, ev) {
    if (s.over) return;
    s.idx++;
    startTurn(s);
    if (s.phase === "enemy") ev.push({ t: "phase", phase: "enemy" });
    else ev.push({ t: "turn", who: actor(s) });
  }

  // --------------------------------------------------------------- acciones
  function perform(s, id) {
    const ev = [];
    if (s.over || s.phase !== "heroes") return ev;
    const who = actor(s), h = s.heroes[who], cfg = s.cfg;
    const av = actions(s).find((a) => a.id === id);
    if (!av || !av.avail) return ev;

    if (id === "leire") {
      s.team.leireUsed = true;
      ev.push({ t: "anim", kind: "leire" });
      ORDER.forEach((w) => {
        const t = s.heroes[w];
        const revive = t.ko; t.ko = false;
        const before = t.hp; t.hp = Math.min(t.max, t.hp + cfg.LEIRE_HEAL);
        ev.push({ t: "heal", target: w, amount: t.hp - before, revive, hp: t.hp });
      });
      if (cfg.LEIRE_USES_TURN) endTurn(s, ev);
      return ev;
    }

    const blessed = s.team.blessed;
    const buffsBefore = buffCount(s);
    s.stats.actions++;
    ev.push({ t: "anim", kind: id === "duo" ? "duo" : CAT[id] === "atk" ? "attack" : "cast", actor: who, id });

    // cooldown de la habilidad
    if (CD_KEY[id]) h.cd[id] = cfg[CD_KEY[id]].cooldown;

    // torpeza de Laura (solo ataques)
    let clumsy = null;
    if (who === "laura" && CAT[id] === "atk" && id !== "duo") {
      if (!blessed) {
        let p = cfg.CLUMSY_CHANCE * (id === "l_basic" ? cfg.CLUMSY_BASIC_FACTOR : 1) * (s.help ? cfg.HELP.CLUMSY_FACTOR : 1);
        if (h.streak >= cfg.CLUMSY_MAX_STREAK) p = 0;
        if (s.rng() < p) clumsy = s.heroes.pablo.ko || s.rng() < 0.5 ? "self" : "pablo";
      }
      h.streak = clumsy ? h.streak + 1 : 0;
    }
    const mult = blessed ? cfg.L_CROMOS.mult : 1;

    if (clumsy) {
      s.stats.clumsy++;
      ev.push({ t: "clumsy", kind: clumsy });
      if (clumsy === "self") hurt(s, "laura", cfg.CLUMSY_SELF_DAMAGE, ev);
      else hurt(s, "pablo", cfg.CLUMSY_PABLO_DAMAGE, ev);
    } else {
      switch (id) {
        case "l_basic": hitEnemy(s, cfg.L_BASIC.dmg, ev, { mult }); break;
        case "l_do": hitEnemy(s, cfg.L_DO.dmg, ev, { mult }); break;
        case "l_lesson":
          hitEnemy(s, cfg.L_LESSON.dmg, ev, { mult });
          if (!s.over && s.rng() < cfg.L_LESSON.stun) { s.enemy.stun = true; ev.push({ t: "stun" }); }
          break;
        case "l_cromos": s.team.blessed = true; ev.push({ t: "buff", what: "blessed" }); break;
        case "p_basic": hitEnemy(s, cfg.P_BASIC.dmg, ev, { mult }); break;
        case "p_silence": s.enemy.silence = cfg.P_SILENCE.turns + (blessed ? 1 : 0); ev.push({ t: "buff", what: "silence", turns: s.enemy.silence }); break;
        case "p_analysis": s.enemy.weak = cfg.P_ANALYSIS.turns + (blessed ? 1 : 0); ev.push({ t: "buff", what: "weak", turns: s.enemy.weak }); break;
        case "p_guard": s.team.guard = true; s.team.guardFactor = blessed ? cfg.P_GUARD.factor * 0.6 : cfg.P_GUARD.factor; ev.push({ t: "buff", what: "guard" }); break;
        case "duo": {
          const d = cfg.DUO_DAMAGE * (1 + cfg.DUO_BUFF_BONUS * buffsBefore);
          hitEnemy(s, d, ev, { fixed: true });
          break;
        }
      }
    }
    // la mejora de «Cromos» se gasta en la siguiente acción (no en la propia)
    if (blessed && id !== "l_cromos") s.team.blessed = false;

    // sintonía para el Dúo
    if (id === "duo") { s.team.charge = 0; s.team.lastCat = null; }
    else {
      let add = 1;
      if (s.team.lastCat && s.team.lastCat !== CAT[id]) add += cfg.DUO_COMPLEMENT_BONUS;
      s.team.charge = Math.min(cfg.DUO_CHARGE_NEEDED, s.team.charge + add);
      s.team.lastCat = CAT[id];
    }
    ev.push({ t: "meter", charge: s.team.charge });
    if (!s.over) endTurn(s, ev);
    return ev;
  }

  // ---------------------------------------------------------- turno del Caos
  function enemyTurn(s) {
    const ev = [];
    if (s.over || s.phase !== "enemy") return ev;
    const e = s.enemy, cfg = s.cfg, a = e.intent;
    if (e.stun) {
      e.stun = false;
      ev.push({ t: "stunned" });
    } else {
      ev.push({ t: "anim", kind: "enemyAtk", id: a.id });
      const base = a.dmg * (e.phase2 ? 1 + cfg.PHASE2_BONUS : 1) * vary(s.rng, cfg.ENEMY_VARIANCE);
      const targets = a.target === "both" ? alive(s) : (alive(s).includes(a.target) ? [a.target] : [alive(s)[0]]);
      const sil = e.silence > 0 ? cfg.P_SILENCE.factor : 1;
      const gua = s.team.guard ? s.team.guardFactor : 1;
      targets.forEach((w) => hurt(s, w, base * sil * gua, ev));
      if (!s.over) {
        if (a.effect === "cooldown") targets.forEach((w) => { const h = s.heroes[w]; Object.keys(h.cd).forEach((k) => { if (h.cd[k] > 0) h.cd[k]++; }); ev.push({ t: "effect", what: "cooldown", target: w }); });
        if (a.effect === "duo" && s.team.charge > 0) { s.team.charge--; ev.push({ t: "effect", what: "duo" }); ev.push({ t: "meter", charge: s.team.charge }); }
      }
      if (e.silence > 0) e.silence--;
      s.team.guard = false;
      e.last = a.id;
    }
    if (s.over) return ev;
    if (e.weak > 0) e.weak--;
    if (!e.phase2 && e.hp <= e.max * cfg.PHASE2_AT) { e.phase2 = true; ev.push({ t: "phase2" }); }
    s.round++;
    chooseIntent(s);
    s.idx = 0; startTurn(s);
    if (s.phase === "enemy") { // nadie en pie (no debería ocurrir)
      s.over = "lose"; ev.push({ t: "end", result: "lose" });
    } else ev.push({ t: "turn", who: actor(s), round: s.round });
    return ev;
  }

  // --------------------------------------------------------- jugadores automáticos (pruebas)
  function policyNaive(s) {
    const av = actions(s).filter((a) => a.avail && a.id !== "leire" && a.id !== "duo");
    return av[Math.floor(s.rng() * av.length)].id;
  }
  function policySmart(s) {
    const who = actor(s), av = Object.fromEntries(actions(s).map((a) => [a.id, a.avail]));
    const hs = s.heroes, i = s.enemy.intent, t = s.team;
    const low = ORDER.some((w) => hs[w].ko || hs[w].hp < hs[w].max * 0.38);
    if (av.leire && low) return "leire";
    if (av.duo && (buffCount(s) >= 1 || s.enemy.hp < 130)) return "duo";
    if (who === "pablo") {
      if (av.p_guard && (i.heavy || i.target === "both") && !t.guard) return "p_guard";
      if (av.p_analysis && s.enemy.weak === 0) return "p_analysis";
      if (av.p_silence && s.enemy.silence === 0) return "p_silence";
      if (av.p_guard && !t.guard && s.round % 2 === 0) return "p_guard";
      return "p_basic";
    }
    if (av.l_cromos && !t.blessed && (s.enemy.weak > 0 || av.duo)) return "l_cromos";
    if (av.l_do) return "l_do";
    if (av.l_lesson) return "l_lesson";
    return "l_basic";
  }

  function simulate(opts) {
    const rng = (QM.logic.match3 && QM.logic.match3.mulberry) ? QM.logic.match3.mulberry(opts.seed || 1) : Math.random;
    const s = begin(create({ cfg: opts.cfg, help: opts.help, rng }));
    const pol = opts.policy === "naive" ? policyNaive : policySmart;
    let guard = 0;
    while (!s.over && guard++ < 400) {
      if (s.phase === "heroes") perform(s, pol(s));
      else if (s.phase === "enemy") enemyTurn(s);
    }
    return { result: s.over, rounds: s.round, actions: s.stats.actions, clumsy: s.stats.clumsy, laura: s.heroes.laura.hp, pablo: s.heroes.pablo.hp, ko: ORDER.filter((w) => s.heroes[w].ko).length };
  }

  QM.logic.battle = { create, begin, actions, perform, enemyTurn, buffCount, simulate, actor, alive, ORDER, SKILLS, CAT };
  if (typeof module !== "undefined") module.exports = QM.logic.battle;
})();
