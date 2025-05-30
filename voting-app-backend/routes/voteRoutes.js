const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(403);
  }
};

// Vote trong phòng — KHÔNG kiểm tra mật khẩu
router.post('/:roomId', auth, async (req, res) => {
  const { option } = req.body;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

    const existingVote = await Vote.findOne({ roomId, userId: req.userId });
    if (existingVote) return res.status(400).json({ message: 'Bạn đã vote trong phòng này' });

    const vote = new Vote({
      roomId,
      userId: req.userId,
      option,
    });

    await vote.save();
    res.status(201).json({ message: 'Vote thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xem kết quả
router.get('/results/:roomId', auth, async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

    const votes = await Vote.find({ roomId });
    const results = {};
    room.options.forEach(option => (results[option] = 0));
    votes.forEach(vote => results[vote.option] = (results[vote.option] || 0) + 1);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
