// index.js - IRL Assessment Platform with Frontend
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from root directory

// Simple in-memory storage for demo
const users = [];
const assessments = [];

// Serve HTML file at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for platform info
app.get('/api', (req, res) => {
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

// Catch all route - serve index.html for client-side routing
app.get('*', (req, res) => {
  if (!req.url.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Export for Vercel
module.exports = app;