const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

// Bouncer #1: Checks if you are logged in
const protect = async (req, res, next) => {
  let token;

  // Check for the token in the "Authorization" header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (it looks like "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the token's ID and attach them to the request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move on to the next function
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Bouncer #2: Checks if you are an Admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // You are an admin, proceed
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden
  }
};

// --- ADD THIS NEW FUNCTION ---
// Bouncer #3: Checks if you are from the Placement Cell
const placementCell = (req, res, next) => {
  if (req.user && req.user.role === 'placementcell') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a Placement Cell member' });
  }
};

// --- UPDATE YOUR EXPORTS ---
module.exports = { protect, admin, placementCell };

