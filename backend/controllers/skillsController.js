// This is our "database" of skills. You can add as many as you want.
const skillsList = [
  'C',
  'C++',
  'C#',
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Express',
  'MongoDB',
  'Mongoose',
  'SQL',
  'MySQL',
  'PostgreSQL',
  'HTML',
  'CSS',
  'Bootstrap',
  'Tailwind CSS',
  'Git',
  'GitHub',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'PHP',
  'Ruby',
  'Swift',
];

// @desc    Get all skills or search skills
// @route   GET /api/skills
// @access  Public
const getSkills = (req, res) => {
  const { search } = req.query; // Get a search query from the URL (e.g., /api/skills?search=c)

  if (search) {
    // If there's a search query, filter the list
    const filteredSkills = skillsList.filter((skill) =>
      skill.toLowerCase().includes(search.toLowerCase())
    );
    res.json(filteredSkills);
  } else {
    // Otherwise, send the entire list
    res.json(skillsList);
  }
};

module.exports = {
  getSkills,
};