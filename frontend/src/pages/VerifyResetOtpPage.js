import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// --- MUI Imports ---
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Avatar } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Icon for OTP
// --- End MUI Imports ---

const VerifyResetOtpPage = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get state passed from navigation
  // Get email passed from ForgotPasswordPage, default to empty if not passed
  const emailFromState = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Pre-fill email if passed, otherwise prompt user (or redirect if email missing)
  const [email] = useState(emailFromState);

  // Redirect if email wasn't passed via state (user accessed URL directly)
  React.useEffect(() => {
    if (!email) {
      navigate('/forgot-password'); // Send back to request OTP if email is missing
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Call the backend to verify the OTP
      const response = await api.post('/users/verify-reset-otp', { email, otp });
      setMessage(response.data.message + ' Redirecting to set new password...');

      // Redirect to the Reset Password page, passing email and OTP
      setTimeout(() => {
        navigate('/reset-password', { state: { email: email, otp: otp } });
      }, 1500); // Wait 1.5 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <VpnKeyIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Verify Reset Code
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
          Enter the 6-digit OTP sent to <strong>{email || 'your email'}</strong>.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Display email (read-only) for confirmation */}
          <TextField
            margin="normal"
            fullWidth
            id="email-verify"
            label="Email Address"
            name="email"
            value={email}
            InputProps={{
              readOnly: true,
            }}
            sx={{ backgroundColor: '#f5f5f5', mb: 2 }} // Style as read-only
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="otp-verify"
            label="6-Digit OTP"
            name="otp"
            type="text" // Use text for easier input
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !email} // Disable if no email or loading
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.9em', color: '#1976d2' }}>
              Didn't receive code? Request again
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default VerifyResetOtpPage;