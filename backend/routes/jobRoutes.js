const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');
// Import all necessary middleware
const { protect, admin, placementCell } = require('../middleware/authMiddleware'); // <-- Import placementCell

// --- Job Routes ---

// GET /api/jobs/myjobs (Admin gets their jobs)
router.route('/myjobs').get(protect, admin, getMyJobs);

// GET /api/jobs/ (Public get all)
// POST /api/jobs/ (Admin creates)
router.route('/')
  .get(getAllJobs)
  .post(protect, admin, createJob);

// GET /api/jobs/:id (Public get one)
// PUT /api/jobs/:id (Admin updates - controller should check ownership)
// DELETE /api/jobs/:id (Admin OR TPO deletes)
router.route('/:id')
  .get(getJobById)
  .put(protect, admin, updateJob) // Keep this admin only (or add ownership check)
  // --- CHANGE IS HERE ---
  // Allow EITHER admin OR placementCell to delete.
  // We need a custom middleware or adjust the controller logic slightly.
  // For simplicity, let's create a quick check here or adjust the controller.
  // Easiest: Let 'protect' run, then let controller decide based on role/ownership.
  // OR: Modify the deleteJob controller to allow TPO. Let's do that.
  .delete(protect, deleteJob); // Remove role check here, handle in controller

module.exports = router;