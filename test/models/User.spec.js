const { expect } = require('chai');
const moment = require('moment');

const AlreadyRedeemedError = require('../../src/models/AlreadyRedeemedError');
const User = require('../../src/models/User');

describe('daily', async () => {
  describe('when user never claimed a daily before', async () => {
    let user;

    beforeEach(async () => {
      user = await User.query().insert({ displayName: 'user' });
    });

    it('allows user to claim', async () => {
      const { sols, bonus } = await user.daily();
      expect(sols).to.be.above(0);
      expect(sols).to.be.below(7);
      expect(bonus).to.be.above(-1);
      expect(bonus).to.be.below(6);
    });

    it('sets the last daily field', async () => {
      const { sols, bonus } = await user.daily();
      const newUser = await User.query().where('display_name', 'user').first();
      expect(newUser.lastDailyAt).to.not.be.undefined;
    });
  });

  describe('when user has claimed in less than 22 hours ago', async () => {
    let user, nextSlot;

    beforeEach(async () => {
      const lastDailyAt = moment().subtract(21, 'hours');
      nextSlot = moment(lastDailyAt).add(22, 'hours');
      user = await User.query().insert({ displayName: 'user', lastDailyAt });
    });

    it('raises an error with the next slot', async () => {
      try {
        await user.daily();
        expect.fail('No expection thrown');
      } catch (err) {
        if (err instanceof AlreadyRedeemedError) {
          expect(err.nextSlot).to.eql(nextSlot);
          return;
        }
        throw err;
      }
    });
  });

  describe('when user claimed in more than 22 hours ago', async () => {
    let user;

    beforeEach(async () => {
      const lastDailyAt = moment().subtract(23, 'hours');
      user = await User.query().insert({ displayName: 'user', lastDailyAt });
    });

    it('allows user to claim', async () => {
      const { sols, bonus } = await user.daily();
      expect(sols).to.be.above(0);
      expect(sols).to.be.below(6);
      expect(bonus).to.be.above(-1);
      expect(bonus).to.be.below(5);
    });
  });
});

describe('find', async () => {
  describe('with the twitch handle', async () => {
    it('returns the user', async () => {
      await User.query().insert({ displayName: 'user' });
      const user = await User.find('user');
      expect(user).to.exist;
      expect(user.displayName).to.eql('user');
    });
  });

  describe('with the discord mention', async () => {
    it('returns the user', async () => {
      await User.query().insert({ displayName: 'user', discordId: '312260311144595457' });
      const user = await User.find('<@!312260311144595457>');
      expect(user).to.exist;
      expect(user.displayName).to.eql('user');
    });
  });
});

describe('leaders', async () => {
  describe('with regular users', async () => {
    let leaders;

    beforeEach(async () => {
      await User.query().insert({ displayName: 'user1', discordWannabe: 'user1#0001', bonus: 100 });
      await User.query().insert({ displayName: 'userx', bonus: 21100 });
      await User.query().insert({ displayName: 'usery' });
      await User.query().insert({ displayName: 'user2', discordWannabe: 'user2#0001', bonus: 1 });
      await User.query().insert({ displayName: 'user3', discordWannabe: 'user3#0001', bonus: 10 });
      await User.query().insert({ displayName: 'user4', discordWannabe: 'user4#0001', bonus: 1000 });
      await User.query().insert({ displayName: 'user5', discordWannabe: 'user5#0001', bonus: 101 });
      await User.query().insert({ displayName: 'user6', discordWannabe: 'user6#0001', bonus: 101, sols: 10 });

      leaders = await User.leaders();
    });

    it('shows leaders by bonus in descending order', async () => {
      expect(leaders.map(u => u.displayName)).to.eql(['user4', 'user6', 'user5', 'user1', 'user3', 'user2']);
    });

    it('excludes users with no Discord integration', async () => {
      expect(leaders).to.not.include('userx');
    });
  });
});
