const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const verificationRoutes = require('./routes/verification');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Create uploads directory
const fs = require('fs');
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Email Verification API',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/verify', verificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Multer file upload errors
  if (err.message && err.message.includes('file upload')) {
    return res.status(400).json({ 
      error: 'File upload error',
      message: err.message 
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation error',
      message: err.message 
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      error: 'Invalid token' 
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Initialize database connection
const initializeApp = async () => {
  try {
    await testConnection();
    console.log('✅ Database connected successfully');
    
    // Sync models (use with caution in production)
    if (process.env.NODE_ENV === 'development') {
      const { sequelize } = require('./models');
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
    
    return { app }; // Return app in an object
  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    throw error; // Re-throw to be caught in server.js
  }
};

// Export both app and initializeApp
module.exports = { app, initializeApp };