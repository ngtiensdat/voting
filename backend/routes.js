const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Room = require('./models/Room');
const Option = require('./models/Option');
const Vote = require('./models/Vote');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await User.create({ username, passwordHash });
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Username already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', userId: user._id });
});

router.post('/create-room', async (req, res) => {
  const { roomCode, password, options } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const room = await Room.create({ code: roomCode, passwordHash });
  const optionDocs = options.map(text => ({ roomId: room._id, text }));
  await Option.insertMany(optionDocs);
  res.json({ message: 'Room created' });
});

router.post('/join-room', async (req, res) => {
  const { roomCode, password } = req.body;
  const room = await Room.findOne({ code: roomCode });
  if (!room || !(await bcrypt.compare(password, room.passwordHash))) {
    return res.status(400).json({ message: 'Invalid room or password' });
  }
  const options = await Option.find({ roomId: room._id });
  res.json({ message: 'Joined room', options: options.map(o => o.text) });
});

router.post('/vote', async (req, res) => {
  const { roomCode, option, userId } = req.body;
  const room = await Room.findOne({ code: roomCode });
  const optionDoc = await Option.findOne({ roomId: room._id, text: option });
  if (!optionDoc) return res.status(400).json({ message: 'Option not found' });

  const existingVote = await Vote.findOne({ roomId: room._id, userId });
  if (existingVote) return res.status(400).json({ message: 'Already voted' });

  await Vote.create({ roomId: room._id, userId, optionId: optionDoc._id });
  res.json({ message: 'Vote submitted' });
});

module.exports = router;
