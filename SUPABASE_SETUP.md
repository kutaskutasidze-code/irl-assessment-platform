# Supabase Setup Guide

## Why Supabase?

✅ **Better than Vercel Postgres:**
- Full PostgreSQL database (not serverless-only)
- Built-in authentication
- Real-time subscriptions
- Storage for files
- Auto-generated REST API
- Free tier: 500MB database, 2GB bandwidth
- Better dashboard and SQL editor

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - **Name:** IRL Assessment Platform
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
5. Wait 2 minutes for project creation

### 2. Get Your Credentials
After project is created:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Initialize Database
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('startup', 'organization', 'admin')),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create startup profiles table
CREATE TABLE startup_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create assessments table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    answers JSONB NOT NULL,
    scores JSONB NOT NULL,
    irl_level INTEGER NOT NULL,
    recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create action plans table
CREATE TABLE action_plans (
    id SERIAL PRIMARY KEY,
    startup_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    checklist JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin user
INSERT INTO users (email, password, user_type, name) VALUES 
('admin@irl.com', '$2a$10$YourHashedPasswordHere', 'admin', 'Admin User');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assessments_startup ON assessments(startup_id);
CREATE INDEX idx_action_plans_startup ON action_plans(startup_id);
```

4. Click **Run** (bottom right)

### 4. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add these three variables:

```bash
JWT_SECRET=your-random-secret-key-here
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbG...your-key-here
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy to Vercel

```bash
# Already connected, just trigger deployment:
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_QuBRJsoYqUVWGjs85T8vcnq3BsvO/2ykUvA4mwE
```

## Testing Your API

After deployment completes:

```bash
# Test health check
curl https://your-project.vercel.app/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected"
}

# Test registration
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "user_type": "startup",
    "name": "Test Startup",
    "category": "SaaS"
  }'
```

## Advantages Over Vercel Postgres

| Feature | Supabase | Vercel Postgres |
|---------|----------|-----------------|
| Database Size | 500MB free | Limited |
| Dashboard | ✅ Excellent SQL editor | Basic |
| Real-time | ✅ Built-in | ❌ None |
| Authentication | ✅ Built-in | ❌ Build yourself |
| Storage | ✅ File storage included | ❌ None |
| Cost | $0-$25/month | $0.29/GB |
| Migrations | ✅ Easy | Manual |

## Supabase Dashboard Features

**SQL Editor:**
- Write and run SQL queries
- Save queries
- View table data

**Table Editor:**
- Visual table editor
- Add/edit rows directly
- Export data

**Authentication:**
- Can replace JWT with Supabase Auth
- Social logins (Google, GitHub, etc.)
- Magic links

**Storage:**
- Upload files (user avatars, certificates)
- Auto-generates URLs

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Initialize database with SQL
3. ✅ Add env variables to Vercel  
4. ✅ Deploy and test API
5. Update frontend to use production API URL
6. Consider using Supabase Auth instead of JWT

## Troubleshooting

**"Database connection failed"**
- Check SUPABASE_URL and SUPABASE_ANON_KEY in Vercel env variables
- Make sure they match values from Supabase dashboard

**"User not found after registration"**
- Check SQL ran successfully in Supabase
- Go to Table Editor → users to verify table exists

**"CORS error"**
- Already configured in server-serverless.js
- Vercel handles CORS automatically

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: Create issue in your repo
