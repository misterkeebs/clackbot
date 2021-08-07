const Action = require('./Action');

const INITIAL_STATE = 0;
const WAITING_NUM_ITEMS = 1;
const WAITING_ITEM_INFO = 2;

class BuySellAction extends Action {
  get name() { return 'buySell'; }

  handleItem() {
    if (this.data.currentItem > 0) {
      this.data.items.push({ title: this.content });
    } else {
      this.data.items = [];
    }
    this.reply(`Qual o título do item ${this.data.currentItem + 1}?`);
    this.data.currentItem++;
    return true;
  }

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

      this.data.numItems = numItems;
      this.data.currentItem = 0;

      return this.handleItem();
    }

    if (this.currentState === WAITING_ITEM_INFO) {
      return this.handleItem();
    }

    return true;
  }
}

module.exports = BuySellAction;
