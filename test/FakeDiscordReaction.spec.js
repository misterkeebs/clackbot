const { expect } = require('chai');
const FakeDiscordMessage = require('./FakeDiscordMessage');
const { FakeDiscordReaction } = require('./FakeDiscordReaction');

describe('FakeDiscordReaction', async () => {
  let msg, reaction;

  beforeEach(async () => {
    msg = new FakeDiscordMessage('msg');
    reaction = new FakeDiscordReaction(msg, 'emoji');
  });

  it('sets initial user', async () => {
    expect(reaction.users.cache).to.eql({});
  });

  it('adds user', async () => {
    const user = { id: 'userid', username: 'username' };
    reaction.addUser(user);
    expect(reaction.users.cache.userid).to.eql(user);
  });

  it('removes user', async () => {
    const user = { id: 'userid', username: 'username' };
    reaction.addUser(user);
    reaction.removeUser(user);
    expect(reaction.users.cache).to.eql({});
  });

  it('counts reactions', async () => {
    expect(reaction.count).to.eql(0);

    const user = { id: 'userid', username: 'username' };
    reaction.addUser(user);

    expect(reaction.count).to.eql(1);
  });
});
