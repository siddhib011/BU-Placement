import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import api from '../services/api'; // Axios instance for API calls
import './Dashboard.css'; // Shared dashboard styles

// --- Job Card Component ---
// Displays individual job information and the link to apply
const JobCard = ({ job }) => (
    <div className="job-card">
        <h3>{job.title}</h3>
        <h4>{job.company}</h4>
        {/* Displaying first 100 characters of description */}
        <p>{job.description?.substring(0, 100)}...</p>
        <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
        <p><small>Posted by: {job.user?.username || 'Admin/Recruiter'}</small></p>
        {/* Link directs the user to the application page for this specific job */}
        <Link to={`/job/${job._id}/apply`} className="apply-button">
            Apply Now
        </Link>
        {/* Future: Add a "View Details" link */}
    </div>
);

// --- Student Dashboard Page Component ---
const StudentDashboardPage = () => {
    // State variables
    const [jobs, setJobs] = useState([]); // To store fetched jobs
    const [loading, setLoading] = useState(true); // To show loading state
    const [error, setError] = useState(''); // To display errors
    const [profileExists, setProfileExists] = useState(true); // To track if student profile is complete

    // Fetch jobs and check profile status when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                setProfileExists(true); // Assume profile exists until checked

                // Fetch all job postings
                const jobsResponse = await api.get('/jobs');
                setJobs(jobsResponse.data);

                // Check if the logged-in student has a profile
                try {
                   await api.get('/profile/me');
                   // If the request succeeds, profile exists
                } catch (profileError) {
                    // If profile returns 404, mark profile as non-existent
                    if (profileError.response && profileError.response.status === 404) {
                        console.log("Student profile not found, prompting creation.");
                        setProfileExists(false);
                    } else {
                        // Log other errors encountered while checking profile
                        console.error("Error checking profile:", profileError);
                        // Optional: Show a less critical error message about profile check failure
                    }
                }

            } catch (err) {
                // Handle errors during job fetching
                setError('Failed to fetch job postings. Please try refreshing the page.');
                console.error("Error fetching jobs:", err);
            } finally {
                // Stop loading indicator regardless of success or failure
                setLoading(false);
            }
        };

        fetchData(); // Call the async function to fetch data
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="dashboard-container">
            <h1>Student Dashboard</h1>

            {/* --- Profile Completion Reminder --- */}
            {/* Show this section only if loading is done and profile doesn't exist */}
            {!loading && !profileExists && (
                <div className="dashboard-section profile-reminder">
                    <h2>Complete Your Profile</h2>
                    <p>Your profile is incomplete. You must create your profile to apply for jobs.</p>
                    <Link to="/profile" className="profile-link-button">Go to Profile</Link>
                </div>
            )}

            {/* --- Loading and Error Messages --- */}
            {loading && <p style={{ textAlign: 'center' }}>Loading available jobs...</p>}
            {error && <p className="error-message">{error}</p>}
            {/* Success message for application is handled on the JobApplicationPage */}

            {/* --- Job Listings Section --- */}
            <div className="dashboard-section">
                <h2>Available Job Postings</h2>
                {/* Display message if loading is done, no error, but no jobs found */}
                {!loading && !error && jobs.length === 0 && (
                    <p>No job postings are available at the moment. Please check back later.</p>
                )}
                {/* Display the job list if loading is done, no error, and jobs exist */}
                {!loading && !error && jobs.length > 0 && (
                    <div className="job-list">
                        {/* Map over the fetched jobs array and render a JobCard for each */}
                        {/* We could add filtering here later (e.g., job type, location) */}
                        {jobs.map((job) => (
                            <JobCard key={job._id} job={job} />
                        ))}
                    </div>
                )}
            </div>

             {/* Future sections like 'Internships' or 'Events' could be added similarly */}

        </div>
    );
};

export default StudentDashboardPage;