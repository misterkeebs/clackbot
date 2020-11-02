const tmi = require('tmi.js');

const options = {
  options: {
    debug: true,
  },
  connection: {
    cluster: 'aws',
    reconnect: true,
  },
  identity: {
    username: 'Digitoid',
    password: 'oauth:8bob5vd1qgknxjgnp7vvggr9iep02b',
  },
  channels: ['srteclados']
};

const client = new tmi.client(options);
client.connect();
client.on('connected', (address, port) => {
  client.action('srteclados', 'Olá, Digitoid está conectado!');
});
client.on('chat', (channel, user, message, self) => {
  if (message == '!pegar') {
    console.log('user', user);
    let pontos = 5;
    if (user.subscriber) {
      pontos = 10;
    }
    client.action('srteclados', `${user['display-name']} você pegou ${pontos} pontos!`)
  }
})
