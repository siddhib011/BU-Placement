const express = require('express');
const router = express.Router();
const { getSkills } = require('../controllers/skillsController');

// @route   GET /api/skills
router.route('/').get(getSkills);

module.exports = router;