const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Database - supports both PostgreSQL and SQLite
const useSQLite = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('sqlite');
const pool = useSQLite ? null : require('pg').Pool;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

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
      university: '/api/university/*',
      admin: '/api/admin/*'
    }
  });
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        category VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assessments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        startup_id INTEGER REFERENCES users(id),
        category VARCHAR(255),
        answers JSON,
        scores JSON,
        irl_level INTEGER,
        recommendations JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Action plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS action_plans (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        organization_id INTEGER REFERENCES users(id),
        startup_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, startup_id)
      )
    `);

    // Create admin account if doesn't exist
    const adminEmail = 'admin@irl.com';
    const adminCheck = await client.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminCheck.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, password, user_type, name) VALUES ($1, $2, $3, $4)',
        [adminEmail, hashedPassword, 'admin', 'System Administrator']
      );
      console.log('Admin account created: admin@irl.com / admin123');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Role checking middleware
function checkRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// AUTH ENDPOINTS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, user_type, name, organization, category, description } = req.body;

    if (!email || !password || !user_type || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['startup', 'organization', 'admin'].includes(user_type)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const client = await pool.connect();

    try {
      const result = await client.query(
        'INSERT INTO users (email, password, user_type, name, organization) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, user_type, name',
        [email, hashedPassword, user_type, name, organization]
      );

      const user = result.rows[0];

      if (user_type === 'startup') {
        await client.query(
          'INSERT INTO startup_profiles (user_id, category, description) VALUES ($1, $2, $3)',
          [user.id, category, description]
        );
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, user_type: user.user_type },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ token, user });
    } finally {
      client.release();
    }
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already registered' });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        user_type: user.user_type,
        name: user.name,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, user_type, name, organization FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ASSESSMENT ENDPOINTS (Startup)
app.post('/api/assessments', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { category, answers } = req.body;

    // Calculate scores for each dimension
    const scores = calculateScores(answers);
    const irlLevel = calculateIRLLevel(scores);
    const recommendations = generateRecommendations(scores, irlLevel);

    const result = await pool.query(
      'INSERT INTO assessments (startup_id, category, answers, scores, irl_level, recommendations) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, category, JSON.stringify(answers), JSON.stringify(scores), irlLevel, JSON.stringify(recommendations)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE startup_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

app.get('/api/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const assessment = result.rows[0];

    // Check permission
    if (req.user.user_type === 'startup' && assessment.startup_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to get assessment' });
  }
});

// ACTION PLAN ENDPOINTS
app.post('/api/action-plans', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { startup_id, title, description, status } = req.body;

    // Verify curation relationship
    const relationship = await pool.query(
      'SELECT * FROM curation_relationships WHERE organization_id = $1 AND startup_id = $2',
      [req.user.id, startup_id]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({ error: 'You can only create action plans for curated startups' });
    }

    const result = await pool.query(
      'INSERT INTO action_plans (organization_id, startup_id, title, description, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, startup_id, title, description, status || 'draft']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create action plan error:', error);
    res.status(500).json({ error: 'Failed to create action plan' });
  }
});

app.get('/api/action-plans/startup', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ap.*, u.name as organization_name, u.organization 
       FROM action_plans ap 
       JOIN users u ON ap.organization_id = u.id 
       WHERE ap.startup_id = $1 AND ap.status = 'published'
       ORDER BY ap.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get action plans error:', error);
    res.status(500).json({ error: 'Failed to get action plans' });
  }
});

// UNIVERSITY ENDPOINTS
app.get('/api/university/startups', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, sp.category, sp.description, cr.created_at as curated_at
       FROM curation_relationships cr
       JOIN users u ON cr.startup_id = u.id
       LEFT JOIN startup_profiles sp ON u.id = sp.user_id
       WHERE cr.organization_id = $1
       ORDER BY cr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get startups error:', error);
    res.status(500).json({ error: 'Failed to get startups' });
  }
});

app.get('/api/university/startups/:id', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    // Verify curation relationship
    const relationship = await pool.query(
      'SELECT * FROM curation_relationships WHERE organization_id = $1 AND startup_id = $2',
      [req.user.id, req.params.id]
    );

    if (relationship.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get startup details
    const startup = await pool.query(
      `SELECT u.id, u.email, u.name, sp.category, sp.description
       FROM users u
       LEFT JOIN startup_profiles sp ON u.id = sp.user_id
       WHERE u.id = $1`,
      [req.params.id]
    );

    // Get assessments
    const assessments = await pool.query(
      'SELECT * FROM assessments WHERE startup_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    // Get action plans
    const actionPlans = await pool.query(
      'SELECT * FROM action_plans WHERE startup_id = $1 AND organization_id = $2 ORDER BY created_at DESC',
      [req.params.id, req.user.id]
    );

    res.json({
      startup: startup.rows[0],
      assessments: assessments.rows,
      action_plans: actionPlans.rows
    });
  } catch (error) {
    console.error('Get startup details error:', error);
    res.status(500).json({ error: 'Failed to get startup details' });
  }
});

app.post('/api/university/curate', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { startup_email } = req.body;

    // Find startup by email
    const startup = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND user_type = $2',
      [startup_email, 'startup']
    );

    if (startup.rows.length === 0) {
      return res.status(404).json({ error: 'Startup not found' });
    }

    const result = await pool.query(
      'INSERT INTO curation_relationships (organization_id, startup_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, startup.rows[0].id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'Startup already curated' });
    } else {
      console.error('Curate startup error:', error);
      res.status(500).json({ error: 'Failed to curate startup' });
    }
  }
});

// ADMIN ENDPOINTS
app.get('/api/admin/users', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, user_type, name, organization, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

app.get('/api/admin/assessments', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.email, u.name 
       FROM assessments a 
       JOIN users u ON a.startup_id = u.id 
       ORDER BY a.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

app.get('/api/admin/action-plans', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ap.*, 
       u1.name as organization_name, u1.organization,
       u2.name as startup_name, u2.email as startup_email
       FROM action_plans ap
       JOIN users u1 ON ap.organization_id = u1.id
       JOIN users u2 ON ap.startup_id = u2.id
       ORDER BY ap.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all action plans error:', error);
    res.status(500).json({ error: 'Failed to get action plans' });
  }
});

app.get('/api/admin/stats', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE user_type = 'startup') as total_startups,
        (SELECT COUNT(*) FROM users WHERE user_type = 'organization') as total_universities,
        (SELECT COUNT(*) FROM assessments) as total_assessments,
        (SELECT COUNT(*) FROM action_plans) as total_action_plans,
        (SELECT COUNT(*) FROM curation_relationships) as total_curations
    `);
    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// HELPER FUNCTIONS
function calculateScores(answers) {
  const scores = {
    CRL: 0,  // Customer Readiness Level
    TRL: 0,  // Technology Readiness Level
    BRL: 0,  // Business Model Readiness Level
    IPRL: 0, // IP Readiness Level
    TMRL: 0, // Team Readiness Level
    FRL: 0   // Funding Readiness Level
  };

  // Question mapping to dimensions
  const questionMap = {
    1: 'CRL', 2: 'CRL', 3: 'CRL',
    4: 'TRL', 5: 'TRL', 6: 'TRL', 7: 'TRL',
    8: 'BRL', 9: 'BRL', 10: 'BRL',
    11: 'IPRL', 12: 'IPRL', 13: 'IPRL',
    14: 'TMRL', 15: 'TMRL', 16: 'TMRL', 17: 'TMRL',
    18: 'FRL', 19: 'FRL', 20: 'FRL'
  };

  const questionCounts = {
    CRL: 3, TRL: 4, BRL: 3, IPRL: 3, TMRL: 4, FRL: 3
  };

  Object.entries(answers).forEach(([question, answer]) => {
    const dimension = questionMap[parseInt(question)];
    if (dimension) {
      scores[dimension] += parseInt(answer);
    }
  });

  // Normalize scores to 0-9 scale
  Object.keys(scores).forEach(dimension => {
    const maxScore = questionCounts[dimension] * 5; // 5 is max answer value
    scores[dimension] = Math.round((scores[dimension] / maxScore) * 9);
  });

  return scores;
}

function calculateIRLLevel(scores) {
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  return Math.round(avgScore);
}

function generateRecommendations(scores, irlLevel) {
  const recommendations = [];
  const irlLevels = [
    'Hypothesis Stage',
    'Basic Research Stage',
    'Applied Research Stage',
    'Proof of Concept Stage',
    'Solution Validation Stage',
    'Market Validation Stage',
    'Solution Complete Stage',
    'Initial Adoption Stage',
    'Market Ready Stage'
  ];

  recommendations.push({
    type: 'overall',
    title: `IRL Level ${irlLevel}: ${irlLevels[irlLevel - 1]}`,
    description: getIRLDescription(irlLevel)
  });

  // Dimension-specific recommendations
  Object.entries(scores).forEach(([dimension, score]) => {
    if (score < 5) {
      recommendations.push({
        type: 'dimension',
        dimension,
        title: `Improve ${getDimensionName(dimension)}`,
        description: getDimensionRecommendation(dimension, score)
      });
    }
  });

  return recommendations;
}

function getIRLDescription(level) {
  const descriptions = [
    'Initial concept stage - focus on validating your hypothesis',
    'Basic research underway - continue building foundational knowledge',
    'Applied research in progress - start developing proof of concept',
    'Proof of concept developed - begin validation with early users',
    'Solution validation ongoing - refine based on user feedback',
    'Market validation in progress - expand user base',
    'Solution complete - prepare for full market launch',
    'Initial adoption achieved - scale operations',
    'Market ready - optimize for growth'
  ];
  return descriptions[level - 1];
}

function getDimensionName(dimension) {
  const names = {
    CRL: 'Customer Readiness',
    TRL: 'Technology Readiness',
    BRL: 'Business Model Readiness',
    IPRL: 'IP Readiness',
    TMRL: 'Team Readiness',
    FRL: 'Funding Readiness'
  };
  return names[dimension];
}

function getDimensionRecommendation(dimension, score) {
  const recommendations = {
    CRL: 'Focus on customer discovery and validation. Conduct more user interviews and gather feedback.',
    TRL: 'Invest in technology development and testing. Build prototypes and validate technical feasibility.',
    BRL: 'Refine your business model. Validate pricing, revenue streams, and unit economics.',
    IPRL: 'Strengthen IP protection. Consider patents, trademarks, and trade secrets strategy.',
    TMRL: 'Build out your team. Identify key skill gaps and recruit strategic advisors.',
    FRL: 'Develop funding strategy. Create financial projections and identify potential investors.'
  };
  return recommendations[dimension];
}

// Start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n=================================`);
      console.log(`Server running on port ${PORT}`);
      console.log(`=================================`);
      console.log(`\nAdmin login:`);
      console.log(`Email: admin@irl.com`);
      console.log(`Password: admin123`);
      console.log(`\n=================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
