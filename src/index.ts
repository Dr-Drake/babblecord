import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import { spawn } from 'child_process';
import { MessageData } from './types/MessageData';

// List of users
const users = new Set<string>();
let messages: MessageData[] = [];
const notifications = new Set<string>();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    }
});

app.set('view engine', 'ejs');
app.set('views', __dirname +'/views');

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
    res.render('index.ejs');
});

io.on('connection', (socket: Socket) => {
  console.log(`${socket.id} connected`);

  // Update chat history
  socket.emit('chatHistory', messages);

  socket.on('join', (username: string) => {
    socket.join('chatroom');
    socket.data.username = username;

    if (users.has(username)) {
      socket.emit("duplicate");
      io.to('chatroom').emit('updateUserList', Array.from(users));
    }
    else{
      // Add the username to the Set of users
      users.add(username);
      io.to('chatroom').emit('userJoined', username);
      io.to('chatroom').emit('updateUserList', Array.from(users));

      if (!notifications.has(`👤 ${username} has joined the chatroom`)) {
        messages.push({
          username, message: `👤 ${username} has joined the chatroom`,
          time: new Date().toLocaleTimeString(),
          type: 'notification'
        });
      }
    }

  });

  socket.on('message', (data: MessageData) => {
    io.to('chatroom').emit('chatMessage', data);
    messages.push(data);
  });

  socket.on('userLeaving', () => {
    console.log(`${socket.data.username} is leaving...`);
    users.delete(socket.data.username);
    io.to('chatroom').emit('userDisconnect', socket.data.username);
    io.to('chatroom').emit('updateUserList', Array.from(users));

    if (!notifications.has(`👤 ${socket.data.username} has left the chatroom`)) {
      messages.push({
        username: socket.data.username, 
        message: `👤 ${socket.data.username} has left the chatroom`,
        time: new Date().toLocaleTimeString(),
        type: 'notification'
      })
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.data.username} disconnected`);
    users.delete(socket.data.username);
    io.to('chatroom').emit('userDisconnect', socket.data.username);
    io.to('chatroom').emit('updateUserList', Array.from(users));

    if (!notifications.has(`👤 ${socket.data.username} has left the chatroom`)) {
      messages.push({
        username: socket.data.username, 
        message: `👤 ${socket.data.username} has left the chatroom`,
        time: new Date().toLocaleTimeString(),
        type: 'notification'
      })
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');

  // Timer to check if messages are greater than a threshold
  setInterval(()=>{
    if (messages.length >= 100) {
      console.log("Refreshing chat room")
      notifications.clear();
      messages = [];
      io.to('chatroom').emit('chatRefreshed', messages);
    }
  },60000 * 120) // Every 2 hours
  

  if (process.env.NODE_ENV === 'development') {
    // Start watching for CSS changes
    console.log("Watching tailwind...")
    spawn('yarn', ['watch-css'])
  }
});
