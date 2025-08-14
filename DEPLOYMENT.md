# Deployment Guide

## Backend Deployment to Heroku

### Prerequisites
1. Heroku CLI installed
2. MongoDB Atlas account for production database
3. Git repository

### Steps:

1. **Create Heroku App:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

2. **Set Custom Domain:**
   ```bash
   heroku domains:add api.bloodconnect.mhrrony.com
   ```

3. **Configure Environment Variables:**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
   heroku config:set JWT_SECRET="your_super_secret_jwt_key"
   heroku config:set FRONTEND_URL="https://bloodconnect.mhrrony.com"
   heroku config:set NODE_ENV="production"
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

5. **Configure DNS:**
   - Point `api.bloodconnect.mhrrony.com` to your Heroku app's DNS target
   - Get the DNS target: `heroku domains`

## Frontend Deployment to Vercel

### Prerequisites
1. Vercel CLI installed or use Vercel dashboard
2. Git repository

### Steps:

1. **Install Vercel CLI (optional):**
   ```bash
   npm i -g vercel
   ```

2. **Deploy via CLI:**
   ```bash
   cd /path/to/your/frontend
   vercel
   ```

3. **Configure Environment Variables in Vercel:**
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add: `VITE_API_BASE_URL` = `https://api.bloodconnect.mhrrony.com/api`

4. **Configure Custom Domain:**
   - Go to Vercel Dashboard > Your Project > Settings > Domains
   - Add: `bloodconnect.mhrrony.com`

5. **DNS Configuration:**
   - Point `bloodconnect.mhrrony.com` to Vercel's DNS (usually `cname.vercel-dns.com`)

## Important Notes

### MongoDB Atlas Setup:
1. Create a cluster on MongoDB Atlas
2. Whitelist Heroku's IP addresses (or use 0.0.0.0/0 for all IPs)
3. Create a database user
4. Get the connection string

### Environment Variables Summary:

**Heroku (Backend):**
- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `FRONTEND_URL`: https://bloodconnect.mhrrony.com
- `NODE_ENV`: production

**Vercel (Frontend):**
- `VITE_API_BASE_URL`: https://api.bloodconnect.mhrrony.com/api

### Testing After Deployment:
1. Test API endpoints: `https://api.bloodconnect.mhrrony.com/api/auth/health`
2. Test frontend: `https://bloodconnect.mhrrony.com`
3. Test CORS by making API calls from frontend
4. Test authentication flow
5. Test donation functionality

### Troubleshooting:
- Check Heroku logs: `heroku logs --tail`
- Check Vercel function logs in dashboard
- Verify CORS configuration if getting cross-origin errors
- Ensure environment variables are set correctly
