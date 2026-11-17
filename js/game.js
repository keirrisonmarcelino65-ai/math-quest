/* game.js - regras da partida: vidas, moedas, portões, inimigos, checkpoints e fim de fase */
(function (MQ) {
  var C = MQ.Collision;
  var T = C.TILE;
  var MAX_ATTEMPTS = 3;      // tentativas antes de mostrar a dica
  var START_LIVES = 3;
  var VIEW_W = 960;
  var VIEW_H = 544;

  function Game(levelId) {
    this.levelId = levelId;
    this.level = MQ.Levels.build(levelId);
    this.player = new MQ.Player(this.level.start.x, this.level.start.y);
    this.score = new MQ.Score();
    this.lives = START_LIVES;
    this.state = 'playing'; // playing | question | paused | levelComplete | gameOver
    this.checkpoint = { x: this.level.start.x, y: this.level.start.y };
    this.camera = { x: 0, y: 0 };
    this.activeGate = null;
    this.particles = [];
    this.floaters = [];
    this.time = 0;
    this.onEvent = null;
    this.summary = null;
    this._updateCamera(true);
  }

  Game.MAX_ATTEMPTS = MAX_ATTEMPTS;
  Game.START_LIVES = START_LIVES;
  Game.VIEW_W = VIEW_W;
  Game.VIEW_H = VIEW_H;

  Game.prototype.emit = function (name, data) {
    if (this.onEvent) this.onEvent(name, data);
  };

  Game.prototype.update = function (input) {
    if (this.state !== 'playing') return;
    this.time++;
    var p = this.player;
    p.update(input, this.level);
    if (p.justJumped) this.emit('jump');

    this._coins();
    this._enemies();
    this._hazards();
    this._checkpoints();
    this._gates();
    this._goal();
    this._effects();
    this._updateCamera(false);
  };

  Game.prototype._coins = function () {
    var pr = this.player.rect();
    var coins = this.level.coins;
    for (var i = 0; i < coins.length; i++) {
      var c = coins[i];
      if (!c.taken && C.overlap(pr, c)) {
        c.taken = true;
        var pts = this.score.addCoin();
        this._float(c.x, c.y, '+' + pts, '#ffd23f');
        this._burst(c.x + 8, c.y + 8, '#ffd23f', 6);
        this.emit('coin');
      }
    }
  };

  Game.prototype._enemies = function () {
    var p = this.player;
    var enemies = this.level.enemies;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (!e.alive) {
        if (e.squash < 20) e.squash++;
        continue;
      }
      e.x += e.dir * 0.9;
      if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
      if (e.x >= e.maxX) { e.x = e.maxX; e.dir = -1; }

      if (C.overlap(p.rect(), e)) {
        var fromAbove = p.vy > 1 && (p.y + p.h - e.y) < 18;
        if (fromAbove) {
          e.alive = false;
          p.vy = -8;
          var pts = this.score.addStomp();
          this._float(e.x, e.y - 10, '+' + pts, '#ffffff');
          this._burst(e.x + 14, e.y + 10, '#7bd34a', 8);
          this.emit('stomp');
        } else if (p.invuln === 0) {
          this._die('inimigo');
          return;
        }
      }
    }
  };

  Game.prototype._hazards = function () {
    var p = this.player;
    if (p.y > this.level.pixelHeight + 60) {
      this._die('queda');
      return;
    }
    if (p.invuln > 0) return;
    var pr = p.rect();
    var spikes = this.level.spikes;
    for (var i = 0; i < spikes.length; i++) {
      if (C.overlap(pr, spikes[i])) {
        this._die('espinhos');
        return;
      }
    }
  };

  Game.prototype._checkpoints = function () {
    var pr = this.player.rect();
    var list = this.level.checkpoints;
    for (var i = 0; i < list.length; i++) {
      var cp = list[i];
      if (cp.active) continue;
      var zone = { x: cp.x - 8, y: cp.y - 64, w: T + 16, h: 64 };
      if (C.overlap(pr, zone)) {
        cp.active = true;
        this.checkpoint = { x: cp.x + 5, y: cp.y - this.player.h };
        this._float(cp.x, cp.y - 80, 'Checkpoint!', '#7dffb2');
        this.emit('checkpoint');
      }
    }
  };

  // portões: ao chegar perto, abre a janela de pergunta
  Game.prototype._gates = function () {
    var pr = this.player.rect();
    var gates = this.level.gates;
    for (var i = 0; i < gates.length; i++) {
      var g = gates[i];
      if (g.open) continue;
      var zone = { x: g.x - 24, y: 0, w: g.w + 48, h: this.level.pixelHeight };
      var near = C.overlap(pr, zone);
      if (!near) g.dismissed = false;
      else if (!g.dismissed) {
        this.state = 'question';
        this.activeGate = g;
        this.player.vx = 0;
        this.emit('question', g);
        return;
      }
    }
  };

  Game.prototype._goal = function () {
    if (C.overlap(this.player.rect(), this.level.goal)) this._complete();
  };

  Game.prototype._effects = function () {
    var gates = this.level.gates;
    for (var i = 0; i < gates.length; i++) {
      var g = gates[i];
      if (g.open && g.openAnim < 1) g.openAnim = Math.min(1, g.openAnim + 0.03);
    }
    for (var k = this.particles.length - 1; k >= 0; k--) {
      var pt = this.particles[k];
      pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.25; pt.life--;
      if (pt.life <= 0) this.particles.splice(k, 1);
    }
    for (var f = this.floaters.length - 1; f >= 0; f--) {
      var fl = this.floaters[f];
      fl.y -= 0.7; fl.life--;
      if (fl.life <= 0) this.floaters.splice(f, 1);
    }
  };

  Game.prototype._float = function (x, y, text, color) {
    this.floaters.push({ x: x, y: y, text: text, color: color, life: 50 });
  };

  Game.prototype._burst = function (x, y, color, n) {
    for (var i = 0; i < n; i++) {
      this.particles.push({
        x: x, y: y, color: color, life: 28 + (i % 4) * 4,
        vx: Math.cos(i * 2.4) * (1.2 + (i % 3) * 0.6),
        vy: -2.5 - (i % 3) * 0.8
      });
    }
  };

  Game.prototype._die = function (reason) {
    this.lives--;
    this.emit('death', reason);
    if (this.lives <= 0) {
      this.lives = 0;
      this.state = 'gameOver';
      this.emit('gameOver');
      return;
    }
    this.player.respawn(this.checkpoint.x, this.checkpoint.y);
    this.player.invuln = 100;
    this._updateCamera(true);
  };

  Game.prototype._complete = function () {
    var bonus = this.score.addLifeBonus(this.lives);
    this.state = 'levelComplete';
    var record = MQ.Storage.completeLevel(this.levelId, this.score.points);
    this.summary = {
      levelId: this.levelId,
      points: this.score.points,
      coins: this.score.coins,
      correct: this.score.correct,
      wrong: this.score.wrong,
      lives: this.lives,
      lifeBonus: bonus,
      record: record,
      isFinal: this.levelId >= MQ.Levels.COUNT
    };
    this.emit('levelComplete', this.summary);
  };

  // ---------- janela de perguntas ----------
  // devolve { valid, correct, message, attempts, remaining, hint }
  Game.prototype.submitAnswer = function (raw) {
    var g = this.activeGate;
    if (this.state !== 'question' || !g || g.open) return { valid: false, correct: false, message: '' };

    var res = MQ.Questions.check(g.q, raw);
    if (!res.valid) return res;

    if (res.correct) {
      var gained = this.score.addCorrect(g.attempts === 0);
      g.open = true;
      for (var y = 0; y < this.level.groundRow; y++) this.level.solid[y][g.tx] = false;
      this._float(g.x - 10, 230, '+' + gained, '#7dffb2');
      this._burst(g.x + 16, 260, '#7dffb2', 12);
      res.gained = gained;
      res.firstTry = g.attempts === 0;
      this.emit('correct', g);
    } else {
      g.attempts++;
      this.score.addWrong();
      if (g.attempts >= MAX_ATTEMPTS) g.hintShown = true;
      this.emit('wrong', g);
    }
    res.attempts = g.attempts;
    res.remaining = Math.max(0, MAX_ATTEMPTS - g.attempts);
    res.hint = g.hintShown ? g.q.hint : null;
    return res;
  };

  // fecha a janela (depois de acertar ou ao desistir de responder agora)
  Game.prototype.closeQuestion = function () {
    var g = this.activeGate;
    if (this.state !== 'question') return;
    if (g && !g.open) g.dismissed = true;
    this.activeGate = null;
    this.state = 'playing';
  };

  Game.prototype.pause = function () {
    if (this.state === 'playing') this.state = 'paused';
  };

  Game.prototype.resume = function () {
    if (this.state === 'paused') this.state = 'playing';
  };

  // câmera lateral que segue o personagem
  Game.prototype._updateCamera = function (snap) {
    var target = this.player.x + this.player.w / 2 - VIEW_W / 2 + this.player.facing * 40;
    target = Math.max(0, Math.min(this.level.pixelWidth - VIEW_W, target));
    if (snap) this.camera.x = target;
    else this.camera.x += (target - this.camera.x) * 0.12;
    this.camera.y = 0;
  };

  MQ.Game = Game;
})(globalThis.MQ = globalThis.MQ || {});
