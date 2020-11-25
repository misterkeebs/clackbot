const express = require('express');

require('express-async-errors');
const server = express();

const morgan = require('morgan');
const cors = require('cors');

const Guesses = require('./commands/Guesses');
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
