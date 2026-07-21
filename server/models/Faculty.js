const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  cabinLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  timetable: { type: String, default: '' },
});

module.exports = mongoose.model('Faculty', facultySchema);
