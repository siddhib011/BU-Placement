const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { // Link to the User model (which has the email)
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  // --- ADD Enrollment Number ---
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true, // Assuming enrollment number should be unique
  },
  // --- END ---
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
  },
  // --- REMOVED EMAIL --- (We'll get it from the linked User)
  // email: {
  //   type: String,
  //   required: true,
  // },
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
  // Add timestamps if you want them for the profile itself
  // timestamps: true,
});

const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;