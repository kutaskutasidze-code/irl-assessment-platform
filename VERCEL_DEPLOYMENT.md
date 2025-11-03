# Vercel Deployment Guide

## Prerequisites
✅ Vercel account connected to GitHub repository
✅ Repository: `kutaskutasidze-code/irl-assessment-platform`

## Step 1: Set Up Vercel Postgres Database

1. Go to your Vercel dashboard
2. Select your project (or create new from GitHub)
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **Postgres**
6. Choose database name: `irl-assessment-db`
7. Click **Create**

Vercel will automatically:
- Create PostgreSQL database
- Add environment variables (`POSTGRES_URL`, etc.)
- Connect to your project

## Step 2: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
JWT_SECRET=your-long-random-secret-key-here
NODE_ENV=production
```

**To generate JWT_SECRET:**
```bash
# Run this in terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Initialize Database Tables

After first deployment, run these SQL commands in Vercel Postgres dashboard:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Startup profiles
CREATE TABLE IF NOT EXISTS startup_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  startup_id INTEGER REFERENCES users(id),
  category VARCHAR(255),
  answers JSONB,
  scores JSONB,
  irl_level INTEGER,
  recommendations JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action plans
CREATE TABLE IF NOT EXISTS action_plans (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES users(id),
  startup_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Curation relationships
CREATE TABLE IF NOT EXISTS curation_relationships (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES users(id),
  startup_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, startup_id)
);

-- Create admin account
INSERT INTO users (email, password, user_type, name) 
VALUES (
  'admin@irl.com', 
  '$2a$10$YourHashedPasswordHere',  -- Hash 'admin123' with bcrypt
  'admin', 
  'System Administrator'
) ON CONFLICT (email) DO NOTHING;
```

**To generate admin password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

## Step 4: Deploy

### Option A: Automatic (Recommended)
```bash
git add -A
git commit -m "Add Vercel deployment config"
git push origin main
```

Vercel will automatically:
- Detect the push
- Build the project
- Deploy frontend + backend

### Option B: Manual via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## Step 5: Update Frontend API URL

After deployment, get your Vercel URL (e.g., `your-project.vercel.app`)

Update `js/api-service.js`:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://your-project.vercel.app';  // ← Update this
```

Commit and push:
```bash
git add js/api-service.js
git commit -m "Update API URL for production"
git push origin main
```

## Step 6: Test

1. Visit: `https://your-project.vercel.app`
2. Test login: `admin@irl.com` / `admin123`
3. Create test accounts
4. Take an assessment
5. Verify data persists

## Troubleshooting

### Database Connection Errors
- Check Vercel Dashboard → Storage → Postgres is running
- Verify environment variables are set
- Check deployment logs for errors

### API Not Working
- Ensure `/api/*` routes are working: test `https://your-project.vercel.app/api/health`
- Check Vercel Functions logs in dashboard
- Verify `vercel.json` routing is correct

### Tables Not Created
- Run SQL commands manually in Vercel Postgres dashboard
- Check for syntax errors in table creation

## Monitoring

**Vercel Dashboard:**
- Deployments → See build logs
- Functions → See API request logs
- Analytics → Monitor performance
- Storage → Manage database

## Costs

**Free Tier Includes:**
- Hobby projects: Free
- Postgres: 256 MB (plenty for testing)
- Serverless functions: 100 GB-hours/month
- Bandwidth: 100 GB/month

**Upgrade when needed:**
- More database storage
- More function invocations
- Custom domains

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Initialize database
3. ✅ Test with real users
4. Add custom domain (optional)
5. Monitor usage and performance

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- GitHub Issues: Report problems in the repository
