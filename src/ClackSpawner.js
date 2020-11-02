/* eslint-disable no-console */
const moment = require('moment');

const TwitchInterface = require('./interfaces/TwitchInterface');
const TwitchApi = require('./TwitchApi');

const channelName = process.env.TWITCH_CHANNEL;
const twitch = new TwitchApi();

class ClackSpawner {
  constructor() {
    this.twitchInterface = new TwitchInterface();
  }

  async notify() {
    this.twitchInterface.send(channelName, 'Atenção, vocês têm 10 minutos para pegar clacks com o comando !pegar');
  }

  async spawn() {
    const channel = await twitch.getCurrentStream(channelName);

    if (!channel) {
      this.nextSpawn = null;
      return;
    }

    if (this.nextSpawn && moment(this.nextSpawn).isAfter(moment())) {
      await this.notify();
      this.nextSpawn = null;
    }

    if (!this.nextSpwan) {
      const min = parseInt(process.env.SPAWN_MIN, 10);
      const max = parseInt(process.env.SPAWN_MAX, 10);
      const mins = Math.floor(Math.random() * (max - min + 1)) + min;
      this.nextSpawn = moment().add(mins, 'm');
    }
  }
}

module.exports = ClackSpawner;
