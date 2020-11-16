const dedent = require('dedent');

class BuySellProcessor {
  constructor(channel) {
    this.channel = channel || process.env.BUYSELL_CHANNEL || 'buy-sell-trade';
  }

  async handle(msg) {
    if (!msg.channel || msg.channel.name !== this.channel) return false;

    const content = msg.content.trim();
    const contents = content.split('\n');

    const error = this.process(contents[0]);
    if (error) {
      return this.send(msg, error);
    }

    if (contents.length > 1) {
      const error = contents.map(c => this.process(c, null)).find(err => !!err);
      if (error) {
        return this.send(msg, error);
      }
    }

    return true;
  }

  process(content, fallback=this.fullError()) {
    if (content.startsWith('WTS')) {
      return this.checkWTS(content);
    }
    if (content.startsWith('WTB')) {
      return null;
    }
    if (content.startsWith('WTT')) {
      return null;
    }
    return fallback;
  }

  checkWTS(content) {
    const MONEY_RE = /(BRL|R\$|EUR|USD)(\s*)(\d+)/;
    if (!content.match(MONEY_RE)) {
      return `Para vender alguma coisa, é necessário informar o preço ao final da mensagem, em R$, USD ou EUR. Por favor, edite sua mensagem e inclua o preço pelo qual quer vender.`;
    }
  }

  async send(msg, error) {
    const text = dedent`
      Opa, tudo bem? Você enviou uma mensagem para o canal **#${this.channel}** que não
      obedece ao formato aceito:
    `;

    const moreInfo = `**Mais detalhes**: https://discord.com/channels/412393574898860032/440344266322083861/718958391535468564`;

    const reply = `${text.split('\n').map(s => s.trim()).join(' ')}\n\n> ${msg.content}\n\n${error}\n\n${moreInfo}`;
    await msg.author.send(reply);
    return true;
  }

  fullError() {
    return dedent`
      Pedimos que vc edite ou apague sua mensagem e use o formato explicado abaixo. Caso precise de ajuda adicional, fale com um dos nossos moderadores. Obrigado!

      **__Caso você queira vender algo__**

      Use: \`WTS <O que você quer vender> <preço>\`

      **WTS** Significa _want to sell_ ou quero vender

      Coloque em seguida **o item que quer vender** e logo em seguida, o **preço pelo qual deseja vender**.
      O preço deve ser especificado em R$ (reais), USD (dólares americanos) ou EUR (euros).

      **IMPORTANTE** É altamente indicado que você poste também uma foto do produto que quer vender

      **__Caso você queira comprar algo__**

      Use: \`WTB <O que você quer comprar>\`

      Logo depois do WTB descreva o item que quer comprar

      **WTB** Significa _want to buy_ ou quero comprar

      **__Caso você queira fazer uma troca__**

      Use \`WTT <O que você quer trocar>\`
      Ou \`WTT <O que você quer trocar> WTTF <Pelo que vc deseja trocar>\`

      **WTT** Significa _want to trade_ ou quero trocar
      **WTTF** Significa _want to trade for_ ou quero trocar por

      **IMPORTANTE** É altamente indicado que você poste também uma foto do produto que quer trocar

      **__EXEMPLOS__**

      \`\`\`
      WTS GMK GondoGod por R$1450
      WTS Tutu Artisan USD110
      WTB Switch Films
      WTT Demon 65% WTTF Angel 60%
      \`\`\`
    `;
  }
}

module.exports = BuySellProcessor;
