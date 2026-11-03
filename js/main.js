/* main.js · el hilo del juego: título → mapa → pruebas → final. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h, $ = QM.$;

  let board = null, boardPos = 0, busy = false, quitFn = null;

  const targetPos = () => { const n = QM.nextTrial(); return n === -1 ? 5 : n + 1; };

  QM.ui.canQuit = () => !!quitFn;
  QM.ui.doQuit = () => { if (quitFn) quitFn(); };

  const flow = (QM.flow = {
    boot() {
      QM.save.load();
      QM.audio.setMuted(QM.state.muted);
      QM.ui.hud.init();
      // el audio solo puede arrancar tras un toque del usuario
      const unlock = () => { QM.audio.unlock(); };
      document.addEventListener("pointerdown", unlock, { once: true });
      document.addEventListener("keydown", unlock, { once: true });
      this.title();
    },

    // ------------------------------------------------------------------ título
    title() {
      quitFn = null;
      QM.audio.music(null);
      QM.ui.hud.show(false, false);
      QM.ui.hud.update();
      const G = C().GAME;
      const hasProgress = QM.progress() > 0 || QM.state.introSeen;
      const chars = h("div", { class: "title-chars" },
        h("div", { class: "tc tc-l" }, QM.sprites.char("laura", { pose: "cheer" })),
        h("div", { class: "title-heart", "aria-hidden": "true", text: "♥" }),
        h("div", { class: "tc tc-p" }, QM.sprites.char("pablo", { pose: "idle" })));
      const btns = h("div", { class: "btn-col" },
        h("button", { class: "btn btn-big", type: "button", text: hasProgress ? G.CONTINUE : G.PLAY, onclick: () => { QM.audio.unlock(); QM.sfx("click"); flow.play(); } }));
      if (hasProgress) btns.append(h("button", { class: "btn btn-alt", type: "button", text: G.NEW_GAME,
        onclick: async () => { if (await QM.ui.confirm(C().UI.RESTART_CONFIRM)) { QM.save.reset(); flow.title(); } } }));
      const el = h("section", { class: "title-screen" },
        h("div", { class: "title-bg", "aria-hidden": "true" }, [1, 2, 3, 4, 5, 6].map((n) => h("i", { class: "tbg tbg" + n }))),
        QM.snow(),
        h("div", { class: "title-card" },
          h("h1", { class: "logo" }, h("span", { text: "Queda" }), " ", h("span", { text: "un mes" })),
          h("p", { class: "subtitle", text: G.SUBTITLE }),
          chars, btns,
          h("p", { class: "countdown-line", text: QM.time.phase() === "after" ? C().WEDDING.AFTER_TITLE : QM.fmt(G.COUNTDOWN_LINE) })));
      QM.ui.show(el);
    },

    async play() {
      if (busy) return; busy = true;
      try {
        QM.audio.music("map");
        if (!QM.state.introSeen) {
          this.showMap(0);
          await QM.ui.dialog("intro");
          QM.state.introSeen = true; QM.save.write();
          await this.walkTo(targetPos());
        } else {
          this.showMap(targetPos());
        }
      } finally { busy = false; }
    },

    // ------------------------------------------------------------------- mapa
    showMap(p) {
      quitFn = null;
      QM.audio.music("map");
      QM.ui.hud.show(true, true); QM.ui.hud.update();
      board = QM.map.build((i) => this.onNode(i));
      const cta = h("button", { class: "btn btn-big map-cta", type: "button", onclick: () => this.onNode(QM.nextTrial() === -1 ? 4 : QM.nextTrial()) });
      const ribbon = h("div", { class: "map-ribbon" },
        h("span", { class: "ribbon-days", text: QM.time.text() }),
        h("span", { class: "ribbon-hint", text: C().UI.MAP_HINT }));
      const el = h("section", { class: "map-screen" },
        h("div", { class: "board-holder" }, board),
        h("div", { class: "map-side" }, ribbon, cta));
      QM.ui.show(el);
      QM.map.place(board, p); QM.map.refresh(board, p); boardPos = p;
      this.updateCta();
    },
    updateCta() {
      const cta = $(".map-cta"); if (!cta) return;
      const n = QM.nextTrial();
      cta.textContent = n === -1 ? "Ir a la boda ♥" : n === 0 ? "Camino al siguiente destino" : "Jugar: " + C().TRIALS[n].name;
    },
    async walkTo(p) {
      if (p === boardPos) { QM.map.refresh(board, p); return; }
      await QM.map.walk(board, boardPos, p);
      boardPos = p; QM.map.refresh(board, p); this.updateCta();
    },
    async onNode(i) {
      if (busy) return; busy = true;
      QM.audio.unlock(); QM.sfx("click");
      try {
        if (i === 4) await this.finale(); else await this.trial(i);
      } finally { busy = false; }
    },

    // ----------------------------------------------------------------- pruebas
    async trial(i) {
      const T = C().TRIALS[i], game = QM.games[T.id], st = QM.state;
      if (QM.nextTrial() !== i) return;
      QM.audio.music(T.id === "battle" ? "battle" : null);
      if (!st.seen[i]) { await QM.ui.dialog(T.intro); st.seen[i] = true; QM.save.write(); }
      let skipped = false, won = false;
      while (true) {
        let resolveQuit; const quitP = new Promise((r) => { resolveQuit = r; });
        const ctx = { help: !!st.helped[i], alive: true, quit: () => resolveQuit("quit") };
        quitFn = () => { ctx.alive = false; resolveQuit("quit"); };
        QM.ui.hud.show(true, true);
        let res;
        try { res = await Promise.race([game.attempt(ctx), quitP]); }
        catch (e) { console.error(e); res = "quit"; }
        ctx.alive = false; quitFn = null;
        if (res === "win") { won = true; break; }
        if (res === "quit") { this.showMap(boardPos); return; }
        st.fails[i]++; QM.save.write();
        const c = await QM.ui.fail(i);
        if (c === "retry") continue;
        if (c === "help") { st.helped[i] = true; QM.save.write(); continue; }
        if (c === "skip") { skipped = true; st.skipped[i] = true; break; }
        this.showMap(boardPos); return;
      }
      // victoria (o continuar sin superarla)
      this.showMap(boardPos);
      QM.audio.music("map");
      await QM.ui.dialog(skipped ? "skip" : T.win);
      await QM.ui.reward(i);
      st.items[i] = true; QM.save.write();
      QM.ui.hud.update();
      QM.map.refresh(board, boardPos); this.updateCta();
      await QM.sleep(1100);
      await this.walkTo(targetPos());
      if (QM.nextTrial() === -1) {
        await QM.sleep(300);
        await QM.ui.dialog("final_intro");
        await this.finale(true);
      }
    },

    // ------------------------------------------------------------------- final
    async finale(fromWalk) {
      quitFn = null;
      QM.ui.hud.show(true, true);
      if (!fromWalk && QM.nextTrial() !== -1) return;
      QM.finale.show();
    },

    restart() {
      QM.save.reset(); QM.ui.hud.update(); quitFn = null; busy = false;
      this.title();
    },
  });

  // ayudas para probar (se pueden usar desde la consola del navegador)
  QM.debug = {
    give(n) { QM.state.items = [0, 1, 2, 3].map((k) => k < n); QM.state.introSeen = true; QM.state.seen = [0, 1, 2, 3].map((k) => k < n); QM.save.write(); flow.showMap(targetPos()); },
    trial(i) { QM.state.items = [0, 1, 2, 3].map((k) => k < i); QM.state.introSeen = true; QM.state.seen = [true, true, true, true]; QM.map && flow.showMap(i + 1); return flow.trial(i); },
    finale() { QM.state.items = [true, true, true, true]; QM.state.introSeen = true; flow.finale(true); },
  };

  window.addEventListener("DOMContentLoaded", () => flow.boot());
})();
