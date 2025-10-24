// 1. Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

// 2. Import all other packages
const express = require('express');
const cors = require('cors');
const path = require('path'); // For serving static files
const connectDB = require('./config/db');

// Import all route files
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const skillsRoutes = require('./routes/skillsRoutes'); // <-- Our new skills route

// 3. Connect to the database
connectDB();

// 4. Create the Express app
const app = express();

// 5. Use middleware (they must come BEFORE your routes)
// This allows your server to accept JSON data
app.use(express.json());
// This allows your server to be called from other origins
app.use(cors());

// 6. Define the routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Tell the app to use your route files
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/skills', skillsRoutes);

// --- Make 'uploads' folder public ---
// This creates a static path. Any file in /uploads will be accessible
// e.g., http://localhost:5000/uploads/resume-12345.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 7. Define the port and start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});