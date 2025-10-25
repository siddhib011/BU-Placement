const Profile = require('../models/profileModel');
const User = require('../models/userModel'); // Import User model to populate email

// @desc    Get the logged-in user's profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    // Populate user details including email
    const profile = await Profile.findOne({ user: req.user._id })
                                 .populate('user', 'email'); // Populate email from User model

    if (!profile) {
      // If profile not found, still send back the user's email for pre-filling form
       const user = await User.findById(req.user._id).select('email');
       if (user) {
            return res.status(404).json({ message: 'Profile not found', userEmail: user.email });
       } else {
            return res.status(404).json({ message: 'Profile not found and user data unavailable.' });
       }
    }
    res.status(200).json(profile);
  } catch (error) {
    console.error('[getMyProfile] Error:', error);
    res.status(500).json({ message: `Server Error fetching profile: ${error.message}` });
  }
};

// @desc    Create or update a user profile
// @route   POST /api/profile
// @access  Private
const createOrUpdateProfile = async (req, res) => {
  // 1. Get fields including enrollmentNumber, remove email
  const { name, skills, gpa, age, gender, enrollmentNumber } = req.body;

  // 2. Get the file path
  const resumeURL = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : '';

  // Basic validation (can add more specific checks)
  if (!name || !enrollmentNumber || !age || !gender ) {
      return res.status(400).json({ message: 'Name, Enrollment Number, Age, and Gender are required.' });
  }

  // Check if resume is provided during creation
  if (!resumeURL) {
    try {
        const existingProfile = await Profile.findOne({ user: req.user._id });
        if (!existingProfile || !existingProfile.resumeURL) {
            return res.status(400).json({ message: 'Resume file is required when creating profile.' });
        }
    } catch(err) { /* Ignore error during check */ }
  }


  // 3. Build the profile object (without email)
  const profileFields = {
    user: req.user._id,
    name,
    enrollmentNumber, // <-- ADDED
    skills: Array.isArray(skills) ? skills : (skills || '').split(',').map(skill => skill.trim()).filter(Boolean), // Handle skills, ensure it's an array
    gpa: gpa || null, // Handle potentially empty GPA
    age,
    gender,
  };

  // Only add/update resumeURL if a new file was uploaded
  if (req.file) {
      profileFields.resumeURL = resumeURL;
  }

  try {
    // Check if enrollment number is already taken by another user
     const existingEnrollment = await Profile.findOne({ enrollmentNumber: enrollmentNumber });
     if (existingEnrollment && existingEnrollment.user.toString() !== req.user._id.toString()) {
         return res.status(400).json({ message: 'Enrollment number already in use.' });
     }


    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      console.log(`[createOrUpdateProfile] Updating profile for user: ${req.user._id}`);
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true, runValidators: true } // Return updated doc, run schema validations
      ).populate('user', 'email'); // Populate email after update
      return res.status(200).json(profile);
    } else {
      // Create new profile
       if (!req.file) {
           // Double-check resume on create specifically
            return res.status(400).json({ message: 'Resume file is required to create a profile.' });
       }
      console.log(`[createOrUpdateProfile] Creating profile for user: ${req.user._id}`);
      profile = await Profile.create(profileFields);
      // Need to populate manually after create
      const populatedProfile = await Profile.findById(profile._id).populate('user', 'email');
      res.status(201).json(populatedProfile);
    }
  } catch (error) {
     console.error('[createOrUpdateProfile] Error:', error);
     // Handle specific validation errors
     if (error.name === 'ValidationError') {
         return res.status(400).json({ message: `Validation Error: ${error.message}` });
     }
     // Handle duplicate key error for enrollmentNumber
      if (error.code === 11000 && error.keyPattern && error.keyPattern.enrollmentNumber) {
         return res.status(400).json({ message: 'Enrollment number already exists.' });
     }
    res.status(500).json({ message: `Server Error saving profile: ${error.message}` });
  }
};

// @desc    Get all profiles (for Placement Cell)
// @route   GET /api/profile
// @access  Private/PlacementCell
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({})
                                  .populate('user', 'email'); // Populate user's email
    res.status(200).json(profiles);
  } catch (error) {
     console.error('[getAllProfiles] Error:', error);
    res.status(500).json({ message: `Server Error fetching all profiles: ${error.message}` });
  }
};


module.exports = {
  getMyProfile,
  createOrUpdateProfile,
  getAllProfiles,
};