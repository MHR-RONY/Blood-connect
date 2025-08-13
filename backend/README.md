# Blood Connect Backend

A comprehensive MERN stack backend for the Blood Connect platform - connecting blood donors with recipients to save lives.

## 🩸 Features

### Core Functionality
- **User Management**: Registration, authentication, and profile management for donors and recipients
- **Blood Requests**: Create and manage blood requests with urgency levels
- **Donor Matching**: Smart algorithm to find compatible donors based on blood type and location
- **Emergency Alerts**: Critical blood shortage notifications
- **Donation Tracking**: Complete donation history and eligibility tracking
- **Admin Dashboard**: Comprehensive admin panel for platform management

### Blood Compatibility System
- **Smart Matching**: Automatic blood type compatibility checking
- **Universal Donor/Recipient**: O- and AB+ special handling
- **Compatibility Scoring**: Prioritize best matches for recipients
- **Shelf Life Management**: Track blood expiry dates and validity

### Location-Based Services
- **Bangladeshi Districts**: Complete coverage of all 64 districts
- **Distance Calculation**: Find nearby donors using geographic coordinates
- **Area-wise Search**: Detailed area selection within districts

### Communication System
- **Email Notifications**: Welcome emails, blood requests, donation confirmations
- **Emergency Alerts**: High-priority notifications for critical situations
- **SMS Integration**: Ready for SMS notification integration
- **Real-time Updates**: WebSocket support for instant notifications

### Security & Compliance
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: bcryptjs hashing with salt rounds
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Additional HTTP headers protection

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000

   # Database
   MONGODB_URI=mongodb://localhost:27017/bloodconnect

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Email Configuration (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@bloodconnect.com
   SUPPORT_EMAIL=support@bloodconnect.com

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # File Upload (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation**
   Visit `http://localhost:5000/api/health` - you should see:
   ```json
   {
     "status": "OK",
     "message": "Blood Connect API is running",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
POST /api/auth/forgot-password - Request password reset
POST /api/auth/reset-password  - Reset password with token
GET  /api/auth/me          - Get current user profile
```

### User Management
```
GET    /api/users/profile     - Get user profile
PUT    /api/users/profile     - Update user profile
POST   /api/users/upload-avatar - Upload profile picture
GET    /api/users/donors      - Search donors
GET    /api/users/statistics  - User statistics
```

### Blood Requests
```
GET    /api/requests          - Get all requests (with filters)
POST   /api/requests          - Create new blood request
GET    /api/requests/:id      - Get specific request
PUT    /api/requests/:id      - Update request
DELETE /api/requests/:id      - Delete request
POST   /api/requests/:id/respond - Respond to request
```

### Donations
```
GET    /api/donations         - Get donations (with filters)
POST   /api/donations         - Record new donation
GET    /api/donations/:id     - Get specific donation
PUT    /api/donations/:id     - Update donation
GET    /api/donations/history - User's donation history
GET    /api/donations/eligibility - Check donation eligibility
```

### Emergency System
```
GET    /api/emergency         - Get emergency requests
POST   /api/emergency         - Create emergency request
PUT    /api/emergency/:id     - Update emergency request
POST   /api/emergency/:id/alert - Send emergency alerts
```

### Admin Endpoints
```
GET    /api/admin/dashboard   - Admin dashboard statistics
GET    /api/admin/users       - Manage users
GET    /api/admin/donations   - Manage donations
GET    /api/admin/requests    - Manage requests
GET    /api/admin/emergency   - Manage emergency requests
GET    /api/admin/analytics   - Platform analytics
```

## 🏗️ Project Structure

```
backend/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── models/               # MongoDB schemas
│   ├── User.js           # User model (donors/recipients)
│   ├── Donation.js       # Donation records
│   ├── BloodRequest.js   # Blood requests
│   └── EmergencyRequest.js # Emergency requests
├── routes/               # API route handlers
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management
│   ├── requests.js       # Blood requests
│   ├── donations.js      # Donation management
│   ├── emergency.js      # Emergency system
│   └── admin.js          # Admin panel
├── middleware/           # Custom middleware
│   ├── auth.js           # JWT authentication
│   └── validation.js     # Input validation
└── utils/                # Utility functions
    ├── bloodUtils.js     # Blood compatibility logic
    └── emailService.js   # Email notifications
```

## 🔧 Configuration

### MongoDB Setup
The application connects to MongoDB using the `MONGODB_URI` environment variable. For local development:

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bloodconnect
```

### Email Configuration
Configure email service for notifications:

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASSWORD`

**Other Providers:**
- **SendGrid**: Set `EMAIL_HOST=smtp.sendgrid.net`
- **Mailgun**: Set `EMAIL_HOST=smtp.mailgun.org`
- **AWS SES**: Set `EMAIL_HOST=email-smtp.region.amazonaws.com`

### File Upload (Cloudinary)
For profile pictures and documents:
1. Create Cloudinary account
2. Get Cloud Name, API Key, and API Secret
3. Configure in environment variables

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Environment Setup
```bash
# Set production environment
NODE_ENV=production

# Use strong JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Configure production database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bloodconnect
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### PM2 Process Management
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name "blood-connect-api"

# Monitor
pm2 monit

# Auto-restart on file changes
pm2 start server.js --watch
```

## 📊 Monitoring & Analytics

### Health Check
The API includes a health check endpoint at `/api/health`:
```json
{
  "status": "OK",
  "message": "Blood Connect API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "version": "1.0.0"
}
```

### Logging
Application uses structured logging:
- **Development**: Console output with colors
- **Production**: JSON format for log aggregation
- **Error Tracking**: Automatic error reporting

### Metrics
Built-in metrics tracking:
- API response times
- Database query performance
- User activity statistics
- Blood request/donation trends

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-based Access**: Admin, donor, recipient roles
- **Password Security**: bcryptjs with salt rounds
- **Token Refresh**: Automatic token renewal

### API Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origins
- **Helmet Security**: XSS, CSRF, clickjacking protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection**: Protected by MongoDB and Mongoose

### Data Protection
- **Encryption**: Sensitive data encryption at rest
- **Privacy**: GDPR-compliant data handling
- **Audit Trail**: Complete action logging
- **Backup**: Automated database backups

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/blood-inventory`
3. Commit changes: `git commit -m 'Add blood inventory management'`
4. Push to branch: `git push origin feature/blood-inventory`
5. Submit pull request

### Code Standards
- **ESLint**: Airbnb JavaScript style guide
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### API Design Guidelines
- RESTful endpoints with proper HTTP methods
- Consistent error response format
- Comprehensive input validation
- Proper HTTP status codes
- Detailed API documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Contact Information
- **Email**: support@bloodconnect.com
- **Documentation**: [API Docs](https://api.bloodconnect.com/docs)
- **Issues**: [GitHub Issues](https://github.com/bloodconnect/backend/issues)

### Emergency Support
For critical issues affecting blood donation services:
- **Emergency Email**: emergency@bloodconnect.com
- **Phone**: +880-XXXX-XXXX

---

**Blood Connect Backend** - Connecting Hearts, Saving Lives through Technology

Built with ❤️ for humanity by the Blood Connect team.
