const mongoose = require('mongoose');
const VoteSchema = new mongoose.Schema({
  roomId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  optionId: mongoose.Types.ObjectId,
  votedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Vote', VoteSchema);
