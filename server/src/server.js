require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start server listener immediately
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` SpendSmart API Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(` Listening on port: ${PORT}`);
  console.log(` Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);

  // Attempt database connection
  connectDB();
});
