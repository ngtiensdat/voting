const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Room = require('../models/Room');

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

// Tạo phòng vote
router.post('/', auth, async (req, res) => {
  const { title, options } = req.body;
  try {
    const room = new Room({
      title,
      options,
      createdBy: req.userId
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách các phòng vote
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().populate('createdBy', 'username');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết 1 phòng vote
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
