const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  options: [{ type: String, required: true }]
});

module.exports = mongoose.model('Room', roomSchema);
