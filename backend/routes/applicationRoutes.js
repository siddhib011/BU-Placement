const express = require('express');
const router = express.Router();

// Import controller
const {
  getMyApplications,
  applyToJob,
  getApplicationsForJob,
  getAllApplications,
} = require('../controllers/applicationController');

// Import middleware
const { protect, admin, placementCell } = require('../middleware/authMiddleware');

// @desc    Get all applications in the system (for Placement Cell)
// @route   GET /api/applications/
router.route('/').get(protect, placementCell, getAllApplications);

// @desc    Get all applications for the logged-in student
// @route   GET /api/applications/my-applications
router.route('/my-applications').get(protect, getMyApplications);

// @desc    Apply to a job
// @route   POST /api/applications/job/:jobId/apply
router.route('/job/:jobId/apply').post(protect, applyToJob); // 'protect' allows any logged-in user

// @desc    Get all applications for a specific job (for admins/recruiters)
// @route   GET /api/applications/job/:jobId
router.route('/job/:jobId').get(protect, admin, getApplicationsForJob);

module.exports = router;