/* math.js - utilidades matemáticas: aleatório, MDC, frações e leitura de respostas */
(function (MQ) {
  var seed = null;

  // gerador com semente (mulberry32), usado nos testes automáticos
  function seeded() {
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function random() {
    return seed === null ? Math.random() : seeded();
  }

  function randInt(min, max) {
    return min + Math.floor(random() * (max - min + 1));
  }

  function pick(list) {
    return list[Math.floor(random() * list.length)];
  }

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a || 1;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function simplify(n, d) {
    var g = gcd(n, d);
    if (d < 0) { n = -n; d = -d; }
    return { n: n / g, d: d / g };
  }

  function fmt(n, d) {
    return d === 1 ? String(n) : n + '/' + d;
  }

  function sameFraction(a, b) {
    return a.n * b.d === b.n * a.d;
  }

  // lê "12", "-7", "2,5", "x = 4" e devolve número (ou null)
  function parseNumber(text) {
    var s = String(text).toLowerCase().replace(/\s+/g, '').replace(/^x=/, '').replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
    return parseFloat(s);
  }

  // lê "3/4", "-3/4" ou inteiro e devolve {n, d} (ou null)
  function parseFraction(text) {
    var s = String(text).toLowerCase().replace(/\s+/g, '').replace(/^x=/, '');
    var m = /^(-?\d+)\/(-?\d+)$/.exec(s);
    if (m) {
      var n = parseInt(m[1], 10);
      var d = parseInt(m[2], 10);
      if (d === 0) return null;
      if (d < 0) { n = -n; d = -d; }
      return { n: n, d: d };
    }
    if (/^-?\d+$/.test(s)) return { n: parseInt(s, 10), d: 1 };
    return null;
  }

  MQ.MathLib = {
    seed: function (s) { seed = s === null ? null : (s | 0); },
    random: random,
    randInt: randInt,
    pick: pick,
    gcd: gcd,
    lcm: lcm,
    simplify: simplify,
    fmt: fmt,
    sameFraction: sameFraction,
    parseNumber: parseNumber,
    parseFraction: parseFraction
  };
})(globalThis.MQ = globalThis.MQ || {});
