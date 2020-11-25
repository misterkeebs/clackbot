const User = require('../models/User');

const BONUS_ON_WPM = process.env.BONUS_ON_WPM || 5;

class Guesses {
  constructor() {
    this.bonus = BONUS_ON_WPM;
    this.reset();
  }

  reset() {
    this.tracking = false;
    this.guesses = {};
  }

  start() {
    this.tracking = true;
  }

  end() {
    this.reset();
  }

  add(user, guess) {
    this.guesses[user] = guess;
  }

  getWinner(actual) {
    const keys = Object.keys(this.guesses);
    const winner = keys.reduce((winner, player) => {
      const curDif = actual - this.guesses[winner];
      const curDifAbs = Math.abs(curDif);
      const dif = actual - this.guesses[player];
      const difAbs = Math.abs(dif);

      if (difAbs < curDifAbs) {
        return player;
      }

      if (difAbs === curDifAbs && dif > curDif) {
        return player;
      }

      return winner;
    }, keys[0]);
    return winner;
  }

  async pickWinner(iface, channel, actual) {
    const winner = this.getWinner(parseInt(actual, 10));
    if (!winner) {
      return await iface.send(channel, `forever alone! Não houve nenhuma estimativa.`);
    }
    const user = await User.addBonus(winner, this.bonus);
    await iface.send(channel, `typing test terminado com ${actual} WPM. Quem ganhou foi ${winner} com ${this.guesses[winner]}! Parabéns, vc ganhou ${this.bonus} clacks e agora tem um total de ${user.bonus}!`);
    this.end();
  }
}

class Singleton {
  constructor() {
    throw new Error(`Can't instantiate Singleton`);
  }

  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Guesses();
    }
    return Singleton.instance;
  }
}

module.exports = Singleton;
