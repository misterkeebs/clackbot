const fetch = require('node-fetch');
const _ = require('lodash');

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function send(path, body) {
  const url = `${process.env.API_SERVER}/${path}`;
  // eslint-disable-next-line no-console
  console.log('Sending', url, body);
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function isModOnTwitch(twitchUserData) {
  return _.get(twitchUserData, 'mod') || _.get(twitchUserData, 'badges.broadcaster') === '1';
}

module.exports = {
  randomInt,
  send,
  isModOnTwitch,
};
