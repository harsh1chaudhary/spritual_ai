const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Render the video conference room page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Handle new connections
io.on('connection', socket => {
  console.log('a user connected');

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected');
    
    socket.on('offer', (offer) => {
      socket.to(roomId).broadcast.emit('offer', offer);
    });

    socket.on('answer', (answer) => {
      socket.to(roomId).broadcast.emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate) => {
      socket.to(roomId).broadcast.emit('ice-candidate', candidate);
    });

    socket.on('chat-message', (msg) => {
      socket.to(roomId).broadcast.emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected');
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});