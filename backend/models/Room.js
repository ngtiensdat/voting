const mongoose = require('mongoose');
const RoomSchema = new mongoose.Schema({
  code: { type: String, unique: true },
  passwordHash: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Room', RoomSchema);
