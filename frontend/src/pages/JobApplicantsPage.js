import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link for navigation
import api from '../services/api'; // Axios instance for API calls

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress'; // Loading spinner
import Alert from '@mui/material/Alert'; // Error messages
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper'; // Container for the table
import Button from '@mui/material/Button'; // For links like "View Resume"
import Dialog from '@mui/material/Dialog'; // For the modal
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
// --- End MUI Imports ---

const JobApplicantsPage = () => {
  // --- State Variables ---
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCoverLetterModal, setOpenCoverLetterModal] = useState(false);
  const [currentCoverLetter, setCurrentCoverLetter] = useState('');
  // --- End State Variables ---

  // --- Modal Handlers ---
  const handleOpenCoverLetter = (coverLetter) => {
    setCurrentCoverLetter(coverLetter);
    setOpenCoverLetterModal(true);
  };
  const handleCloseCoverLetter = () => {
    setOpenCoverLetterModal(false);
    setCurrentCoverLetter('');
  };
  // --- End Modal Handlers ---

  // --- Fetch Data Effect ---
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError('');
      setJobTitle('');

      try {
        // Fetch job details for the title (improves UX)
        try {
            const jobRes = await api.get(`/jobs/${jobId}`);
            setJobTitle(jobRes.data?.title || 'Job');
        } catch (jobErr) {
            setJobTitle('Selected Job'); // Use fallback title
        }

        // Fetch the list of applications
        const response = await api.get(`/applications/job/${jobId}`);
        setApplications(response.data);

      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch applicants. Please ensure the Job ID is correct.';
        setError(errorMsg);
        console.error("Fetch Applicants Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplicants();
    } else {
      setError("No Job ID provided in the URL.");
      setLoading(false);
    }
  }, [jobId]);


  // --- Render Logic ---
  return (
    <Box sx={{ maxWidth: '1200px', margin: '30px auto', padding: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', textAlign: 'center', mb: 3 }}>
        Applicants for "{jobTitle}"
      </Typography>

      {/* Loading and Error blocks */}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}
      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && applications.length === 0 && (
        <Typography sx={{ textAlign: 'center', mt: 3, color: 'text.secondary' }}>
          No applications have been received for this job posting yet.
        </Typography>
      )}

      {/* Table Display */}
      {!loading && !error && applications.length > 0 && (
        <TableContainer component={Paper} elevation={2} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 1000 }} aria-label="applicants table">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                {/* --- NEW HEADERS --- */}
                <TableCell sx={{ fontWeight: 'bold' }}>Name & Enrollment</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Age/Gender/GPA</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Applied On</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cover Letter</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Resume</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                {/* --- END NEW HEADERS --- */}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => {
                  // Destructure the profile for easier access (it's null if not found)
                  const profile = app.applicantProfile;
                  const userEmail = app.student?.email;

                  return (
                    <TableRow key={app._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      
                      {/* Name & Enrollment Cell */}
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {profile?.name || 'Profile Incomplete'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profile?.enrollmentNumber || 'N/A'}
                        </Typography>
                      </TableCell>

                      {/* Email Cell */}
                      <TableCell>{userEmail || 'N/A'}</TableCell>
                      
                      {/* Age/Gender/GPA Cell */}
                      <TableCell>
                        {profile ? (
                          <Box>
                            {profile.age ? `${profile.age} yrs, ${profile.gender}` : 'N/A'}
                            <br />
                            <Typography variant="caption" color="primary.main">
                              {profile.gpa ? `GPA: ${profile.gpa}` : 'GPA: N/A'}
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>

                      {/* Applied On Cell */}
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>

                      {/* COVER LETTER BUTTON (MODAL) */}
                      <TableCell>
                        {app.coverLetter ? (
                            <Button variant="contained" size="small" onClick={() => handleOpenCoverLetter(app.coverLetter)}>
                                View Letter
                            </Button>
                        ) : ('-')}
                      </TableCell>
                      
                      {/* RESUME BUTTON */}
                      <TableCell>
                        {app.resumeURL ? (
                          <Button variant="outlined" size="small" href={`http://localhost:5000${app.resumeURL}`} target="_blank" rel="noopener noreferrer">
                            View Resume
                          </Button>
                        ) : ('-')}
                      </TableCell>

                      {/* STATUS */}
                      <TableCell>{app.status}</TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Back Button */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button component={Link} to="/admin-dashboard" variant="contained">
          Back to Admin Dashboard
        </Button>
      </Box>

      {/* --- COVER LETTER MODAL --- */}
      <Dialog open={openCoverLetterModal} onClose={handleCloseCoverLetter} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'secondary.main' }}>Cover Letter</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {currentCoverLetter}
          </Typography>
        </DialogContent>
        <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button onClick={handleCloseCoverLetter} variant="contained">Close</Button>
        </Box>
      </Dialog>
      {/* --- END COVER LETTER MODAL --- */}
    </Box>
  );
};

export default JobApplicantsPage;