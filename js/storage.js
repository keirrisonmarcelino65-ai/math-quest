/* storage.js - salva progresso e pontuação no LocalStorage */
(function (MQ) {
  var KEY = 'mathquest.save.v1';
  var TOTAL_LEVELS = 3;

  function defaults() {
    return {
      unlocked: 1,
      best: { 1: 0, 2: 0, 3: 0 },
      completed: { 1: false, 2: false, 3: false },
      muted: false
    };
  }

  var data = defaults();

  function store() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (e) {
      return null;
    }
  }

  function load() {
    data = defaults();
    var s = store();
    if (!s) return data;
    try {
      var raw = s.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        data.unlocked = Math.min(TOTAL_LEVELS, Math.max(1, saved.unlocked | 0));
        data.muted = !!saved.muted;
        for (var i = 1; i <= TOTAL_LEVELS; i++) {
          data.best[i] = Math.max(0, (saved.best && saved.best[i]) | 0);
          data.completed[i] = !!(saved.completed && saved.completed[i]);
        }
      }
    } catch (e) {
      data = defaults();
    }
    return data;
  }

  function save() {
    var s = store();
    if (!s) return;
    try {
      s.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* sem espaço ou bloqueado: o jogo continua sem salvar */
    }
  }

  MQ.Storage = {
    TOTAL_LEVELS: TOTAL_LEVELS,
    load: load,
    save: save,
    get: function () { return data; },
    isUnlocked: function (id) { return id <= data.unlocked; },
    bestScore: function (id) { return data.best[id] || 0; },
    totalBest: function () {
      var t = 0;
      for (var i = 1; i <= TOTAL_LEVELS; i++) t += data.best[i] || 0;
      return t;
    },
    allCompleted: function () {
      for (var i = 1; i <= TOTAL_LEVELS; i++) if (!data.completed[i]) return false;
      return true;
    },
    // registra a conclusão de uma fase; devolve true se bateu o recorde
    completeLevel: function (id, score) {
      var record = score > (data.best[id] || 0);
      if (record) data.best[id] = score;
      data.completed[id] = true;
      data.unlocked = Math.max(data.unlocked, Math.min(id + 1, TOTAL_LEVELS));
      save();
      return record;
    },
    setMuted: function (m) { data.muted = !!m; save(); },
    reset: function () { data = defaults(); save(); }
  };
})(globalThis.MQ = globalThis.MQ || {});
