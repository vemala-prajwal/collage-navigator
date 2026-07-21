const mongoose = require('mongoose');

const canteenItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'limited', 'soldOut'],
    default: 'available',
  },
  category: { type: String, required: true, trim: true },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CanteenItem', canteenItemSchema);
