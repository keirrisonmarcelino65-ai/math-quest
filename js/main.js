/* main.js - ponto de entrada: telas, menus, janela de perguntas e laço principal do jogo */
(function (MQ) {
  var STEP = 1000 / 60;
  var SCREENS = ['menu', 'levels', 'help', 'question', 'pause', 'win', 'lose'];

  var $ = function (id) { return document.getElementById(id); };
  var stage = $('stage');
  var renderer = new MQ.Renderer($('game'));

  var game = null;          // partida atual
  var mode = 'menu';        // menu | playing
  var current = 'menu';     // tela visível
  var demo = null;          // cenário animado do menu
  var acc = 0, last = 0, clock = 0;
  var qLocked = false, qTimer = null;

  // ---------- telas ----------
  function showScreen(id) {
    SCREENS.forEach(function (s) { $(s).classList.toggle('active', s === id); });
    current = id;
  }

  function refreshSoundButtons() {
    var label = 'Som: ' + (MQ.Audio.isMuted() ? 'desligado' : 'ligado');
    $('btn-sound').textContent = label;
    $('pause-sound').textContent = label;
  }

  function toggleSound() {
    var muted = !MQ.Audio.isMuted();
    MQ.Audio.setMuted(muted);
    MQ.Storage.setMuted(muted);
    refreshSoundButtons();
  }

  function toMenu() {
    clearTimeout(qTimer);
    qLocked = false;
    mode = 'menu';
    game = null;
    $('menu-total').textContent = MQ.Storage.totalBest();
    showScreen('menu');
  }

  function showLevels() {
    var box = $('level-cards');
    box.innerHTML = '';
    for (var id = 1; id <= MQ.Levels.COUNT; id++) {
      (function (id) {
        var def = MQ.Levels.def(id);
        var unlocked = MQ.Storage.isUnlocked(id);
        var data = MQ.Storage.get();
        var card = document.createElement('button');
        card.className = 'card' + (unlocked ? '' : ' locked');
        card.disabled = !unlocked;
        card.innerHTML =
          '<span class="num">' + id + '</span>' +
          '<span class="name">' + def.name + '</span>' +
          '<span class="topic">' + def.topic + '</span>' +
          '<span class="diff">Dificuldade: ' + def.difficulty + '</span>' +
          '<span class="' + (unlocked ? 'best' : 'state') + '">' +
          (unlocked ? 'Recorde: ' + MQ.Storage.bestScore(id) + (data.completed[id] ? ' (concluída)' : '') : 'Bloqueada - conclua a fase anterior') +
          '</span>';
        if (unlocked) card.addEventListener('click', function () { startLevel(id); });
        box.appendChild(card);
      })(id);
    }
    showScreen('levels');
  }

  // ---------- partida ----------
  function startLevel(id) {
    clearTimeout(qTimer);
    qLocked = false;
    game = new MQ.Game(id);
    game.onEvent = onEvent;
    mode = 'playing';
    acc = 0;
    MQ.Input.clear();
    showScreen(null);
  }

  function onEvent(name, data) {
    if (name === 'jump' || name === 'coin' || name === 'stomp' || name === 'checkpoint' || name === 'correct' || name === 'wrong' || name === 'death') {
      MQ.Audio.play(name);
    } else if (name === 'question') {
      MQ.Audio.play('question');
      openQuestion(data);
    } else if (name === 'gameOver') {
      MQ.Audio.play('lose');
      setTimeout(showLose, 900);
    } else if (name === 'levelComplete') {
      MQ.Audio.play('win');
      setTimeout(function () { showWin(data); }, 700);
    }
  }

  // ---------- janela de pergunta ----------
  function feedback(text, kind) {
    var el = $('q-feedback');
    el.textContent = text;
    el.className = 'q-feedback ' + (kind || '');
  }

  function updateAttempts(gate) {
    $('q-attempts').textContent = 'Erros: ' + gate.attempts + ' (dica após ' + MQ.Game.MAX_ATTEMPTS + ')';
  }

  function showHint(gate) {
    var el = $('q-hint');
    if (gate.hintShown) {
      el.textContent = 'Dica: ' + gate.q.hint;
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }

  function openQuestion(gate) {
    MQ.Input.clear();
    var q = gate.q;
    $('q-title').textContent = 'Portão ' + (gate.id + 1) + ' de ' + game.level.gates.length;
    var text = $('q-text');
    text.textContent = q.text;
    text.className = 'q-text' + (q.text.length > 52 ? ' long' : '');
    feedback('', '');
    updateAttempts(gate);
    showHint(gate);

    var options = $('q-options');
    var form = $('q-form');
    options.innerHTML = '';
    if (q.kind === 'choice') {
      form.style.display = 'none';
      options.style.display = 'flex';
      q.options.forEach(function (opt) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn';
        b.textContent = opt;
        b.addEventListener('click', function () { submit(opt); });
        options.appendChild(b);
      });
    } else {
      options.style.display = 'none';
      form.style.display = 'flex';
      $('q-input').value = '';
      $('q-input').placeholder = q.kind === 'fraction' ? 'ex.: 3/4' : 'Sua resposta';
    }
    showScreen('question');
    setTimeout(function () {
      if (q.kind !== 'choice') $('q-input').focus();
    }, 60);
  }

  function submit(raw) {
    if (qLocked || !game || game.state !== 'question') return;
    var res = game.submitAnswer(raw);
    var gate = game.activeGate;
    if (!res.valid) {
      feedback(res.message, 'bad');
      return;
    }
    if (res.correct) {
      qLocked = true;
      feedback('Correto! +' + res.gained + ' pontos' + (res.firstTry ? ' (de primeira!)' : ''), 'ok');
      qTimer = setTimeout(function () {
        qLocked = false;
        if (game) game.closeQuestion();
        showScreen(null);
        MQ.Input.clear();
      }, 1100);
      return;
    }
    feedback(res.message || 'Ainda não. Tente de novo!', 'bad');
    updateAttempts(gate);
    showHint(gate);
    if (gate.q.kind !== 'choice') {
      $('q-input').value = '';
      $('q-input').focus();
    }
  }

  // ---------- resultados ----------
  function row(label, value, cls) {
    return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><td>' + label + '</td><td>' + value + '</td></tr>';
  }

  function showWin(s) {
    var def = MQ.Levels.def(s.levelId);
    $('win-title').textContent = s.isFinal ? 'Você venceu o Math Quest!' : 'Fase concluída!';
    $('win-sub').textContent = s.isFinal
      ? 'Parabéns! Você dominou as três fases.'
      : def.name + ' completa! Próxima: ' + MQ.Levels.def(s.levelId + 1).name;
    var html = row('Moedas coletadas', s.coins) +
      row('Respostas certas', s.correct) +
      row('Respostas erradas', s.wrong) +
      row('Vidas restantes', s.lives + ' (+' + s.lifeBonus + ')') +
      row('Pontuação da fase', s.points + (s.record ? '<span class="badge">RECORDE</span>' : ''), 'total');
    if (s.isFinal) html += row('Pontuação total (recordes)', MQ.Storage.totalBest(), 'total');
    $('win-stats').innerHTML = html;
    $('win-next').style.display = s.isFinal ? 'none' : 'block';
    showScreen('win');
  }

  function showLose() {
    if (!game) return;
    var s = game.score;
    $('lose-stats').innerHTML =
      row('Moedas coletadas', s.coins) +
      row('Respostas certas', s.correct) +
      row('Pontos', s.points, 'total');
    showScreen('lose');
  }

  // ---------- pausa ----------
  function onPauseKey() {
    if (mode === 'menu') {
      if (current === 'levels' || current === 'help') toMenu();
      return;
    }
    if (!game) return;
    if (game.state === 'playing') {
      game.pause();
      MQ.Input.clear();
      showScreen('pause');
    } else if (game.state === 'paused') {
      game.resume();
      showScreen(null);
    } else if (game.state === 'question' && !qLocked) {
      game.closeQuestion();
      showScreen(null);
    }
  }

  // ---------- menu animado ----------
  function makeDemo() {
    demo = new MQ.Game(1);
    var L = demo.level;
    for (var y = 0; y < L.h; y++) {
      for (var x = 0; x < L.w; x++) {
        var ground = y >= L.groundRow;
        L.tiles[y][x] = ground ? '#' : '.';
        L.solid[y][x] = ground;
      }
    }
    L.spikes = []; L.gates = []; L.enemies = []; L.checkpoints = []; L.coins = [];
    L.goal.x = -9999;
    demo.player.anim = 'walk';
    demo.player.facing = 1;
  }

  // ---------- laço principal ----------
  function frame(ts) {
    requestAnimationFrame(frame);
    if (!last) last = ts;
    var dt = Math.min(100, ts - last);
    last = ts;
    clock += dt / STEP;

    if (mode === 'playing' && game) {
      acc += dt;
      var steps = 0;
      while (acc >= STEP && steps < 5) {
        game.update(MQ.Input.poll());
        acc -= STEP;
        steps++;
      }
      if (steps === 5) acc = 0;
      renderer.draw(game, clock);
    } else {
      demo.camera.x = (clock * 0.7) % 3200;
      demo.player.x = demo.camera.x + 140;
      demo.player.y = demo.level.groundRow * 32 - demo.player.h;
      demo.player.animTime = clock;
      renderer.draw(demo, clock, true);
    }
  }

  function fit() {
    var s = Math.min(window.innerWidth / 976, window.innerHeight / 560);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }

  function init() {
    MQ.Storage.load();
    MQ.Audio.setMuted(MQ.Storage.get().muted);
    refreshSoundButtons();
    MQ.Input.attach();
    MQ.Input.on('pause', onPauseKey);
    MQ.Input.on('mute', toggleSound);
    makeDemo();

    document.addEventListener('click', function (e) {
      MQ.Audio.unlock();
      if (e.target.classList && e.target.classList.contains('btn')) MQ.Audio.play('click');
    });

    $('btn-play').addEventListener('click', function () {
      var data = MQ.Storage.get();
      startLevel(MQ.Storage.allCompleted() ? 1 : Math.min(data.unlocked, MQ.Levels.COUNT));
    });
    $('btn-levels').addEventListener('click', showLevels);
    $('btn-help').addEventListener('click', function () { showScreen('help'); });
    $('btn-sound').addEventListener('click', toggleSound);
    $('levels-back').addEventListener('click', toMenu);
    $('help-back').addEventListener('click', toMenu);

    $('q-form').addEventListener('submit', function (e) {
      e.preventDefault();
      submit($('q-input').value);
    });
    $('q-close').addEventListener('click', onPauseKey);

    $('pause-resume').addEventListener('click', onPauseKey);
    $('pause-restart').addEventListener('click', function () { startLevel(game.levelId); });
    $('pause-sound').addEventListener('click', toggleSound);
    $('pause-menu').addEventListener('click', toMenu);

    $('win-next').addEventListener('click', function () { startLevel(game.levelId + 1); });
    $('win-again').addEventListener('click', function () { startLevel(game.levelId); });
    $('win-menu').addEventListener('click', toMenu);
    $('lose-restart').addEventListener('click', function () { startLevel(game.levelId); });
    $('lose-menu').addEventListener('click', toMenu);

    window.addEventListener('resize', fit);
    fit();
    toMenu();
    requestAnimationFrame(frame);
  }

  // gancho usado pelos testes de navegador
  MQ.app = { startLevel: startLevel, getGame: function () { return game; }, submit: submit };

  init();
})(globalThis.MQ = globalThis.MQ || {});
