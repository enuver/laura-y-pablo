/* battle.js · Prueba 4: batalla de rol por turnos, cooperativa en el mismo dispositivo.
   Las reglas están en battle-logic.js; aquí solo está la pantalla y las animaciones.
   Los textos y los números de equilibrio están en content.js. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const C = () => globalThis.CONTENT;
  const h = QM.h;
  const L = () => QM.logic.battle;
  const WHO_COLOR = { laura: "#ff5c93", pablo: "#6fa3d8" };

  QM.games.battle = {
    attempt(ctx) {
      return new Promise((resolve) => {
        const TX = C().TEXT.BATTLE, CFG = C().BALANCE.BATTLE;
        const s = L().begin(L().create({ help: ctx.help, cfg: QM.applyMods(C().BALANCE.BATTLE, ctx.mods) }));
        const NAME = (w) => C().NAMES[w];
        let busy = true, over = false, frame = 0, chooser = null;
        const shown = { laura: { hp: s.heroes.laura.hp, ko: false }, pablo: { hp: s.heroes.pablo.hp, ko: false }, enemy: { hp: s.enemy.hp } };
        const syncShown = () => { ['laura', 'pablo'].forEach((w) => { shown[w].hp = s.heroes[w].hp; shown[w].ko = s.heroes[w].ko; }); shown.enemy.hp = s.enemy.hp; };

        // ----------------------------------------------------------- estructura
        const bg = h("canvas", { class: "bt-bg", "aria-hidden": "true" });
        QM.sprites.battleBg(bg);
        const enemyHolder = h("div", { class: "enemy-sprite" });
        const enemyHp = h("div", { class: "hp hp-enemy", role: "progressbar", "aria-label": "Vida del Caos" }, h("i"), h("span"));
        const enemyChips = h("div", { class: "chips" });
        const reticle = h("div", { class: "reticle", "aria-hidden": "true" }, h("span", { text: "⊕ " + TX.WEAK_SPOT }));
        const enemyBox = h("div", { class: "bt-enemy" },
          h("div", { class: "enemy-head" }, h("b", { class: "enemy-name", text: TX.ENEMY_NAME }), enemyHp, enemyChips),
          h("div", { class: "enemy-body" }, enemyHolder, reticle));
        const intent = h("div", { class: "intent", role: "status", "aria-live": "polite" });

        const heroEls = {};
        ["laura", "pablo"].forEach((w) => {
          const sprite = h("div", { class: "hero-sprite" }, QM.sprites.char(w, { pose: "idle" }));
          const hp = h("div", { class: "hp", role: "progressbar", "aria-label": "Vida de " + NAME(w) }, h("i"), h("span"));
          heroEls[w] = {
            root: h("div", { class: "hero hero-" + w, "data-who": w },
              h("div", { class: "hero-tag", "aria-hidden": "true", text: "▼ " + "TURNO" }),
              h("div", { class: "hero-bubble", "aria-hidden": "true" }),
              sprite, h("div", { class: "hero-info" }, h("b", { text: NAME(w) }), hp)),
            sprite, hp,
          };
        });
        const leireEl = h("div", { class: "leire", "aria-hidden": "true" }, QM.sprites.char("leire", { pose: "cheer" }), h("b", { text: NAME("leire") }));
        const fx = h("div", { class: "bt-fx", "aria-hidden": "true" });
        const field = h("div", { class: "bt-field" }, enemyBox, intent, h("div", { class: "bt-heroes" }, heroEls.laura.root, heroEls.pablo.root, leireEl), fx);

        const turnBanner = h("div", { class: "bt-turn", role: "status", "aria-live": "assertive" });
        const text = h("p", { class: "bt-text", "aria-live": "polite" });
        const teamStatus = h("div", { class: "chips team-chips" });
        const duoMeter = h("div", { class: "duo-meter" });
        const cmds = h("div", { class: "bt-cmds", role: "group", "aria-label": "Acciones" });
        const panel = h("div", { class: "bt-panel" }, h("div", { class: "bt-left" }, turnBanner, h("div", { class: "bt-info" }, text, h("div", { class: "bt-team" }, duoMeter, teamStatus))), cmds);
        const root = h("section", { class: "battle" }, bg, field, panel);
        ctx.root = root;
        QM.ui.show(root, "scr-battle");

        // animación de los fotogramas del Caos
        function drawEnemy() { enemyHolder.replaceChildren(QM.sprites.caos(frame++ % 2)); }
        drawEnemy();
        const tick = setInterval(() => { if (!ctx.alive || over) { clearInterval(tick); return; } if (!enemyHolder.classList.contains("dead")) drawEnemy(); }, 480);

        // ------------------------------------------------------------ utilidades
        function wait(ms) {
          return new Promise((res) => {
            if (QM.reduceMotion) ms = Math.min(ms, 250);
            const t = setTimeout(done, ms);
            function done() { clearTimeout(t); root.removeEventListener("pointerdown", done); res(); }
            root.addEventListener("pointerdown", done, { once: true });
          });
        }
        function say(t) { text.textContent = t; text.classList.remove("pop"); void text.offsetWidth; text.classList.add("pop"); }
        function bubble(who, t, ms) {
          const b = heroEls[who].root.querySelector(".hero-bubble");
          b.textContent = t; b.classList.add("on");
          setTimeout(() => b.classList.remove("on"), ms || 1700);
        }
        function floatNum(target, amount, cls) {
          const el = target === "enemy" ? enemyHolder : heroEls[target].sprite;
          const fr = fx.getBoundingClientRect(), br = el.getBoundingClientRect();
          const f = h("b", { class: "num " + cls, text: (cls === "heal" ? "+" : "-") + amount,
            style: `left:${br.left - fr.left + br.width / 2}px;top:${br.top - fr.top + br.height * 0.2}px` });
          fx.append(f); setTimeout(() => f.remove(), 1100);
        }
        function addClass(el, cls, ms) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
        function poseOf(w, pose) {
          const sp = heroEls[w].sprite; sp.replaceChildren(QM.sprites.char(w, { pose }));
        }
        async function flashPose(w, pose, ms) { poseOf(w, pose); await wait(ms); if (!s.heroes[w].ko) poseOf(w, "idle"); }

        // --------------------------------------------------------------- render
        function setHp(el, hp, max) {
          el.querySelector("i").style.width = (hp / max * 100) + "%";
          el.querySelector("span").textContent = hp + " / " + max;
          el.setAttribute("aria-valuemin", "0"); el.setAttribute("aria-valuemax", String(max)); el.setAttribute("aria-valuenow", String(hp));
          el.classList.toggle("low", hp / max <= 0.3);
        }
        const chip = (t, cls) => h("span", { class: "chip " + (cls || ""), text: t });
        function render() {
          const e = s.enemy;
          setHp(enemyHp, shown.enemy.hp, e.max);
          enemyChips.replaceChildren(
            ...(e.stun ? [chip("💫 Aturdido", "bad")] : []),
            ...(e.weak > 0 ? [chip("⊕ " + TX.WEAK_SPOT + " (" + e.weak + ")", "good")] : []),
            ...(e.silence > 0 ? [chip("🤐 Silenciado (" + e.silence + ")", "good")] : []),
            ...(e.phase2 ? [chip("🔥 Furioso", "bad")] : []));
          reticle.classList.toggle("on", e.weak > 0);
          enemyBox.classList.toggle("phase2", e.phase2);
          ["laura", "pablo"].forEach((w) => {
            const hr = s.heroes[w], el = heroEls[w];
            setHp(el.hp, shown[w].hp, hr.max);
            el.root.classList.toggle("ko", shown[w].ko);
            el.root.classList.toggle("active", !over && s.phase === "heroes" && L().actor(s) === w);
          });
          // equipo
          teamStatus.replaceChildren(
            ...(s.team.blessed ? [chip("🙏 Bendecido: la siguiente acción mejora", "good")] : []),
            ...(s.team.guard ? [chip("🛡 Defensa cerrada", "good")] : []));
          // intención del Caos
          const i = e.intent;
          if (i && !over) {
            const who = i.target === "both" ? TX.TARGET_BOTH : TX.TARGET.replace("{who}", NAME(i.target));
            const dmg = Math.round(i.dmg * (e.phase2 ? 1 + CFG.PHASE2_BONUS : 1));
            intent.className = "intent" + (i.heavy ? " heavy" : "");
            const parts = [h("span", { class: "i-ico", "aria-hidden": "true", text: i.heavy ? "⚠" : "!" }),
              h("span", { class: "i-txt" }, h("small", { text: TX.ENEMY_PREPARES }), h("b", { text: " " + i.name }), h("small", { text: " · " + who + " · ≈" + dmg }))];
            if (i.heavy) parts.push(h("span", { class: "i-heavy", text: TX.HEAVY }));
            intent.replaceChildren(...parts);
          } else if (over) intent.replaceChildren();
          // sintonía
          const need = CFG.DUO_CHARGE_NEEDED;
          duoMeter.replaceChildren(h("span", { class: "dm-label", text: TX.DUO_METER + " " + s.team.charge + "/" + need }),
            ...Array.from({ length: need }, (_, k) => h("i", { class: "dm-pip" + (k < s.team.charge ? " on" : "") })));
          duoMeter.classList.toggle("ready", s.team.charge >= need);
        }

        function renderTurn() {
          if (over || s.phase !== "heroes") { turnBanner.replaceChildren(); turnBanner.removeAttribute("data-who"); return; }
          const w = L().actor(s);
          turnBanner.dataset.who = w;
          turnBanner.replaceChildren(QM.sprites.portrait(w), h("div", { class: "tb-txt" }, h("b", { text: TX.TURN_OF.replace("{who}", NAME(w)) }), h("small", { text: "Pasa el dispositivo a quien lleva a " + NAME(w) + "." })));
          addClass(turnBanner, "pop", 600);
        }

        function renderCommands(enabled) {
          const acts = L().actions(s);
          cmds.replaceChildren();
          acts.forEach((a) => {
            const name = a.id === "leire" ? (a.avail ? TX.LEIRE_BTN : TX.LEIRE_BTN + " · " + TX.LEIRE_USED) : TX.SKILL_NAMES[a.id];
            let desc = TX.SKILL_DESC[a.id];
            let tag = "";
            if (a.id === "duo") tag = a.avail ? "¡Listo!" : (a.reason === "ko" ? "Hace falta a los dos" : TX.DUO_METER + " " + s.team.charge + "/" + CFG.DUO_CHARGE_NEEDED);
            else if (a.id === "leire") tag = a.avail ? (CFG.LEIRE_USES_TURN ? "Gasta el turno" : "Acción libre · 1 vez") : "";
            else if (!a.avail) tag = TX.COOLDOWN.replace("{n}", a.cd);
            const b = h("button", { type: "button", class: "cmd cmd-" + a.id + (a.id === "duo" ? " is-duo" : "") + (a.id === "leire" ? " is-leire" : "") + (a.avail ? "" : " off"),
              "aria-disabled": String(!(a.avail && enabled)), disabled: !(a.avail && enabled), "data-id": a.id,
              onclick() { if (chooser) { const c = chooser; chooser = null; QM.sfx("click"); c(a.id); } } },
              h("span", { class: "cmd-head" }, h("span", { class: "cmd-name", text: name }), tag ? h("span", { class: "cmd-tag", text: tag }) : null), h("span", { class: "cmd-desc", text: desc }));
            cmds.append(b);
          });
        }
        function choose() {
          busy = false; renderCommands(true);
          return new Promise((res) => { chooser = res; });
        }

        // ------------------------------------------------------------- eventos
        function actText(id, who) {
          if (id === "duo") return QM.pick(TX.DUO_ACT);
          const list = (who === "laura" ? TX.LAURA_ACT : TX.PABLO_ACT)[id];
          return list ? QM.pick(list) : "";
        }
        async function play(events) {
          for (const ev of events) {
            if (!ctx.alive) return;
            switch (ev.t) {
              case "anim": {
                if (ev.kind === "leire") {
                  await QM.ui.dialog("leire_call");
                  leireEl.classList.add("in"); QM.sfx("whoosh"); say(TX.LEIRE_HEAL_MSG); setTimeout(() => leireEl.classList.remove("in"), 2200); await wait(700);
                } else if (ev.kind === "enemyAtk") {
                  say(TX.ENEMY_ACT[ev.id]); addClass(enemyBox, "lunge", 500); QM.sfx("whoosh"); await wait(700);
                } else if (ev.kind === "duo") {
                  say(actText("duo")); QM.sfx("duo");
                  poseOf("laura", "sing"); poseOf("pablo", "attack");
                  addClass(heroEls.laura.root, "lunge", 500); addClass(heroEls.pablo.root, "lunge", 500);
                  await wait(900);
                } else {
                  say(actText(ev.id, ev.actor));
                  const el = heroEls[ev.actor].root;
                  if (ev.kind === "attack") { poseOf(ev.actor, "attack"); addClass(el, "lunge", 420); QM.sfx("whoosh"); }
                  else { poseOf(ev.actor, ev.actor === "laura" ? "sing" : "cheer"); addClass(el, "cast", 600); QM.sfx("buff"); }
                  await wait(650);
                }
                break;
              }
              case "clumsy": {
                const msg = ev.kind === "self" ? QM.pick(TX.CLUMSY_SELF) : QM.pick(TX.CLUMSY_PABLO);
                say(msg); QM.sfx("clumsy"); poseOf("laura", "hurt"); addClass(heroEls.laura.root, "trip", 700);
                await wait(1300);
                if (ev.kind === "pablo" && Math.random() < 0.8) bubble("pablo", QM.pick(TX.PABLO_AFTER_CLUMSY));
                break;
              }
              case "dmg": {
                if (ev.target === "enemy") {
                  shown.enemy.hp = ev.hp;
                  QM.sfx("hit"); addClass(enemyHolder, "hit", 420); floatNum("enemy", ev.amount, ev.weak ? "crit" : "dmg");
                  if (ev.weak) { say("¡Punto débil! " + ev.amount + " de daño."); }
                } else {
                  shown[ev.target].hp = ev.hp; QM.sfx("hurt"); addClass(heroEls[ev.target].root, "hit", 420); floatNum(ev.target, ev.amount, "dmg");
                  poseOf(ev.target, "hurt");
                }
                render(); await wait(520);
                ["laura", "pablo"].forEach((w) => { if (!shown[w].ko) poseOf(w, "idle"); });
                break;
              }
              case "heal": {
                shown[ev.target].hp = ev.hp; if (ev.revive) shown[ev.target].ko = false; QM.sfx("heal"); floatNum(ev.target, ev.amount, "heal"); addClass(heroEls[ev.target].root, "healfx", 800);
                if (ev.revive) poseOf(ev.target, "idle");
                render(); await wait(400); break;
              }
              case "ko": {
                shown[ev.target].ko = true; say(TX.KO.replace("{who}", NAME(ev.target))); render(); await wait(900); break;
              }
              case "buff": {
                if (ev.what === "blessed") say("🙏 ¡Bendecido! La siguiente acción del equipo será mejor.");
                else if (ev.what === "weak") say("⊕ ¡Punto débil descubierto! El Caos recibirá más daño.");
                else if (ev.what === "silence") say("🤐 ¡Silencio! El Caos hará menos daño.");
                else if (ev.what === "guard") say("🛡 ¡Defensa cerrada! El próximo ataque casi no hace daño.");
                render(); await wait(650); break;
              }
              case "stun": say("💫 ¡El Caos queda aturdido!"); QM.sfx("stun"); render(); await wait(800); break;
              case "stunned": say(TX.STUNNED); addClass(enemyBox, "dizzy", 800); render(); await wait(1000); break;
              case "effect": {
                if (ev.what === "cooldown") say(TX.ENEMY_EFFECT.cooldown.replace("{who}", NAME(ev.target)));
                else say(TX.ENEMY_EFFECT.duo);
                render(); await wait(800); break;
              }
              case "phase2": say("🔥 ¡El Caos se enfurece! Ahora golpea más fuerte."); QM.sfx("boom"); render(); addClass(enemyBox, "lunge", 500); await wait(1100); bubble("pablo", QM.pick(TX.PABLO_QUIPS), 2400); break;
              case "end": return;
              case "meter": case "turn": case "phase": render(); break;
              default: break;
            }
          }
          syncShown(); render();
        }

        // ----------------------------------------------------------------- bucle
        async function main() {
          say("¡El Caos de los Preparativos bloquea el camino!");
          render(); renderCommands(false);
          await wait(1100);
          while (!s.over && ctx.alive) {
            if (s.phase === "heroes") {
              render(); renderTurn();
              const who = L().actor(s);
              if (Math.random() < 0.2) bubble(who, who === "laura" ? QM.pick(TX.LAURA_QUIPS) : "...", 1800);
              say(TX.TURN_OF.replace("{who}", NAME(who)) + ". " + "Elige una acción.");
              const id = await choose();
              busy = true; renderCommands(false);
              const ev = L().perform(s, id);
              await play(ev);
              ["laura", "pablo"].forEach((w) => { if (!s.heroes[w].ko) poseOf(w, "idle"); });
            } else if (s.phase === "enemy") {
              renderTurn();
              const ev = L().enemyTurn(s);
              await play(ev);
              await wait(250);
            } else break;
          }
          if (!ctx.alive) return;
          over = true; render(); renderTurn(); renderCommands(false);
          clearInterval(tick);
          if (s.over === "win") {
            enemyHolder.classList.add("dead"); QM.sfx("win"); say(TX.VICTORY);
            ["laura", "pablo"].forEach((w) => poseOf(w, "cheer"));
            await QM.sleep(2200); resolve("win");
          } else {
            say(TX.DEFEAT); QM.sfx("lose"); await QM.sleep(2000); resolve("lose");
          }
        }
        main();
      });
    },
  };
})();
