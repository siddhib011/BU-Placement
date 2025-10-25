import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api'; // Axios instance
import './Dashboard.css'; // Shared dashboard styles

// MUI Imports for UI components
import {
    Box, Typography, CircularProgress, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'; // Icon for delete button

const TPODashboardPage = () => {
    // --- State Variables ---
    const [jobs, setJobs] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true); // Start in loading state
    const [error, setError] = useState('');
    // State for delete confirmation dialog
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [jobToDelete, setJobToDelete] = useState(null); // { id: string, title: string }
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    // --- End State ---

    // --- Function to Fetch All Data (Memoized with useCallback) ---
    const fetchData = useCallback(async () => {
        console.log("[TPODashboard] Starting fetchData..."); // Debug Log
        setLoading(true); // Ensure loading is true at the start
        setError('');
        setDeleteError(''); // Clear previous operational errors
        setDeleteSuccess('');
        try {
            console.log("[TPODashboard] Fetching jobs, profiles, applications concurrently..."); // Debug Log
            // Use Promise.all to fetch all data needed for the dashboard in parallel
            const [jobsRes, profilesRes, applicationsRes] = await Promise.all([
                api.get('/jobs'),          // TPO gets all jobs
                api.get('/profile'),       // TPO gets all profiles
                api.get('/applications')   // TPO gets all applications
            ]);
            console.log("[TPODashboard] Fetched data:", { jobs: jobsRes.data.length, profiles: profilesRes.data.length, applications: applicationsRes.data.length }); // Debug Log

            setJobs(jobsRes.data);
            setProfiles(profilesRes.data);
            setApplications(applicationsRes.data);

        } catch (err) {
            // Handle errors during API calls
            const errorMsg = err.response?.data?.message || 'Failed to fetch dashboard data. Please ensure you are logged in as TPO and try again.';
            setError(errorMsg);
            console.error("[TPODashboard] Fetch Error:", err); // Log the full error
        } finally {
            // IMPORTANT: Always set loading to false after fetching (or on error)
            console.log("[TPODashboard] Setting loading to false."); // Debug Log
            setLoading(false);
        }
    }, []); // Empty dependency array: function is created only once

    // --- Fetch data when component mounts ---
    useEffect(() => {
        console.log("[TPODashboard] Component mounted, calling fetchData."); // Debug Log
        fetchData();
    }, [fetchData]); // Dependency array includes the memoized fetchData function

    // --- Handlers for Deleting a Job ---
    const handleClickOpenDeleteDialog = (jobId, jobTitle) => {
        setJobToDelete({ id: jobId, title: jobTitle });
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setJobToDelete(null);
        setDeleteError(''); // Clear dialog-specific errors on close
    };

    const handleConfirmDeleteJob = async () => {
        if (!jobToDelete) return; // Safety check

        setDeleteError('');
        setDeleteSuccess('');
        try {
            console.log(`[TPODashboard] Deleting job ID: ${jobToDelete.id}`); // Debug Log
            await api.delete(`/jobs/${jobToDelete.id}`);
            // Update UI by removing the job from the local state
            setJobs(prevJobs => prevJobs.filter(job => job._id !== jobToDelete.id));
            setDeleteSuccess(`Job "${jobToDelete.title}" deleted successfully.`);
            console.log(`[TPODashboard] Job deleted successfully: ${jobToDelete.id}`); // Debug Log
            setTimeout(() => setDeleteSuccess(''), 4000); // Clear message after 4s
        } catch (err) {
            const errorMsg = err.response?.data?.message || `Failed to delete job "${jobToDelete.title}".`;
            setDeleteError(errorMsg);
            console.error("[TPODashboard] Delete Job Error:", err);
            setTimeout(() => setDeleteError(''), 5000); // Clear error after 5s
        } finally {
            handleCloseDeleteDialog(); // Close the dialog
        }
    };
    // --- End Delete Handlers ---


    // --- Render Logic ---
    return (
        <div className="dashboard-container">
            <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 4 }}>
                Placement Cell (TPO) Dashboard
            </Typography>

            {/* --- Loading Indicator --- */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
                    <CircularProgress color="secondary" size={60} />
                </Box>
            )}

            {/* --- Error Display (if not loading) --- */}
            {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* --- Delete Operation Feedback (if not loading) --- */}
            {deleteError && !loading && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
            {deleteSuccess && !loading && <Alert severity="success" sx={{ mb: 2 }}>{deleteSuccess}</Alert>}

            {/* --- Data Sections (Render only if NOT loading and NO fetch error) --- */}
            {!loading && !error && (
                <>
                    {/* --- Section: All Job Postings --- */}
                    <div className="dashboard-section">
                        <Typography variant="h5" component="h2" gutterBottom>
                            All Job Postings ({jobs.length})
                        </Typography>
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Posted By</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Posted On</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobs.length > 0 ? jobs.map((job) => (
                                        <TableRow key={job._id} hover>
                                            <TableCell>{job.title}</TableCell>
                                            <TableCell>{job.company}</TableCell>
                                            {/* Access username from populated user object */}
                                            <TableCell>{job.user?.username || 'N/A'}</TableCell>
                                            <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleClickOpenDeleteDialog(job._id, job.title)}
                                                    aria-label={`Delete job ${job.title}`}
                                                    title="Delete Job Posting"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                                {/* Future: Add View/Edit buttons */}
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary' }}>No jobs posted yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>

                    {/* --- Section: Student Profiles --- */}
                    <div className="dashboard-section">
                        <Typography variant="h5" component="h2" gutterBottom>
                            Student Profiles ({profiles.length})
                        </Typography>
                        {/* TODO: Add Search/Filter Input */}
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Enrollment No.</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Resume</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {profiles.length > 0 ? profiles.map((profile) => (
                                        <TableRow key={profile._id} hover>
                                            <TableCell>{profile.name || '-'}</TableCell>
                                            <TableCell>{profile.enrollmentNumber || '-'}</TableCell>
                                            {/* Access email from populated user object */}
                                            <TableCell>{profile.user?.email || 'N/A'}</TableCell>
                                            {/* Display first few skills */}
                                            <TableCell title={profile.skills?.join(', ') || ''}>
                                                {profile.skills?.slice(0, 3).join(', ') || '-'}{profile.skills?.length > 3 ? '...' : ''}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {profile.resumeURL ? (
                                                    <Button size="small" href={`http://localhost:5000${profile.resumeURL}`} target="_blank" rel="noopener noreferrer">View</Button>
                                                ) : '-'}
                                            </TableCell>
                                            {/* Future: Add View Full Profile Button */}
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary' }}>No student profiles found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>

                    {/* --- Section: All Applications --- */}
                    <div className="dashboard-section">
                        <Typography variant="h5" component="h2" gutterBottom>
                            All Applications ({applications.length})
                        </Typography>
                        {/* TODO: Add Filter by Job/Student */}
                        <TableContainer component={Paper} elevation={1}>
                            <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Job Title</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Company</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Applicant Email</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Applied On</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {applications.length > 0 ? applications.map((app) => (
                                        <TableRow key={app._id} hover>
                                            <TableCell>{app.job?.title || 'N/A'}</TableCell>
                                            <TableCell>{app.job?.company || 'N/A'}</TableCell>
                                            {/* Access email from populated user object */}
                                            <TableCell>{app.student?.email || 'N/A'}</TableCell>
                                            <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{app.status}</TableCell>
                                            {/* Future: Add View Application Details Button */}
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'text.secondary' }}>No applications submitted yet.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </>
            )}

             {/* --- Confirmation Dialog for Deleting Jobs --- */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-job-dialog-title"
                aria-describedby="delete-job-dialog-description"
            >
                <DialogTitle id="delete-job-dialog-title">
                    {"Confirm Job Deletion"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-job-dialog-description">
                        Are you sure you want to permanently delete the job posting for "{jobToDelete?.title}"? This cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    {/* Confirm button triggers the delete handler */}
                    <Button onClick={handleConfirmDeleteJob} color="error" variant="contained" autoFocus>
                        Delete Job
                    </Button>
                </DialogActions>
            </Dialog>
             {/* --- End Confirmation Dialog --- */}

        </div> // End dashboard-container
    );
};

export default TPODashboardPage;