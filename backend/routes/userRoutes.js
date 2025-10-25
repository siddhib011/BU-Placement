const express = require('express');
const router = express.Router();
const { verifyCaptcha } = require('../middleware/captchaMiddleware'); // <-- IMPORT CAPTCHA

// Import controller functions
const {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/userController');

// Apply verifyCaptcha middleware before the controller function

// @route   POST /api/users/register
router.post('/register', verifyCaptcha, registerUser); // <-- ADD verifyCaptcha

// @route   POST /api/users/login
router.post('/login', verifyCaptcha, loginUser); // <-- ADD verifyCaptcha

// Reset Password Flow (Protect only the initial request)
router.post('/forgot-password', verifyCaptcha, forgotPassword); // <-- ADD verifyCaptcha

// Other routes remain the same (no captcha needed for verify or reset password after OTP is issued)
router.post('/verify', verifyUser);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;