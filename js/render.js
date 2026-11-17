/* render.js - desenha cenário, blocos, personagem, inimigos e HUD no Canvas 2D */
(function (MQ) {
  var T = 32;
  var W = 960;
  var H = 544;

  // cores de cada cenário
  var THEMES = {
    forest: {
      sky: ['#6ec6ff', '#e2f6ff'],
      top: '#5ec23e', topLight: '#8ee26a', topDark: '#3e8f2c',
      fill: '#8b5a2b', fillDark: '#6e4420', speck: '#b07a3e', bricks: null,
      plat: { main: '#d9a05b', dark: '#9c6a2e', light: '#f0c27f' },
      far: '#a6dcb2', mid: '#5dbb73', tree: '#2f8f4e', treeDark: '#226b3a', trunk: '#7a4a21',
      name: 'Floresta dos Números'
    },
    temple: {
      sky: ['#ffc277', '#fff2d2'],
      top: '#f0d49c', topLight: '#fff0c8', topDark: '#c9a66b',
      fill: '#e0bf86', fillDark: '#c9a66b', speck: '#f4dcae', bricks: '#b8934f',
      plat: { main: '#58b6b0', dark: '#2f827e', light: '#8ae0d8' },
      far: '#f1c98f', mid: '#dba867', col: '#e9cf9c', colDark: '#c9a66b',
      name: 'Templo das Frações'
    },
    castle: {
      sky: ['#140a2e', '#43206e'],
      top: '#8a8aa3', topLight: '#b4b4cc', topDark: '#5d5d75',
      fill: '#6b6b84', fillDark: '#54546b', speck: '#7c7c96', bricks: '#41414f',
      plat: { main: '#9a6b4e', dark: '#6b4631', light: '#c08f6e' },
      far: '#2a1650', mid: '#38206a', stone: '#4c3a78', stoneDark: '#352858',
      name: 'Castelo das Equações'
    }
  };

  function hash(x, y, s) {
    var n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // textura de um bloco de chão (com ou sem grama/topo)
  function makeGround(th, top, seed) {
    var c = canvas(T, T);
    var g = c.getContext('2d');
    for (var py = 0; py < 8; py++) {
      for (var px = 0; px < 8; px++) {
        var color = th.fill;
        var n = hash(px, py, seed);
        if (n > 0.84) color = th.fillDark;
        else if (n < 0.08) color = th.speck;
        if (top && py === 0) color = th.topLight;
        else if (top && py === 1) color = th.top;
        else if (top && py === 2) color = th.topDark;
        g.fillStyle = color;
        g.fillRect(px * 4, py * 4, 4, 4);
      }
    }
    if (th.bricks) {
      g.fillStyle = th.bricks;
      g.fillRect(0, 15, T, 2);
      g.fillRect(0, 31, T, 2);
      g.fillRect(top ? 9 : 14, top ? 8 : 0, 2, top ? 8 : 16);
      g.fillRect(24, 16, 2, 16);
    }
    return c;
  }

  function makePlatform(th) {
    var c = canvas(T, T);
    var g = c.getContext('2d');
    g.fillStyle = th.plat.dark;
    g.fillRect(0, 2, T, 12);
    g.fillStyle = th.plat.main;
    g.fillRect(0, 0, T, 10);
    g.fillStyle = th.plat.light;
    g.fillRect(0, 0, T, 2);
    g.fillStyle = th.plat.dark;
    g.fillRect(15, 2, 2, 8);
    g.fillRect(4, 5, 4, 2);
    g.fillRect(22, 4, 4, 2);
    return c;
  }

  function Renderer(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.sprites = MQ.Sprites.build();
    this.tiles = {};
    var self = this;
    Object.keys(THEMES).forEach(function (name) {
      var th = THEMES[name];
      self.tiles[name] = {
        top: [makeGround(th, true, 1), makeGround(th, true, 2)],
        fill: [makeGround(th, false, 3), makeGround(th, false, 4)],
        plat: makePlatform(th)
      };
    });
  }

  Renderer.THEMES = THEMES;

  // ---------- cenários ----------
  Renderer.prototype.drawBackground = function (themeName, camX, t) {
    var g = this.ctx;
    var th = THEMES[themeName];
    var sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, th.sky[0]);
    sky.addColorStop(1, th.sky[1]);
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);

    if (themeName === 'forest') this._bgForest(th, camX, t);
    else if (themeName === 'temple') this._bgTemple(th, camX, t);
    else this._bgCastle(th, camX, t);
  };

  Renderer.prototype._hills = function (color, camX, factor, base, amp, wave) {
    var g = this.ctx;
    g.fillStyle = color;
    for (var x = 0; x < W; x += 8) {
      var wx = x + camX * factor;
      var y = base + Math.sin(wx / wave) * amp + Math.sin(wx / (wave * 0.37)) * amp * 0.35;
      g.fillRect(x, Math.round(y / 4) * 4, 8, H - y);
    }
  };

  Renderer.prototype._bgForest = function (th, camX, t) {
    var g = this.ctx;
    g.fillStyle = '#fff6c8';
    g.beginPath();
    g.arc(808, 78, 30, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#ffffff';
    for (var i = 0; i < 5; i++) {
      var cx = ((i * 260 + t * 0.15 - camX * 0.1) % (W + 200)) - 100;
      var cy = 60 + (i % 3) * 45;
      g.fillRect(cx, cy, 80, 16);
      g.fillRect(cx + 16, cy - 12, 48, 16);
      g.fillRect(cx + 8, cy + 12, 60, 8);
    }
    this._hills(th.far, camX, 0.2, 330, 40, 90);
    this._hills(th.mid, camX, 0.4, 390, 28, 60);
    var offset = (camX * 0.6) % 120;
    for (var k = -1; k < 9; k++) {
      var tx = k * 120 - offset;
      this._pine(tx, 448, th, 1 + ((k + Math.floor(camX * 0.6 / 120)) % 3 + 3) % 3 * 0.18);
    }
  };

  Renderer.prototype._pine = function (x, ground, th, s) {
    var g = this.ctx;
    var h = Math.round(120 * s);
    g.fillStyle = th.trunk;
    g.fillRect(x + 16, ground - 24, 12, 24);
    var rows = 4;
    for (var r = 0; r < rows; r++) {
      var w = 56 - r * 12;
      var y = ground - 24 - (r + 1) * (h / rows) + 8;
      g.fillStyle = r % 2 ? th.treeDark : th.tree;
      g.fillRect(x + 22 - w / 2, y, w, h / rows + 4);
    }
  };

  Renderer.prototype._bgTemple = function (th, camX, t) {
    var g = this.ctx;
    g.fillStyle = '#fff9e0';
    g.beginPath();
    g.arc(760, 120, 56, 0, Math.PI * 2);
    g.fill();
    this._hills(th.far, camX, 0.15, 340, 30, 130);
    this._hills(th.mid, camX, 0.3, 395, 22, 80);
    var offset = (camX * 0.55) % 200;
    for (var k = -1; k < 6; k++) {
      var x = k * 200 - offset + 60;
      g.fillStyle = th.colDark;
      g.fillRect(x - 2, 150, 44, 298);
      g.fillStyle = th.col;
      g.fillRect(x, 160, 40, 288);
      g.fillStyle = th.colDark;
      for (var f = 0; f < 4; f++) g.fillRect(x + 6 + f * 9, 176, 3, 260);
      g.fillStyle = th.col;
      g.fillRect(x - 8, 140, 56, 20);
      g.fillStyle = th.colDark;
      g.fillRect(x - 8, 156, 56, 4);
    }
  };

  Renderer.prototype._bgCastle = function (th, camX, t) {
    var g = this.ctx;
    for (var i = 0; i < 70; i++) {
      var sx = (hash(i, 1, 9) * 1400 - camX * 0.05 + 1400) % W;
      var sy = hash(i, 2, 9) * 300;
      var tw = Math.sin(t * 0.05 + i) > 0.6 ? 4 : 2;
      g.fillStyle = '#ffffff';
      g.fillRect(Math.round(sx), Math.round(sy), tw, tw);
    }
    g.fillStyle = '#f4f1d0';
    g.beginPath();
    g.arc(160, 90, 38, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#d8d3a8';
    g.fillRect(146, 80, 10, 10);
    g.fillRect(168, 98, 8, 8);
    // torres distantes
    var off = (camX * 0.25) % 360;
    for (var k = -1; k < 5; k++) {
      var x = k * 360 - off;
      g.fillStyle = th.far;
      g.fillRect(x, 250, 90, 200);
      g.fillRect(x + 110, 300, 130, 150);
      for (var c = 0; c < 4; c++) g.fillRect(x + c * 26, 234, 14, 16);
      for (var c2 = 0; c2 < 5; c2++) g.fillRect(x + 110 + c2 * 28, 284, 16, 16);
      g.fillStyle = '#ffd36b';
      g.fillRect(x + 36, 300, 12, 20);
      g.fillRect(x + 160, 340, 12, 20);
    }
    // pilares e tochas
    var off2 = (camX * 0.55) % 240;
    for (var p = -1; p < 6; p++) {
      var px = p * 240 - off2 + 90;
      g.fillStyle = th.stoneDark;
      g.fillRect(px, 120, 44, 328);
      g.fillStyle = th.stone;
      g.fillRect(px + 4, 120, 36, 328);
      g.fillStyle = th.stoneDark;
      for (var b = 0; b < 10; b++) g.fillRect(px + 4, 140 + b * 32, 36, 2);
      var flick = Math.sin(t * 0.3 + p * 2) * 3;
      g.fillStyle = '#6b4631';
      g.fillRect(px + 18, 250, 8, 24);
      g.fillStyle = '#ff7a1a';
      g.fillRect(px + 14, 232 + flick, 16, 20);
      g.fillStyle = '#ffd24a';
      g.fillRect(px + 18, 238 + flick, 8, 12);
    }
  };

  // ---------- mundo ----------
  Renderer.prototype.draw = function (game, t, noHud) {
    var g = this.ctx;
    var level = game.level;
    var cam = Math.round(game.camera.x);
    var th = THEMES[level.theme];
    var set = this.tiles[level.theme];

    this.drawBackground(level.theme, cam, t);

    g.save();
    g.translate(-cam, 0);

    var first = Math.max(0, Math.floor(cam / T));
    var last = Math.min(level.w - 1, first + Math.ceil(W / T) + 1);
    for (var y = 0; y < level.h; y++) {
      for (var x = first; x <= last; x++) {
        var c = level.tiles[y][x];
        if (c === '#') {
          var above = y > 0 && level.solid[y - 1][x] && level.tiles[y - 1][x] === '#';
          var variant = (x * 7 + y * 13) % 2;
          g.drawImage(above ? set.fill[variant] : set.top[variant], x * T, y * T);
        } else if (c === '=') {
          g.drawImage(set.plat, x * T, y * T);
        }
      }
    }

    this._spikes(level, first, last);
    this._goal(level, t);
    this._checkpoints(level, t);
    this._gates(level, t, game);
    this._coins(level, t, first, last);
    this._enemies(level, game);
    this._player(game, t);

    game.particles.forEach(function (p) {
      g.fillStyle = p.color;
      g.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
    });
    g.font = 'bold 18px "Courier New", monospace';
    g.textAlign = 'center';
    game.floaters.forEach(function (f) {
      g.globalAlpha = Math.min(1, f.life / 20);
      g.fillStyle = '#000000';
      g.fillText(f.text, f.x + 1, f.y + 1);
      g.fillStyle = f.color;
      g.fillText(f.text, f.x, f.y);
    });
    g.globalAlpha = 1;
    g.restore();

    if (!noHud) this._hud(game, th);
  };

  Renderer.prototype._spikes = function (level, first, last) {
    var g = this.ctx;
    level.spikes.forEach(function (s) {
      if (s.tx < first || s.tx > last) return;
      var bx = s.tx * T;
      var by = (level.groundRow) * T;
      g.fillStyle = '#5d6b78';
      g.fillRect(bx, by - 4, T, 4);
      for (var i = 0; i < 2; i++) {
        var sx = bx + i * 16;
        var widths = [16, 12, 8, 4];
        for (var r = 0; r < 4; r++) {
          g.fillStyle = r < 2 ? '#e3ecf2' : '#ffffff';
          g.fillRect(sx + (16 - widths[r]) / 2, by - 20 + r * 4, widths[r], 4);
        }
        g.fillStyle = '#9fb0bd';
        g.fillRect(sx + 8, by - 20, 2, 16);
      }
    });
  };

  Renderer.prototype._coins = function (level, t, first, last) {
    var g = this.ctx;
    level.coins.forEach(function (c) {
      if (c.taken) return;
      var tx = c.x / T;
      if (tx < first - 1 || tx > last + 1) return;
      var phase = t * 0.08 + c.phase;
      var w = Math.round(Math.abs(Math.cos(phase)) * 12) + 4;
      var bob = Math.round(Math.sin(t * 0.05 + c.phase) * 2);
      var cx = c.x + 8 - w / 2;
      var cy = c.y + bob;
      g.fillStyle = '#b8860b';
      g.fillRect(cx, cy, w, 16);
      g.fillStyle = '#ffd23f';
      g.fillRect(cx + 2, cy + 2, Math.max(2, w - 4), 12);
      g.fillStyle = '#fff3a0';
      g.fillRect(cx + 3, cy + 3, Math.max(1, Math.floor(w / 4)), 6);
    });
  };

  Renderer.prototype._checkpoints = function (level, t) {
    var g = this.ctx;
    level.checkpoints.forEach(function (cp) {
      var px = cp.x + 14;
      var top = cp.y - 56;
      g.fillStyle = '#d8d8e4';
      g.fillRect(px, top, 4, 56);
      g.fillStyle = '#7a7a8a';
      g.fillRect(px - 2, cp.y - 6, 8, 6);
      g.fillStyle = '#ffd23f';
      g.fillRect(px - 1, top - 4, 6, 6);
      var wave = Math.sin(t * 0.15) * 2;
      g.fillStyle = cp.active ? '#3ddc84' : '#e63946';
      for (var i = 0; i < 6; i++) {
        var len = 24 - i * 3;
        g.fillRect(px + 4, top + 2 + i * 3 + (cp.active ? wave * (i / 6) : 0), len, 3);
      }
    });
  };

  Renderer.prototype._goal = function (level, t) {
    var g = this.ctx;
    var gl = level.goal;
    var beam = g.createLinearGradient(0, 0, 0, gl.h);
    beam.addColorStop(0, 'rgba(255,255,160,0)');
    beam.addColorStop(1, 'rgba(255,255,160,0.35)');
    g.fillStyle = beam;
    g.fillRect(gl.x - 6, 0, gl.w + 12, gl.h);
    var px = gl.x + 14;
    var top = gl.h - 176;
    g.fillStyle = '#f0f0f8';
    g.fillRect(px, top, 5, 176);
    g.fillStyle = '#ffd23f';
    g.fillRect(px - 2, top - 6, 9, 9);
    var wave = Math.sin(t * 0.12);
    for (var cy = 0; cy < 5; cy++) {
      for (var cx = 0; cx < 8; cx++) {
        g.fillStyle = (cx + cy) % 2 ? '#101018' : '#ffffff';
        g.fillRect(px + 5 + cx * 6, top + 2 + cy * 6 + Math.round(wave * (cx / 8) * 3), 6, 6);
      }
    }
    g.fillStyle = '#6b6b84';
    g.fillRect(px - 10, gl.h - 8, 26, 8);
  };

  Renderer.prototype._gates = function (level, t, game) {
    var g = this.ctx;
    level.gates.forEach(function (gate) {
      var lift = gate.openAnim * (gate.h + 20);
      if (gate.openAnim >= 1) return;
      g.save();
      g.translate(0, -lift);
      var x = gate.x;
      var h = gate.h;
      g.fillStyle = '#3d3d52';
      g.fillRect(x, 0, T, h);
      g.fillStyle = '#16161f';
      for (var bx = 0; bx < 4; bx++) g.fillRect(x + 6 + bx * 6, 0, 3, h);
      g.fillStyle = '#8a8aa0';
      for (var bx2 = 0; bx2 < 4; bx2++) g.fillRect(x + 6 + bx2 * 6, 0, 2, h);
      for (var r = 0; r < h / 32; r++) {
        g.fillStyle = '#2a2a3a';
        g.fillRect(x, r * 32 + 30, T, 2);
      }
      g.fillStyle = '#6b6b84';
      g.fillRect(x, 0, 5, h);
      g.fillRect(x + T - 5, 0, 5, h);
      g.fillStyle = '#a0a0b8';
      g.fillRect(x, 0, 2, h);
      // placa dourada com interrogação
      var py = h - 150;
      var pulse = (Math.sin(t * 0.1 + gate.id) + 1) / 2;
      g.fillStyle = '#7a5a00';
      g.fillRect(x - 6, py - 2, T + 12, 52);
      g.fillStyle = pulse > 0.5 ? '#ffe066' : '#ffd23f';
      g.fillRect(x - 4, py, T + 8, 48);
      g.fillStyle = '#7a5a00';
      g.font = 'bold 34px "Courier New", monospace';
      g.textAlign = 'center';
      g.fillText('?', x + T / 2, py + 37);
      g.restore();
    });
  };

  Renderer.prototype._enemies = function (level, game) {
    var g = this.ctx;
    var img = this.sprites.slime[level.theme];
    level.enemies.forEach(function (e) {
      if (!e.alive && e.squash >= 20) return;
      g.save();
      var cx = e.x + e.w / 2;
      var bottom = e.y + e.h;
      var wob = e.alive ? 1 + Math.sin(game.time * 0.18 + e.minX) * 0.07 : Math.max(0.1, 0.4 - e.squash * 0.02);
      g.translate(cx, bottom);
      if (e.dir < 0) g.scale(-1, 1);
      if (!e.alive) g.globalAlpha = 1 - e.squash / 20;
      g.scale(1 / wob * (e.alive ? 1 : 1.2), wob);
      g.drawImage(img, -img.width / 2, -img.height);
      g.restore();
    });
  };

  Renderer.prototype._player = function (game, t) {
    var p = game.player;
    if (p.invuln > 0 && Math.floor(p.invuln / 4) % 2 === 0) return;
    var g = this.ctx;
    var frame = this.sprites.hero.idle;
    if (p.anim === 'jump') frame = this.sprites.hero.jump;
    else if (p.anim === 'walk') frame = Math.floor(p.animTime / 6) % 2 ? this.sprites.hero.walkA : this.sprites.hero.walkB;
    g.save();
    g.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h));
    if (p.facing < 0) g.scale(-1, 1);
    g.drawImage(frame, -frame.width / 2, -frame.height);
    g.restore();
  };

  // ---------- interface (HUD) ----------
  Renderer.prototype._text = function (str, x, y, color, size, align) {
    var g = this.ctx;
    g.font = 'bold ' + (size || 20) + 'px "Courier New", monospace';
    g.textAlign = align || 'left';
    g.fillStyle = 'rgba(0,0,0,0.65)';
    g.fillText(str, x + 2, y + 2);
    g.fillStyle = color || '#ffffff';
    g.fillText(str, x, y);
  };

  Renderer.prototype._hud = function (game, th) {
    var g = this.ctx;
    g.fillStyle = 'rgba(10,12,30,0.55)';
    g.fillRect(0, 0, W, 44);
    for (var i = 0; i < 3; i++) {
      var img = i < game.lives ? this.sprites.heart : this.sprites.heartEmpty;
      g.drawImage(img, 14 + i * 28, 13);
    }
    g.fillStyle = '#ffd23f';
    g.fillRect(112, 14, 14, 16);
    g.fillStyle = '#fff3a0';
    g.fillRect(115, 17, 4, 8);
    this._text('x ' + game.score.coins, 134, 30, '#ffe066', 20);
    this._text('PONTOS ' + game.score.points, 232, 30, '#ffffff', 20);
    var opened = game.level.gates.filter(function (x) { return x.open; }).length;
    this._text('PORTÕES ' + opened + '/' + game.level.gates.length, 460, 30, '#9fe6ff', 20);
    this._text('FASE ' + game.levelId + ' - ' + th.name, W - 14, 30, '#ffffff', 16, 'right');
    // barra de progresso da fase
    var prog = Math.max(0, Math.min(1, game.player.x / game.level.goal.x));
    g.fillStyle = 'rgba(255,255,255,0.18)';
    g.fillRect(0, 44, W, 5);
    g.fillStyle = '#3ddc84';
    g.fillRect(0, 44, W * prog, 5);
  };

  MQ.Renderer = Renderer;
})(globalThis.MQ = globalThis.MQ || {});
