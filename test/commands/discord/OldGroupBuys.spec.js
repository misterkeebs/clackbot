const moment = require('moment');
const { expect } = require('chai');
const tk = require('timekeeper');

// const gb = require('../../../src/commands/discord/GroupBuys');
// const GroupBuy = require('../../../src/models/GroupBuy');
// const Message = require('../../Message');

xdescribe('GroupBuys', () => {
  const iface = {};

  describe('with no params', async () => {
    let rawMessage;

    beforeEach(async () => {
      tk.freeze(1605576014801);
      await GroupBuy.query().insert({ name: 'GB 1', startsAt: moment().add(-20, 'day'), endsAt: moment().add(-1, 'days') });
      await GroupBuy.query().insert({ name: 'GB 2', startsAt: moment().add(-1, 'day'), endsAt: moment().add(30, 'days') });
      await GroupBuy.query().insert({ name: 'GB 3', startsAt: moment().add(-1, 'day') });
      await GroupBuy.query().insert({ name: 'GB 4', startsAt: moment().add(1, 'day'), endsAt: moment().add(30, 'days') });

      rawMessage = new Message('!gb');
      await gb(iface, { rawMessage });
    });

    afterEach(() => tk.reset());

    it('shows running gbs', async () => {
      expect(rawMessage.channelMessages.length).to.eql(2);
    });

    it('shows GB 2', async () => {
      const [embed] = rawMessage.channelMessages;
      expect(embed.title).to.eql('GB 2');
      expect(embed.fields[0].name).to.eql('Começa');
      expect(embed.fields[0].value).to.eql('15 nov às 22h20');
      expect(embed.fields[1].name).to.eql('Termina');
      expect(embed.fields[1].value).to.eql('16 dez às 22h20');
    });


    it('shows GB 3', async () => {
      const embed = rawMessage.lastChannelMessage;
      expect(embed.title).to.eql('GB 3');
      expect(embed.fields[0].name).to.eql('Começa');
      expect(embed.fields[0].value).to.eql('15 nov às 22h20');
      expect(embed.fields[1]).to.be.undefined;
    });
  });

  describe('modifying an entry', async () => {
    beforeEach(async () => {
      await GroupBuy.query().insert({ name: 'LZ Iron R2', startsAt: moment(), endsAt: moment().add(30, 'days') });
    });

    describe('changing the name', async () => {
      let rawMessage;

      beforeEach(async () => {
        rawMessage = new Message('!gb mod nome LZ Iron R2 para LZ Lagarto');
        await gb(iface, { rawMessage });
      });

      it('replies with a confirmation message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 nome alterado para LZ Lagarto.');
      });

      it('sets the new name', async () => {
        const [newGB] = await GroupBuy.query();
        expect(newGB.name).to.eql('LZ Lagarto');
      });
    });

    describe('changing the start date', async () => {
      let rawMessage;

      beforeEach(async () => {
        rawMessage = new Message('!gb mod início LZ Iron R2 para 15/07 às 14:32');
        await gb(iface, { rawMessage });
      });

      it('replies with a confirmation message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 início alterado para qui, 15 jul 2021 à0 14:32.');
      });

      it('sets the new start date', async () => {
        const [newGB] = await GroupBuy.query();
        expect(newGB.startsAt.toISOString()).to.eql('2021-07-15T17:32:00.000Z');
      });
    });

    describe('changing the end date', async () => {
      let rawMessage;

      beforeEach(async () => {
        rawMessage = new Message('!gb mod fim LZ Iron R2 para 15/07 às 14:32');
        await gb(iface, { rawMessage });
      });

      it('replies with a confirmation message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 fim alterado para qui, 15 jul 2021 à0 14:32.');
      });

      it('sets the new end date', async () => {
        const [newGB] = await GroupBuy.query();
        expect(newGB.endsAt.toISOString()).to.eql('2021-07-15T17:32:00.000Z');
      });
    });

    describe('changing name without enough params', async () => {
      let rawMessage;

      beforeEach(async () => {
        rawMessage = new Message('!gb mod nome LZ Iron R2');
        await gb(iface, { rawMessage });
      });

      it('replies with an error message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 use o comando assim: `!gb mod [nome|início|fim] para <novo valor>`.');
      });
    });

    describe('changing an invalid field', async () => {
      let rawMessage;

      beforeEach(async () => {
        rawMessage = new Message('!gb mod azuca LZ Iron R2 para 15/07 às 14:32');
        await gb(iface, { rawMessage });
      });

      it('replies with an error message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 você só pode alterar os campos nome, início e fim.');
      });
    });
  });

  describe('creating a new entry', async () => {
    describe('with all the information', async () => {
      let rawMessage;
      let groupBuys;
      let groupBuy;

      beforeEach(async () => {
        rawMessage = new Message('!gb add GMK Metaverse de 12/01 as 23:00 até 12/02 às 14:00 http://metaverse.com');
        await gb(iface, { rawMessage });
        groupBuys = await GroupBuy.query();
        [groupBuy] = groupBuys;
      });

      it('replies with a confirmation message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 group buy GMK Metaverse adicionado.');
      });

      it('creates the group buy', async () => {
        expect(groupBuys.length).to.eql(1);
      });

      it('sets the right name', async () => {
        expect(groupBuy.name).to.eql('GMK Metaverse');
      });

      it('sets the right start date', async () => {
        expect(groupBuy.startsAt.toISOString()).to.eql('2021-01-13T02:00:00.000Z');
      });

      it('sets the right end date', async () => {
        expect(groupBuy.endsAt.toISOString()).to.eql('2021-02-12T17:00:00.000Z');
      });

      it('sets the URL', async () => {
        expect(groupBuy.url).to.eql('http://metaverse.com');
      });
    });

    describe('with only the start date', async () => {
      let rawMessage;
      let groupBuys;
      let groupBuy;

      beforeEach(async () => {
        rawMessage = new Message('!gb add GMK Metaverse de 12/01 as 23:00');
        await gb(iface, { rawMessage });
        groupBuys = await GroupBuy.query();
        [groupBuy] = groupBuys;
      });

      it('replies with a confirmation message', async () => {
        expect(rawMessage.lastChannelMessage).to.eql('@user#0001 group buy GMK Metaverse adicionado.');
      });

      it('creates the group buy', async () => {
        expect(groupBuys.length).to.eql(1);
      });

      it('sets the right name', async () => {
        expect(groupBuy.name).to.eql('GMK Metaverse');
      });

      it('sets the right start date', async () => {
        expect(groupBuy.startsAt.toISOString()).to.eql('2021-01-12T03:00:00.000Z');
      });

      it('sets the right end date', async () => {
        expect(groupBuy.endsAt).to.be.null;
      });

      it('sets the creator', async () => {
        expect(groupBuy.createdBy).to.eql('user#0001');
      });
    });

    describe('with only the name', async () => {
      let rawMessage;
      let groupBuys;

      beforeEach(async () => {
        rawMessage = new Message('!gb add GMK Metaverse');
        await gb(iface, { rawMessage });
        groupBuys = await GroupBuy.query();
      });

      it('replies with an error message', async () => {
        expect(rawMessage.lastChannelMessage).to.include('@user#0001 favor incluir ao menos a data de início.');
      });

      it(`doesn't create the group buy`, async () => {
        expect(groupBuys.length).to.eql(0);
      });
    });
  });
});
