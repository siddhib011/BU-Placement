const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); // Your email sending utility

// @desc    Register a new user & send OTP
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  // Basic input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  // Add more robust email validation if needed

  try {
    console.log(`[registerUser] Attempting registration for: ${email}`);
    let user = await User.findOne({ email });

    // Check if user exists and is already verified
    if (user && user.isVerified) {
      console.log(`[registerUser] User already exists and verified: ${email}`);
      return res.status(400).json({ message: 'User already exists and is verified' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[registerUser] Generated OTP for ${email}: ${otp}`); // Log OTP for debugging ONLY

    // Set OTP expiry to 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (user && !user.isVerified) {
      // User exists but isn't verified, update OTP and potentially password
      console.log(`[registerUser] Updating OTP for existing unverified user: ${email}`);
      user.password = password; // Allow password update on re-register attempt
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save(); // Save updated user
    } else if (!user) {
      // Create a new user if they don't exist
      console.log(`[registerUser] Creating new user: ${email}`);
      user = await User.create({
        email,
        password, // Password will be hashed by the pre-save hook in userModel
        role: role || 'student', // Default to student if role not provided
        otp,
        otpExpires,
      });
    } else {
      // Should not be reachable if the first check works
      console.log(`[registerUser] Edge case hit - user exists: ${email}`);
      return res.status(400).json({ message: 'User registration state conflict.' });
    }

    // --- Send the OTP email ---
    const emailSubject = 'Verify Your Account - Placement Portal';
    const emailText = `Your One-Time Password (OTP) for account verification is: ${otp}\nThis code will expire in 10 minutes.`;

    console.log(`[registerUser] Attempting to send OTP email to ${user.email}...`);
    await sendEmail(user.email, emailSubject, emailText);
    console.log(`[registerUser] sendEmail function finished for ${user.email}.`);

    res.status(201).json({
      message: 'Registration successful. Please check your email for an OTP to verify your account.',
    });

  } catch (error) {
    console.error('[registerUser] Controller Error:', error);
    res.status(500).json({ message: 'Server Error during registration. Please try again later.' });
  }
};

// @desc    Verify user with OTP
// @route   POST /api/users/verify
// @access  Public
const verifyUser = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  try {
    console.log(`[verifyUser] Attempting verification for: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`[verifyUser] User not found: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      console.log(`[verifyUser] User already verified: ${email}`);
      return res.status(400).json({ message: 'User is already verified' });
    }
    // Check OTP validity *after* checking if user exists/is verified
    if (user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      console.log(`[verifyUser] Invalid or expired OTP for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Verification Success
    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined; // Clear expiry
    await user.save();
    console.log(`[verifyUser] User verified successfully: ${email}`);

    // Generate token for immediate login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: token,
      message: 'Account verified successfully!',
    });

  } catch (error) {
     console.error('[verifyUser] Controller Error:', error);
    res.status(500).json({ message: 'Server Error during verification. Please try again later.' });
  }
};


// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    console.log(`[loginUser] Attempting login for: ${email}`);
    const user = await User.findOne({ email });

    const invalidCredentialsMsg = 'Invalid email or password';

    if (!user) {
        console.log(`[loginUser] User not found: ${email}`);
        return res.status(401).json({ message: invalidCredentialsMsg });
    }
    if (!user.isVerified) {
        console.log(`[loginUser] Account not verified: ${email}`);
      return res.status(401).json({ message: 'Account not verified. Please check your email for an OTP or register again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Passwords match & user is verified
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      console.log(`[loginUser] Login successful: ${email}`);
      res.status(200).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      console.log(`[loginUser] Invalid password attempt for: ${email}`);
      res.status(401).json({ message: invalidCredentialsMsg });
    }
  } catch (error) {
     console.error('[loginUser] Controller Error:', error);
    res.status(500).json({ message: 'Server Error during login. Please try again later.' });
  }
};

// --- Password Reset Functions ---

// @desc    Request password reset OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  try {
    console.log(`[forgotPassword] Request received for: ${email}`);
    // Only allow reset for users who have successfully verified their email at least once
    const user = await User.findOne({ email: email, isVerified: true });

    if (!user) {
      console.log(`[forgotPassword] Verified user not found or does not exist: ${email}`);
      // Security: Send a generic success message even if the user doesn't exist or isn't verified
      // This prevents attackers from figuring out which emails are registered.
      return res.status(200).json({ message: 'If an account with that email exists and is verified, a password reset OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Set OTP expiry (e.g., 10 minutes)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP and expiry to the user document
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    console.log(`[forgotPassword] Generated reset OTP for ${email}: ${otp}`);

    // Send the OTP email for password reset
    const emailSubject = 'Password Reset Request - Placement Portal';
    const emailText = `Your One-Time Password (OTP) for password reset is: ${otp}\nThis code will expire in 10 minutes. If you did not request this, please ignore this email.`;

    await sendEmail(user.email, emailSubject, emailText);

    res.status(200).json({ message: 'If an account with that email exists and is verified, a password reset OTP has been sent.' });

  } catch (error) {
    console.error('[forgotPassword] Controller Error:', error);
    res.status(500).json({ message: 'Server Error requesting password reset. Please try again later.' });
  }
};

// @desc    Verify the password reset OTP
// @route   POST /api/users/verify-reset-otp
// @access  Public
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Please provide email and OTP' });
  }

  try {
    console.log(`[verifyResetOtp] Verification attempt for: ${email}`);
    // Find user by email, matching OTP, and ensuring OTP hasn't expired
    const user = await User.findOne({
      email: email,
      otp: otp,
      otpExpires: { $gt: Date.now() }, // Check if otpExpires is in the future
    });

    if (!user) {
      console.log(`[verifyResetOtp] Invalid or expired OTP for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    console.log(`[verifyResetOtp] Reset OTP verified successfully for: ${email}`);
    // We don't clear the OTP here yet, we wait until the password is actually reset
    res.status(200).json({ message: 'OTP verified successfully. You can now proceed to reset your password.' });

  } catch (error) {
    console.error('[verifyResetOtp] Controller Error:', error);
    res.status(500).json({ message: 'Server Error verifying OTP. Please try again later.' });
  }
};

// @desc    Reset the user's password after OTP verification
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  // Basic validation
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Please provide email, OTP, and new password' });
  }
  if (newPassword.length < 6) {
     return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    console.log(`[resetPassword] Attempting password reset for: ${email}`);
    // Find the user again using the OTP to ensure they just verified successfully
    const user = await User.findOne({
      email: email,
      otp: otp, // Verify OTP again as a security measure
      otpExpires: { $gt: Date.now() }, // Ensure OTP is still valid
    });

    if (!user) {
      // OTP is invalid/expired, or they didn't complete verify-reset-otp recently
      console.log(`[resetPassword] Invalid/expired OTP or unauthorized reset attempt for: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP, or reset not authorized. Please verify OTP again.' });
    }

    // OTP is valid, proceed to reset password
    user.password = newPassword; // The pre-save hook in userModel will hash this
    user.otp = undefined; // Clear OTP
    user.otpExpires = undefined; // Clear expiry
    await user.save();
    console.log(`[resetPassword] Password reset successful for: ${email}`);

    // Optionally send a confirmation email
    // try {
    //   await sendEmail(user.email, 'Password Changed Successfully', 'Your password for the Placement Portal has been successfully changed.');
    // } catch (emailError) {
    //   console.error(`[resetPassword] Failed to send confirmation email to ${email}:`, emailError);
    //   // Don't fail the whole request if confirmation email fails
    // }

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error) {
    console.error('[resetPassword] Controller Error:', error);
    res.status(500).json({ message: 'Server Error resetting password. Please try again later.' });
  }
};


// Export all controller functions
module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};