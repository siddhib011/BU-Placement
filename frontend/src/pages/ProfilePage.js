import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './FormPage.css'; // Use the shared form styles

const ProfilePage = () => {
  const { user } = useAuth(); // Get user info (for email and user ID)
  // --- Updated State ---
  const [profileData, setProfileData] = useState({
    name: '',
    enrollmentNumber: '', // Added
    age: '',
    gender: 'Male',
    skills: '',
    gpa: '',
    resumeURL: '',
  });
  const [userEmail, setUserEmail] = useState(''); // State for non-editable email
  // --- End Updated State ---
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        setMessage(''); // Clear message on load
        const response = await api.get('/profile/me');
        const data = response.data;
        // --- Update state setting ---
        setProfileData({
          name: data.name || '',
          enrollmentNumber: data.enrollmentNumber || '', // Set enrollment number
          age: data.age || '',
          gender: data.gender || 'Male',
          skills: data.skills ? data.skills.join(', ') : '',
          gpa: data.gpa || '',
          resumeURL: data.resumeURL || '',
        });
        setUserEmail(data.user?.email || ''); // Set email from populated user data
        // --- End ---
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setMessage('Profile not found. Please complete your details.');
          // Use email from context/localStorage if profile doesn't exist yet
          const storedUserInfo = localStorage.getItem('userInfo')
            ? JSON.parse(localStorage.getItem('userInfo'))
            : null;
          setUserEmail(storedUserInfo?.email || user?.email || ''); // Pre-fill email
        } else {
          setError('Failed to fetch profile. Please refresh the page.');
          console.error("Fetch Profile Error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchProfile();
    } else {
        setLoading(false);
        setError("User not logged in."); // Should be handled by ProtectedRoute
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
    if (e.target.files[0]) {
        setMessage(`Selected file: ${e.target.files[0].name}`);
    } else {
        setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    const formData = new FormData();
    // --- Append new fields, remove email ---
    formData.append('name', profileData.name);
    formData.append('enrollmentNumber', profileData.enrollmentNumber); // Added
    formData.append('age', profileData.age);
    formData.append('gender', profileData.gender);
    formData.append('skills', profileData.skills);
    formData.append('gpa', profileData.gpa);
    // --- End ---

    if (resumeFile) {
      formData.append('resume', resumeFile);
    } else if (!profileData.resumeURL) {
       setError('Resume file is required to create a profile.');
       setSaving(false);
       return;
    }

    try {
      const response = await api.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const savedData = response.data;
      // --- Update state after save ---
      setProfileData({
        name: savedData.name || '',
        enrollmentNumber: savedData.enrollmentNumber || '', // Update enrollment number
        age: savedData.age || '',
        gender: savedData.gender || 'Male',
        skills: savedData.skills ? savedData.skills.join(', ') : '',
        gpa: savedData.gpa || '',
        resumeURL: savedData.resumeURL || '',
      });
      setUserEmail(savedData.user?.email || userEmail); // Re-set email just in case
      // --- End ---
      setResumeFile(null);
      setMessage('Profile saved successfully!');

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please check your inputs.');
      console.error("Save Profile Error:", err);
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <p style={{ textAlign: 'center', marginTop: '30px' }}>Loading profile...</p>;

  return (
    <div className="form-container"> {/* Use form-container styles */}
      <h1>My Profile</h1>
      <form onSubmit={handleSubmit}>

        {/* --- Email (Read Only) --- */}
        <div className="form-group">
          <label htmlFor="email">Account Email (Read Only)</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userEmail} // Display email from state
            readOnly // Make it non-editable
            style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }} // Style as disabled
          />
        </div>
        {/* --- End Email --- */}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" value={profileData.name} onChange={handleChange} required />
        </div>

        {/* --- Enrollment Number --- */}
        <div className="form-group">
          <label htmlFor="enrollmentNumber">Enrollment Number</label>
          <input
            type="text"
            id="enrollmentNumber"
            name="enrollmentNumber"
            value={profileData.enrollmentNumber}
            onChange={handleChange}
            required
            placeholder="e.g., A12345678"
          />
        </div>
        {/* --- End Enrollment Number --- */}

         <div className="form-group">
          <label htmlFor="age">Age</label>
          <input type="number" id="age" name="age" value={profileData.age} onChange={handleChange} required min="16" /> {/* Added min age */}
        </div>

         <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select id="gender" name="gender" value={profileData.gender} onChange={handleChange} required >
             <option value="Male">Male</option>
             <option value="Female">Female</option>
             <option value="Other">Other</option>
          </select>
        </div>

         <div className="form-group">
          <label htmlFor="skills">Skills (comma-separated)</label>
          <input type="text" id="skills" name="skills" value={profileData.skills} onChange={handleChange} placeholder="e.g., React, Node.js, Python"/>
        </div>

         <div className="form-group">
          <label htmlFor="gpa">GPA (Optional)</label>
          <input type="number" step="0.01" id="gpa" name="gpa" value={profileData.gpa} onChange={handleChange} min="0" max="10"/> {/* Added min/max */}
        </div>

         <div className="form-group">
          <label htmlFor="resume">Resume (PDF, DOC, DOCX - Max 5MB)</label>
          <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx,.rtf" onChange={handleFileChange} /> {/* Added .rtf */}
          {profileData.resumeURL && !resumeFile && (
              <p style={{marginTop: '5px', fontSize: '0.8em'}}>
                Current Resume: <a href={`http://localhost:5000${profileData.resumeURL}`} target="_blank" rel="noopener noreferrer">View/Download</a>
                <small> (To replace, select a new file)</small>
              </p>
          )}
           {resumeFile && (
                <p style={{ marginTop: '5px', fontSize: '0.8em', color: 'green' }}>
                    New file selected: {resumeFile.name} (Will replace current on save)
                </p>
           )}
        </div>

        <button type="submit" className="form-button" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

      </form>
    </div>
  );
};

export default ProfilePage;