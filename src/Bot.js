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

  handleMessage(iface, channel, user, message) {
    const command = message.trim().replace(/^!/, '');
    this.handlers[command](iface, channel, user, message);
  }

  async start() {
    return Promise.resolve(this.interfaces);
  }
}

module.exports = Bot;
