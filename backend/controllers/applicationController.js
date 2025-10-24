const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const Profile = require('../models/profileModel');

// @desc    Apply to a job
// @route   POST /api/applications/job/:jobId/apply
// @access  Private
const applyToJob = async (req, res) => {
  const jobId = req.params.jobId; // Get the job ID from the URL
  const studentId = req.user._id; // Get the logged-in student's ID

  try {
    // 1. Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 2. Check if student has a profile
    const profile = await Profile.findOne({ user: studentId });
    if (!profile) {
      return res
        .status(400)
        .json({ message: 'You must create a profile before applying' });
    }

    // 3. Check if the student has already applied
    const alreadyApplied = await Application.findOne({
      job: jobId,
      student: studentId,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ message: 'You have already applied for this job' });
    }

    // 4. Create the new application using profile data
    const application = await Application.create({
      job: jobId,
      student: studentId,
      resumeURL: profile.resumeURL, // Get resume from profile
      coverLetter: req.body.coverLetter || '', // Get cover letter from request
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all applications for a specific job (for admins/recruiters)
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getApplicationsForJob = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    // Find all applications for this job and populate student details
    const applications = await Application.find({ job: jobId }).populate(
      'student',
      'username' // Only show the student's username
    );

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all applications for the logged-in student
// @route   GET /api/applications/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      student: req.user._id,
    }).populate(
      'job',
      'title company' // Show the job title and company
    );
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get all applications in the system (for Placement Cell)
// @route   GET /api/applications
// @access  Private/PlacementCell
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('student', 'username')
      .populate('job', 'title company');
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  getAllApplications,
};