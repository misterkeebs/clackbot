const express = require('express');

require('express-async-errors');
const server = express();

const morgan = require('morgan');
const cors = require('cors');

server.use(cors());
server.use(morgan('dev'));
server.use(express.json());
server.use(express.static('public'));

server.post('/start-session', (req, res) => {
  console.log('sending', req.body);
  server.io.emit('start-session', req.body);
  res.json({ ok: true });
});

server.get('/end-session', (req, res) => {
  server.io.emit('end-session', req.body);
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