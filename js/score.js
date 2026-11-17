/* score.js - sistema de pontuação de uma partida */
(function (MQ) {
  var VALUES = {
    COIN: 10,        // cada moeda vale 10 pontos
    CORRECT: 50,     // resposta correta
    FIRST_TRY: 25,   // bônus por acertar de primeira
    STOMP: 20,       // pular em cima de um inimigo
    LIFE_BONUS: 100  // bônus por vida restante ao fim da fase
  };

  function Score() {
    this.points = 0;
    this.coins = 0;
    this.correct = 0;
    this.wrong = 0;
    this.stomps = 0;
  }

  Score.VALUES = VALUES;

  Score.prototype.addCoin = function () {
    this.coins++;
    this.points += VALUES.COIN;
    return VALUES.COIN;
  };

  Score.prototype.addCorrect = function (firstTry) {
    this.correct++;
    var gained = VALUES.CORRECT + (firstTry ? VALUES.FIRST_TRY : 0);
    this.points += gained;
    return gained;
  };

  Score.prototype.addWrong = function () {
    this.wrong++;
  };

  Score.prototype.addStomp = function () {
    this.stomps++;
    this.points += VALUES.STOMP;
    return VALUES.STOMP;
  };

  Score.prototype.addLifeBonus = function (lives) {
    var bonus = Math.max(0, lives) * VALUES.LIFE_BONUS;
    this.points += bonus;
    return bonus;
  };

  MQ.Score = Score;
})(globalThis.MQ = globalThis.MQ || {});
