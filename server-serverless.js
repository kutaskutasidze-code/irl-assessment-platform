// Serverless server compatible with Supabase
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || 'change-this-in-production';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: supabase ? 'connected' : 'disconnected',
    jwtConfigured: JWT_SECRET && JWT_SECRET !== 'change-this-in-production' ? 'yes' : 'no'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'IRL Assessment System API',
    version: '1.0.1',
    database: 'Supabase',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      assessments: '/api/assessments/*',
      organization: '/api/organization/*',
      admin: '/api/admin/*'
    }
  });
});

// Root route handler
app.get('/', (req, res) => {
  res.json({ 
    message: 'IRL Assessment Platform Backend API',
    version: '1.0.1',
    status: 'running',
    frontend: 'https://kutaskutasidze-code.github.io/irl-assessment-platform/',
    api_docs: '/api',
    health_check: '/api/health'
  });
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      console.error('JWT_SECRET being used:', JWT_SECRET ? 'SET' : 'NOT SET');
      
      // More specific error messages
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please log in again.' });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: 'Invalid token. Please log in again.' });
      } else {
        return res.status(403).json({ error: 'Token verification failed. Please log in again.' });
      }
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

    const { data: user, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword, 
        user_type, 
        name, 
        organization 
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      throw error;
    }

    if (user_type === 'startup' && category) {
      await supabase
        .from('startup_profiles')
        .insert([{ 
          user_id: user.id, 
          category, 
          description 
        }]);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '30d' }  // Extended to 30 days
    );
    
    console.log('Login successful for:', user.email, 'Type:', user.user_type);
    console.log('Token generated with secret:', JWT_SECRET ? 'SET' : 'NOT SET');

    res.json({ token, user: { id: user.id, email: user.email, user_type: user.user_type, name: user.name } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      JWT_SECRET,
      { expiresIn: '30d' }  // Extended to 30 days
    );
    
    console.log('Registration successful for:', user.email, 'Type:', user.user_type);
    console.log('Token generated with secret:', JWT_SECRET ? 'SET' : 'NOT SET');

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
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, user_type, name, organization')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ASSESSMENT ENDPOINTS
app.post('/api/assessments', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { category, answers } = req.body;

    const scores = calculateScores(answers);
    const irlLevel = calculateIRLLevel(scores);
    const recommendations = generateRecommendations(scores, irlLevel);

    const { data: assessment, error } = await supabase
      .from('assessments')
      .insert([{
        startup_id: req.user.id,
        category,
        answers: JSON.stringify(answers),
        scores: JSON.stringify(scores),
        irl_level: irlLevel,
        recommendations: JSON.stringify(recommendations)
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/api/assessments', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('startup_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to get assessments' });
  }
});

// Helper functions
function calculateScores(answers) {
  const scores = {
    business: 0,
    technology: 0,
    customer: 0,
    operations: 0,
    financial: 0
  };

  Object.keys(answers).forEach(key => {
    const value = parseInt(answers[key]) || 0;
    scores.business += value / 5;
    scores.technology += value / 5;
    scores.customer += value / 5;
    scores.operations += value / 5;
    scores.financial += value / 5;
  });

  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(100, Math.round(scores[key] * 5));
  });

  return scores;
}

function calculateIRLLevel(scores) {
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  return Math.min(9, Math.max(1, Math.ceil(avgScore / 11)));
}

function generateRecommendations(scores, irlLevel) {
  return {
    level: irlLevel,
    title: `IRL Level ${irlLevel}`,
    description: 'Continue building your startup readiness'
  };
}

// Admin endpoints
app.get('/api/admin/stats', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { count: totalStartups } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'startup');

    const { count: totalOrganizations } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('user_type', 'organization');

    const { count: totalAssessments } = await supabase
      .from('assessments')
      .select('*', { count: 'exact', head: true });

    res.json({
      total_startups: totalStartups || 0,
      total_organizations: totalOrganizations || 0,
      total_assessments: totalAssessments || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ORGANIZATION-STARTUP CONNECTION ENDPOINTS

// Search startups (for organizations)
app.get('/api/organization/search-startups', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { query } = req.query;
    
    const { data: startups, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('user_type', 'startup')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;

    res.json(startups || []);
  } catch (error) {
    console.error('Search startups error:', error);
    res.status(500).json({ error: 'Failed to search startups' });
  }
});

// Send invitation to startup (from organization)
app.post('/api/organization/invite-startup', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { startup_id } = req.body;

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('organization_connections')
      .select('*')
      .eq('organization_id', req.user.id)
      .eq('startup_id', startup_id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Connection already exists' });
    }

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .insert([{
        organization_id: req.user.id,
        startup_id: startup_id,
        status: 'pending',
        invited_by: 'organization'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Invite startup error:', error);
    res.status(500).json({ error: 'Failed to send invitation' });
  }
});

// Get my connected startups (for organizations)
app.get('/api/organization/startups', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { data: connections, error } = await supabase
      .from('organization_connections')
      .select(`
        id,
        startup_id,
        status,
        created_at,
        users!organization_connections_startup_id_fkey(id, email, name)
      `)
      .eq('organization_id', req.user.id)
      .eq('status', 'accepted');

    if (error) throw error;

    res.json(connections || []);
  } catch (error) {
    console.error('Get startups error:', error);
    res.status(500).json({ error: 'Failed to get startups' });
  }
});

// Get pending invitations (for organizations)
app.get('/api/organization/pending-invitations', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { data: invitations, error } = await supabase
      .from('organization_connections')
      .select(`
        id,
        startup_id,
        status,
        invited_by,
        created_at,
        users!organization_connections_startup_id_fkey(id, email, name)
      `)
      .eq('organization_id', req.user.id)
      .eq('status', 'pending');

    if (error) throw error;

    res.json(invitations || []);
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
});

// Respond to join request (for organizations)
app.post('/api/organization/respond-request', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { connection_id, action } = req.body; // action: 'accept' or 'reject'

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', connection_id)
      .eq('organization_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

// STARTUP CONNECTION ENDPOINTS

// Search organizations (for startups)
app.get('/api/startup/search-organizations', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { query } = req.query;
    
    const { data: organizations, error } = await supabase
      .from('users')
      .select('id, email, name, organization, created_at')
      .eq('user_type', 'organization')
      .or(`name.ilike.%${query}%,organization.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;

    res.json(organizations || []);
  } catch (error) {
    console.error('Search organizations error:', error);
    res.status(500).json({ error: 'Failed to search organizations' });
  }
});

// Request to join organization (from startup)
app.post('/api/startup/request-join', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { organization_id } = req.body;

    // Check if connection already exists
    const { data: existing } = await supabase
      .from('organization_connections')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('startup_id', req.user.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Request already exists' });
    }

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .insert([{
        organization_id: organization_id,
        startup_id: req.user.id,
        status: 'pending',
        invited_by: 'startup'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Request join error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

// Get my organizations (for startups)
app.get('/api/startup/organizations', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { data: connections, error } = await supabase
      .from('organization_connections')
      .select(`
        id,
        organization_id,
        status,
        created_at,
        users!organization_connections_organization_id_fkey(id, email, name, organization)
      `)
      .eq('startup_id', req.user.id)
      .eq('status', 'accepted');

    if (error) throw error;

    res.json(connections || []);
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to get organizations' });
  }
});

// Get pending invitations (for startups)
app.get('/api/startup/pending-invitations', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { data: invitations, error } = await supabase
      .from('organization_connections')
      .select(`
        id,
        organization_id,
        status,
        invited_by,
        created_at,
        users!organization_connections_organization_id_fkey(id, email, name, organization)
      `)
      .eq('startup_id', req.user.id)
      .eq('status', 'pending');

    if (error) throw error;

    res.json(invitations || []);
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({ error: 'Failed to get invitations' });
  }
});

// Respond to invitation (for startups)
app.post('/api/startup/respond-invitation', authenticateToken, checkRole('startup'), async (req, res) => {
  try {
    const { connection_id, action } = req.body; // action: 'accept' or 'reject'

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', connection_id)
      .eq('startup_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Respond to invitation error:', error);
    res.status(500).json({ error: 'Failed to respond to invitation' });
  }
});

// Generic connection endpoints (work for both startups and orgs)
app.get('/api/connections/my-connections', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.type;

    let query = supabase
      .from('organization_connections')
      .select(`
        id,
        organization_id,
        startup_id,
        status,
        invited_by,
        created_at,
        organization:users!organization_connections_organization_id_fkey(id, email, organization_name:organization),
        startup:users!organization_connections_startup_id_fkey(id, email, startup_name:name)
      `);

    if (userType === 'startup') {
      query = query.eq('startup_id', userId);
    } else if (userType === 'organization') {
      query = query.eq('organization_id', userId);
    }

    const { data: connections, error } = await query;

    if (error) throw error;

    // Format the response
    const formatted = (connections || []).map(conn => ({
      id: conn.id,
      organization_id: conn.organization_id,
      startup_id: conn.startup_id,
      status: conn.status,
      invited_by: conn.invited_by,
      created_at: conn.created_at,
      organization_name: conn.organization?.organization_name,
      organization_email: conn.organization?.email,
      startup_name: conn.startup?.startup_name,
      startup_email: conn.startup?.email
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get my connections error:', error);
    res.status(500).json({ error: 'Failed to get connections' });
  }
});

app.post('/api/connections/send-request', authenticateToken, async (req, res) => {
  try {
    const { target_id, invited_by } = req.body;
    const userId = req.user.id;

    let insertData = {
      status: 'pending',
      invited_by: invited_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (invited_by === 'startup') {
      insertData.startup_id = userId;
      insertData.organization_id = target_id;
    } else if (invited_by === 'organization') {
      insertData.organization_id = userId;
      insertData.startup_id = target_id;
    }

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ error: 'Failed to send request' });
  }
});

app.post('/api/connections/respond', authenticateToken, async (req, res) => {
  try {
    const { connection_id, action } = req.body;

    const { data: connection, error } = await supabase
      .from('organization_connections')
      .update({ 
        status: action === 'accepted' ? 'accepted' : 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', connection_id)
      .select()
      .single();

    if (error) throw error;

    res.json(connection);
  } catch (error) {
    console.error('Respond to connection error:', error);
    res.status(500).json({ error: 'Failed to respond to connection' });
  }
});

// Action Plans endpoints
app.post('/api/action-plans', authenticateToken, checkRole('organization'), async (req, res) => {
  try {
    const { startup_id, title, description, checklist } = req.body;

    const { data: actionPlan, error } = await supabase
      .from('action_plans')
      .insert([{
        organization_id: req.user.id,
        startup_id,
        title,
        description,
        checklist: JSON.stringify(checklist)
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(actionPlan);
  } catch (error) {
    console.error('Create action plan error:', error);
    res.status(500).json({ error: 'Failed to create action plan' });
  }
});

app.get('/api/action-plans/startup/:startupId', authenticateToken, async (req, res) => {
  try {
    const { startupId } = req.params;

    const { data: actionPlans, error } = await supabase
      .from('action_plans')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(actionPlans || []);
  } catch (error) {
    console.error('Get action plans error:', error);
    res.status(500).json({ error: 'Failed to get action plans' });
  }
});

app.get('/api/action-plans/my', authenticateToken, async (req, res) => {
  try {
    let query = supabase
      .from('action_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.user.type === 'startup') {
      query = query.eq('startup_id', req.user.id);
    } else if (req.user.type === 'organization') {
      query = query.eq('organization_id', req.user.id);
    }

    const { data: actionPlans, error } = await query;

    if (error) throw error;

    res.json(actionPlans || []);
  } catch (error) {
    console.error('Get my action plans error:', error);
    res.status(500).json({ error: 'Failed to get action plans' });
  }
});

app.patch('/api/action-plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;

    const { data: actionPlan, error } = await supabase
      .from('action_plans')
      .update({ 
        checklist: JSON.stringify(checklist),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(actionPlan);
  } catch (error) {
    console.error('Update action plan error:', error);
    res.status(500).json({ error: 'Failed to update action plan' });
  }
});

module.exports = app;
