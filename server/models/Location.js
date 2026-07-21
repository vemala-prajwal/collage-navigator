const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['classroom', 'lab', 'faculty', 'canteen', 'washroom', 'other'],
    required: true,
  },
  building: { type: String, required: true, trim: true },
  floor: { type: Number, required: true },
  coordinates: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  description: { type: String, default: '' },
  images: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
