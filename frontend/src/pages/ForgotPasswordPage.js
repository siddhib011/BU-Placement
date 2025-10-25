


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import api from '../services/api'; // Axios instance
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA

// --- MUI Imports ---
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Avatar } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset'; // Icon for reset
// --- End MUI Imports ---

// --- Add your reCAPTCHA Site Key ---
const SITE_KEY = "6LeKrvYrAAAAAL9WLxiIihkDwBVnhsdxTph9gI6z"; // <-- REPLACE THIS

const ForgotPasswordPage = () => {
  // --- State Variables ---
  const [email, setEmail] = useState(''); // Stores the email input
  const [loading, setLoading] = useState(false); // Tracks submission state
  const [error, setError] = useState(''); // Stores error messages
  const [message, setMessage] = useState(''); // Stores success messages
  const [recaptchaToken, setRecaptchaToken] = useState(null); // Stores reCAPTCHA token
  // --- End State Variables ---

  const navigate = useNavigate(); // Hook for navigation

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous messages

    // Check if reCAPTCHA was completed
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification.');
      return;
    }

    setLoading(true); // Indicate loading state

    try {
      // Send request to backend with email and reCAPTCHA token
      const response = await api.post('/users/forgot-password', { email, recaptchaToken });
      setMessage(response.data.message + ' Redirecting to verify OTP...'); // Show success message
      setEmail(''); // Clear the email input field
      setRecaptchaToken(null); // Reset captcha state for security
      // Consider resetting the visual captcha widget if using a ref: recaptchaRef.current.reset();

      // --- Navigate With State ---
      // Redirect to the OTP verification page after a short delay,
      // passing the email in the navigation state so the next page knows which email to verify.
      setTimeout(() => {
        navigate('/verify-reset-otp', { state: { email: email } });
      }, 1500); // Wait 1.5 seconds

    } catch (err) {
      // Handle errors from the backend or network
      setError(err.response?.data?.message || 'Failed to send reset OTP. Please check the email address and try again.');
      setRecaptchaToken(null); // Reset captcha state on error
      console.error("Forgot Password Error:", err);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  // --- End Form Submission Handler ---


  // --- Render Logic ---
  return (
    <Container component="main" maxWidth="xs"> {/* MUI container for centering and max width */}
      <Box
        sx={{
          marginTop: 8, // Top margin
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Center content horizontally
        }}
      >
        {/* Icon and Title */}
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> {/* Red themed avatar */}
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
          Enter your email address and we'll send you an OTP to reset your password.
        </Typography>

        {/* Display Error/Success Messages */}
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}

        {/* The Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Email Input Field */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email-forgot"
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* reCAPTCHA Component */}
          <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
             <ReCAPTCHA
                sitekey="6LeKrvYrAAAAAL9WLxiIihkDwBVnhsdxTph9gI6z" // Your public site key
                onChange={(token) => setRecaptchaToken(token)} // Update token state on success
                onExpired={() => setRecaptchaToken(null)} // Clear token if it expires
             />
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary" // Use red theme color
            sx={{ mt: 2, mb: 2 }} // Adjusted margin
            disabled={loading || !email} // Disable if loading or email is empty
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset OTP'}
          </Button>

          {/* Link back to Login */}
          <Box sx={{ textAlign: 'center' }}>
            {/* Use React Router's Link for navigation */}
            <Link to="/login" style={{ fontSize: '0.9em', color: '#1976d2' }}>
              Back to Login
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;