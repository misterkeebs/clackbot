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

  getCommand(command) {
    return this.handlers[command];
  }

  async handleMessage(iface, options) {
    const { message } = options;
    const [ cmdPart ] = message.split(' ');
    const command = cmdPart.trim().replace(/^!/, '');
    const handler = this.handlers[command];
    if (!handler) return;

    await handler(iface, options);
  }

  async start() {
    return Promise.resolve(this.interfaces);
  }
}

module.exports = Bot;
