import React, { useState } from 'react';
import api from '../services/api';

// MUI Imports for styling
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

const JobForm = ({ onJobPosted }) => { // Callback to refresh job list
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/jobs', formData);
      setSuccess(`Job "${response.data.title}" posted successfully!`);
      setFormData({ title: '', company: '', description: '', salary: '' }); // Clear form
      if (onJobPosted) {
        onJobPosted(response.data); // Notify parent component
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
      console.error("Job Post Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TextField
        margin="normal"
        required
        fullWidth
        id="title"
        label="Job Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        autoFocus
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="company"
        label="Company Name"
        name="company"
        value={formData.company}
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="description"
        label="Job Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        multiline
        rows={4}
      />
      <TextField
        margin="normal"
        fullWidth
        id="salary"
        label="Salary (Optional)"
        name="salary"
        value={formData.salary}
        onChange={handleChange}
        placeholder="e.g., $80,000 per year, Not specified"
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }} // Primary color by default
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Post Job'}
      </Button>
    </Box>
  );
};

export default JobForm;