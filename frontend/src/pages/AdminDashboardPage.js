import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // For navigation
import api from '../services/api'; // Axios instance
import JobForm from '../components/JobForm'; // Component to post new jobs
import AdminJobCard from '../components/AdminJobCard'; // Component to display admin's jobs
import './Dashboard.css'; // Shared dashboard styles

// --- MUI Imports ---
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'; // Loading spinner
import Alert from '@mui/material/Alert'; // Error/Success messages
import Typography from '@mui/material/Typography'; // For headings
// --- End MUI Imports ---

const AdminDashboardPage = () => {
  // --- State Variables ---
  const [myJobs, setMyJobs] = useState([]); // Stores jobs fetched from backend
  const [loading, setLoading] = useState(true); // Tracks if jobs are being fetched
  const [error, setError] = useState(''); // Stores error messages
  const [deleteError, setDeleteError] = useState(''); // Specific error for delete operation
  const [deleteSuccess, setDeleteSuccess] = useState('');// Specific success message for delete operation
  // --- End State Variables ---

  const navigate = useNavigate(); // Hook for programmatic navigation

  // --- Function to Fetch Admin's Jobs ---
  // useCallback memoizes the function so it doesn't get recreated on every render unnecessarily
  const fetchMyJobs = useCallback(async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    setDeleteError(''); // Clear delete specific errors
    setDeleteSuccess(''); // Clear delete success message
    try {
      // Make GET request to the backend endpoint for fetching admin's own jobs
      const response = await api.get('/jobs/myjobs');
      setMyJobs(response.data); // Update state with fetched jobs
    } catch (err) {
      setError('Failed to fetch your job postings. Please refresh the page.');
      console.error("Fetch MyJobs Error:", err);
    } finally {
      setLoading(false); // Stop loading indicator
    }
  }, []); // Empty dependency array means this function is created once

  // --- Fetch jobs when the component mounts ---
  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]); // fetchMyJobs is stable due to useCallback

  // --- Callback for JobForm ---
  // This function is passed to JobForm and called when a new job is successfully posted
  const handleJobPosted = (newJob) => {
    // Add the newly posted job to the beginning of the list for immediate feedback
    setMyJobs(prevJobs => [newJob, ...prevJobs]);
    // Optionally, could re-fetch all jobs instead: fetchMyJobs();
  };

  // --- Handlers for AdminJobCard Buttons ---

  // Navigate to the page showing applicants for a specific job
  const handleViewApplicants = (jobId) => {
    console.log("Navigating to view applicants for job:", jobId);
    navigate(`/job/${jobId}/applicants`); // Use navigate hook
  };

  // Placeholder for navigating to an edit job page/modal
  const handleEditJob = (jobId) => {
    console.log("Edit job:", jobId);
    // TODO: Implement navigation to an edit form, potentially pre-filled
    alert(`Functionality to edit job ID: ${jobId} needs to be implemented.`);
    // Example: navigate(`/edit-job/${jobId}`);
  };

  // Handle deleting a job posting
  const handleDeleteJob = async (jobId) => {
    console.log("Attempting to delete job:", jobId);
    // Confirmation dialog before deleting
    if (!window.confirm("Are you sure you want to permanently delete this job posting? This action cannot be undone.")) {
        return; // Stop if user cancels
    }
    setDeleteError(''); // Clear previous delete errors
    setDeleteSuccess(''); // Clear previous success messages
    try {
        // Send DELETE request to the backend
        await api.delete(`/jobs/${jobId}`);
        // Remove the deleted job from the local state to update the UI immediately
        setMyJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
        setDeleteSuccess(`Job deleted successfully.`); // Show success feedback
        // Auto-clear success message after a few seconds
        setTimeout(() => setDeleteSuccess(''), 3000);
    } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to delete job. Please try again.';
        setDeleteError(errorMsg); // Show error feedback
        console.error("Delete Job Error:", err);
         // Auto-clear error message after a few seconds
        setTimeout(() => setDeleteError(''), 5000);
    }
  };
  // --- End Handlers ---


  // --- Render Logic ---
  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 4 }}>
        Admin/Recruiter Dashboard
      </Typography>

      {/* --- Section: Post a New Job --- */}
      <div className="dashboard-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Post a New Job
        </Typography>
        {/* Render the JobForm component, passing the callback */}
        <JobForm onJobPosted={handleJobPosted} />
      </div>

      {/* --- Section: Display Posted Jobs --- */}
      <div className="dashboard-section">
        <Typography variant="h5" component="h2" gutterBottom>
          Your Posted Jobs
        </Typography>
        {/* Display loading spinner while fetching */}
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}

        {/* Display general fetch error if any */}
        {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

         {/* Display delete operation feedback */}
        {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
        {deleteSuccess && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}


        {/* Display message if no jobs are posted and not loading */}
        {!loading && !error && myJobs.length === 0 && (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>You haven't posted any jobs yet.</Typography>
        )}

        {/* Display the list of job cards if loaded, no error, and jobs exist */}
        {!loading && !error && myJobs.length > 0 && (
          <Box sx={{ mt: 2 }}> {/* Container for the list of cards */}
            {myJobs.map((job) => (
              <AdminJobCard
                key={job._id}
                job={job}
                // Pass the handler functions as props to the card component
                onViewApplicants={handleViewApplicants}
                onEdit={handleEditJob}
                onDelete={handleDeleteJob}
              />
            ))}
          </Box>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;