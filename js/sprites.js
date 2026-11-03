/* sprites.js · Todo el pixel art se dibuja por código (no hay imágenes).
   Los personajes se dibujan en una rejilla de 32 × 44 «píxeles» y luego el
   navegador los amplía sin suavizarlos.

   ► PARA CORREGIR EL ASPECTO DE LOS PERSONAJES: cambia los colores de LOOKS
     (aquí abajo) o dime qué rasgo ajustar. */
(function () {
  const QM = (globalThis.QM = globalThis.QM || {});
  const S = (QM.sprites = {});

  const INK = "#1a1426";
  const LOOKS = {
    laura: {
      skin: "#f3c9ac", hair: "#2a1a16", hairHi: "#4b2f27", lips: "#c9354b", blush: "#f19a9a",
      top: "#e8b04a", top2: "#fff1c9", bottom: "#1d1822", hem: "#1d1822", shoes: "#c9a77a", earring: "#f2b134", frameL: "#ff3d9a", frameR: "#19c3b5", frameT: "#ffd23f",
    },
    pablo: {
      skin: "#ebbf9f", hair: "#6b4125", hairHi: "#8a5a33", beard: "#b4562a", beardDk: "#8f3f1c",
      frame: "#d4b05a", lens: "#eaf8ff", jacket: "#5d84b0", jacketDk: "#41648a", collar: "#b08a62",
      collarHi: "#d3b48c", tee: "#22242d", pants: "#2c3a56", shoes: "#2a2a2f", teeth: "#fff6e8",
    },
    leire: {
      skin: "#efc1a1", hair: "#3a2218", hairHi: "#5a3a2b", lips: "#c0475a",
      top: "#7c4dff", stripe: "#5b34d6", pants: "#1f2433", shoes: "#f4f1ea", lanyard: "#c9a6ff",
    },
    host: {
      skin: "#e6b08b", hair: "#1d1d26", hairHi: "#3a3a4a", suit: "#18b6c6", suitDk: "#0e8a97",
      shirt: "#fff6e8", bow: "#ff4d6d", pants: "#0e5f6b", shoes: "#111",
    },
  };
  S.looks = LOOKS;

  // ---------------------------------------------------------------- utilidades
  function mk(w, h, cls) {
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    cv.className = "spr" + (cls ? " " + cls : "");
    cv.setAttribute("aria-hidden", "true");
    return cv;
  }
  function Rfor(ctx) { return (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }; }
  function disc(R, cx, cy, r, c) {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.4) R(cx + x, cy + y, 1, 1, c);
  }
  function ring(R, cx, cy, r1, r2, c) {
    for (let y = -r2; y <= r2; y++) for (let x = -r2; x <= r2; x++) {
      const d = Math.sqrt(x * x + y * y);
      if (d >= r1 && d <= r2) R(cx + x, cy + y, 1, 1, c);
    }
  }

  // ------------------------------------------------------------- piezas comunes
  function eyes(R, pose, y, c, lens) {
    const col = c || INK;
    if (pose === "hurt") {
      [[12, y], [19, y]].forEach(([x, yy], i) => {
        if (i === 0) { R(x, yy, 1, 1, col); R(x + 1, yy + 1, 1, 1, col); R(x, yy + 2, 1, 1, col); }
        else { R(x + 1, yy, 1, 1, col); R(x, yy + 1, 1, 1, col); R(x + 1, yy + 2, 1, 1, col); }
      });
    } else if (pose === "cheer" || pose === "sing") {
      R(12, y + 1, 3, 1, col); R(11, y + 2, 1, 1, col); R(15, y + 2, 1, 1, col);
      R(17, y + 1, 3, 1, col); R(16, y + 2, 1, 1, col); R(20, y + 2, 1, 1, col);
    } else {
      const h = lens ? 2 : 3;
      R(12, y, 2, h, col); R(18 + (lens ? 1 : 0), y, 2, h, col);
      R(12, y, 1, 1, "#fff"); R(18 + (lens ? 1 : 0), y, 1, 1, "#fff");
    }
  }
  function mouth(R, pose, c, teeth) {
    if (pose === "hurt") { R(15, 17, 2, 2, "#5a1020"); return; }
    if (pose === "attack" || pose === "cheer" || pose === "sing") {
      R(14, 16, 4, 3, "#5a1020"); R(15, 18, 2, 1, "#e0607a"); if (teeth) R(14, 16, 4, 1, teeth);
      return;
    }
    if (teeth) { R(14, 16, 4, 2, teeth); return; }
    R(14, 16, 4, 1, c); R(13, 15, 1, 1, c); R(18, 15, 1, 1, c);
  }
  function arms(R, pose, sleeve, skin, sleeveLen, extraSleeve) {
    const leftIdle = () => { R(6, 22, 3, sleeveLen, sleeve); R(6, 22 + sleeveLen, 3, 11 - sleeveLen, skin); R(6, 33, 3, 2, skin); };
    const rightIdle = () => { R(23, 22, 3, sleeveLen, sleeve); R(23, 22 + sleeveLen, 3, 11 - sleeveLen, skin); R(23, 33, 3, 2, skin); };
    if (pose === "cheer") {
      R(5, 21, 5, 3, sleeve); R(22, 21, 5, 3, sleeve);
      R(3, 9, 3, 13, sleeve); R(26, 9, 3, 13, sleeve);
      R(3, 6, 3, 4, skin); R(26, 6, 3, 4, skin);
      if (sleeveLen < 8) { R(3, 14, 3, 8, skin); R(26, 14, 3, 8, skin); R(3, 9, 3, 5, sleeve); R(26, 9, 3, 5, sleeve); }
    } else if (pose === "attack") {
      leftIdle();
      R(23, 22, 3, 4, sleeve); R(25, 23, 5, 3, sleeve); R(29, 22, 3, 5, skin);
    } else if (pose === "sing") {
      leftIdle();
      R(23, 21, 4, 3, sleeve); R(25, 12, 3, 10, sleeve); R(25, 9, 3, 4, skin);
    } else { leftIdle(); rightIdle(); }
  }
  function legs(R, c, shoe, y0) {
    R(10, y0, 5, 42 - y0, c); R(17, y0, 5, 42 - y0, c);
    R(9, 42, 6, 2, shoe); R(17, 42, 6, 2, shoe);
  }

  // --------------------------------------------------------------- personajes
  function laura(R, o) {
    const L = LOOKS.laura, pose = o.pose;
    R(7, 6, 18, 26, L.hair);                                  // pelo largo (detrás)
    R(10, 34, 5, 8, L.bottom); R(17, 34, 5, 8, L.bottom);    // pantalón ancho negro
    R(10, 42, 5, 2, L.shoes); R(17, 42, 5, 2, L.shoes);      // sandalias
    R(8, 29, 16, 7, L.bottom);
    [[10, 31], [18, 32], [14, 35], [20, 37], [11, 39], [18, 40]].forEach(([x, y]) => { R(x, y, 2, 2, "#fff"); R(x, y, 1, 1, "#ffd23f"); }); // margaritas
    R(9, 21, 14, 10, L.top); for (let y = 22; y < 31; y += 3) R(9, y, 14, 1, L.top2); for (let x = 11; x < 23; x += 4) R(x, 21, 1, 10, L.top2); // camisa de cuadros
    R(14, 19, 4, 3, L.skin);
    R(8, 24, 2, 8, L.hair); R(22, 24, 2, 8, L.hair);         // mechones sobre los hombros
    arms(R, pose, L.top, L.skin, 5);
    R(10, 6, 12, 14, L.skin); R(9, 8, 14, 10, L.skin);       // cara
    R(10, 18, 12, 1, "#e0ad8f");
    R(8, 3, 16, 5, L.hair); R(9, 2, 14, 1, L.hair);          // flequillo
    R(9, 8, 4, 3, L.hair); R(13, 8, 8, 1, L.hair); R(20, 8, 3, 3, L.hair);
    R(8, 8, 2, 12, L.hair); R(22, 8, 2, 12, L.hair);
    R(12, 3, 5, 1, L.hairHi); R(10, 5, 2, 1, L.hairHi);
    R(8, 16, 2, 2, L.earring); R(22, 16, 2, 2, L.earring);   // pendientes cuadrados
    // gafas de colorines
    R(10, 10, 6, 5, L.frameL); R(17, 10, 6, 5, L.frameR); R(16, 10, 1, 1, L.frameT); R(11, 11, 4, 3, "#fff6e0"); R(18, 11, 4, 3, "#fff6e0"); R(9, 11, 1, 1, L.frameT); R(23, 11, 1, 1, L.frameT);
    eyes(R, pose, 12, INK, true);
    R(10, 15, 2, 1, L.blush); R(20, 15, 2, 1, L.blush);
    mouth(R, pose, L.lips, null);
    if (pose === "idle" || pose === "think") { R(14, 16, 4, 1, L.lips); }
  }

  function pablo(R, o) {
    const L = LOOKS.pablo, pose = o.pose;
    legs(R, L.pants, L.shoes, 35);
    R(9, 21, 14, 14, L.jacket); R(14, 22, 4, 13, L.tee);     // chaqueta vaquera + camiseta
    R(13, 22, 1, 13, L.jacketDk); R(18, 22, 1, 13, L.jacketDk); R(9, 34, 14, 1, L.jacketDk);
    R(11, 28, 2, 2, L.jacketDk); R(19, 28, 2, 2, L.jacketDk);
    R(14, 19, 4, 3, L.skin);
    R(9, 21, 5, 3, L.collar); R(18, 21, 5, 3, L.collar);     // cuello de borrego
    R(10, 22, 1, 1, L.collarHi); R(12, 21, 1, 1, L.collarHi); R(19, 22, 1, 1, L.collarHi); R(21, 21, 1, 1, L.collarHi);
    arms(R, pose, L.jacket, L.skin, 11);
    R(10, 6, 12, 14, L.skin); R(9, 8, 14, 10, L.skin);       // cara
    R(8, 11, 1, 3, L.skin); R(23, 11, 1, 3, L.skin);
    R(9, 13, 14, 7, L.beard); R(10, 19, 12, 2, L.beard); R(11, 21, 10, 1, L.beard); // barba cobriza
    R(9, 13, 1, 1, L.skin); R(22, 13, 1, 1, L.skin);
    R(12, 14, 8, 2, L.beardDk);                              // bigote
    R(9, 4, 14, 4, L.hair); R(11, 3, 3, 1, L.hair); R(16, 2, 4, 2, L.hair); R(21, 3, 2, 2, L.hair); R(8, 8, 2, 4, L.hair); R(22, 8, 2, 4, L.hair); // pelo despeinado
    R(10, 8, 4, 2, L.hair); R(15, 8, 3, 1, L.hair); R(19, 8, 3, 2, L.hair);
    R(13, 4, 3, 1, L.hairHi); R(18, 3, 2, 1, L.hairHi);
    // gafas redondas de carey
    R(10, 10, 6, 5, L.frame); R(17, 10, 6, 5, L.frame); R(16, 11, 1, 1, L.frame);
    R(11, 11, 4, 3, L.lens); R(18, 11, 4, 3, L.lens); R(9, 11, 1, 1, L.frame); R(23, 11, 1, 1, L.frame);
    R(11, 11, 1, 1, "#fff");
    eyes(R, pose, 12, INK, true);
    R(14, 16, 4, 2, L.beard);
    mouth(R, pose, L.beardDk, L.teeth);
  }

  function leire(R, o) {
    const L = LOOKS.leire, pose = o.pose;
    legs(R, L.pants, L.shoes, 33);
    R(9, 21, 14, 12, L.top);                                 // camiseta morada (guiño a BTS)
    R(9, 31, 14, 2, L.stripe);
    R(12, 24, 3, 2, "#fff"); R(17, 24, 3, 2, "#fff"); R(12, 26, 8, 2, "#fff"); R(13, 28, 6, 1, "#fff"); R(15, 29, 2, 1, "#fff"); // corazón
    R(14, 19, 4, 3, L.skin);
    R(12, 0, 8, 1, "#c9a6ff");                              // cinta morada en el pelo
    R(15, 21, 2, 3, L.lanyard);
    arms(R, pose, L.top, L.skin, 5);
    R(10, 6, 12, 14, L.skin); R(9, 8, 14, 10, L.skin);
    R(8, 11, 1, 3, L.skin); R(23, 11, 1, 3, L.skin);
    R(12, 0, 8, 4, L.hair); R(13, 1, 2, 1, L.hairHi);        // moño
    R(9, 3, 14, 5, L.hair); R(10, 8, 12, 2, L.hair); R(9, 8, 1, 6, L.hair); R(22, 8, 1, 6, L.hair);
    R(14, 4, 4, 1, L.hairHi);
    eyes(R, pose, 12);
    R(10, 15, 2, 1, "#f2a8a0"); R(20, 15, 2, 1, "#f2a8a0");
    if (pose === "idle" || pose === "think") { R(13, 16, 6, 2, "#fff"); R(13, 18, 6, 1, L.lips); R(13, 16, 1, 1, L.lips); R(18, 16, 1, 1, L.lips); }
    else mouth(R, pose, L.lips, "#fff");
  }

  function host(R, o) {
    const L = LOOKS.host, pose = o.pose;
    legs(R, L.pants, L.shoes, 35);
    R(9, 21, 14, 14, L.suit); R(13, 22, 6, 12, L.shirt);
    R(9, 21, 4, 11, L.suitDk); R(19, 21, 4, 11, L.suitDk);
    R(13, 22, 6, 2, L.bow); R(15, 22, 2, 2, "#c9184a");
    R(11, 33, 2, 2, "#ffd23f");
    R(14, 19, 4, 3, L.skin);
    arms(R, pose === "idle" ? "idle" : pose, L.suit, L.skin, 11);
    R(10, 6, 12, 14, L.skin); R(9, 8, 14, 10, L.skin);
    R(8, 11, 1, 3, L.skin); R(23, 11, 1, 3, L.skin);
    R(8, 1, 16, 5, L.hair); R(10, 0, 12, 1, L.hair); R(8, 6, 3, 4, L.hair); R(21, 6, 3, 4, L.hair); R(9, 4, 14, 4, L.hair);
    R(12, 1, 6, 1, L.hairHi);
    eyes(R, pose, 12);
    R(13, 14, 6, 1, L.hair);
    mouth(R, pose, INK, "#fff");
    if (pose === "idle") R(14, 16, 4, 2, "#fff");
  }

  const DRAW = { laura, pablo, leire, host };

  function drawProp(R, who, o) {
    if (o.prop === "baton") {
      R(25, 1, 4, 5, "#cfcfcf"); R(25, 1, 4, 1, "#fff"); R(26, 6, 2, 3, "#555");
    } else if (o.prop === "unused") {
    } else if (o.prop === "mic") {
      R(27, 20, 2, 6, "#777"); R(26, 17, 4, 4, "#cfcfcf"); R(27, 18, 2, 1, "#fff");
    }
  }

  // Devuelve un <canvas> con el personaje completo.
  S.char = function (who, o) {
    o = Object.assign({ pose: "idle" }, o || {});
    const bust = !!o.bust;
    const cv = mk(32, bust ? 30 : 44, bust ? "spr-bust" : "spr-char");
    const ctx = cv.getContext("2d");
    const R = Rfor(ctx);
    (DRAW[who] || laura)(R, o);
    if (o.prop) drawProp(R, who, o);
    if (o.flip) { cv.style.transform = "scaleX(-1)"; }
    return cv;
  };
  S.portrait = function (who) {
    if (who === "caos") return S.caos(0, true);
    if (who === "narr") {
      const cv = mk(32, 30, "spr-bust"); const R = Rfor(cv.getContext("2d"));
      R(6, 6, 20, 18, "#8a5a33"); R(8, 8, 16, 14, "#fff7e6"); R(15, 8, 2, 14, "#d9c7a5");
      R(10, 11, 4, 1, "#9a8a70"); R(10, 14, 4, 1, "#9a8a70"); R(18, 11, 4, 1, "#9a8a70"); R(18, 14, 4, 1, "#9a8a70");
      return cv;
    }
    return S.char(who, { bust: true });
  };

  // ------------------------------------------------------------- El Caos (64×64)
  S.caos = function (frame, small) {
    const size = small ? 64 : 64;
    const cv = mk(size, size, "spr-caos");
    const ctx = cv.getContext("2d");
    const R = Rfor(ctx);
    const f = frame || 0;
    R(12, 58, 40, 3, "rgba(0,0,0,.25)");
    const cols = ["#f6f2e7", "#e7ddc2", "#c7e3fb", "#ffc1d9", "#fff0a8"];
    for (let i = 0; i < 9; i++) {
      const w = 50 - i * 4.6 | 0, y = 12 + i * 5;
      const off = ((f + i) % 2 ? 2 : -2) * (i % 2 ? 1 : -1);
      const x = 32 - (w >> 1) + off;
      R(x - 1, y, w + 2, 6, INK);
      R(x, y, w, 5, cols[(i + f) % cols.length]);
      for (let k = 2; k < w - 2; k += 6) R(x + k + (i * 3 % 4), y + 1, 3, 1, "#9a8f78");
    }
    // pegatinas / notas en la «cabeza»
    R(16, 4, 10, 10, INK); R(17, 5, 8, 8, "#ffe066"); R(19, 7, 5, 1, "#c9a400"); R(19, 9, 4, 1, "#c9a400");
    R(36, 2, 11, 11, INK); R(37, 3, 9, 9, "#ff9ecb"); R(39, 5, 6, 1, "#c25a85"); R(39, 7, 5, 1, "#c25a85");
    R(26, 0, 10, 8, INK); R(27, 1, 8, 6, "#fff");
    // cara enfadada
    R(18, 20, 10, 8, INK); R(19, 21, 8, 6, "#fff"); R(36, 20, 10, 8, INK); R(37, 21, 8, 6, "#fff");
    const dy = f % 2;
    R(22, 23 + dy, 4, 4, "#d90429"); R(38, 23 + dy, 4, 4, "#d90429");
    R(23, 24 + dy, 2, 2, INK); R(39, 24 + dy, 2, 2, INK);
    for (let i = 0; i < 9; i++) { R(17 + i, 17 + (i >> 1), 2, 2, INK); R(46 - i, 17 + (i >> 1), 2, 2, INK); }
    R(22, 32, 20, 8, INK); R(23, 33, 18, 6, "#6b0f1a");
    for (let i = 0; i < 6; i++) { R(24 + i * 3, 33, 2, 2, "#fff"); R(25 + i * 3, 37, 2, 2, "#fff"); }
    // objetos que orbitan: sobre, calendario, reloj
    const o1 = f % 2 ? 1 : -1;
    R(1, 14 + o1, 13, 9, INK); R(2, 15 + o1, 11, 7, "#fff"); for (let i = 0; i < 5; i++) { R(2 + i, 15 + o1 + i, 1, 1, "#aaa"); R(12 - i, 15 + o1 + i, 1, 1, "#aaa"); }
    R(51, 30 - o1, 12, 13, INK); R(52, 31 - o1, 10, 11, "#fff"); R(52, 31 - o1, 10, 3, "#e5173f"); R(55, 36 - o1, 4, 4, "#333");
    ring(R, 8, 44 + o1, 0, 5, INK); disc(R, 8, 44 + o1, 4, "#fff"); R(8, 41 + o1, 1, 4, INK); R(8, 44 + o1, 3, 1, INK);
    R(48, 8 + o1, 7, 7, INK); R(49, 9 + o1, 5, 5, "#bde0fe");
    return cv;
  };

  // ----------------------------------------------------------------- objetos 16×16
  const ITEMS = {
    pulsador(R) {
      R(1, 14, 14, 1, "#1a1426"); R(2, 11, 12, 3, "#2b2540"); R(3, 10, 10, 1, "#4a4075");
      R(5, 3, 6, 1, "#ff9fb0"); R(4, 4, 8, 1, "#ff4d6d"); R(3, 5, 10, 5, "#e5173f"); R(4, 5, 3, 2, "#ff9fb0"); R(3, 9, 10, 1, "#a30f2d");
      R(0, 2, 2, 1, "#ffd23f"); R(14, 2, 2, 1, "#ffd23f"); R(7, 0, 2, 2, "#ffd23f"); R(1, 6, 1, 2, "#ffd23f"); R(14, 6, 1, 2, "#ffd23f");
    },
    invitacion(R) {
      R(1, 4, 14, 10, INK); R(2, 5, 12, 8, "#fff7e6");
      for (let i = 0; i < 6; i++) { R(2 + i, 5 + i, 1, 1, "#cdbf9d"); R(13 - i, 5 + i, 1, 1, "#cdbf9d"); }
      R(6, 8, 2, 1, "#c1121f"); R(9, 8, 2, 1, "#c1121f"); R(6, 9, 5, 1, "#c1121f"); R(7, 10, 3, 1, "#c1121f"); R(8, 11, 1, 1, "#c1121f");
      R(1, 2, 2, 1, "#ffd23f"); R(13, 1, 2, 2, "#ffd23f");
    },
    microfono(R) {
      R(5, 1, 7, 7, INK); R(6, 2, 5, 5, "#cfd6e4"); R(7, 2, 2, 2, "#fff");
      for (let i = 0; i < 6; i++) { R(6 + i, 3 + (i % 2) * 2, 1, 1, "#8b94a8"); }
      R(7, 8, 3, 2, INK); R(8, 8, 1, 1, "#ffd23f");
      for (let i = 0; i < 6; i++) { R(7 + (i >> 2), 9 + i, 3, 1, INK); R(8 + (i >> 2), 9 + i, 1, 1, "#4a4560"); }
      R(1, 1, 1, 3, "#ffd23f"); R(0, 2, 3, 1, "#ffd23f"); R(14, 4, 1, 3, "#ffd23f"); R(13, 5, 3, 1, "#ffd23f");
    },
    menu(R) {
      R(2, 1, 12, 14, INK); R(3, 2, 10, 12, "#fff7e6"); R(3, 2, 10, 1, "#c1121f");
      R(5, 4, 6, 1, "#8a5a33"); R(4, 6, 8, 1, "#c9b99a"); R(4, 8, 8, 1, "#c9b99a"); R(4, 10, 8, 1, "#c9b99a");
      R(10, 11, 2, 2, "#2f8a4f"); R(11, 10, 1, 1, "#c1121f"); R(5, 12, 3, 1, "#c9b99a");
      R(0, 0, 1, 3, "#ffd23f"); R(14, 12, 2, 1, "#ffd23f");
    },
    alianzas(R) {
      ring(R, 5, 10, 1.7, 5.2, INK); ring(R, 5, 10, 2.5, 4.3, "#ffc933"); R(3, 7, 2, 1, "#fff3b0"); R(2, 9, 1, 2, "#fff3b0");
      ring(R, 10, 6, 1.7, 5.2, INK); ring(R, 10, 6, 2.5, 4.3, "#dfe6f5"); R(8, 3, 2, 1, "#ffffff"); R(7, 5, 1, 2, "#ffffff");
      R(13, 12, 1, 3, "#ffd23f"); R(12, 13, 3, 1, "#ffd23f"); R(1, 1, 1, 3, "#ffd23f"); R(0, 2, 3, 1, "#ffd23f");
    },
  };
  S.itemIds = ["invitacion", "microfono", "menu", "alianzas"];
  S.item = function (idOrIdx, locked) {
    const id = typeof idOrIdx === "number" ? S.itemIds[idOrIdx] : idOrIdx;
    const cv = mk(16, 16, "spr-item");
    const ctx = cv.getContext("2d");
    ITEMS[id](Rfor(ctx));
    if (locked) {
      ctx.globalCompositeOperation = "source-in"; ctx.fillStyle = "#3b3359"; ctx.fillRect(0, 0, 16, 16);
    }
    return cv;
  };

  // ------------------------------------------------------------ fondo de batalla
  S.battleBg = function (cv) {
    cv.width = 160; cv.height = 96;
    const R = Rfor(cv.getContext("2d"));
    const sky = ["#5cb8ee", "#6cc1f1", "#7eccf3", "#92d6f6", "#a8e0f8", "#bde8fa", "#d2f0fc", "#e6f7fd"];
    sky.forEach((c, i) => R(0, i * 8, 160, 8, c));
    [[14, 12, 24], [60, 22, 30], [118, 10, 26], [140, 30, 18]].forEach(([x, y, w]) => { R(x, y, w, 5, "#fff"); R(x + 4, y - 3, w - 10, 4, "#fff"); R(x + 2, y + 5, w - 4, 2, "#e9f4fb"); });
    for (let x = 0; x < 160; x++) R(x, 54 + Math.round(3 * Math.sin(x / 14)), 1, 6, "#7ac78a");
    R(0, 58, 160, 38, "#4fae66");
    // iglesia lejana
    R(96, 41, 38, 16, "#f3e9d7"); R(94, 38, 42, 4, "#b5483a"); R(95, 42, 40, 1, "#d9c9ae");
    R(106, 24, 12, 18, "#f3e9d7"); R(105, 22, 14, 3, "#b5483a");
    for (let i = 0; i < 6; i++) R(106 + i, 18 + i, 12 - i * 2, 1, "#b5483a");
    R(111, 8, 2, 11, "#ffd23f"); R(108, 12, 8, 2, "#ffd23f");
    R(109, 28, 4, 6, "#4a4a5e"); R(110, 29, 2, 4, "#1a1426");
    R(98, 46, 4, 6, "#6aa6d8"); R(126, 46, 4, 6, "#6aa6d8"); R(112, 47, 6, 10, "#7a4a2b"); R(113, 48, 4, 9, "#9a6a3b");
    R(0, 57, 160, 1, "#3f9556");
    // camino en perspectiva
    for (let y = 57; y < 96; y++) {
      const t = (y - 57) / 39;
      const l = 112 - 70 * t | 0, r = 118 + 72 * t | 0;
      R(l, y, r - l, 1, "#e3c89c"); R(l, y, 1, 1, "#b79b6d"); R(r - 1, y, 1, 1, "#b79b6d");
      if ((y * 7) % 11 === 0) R(l + 4 + (y * 3) % (r - l - 8), y, 2, 1, "#cdb084");
    }
    // árboles y flores
    [[12, 50], [30, 56], [146, 52]].forEach(([x, y]) => {
      R(x, y, 3, 12, "#6b4423");
      disc(R, x + 1, y - 3, 7, "#2f8a4f"); disc(R, x - 1, y - 5, 4, "#3ea661"); disc(R, x + 4, y - 2, 4, "#2a7a46");
    });
    for (let i = 0; i < 40; i++) {
      const x = (i * 37) % 160, y = 62 + (i * 17) % 32;
      const road = x > 112 - 70 * ((y - 57) / 39) && x < 118 + 72 * ((y - 57) / 39);
      if (!road) R(x, y, 1, 1, ["#ff7aa8", "#ffe066", "#fff", "#c77dff"][i % 4]);
    }
  };

  // ----------------------------------------------------------- iconos de categoría (SVG)
  S.catIcon = function (cat) {
    const p = {
      geo: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" fill="none" stroke="currentColor" stroke-width="2"/>',
      his: '<path d="M4 20h16M6 20V9M10 20V9M14 20V9M18 20V9M3 9l9-6 9 6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      cie: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 15h8" stroke="currentColor" stroke-width="2"/>',
      arte: '<path d="M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 5h-7v13a2 2 0 0 1 2-2h5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
      dep: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7l4 3-1.5 5h-5L8 10zM12 3v4M16 10l5-1M14.5 15l3 4M9.5 15l-3 4M8 10 3 9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
      ent: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
    }[cat] || "";
    return '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">' + p + "</svg>";
  };
})();
