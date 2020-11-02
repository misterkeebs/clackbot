const fetch = require('node-fetch');
const qs = require('querystring');

class TwitchApi {
  async request(url, method, params) {
    const options = { method };
    if (this.accessToken) {
      options.headers = {
        'Client-Id': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${this.accessToken}`,
      };
    }
    return fetch(`${url}?${qs.stringify(params)}`, options);
  }

  async doPost(url, params) {
    return this.request(url, 'POST', params);
  }

  async doGet(url, params) {
    return this.request(url, 'GET', params);
  }

  async getToken() {
    if (this.accessToken) return;
    const res = await this.doPost('https://id.twitch.tv/oauth2/token', {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_SECRET,
      grant_type: 'client_credentials',
    });
    const json = await res.json();
    this.accessToken = json.access_token;
  }

  async get(path, params) {
    await this.getToken();
    const res = await this.doGet(`https://api.twitch.tv/helix/${path}`, params);
    return await res.json();
  }

  async getCurrentStream(channel) {
    const res = await this.get('streams', { user_login: channel });
    const { data } = res;
    if (!data.length) return false;

    return data.find(d => d.user_name.toLowerCase() === channel.toLowerCase());
  }
}

module.exports = TwitchApi;
