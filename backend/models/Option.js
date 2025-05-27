const mongoose = require('mongoose');
const OptionSchema = new mongoose.Schema({
  roomId: mongoose.Types.ObjectId,
  text: String
});
module.exports = mongoose.model('Option', OptionSchema);
