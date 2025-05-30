const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Room = require('../models/Room');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.sendStatus(401);
  }
};

router.post('/', auth, async (req, res) => {
  let { title, options, password } = req.body;
  if (!title || !options || options.length < 3 || !password) {
    return res.status(400).json({ message: 'Thiếu tiêu đề, mật khẩu hoặc ít nhất 3 lựa chọn' });
  }
  title = title.trim().toLowerCase();
  try {
    // Kiểm tra trùng lặp trước khi tạo
    const existingRoom = await Room.findOne({ title });
    if (existingRoom) {
      return res.status(400).json({ message: 'Tiêu đề phòng đã tồn tại, vui lòng chọn tiêu đề khác' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const room = new Room({
      title,
      options,
      password: hashedPassword,
      createdBy: req.userId,
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    console.error('Lỗi tạo phòng:', err);
    if (err.code === 11000 && err.keyPattern?.title) {
      return res.status(400).json({ message: 'Tiêu đề phòng đã tồn tại, vui lòng chọn tiêu đề khác' });
    }
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.post('/join', auth, async (req, res) => {
  let { title, password } = req.body;
  title = title.trim().toLowerCase();
  try {
    const room = await Room.findOne({ title }).populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Phòng không tồn tại' });
    const isMatch = await bcrypt.compare(password, room.password);
    if (!isMatch) return res.status(401).json({ message: 'Mật khẩu không đúng' });

    // Log để debug
    console.log('User ID (req.userId):', req.userId);
    console.log('Participants trước khi thêm:', room.participants);

    // Thêm người dùng vào danh sách participants nếu chưa có
    if (!room.participants.some(participant => participant.toString() === req.userId)) {
      room.participants.push(req.userId);
      await room.save();
      console.log('Participants sau khi thêm:', room.participants);
    } else {
      console.log('Người dùng đã có trong participants');
    }

    res.json(room);
  } catch (err) {
    console.error('Lỗi tham gia phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ createdBy: req.userId }).populate('createdBy', 'username');
    res.json(rooms);
  } catch (err) {
    console.error('Lỗi lấy danh sách phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('createdBy', 'username');
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng' });

    // Log để debug
    console.log('User ID (req.userId):', req.userId);
    console.log('Room Creator:', room.createdBy.toString());
    console.log('Participants:', room.participants);

    // Kiểm tra nếu người dùng là người tạo hoặc nằm trong danh sách participants
    const isCreator = room.createdBy.toString() === req.userId;
    const isParticipant = room.participants.some(participant => participant.toString() === req.userId);
    console.log('Is Creator:', isCreator);
    console.log('Is Participant:', isParticipant);

    if (!isCreator && !isParticipant) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập phòng này' });
    }

    res.json(room);
  } catch (err) {
    console.error('Lỗi lấy phòng:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;