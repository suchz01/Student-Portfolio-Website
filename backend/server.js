const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const { corsOptions, serverConfig } = require('./config/server');
require('dotenv').config();  // Load environment variables

// Import routes
const profileRoutes = require('./routes/profileRoutes');
const externalRoutes = require('./routes/externalRoutes');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  if (serverConfig.isDev) {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/profile', profileRoutes);
app.use('/', externalRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: serverConfig.env,
    timestamp: new Date().toISOString()
  });
});

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: serverConfig.isDev ? err.message : 'Internal Server Error' 
  });
});

// Start the server
const PORT = serverConfig.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${serverConfig.env} mode`);
});
