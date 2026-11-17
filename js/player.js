/* player.js - personagem controlado pelo jogador */
(function (MQ) {
  var P = MQ.Physics;

  var COYOTE_FRAMES = 6;   // tolerância para pular logo após sair da borda
  var BUFFER_FRAMES = 6;   // tolerância para apertar pulo um pouco antes de pousar

  function Player(x, y) {
    this.w = 22;
    this.h = 30;
    this.respawn(x, y);
  }

  // coloca o personagem em uma posição (início da fase ou checkpoint)
  Player.prototype.respawn = function (x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.hitWall = false;
    this.facing = 1;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.invuln = 0;
    this.anim = 'idle';
    this.animTime = 0;
    this.justJumped = false;
  };

  Player.prototype.rect = function () {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  };

  // input: { left, right, jump, jumpPressed }
  Player.prototype.update = function (input, level) {
    this.justJumped = false;
    var dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    var accel = this.onGround ? P.ACCEL_GROUND : P.ACCEL_AIR;

    if (dir !== 0) {
      this.vx = P.approach(this.vx, dir * P.MOVE_SPEED, accel);
      this.facing = dir;
    } else {
      this.vx = P.approach(this.vx, 0, P.FRICTION);
    }

    if (input.jumpPressed) this.jumpBuffer = BUFFER_FRAMES;
    else if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.onGround) this.coyote = COYOTE_FRAMES;
    else if (this.coyote > 0) this.coyote--;

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.vy = P.JUMP_VELOCITY;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.onGround = false;
      this.justJumped = true;
    }

    // soltar o botão corta o pulo: toque rápido = pulo baixo
    if (!input.jump && this.vy < P.JUMP_CUT) this.vy = P.JUMP_CUT;

    P.step(this, level);

    if (this.invuln > 0) this.invuln--;

    var state = !this.onGround ? 'jump' : (Math.abs(this.vx) > 0.4 ? 'walk' : 'idle');
    if (state !== this.anim) this.animTime = 0;
    this.anim = state;
    this.animTime++;
  };

  MQ.Player = Player;
})(globalThis.MQ = globalThis.MQ || {});
