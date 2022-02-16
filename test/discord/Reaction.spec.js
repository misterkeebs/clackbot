const { expect } = require('chai');
const Message = require('./Message');
const { Reaction } = require('./Reaction');

describe('Reaction', async () => {
  let msg, reaction;

  beforeEach(async () => {
    msg = new Message('msg');
    reaction = new Reaction(msg, 'emoji');
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
