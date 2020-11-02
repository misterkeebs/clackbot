class Bot {
  constructor() {
    this.handlers = {};
    this.interfaces = [];
  }

  registerCommands(handlers) {
    this.handlers = handlers;
  }

  registerInterface(iface) {
    this.interfaces.push(iface);
  }

  async handleMessage(iface, channel, user, message) {
    const command = message.trim().replace(/^!/, '');
    const handler = this.handlers[command];
    if (!handler) return;

    await handler(iface, channel, user, message);
  }

  async start() {
    return Promise.resolve(this.interfaces);
  }
}

module.exports = Bot;
