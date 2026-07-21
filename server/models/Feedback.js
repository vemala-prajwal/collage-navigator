const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: {
    type: String,
    enum: ['location', 'canteenItem', 'faculty'],
    required: true,
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
