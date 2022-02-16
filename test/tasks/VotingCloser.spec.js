const { expect } = require('chai');

const VotingCloser = require('../../src/tasks/VotingCloser');
const { Discord, Message } = require('../discord');

describe('VotingCloser', async () => {
  const discord = new Discord(['canal']);

  describe('pickWinner', async () => {
    let task = [];

    beforeEach(async () => {
      task = new VotingCloser(discord);
      discord.reset();
    });

    describe('with no entries', async () => {
      beforeEach(async () => await task.pickWinner('canal'));
      it('informs no winner', async () => {
        const messages = discord.getChannelMessages();
        expect(messages[0].content).to.include('Infelizmente');
      });

      it(`doesn't inform the winner`, async () => {
        const messages = discord.getChannelMessages();
        expect(messages[0].content).to.not.include('Banner do servidor atualizado');
      });

      it(`doesn't include a runner-up`, async () => {
        const messages = discord.getChannelMessages();
        expect(messages[0].content).to.not.include('Em segundo lugar');
      });

    });

    describe('with one entry', async () => {
      beforeEach(async () => {
        const msg = await discord.sendMessage('canal', 'My board', ['one']);
        msg.react('🔼');
        msg.react('🔽');
        await task.pickWinner('canal');
      });

      it('includes the winner', async () => {
        const message = discord.getLastMessage();
        expect(message.content).to.include('Banner do servidor atualizado para a foto enviada por <@399970540586270722> com 1 upvotes.');
      });

      it(`doesn't include a runner-up`, async () => {
        const message = discord.getLastMessage();
        expect(message.content).to.not.include('Em segundo lugar');
      });
    });

    describe('with two entries', async () => {
      beforeEach(async () => {
        const msg1 = await discord.sendMessage('canal', 'My board', ['one']);
        msg1.react('🔼');
        msg1.react('🔽');

        const msg2 = await discord.sendMessage('canal', 'Other board', ['one']);
        msg2.react('🔼');
        msg2.react('🔽');

        await task.pickWinner('canal');
      });

      it('includes the winner', async () => {
        const message = discord.getLastMessage();
        expect(message.content).to.include('Banner do servidor atualizado para a foto enviada por <@399970540586270722> com 1 upvotes.');
      });

      it('includes a runner-up', async () => {
        const message = discord.getLastMessage();
        expect(message.content).to.include('Em segundo lugar');
      });
    });
  });
});
