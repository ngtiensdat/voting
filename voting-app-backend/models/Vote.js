const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  option: { type: String, required: true }
});

module.exports = mongoose.model('Vote', voteSchema);
