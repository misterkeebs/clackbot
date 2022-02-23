const _ = require('lodash');
const Promise = require('bluebird');

const RestrictedProcessor = require('./RestrictedProcessor');
const Setting = require('../models/Setting');

class Voting extends RestrictedProcessor {
  constructor(channels) {
    super('VOTING', channels);
  }

  async process(msg) {
    await msg.react(Voting.UPVOTE);
    await msg.react(Voting.DOWNVOTE);
  }

  async handleReaction(reaction, user) {
    if (user.id === process.env.DISCORD_CLIENT_ID) return;

    console.log('Handling reaction from', user.username, '=>', reaction.emoji.name);

    const isUp = reaction.emoji.name === Voting.UPVOTE;
    const isDown = reaction.emoji.name === Voting.DOWNVOTE;

    if (!isUp && !isDown) return;

    const { message } = reaction;
    if (message.partial) await message.fetch();

    const targetReaction = message.reactions.cache.get(isUp ? Voting.DOWNVOTE : Voting.UPVOTE);
    console.log('  targetReaction', _.get(targetReaction, 'emoji.name', 'null'));
    if (!targetReaction) return;
    await targetReaction.users.fetch();

    const found = targetReaction.users.resolve(user.id);
    console.log('  found reaction for user', _.get(found, 'username', 'null'));
    if (found) await targetReaction.users.remove(user);

    if (isUp) {
      // checks if user have already voted for this cycle
      const cycle = await Setting.get(`votingcycle-${message.channel.name}`, '1');
      console.log('  checking for other reactions for cycle', cycle);
      const key = `vote-${message.channel.name}-${cycle}-${user.id}`;
      const id = await Setting.get(key);
      console.log('  got with id', id, '=', message.id);
      if (id && message.id !== id) {
        // removes previous vote
        const prevMessage = await message.channel.messages.cache.get(id);
        console.log('   previous message is', _.get(prevMessage, 'content', 'null'));
        const prevReaction = await prevMessage.reactions.cache.get(Voting.UPVOTE);
        console.log('   previous reaction is', _.get(prevReaction, 'emoji.name', 'null'), 'removing...');
        await prevReaction.users.remove(user);
      }

      // saves the new vote
      await Setting.set(key, message.id);
    }
  }
}

Voting.UPVOTE = '⬆️';
Voting.DOWNVOTE = '⬇️';
Voting.UPVOTES = ['⬆️', '⬆', '🔼'];
Voting.DOWNVOTES = ['⬇️', '⬇', '🔽'];
Voting.isUpVote = reaction => Voting.UPVOTES.includes(_.get(reaction, 'emoji.name'));
Voting.isDownVote = reaction => Voting.DOWNVOTES.includes(_.get(reaction, 'emoji.name'));
Voting.count = emojis => msg => emojis.reduce((acc, emoji) => acc + _.get(msg.reactions.cache.get(emoji), 'count', 0), 0);
Voting.countUp = Voting.count(Voting.UPVOTES);
Voting.countDown = Voting.count(Voting.DOWNVOTES);

module.exports = Voting;
