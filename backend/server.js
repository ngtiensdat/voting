const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const http = require('http');                 
const { Server } = require('socket.io');      

const app = express();
const server = http.createServer(app);        
const io = new Server(server, {               
  cors: {
    origin: '*'
  }
});

const PORT = 3001;
app.use(cors());
app.use(express.json());

const DB_FILE = './data.json';
let db = { users: [], rooms: [] };
if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

const findRoom = code => db.rooms.find(r => r.roomCode === code);

// ⚡ Sự kiện kết nối WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (roomCode) => {
    socket.join(roomCode);
    console.log(`Socket ${socket.id} joined room ${roomCode}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 🚨 Cập nhật endpoint /vote để phát sóng kết quả
app.post('/vote', (req, res) => {
  const { roomCode, option } = req.body;
  const room = findRoom(roomCode);
  if (!room) return res.status(400).json({ message: 'Room not found' });
  if (!room.votes[option]) room.votes[option] = 0;
  room.votes[option]++;
  saveDB();

  // Gửi kết quả mới tới tất cả client trong room
  io.to(roomCode).emit('vote-updated', room.votes);

  res.json({ message: 'Vote recorded' });
});

// ✅ Start server HTTP+Socket
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
