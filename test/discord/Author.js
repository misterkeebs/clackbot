class Author {
  constructor(message, { authorID = '399970540586270722', username = 'user', discriminator = '0001' } = {}) {
    this.message = message;
    this.id = authorID;
    this.username = username;
    this.discriminator = discriminator;
    this.roles = {
      cache: [],
    };
  }

  async send(content) {
    this.message.addDirectMessage(content);
    return Promise.resolve();
  }

  toString() {
    return `@${this.username}#${this.discriminator}`;
  }
}

module.exports = Author;
