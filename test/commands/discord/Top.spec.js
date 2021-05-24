const { expect } = require('chai');

const FakeInterface = require('../FakeInterface');
const iface = new FakeInterface();

const top = require('../../../src/commands/discord/Top');
const User = require('../../../src/models/User');

xdescribe('Top', async () => {
  beforeEach(async () => {
    await User.query().insert({ displayName: 'user1', bonus: 20 });
    await User.query().insert({ displayName: 'user2', bonus: 100 });
    await User.query().insert({ displayName: 'user3', bonus: 30 });
    await User.query().insert({ displayName: 'user4', bonus: 2 });

    await top(iface, {
      channel: 'channel',
      user: 'user',
      message: 'top',
    });
  });

  it('shows a leaderboard', async () => {
    expect(iface.lastMessage).to.eql('blah');
  });
});
