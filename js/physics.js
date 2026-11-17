/* physics.js - gravidade e integração do movimento (passo fixo de 1/60 s) */
(function (MQ) {
  var C = MQ.Collision;

  var Physics = {
    GRAVITY: 0.56,
    MAX_FALL: 13,
    MOVE_SPEED: 3.4,
    ACCEL_GROUND: 0.55,
    ACCEL_AIR: 0.38,
    FRICTION: 0.5,
    JUMP_VELOCITY: -11.6,
    JUMP_CUT: -3.5,

    // aplica gravidade, move e resolve colisões com o mapa
    step: function (body, level) {
      body.vy = Math.min(body.vy + Physics.GRAVITY, Physics.MAX_FALL);
      C.moveX(body, level);
      C.moveY(body, level);
    },

    // aproxima vx do valor desejado (aceleração suave)
    approach: function (current, target, amount) {
      if (current < target) return Math.min(current + amount, target);
      if (current > target) return Math.max(current - amount, target);
      return current;
    }
  };

  MQ.Physics = Physics;
})(globalThis.MQ = globalThis.MQ || {});
