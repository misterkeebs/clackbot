class Bot {
  constructor() {
    this.handlers = {};
    this.interfaces = [];
  }

  registerCommand(command, handler) {
    this.handlers[command] = handler;
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
