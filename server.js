const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { findUserByCredentials } = require('./users');
const { authenticateToken, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to parse JSON
app.use(express.json());

// Login route - issues JWT token
app.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user (in real app, use proper authentication with hashed passwords)
    const user = findUserByCredentials(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token payload (don't include password)
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // Generate JWT token (expires in 1 hour)
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Public route - accessible without token
app.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public route - no token required!',
    timestamp: new Date().toISOString()
  });
});

// Protected route - requires valid JWT token
app.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route!',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// User profile route - requires authentication
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User profile retrieved successfully',
    user: req.user,
    profile: {
      memberSince: '2024-01-01',
      lastLogin: new Date().toISOString()
    }
  });
});

// Admin only route - requires admin role
app.get('/admin', authenticateToken, requireRole(['admin']), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin dashboard!',
    adminData: {
      totalUsers: 150,
      serverStatus: 'Active',
      secretInfo: 'This is super secret admin information'
    },
    user: req.user
  });
});

// Route to verify token
app.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('POST /login           - Login to get JWT token');
  console.log('GET  /public          - Public route (no auth required)');
  console.log('GET  /protected       - Protected route (requires JWT)');
  console.log('GET  /profile         - User profile (requires JWT)');
  console.log('GET  /admin           - Admin only route (requires admin role)');
  console.log('POST /verify-token    - Verify JWT token');
  console.log('\n🔐 Sample credentials:');
  console.log('User:  username="testuser", password="password123"');
  console.log('Admin: username="admin", password="admin123"');
});
