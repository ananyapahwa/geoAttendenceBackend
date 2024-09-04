const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
  companyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
  }
});

LocationSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('Location', LocationSchema);
