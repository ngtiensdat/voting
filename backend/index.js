const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', routes);

mongoose.connect('mongodb://localhost:27017/voting-app')
  .then(() => {
    app.listen(3001, () => console.log('Server running on http://localhost:3001'));
  })
  .catch(err => console.error('MongoDB connection error:', err));
