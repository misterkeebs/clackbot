const { expect } = require('chai');

const FakeMessage = require('../discord/Message');
const { findOrCreateReaction, addReaction } = require('../discord/Reaction');
const VotingProcessor = require('../../src/processors/Voting');
const Voting = require('../../src/processors/Voting');

describe('Voting', async () => {
  describe('configuration', async () => {
    it('sets channels', async () => {
      expect(new Voting('a,b').channels).to.eql(['a', 'b']);
    });

    it('sets channels from environment', async () => {
      process.env.VOTING_CHANNELS = 'x,z';
      expect(new Voting().channels).to.eql(['x', 'z']);
    });

    it('sets exception roles', async () => {
      process.env.VOTING_ALLOW_ROLES = 'mod,others';
      expect(new Voting('a,b').allowedRoles).to.eql(['mod', 'others']);
    });
  });

  describe('adding reactions', async () => {
    let msg, voting;

    beforeEach(async () => {
      msg = new FakeMessage('I am the best', { channelName: 'channel' });
      voting = new VotingProcessor('channel');
      await voting.handle(msg);
    });

    it('adds a reaction to each post', async () => {
      expect(msg._reactions.map(r => r.emoji)).to.eql(['🔼', '🔽']);
    });

    describe('when user had already voted in another option', async () => {
      it('removes the other vote', async () => {
        const user = {
          id: 'userid',
          username: 'username',
        };

        const upReaction = voting.upReaction;
        const downReaction = voting.downReaction;

        addReaction(msg, '🔼', user);
        addReaction(msg, '🔽', user);

        voting.handleReaction(upReaction, user);
        expect(upReaction.count).to.eql(2);

        voting.handleReaction(downReaction, user);
        expect(upReaction.count).to.eql(1);
      });
    });
  });
});
