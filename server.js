const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const ROOM = 'general';

let activeUsers = 0;
let lockedIn = 0;

app.use(express.static('public')); // put your HTML/CSS/JS files in a /public folder

// io.to(ROOM).emit('message', data);  // To send a message 
const messageHistory = []; // stores last 50 messages
const MAX_HISTORY = 50;

  // ...existing code...
io.on('connection', (socket) => {
  socket.isLockedIn = false;

  activeUsers++;
  io.emit('update-counts', { activeUsers, lockedIn });

  console.log('User connected:', socket.id);

  socket.join(ROOM);

  // Receive and broadcast messages
  socket.on('send-message', (data) => {  // Received from main
    messageHistory.push(data);
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory.shift(); // remove oldest message
    }
    io.to(ROOM).emit('message', data);  // Sent to main
  });

  // send message history to the newly connected user
  socket.emit('message-history', messageHistory);

  // Client tells server they locked in
  socket.on('lock-in', () => {
    socket.isLockedIn = true;
    lockedIn++;
    io.emit('update-counts', { activeUsers, lockedIn });
  });

  // Client tells server they stopped their session
  socket.on('stop-session', () => {
    socket.isLockedIn = false;
    lockedIn = Math.max(0, lockedIn - 1); // Make sure it doesn't go below 0
    io.emit('update-counts', { activeUsers, lockedIn });
  });

  // User has disconnected
  socket.on('disconnect', () => {
    setTimeout(() => {
      activeUsers = Math.max(0, activeUsers - 1);
      if (socket.isLockedIn) lockedIn = Math.max(0, lockedIn - 1); // If user is lockedin decrease lockedin value too
      io.emit('update-counts', { activeUsers, lockedIn });
    }, 1500);
  });
});

server.listen(3000, () => console.log('Running on http://localhost:3000'));