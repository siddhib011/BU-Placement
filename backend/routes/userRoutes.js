const express = require('express');
const router = express.Router();

// Import all controller functions for user actions
const {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/userController');

// --- User Authentication Routes ---

// @route   POST /api/users/register
// @desc    Register a new user and send verification OTP
router.post('/register', registerUser);

// @route   POST /api/users/verify
// @desc    Verify the user's email using the OTP
router.post('/verify', verifyUser);

// @route   POST /api/users/login
// @desc    Authenticate user and get JWT token
router.post('/login', loginUser);

// --- Password Reset Routes ---

// @route   POST /api/users/forgot-password
// @desc    Initiate password reset by sending an OTP
router.post('/forgot-password', forgotPassword);

// @route   POST /api/users/verify-reset-otp
// @desc    Verify the OTP sent for password reset
router.post('/verify-reset-otp', verifyResetOtp);

// @route   POST /api/users/reset-password
// @desc    Set the new password after OTP verification
router.post('/reset-password', resetPassword);

module.exports = router;