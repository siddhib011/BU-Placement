import React from 'react';
// Import routing components
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
// Import auth context hook to check login status and role
import { useAuth } from './context/AuthContext';

// --- MUI Theme Imports ---
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { red } from '@mui/material/colors'; // Import red color palette
// --- End Theme Imports ---

// --- Import Page Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // Handles Login & Register
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Page to request reset OTP
import VerifyResetOtpPage from './pages/VerifyResetOtpPage'; // Page to enter reset OTP
import ResetPasswordPage from './pages/ResetPasswordPage'; // Page to set new password
import ProfilePage from './pages/ProfilePage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import TPODashboardPage from './pages/TPODashboardPage';
import JobApplicationPage from './pages/JobApplicationPage';
import JobApplicantsPage from './pages/JobApplicantsPage';

// --- Import Shared Components ---
import Navbar from './components/Navbar';

// --- Define MUI Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Default MUI blue
    },
    secondary: {
      main: red[700], // Strong red for accents
    },
  },
});
// --- End Theme Definition ---

// --- Protected Route Component ---
// Guards routes based on login status and allowed user roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth(); // Get user from global state

  // Redirect to login if user is not logged in
  if (!user) {
    console.log("[ProtectedRoute] User not logged in. Redirecting to /login.");
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if user's role is not in the allowed list for the route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`[ProtectedRoute] Access denied: User role '${user.role}' not allowed. Redirecting to /.`);
    return <Navigate to="/" replace />;
  }

  // Render the requested page if user is logged in and authorized
  return children;
};


// --- Main App Component ---
function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        {/* Main content area wrapper */}
        <div className="app-main-content" style={{ flexGrow: 1 }}>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} exact />
            <Route path="/login" element={<LoginPage isRegister={false} />} />
            <Route path="/register" element={<LoginPage isRegister={true} />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />


            {/* --- Protected Student Routes --- */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute allowedRoles={['student']}><StudentDashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute allowedRoles={['student']}><ProfilePage /></ProtectedRoute>}
            />
            <Route
              path="/job/:id/apply"
              element={<ProtectedRoute allowedRoles={['student']}><JobApplicationPage /></ProtectedRoute>}
            />


            {/* --- Protected Admin/Recruiter Routes --- */}
            <Route
              path="/admin-dashboard"
              element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>}
            />
             <Route
                path="/job/:jobId/applicants"
                element={<ProtectedRoute allowedRoles={['admin', 'placementcell']}><JobApplicantsPage /></ProtectedRoute>}
             />


            {/* --- Protected Placement Cell (TPO) Routes --- */}
            <Route
              path="/tpo-dashboard"
              element={<ProtectedRoute allowedRoles={['placementcell']}><TPODashboardPage /></ProtectedRoute>}
            />


            {/* --- Catch-all 404 Not Found Route --- */}
            <Route path="*" element={
              <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>404 - Page Not Found</h2>
                <p>Sorry, the page you are looking for does not exist or is unavailable.</p>
                <Link to="/" style={{ color: theme.palette.secondary.main, textDecoration: 'underline' }}>Go back to Homepage</Link>
              </div>
              } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;