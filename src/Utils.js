const fetch = require('node-fetch');
const _ = require('lodash');

function isClass(x) {
  return x.toString().includes('class ');
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weighedRandom(values) {
  const rnd = randomInt(0, 100);
  if (rnd <= 50) return values[0];
  if (rnd <= 75) return values[1];
  if (rnd <= 88) return values[2];
  if (rnd <= 94) return values[3];
  if (rnd <= 98) return values[4];
  return values[5];
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
  if (!roles) return false;
  return msg.member.roles.cache.find(r => roles.includes(r.name));
}

function plural(target, count, plural = 's') {
  return count === 1 ? target : target + plural;
}

module.exports = {
  plural,
  isClass,
  randomInt,
  weighedRandom,
  send,
  isTwitchMod,
  isTwitchSub,
  hasDiscordRole,
  hasAnyDiscordRole,
};
