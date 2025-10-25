import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './FormPage.css'; // Create a simple CSS for form pages

const JobApplicationPage = () => {
  const { id: jobId } = useParams(); // Get job ID from URL parameter
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [profileExists, setProfileExists] = useState(true);

  // Fetch job details and check profile on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingJob(true);
      setError('');
      try {
        // Fetch job details
        const jobRes = await api.get(`/jobs/${jobId}`);
        setJob(jobRes.data);

        // Check if student profile exists (needed for resumeURL)
        await api.get('/profile/me');
        setProfileExists(true);

      } catch (err) {
        if (err.response?.status === 404) {
          if (err.config.url.includes('/profile/me')) {
             setError('Profile not found. Please create your profile before applying.');
             setProfileExists(false);
          } else {
             setError('Job not found.');
          }
        } else {
          setError('Failed to load application details. Please try again.');
          console.error(err);
        }
      } finally {
        setLoadingJob(false);
      }
    };

    if (user && jobId) {
      fetchData();
    } else {
        setError("Invalid job ID or user not logged in.");
        setLoadingJob(false);
    }
  }, [jobId, user]); // Re-fetch if jobId or user changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileExists) {
        setError('Cannot apply without a profile.');
        return;
    }
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await api.post(`/applications/job/${jobId}/apply`, { coverLetter });
      setMessage('Application submitted successfully!');
      // Redirect back to dashboard after a short delay
      setTimeout(() => navigate('/dashboard'), 2000); // Wait 2 seconds

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Have you already applied?');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingJob) return <p>Loading job details...</p>;
  if (error && !job) return <p className="error-message">{error}</p>; // Show error if job loading failed
  if (!job) return <p>Job details could not be loaded.</p>; // Fallback if job is null

  return (
    <div className="form-container">
      <h1>Apply for {job.title}</h1>
      <div className="job-details-summary">
        <h2>{job.company}</h2>
        <p><strong>Description:</strong> {job.description}</p>
        <p><strong>Salary:</strong> {job.salary}</p>
        {/* Add more job details if needed */}
      </div>

      <hr style={{ margin: '20px 0' }} />

      {profileExists ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter (Optional)</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows="6"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Briefly explain why you are a good fit..."
            />
             <small>Your resume stored in your profile will be submitted automatically.</small>
          </div>

          <button type="submit" className="form-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
        </form>
      ) : (
         <div className="profile-required">
            <p className="error-message">{error || 'You must complete your profile before applying.'}</p>
             <Link to="/profile" className="form-button-link">Go to Profile</Link>
         </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default JobApplicationPage;