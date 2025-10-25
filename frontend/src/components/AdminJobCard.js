import React from 'react';
import './AdminJobCard.css'; // Create CSS for styling

// MUI Imports for buttons/icons (optional but nice)
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import VisibilityIcon from '@mui/icons-material/Visibility';

const AdminJobCard = ({ job, onViewApplicants, onEdit, onDelete }) => {
  return (
    <div className="admin-job-card">
      <h3>{job.title}</h3>
      <h4>{job.company}</h4>
      <p>{job.description?.substring(0, 100)}...</p>
      <p><strong>Salary:</strong> {job.salary || 'Not specified'}</p>
      <p><small>Posted: {new Date(job.createdAt).toLocaleDateString()}</small></p>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
         {/* We'll add onClick handlers later */}
        <Button
            variant="outlined"
            size="small"
            onClick={() => onViewApplicants(job._id)}
            // startIcon={<VisibilityIcon />}
         >
            Applicants
         </Button>
         <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={() => onEdit(job._id)}
            // startIcon={<EditIcon />}
        >
            Edit
        </Button>
         <Button
            variant="outlined"
            size="small"
            color="error" // Use error color for delete
            onClick={() => onDelete(job._id)}
            // startIcon={<DeleteIcon />}
        >
            Delete
        </Button>
      </Box>
    </div>
  );
};

export default AdminJobCard;