const Action = require('./Action');

const INITIAL_STATE = 0;
const WAITING_NUM_ITEMS = 1;

class BuySellAction extends Action {
  get name() { return 'buySell'; }

  async handle() {
    if (this.currentState === INITIAL_STATE) {
      this.reply('Quantos itens vc quer vender? (De 1 a 6)');
      return true;
    }

    if (this.currentState === WAITING_NUM_ITEMS) {
      const numItems = parseInt(this.content, 10);
      if (numItems < 1 || numItems > 6) {
        this.reply('Você deve digitar apenas um dígito de 1 a 6. Quantos itens vc quer vender?');
        return false;
      }

      return true;
    }

    return true;
  }
}

module.exports = BuySellAction;
