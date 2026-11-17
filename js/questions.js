/* questions.js - gera as perguntas de cada fase e valida as respostas */
(function (MQ) {
  var M = MQ.MathLib;
  var randInt = M.randInt;
  var fmt = M.fmt;

  // ---------- Fase 1: operações básicas ----------
  var level1 = {
    add: function () {
      var a = randInt(12, 70), b = randInt(5, 45);
      var tens = Math.floor(b / 10) * 10, units = b % 10;
      var hint = tens > 0
        ? 'Some em partes: ' + a + ' + ' + tens + ' = ' + (a + tens) + ', e depois some mais ' + units + '.'
        : 'Conte ' + b + ' a partir de ' + a + '.';
      return { kind: 'number', text: 'Quanto é ' + a + ' + ' + b + '?', answer: a + b, hint: hint };
    },
    sub: function () {
      var a = randInt(30, 99), b = randInt(11, a - 5);
      var tens = Math.floor(b / 10) * 10, units = b % 10;
      return {
        kind: 'number',
        text: 'Quanto é ' + a + ' - ' + b + '?',
        answer: a - b,
        hint: 'Subtraia em partes: ' + a + ' - ' + tens + ' = ' + (a - tens) + ', e depois tire mais ' + units + '.'
      };
    },
    mul: function () {
      var a = randInt(2, 10), b = randInt(3, 10);
      return {
        kind: 'number',
        text: 'Quanto é ' + a + ' × ' + b + '?',
        answer: a * b,
        hint: 'Pense na tabuada do ' + a + ': ' + a + ' × ' + b + ' = ' + a + ' × ' + (b - 1) + ' + ' + a + ' = ' + (a * (b - 1)) + ' + ' + a + '.'
      };
    },
    div: function () {
      var b = randInt(2, 10), k = randInt(2, 12);
      return {
        kind: 'number',
        text: 'Quanto é ' + (b * k) + ' ÷ ' + b + '?',
        answer: k,
        hint: 'Procure na tabuada do ' + b + ': ' + b + ' vezes quanto dá ' + (b * k) + '?'
      };
    },
    mix: function () {
      return level1[M.pick(['add', 'sub', 'mul', 'div'])]();
    }
  };

  // ---------- Fase 2: frações ----------
  function coprimePair(maxA, maxB) {
    for (;;) {
      var a = randInt(1, maxA), b = randInt(a + 1, maxB);
      if (M.gcd(a, b) === 1) return { a: a, b: b };
    }
  }

  var level2 = {
    identify: function () {
      if (M.random() < 0.5) {
        var d = M.pick([3, 4, 5, 6, 8]), n = randInt(1, d - 1);
        return {
          kind: 'fraction', answer: { n: n, d: d },
          text: 'Uma pizza foi dividida em ' + d + ' pedaços iguais e você comeu ' + n + '. Que fração da pizza você comeu?',
          hint: 'O denominador é o total de pedaços (' + d + ') e o numerador é a parte que você pegou (' + n + '). Escreva ' + n + '/' + d + '.'
        };
      }
      var d2 = M.pick([2, 3, 4, 5]), n2 = randInt(1, d2 - 1), k = randInt(2, 4);
      return {
        kind: 'number', answer: n2 * k,
        text: 'Complete a fração equivalente: ' + n2 + '/' + d2 + ' = ?/' + (d2 * k),
        hint: d2 + ' × ' + k + ' = ' + (d2 * k) + ', então multiplique o numerador ' + n2 + ' por ' + k + ' também.'
      };
    },
    compare: function () {
      for (;;) {
        var d1 = randInt(2, 8), d2 = randInt(2, 8);
        var n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
        if (n1 * d2 === n2 * d1) continue;
        var L = M.lcm(d1, d2);
        var f1 = fmt(n1, d1), f2 = fmt(n2, d2);
        return {
          kind: 'choice', options: [f1, f2],
          answerText: n1 * d2 > n2 * d1 ? f1 : f2,
          text: 'Qual fração é maior?',
          hint: 'Use o mesmo denominador (' + L + '): ' + (n1 * L / d1) + '/' + L + ' e ' + (n2 * L / d2) + '/' + L + '. Agora compare os numeradores.'
        };
      }
    },
    addSame: function () {
      var d = randInt(3, 10), n1 = randInt(1, d - 1), n2 = randInt(1, d - 1);
      return {
        kind: 'fraction', answer: { n: n1 + n2, d: d },
        text: 'Quanto é ' + n1 + '/' + d + ' + ' + n2 + '/' + d + '?',
        hint: 'Com denominadores iguais, some só os numeradores: ' + n1 + ' + ' + n2 + ' = ' + (n1 + n2) + '. O denominador continua ' + d + '.'
      };
    },
    ofNumber: function () {
      var d = randInt(2, 6), n = randInt(1, d - 1), k = randInt(2, 9);
      return {
        kind: 'number', answer: n * k,
        text: 'Quanto é ' + n + '/' + d + ' de ' + (d * k) + '?',
        hint: 'Divida ' + (d * k) + ' por ' + d + ' (dá ' + k + ') e depois multiplique por ' + n + '.'
      };
    },
    simplify: function () {
      var p = coprimePair(5, 9), k = randInt(2, 6);
      return {
        kind: 'fraction', simplest: true, answer: { n: p.a, d: p.b },
        text: 'Simplifique a fração ' + (p.a * k) + '/' + (p.b * k) + ' até ficar irredutível.',
        hint: 'Divida o numerador e o denominador pelo mesmo número. Aqui, o maior divisor comum é ' + k + '.'
      };
    },
    addDiff: function () {
      var d1 = M.pick([2, 3, 4, 5]), m = M.pick([2, 3]), d2 = d1 * m;
      var n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
      return {
        kind: 'fraction', answer: { n: n1 * m + n2, d: d2 },
        text: 'Quanto é ' + n1 + '/' + d1 + ' + ' + n2 + '/' + d2 + '?',
        hint: 'Deixe os denominadores iguais: ' + n1 + '/' + d1 + ' = ' + (n1 * m) + '/' + d2 + '. Agora some ' + (n1 * m) + '/' + d2 + ' + ' + n2 + '/' + d2 + '.'
      };
    },
    mulFrac: function () {
      var d1 = randInt(2, 7), d2 = randInt(2, 7);
      var n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
      return {
        kind: 'fraction', answer: { n: n1 * n2, d: d1 * d2 },
        text: 'Quanto é ' + n1 + '/' + d1 + ' × ' + n2 + '/' + d2 + '?',
        hint: 'Multiplique os numeradores (' + n1 + ' × ' + n2 + ' = ' + (n1 * n2) + ') e os denominadores (' + d1 + ' × ' + d2 + ' = ' + (d1 * d2) + '). Se der, simplifique.'
      };
    }
  };

  // ---------- Fase 3: equações do 1º grau ----------
  function cx(a) { return a === 1 ? 'x' : a + 'x'; }

  var level3 = {
    eq1: function () {
      var x = randInt(-10, 20) || 7, a = randInt(3, 25), b = x + a;
      return {
        kind: 'number', answer: x,
        text: 'Resolva: x + ' + a + ' = ' + b + '. Quanto vale x?',
        hint: 'Subtraia ' + a + ' dos dois lados da equação: x = ' + b + ' - ' + a + '.'
      };
    },
    eq2: function () {
      var x = randInt(5, 40), a = randInt(3, 20), b = x - a;
      return {
        kind: 'number', answer: x,
        text: 'Resolva: x - ' + a + ' = ' + b + '. Quanto vale x?',
        hint: 'Some ' + a + ' aos dois lados da equação: x = ' + b + ' + ' + a + '.'
      };
    },
    eq3: function () {
      var a = randInt(2, 9), x = randInt(2, 12);
      return {
        kind: 'number', answer: x,
        text: 'Resolva: ' + cx(a) + ' = ' + (a * x) + '. Quanto vale x?',
        hint: 'Divida os dois lados por ' + a + ': x = ' + (a * x) + ' ÷ ' + a + '.'
      };
    },
    eq4: function () {
      var a = randInt(2, 9), x = randInt(2, 12), b = randInt(1, 20), c = a * x + b;
      return {
        kind: 'number', answer: x,
        text: 'Resolva: ' + cx(a) + ' + ' + b + ' = ' + c + '. Quanto vale x?',
        hint: 'Primeiro subtraia ' + b + ' dos dois lados: ' + cx(a) + ' = ' + (c - b) + '. Depois divida por ' + a + '.'
      };
    },
    eq5: function () {
      var a = randInt(2, 9), x = randInt(2, 12);
      var b = randInt(1, Math.min(20, a * x - 1)), c = a * x - b;
      return {
        kind: 'number', answer: x,
        text: 'Resolva: ' + cx(a) + ' - ' + b + ' = ' + c + '. Quanto vale x?',
        hint: 'Primeiro some ' + b + ' dos dois lados: ' + cx(a) + ' = ' + (c + b) + '. Depois divida por ' + a + '.'
      };
    },
    eq6: function () {
      var a = randInt(2, 6), k = randInt(2, 9), b = randInt(1, 15), c = k + b;
      return {
        kind: 'number', answer: a * k,
        text: 'Resolva: x/' + a + ' + ' + b + ' = ' + c + '. Quanto vale x?',
        hint: 'Subtraia ' + b + ' dos dois lados: x/' + a + ' = ' + (c - b) + '. Depois multiplique por ' + a + '.'
      };
    },
    eq7: function () {
      var a = randInt(2, 6), x = randInt(2, 10), b = randInt(1, 8), c = a * (x + b);
      return {
        kind: 'number', answer: x,
        text: 'Resolva: ' + a + '(x + ' + b + ') = ' + c + '. Quanto vale x?',
        hint: 'Divida os dois lados por ' + a + ': x + ' + b + ' = ' + (c / a) + '. Depois subtraia ' + b + '.'
      };
    },
    eq8: function () {
      var c = randInt(1, 4), a = c + randInt(1, 5), x = randInt(1, 10), b = randInt(1, 15);
      var d = b + (a - c) * x;
      return {
        kind: 'number', answer: x,
        text: 'Resolva: ' + cx(a) + ' + ' + b + ' = ' + cx(c) + ' + ' + d + '. Quanto vale x?',
        hint: 'Junte os x de um lado: ' + cx(a - c) + ' = ' + d + ' - ' + b + ' = ' + (d - b) + '. Depois divida por ' + (a - c) + '.'
      };
    }
  };

  var GENERATORS = { 1: level1, 2: level2, 3: level3 };

  // ordem das perguntas (uma por portão) em cada fase
  var PLANS = {
    1: ['add', 'sub', 'mul', 'div', 'mix', 'mix'],
    2: ['identify', 'compare', 'addSame', 'ofNumber', 'simplify', 'addDiff', 'mulFrac'],
    3: ['eq1', 'eq2', 'eq3', 'eq4', 'eq5', 'eq6', 'eq7', 'eq8']
  };

  var counter = 0;

  function generate(levelId, index) {
    var plan = PLANS[levelId];
    var type = plan[index % plan.length];
    var q = GENERATORS[levelId][type]();
    q.type = type;
    q.level = levelId;
    q.id = ++counter;
    return q;
  }

  // valida a resposta: devolve { valid, correct, message }
  function check(q, raw) {
    raw = String(raw == null ? '' : raw).trim();
    if (q.kind === 'choice') {
      if (!raw) return { valid: false, correct: false, message: 'Escolha uma das opções.' };
      return { valid: true, correct: raw === q.answerText };
    }
    if (q.kind === 'number') {
      var v = M.parseNumber(raw);
      if (v === null) return { valid: false, correct: false, message: 'Digite apenas um número (ex.: 12).' };
      return { valid: true, correct: Math.abs(v - q.answer) < 1e-9 };
    }
    var f = M.parseFraction(raw);
    if (!f) return { valid: false, correct: false, message: 'Digite uma fração como 3/4 ou um número inteiro.' };
    var equal = M.sameFraction(f, q.answer);
    if (equal && q.simplest) {
      var s = M.simplify(f.n, f.d);
      if (s.n !== f.n || s.d !== f.d) {
        return { valid: true, correct: false, message: 'O valor está certo, mas ainda dá para simplificar!' };
      }
    }
    return { valid: true, correct: equal };
  }

  // texto da resposta correta (usado nos testes e na dica final)
  function answerText(q) {
    if (q.kind === 'choice') return q.answerText;
    if (q.kind === 'number') return String(q.answer);
    var s = M.simplify(q.answer.n, q.answer.d);
    return fmt(s.n, s.d);
  }

  MQ.Questions = {
    PLANS: PLANS,
    GENERATORS: GENERATORS,
    generate: generate,
    check: check,
    answerText: answerText
  };
})(globalThis.MQ = globalThis.MQ || {});
