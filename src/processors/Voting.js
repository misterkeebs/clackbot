const _ = require('lodash');
const RestrictedProcessor = require('./RestrictedProcessor');

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

    const isUp = reaction.emoji.name === Voting.UPVOTE;
    const isDown = reaction.emoji.name === Voting.DOWNVOTE;

    if (!isUp && !isDown) return;

    const { message } = reaction;
    if (message.partial) await message.fetch();

    const targetReaction = message.reactions.cache.get(isUp ? Voting.DOWNVOTE : Voting.UPVOTE);
    await targetReaction.users.fetch();

    if (!targetReaction) return;
    const found = targetReaction.users.resolve(user.id);
    if (found) await targetReaction.users.remove(user);

    // await message.channel.messages.fetch();
    // const otherLikedMessages = await message.channel.messages.cache.filter(async m => {
    //   const reactions = await m.reactions.cache.filter(async r => {
    //     await r.users.fetch();
    //     const found = await r.users.resolve(user.id);
    //     console.log('found', found);
    //     return found;
    //   });
    //   console.log('reactions', reactions);
    // });

    // console.log('otherLikedMessages', otherLikedMessages);
  }
}

Voting.UPVOTE = '🔼';
Voting.DOWNVOTE = '🔽';

module.exports = Voting;
