const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  options: [{ type: String, required: true }],
  password: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }] // Thêm trường này
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);