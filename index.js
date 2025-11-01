// index.js - Simplified version for Vercel deployment
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory storage for demo
const users = [];
const assessments = [];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'IRL Assessment Platform API',
    version: '1.0.0',
    github: 'https://github.com/kutaskutasidze-code/irl-assessment-platform',
    endpoints: {
      health: 'GET /api/health',
      demo: 'GET /api/demo'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Demo endpoint
app.get('/api/demo', (req, res) => {
  res.json({
    message: 'IRL Platform Demo',
    features: [
      'Startup Assessment',
      'Organization Management',
      'Action Plans',
      '20 Industry Categories',
      '6 Dimension Scoring'
    ],
    testAccounts: {
      admin: 'admin@irlplatform.com / admin123',
      organization: 'org@example.com / org123',
      startup: 'startup@example.com / startup123'
    }
  });
});

// Basic auth endpoint for demo
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const demoAccounts = {
    'admin@irlplatform.com': { password: 'admin123', type: 'admin', name: 'Admin User' },
    'org@example.com': { password: 'org123', type: 'organization', name: 'Tech University' },
    'startup@example.com': { password: 'startup123', type: 'startup', name: 'InnoTech' }
  };
  
  if (demoAccounts[email] && demoAccounts[email].password === password) {
    res.json({
      success: true,
      user: {
        email,
        type: demoAccounts[email].type,
        name: demoAccounts[email].name
      },
      token: 'demo-token-' + Date.now()
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Export for Vercel
module.exports = app;