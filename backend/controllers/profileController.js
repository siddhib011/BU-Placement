const Profile = require('../models/profileModel');

// getMyProfile function stays exactly the same...
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).populate(
      'user',
      'username'
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// @desc    Create or update a user profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  // 1. Get new text fields from req.body
  const { name, email, skills, gpa, age, gender } = req.body;

  // 2. Get the file path from req.file
  const resumeURL = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

  if (!resumeURL) {
    const existingProfile = await Profile.findOne({ user: req.user._id });
    if (!existingProfile || !existingProfile.resumeURL) {
      return res.status(400).json({ message: 'Resume file is required' });
    }
  }

  // 3. Build the profile object
  const profileFields = {
    user: req.user._id,
    name,
    email,
    skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
    gpa,
    age, // <-- ADDED
    gender, // <-- ADDED
  };
  
  if (req.file) {
      profileFields.resumeURL = resumeURL;
  }

  try {
    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true }
      );
      return res.status(200).json(profile);
    }

    // Create
    profile = await Profile.create(profileFields);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// ... (you already have getMyProfile and createOrUpdateProfile)

// --- ADD THIS NEW FUNCTION ---
// @desc    Get all profiles (for Placement Cell)
// @route   GET /api/profile
// @access  Private/PlacementCell
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', 'username');
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

// --- UPDATE YOUR EXPORTS ---
module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  getAllProfiles, // <-- ADD THIS
};
