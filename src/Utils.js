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

function isTwitchMod(twitchUserData) {
  return _.get(twitchUserData, 'mod') || _.get(twitchUserData, 'badges.broadcaster') === '1';
}

function isTwitchSub(twitchUserData) {
  return _.get(twitchUserData, 'subscriber') || !!_.get(twitchUserData, 'badges.founder');
}

function hasDiscordRole(msg, role) {
  return msg.member.roles.cache.find(r => r.name === role);
}

function hasAnyDiscordRole(msg, roles) {
  return msg.member.roles.cache.find(r => roles.includes(r.name));
}

module.exports = {
  randomInt,
  send,
  isTwitchMod,
  isTwitchSub,
  hasDiscordRole,
  hasAnyDiscordRole,
};
