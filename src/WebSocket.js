const socketIO = require('socket.io');

module.exports = server => {
  const io = socketIO(server);
  io.on('connection', socket => {
    console.log('Client connected', socket);
  });

  return io;
};
