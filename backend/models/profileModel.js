const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  // --- ADD THESE NEW FIELDS ---
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'], // Only allows these values
  },
  // --- END OF NEW FIELDS ---
  email: {
    type: String,
    required: true,
  },
  resumeURL: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  gpa: {
    type: Number,
  },
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;