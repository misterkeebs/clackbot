const express = require('express');
const moment = require('moment');

require('express-async-errors');
const server = express();

const morgan = require('morgan');
const cors = require('cors');

const Guesses = require('./commands/Guesses');
const Setting = require('./models/Setting');
const guesses = Guesses.getInstance();

server.use(cors());
server.use(morgan('dev'));
server.use(express.json());
server.use(express.static('public'));

server.post('/overlay', (req, res) => {
  server.io.emit('overlay', req.body);
  res.json({ ok: true });
});

server.post('/timer', (req, res) => {
  server.io.emit('timer', req.body);
  res.json({ ok: true });
});

server.post('/startRaffle', (req, res) => {
  server.io.emit('startRaffle', req.body);
  res.json({ ok: true });
});

server.get('/mistakes', async (req, res) => {
  // FIXME: extract a Mistake class that abstracts how to retrieve
  //        total and today's mistakes
  const today = `mistakes-${moment().format('YYYYMMDD')}`;
  const mistakes = parseInt(await Setting.get('mistakes', '0'), 10);
  const sessionMistakes = parseInt(await Setting.get(today, '0'), 10);
  res.json({ mistakes, sessionMistakes });
});

server.post('/newMistake', (req, res) => {
  server.io.emit('newMistake', req.body);
  res.json({ ok: true });
});

server.get('/finishWpm', async (req, res) => {
  const { wpm } = req.query;
  const iface = { send: (channel, msg) => server.twitchClient.action(channel, msg) };
  await guesses.pickWinner(iface, process.env.TWITCH_CHANNEL, wpm);
  res.json({ ok: true });
});

server.use(express.static('public'));

server.use((error, req, res, next) => {
  if (error) {
    // eslint-disable-next-line no-console
    console.error('Error', error);
    res.status(500).json({ error });
  }
  next();
});

module.exports = server;
