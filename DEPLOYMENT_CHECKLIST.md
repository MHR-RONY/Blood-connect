# Deployment Checklist

## Pre-Deployment Checklist

### Backend (Heroku)
- [ ] MongoDB Atlas cluster created and configured
- [ ] Heroku app created
- [ ] Environment variables configured in Heroku
- [ ] Custom domain `api.bloodconnect.mhrrony.com` added to Heroku
- [ ] DNS records pointed to Heroku
- [ ] CORS configuration updated for production domain
- [ ] SSL certificate enabled

### Frontend (Vercel)
- [ ] Vercel project created
- [ ] Environment variables configured in Vercel
- [ ] Custom domain `bloodconnect.mhrrony.com` added to Vercel
- [ ] DNS records pointed to Vercel
- [ ] Build optimizations configured

## Deployment Commands

### Backend Deployment:
```bash
cd backend
git add .
git commit -m "Production deployment"
git push heroku main
```

### Frontend Deployment:
```bash
# Via Vercel CLI
vercel --prod

# Or via Git (if connected to Vercel)
git push origin main
```

## Post-Deployment Testing

### API Health Check:
```bash
curl https://api.bloodconnect.mhrrony.com/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "message": "Blood Connect API is running",
  "timestamp": "2025-08-14T..."
}
```

### Frontend Testing:
1. Visit: https://bloodconnect.mhrrony.com
2. Test user registration/login
3. Test blood donation forms
4. Test find donors functionality
5. Test contact donor modal
6. Test emergency requests

### CORS Testing:
- Open browser dev tools
- Make API calls from frontend
- Ensure no CORS errors in console

## Environment Variables Reference

### Heroku Config Vars:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
FRONTEND_URL=https://bloodconnect.mhrrony.com
NODE_ENV=production
```

### Vercel Environment Variables:
```
VITE_API_BASE_URL=https://api.bloodconnect.mhrrony.com/api
```

## DNS Configuration

### For api.bloodconnect.mhrrony.com:
- Type: CNAME
- Name: api
- Value: [Your Heroku app DNS target]

### For bloodconnect.mhrrony.com:
- Type: CNAME
- Name: bloodconnect (or @)
- Value: cname.vercel-dns.com

## Monitoring

### Heroku:
- Monitor app performance in Heroku dashboard
- Check logs: `heroku logs --tail`
- Monitor dyno usage

### Vercel:
- Monitor function executions
- Check build logs
- Monitor performance metrics

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Check backend CORS configuration
2. **API Not Found**: Verify backend deployment and domain
3. **Build Failures**: Check environment variables and dependencies
4. **SSL Issues**: Ensure SSL is enabled on both platforms
