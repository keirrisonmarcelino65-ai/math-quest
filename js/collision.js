/* collision.js - colisões entre retângulos e entre corpos e o mapa de blocos */
(function (MQ) {
  var T = 32; // tamanho do bloco em pixels

  // retângulos {x, y, w, h}
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // paredes laterais do mapa são sólidas; acima e abaixo é vazio (cair = perder vida)
  function solidAt(level, tx, ty) {
    if (tx < 0 || tx >= level.w) return true;
    if (ty < 0 || ty >= level.h) return false;
    return level.solid[ty][tx];
  }

  // plataformas atravessáveis por baixo: só seguram quem pousa por cima
  function oneWayAt(level, tx, ty) {
    if (tx < 0 || tx >= level.w || ty < 0 || ty >= level.h) return false;
    return level.oneway[ty][tx];
  }

  function tileRange(body) {
    return {
      left: Math.floor(body.x / T),
      right: Math.floor((body.x + body.w - 0.001) / T),
      top: Math.floor(body.y / T),
      bottom: Math.floor((body.y + body.h - 0.001) / T)
    };
  }

  // move no eixo X e encosta o corpo na parede, se houver
  function moveX(body, level) {
    body.x += body.vx;
    body.hitWall = false;
    var r = tileRange(body);
    for (var ty = r.top; ty <= r.bottom; ty++) {
      if (body.vx > 0 && solidAt(level, r.right, ty)) {
        body.x = r.right * T - body.w;
        body.vx = 0;
        body.hitWall = true;
        return;
      }
      if (body.vx < 0 && solidAt(level, r.left, ty)) {
        body.x = (r.left + 1) * T;
        body.vx = 0;
        body.hitWall = true;
        return;
      }
    }
  }

  // move no eixo Y; marca onGround quando pousa em um bloco
  function moveY(body, level) {
    var prevBottom = body.y + body.h;
    body.y += body.vy;
    body.onGround = false;
    var r = tileRange(body);
    for (var tx = r.left; tx <= r.right; tx++) {
      if (body.vy > 0 && (solidAt(level, tx, r.bottom) ||
          (oneWayAt(level, tx, r.bottom) && prevBottom <= r.bottom * T + 0.001))) {
        body.y = r.bottom * T - body.h;
        body.vy = 0;
        body.onGround = true;
        return;
      }
      if (body.vy < 0 && solidAt(level, tx, r.top)) {
        body.y = (r.top + 1) * T;
        body.vy = 0;
        return;
      }
    }
  }

  MQ.Collision = {
    TILE: T,
    overlap: overlap,
    solidAt: solidAt,
    oneWayAt: oneWayAt,
    moveX: moveX,
    moveY: moveY
  };
})(globalThis.MQ = globalThis.MQ || {});
