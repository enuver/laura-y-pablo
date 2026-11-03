/* ==========================================================================
   QUEDA UN MES · content.js
   --------------------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS TOCAR PARA CAMBIAR TEXTOS,
   PREGUNTAS Y DIFICULTAD. No hace falta saber programar:

   · Los textos van entre comillas "así". Si quieres escribir unas comillas
     dentro del texto, usa las españolas «así» y no habrá problema.
   · NO borres las comas ni las llaves { } [ ] que ves al final de las líneas.
   · Todo lo marcado con  TODO  es un EJEMPLO que debes revisar o reescribir.
   · Todo lo marcado con  REVISAR  es una respuesta de trivial que no he
     podido comprobar al 100 %: míralo antes de dar el juego.
   · Después de editar, guarda el archivo y recarga la página del juego.

   En algunos textos puedes usar estas etiquetas, que el juego sustituye solo:
      {apodo}   →  el apodo de Pablo (Requena)
      {faltan}  →  «Faltan 30 días», calculado con la fecha real de la boda
   ========================================================================== */

globalThis.CONTENT = {

/* ---------------------------------------------------------------- GENERAL */
GAME: {
  TITLE: "Queda un mes",
  SUBTITLE: "Un regalo de boda para Laura y Pablo",
  PLAY: "Jugar",
  CONTINUE: "Continuar",
  NEW_GAME: "Empezar de nuevo",
  // Aparece en la pantalla de título bajo el botón. Se calcula solo.
  COUNTDOWN_LINE: "{faltan} para la boda",
},

NAMES: {
  laura: "Laura",
  pablo: "Pablo",
  leire: "Leire",
  host: "Tito Destello",      // presentador inventado del concurso
  caos: "El Caos",
  narr: "",
},

// Apodo con el que Laura llama a Pablo.
NICKNAME_PABLO: "Requena",

/* ---------------------------------------------------------- DATOS DE BODA */
WEDDING: {
  // Fecha y hora REAL de la boda. Hora de España en diciembre = +01:00.
  // (Si algún día cambiara a horario de verano sería +02:00.)
  DATE_ISO: "2026-12-05T12:00:00+01:00",
  CEREMONY: "Parroquia de San José Obrero, Castellón",
  PARTY: "Convite en la Huerta de Peñalén",
  // Se muestra cuando ya ha llegado la fecha:
  AFTER_TITLE: "¡Enhorabuena, Laura y Pablo!",
  AFTER_TEXT: "Hoy el mapa entero se ha puesto a todo color. Que seáis muy felices, que no os falte el humor, los colores ni el «...» en el momento justo.",
  // Mensaje intermedio el mismo día de la boda, antes de la hora:
  TODAY_TEXT: "¡Es hoy! Respirad hondo, Laura (y habla un poco menos, que hay que guardar voz para el «sí, quiero»).",
},

/* -------------------------------------------------------------- DEDICATORIA */
DEDICATION: {
  // TODO: reescríbela a vuestro gusto. Es el texto que sale en la escena final.
  TEXT: "Laura y Pablo: dos personas que no se parecen en nada y que, justo por eso, encajan como piezas de un puzle. Una lo cuenta todo; el otro lo dice con un «...». Una ve el mundo en mil colores; el otro lo ve en tres, pero bien elegidos. Opuestos que se complementan: eso sois. Que os sobren las risas, los juegos de mesa y los días de boda.",
  SIGNATURE: "Con muchísimo cariño, vuestros amigos",   // TODO: firma
},

/* ---------------------------------------------------------------- OBJETOS */
ITEMS: [
  { id: "pulsador",   name: "El Pulsador del concurso", desc: "Clic, clic… ¡y a por la respuesta!" },
  { id: "batuta",     name: "La Batuta de Laura",       desc: "Con ella, hasta el caos suena afinado." },
  { id: "invitacion", name: "La Invitación al convite", desc: "Sin ella no se entra al banquete." },
  { id: "alianzas",   name: "Las Alianzas",             desc: "Dos aros, una promesa. Ya sí: no falta nada." },
],

/* ------------------------------------------------------------- ETIQUETAS UI */
UI: {
  MUTE_ON: "Sonido: sí",
  MUTE_OFF: "Sonido: no",
  SKIP: "Saltar",
  NEXT: "Siguiente",
  MENU: "Menú",
  BACK_TO_MAP: "Volver al mapa",
  MAP_HINT: "Toca la prueba señalada para continuar.",
  LOCKED: "Bloqueada",
  DONE: "Superada",
  RESTART_CONFIRM: "¿Seguro que quieres empezar de nuevo? Se borrará el progreso.",
  YES: "Sí",
  NO: "No",
  RETRY: "Reintentar",
  HELP_BTN: "Activar ayuda y reintentar",
  SKIP_BTN: "Continuar sin superarla",
  FAIL_TITLES: ["¡Casi!", "¡Uy, por poco!", "¡Otra vez!", "¡Que no decaiga!"],
  FAIL_TEXTS: [
    "Todo el mundo tropieza. Hasta Laura (sobre todo Laura).",
    "Respira hondo y vuelve a intentarlo.",
    "La práctica hace al maestro… y a la maestra.",
  ],
  HELP_OFFER: "Parece que esta prueba se resiste. Puedes activar una ayuda (la prueba será más fácil) o seguir adelante sin superarla: el objeto es vuestro igualmente.",
  PLAY_AGAIN: "Volver a jugar",
},

/* ------------------------------------------------------------------ DIÁLOGOS
   Cada línea es  ["quién", "texto"].  Quién puede ser:
   laura, pablo, leire, host (presentador), caos, narr (narrador).
   Laura suelta parrafadas; Pablo contesta con casi nada. */
DIALOGS: {

  intro: [
    ["narr",  "Queda un mes para la boda de Laura y Pablo. Y, como en toda boda que se precie, falta justo lo más importante."],
    ["laura", "¡{apodo}! ¡{apodo}, mírame! Que he hecho la lista, y he repasado la lista, y luego he repasado la lista de la lista, y resulta que faltan cuatro cosas: el pulsador, mi batuta, la invitación al convite y… ¡las alianzas! ¡Las alianzas, Pablo! Que las tenía en la mano hace un momento y ahora no sé si las he guardado en el bolso, en el otro bolso o en el microondas. No me mires así. ¿Por qué me miras así? ¿Estoy hablando mucho? Dime algo."],
    ["pablo", "..."],
    ["laura", "Eso es un «vamos a por ellas», ¿verdad?"],
    ["pablo", "...Sí."],
    ["narr",  "Pablo sale de Albal. Laura sale de Castellón. Sus caminos se juntarán en la primera prueba. ¡{faltan} y contando!"],
  ],

  t1_intro: [
    ["narr",  "Plató de televisión. Focos, un marcador y un ficus que hace de público."],
    ["host",  "¡Bienvenidos, bienvenidos, bienvenidos! Hoy tenemos el plató a reventar: tres focos, un ficus y vosotros dos."],
    ["host",  "Me cuentan que Laura ya ha pisado más de un concurso, así que los nervios del pulsador no tendrán secretos para ella. ¿Y Pablo? ¿Pablo?"],
    ["pablo", "..."],
    ["host",  "Perfecto: hombre de pocas palabras. Reglas: seis categorías, una medalla por categoría, dos aciertos por medalla. Con cinco fallos se apagan los focos. ¡Y el premio es el Pulsador que os falta!"],
    ["laura", "¡Yo me sé todas! Bueno, todas no, pero sé las que sé y las que no sé las sé a medias, que es casi saberlas, y además tengo experiencia, que lo ha dicho él, y ¡{apodo} sabe un montón de cosas aunque no las diga!"],
    ["pablo", "...Vamos."],
  ],
  t1_win: [
    ["host",  "¡Seis medallas! ¡Aplausos enlatados, por favor!"],
    ["laura", "¡Lo hemos conseguido! ¡Pablo, has estado ahí, con tu cara de póker, aportando serenidad mientras yo gritaba las respuestas antes de que acabara la pregunta!"],
    ["pablo", "...Gracias."],
    ["host",  "Aquí tenéis vuestro premio: el Pulsador del concurso. Úsalo con responsabilidad."],
  ],

  t2_intro: [
    ["narr",  "Ensayo del coro Betsaida. Sobre el atril, entre partituras, brilla la Batuta de Laura."],
    ["laura", "¡Atención, atención! Aquí es donde yo reino. Cuatro voces: soprano, contralto, tenor y bajo. Yo canto una secuencia, vosotros la repetís, y cada vez más rápido, que el que no corre… ¡desafina! Respirad, relajad los hombros, abrid la boca como si fuerais a decir «a»… ¡Pablo! ¿Alguna duda?"],
    ["pablo", "..."],
    ["laura", "Perfecto, ninguna duda."],
  ],
  t2_win: [
    ["laura", "¡Afinadísimos! ¡Esto va directo al repertorio! Pablo, dime que ha sido precioso."],
    ["pablo", "...Bonito."],
    ["laura", "¿«Bonito»? ¡Ha sido sublime!"],
    ["pablo", "...Sublime."],
    ["narr",  "Laura recupera su Batuta. Estaba bajo la partitura, claro."],
  ],

  t3_intro: [
    ["narr",  "La Huerta de Peñalén, donde será el convite, está patas arriba: anillos, tartas, copas, ramos, naranjas y corazones, todo revuelto."],
    ["laura", "¡Pero si esto parece un mercadillo con prisa! Hay que agrupar: tres iguales y ¡pum!, desaparecen. ¡Match, match, match!"],
    ["pablo", "...Match."],
    ["laura", "¡Qué bonito oírtelo decir!"],
    ["pablo", "...Ya."],
  ],
  t3_win: [
    ["laura", "¡La Invitación al convite! ¡Y el banquete está a punto! ¿Has visto cómo brillaba todo? ¡Y las naranjas! ¡Y la tarta! ¡Y esa cascada de siete combos que no ha visto nadie salvo yo!"],
    ["pablo", "...Yo sabía que estaba debajo de la tarta."],
  ],

  t4_intro: [
    ["narr",  "Último tramo: el camino hacia la parroquia de San José Obrero. Pero una montaña de listas, hojas de cálculo, mensajes de grupo y un reloj enfadado corta el paso."],
    ["caos",  "¡SOY EL CAOS DE LOS PREPARATIVOS! ¡CAMBIO DE ÚLTIMA HORA: AHORA LA BODA ES EN UN BARCO!"],
    ["laura", "¡No! ¡Un barco no! ¡Que me mareo hasta en el ascensor! ¡Pablo, di algo, haz algo, mira qué cara!"],
    ["pablo", "...Podría ser peor."],
    ["laura", "¿Peor cómo?"],
    ["pablo", "...Un barco sin cuñados."],
    ["narr",  "Combate cooperativo. Una persona lleva a Laura y la otra a Pablo. Mirad siempre qué ataque prepara el Caos y coordinaos."],
  ],
  t4_win: [
    ["caos",  "Nooo… mi lista… mis hojas de cálculo…"],
    ["pablo", "...Descanse en paz."],
    ["laura", "¡Pablo! ¡Qué oscuro! ¡Qué oscuro y qué bien dicho!"],
    ["pablo", "...Ya."],
    ["narr",  "Entre los papeles aparece, brillando, un estuche pequeño: las Alianzas. Ya no falta nada."],
  ],

  // Cuando se elige «Continuar sin superarla».
  skip: [
    ["narr",  "A veces el camino se allana solo. El objeto aparece, como por arte de magia, justo donde hacía falta. ¡Adelante, que queda poco!"],
    ["laura", "¿Esto cuenta? ¡Pues claro que cuenta! ¡Pablo, di que cuenta!"],
    ["pablo", "...Cuenta."],
  ],

  // Diálogo de Leire cuando se la llama en la batalla (una vez).
  leire_call: [
    ["leire", "¡Laura! ¿Se puede saber por qué me has llamado doce veces? ...¡Ah, que estáis peleando contra el Caos! ¡Venga, que os curo!"],
  ],

  final_intro: [
    ["narr",  "Cuatro pruebas. Cuatro objetos. Un mapa que ya tiene todos sus colores."],
    ["laura", "¡Lo tenemos todo! Pulsador, batuta, invitación, alianzas… ¡todo! ¡Y todavía {faltan}! ¡Pablo, vamos sobradísimos!"],
    ["pablo", "...Ya veremos."],
    ["laura", "¡Eso es optimismo, {apodo}!"],
  ],
},

/* ------------------------------------------------------------------ PRUEBAS */
TRIALS: [
  { id: "trivia", number: 1, name: "El concurso",              place: "Plató de televisión",          from: "intro",  intro: "t1_intro", win: "t1_win" },
  { id: "choir",  number: 2, name: "Ensayo del coro Betsaida", place: "Teatro del coro",              intro: "t2_intro", win: "t2_win" },
  { id: "match3", number: 3, name: "Huerta de Peñalén",        place: "Preparando el convite",        intro: "t3_intro", win: "t3_win" },
  { id: "battle", number: 4, name: "Camino a San José Obrero", place: "El último tramo",              intro: "t4_intro", win: "t4_win" },
],

/* ========================================================================
   EQUILIBRIO DE DIFICULTAD
   Si algo os parece muy fácil o muy difícil, cambiad estos números.
   ======================================================================== */
BALANCE: {

  // Tras cuántos intentos fallidos en una prueba se ofrece ayuda / continuar.
  HELP_AFTER_FAILS: 3,

  TRIVIA: {
    CORRECT_PER_MEDAL: 2,     // aciertos necesarios en cada categoría
    MAX_STRIKES: 5,           // fallos permitidos antes de que se apaguen los focos
    SECONDS_PER_QUESTION: 25, // tiempo por pregunta
    LIFELINES: 1,             // comodines «50 %» por intento
    HELP: { MAX_STRIKES: 8, SECONDS_PER_QUESTION: 40, LIFELINES: 4 },
  },

  CHOIR: {
    TARGET_LENGTH: 12,        // longitud de la secuencia a superar
    START_MS: 720,            // velocidad inicial (ms por nota)
    MIN_MS: 300,              // velocidad máxima
    SPEEDUP_MS: 38,           // lo que se acelera en cada ronda
    HELP: { TARGET_LENGTH: 8, START_MS: 850, MIN_MS: 480, SPEEDUP_MS: 25 },
  },

  MATCH3: {
    MOVES: 20,                // movimientos disponibles
    GOAL: 4400,               // puntos necesarios
    POINTS_PER_TILE: 20,      // puntos por ficha (se multiplica en cascada)
    SPECIAL_BONUS: 60,        // extra al activar una ficha especial
    HELP: { EXTRA_MOVES: 6, GOAL_FACTOR: 0.8 },
  },

  BATTLE: {
    LAURA_HP: 100,
    PABLO_HP: 110,
    ENEMY_HP: 470,

    // ---- Torpeza de Laura (el valor que pedías poder tocar) ----
    CLUMSY_CHANCE: 0.22,        // 0.22 = 22 % de que un ataque suyo salga mal
    CLUMSY_BASIC_FACTOR: 0.6,   // el ataque básico sale mal menos veces
    CLUMSY_MAX_STREAK: 2,       // tras 2 fallos seguidos, el siguiente sale bien (para que no sea injusto)
    CLUMSY_SELF_DAMAGE: 12,     // daño que se hace a sí misma
    CLUMSY_PABLO_DAMAGE: 10,    // daño que le hace a Pablo

    // ---- Comodín de Leire ----
    LEIRE_HEAL: 40,             // vida que cura a CADA uno (también reanima a quien esté KO)
    LEIRE_USES_TURN: false,     // false = es una acción libre; true = gasta el turno

    // ---- Dúo ----
    DUO_CHARGE_NEEDED: 5,       // puntos de «sintonía» para tener el Dúo
    DUO_DAMAGE: 62,             // daño base del Dúo
    DUO_BUFF_BONUS: 0.25,       // +25 % por cada mejora activa (coordinarse se premia)
    DUO_COMPLEMENT_BONUS: 1,    // sintonía extra si alternan ataque y apoyo

    // ---- Habilidades de Laura ----
    L_BASIC:  { dmg: 14 },                       // «Parrafada»
    L_DO:     { dmg: 42, cooldown: 2 },          // «Do de pecho»
    L_LESSON: { dmg: 24, cooldown: 3, stun: 0.5 },// «Dar una lección» (50 % de aturdir)
    L_CROMOS: { cooldown: 3, mult: 1.5 },        // «Cromos de santos»

    // ---- Habilidades de Pablo ----
    P_BASIC:    { dmg: 13 },                     // «Golpe seco»
    P_SILENCE:  { cooldown: 3, turns: 2, factor: 0.5 },  // «Silencio»
    P_ANALYSIS: { cooldown: 3, turns: 2, bonus: 0.5 },   // «Análisis del partido»
    P_GUARD:    { cooldown: 3, factor: 0.35 },   // «Defensa cerrada»

    // ---- Ataques del Caos ----
    ENEMY_VARIANCE: 0.1,        // ±10 % de variación del daño
    PHASE2_AT: 0.5,             // a partir de este % de vida entra en fase 2
    PHASE2_BONUS: 0.2,          // +20 % de daño en fase 2
    ATTACKS: [
      { id: "cambio",     name: "Cambio de última hora",      dmg: 31, target: "one",  weight: 3, effect: "cooldown" },
      { id: "lista",      name: "Lista de invitados infinita", dmg: 20, target: "both", weight: 3 },
      { id: "presupuesto",name: "Presupuesto que no cuadra",  dmg: 26, target: "one",  weight: 3, effect: "duo" },
      { id: "cunados",    name: "Opiniones de los cuñados",   dmg: 38, target: "one",  weight: 2, heavy: true },
      { id: "todo",       name: "Todo a la vez",              dmg: 34, target: "both", weight: 2, heavy: true, phase2: true },
    ],

    // ---- Ayuda tras varios fallos ----
    HELP: { HERO_HP_FACTOR: 1.3, ENEMY_HP_FACTOR: 0.8, CLUMSY_FACTOR: 0.5 },
  },
},

/* ====================================================================
   TEXTOS DE LOS MINIJUEGOS
   ==================================================================== */
TEXT: {

  TRIVIA: {
    CATEGORIES: {
      geo:   "Geografía",
      his:   "Historia",
      cie:   "Ciencia",
      arte:  "Arte y Literatura",
      dep:   "Deportes",
      ent:   "Entretenimiento",
    },
    PICK: "Elegid categoría",
    LIFELINE: "Comodín 50 %",
    STRIKES: "Fallos",
    RIGHT: ["¡Correcto!", "¡Eso es!", "¡Acierto!", "¡Bien jugado!"],
    WRONG: ["¡Ouch!", "Nooo…", "Casi…", "Esa no era."],
    TIMEOUT: "¡Se acabó el tiempo!",
    MEDAL: "¡Medalla de {cat}!",
    HOST_RIGHT: [
      "¡Eso es! El ficus aplaude (si tuviera manos).",
      "¡Correcto! Los focos se ponen morados de envidia.",
      "¡Bien! Esa la sabía hasta el regidor.",
      "¡Sí señor, sí señora! Siguiente.",
    ],
    HOST_WRONG: [
      "Uy, qué pena. Los nervios del directo, ya se sabe.",
      "Casi, casi. Bueno, no tanto, pero vamos con ánimo.",
      "¡Fallo! Suena el zumbido más triste del plató.",
      "Esa no. Pero qué bien habéis fallado, oye.",
    ],
    // Comentarios sobre la experiencia de Laura (sin inventar detalles concretos):
    HOST_LAURA: [
      "Laura, con tu experiencia en concursos, ¡esto lo llevas en la sangre!",
      "Se nota que Laura ya ha pisado un plató: ni un parpadeo.",
      "Cuando Laura pone cara de concursante veterana, hasta los focos se enderezan.",
    ],
    HOST_PABLO: [
      "Pablo asiente. Eso, en Pablo, es un monólogo de tres horas.",
      "Pablo no dice nada. Pablo lo dice todo.",
    ],
    LOSE: "¡Se han apagado los focos!",
    WIN: "¡Seis medallas!",
  },

  CHOIR: {
    VOICES: ["Soprano", "Contralto", "Tenor", "Bajo"],
    LISTEN: "Escuchad…",
    REPEAT: "¡Ahora vosotros!",
    ROUND: "Ronda",
    GOAL: "Meta",
    WIN: "¡Afinadísimos!",
    LOSE: "Desafinó un poquito…",
    RIGHT: "¡Bien!",
    HINT: "Repite la secuencia tocando las voces en el mismo orden.",
  },

  MATCH3: {
    MOVES: "Movimientos",
    SCORE: "Puntos",
    GOAL: "Objetivo",
    SHUFFLE: "¡Sin movimientos! Barajando el tablero…",
    COMBO: ["¡Dulce!", "¡Delicioso!", "¡Espectacular!", "¡Banquete real!", "¡Match de boda!"],
    WIN: "¡Convite preparado!",
    LOSE: "Se acabaron los movimientos…",
    HINT: "Intercambia dos fichas contiguas para juntar tres o más iguales.",
    TILES: ["Anillo", "Tarta", "Copa", "Ramo", "Naranja", "Corazón"],
  },

  BATTLE: {
    ENEMY_NAME: "El Caos de los Preparativos",
    TURN_OF: "Turno de {who}",
    ENEMY_PREPARES: "El Caos prepara:",
    TARGET: "Apunta a {who}",
    TARGET_BOTH: "Apunta a los dos",
    HEAVY: "¡Ataque fuerte!",
    DUO_METER: "Sintonía",
    LEIRE_BTN: "Llamar a Leire",
    LEIRE_USED: "Ya vino",
    COOLDOWN: "Espera {n}",
    STUNNED: "El Caos está aturdido y pierde su turno.",
    KO: "{who} está fuera de combate.",
    VICTORY: "¡Victoria!",
    DEFEAT: "El Caos ha ganado… por ahora.",
    WEAK_SPOT: "Punto débil",

    SKILL_NAMES: {
      l_basic: "Parrafada", l_do: "Do de pecho", l_lesson: "Dar una lección", l_cromos: "Cromos de santos",
      p_basic: "Golpe seco", p_silence: "Silencio", p_analysis: "Análisis del partido", p_guard: "Defensa cerrada",
      duo: "Dúo",
    },
    SKILL_DESC: {
      l_basic: "Daño pequeño, siempre disponible.",
      l_do: "Daño alto. ¡A pleno pulmón!",
      l_lesson: "Daño medio. Puede aturdir al Caos.",
      l_cromos: "Mejora la siguiente acción del equipo.",
      p_basic: "Daño pequeño, siempre disponible.",
      p_silence: "Reduce el daño del Caos 2 turnos.",
      p_analysis: "Revela su punto débil: recibe más daño.",
      p_guard: "Protege a los dos del próximo ataque.",
      duo: "Ataque combinado. Más fuerte con mejoras activas.",
      leire: "Cura a los dos. Una vez por batalla.",
    },

    LAURA_ACT: {
      l_basic:  ["Laura suelta una parrafada de cuarenta segundos sin respirar."],
      l_do:     ["¡Laura coge aire y suelta un DO DE PECHO que hace vibrar las vidrieras!"],
      l_lesson: ["Laura se pone en jarras y da una lección que no se olvidará en la vida."],
      l_cromos: ["Laura reparte cromos de santos a diestro y siniestro. ¡Se nota la bendición!"],
    },
    PABLO_ACT: {
      p_basic:    ["Pablo golpea seco. Sin una palabra."],
      p_silence:  ["Pablo mira fijamente al Caos. «...» El Caos se calla de golpe."],
      p_analysis: ["Pablo se ajusta las gafas y analiza el partido. ¡Punto débil descubierto!"],
      p_guard:    ["Pablo cierra la defensa y se pone delante de Laura. Y de sí mismo, también."],
    },
    DUO_ACT: [
      "¡DÚO! Laura canta y Pablo marca el compás con una ceja. ¡Opuestos que se complementan!",
    ],
    DUO_ACT_PABLO: [
      "...",
    ],

    // Cuando a Laura le sale mal (torpeza). {self} = a sí misma, {pablo} = a Pablo
    CLUMSY_SELF: [
      "¡Laura se tropieza con su propio cordón y se da en el codo!",
      "¡Laura se pone a cantar tan fuerte que se marea ella sola!",
      "¡Laura da un paso atrás, pisa un cromo y resbala!",
      "¡Laura se lía con las lecciones y se las da a sí misma!",
    ],
    CLUMSY_PABLO: [
      "¡Laura gesticula tanto que le da un manotazo a Pablo! «...Au.»",
      "¡Ups! Laura se confunde de blanco y le da a Pablo. «...Normal.»",
      "¡Laura lanza la parrafada hacia atrás y se la come Pablo!",
    ],
    PABLO_AFTER_CLUMSY: ["...", "...Au.", "...Normal.", "...Lo esperaba."],

    // Ataques del Caos
    ENEMY_ACT: {
      cambio:      "«¡CAMBIO DE ÚLTIMA HORA!» ¡El Caos lo cambia todo cuando ya estaba todo hecho!",
      lista:       "«¡LISTA DE INVITADOS INFINITA!» ¡Nombres y más nombres caen sobre los dos!",
      presupuesto: "«¡PRESUPUESTO QUE NO CUADRA!» ¡Los números bailan y hacen daño!",
      cunados:     "«¡OPINIONES DE LOS CUÑADOS!» ¡Todos hablan a la vez y ninguno ayuda!",
      todo:        "«¡TODO A LA VEZ!» ¡Proveedores, flores, música y menú, todo en el mismo minuto!",
    },
    ENEMY_EFFECT: {
      cooldown: "¡Las habilidades de {who} tardan un turno más!",
      duo: "¡La sintonía del equipo baja!",
    },

    PABLO_QUIPS: [
      "...Esto me recuerda a un funeral. Pero con más invitados.",
      "...He visto películas de terror con menos horror.",
      "...Nadie sobrevive a una mudanza.",
      "...Siempre quise ver cómo se acaba el mundo. Con catering.",
    ],
    LAURA_QUIPS: [
      "¡Vamos, Pablo, que esto se gana con coordinación y buen rollo!",
      "¡Que no cunda el pánico! ¡Ay, que ya ha cundido!",
      "¡Yo creo que lo tenemos! ¿Tú qué crees? ¿Qué crees? ¡Dime algo!",
    ],
    LEIRE_HEAL_MSG: "¡Leire cura a Laura y a Pablo!",
  },

  FINAL: {
    TITLE: "¡Tenemos todo!",
    DATA_TITLE: "La boda",
    COUNTDOWN_TITLE: "Cuenta atrás",
    DAYS: "días", HOURS: "horas", MINUTES: "min", SECONDS: "seg",
    MORAL: "Opuestos que se complementan.",
  },
},

/* ====================================================================
   PREGUNTAS DEL TRIVIAL
   --------------------------------------------------------------------
   Formato de cada pregunta:
     ["Pregunta", "RESPUESTA CORRECTA", "incorrecta 1", "incorrecta 2", "incorrecta 3"],
   La respuesta correcta se escribe SIEMPRE la primera: el juego baraja
   las cuatro opciones al enseñarlas. Puedes añadir todas las preguntas que
   quieras (¡sin olvidar la coma al final de cada línea!).
   Marcas:  ✔ = comprobada en fuentes de la web.   REVISAR = tiene algún matiz.
            Sin marca = dato muy conocido que NO he podido contrastar online uno a
            uno: si alguna os genera dudas, cambiadla o borradla.
   ==================================================================== */
TRIVIA_QUESTIONS: {

  geo: [
    ["¿Cuál es la capital de Australia?", "Canberra", "Sídney", "Melbourne", "Perth"],
    ["¿Qué río atraviesa la ciudad de Budapest?", "El Danubio", "El Vístula", "El Elba", "El Moldava"],
    ["¿En qué país se encuentra la mayor parte del desierto de Atacama?", "Chile", "Perú", "Argentina", "Bolivia"],  // ✔ comprobada en la web
    ["¿Cuál es el lago más profundo del mundo?", "El Baikal", "El Tanganica", "El Victoria", "El Superior"],  // ✔ comprobada en la web
    ["¿Cuál es el río más largo de la península ibérica?", "El Tajo", "El Ebro", "El Duero", "El Guadalquivir"],  // REVISAR: el Tajo es el más largo de la península (≈1.007 km); el Ebro es el más largo que discurre solo por España. Si te genera dudas, quita la pregunta.
    ["¿Cuál es la capital de Canadá?", "Ottawa", "Toronto", "Montreal", "Vancouver"],
    ["¿Cuál es el país más pequeño del mundo por superficie?", "El Vaticano", "Mónaco", "San Marino", "Liechtenstein"],
    ["¿Cuál es la montaña más alta de África?", "El Kilimanjaro", "El monte Kenia", "El Toubkal", "El Ruwenzori"],
    ["¿Cuál es la capital de Turquía?", "Ankara", "Estambul", "Esmirna", "Antalya"],
    ["¿Qué estrecho separa Asia de América del Norte?", "El de Bering", "El de Gibraltar", "El de Magallanes", "El de Ormuz"],
    ["¿Cuál es la isla más grande del mundo, sin contar los continentes?", "Groenlandia", "Borneo", "Madagascar", "Nueva Guinea"],
  ],

  his: [
    ["¿En qué año cayó el Muro de Berlín?", "1989", "1991", "1987", "1985"],
    ["¿Qué civilización construyó la ciudadela de Machu Picchu?", "La inca", "La maya", "La azteca", "La olmeca"],
    ["¿Quién fue el primer emperador de Roma?", "Augusto", "Julio César", "Nerón", "Trajano"],
    ["¿A qué monasterio extremeño se retiró Carlos I de España tras abdicar?", "Yuste", "El Escorial", "Poblet", "Guadalupe"],  // ✔ comprobada en la web
    ["¿En qué año comenzó la Revolución Francesa?", "1789", "1776", "1804", "1815"],
    ["¿Qué tratado de 1919 impuso duras condiciones a Alemania tras la Primera Guerra Mundial?", "El de Versalles", "El de Utrecht", "El de Tordesillas", "El de Westfalia"],
    ["¿De qué faraón era la tumba que Howard Carter descubrió casi intacta en 1922?", "Tutankamón", "Ramsés II", "Keops", "Akenatón"],
    ["¿En qué año se proclamó la Segunda República Española?", "1931", "1936", "1923", "1939"],
    ["¿Qué general cartaginés cruzó los Alpes con elefantes para atacar a Roma?", "Aníbal", "Amílcar", "Asdrúbal", "Pirro"],
    ["¿En qué año tuvo lugar la batalla naval de Lepanto?", "1571", "1492", "1588", "1640"],
    ["¿Qué imperio tuvo su capital en Tenochtitlan?", "El azteca", "El inca", "El maya", "El otomano"],
  ],

  cie: [
    ["¿Cuál es el símbolo químico del sodio?", "Na", "So", "Sd", "S"],
    ["¿Cuántos huesos tiene el esqueleto de un ser humano adulto?", "206", "186", "212", "256"],
    ["¿Qué gas es el más abundante en la atmósfera terrestre?", "El nitrógeno", "El oxígeno", "El dióxido de carbono", "El argón"],
    ["¿Qué orgánulo de la célula produce la mayor parte de su energía (ATP)?", "La mitocondria", "El ribosoma", "El núcleo", "El lisosoma"],
    ["¿Quién ordenó los elementos químicos en su tabla periódica de 1869?", "Mendeléyev", "Lavoisier", "Dalton", "Bohr"],
    ["¿Cuál es el elemento más abundante en la corteza terrestre?", "El oxígeno", "El silicio", "El hierro", "El aluminio"],
    ["¿Qué vitamina sintetiza nuestra piel con la luz del sol?", "La vitamina D", "La vitamina C", "La vitamina A", "La vitamina B12"],
    ["¿A qué velocidad viaja la luz en el vacío, aproximadamente?", "300.000 km/s", "30.000 km/s", "3.000.000 km/s", "150.000 km/s"],
    ["¿Cuál es el hueso más largo del cuerpo humano?", "El fémur", "La tibia", "El húmero", "El peroné"],
    ["¿A cuántos grados Fahrenheit hierve el agua a nivel del mar?", "212 °F", "100 °F", "180 °F", "273 °F"],
    ["¿Cuál es la unidad de fuerza en el Sistema Internacional?", "El newton", "El julio", "El pascal", "El vatio"],
  ],

  arte: [
    ["¿Quién escribió «Cien años de soledad»?", "Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar", "Jorge Luis Borges"],
    ["¿Quién pintó «Las meninas»?", "Velázquez", "Goya", "El Greco", "Murillo"],
    ["¿Quién escribió «La sombra del viento»?", "Carlos Ruiz Zafón", "Arturo Pérez-Reverte", "Javier Marías", "Eduardo Mendoza"],
    ["¿Quién pintó «La persistencia de la memoria», el cuadro de los relojes blandos?", "Salvador Dalí", "Joan Miró", "René Magritte", "Pablo Picasso"],
    ["¿Quién compuso «Las cuatro estaciones»?", "Vivaldi", "Bach", "Mozart", "Haendel"],
    ["¿Quién es el autor de las «Rimas y leyendas»?", "Gustavo Adolfo Bécquer", "Antonio Machado", "Rosalía de Castro", "Federico García Lorca"],
    ["¿Quién escribió «La casa de Bernarda Alba»?", "Federico García Lorca", "Miguel Hernández", "Rafael Alberti", "Antonio Buero Vallejo"],
    ["¿En qué siglo se publicó la primera parte de «Don Quijote de la Mancha»?", "En el XVII", "En el XVI", "En el XVIII", "En el XV"],
    ["¿Quién escribió la novela «1984»?", "George Orwell", "Aldous Huxley", "Ray Bradbury", "H. G. Wells"],
    ["¿Quién compuso la ópera «La flauta mágica»?", "Mozart", "Verdi", "Wagner", "Rossini"],
    ["¿Quién escribió «Crimen y castigo»?", "Dostoievski", "Tolstói", "Chéjov", "Gógol"],
  ],

  dep: [
    ["¿En qué deporte se usa el término «birdie»?", "Golf", "Tenis", "Béisbol", "Críquet"],
    ["¿Cuántos kilómetros mide un maratón oficial?", "42,195", "40", "45,5", "38,4"],
    ["¿Qué selección ganó el primer Mundial de fútbol, en 1930?", "Uruguay", "Argentina", "Brasil", "Italia"],
    ["¿Qué ciudad organizó los Juegos Olímpicos de verano de 1992?", "Barcelona", "Atlanta", "Seúl", "Sídney"],
    ["¿Qué apodo recibe el trofeo de la Copa Davis?", "La ensaladera", "La bandeja", "El cubo", "La fuente"],  // ✔ comprobada en la web
    ["¿Cuántos sets hay que ganar para llevarse un partido masculino de un Grand Slam?", "Tres", "Dos", "Cuatro", "Cinco"],  // ✔ comprobada en la web
    ["¿Qué país ha ganado más Mundiales de fútbol masculino?", "Brasil", "Alemania", "Italia", "Argentina"],  // REVISAR: Brasil (5). Comprobado hasta el Mundial de 2026; no cambiará, pero míralo si lo abres más adelante.
    ["¿Cuántos jugadores de cada equipo hay en la pista en un partido de voleibol?", "Seis", "Cinco", "Siete", "Ocho"],
    ["¿Qué ciclista español ganó cinco Tours de Francia seguidos entre 1991 y 1995?", "Miguel Induráin", "Pedro Delgado", "Alberto Contador", "Carlos Sastre"],  // ✔ comprobada en la web
    ["¿Qué país organizó el Mundial de fútbol de 1982?", "España", "México", "Argentina", "Italia"],
    ["¿Cuántos puntos vale un ensayo en el rugby union?", "Cinco", "Tres", "Seis", "Siete"],
  ],

  ent: [
    ["¿Quién dirigió «Pulp Fiction»?", "Quentin Tarantino", "Martin Scorsese", "David Fincher", "Guy Ritchie"],
    ["¿Cuántos premios Óscar ganó «El Señor de los Anillos: El retorno del rey»?", "Once", "Siete", "Nueve", "Cinco"],  // ✔ comprobada en la web
    ["¿En qué ciudad nació el grupo The Beatles?", "Liverpool", "Londres", "Manchester", "Birmingham"],
    ["¿Cómo se llama el protagonista de la serie «Breaking Bad»?", "Walter White", "Jesse Pinkman", "Saul Goodman", "Gus Fring"],
    ["En «Final Fantasy VII», ¿cómo se llama el protagonista de pelo rubio y espada gigante?", "Cloud", "Sephiroth", "Squall", "Zidane"],
    ["¿Quién fue el cantante principal de Queen?", "Freddie Mercury", "Brian May", "Roger Daltrey", "David Bowie"],
    ["¿Quién dirigió «Mar adentro», Óscar a la mejor película de habla no inglesa?", "Alejandro Amenábar", "Pedro Almodóvar", "Guillermo del Toro", "Julio Medem"],  // ✔ comprobada en la web
    ["¿Qué actriz protagonizó «Desayuno con diamantes»?", "Audrey Hepburn", "Grace Kelly", "Marilyn Monroe", "Ingrid Bergman"],
    ["¿Qué grupo grabó «Smells Like Teen Spirit»?", "Nirvana", "Pearl Jam", "Soundgarden", "Foo Fighters"],
    ["¿Qué actor interpreta a Neo en «Matrix»?", "Keanu Reeves", "Brad Pitt", "Tom Cruise", "Johnny Depp"],
    ["¿Quién compuso la banda sonora de la trilogía original de «Star Wars»?", "John Williams", "Hans Zimmer", "Ennio Morricone", "Howard Shore"],
  ],
},

};

// Permite cargar este archivo también desde las pruebas automáticas.
if (typeof module !== "undefined") module.exports = globalThis.CONTENT;
