const _ = require('lodash');

class Reaction {
  constructor(message, emoji) {
    this.id = 'rid' + performance.now();
    this.message = message;
    this.emoji = {
      name: emoji
    };
    this.users = {
      cache: {},
      resolve: id => {
        return this.users.cache[id];
      },
      remove: user => {
        delete this.users.cache[user.id];
        return Promise.resolve(user);
      }
    };
    this.users.fetch = _ => this.users;
    this.users.resolve = id => this.users.cache[id];
    this.message._reactions.push(this);
  }

  addUser(user) {
    this.users.cache[user.id] = user;
  }

  removeUser(user) {
    delete this.users.cache[user.id];
  }

  dump() {
    return `${this.emoji} - [${_.values(this.users.cache).map(u => u.username).join(', ')}]`;
  }

  get count() {
    return _.keys(this.users.cache).length;
  }
}

function findReaction(message, emoji) {
  return message._reactions.find(r => r.emoji.name === emoji);
}

function findOrCreateReaction(message, emoji) {
  return findReaction(message, emoji) || new Reaction(message, emoji);
}

function addReaction(message, emoji, user) {
  const reaction = findOrCreateReaction(message, emoji);
  reaction.addUser(user);
  return reaction;
}

function removeReaction(message, emoji, user) {
  const reaction = findReaction(message, emoji);
  if (reaction) {
    reaction.removeUser(user);
  }
}

module.exports = {
  Reaction,
  findReaction,
  findOrCreateReaction,
  addReaction,
};
