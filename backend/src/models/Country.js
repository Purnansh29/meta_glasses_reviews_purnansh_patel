const mongoose = require('mongoose');

const CountrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a country name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a country code'],
    unique: true,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Country', CountrySchema);
