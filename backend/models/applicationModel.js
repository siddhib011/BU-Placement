const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job', // Links to the Job
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Links to the Student (User)
    },
    // We'll add portfolio fields here
    resumeURL: {
      type: String,
      required: true, // For now, we'll just make a resume link required
    },
    coverLetter: {
      type: String, // A short cover letter
    },
    status: {
      type: String,
      enum: ['Applied', 'Viewed', 'Rejected'],
      default: 'Applied',
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;