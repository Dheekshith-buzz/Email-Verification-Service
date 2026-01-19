require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ENDPOINTS ====================

// 1. Home page
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Email Verification API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      test: 'GET /api/test',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      verification: {
        single: 'POST /api/verify/single',
        bulk: 'POST /api/verify/bulk',
        history: 'GET /api/verify/history'
      }
    }
  });
});

// 2. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'ok', 
    service: 'Email Verification API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 3. Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API is working correctly!',
    timestamp: new Date().toISOString()
  });
});

// ==================== AUTH ENDPOINTS ====================

// 4. Register user
app.post('/api/auth/register', (req, res) => {
  console.log('Register request:', req.body);
  
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email and password are required' 
    });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      success: false,
      error: 'Invalid email format' 
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      error: 'Password must be at least 6 characters' 
    });
  }
  
  // Mock response
  const mockUser = {
    id: Date.now(),
    email: email,
    apiKey: 'ev_' + Buffer.from(Date.now().toString()).toString('base64').substring(0, 20),
    credits: 100,
    isActive: true,
    createdAt: new Date().toISOString()
  };
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                   Buffer.from(JSON.stringify({ userId: mockUser.id, email: email })).toString('base64') +
                   '.mockSignature';
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: mockUser,
      token: mockToken
    }
  });
});

// 5. Login user
app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      success: false,
      error: 'Email and password are required' 
    });
  }
  
  // Mock user (in real app, check database)
  const mockUser = {
    id: 1,
    email: email,
    apiKey: 'ev_abc123def456ghi789',
    credits: 100,
    isActive: true,
    createdAt: '2024-01-15T10:30:00.000Z'
  };
  
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                   Buffer.from(JSON.stringify({ userId: 1, email: email })).toString('base64') +
                   '.mockSignature';
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: mockUser,
      token: mockToken
    }
  });
});

// 6. Get user profile
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token required' 
    });
  }
  
  const mockUser = {
    id: 1,
    email: 'user@example.com',
    apiKey: 'ev_abc123def456ghi789',
    credits: 95,
    isActive: true,
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: {
      user: mockUser
    }
  });
});

// ==================== VERIFICATION ENDPOINTS ====================

// 7. Verify single email
app.post('/api/verify/single', (req, res) => {
  const authHeader = req.headers.authorization;
  const { email } = req.body;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token required' 
    });
  }
  
  if (!email) {
    return res.status(400).json({ 
      success: false,
      error: 'Email is required' 
    });
  }
  
  // Mock verification logic
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isDisposable = email.includes('tempmail') || 
                      email.includes('mailinator') || 
                      email.includes('10minutemail');
  const isRoleAccount = email.split('@')[0].match(/^(admin|support|info|contact|sales|help)/i) !== null;
  const hasMx = email.includes('gmail') || 
               email.includes('yahoo') || 
               email.includes('outlook');
  
  const status = !isValid ? 'invalid_format' :
                 isDisposable ? 'disposable' :
                 !hasMx ? 'no_mx_records' : 'valid';
  
  const verification = {
    id: Date.now(),
    email: email,
    isValid: status === 'valid',
    isDisposable: isDisposable,
    isRoleAccount: isRoleAccount,
    status: status,
    mxRecords: hasMx ? [{ exchange: 'mx.example.com', priority: 10 }] : [],
    smtpResponse: status === 'valid' ? '250 Accepted' : '550 Rejected',
    createdAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: `Email verification ${status === 'valid' ? 'successful' : 'failed'}`,
    data: {
      verification: verification,
      creditsRemaining: 99
    }
  });
});

// 8. Bulk verification (mock)
app.post('/api/verify/bulk', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token required' 
    });
  }
  
  res.json({
    success: true,
    message: 'Bulk verification started',
    data: {
      batchId: 'batch_' + Date.now(),
      status: 'processing',
      estimatedTime: '30 seconds'
    }
  });
});

// 9. Verification history (mock)
app.get('/api/verify/history', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication token required' 
    });
  }
  
  const mockHistory = [
    {
      id: 1,
      email: 'test@gmail.com',
      status: 'valid',
      isValid: true,
      createdAt: '2024-01-15T10:30:00.000Z'
    },
    {
      id: 2,
      email: 'admin@company.com',
      status: 'role_account',
      isValid: true,
      createdAt: '2024-01-15T09:15:00.000Z'
    }
  ];
  
  res.json({
    success: true,
    data: {
      verifications: mockHistory,
      total: 2,
      page: 1,
      limit: 20
    }
  });
});

// ==================== ERROR HANDLERS ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found',
    requested: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'POST /api/verify/single',
      'POST /api/verify/bulk',
      'GET /api/verify/history'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 SERVER STARTED SUCCESSFULLY`);
  console.log('='.repeat(60));
  console.log(`Port: ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n📋 TEST THESE ENDPOINTS IN POSTMAN:');
  console.log('');
  console.log('1. GET    http://localhost:5000/');
  console.log('2. GET    http://localhost:5000/api/health');
  console.log('3. GET    http://localhost:5000/api/test');
  console.log('');
  console.log('4. POST   http://localhost:5000/api/auth/register');
  console.log('   Body: {"email":"test@example.com","password":"password123"}');
  console.log('');
  console.log('5. POST   http://localhost:5000/api/auth/login');
  console.log('   Body: {"email":"test@example.com","password":"password123"}');
  console.log('');
  console.log('6. GET    http://localhost:5000/api/auth/profile');
  console.log('   Header: Authorization: Bearer [token_from_register_or_login]');
  console.log('');
  console.log('7. POST   http://localhost:5000/api/verify/single');
  console.log('   Header: Authorization: Bearer [token]');
  console.log('   Body: {"email":"test@gmail.com"}');
  console.log('='.repeat(60));
});