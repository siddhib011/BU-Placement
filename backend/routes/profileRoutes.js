const express = require('express');
const router = express.Router();

// Import controller
const {
  getMyProfile,
  createOrUpdateProfile,
  getAllProfiles,
} = require('../controllers/profileController');

// Import middleware
const { protect, placementCell } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // For file uploads

// @route   POST /api/profile (Student creates/updates their profile)
// @route   GET  /api/profile (Placement Cell gets ALL profiles)
router
  .route('/')
  .post(protect, upload, createOrUpdateProfile)
  .get(protect, placementCell, getAllProfiles);

// @route   GET /api/profile/me (Student gets their own profile)
router.route('/me').get(protect, getMyProfile);

module.exports = router;