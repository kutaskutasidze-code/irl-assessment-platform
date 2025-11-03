const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DatabaseAdapter = require('./database-adapter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database connection using adapter
const db = new DatabaseAdapter();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'IRL Assessment System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      assessments: '/api/assessments/*',
      organization: '/api/organization/*',
      admin: '/api/admin/*'
    }
  });
});

// Initialize database tables
async function initializeDatabase() {
  const client = await db.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL,
        name VARCHAR(255),
        organization VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Startup profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS startup_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        category VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assessments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_id INTEGER REFERENCES users(id),
        category VARCHAR(255),
        answers TEXT,
        scores TEXT,
        irl_level INTEGER,
        recommendations TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Action plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS action_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES users(id),
        startup_id INTEGER REFERENCES users(id),
        title VARCHAR(255),
        description TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Curation relationships table
    await client.query(`
      CREATE TABLE IF NOT EXISTS curation_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER REFERENCES users(id),
        startup_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, startup_id)
      )
    `);

    // Create admin account if doesn't exist
    const adminEmail = 'admin@irl.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, password, user_type, name) VALUES (?, ?, ?, ?)',
        [adminEmail, hashedPassword, 'admin', 'System Administrator']
      );
      console.log('✅ Admin account created: admin@irl.com / admin123');
    }

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Note: Keeping all other endpoints from original server.js
// This file just shows the fixes needed at the top
