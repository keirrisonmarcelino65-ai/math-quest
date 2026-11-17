/* test.js - testes automáticos do Math Quest (rodam no Node, sem navegador) */
const path = require('path');
const root = path.join(__dirname, '..', 'js');
['storage', 'score', 'math', 'questions', 'collision', 'physics', 'player', 'levels', 'game']
  .forEach((f) => require(path.join(root, f + '.js')));
const MQ = globalThis.MQ;

let failures = 0;
function check(cond, msg) {
  if (!cond) { failures++; console.log('  FALHOU:', msg); }
}
function section(name) { console.log('\n== ' + name); }

// ---------- 1. perguntas ----------
section('Perguntas');
MQ.MathLib.seed(12345);
const Q = MQ.Questions;
for (const lvl of [1, 2, 3]) {
  Q.PLANS[lvl].forEach((type, idx) => {
    let bad = 0;
    for (let i = 0; i < 3000; i++) {
      const q = Q.generate(lvl, idx);
      const text = q.text + ' ' + q.hint;
      if (/NaN|undefined|Infinity/.test(text) || !q.hint || !q.text) bad++;
      // a resposta correta precisa ser aceita pela validação
      const ans = Q.answerText(q);
      const r = Q.check(q, ans);
      if (!r.valid || !r.correct) bad++;
      // verificações matemáticas independentes
      if (type.startsWith('eq')) {
        const eq = q.text.replace(/^Resolva:\s*/, '').replace(/\.\s*Quanto vale x\?$/, '');
        const [l, rr] = eq.split('=');
        const toJs = (s, x) => s.replace(/(\d)(x|\()/g, '$1*$2').replace(/(\d)x/g, '$1*x').replace(/x/g, '(' + x + ')');
        const lv = eval(toJs(l, q.answer)), rv = eval(toJs(rr, q.answer));
        if (Math.abs(lv - rv) > 1e-9) bad++;
        if (!Number.isInteger(q.answer)) bad++;
      }
      if (type === 'add' || type === 'sub' || type === 'mul' || type === 'div') {
        const m = /Quanto é (\d+) ([+\-×÷]) (\d+)\?/.exec(q.text);
        const a = +m[1], b = +m[3];
        const exp = { '+': a + b, '-': a - b, '×': a * b, '÷': a / b }[m[2]];
        if (exp !== q.answer || !Number.isInteger(exp) || exp < 0) bad++;
      }
      // resposta errada nunca pode ser aceita
      if (q.kind === 'number') {
        const w = Q.check(q, String(q.answer + 1));
        if (w.correct) bad++;
      }
      if (q.kind === 'choice') {
        if (!q.options.includes(q.answerText) || q.options[0] === q.options[1]) bad++;
        const other = q.options.find((o) => o !== q.answerText);
        if (Q.check(q, other).correct) bad++;
      }
    }
    check(bad === 0, 'fase ' + lvl + ' tipo ' + type + ': ' + bad + ' problemas');
  });
}
// entradas inválidas e frações equivalentes
const fq = { kind: 'fraction', answer: { n: 2, d: 3 }, simplest: true };
check(Q.check(fq, '2/3').correct, '2/3 deve ser aceito');
check(!Q.check(fq, '4/6').correct, '4/6 deve pedir simplificação');
check(Q.check({ kind: 'fraction', answer: { n: 2, d: 3 } }, '4/6').correct, 'equivalente aceito quando não exige simplificar');
check(!Q.check(fq, 'abc').valid, 'texto inválido');
check(Q.check({ kind: 'number', answer: -7 }, 'x = -7').correct, 'aceita x = -7');
check(Q.check({ kind: 'number', answer: 4 }, ' 4 ').correct, 'aceita espaços');
console.log('  perguntas verificadas');

// ---------- 2. estrutura das fases ----------
section('Estrutura das fases');
for (const id of [1, 2, 3]) {
  const L = MQ.Levels.build(id);
  const G = L.groundRow;
  check(L.gates.length === MQ.Questions.PLANS[id].length, 'fase ' + id + ': portões = perguntas');
  L.gates.forEach((g) => {
    check(L.solid[G][g.tx], 'fase ' + id + ': portão ' + g.tx + ' sem chão');
    check(L.solid[0][g.tx] && L.solid[G - 1][g.tx], 'fase ' + id + ': portão ' + g.tx + ' incompleto');
  });
  L.spikes.forEach((s) => check(L.solid[G][s.tx], 'fase ' + id + ': espinho sem chão em ' + s.tx));
  L.enemies.forEach((e) => {
    for (let x = e.minX / 32; x <= (e.maxX + 28) / 32 - 1; x++) check(L.solid[G][Math.floor(x)], 'fase ' + id + ': inimigo sem chão em ' + x);
  });
  L.coins.forEach((c) => check(!L.solid[Math.floor(c.y / 32)][Math.floor(c.x / 32)], 'fase ' + id + ': moeda dentro de bloco'));
  L.checkpoints.forEach((c) => {
    check(L.solid[G][c.tx], 'fase ' + id + ': checkpoint sem chão em ' + c.tx);
    check(!L.spikes.some((s) => Math.abs(s.tx - c.tx) < 1), 'fase ' + id + ': checkpoint sobre espinho');
  });
  check(L.solid[G][L.goal.tx], 'fase ' + id + ': meta sem chão');
  // pits e espinhos com no máximo 3 e 2 blocos
  let run = 0, maxPit = 0;
  for (let x = 0; x < L.w; x++) { if (!L.solid[G][x]) { run++; maxPit = Math.max(maxPit, run); } else run = 0; }
  check(maxPit <= 3, 'fase ' + id + ': buraco largo demais (' + maxPit + ')');
  console.log('  fase ' + id + ': ' + L.w + ' blocos, ' + L.gates.length + ' portões, ' + L.coins.length + ' moedas, ' + L.spikes.length + ' espinhos, ' + L.enemies.length + ' inimigos, buraco máx ' + maxPit);
}

// ---------- 3. robô que joga as fases ----------
function botInput(game, state) {
  const p = game.player, L = game.level, G = L.groundRow;
  const input = { left: false, right: true, jump: true, jumpPressed: false };
  if (!p.onGround) return input;
  const front = p.x + p.w;
  const tx = Math.floor((front + 26) / 32);
  let need = !L.solid[G][tx];
  for (const s of L.spikes) { const d = s.x - front; if (d > -10 && d < 30) need = true; }
  for (const e of L.enemies) {
    if (!e.alive) continue;
    const d = e.x - front;
    const rel = 3.4 - e.dir * 0.9;                 // velocidade relativa
    const mid = (39.5 * rel - 50) / 2;             // melhor momento para pular
    if (d > 0 && d <= mid) need = true;
  }
  if (need) input.jumpPressed = true;
  return input;
}

function playBot(levelId, maxFrames, opts) {
  opts = opts || {};
  const game = new MQ.Game(levelId);
  const log = { deaths: [], gates: 0, wrongFirst: 0 };
  game.onEvent = (name, data) => {
    if (name === 'death') log.deaths.push(data + '@' + Math.round(game.player.x / 32));
  };
  let frames = 0;
  while (frames < maxFrames && game.state !== 'levelComplete' && game.state !== 'gameOver') {
    if (game.state === 'question') {
      const g = game.activeGate;
      if (opts.neverAnswer) { game.closeQuestion(); frames++; continue; }
      if (opts.wrongThenRight) {
        for (let k = 0; k < 3; k++) {
          const r = game.submitAnswer(g.q.kind === 'choice' ? g.q.options.find((o) => o !== g.q.answerText) : '99999');
          if (k === 2) check(r.hint && r.remaining === 0, 'dica deve aparecer na 3ª tentativa errada');
          if (k < 2) check(!r.hint, 'dica não deve aparecer antes da 3ª tentativa');
        }
      }
      const res = game.submitAnswer(Q.answerText(g.q));
      check(res.correct, 'resposta correta recusada');
      log.gates++;
      game.closeQuestion();
      continue;
    }
    game.update(botInput(game, log));
    frames++;
  }
  return { game, frames, log };
}

section('Robô jogando as fases');
MQ.Storage.reset();
for (const id of [1, 2, 3]) {
  const { game, frames, log } = playBot(id, 60 * 600, {});
  const s = game.summary;
  console.log('  fase ' + id + ': estado=' + game.state + ' quadros=' + frames + ' (~' + Math.round(frames / 60) + 's) mortes=' + log.deaths.length + ' [' + log.deaths.join(', ') + '] portões=' + log.gates + ' pontos=' + game.score.points);
  check(game.state === 'levelComplete', 'fase ' + id + ' não foi concluída pelo robô');
  if (s) {
    check(log.gates === game.level.gates.length, 'fase ' + id + ': nem todos os portões abertos');
    check(s.coins > 0, 'fase ' + id + ': nenhuma moeda coletada');
  }
}
check(MQ.Storage.get().unlocked === 3 && MQ.Storage.allCompleted(), 'progresso salvo: 3 fases concluídas');

section('Regras');
{
  MQ.Storage.reset();
  const r = playBot(1, 60 * 600, { wrongThenRight: true });
  check(r.game.state === 'levelComplete', 'fase 1 com erros deve concluir');
  check(r.game.score.wrong === 18, 'erros contados (esperado 18, veio ' + r.game.score.wrong + ')');
  const first = playBot(1, 60 * 600, {});
  check(first.game.score.points > r.game.score.points - 1, 'primeira tentativa não deve pontuar menos');
  console.log('  pontos com acertos de primeira: ' + first.game.score.points + ' | com erros antes: ' + r.game.score.points);

  // portão fechado bloqueia a passagem
  const g = new MQ.Game(1);
  let maxX = 0;
  for (let i = 0; i < 1500; i++) {
    if (g.state === 'question') { g.closeQuestion(); }
    g.update({ left: false, right: true, jump: true, jumpPressed: (i % 50) === 0 });
    maxX = Math.max(maxX, g.player.x + g.player.w);
    if (g.state === 'gameOver') break;
  }
  const gate1 = g.level.gates[0];
  check(maxX <= gate1.x + 0.01, 'jogador atravessou portão fechado (' + maxX + ' > ' + gate1.x + ')');
  console.log('  portão fechado bloqueou o jogador em x=' + Math.round(maxX) + ' (portão em ' + gate1.x + ')');

  // vidas e reinício
  const d = new MQ.Game(1);
  for (let i = 0; i < 3; i++) d._die('teste');
  check(d.state === 'gameOver' && d.lives === 0, 'game over após 3 vidas perdidas');
  check(d.score.points === 0, 'pontuação inicial zerada');
}

console.log(failures === 0 ? '\nTODOS OS TESTES PASSARAM' : '\n' + failures + ' FALHA(S)');
process.exit(failures === 0 ? 0 : 1);
