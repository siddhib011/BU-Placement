const Job = require('../models/jobModel');

// @desc    Fetch all jobs
// @route   GET /api/jobs
// @access  Public
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).populate('user', 'username'); // Show who posted it
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Get a single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = async (req, res) => {
  try {
    const { title, company, description, salary } = req.body;

    const job = new Job({
      title,
      company,
      description,
      salary,
      user: req.user._id, // Attach the logged-in admin's ID
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Optional: Check if the admin is the one who created the job
    if (job.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // returns the updated document
    });
    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // --- AUTHORIZATION CHECK ---
    // Allow deletion if:
    // 1. The user is an admin AND they posted the job
    // OR
    // 2. The user is a placementcell member
    const isAdminOwner = req.user.role === 'admin' && job.user.toString() === req.user._id.toString();
    const isTPO = req.user.role === 'placementcell';

    if (!isAdminOwner && !isTPO) {
        console.log(`[deleteJob] Unauthorized attempt by user ${req.user._id} (role: ${req.user.role})`);
        return res.status(401).json({ message: 'Not authorized to delete this job' });
    }
    // --- END AUTHORIZATION CHECK ---

    await job.deleteOne();
    console.log(`[deleteJob] Job ${req.params.id} deleted by user ${req.user._id}`);
    res.status(200).json({ message: 'Job removed' });
  } catch (error) {
    console.error('[deleteJob] Controller Error:', error);
    res.status(500).json({ message: `Server Error deleting job: ${error.message}` });
  }
};

// ... (existing imports and functions)

// @desc    Get jobs posted by the logged-in admin/recruiter
// @route   GET /api/jobs/myjobs
// @access  Private/Admin
const getMyJobs = async (req, res) => {
  try {
    // Find jobs where the 'user' field matches the logged-in user's ID
    const jobs = await Job.find({ user: req.user._id });
    res.status(200).json(jobs);
  } catch (error) {
    console.error('[getMyJobs] Error:', error);
    res.status(500).json({ message: `Server Error fetching admin jobs: ${error.message}` });
  }
};

// --- Add getMyJobs to module.exports ---
module.exports = {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs, // <-- ADD THIS
};
