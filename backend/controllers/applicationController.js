const Application = require('../models/applicationModel');
const Job = require('../models/jobModel');
const Profile = require('../models/profileModel');
const User = require('../models/userModel'); // Needed for user lookups

// --- FUNCTION DEFINITION: Apply to Job (Moved to top) ---
// @desc    Apply to a job
// @route   POST /api/applications/job/:jobId/apply
// @access  Private
const applyToJob = async (req, res) => {
  const jobId = req.params.jobId; 
  const studentId = req.user._id; 

  try {
    // 1. Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // 2. Check if student has a profile (required for resume URL)
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
      resumeURL: profile.resumeURL, // Get resume URL from profile
      coverLetter: req.body.coverLetter || '', // Get cover letter from request
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('[applyToJob] Error:', error);
    res.status(500).json({ message: `Server Error applying to job: ${error.message}` });
  }
};
// --- END applyToJob ---


// @desc    Get all applications for a specific job (for admins/recruiters)
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
const getApplicationsForJob = async (req, res) => {
  const jobId = req.params.jobId;

  try {
    // Fetch applications and populate basic User details
    const applications = await Application.find({ job: jobId })
      .populate('student', 'email'); 

    // Fetch the full Profile data for all applicants in one go
    const studentIds = applications.map(app => app.student._id);
    const profiles = await Profile.find({ user: { $in: studentIds } });

    // Map the profile data back into the application objects
    const applicationsWithProfiles = applications.map(app => {
      const profile = profiles.find(p => p.user.equals(app.student._id));
      
      return {
        ...app.toObject(),
        applicantProfile: profile ? {
          name: profile.name,
          enrollmentNumber: profile.enrollmentNumber,
          age: profile.age,
          gender: profile.gender,
          resumeURL: profile.resumeURL 
        } : null,
      };
    });

    res.status(200).json(applicationsWithProfiles);

  } catch (error) {
    console.error('[getApplicationsForJob] Error:', error);
    res.status(500).json({ message: `Server Error fetching applications: ${error.message}` });
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
      'title company'
    );
    res.status(200).json(applications);
  } catch (error) {
    console.error('[getMyApplications] Error:', error);
    res.status(500).json({ message: `Server Error fetching user applications: ${error.message}` });
  }
};

// @desc    Get all applications in the system (for Placement Cell)
// @route   GET /api/applications
// @access  Private/PlacementCell
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('student', 'email')
      .populate('job', 'title company');
      
    res.status(200).json(applications);
  } catch (error) {
    console.error('[getAllApplications] Error:', error);
    res.status(500).json({ message: `Server Error fetching all applications: ${error.message}` });
  }
};

// --- EXPORT ALL FUNCTIONS (Now that they are all defined above) ---
module.exports = {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  getAllApplications,
};