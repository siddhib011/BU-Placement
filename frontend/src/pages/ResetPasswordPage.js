import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// --- MUI Imports ---
import { Container, Box, Typography, TextField, Button, Alert, CircularProgress, Avatar } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
// --- End MUI Imports ---

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get email and OTP passed from VerifyResetOtpPage
  const emailFromState = location.state?.email || '';
  const otpFromState = location.state?.otp || '';

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Pre-fill email and OTP if passed
  const [email] = useState(emailFromState);
  const [otp] = useState(otpFromState);

  // Redirect if email or OTP are missing (user accessed URL directly)
  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password'); // Send back to start if state is missing
    }
  }, [email, otp, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call the backend to reset the password
      const response = await api.post('/users/reset-password', {
        email,
        otp, // Send OTP again for verification on the backend
        newPassword: formData.newPassword,
      });
      setMessage(response.data.message + ' Redirecting to login...');

      // Redirect to Login page after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Wait 2 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The OTP might have expired or is invalid.');
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
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Your Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, textAlign: 'center' }}>
          Enter and confirm your new password for <strong>{email || 'your account'}</strong>.
        </Typography>

        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="newPassword"
            label="New Password"
            name="newPassword"
            type="password"
            autoFocus
            value={formData.newPassword}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="confirmPassword"
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !email || !otp} // Disable if missing state or loading
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
           <Box sx={{ textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '0.9em', color: '#1976d2' }}>
              Back to Login
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;