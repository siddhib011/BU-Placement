const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- Job Routes ---

// @route   /api/jobs/
router.route('/')
  .get(getAllJobs) // Anyone can get all jobs
  .post(protect, admin, createJob); // Only admins can create a job

// @route   /api/jobs/:id
router.route('/:id')
  .get(getJobById) // Anyone can view a single job
  .put(protect, admin, updateJob) // Admin can update
  .delete(protect, admin, deleteJob); // Admin can delete

module.exports = router;