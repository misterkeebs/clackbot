class Bot {
  constructor() {
    this.handlers = {};
    this.interfaces = [];
  }

  registerCommand(command, handler) {
    this.handlers[command] = handler;
  }

  registerInterface(interfaceClass) {
    this.interfaces.push(new interfaceClass(this));
  }

  handleMessage(iface, channel, user, message) {
    const command = message.trim().replace(/^!/, '');
    this.handlers[command](iface, channel, user, message);
  }

  async start() {
    return Promise.all(this.interfaces.map(i => i.startConnection()));
  }
}

module.exports = Bot;
