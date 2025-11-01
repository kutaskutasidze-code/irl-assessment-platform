const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    organization_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Organizations table
  db.run(`CREATE TABLE organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Assessments table
  db.run(`CREATE TABLE assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    startup_id INTEGER NOT NULL,
    organization_id INTEGER,
    status TEXT DEFAULT 'draft',
    irl_level INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(startup_id) REFERENCES users(id)
  )`);

  // Insert demo data
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const orgPassword = bcrypt.hashSync('org123', 10);
  const startupPassword = bcrypt.hashSync('startup123', 10);

  db.run(`INSERT INTO organizations (name, type) VALUES ('Tech University', 'university')`);
  
  db.run(`INSERT INTO users (email, password, name, type, organization_id) VALUES 
    ('admin@irlplatform.com', '${adminPassword}', 'Admin User', 'admin', NULL),
    ('org@example.com', '${orgPassword}', 'Organization User', 'organization', 1),
    ('startup@example.com', '${startupPassword}', 'InnoTech Startup', 'startup', NULL)
  `);
});

// Serve HTML at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'IRL Assessment Platform API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      users: '/api/users',
      assessments: '/api/assessments'
    }
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, type: user.type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type
      }
    });
  });
});

// Get all assessments
app.get('/api/assessments', (req, res) => {
  db.all('SELECT * FROM assessments ORDER BY created_at DESC', (err, assessments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(assessments);
  });
});

// Create new assessment
app.post('/api/assessments', (req, res) => {
  const { startup_id, organization_id } = req.body;
  
  db.run(
    'INSERT INTO assessments (startup_id, organization_id) VALUES (?, ?)',
    [startup_id, organization_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Assessment created successfully' });
    }
  );
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`IRL Assessment Platform running on port ${PORT}`);
  });
}

module.exports = app;