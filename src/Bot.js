const _ = require('lodash');
const { isClass } = require('./Utils');

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
    const [cmdPart] = message.split(' ');
    const command = cmdPart.trim().replace(/^!/, '');
    const handler = this.handlers[command];
    if (!handler) return;
    console.log('handler.interfaces', handler.interfaces);
    if (_.isArray(handler.interfaces) && !handler.interfaces.includes(iface.name)) return;

    if (isClass(handler)) {
      return await new handler({ ...options, iface }).run();
    }
    await handler(iface, options);
  }

  async start() {
    return Promise.resolve(this.interfaces);
  }
}

module.exports = Bot;
