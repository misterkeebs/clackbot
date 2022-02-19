const tk = require('timekeeper');
const nock = require('nock');
const moment = require('moment-timezone');
const { expect } = require('chai');

const Setting = require('../../src/models/Setting');
const VotingCloser = require('../../src/tasks/VotingCloser');
const { Discord, Message } = require('../discord');
const Voting = require('../../src/processors/Voting');
const { addReaction } = require('../discord/Reaction');

describe('VotingCloser', async () => {
  let notionData;
  const notion = {
    pages: {
      create: data => notionData = data,
    }
  };
  const discord = new Discord(['canal']);

  describe('pickWinner', async () => {
    let task = [];

    beforeEach(async () => {
      tk.freeze(moment.tz('2022-02-14 10:00', 'America/Sao_Paulo').toDate());
      task = new VotingCloser(discord, notion);
      discord.reset();
    });
    afterEach(() => tk.reset());

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

      it('sets the last draw message id', async () => {
        const announceMsg = discord.getChannelMessages().find(m => m.content.includes('Incentivamos'));
        expect(await Setting.get(`voting-last-draw-canal`)).to.eql(announceMsg.id);
      });

      it('sets the initial cycle', async () => {
        expect(await Setting.get(`votingcycle-canal`)).to.eql('2');
      });
    });

    describe('with one entry', async () => {
      beforeEach(async () => {
        const msg = await discord.sendMessage('canal', 'My board', [{ url: 'urlToPicture' }]);
        addReaction(msg, Voting.UPVOTE, { id: 'user1' });
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

      it('sends the winner to Notion Hall of Fame', async () => {
        expect(notionData.cover.external.url).to.eql('urlToPicture');
      });

      it('sets the banner', async () => {
        const message = discord.getLastMessage();
        expect(message.channel.guild.banner).to.eql('urlToPicture');
      });
    });

    describe('with multiple lines on submission', async () => {
      beforeEach(async () => {
        const msg = await discord.sendMessage('canal', 'Board Name\nSpecs', [{ url: 'urlToPicture' }]);
        addReaction(msg, Voting.UPVOTE, { id: 'user1' });
        await task.pickWinner('canal');
      });

      it('sets the board name on the Notion Hall of Fame entry', async () => {
        expect(notionData.properties.Keyboard.multi_select[0].name).to.eql('Board Name');
      });

      it(`sets the board specs on the Notion Hall of Fame entry's body`, async () => {
        expect(notionData.children[0].paragraph.text[0].text.content).to.eql('Specs');
      });
    });

    describe('with two entries', async () => {
      beforeEach(async () => {
        const msg1 = await discord.sendMessage('canal', 'My board', [{ url: 'winnerPic' }]);
        msg1.react(Voting.UPVOTE);
        msg1.react(Voting.DOWNVOTE);

        const msg2 = await discord.sendMessage('canal', 'Other board', [{ url: 'runnerUpPic' }]);
        msg2.react(Voting.UPVOTE);
        msg2.react(Voting.DOWNVOTE);

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

      it('sends the winner to Notion Hall of Fame', async () => {
        expect(notionData.cover.external.url).to.eql('winnerPic');
      });

      it('sets the banner', async () => {
        const message = discord.getLastMessage();
        expect(message.channel.guild.banner).to.eql('winnerPic');
      });
    });
  });
});
