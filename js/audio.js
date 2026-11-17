/* audio.js - efeitos sonoros gerados por código (Web Audio), sem arquivos externos */
(function (MQ) {
  var ctx = null;
  var muted = false;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // toca um tom: frequência inicial, final (opcional), duração, tipo de onda e volume
  function tone(freq, endFreq, dur, type, vol, delay) {
    var c = ensure();
    if (!c || muted) return;
    var t0 = c.currentTime + (delay || 0);
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.06, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  var SOUNDS = {
    jump: function () { tone(300, 620, 0.14, 'square', 0.05); },
    coin: function () { tone(880, null, 0.07, 'square', 0.05); tone(1320, null, 0.12, 'square', 0.05, 0.07); },
    correct: function () {
      tone(523, null, 0.1, 'triangle', 0.1);
      tone(659, null, 0.1, 'triangle', 0.1, 0.1);
      tone(784, null, 0.2, 'triangle', 0.1, 0.2);
    },
    wrong: function () { tone(220, 130, 0.25, 'sawtooth', 0.06); },
    question: function () { tone(660, null, 0.08, 'triangle', 0.08); tone(880, null, 0.1, 'triangle', 0.08, 0.09); },
    stomp: function () { tone(200, 90, 0.12, 'square', 0.07); },
    death: function () { tone(400, 70, 0.5, 'sawtooth', 0.07); },
    checkpoint: function () { tone(587, null, 0.1, 'triangle', 0.09); tone(880, null, 0.18, 'triangle', 0.09, 0.1); },
    win: function () {
      [523, 659, 784, 1047].forEach(function (f, i) { tone(f, null, 0.2, 'triangle', 0.1, i * 0.13); });
    },
    lose: function () {
      [392, 330, 262, 196].forEach(function (f, i) { tone(f, null, 0.28, 'sawtooth', 0.06, i * 0.2); });
    },
    click: function () { tone(500, null, 0.05, 'square', 0.04); }
  };

  MQ.Audio = {
    play: function (name) {
      try { if (SOUNDS[name]) SOUNDS[name](); } catch (e) { /* som é opcional */ }
    },
    setMuted: function (m) { muted = !!m; },
    isMuted: function () { return muted; },
    unlock: ensure
  };
})(globalThis.MQ = globalThis.MQ || {});
