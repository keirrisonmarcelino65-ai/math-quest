/* levels.js - definição das três fases e construtor reutilizável de mapas */
(function (MQ) {
  var T = 32;
  var ROWS = 17;     // altura do mapa em blocos (17 x 32 = 544 px)
  var GROUND = 14;   // linha onde começa o chão

  // Builder: ferramenta comum às três fases (evita duplicar código)
  function Builder(width) {
    this.w = width;
    this.rows = [];
    for (var y = 0; y < ROWS; y++) {
      var row = [];
      for (var x = 0; x < width; x++) row.push('.');
      this.rows.push(row);
    }
    this.coinList = [];
    this.spikeList = [];
    this.enemyList = [];
    this.gateList = [];
    this.checkList = [];
    this.startTx = 2;
    this.goalTx = width - 6;
  }

  Builder.prototype.ground = function (x1, x2) {
    for (var y = GROUND; y < ROWS; y++)
      for (var x = x1; x <= x2; x++) this.rows[y][x] = '#';
  };

  Builder.prototype.pit = function (x1, x2) {
    for (var y = GROUND; y < ROWS; y++)
      for (var x = x1; x <= x2; x++) this.rows[y][x] = '.';
  };

  Builder.prototype.plat = function (x, y, len) {
    for (var i = 0; i < len; i++) this.rows[y][x + i] = '=';
  };

  Builder.prototype.coin = function (x, y) {
    this.coinList.push({ tx: x, ty: y });
  };

  Builder.prototype.coins = function (x, y, n) {
    for (var i = 0; i < n; i++) this.coin(x + i, y);
  };

  Builder.prototype.spikes = function (x, n) {
    for (var i = 0; i < n; i++) {
      this.spikeList.push(x + i);
      this.rows[GROUND - 1][x + i] = '^';
    }
  };

  // inimigo que patrulha entre os blocos minX e maxX
  Builder.prototype.enemy = function (minX, maxX) {
    this.enemyList.push({ minX: minX, maxX: maxX });
  };

  // portão com pergunta (coluna inteira, do teto ao chão)
  Builder.prototype.gate = function (x) {
    this.gateList.push(x);
    for (var y = 0; y < GROUND; y++) this.rows[y][x] = 'G';
    this.checkList.push(x + 2); // checkpoint logo depois de cada portão
  };

  // ---------- Fase 1: Floresta dos Números ----------
  function forest() {
    var b = new Builder(140);
    b.ground(0, 139);
    b.pit(28, 29); b.pit(70, 72); b.pit(104, 106);
    [22, 48, 66, 86, 100, 122].forEach(function (x) { b.gate(x); });
    b.spikes(36, 2); b.spikes(58, 2); b.spikes(78, 2); b.spikes(112, 2);
    b.enemy(38, 45); b.enemy(53, 56); b.enemy(92, 98); b.enemy(116, 120);

    b.coins(5, 13, 4);
    b.plat(11, 11, 4); b.coins(11, 10, 4);
    b.coins(24, 12, 3);
    b.coin(27, 11); b.coin(28, 10); b.coin(29, 10); b.coin(30, 11);
    b.plat(40, 11, 3); b.coins(40, 10, 3);
    b.plat(52, 10, 4); b.coins(52, 9, 4);
    b.coins(58, 12, 2);
    b.coin(70, 11); b.coin(71, 10); b.coin(72, 11);
    b.plat(74, 11, 3); b.coins(74, 10, 3);
    b.coins(78, 12, 2);
    b.plat(82, 11, 3); b.coins(82, 10, 3);
    b.coins(92, 12, 4);
    b.plat(94, 10, 4); b.coins(94, 9, 4);
    b.coin(104, 11); b.coin(105, 10); b.coin(106, 11);
    b.coins(112, 12, 2);
    b.plat(116, 11, 4); b.coins(116, 10, 4);
    b.coins(126, 13, 5);
    return b;
  }

  // ---------- Fase 2: Templo das Frações ----------
  function temple() {
    var b = new Builder(160);
    b.ground(0, 159);
    b.pit(30, 32); b.pit(75, 77); b.pit(96, 98); b.pit(118, 120);
    [20, 44, 66, 90, 108, 128, 146].forEach(function (x) { b.gate(x); });
    b.spikes(38, 2); b.spikes(54, 2); b.spikes(82, 2); b.spikes(112, 2); b.spikes(136, 2);
    b.enemy(50, 52); b.enemy(70, 73); b.enemy(100, 106); b.enemy(122, 126); b.enemy(139, 144);

    b.coins(5, 13, 3);
    b.plat(8, 11, 4); b.coins(8, 10, 4);
    b.coins(14, 12, 3);
    b.plat(24, 10, 3); b.coins(24, 9, 3);
    b.coin(30, 11); b.coin(31, 10); b.coin(32, 11);
    b.coins(38, 12, 2);
    b.plat(34, 11, 3); b.coins(34, 10, 3);
    b.plat(48, 11, 3); b.coins(48, 10, 3);
    b.coins(54, 11, 3);
    b.plat(58, 10, 4); b.coins(58, 9, 4);
    b.plat(70, 11, 4); b.coins(70, 10, 4);
    b.coin(75, 11); b.coin(76, 10); b.coin(77, 11);
    b.coins(82, 12, 2);
    b.plat(84, 10, 3); b.coins(84, 9, 3);
    b.coin(96, 11); b.coin(97, 10); b.coin(98, 11);
    b.plat(100, 11, 5); b.coins(100, 10, 5);
    b.coins(112, 12, 2);
    b.coin(118, 11); b.coin(119, 10); b.coin(120, 11);
    b.plat(122, 10, 4); b.coins(122, 9, 4);
    b.plat(132, 11, 3); b.coins(132, 10, 3);
    b.coins(136, 11, 3);
    b.plat(139, 11, 4); b.coins(139, 10, 4);
    b.coins(150, 13, 4);
    return b;
  }

  // ---------- Fase 3: Castelo das Equações ----------
  function castle() {
    var b = new Builder(180);
    b.ground(0, 179);
    b.pit(28, 30); b.pit(50, 52); b.pit(72, 74); b.pit(92, 94);
    b.pit(114, 116); b.pit(136, 138); b.pit(156, 158);
    [18, 40, 62, 82, 104, 126, 148, 166].forEach(function (x) { b.gate(x); });
    b.spikes(24, 2); b.spikes(34, 2); b.spikes(56, 2); b.spikes(66, 2);
    b.spikes(86, 2); b.spikes(98, 2); b.spikes(108, 2); b.spikes(120, 2);
    b.spikes(130, 2); b.spikes(142, 2);
    b.enemy(8, 14); b.enemy(44, 48); b.enemy(153, 155); b.enemy(170, 175);

    b.coins(6, 13, 4);
    b.plat(10, 11, 4); b.coins(10, 10, 4);
    b.coins(24, 12, 2);
    b.coin(28, 11); b.coin(29, 10); b.coin(30, 11);
    b.coins(34, 11, 3);
    b.plat(44, 11, 4); b.coins(44, 10, 4);
    b.coin(50, 11); b.coin(51, 10); b.coin(52, 11);
    b.coins(56, 11, 3);
    b.plat(58, 10, 3); b.coins(58, 9, 3);
    b.coins(66, 12, 2);
    b.coin(72, 11); b.coin(73, 10); b.coin(74, 11);
    b.plat(76, 11, 4); b.coins(76, 10, 4);
    b.coins(86, 11, 3);
    b.coin(92, 11); b.coin(93, 10); b.coin(94, 11);
    b.coins(98, 12, 2);
    b.plat(96, 10, 3); b.coins(96, 9, 3);
    b.coins(108, 11, 3);
    b.coin(114, 11); b.coin(115, 10); b.coin(116, 11);
    b.coins(120, 11, 3);
    b.plat(112, 10, 3); b.coins(112, 9, 3);
    b.coins(130, 11, 3);
    b.coin(136, 11); b.coin(137, 10); b.coin(138, 11);
    b.coins(142, 12, 2);
    b.plat(132, 10, 3); b.coins(132, 9, 3);
    b.coin(156, 11); b.coin(157, 10); b.coin(158, 11);
    b.plat(152, 11, 4); b.coins(152, 10, 4);
    b.plat(170, 11, 5); b.coins(170, 10, 5);
    return b;
  }

  var DEFS = {
    1: { id: 1, name: 'Floresta dos Números', topic: 'Adição, subtração, multiplicação e divisão', difficulty: 'Fácil', theme: 'forest', make: forest },
    2: { id: 2, name: 'Templo das Frações', topic: 'Identificação e operações com frações', difficulty: 'Média', theme: 'temple', make: temple },
    3: { id: 3, name: 'Castelo das Equações', topic: 'Equações de primeiro grau', difficulty: 'Difícil', theme: 'castle', make: castle }
  };

  // transforma o Builder no mapa de execução usado pelo jogo
  function build(id) {
    var def = DEFS[id];
    var b = def.make();
    var solid = [];
    var oneway = [];
    for (var y = 0; y < ROWS; y++) {
      var srow = [];
      var orow = [];
      for (var x = 0; x < b.w; x++) {
        var c = b.rows[y][x];
        srow.push(c === '#' || c === 'G');
        orow.push(c === '=');
      }
      solid.push(srow);
      oneway.push(orow);
    }

    var level = {
      id: id,
      name: def.name,
      theme: def.theme,
      w: b.w,
      h: ROWS,
      tile: T,
      groundRow: GROUND,
      pixelWidth: b.w * T,
      pixelHeight: ROWS * T,
      tiles: b.rows,
      solid: solid,
      oneway: oneway,
      start: { x: b.startTx * T + 5, y: GROUND * T - 30 },
      coins: b.coinList.map(function (c) {
        return { x: c.tx * T + 8, y: c.ty * T + 8, w: 16, h: 16, taken: false, phase: (c.tx * 7 + c.ty * 3) % 12 };
      }),
      spikes: b.spikeList.map(function (tx) {
        return { tx: tx, x: tx * T + 4, y: (GROUND - 1) * T + 14, w: 24, h: 18 };
      }),
      gates: b.gateList.map(function (tx, i) {
        return {
          id: i, tx: tx, x: tx * T, y: 0, w: T, h: GROUND * T,
          open: false, openAnim: 0, attempts: 0, hintShown: false, dismissed: false,
          q: MQ.Questions.generate(id, i)
        };
      }),
      checkpoints: b.checkList.map(function (tx) {
        return { tx: tx, x: tx * T, y: GROUND * T, active: false };
      }),
      goal: { tx: b.goalTx, x: b.goalTx * T, y: 0, w: T, h: GROUND * T },
      enemies: b.enemyList.map(function (e) {
        return {
          x: e.minX * T, y: GROUND * T - 20, w: 28, h: 20,
          minX: e.minX * T, maxX: (e.maxX + 1) * T - 28,
          dir: 1, alive: true, squash: 0
        };
      })
    };
    return level;
  }

  MQ.Levels = {
    COUNT: 3,
    TILE: T,
    ROWS: ROWS,
    GROUND: GROUND,
    def: function (id) { return DEFS[id]; },
    build: build
  };
})(globalThis.MQ = globalThis.MQ || {});
