import React, { useState, useEffect } from 'react'; // Ensure useState, useEffect are imported
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from "react-google-recaptcha"; // Import reCAPTCHA

// MUI Imports
import { Box, Tab, Tabs, Typography, TextField, Button, Grid, Link as MuiLink, CircularProgress, Alert, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import './AuthLayout.css'; // Import the layout styles
import { Link as RouterLink } from 'react-router-dom';

// --- Constants ---
const ROLE_MAP = ['student', 'admin', 'placementcell'];
const ROLE_LABELS = ['Student', 'Recruiter', 'TPO Admin'];
const SITE_KEY = "6LeKrvYrAAAAAL9WLxiIihkDwBVnhsdxTph9gI6z"; // <-- MAKE SURE THIS IS YOUR ACTUAL SITE KEY

// Helper for Tab Panels
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// --- Main Auth Component ---
const LoginPage = ({ isRegister = false }) => {
  const [tabValue, setTabValue] = useState(0); // Default to Student tab
  const [isLogin, setIsLogin] = useState(!isRegister);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [otpData, setOtpData] = useState({ email: '', otp: '' });
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Effect to sync URL change (/login vs /register) with component state
  useEffect(() => {
    setIsLogin(!isRegister);
    setOtpStep(false); // Always reset OTP step on route change/reload
    setError('');
    setMessage('');
    setFormData({ email: '', password: '', confirmPassword: '' });
    setRecaptchaToken(null);
     // If navigating to /register and TPO tab is selected, switch to Student tab
    if (!isLogin && tabValue === 2) {
        setTabValue(0);
    }
  }, [isRegister, tabValue]); // Added tabValue dependency


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Reset form state when changing user role tab
    setError('');
    setMessage('');
    setOtpStep(false);
    setFormData({ email: '', password: '', confirmPassword: '' });
    setRecaptchaToken(null);
    // If switching to TPO tab, force to login mode
    if (newValue === 2) {
        setIsLogin(true);
        // Optional: navigate to /login if currently on /register
        if (!isLogin) navigate('/login');
    }
  };

  const handleFormChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleOtpChange = (e) => setOtpData({ ...otpData, [e.target.name]: e.target.value });

  // --- LOGIN SUBMIT ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!recaptchaToken) return setError('Please complete the reCAPTCHA.');
    setLoading(true);

    try {
      const response = await api.post('/users/login', {
        email: formData.email,
        password: formData.password,
        recaptchaToken
      });
      login(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      // Navigate based on role
      if (response.data.role === 'student') navigate('/dashboard');
      else if (response.data.role === 'admin') navigate('/admin-dashboard');
      else if (response.data.role === 'placementcell') navigate('/tpo-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
      setRecaptchaToken(null); // Force re-verification
      // recaptchaRef.current.reset(); // If using ref
    } finally {
      setLoading(false);
    }
  };

  // --- REGISTRATION SUBMIT ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    // Prevent TPO registration via UI
    if (tabValue === 2) {
        setError("TPO Admin registration is not allowed.");
        return;
    }
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');
    if (!recaptchaToken) return setError('Please complete the reCAPTCHA.');
    setLoading(true);
    const role = ROLE_MAP[tabValue]; // Get role from the selected tab

    try {
      const response = await api.post('/users/register', {
        email: formData.email,
        password: formData.password,
        role,
        recaptchaToken
      });
      setMessage(response.data.message);
      setOtpData({ ...otpData, email: formData.email });
      setOtpStep(true); // Move to OTP step
      setRecaptchaToken(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  // --- OTP SUBMIT ---
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await api.post('/users/verify', { email: otpData.email, otp: otpData.otp });
      setMessage(response.data.message + " Redirecting...");
      login(response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      const role = response.data.role;
      setTimeout(() => {
        if (role === 'student') navigate('/profile'); // Students go to profile first
        else if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'placementcell') navigate('/tpo-dashboard');
        else navigate('/');
      }, 1500); // Wait 1.5 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER FORM FIELDS ---
  // Conditionally renders fields based on isLogin and selected tab
  const renderFormFields = () => {
      const currentRoleLabel = ROLE_LABELS[tabValue];
      // TPO can only log in, not register via UI
      const showRegisterFields = !isLogin && tabValue !== 2;

      return (
        <Box component="form" onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} noValidate sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                {isLogin ? `Sign In as ${currentRoleLabel}` : `Register as ${currentRoleLabel}`}
            </Typography>

            <TextField margin="dense" required fullWidth id={`email-${tabValue}`} label="Email Address" name="email" autoComplete="email" autoFocus={!otpStep} value={formData.email} onChange={handleFormChange} />
            <TextField margin="dense" required fullWidth name="password" label="Password" type="password" id={`password-${tabValue}`} autoComplete={isLogin ? "current-password" : "new-password"} value={formData.password} onChange={handleFormChange} />

            {/* Show Confirm Password only for Registration (and not for TPO) */}
            {showRegisterFields && <TextField margin="dense" required fullWidth name="confirmPassword" label="Confirm Password" type="password" id={`confirmPassword-${tabValue}`} value={formData.confirmPassword} onChange={handleFormChange} />}

            {/* Show Forgot Password only for Login */}
            {isLogin && <Grid container justifyContent="flex-end" sx={{ mt: 1, mb: 1 }}><MuiLink component={RouterLink} to="/forgot-password" variant="body2">Forgot password?</MuiLink></Grid>}

            {/* reCAPTCHA */}
            <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <ReCAPTCHA sitekey={SITE_KEY} onChange={(token) => setRecaptchaToken(token)} onExpired={() => setRecaptchaToken(null)}/>
            </Box>

            {/* Submit Button */}
            <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ mt: 1, mb: 2, padding: '10px 0' }} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Sign In' : 'Register')}
            </Button>

            {/* Toggle Link (Hide register option on TPO tab) */}
            {tabValue !== 2 && ( // Don't show toggle on TPO tab
                 <Grid container justifyContent="center">
                    <MuiLink component={RouterLink} to={isLogin ? '/register' : '/login'} variant="body2" sx={{ cursor: 'pointer', color: 'secondary.main' }}>
                        {isLogin ? "Don't have an account? Register now" : "Already have an account? Sign In"}
                    </MuiLink>
                </Grid>
            )}
            {/* Show Login link on TPO tab if in Register mode (shouldn't happen with logic above but safe fallback) */}
             {tabValue === 2 && !isLogin && (
                 <Grid container justifyContent="center">
                    <MuiLink component={RouterLink} to={'/login'} variant="body2" sx={{ cursor: 'pointer', color: 'secondary.main' }}>
                        Go to Login
                    </MuiLink>
                </Grid>
            )}
        </Box>
      );
  };

  // --- RENDER MAIN LAYOUT ---
  return (
    <div className="auth-split-container">
      {/* --- LEFT PANEL (Branding) --- */}
      <Box className="auth-left-panel">
          <Box className="branding-content">
             <Box sx={{mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center'}} className="logo-area"> {/* Centering logo */}
                <img
    src="/app-logo-3.png" // Use this relative path
    alt="BU Placements Logo"
    style={{ width: '300px', height: '300px', marginBottom: '20px' }}
/>
                <Typography variant="h5" sx={{fontWeight: 600, fontSize: '1.5rem', mt: 1}}>BU Placements</Typography> {/* Text below logo */}
             </Box>
             <Typography variant="h4" sx={{ fontSize: '1.8rem', fontWeight: 600, lineHeight: 1.3, mt: 2 }}> {/* Main Slogan */}
                One stop portal for students & companies for placements.
             </Typography>
          </Box>
          <Box className="instructions">
            <Typography variant="subtitle2">Instructions:</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {isLogin
                    ? "Login using your registered email and password."
                    : "Select your role (Student/Recruiter) and enter details to register."
                }
            </Typography>
          </Box>
      </Box>

      {/* --- RIGHT PANEL (Form) --- */}
      <Box className="auth-right-panel">
        <Box className="auth-form-wrapper">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><LockOutlinedIcon /></Avatar>
                <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                   Placement Portal
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}

            {/* --- OTP Step --- */}
            {otpStep ? (
                <Box component="form" onSubmit={handleOtpSubmit} noValidate sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{mb: 2}}>Enter OTP sent to: {otpData.email}</Typography>
                    <TextField margin="normal" required fullWidth name="otp" label="6-Digit OTP" type="text" inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }} value={otpData.otp} onChange={handleOtpChange} sx={{ mb: 3 }} autoFocus/>
                     <Button type="submit" fullWidth variant="contained" color="secondary" sx={{ padding: '10px 0' }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify Account'}
                    </Button>
                     <MuiLink onClick={() => setOtpStep(false)} variant="body2" sx={{ cursor: 'pointer', mt: 2, display: 'block' }}>Go back</MuiLink>
                </Box>
            ) : (
                <> {/* --- Tabs and Form Step --- */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="user role tabs" variant="fullWidth" indicatorColor="secondary" textColor="secondary">
                            {/* Render all three tabs */}
                            {ROLE_LABELS.map((label, index) => <Tab label={label} key={index} />)}
                        </Tabs>
                    </Box>
                    {/* Render panels for all three roles */}
                    {ROLE_LABELS.map((label, index) => (
                        <TabPanel value={tabValue} index={index} key={`panel-${index}`}>
                            {/* Render form fields (logic inside handles TPO restrictions) */}
                            {renderFormFields()}
                        </TabPanel>
                    ))}
                </>
            )}
        </Box>
      </Box>
    </div>
  );
};

export default LoginPage;