# IRL Assessment Platform - Backend Setup

## Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+ (or SQLite for development)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Database Setup

**Option A: PostgreSQL (Recommended for Production)**
```bash
# Create database
createdb irl_assessment

# Update .env with:
DATABASE_URL=postgresql://username:password@localhost:5432/irl_assessment
```

**Option B: SQLite (Easy for Development)**
```bash
# Update .env with:
DATABASE_URL=sqlite:./database.sqlite
```

### 4. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will:
- Start on port 3000 (or PORT in .env)
- Auto-create database tables
- Create admin account: `admin@irl.com` / `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires token)

### Assessments (Startup)
- `POST /api/assessments` - Create assessment
- `GET /api/assessments` - Get my assessments
- `GET /api/assessments/:id` - Get specific assessment

### Action Plans
- `POST /api/action-plans` - Create action plan (organization)
- `GET /api/action-plans/startup` - Get my action plans (startup)

### Organization
- `GET /api/organization/startups` - Get curated startups
- `GET /api/organization/startups/:id` - Get startup details
- `POST /api/organization/curate` - Curate a startup

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/assessments` - Get all assessments
- `GET /api/admin/action-plans` - Get all action plans
- `GET /api/admin/stats` - Get platform statistics

## User Types

1. **startup** - Completes assessments, views results and action plans
2. **organization** - Curates startups, views their assessments, creates action plans
3. **admin** - Full access to all data and users

## Database Schema

### users
- id, email, password, user_type, name, organization, created_at

### startup_profiles
- id, user_id, category, description, created_at

### assessments
- id, startup_id, category, answers (JSON), scores (JSON), irl_level, recommendations (JSON), created_at

### action_plans
- id, organization_id, startup_id, title, description, status, created_at

### curation_relationships
- id, organization_id, startup_id, created_at

## Frontend Integration

The frontend is located in the repository root. To connect:

1. The API service is in `js/api-service.js`
2. Update `API_BASE_URL` for production
3. Frontend uses JWT tokens for authentication
4. Tokens stored in localStorage as 'auth_token'

## Deployment

### Heroku
```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku config:set JWT_SECRET=your-secret-key
```

### Railway
1. Connect GitHub repo
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy automatically on push

### DigitalOcean App Platform
1. Create new app from GitHub
2. Add PostgreSQL database
3. Configure environment variables
4. Deploy

## Security Notes

⚠️ **Important for Production:**
1. Change `JWT_SECRET` to a long random string
2. Use strong passwords for admin account
3. Enable HTTPS
4. Set appropriate CORS origins
5. Use environment variables for all secrets
6. Enable rate limiting (already configured)
7. Regular security updates

## Development

```bash
# Run tests
npm test

# Run with auto-reload
npm run dev

# Check code style
npm run lint

# Format code
npm run format
```

## Troubleshooting

### Database connection errors
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database exists

### CORS errors
- Check FRONTEND_URL in .env
- Update server.js cors configuration

### Authentication errors
- Verify JWT_SECRET is set
- Check token in localStorage
- Token expires after 7 days

## Support

For issues, check:
- `/server.js` - Main server file
- `/js/api-service.js` - Frontend API client
- Console logs for detailed errors
