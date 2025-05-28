const express = require('express');
const router = express.Router();
const Vote = require('../models/Vote');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');

// Middleware kiểm tra token (bạn đã có sẵn)
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

// Route tạo phòng vote - phải đăng nhập
router.post('/rooms', auth, async (req, res) => {
  const { title, options } = req.body;

  if (!title || !options || options.length < 2) {
    return res.status(400).json({ message: 'Thiếu tiêu đề hoặc ít nhất 2 lựa chọn' });
  }

  try {
    // Mỗi option lưu dưới dạng chuỗi, bạn có thể thêm trường votes nếu muốn
    const room = new Room({ title, options });
    await room.save();

    res.status(201).json(room);
  } catch (err) {
    console.error('Lỗi tạo phòng:', err);
    res.status(500).json({ message: 'Tạo phòng thất bại', error: err.message });
  }
});

// Các route vote và xem kết quả bạn đã có

// Vote trong phòng
router.post('/:roomId', auth, async (req, res) => {
  const { option } = req.body;
  const roomId = req.params.roomId;

  try {
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

// Xem kết quả vote của 1 phòng
router.get('/results/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const votes = await Vote.find({ roomId });
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });

    const results = {};
    room.options.forEach(option => (results[option] = 0));
    votes.forEach(vote => results[vote.option] = (results[vote.option] || 0) + 1);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
