/* input.js - teclado: esquerda/direita, pulo, pausa e som */
(function (MQ) {
  var keys = { left: false, right: false, jump: false };
  var jumpPressed = false;
  var handlers = { pause: null, mute: null };

  var MAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    Space: 'jump', ArrowUp: 'jump', KeyW: 'jump'
  };

  function typing(e) {
    var t = e.target && e.target.tagName;
    return t === 'INPUT' || t === 'TEXTAREA';
  }

  function onDown(e) {
    if (e.code === 'Escape') {
      if (handlers.pause) handlers.pause();
      return;
    }
    if (typing(e)) return;
    if (e.code === 'KeyP') {
      if (handlers.pause) handlers.pause();
      return;
    }
    if (e.code === 'KeyM') {
      if (handlers.mute) handlers.mute();
      return;
    }
    var k = MAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (k === 'jump' && !keys.jump) jumpPressed = true;
    keys[k] = true;
  }

  function onUp(e) {
    var k = MAP[e.code];
    if (k) keys[k] = false;
  }

  function clear() {
    keys.left = keys.right = keys.jump = false;
    jumpPressed = false;
  }

  // entrega o estado atual das teclas e zera o "apertou agora" do pulo
  function poll() {
    var state = { left: keys.left, right: keys.right, jump: keys.jump, jumpPressed: jumpPressed };
    jumpPressed = false;
    return state;
  }

  MQ.Input = {
    attach: function () {
      window.addEventListener('keydown', onDown);
      window.addEventListener('keyup', onUp);
      window.addEventListener('blur', clear);
    },
    on: function (name, fn) { handlers[name] = fn; },
    clear: clear,
    poll: poll
  };
})(globalThis.MQ = globalThis.MQ || {});
