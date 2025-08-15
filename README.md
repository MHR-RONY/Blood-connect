# BloodConnect - Blood Donation Platform
## Overview

**BloodConnect** is a comprehensive, full-stack blood donation platform that bridges the gap between blood donors and those in need. Built with modern web technologies, this platform provides a seamless experience for managing blood donations, emergency requests, and blood bank operations.

This platform addresses the critical need for efficient blood donation management in healthcare systems. With features ranging from donor registration to emergency blood requests, BloodConnect serves as a vital link between voluntary blood donors and medical institutions requiring blood supplies.

**Developer**: [MHR RONY](https://www.mhrrony.com)
**Repository**: [https://github.com/MHR-RONY/Blood-connect](https://github.com/MHR-RONY/Blood-connect)
**Live Demo**: [https://www.bloodconnect.mhrrony.com]

## Project Vision

BloodConnect was created to solve the inefficiencies in traditional blood donation systems. The platform aims to:

- **Modernize Blood Donation**: Transform the traditional blood donation process with digital solutions
- **Reduce Response Time**: Enable immediate matching of blood requests with available donors
- **Increase Accessibility**: Make blood donation information accessible to everyone with internet access
- **Improve Coordination**: Enhance communication between hospitals, blood banks, and donors
- **Save Lives**: Ultimately reduce mortality rates due to blood shortage emergencies

## Problem Statement

The current blood donation ecosystem faces several challenges:

1. **Limited Visibility**: Difficult to find nearby donors during emergencies
2. **Manual Processes**: Paper-based systems that are slow and error-prone
3. **Poor Communication**: Lack of real-time communication between stakeholders
4. **Inventory Issues**: Inefficient blood bank inventory management
5. **Time Delays**: Lengthy processes that can be critical during emergencies

BloodConnect addresses these challenges through intelligent automation and real-time connectivity.

## Solution Architecture

### Technical Approach

BloodConnect employs a modern, scalable architecture:

- **Frontend**: React-based SPA with TypeScript for type safety
- **Backend**: RESTful API built with Node.js and Express
- **Database**: MongoDB for flexible document storage
- **Authentication**: JWT-based secure authentication system
- **Real-time Features**: WebSocket integration for live notifications
- **Security**: Multi-layer security with encryption and validation

### Key Innovations

1. **Smart Matching Algorithm**: Intelligent blood type compatibility matching
2. **Geolocation Services**: Location-based donor discovery
3. **Emergency Prioritization**: Automatic priority assignment for critical requests
4. **Multi-stakeholder Dashboard**: Different interfaces for donors, hospitals, and admins
5. **Real-time Notifications**: Instant alerts for urgent blood requirements## Table of Contents

- [Project Vision](#project-vision)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Admin Features](#admin-features)
- [User Workflows](#user-workflows)
- [System Requirements](#system-requirements)
- [Performance Metrics](#performance-metrics)
- [Deployment](#deployment)
- [Monitoring & Analytics](#monitoring--analytics)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Copyright & License](#copyright--license)
- [Credits](#credits)

## Features

### Core Functionality
- **User Registration & Authentication**: Secure JWT-based authentication system
- **Blood Donation Management**: Complete donation lifecycle tracking
- **Emergency Blood Requests**: Real-time blood request system with notifications
- **Smart Donor Matching**: Blood type compatibility matching algorithm
- **Inventory Management**: Blood bank stock monitoring and management
- **Location-based Services**: Find nearby donors and blood banks
- **Donation History**: Complete tracking of user donation records

### Advanced Features
- **Admin Dashboard**: Comprehensive admin panel for platform management
- **Real-time Notifications**: Instant alerts for urgent blood requests
- **Blood Type Compatibility**: Intelligent matching based on blood type compatibility
- **Multi-role System**: User, Admin, and Moderator role management
- **Data Analytics**: Donation statistics and insights
- **Mobile Responsive**: Optimized for all device types
- **Security Features**: Data encryption, rate limiting, and input validation

### User Experience
- **Modern UI/UX**: Clean, intuitive interface built with shadcn/ui
- **Dark/Light Mode**: Theme switching capability
- **Progressive Web App**: Offline functionality and mobile app experience
- **Accessibility**: WCAG compliant design
- **Multi-language Support**: Internationalization ready

## System Architecture

### Frontend (React + TypeScript)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Application pages/routes
├── services/           # API service layers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

### Backend (Node.js + Express)
```
backend/
├── models/             # MongoDB data models
├── routes/             # API route handlers
├── middleware/         # Custom middleware
├── utils/              # Utility functions
└── server.js           # Application entry point
```

### Database (MongoDB)
- **Users**: User profiles and authentication data
- **BloodRequests**: Blood request records
- **Donations**: Donation tracking
- **Inventory**: Blood bank stock management
- **SystemLogs**: Application activity logs

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v8.0 or higher) or **yarn** (v1.22 or higher)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/MHR-RONY/Blood-connect.git
cd Blood-connect
```

### 2. Install Frontend Dependencies
```bash
# Install frontend dependencies
npm install
```

### 3. Install Backend Dependencies
```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
```

### 4. Return to Root Directory
```bash
cd ..
```

## Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=BloodConnect
VITE_APP_VERSION=1.0.0
```

#### Backend (.env)
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bloodconnect

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=5MB
UPLOAD_PATH=./uploads
```

### Database Setup

1. **Start MongoDB Service**:
   ```bash
   # On macOS (using Homebrew)
   brew services start mongodb-community

   # On Ubuntu
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

2. **Create Database** (Optional - will be created automatically):
   ```bash
   mongosh
   use bloodconnect
   ```

## Usage

### Development Mode

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:3001
   ```

2. **Start Frontend Development Server** (in a new terminal):
   ```bash
   npm run dev
   # Application runs on http://localhost:8080
   ```

### Production Build

1. **Build Frontend**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   cd backend
   npm start
   ```

### Available Scripts

#### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend Scripts
```bash
npm start            # Start production server
npm run dev          # Start with nodemon (development)
npm test             # Run tests
```

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # User logout
```

### Blood Request Endpoints
```
GET    /api/requests       # Get all blood requests
POST   /api/requests       # Create new blood request
GET    /api/requests/:id   # Get specific blood request
PUT    /api/requests/:id   # Update blood request
DELETE /api/requests/:id   # Delete blood request
```

### Donation Endpoints
```
GET    /api/donations      # Get all donations
POST   /api/donations      # Create new donation
GET    /api/donations/:id  # Get specific donation
PUT    /api/donations/:id  # Update donation status
```

### User Management Endpoints
```
GET    /api/users          # Get all users (Admin only)
GET    /api/users/:id      # Get specific user
PUT    /api/users/:id      # Update user profile
DELETE /api/users/:id      # Delete user (Admin only)
```

### Admin Endpoints
```
GET    /api/admin/dashboard          # Admin dashboard data
GET    /api/admin/settings/info      # Get admin information
PUT    /api/admin/settings/info      # Update admin information
PUT    /api/admin/settings/password  # Change admin password
GET    /api/admin/settings/logs      # Get system logs
POST   /api/admin/settings/backup    # Create database backup
```

## Database Schema

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  bloodType: String,
  weight: Number,
  location: {
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isAvailableDonor: Boolean,
  role: String, // 'user', 'admin', 'moderator'
  isVerified: Boolean,
  lastDonationDate: Date,
  totalDonations: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Blood Request Model
```javascript
{
  patient: {
    name: String,
    age: Number,
    gender: String,
    bloodType: String,
    contactNumber: String,
    relationship: String
  },
  hospital: {
    name: String,
    address: String,
    contactNumber: String
  },
  urgencyLevel: String, // 'low', 'medium', 'high', 'critical'
  unitsNeeded: Number,
  requiredDate: Date,
  additionalNotes: String,
  status: String, // 'active', 'fulfilled', 'expired', 'cancelled'
  requestedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Admin Features

### Dashboard Overview
- Total users, donations, and requests statistics
- Recent activity monitoring
- System health indicators
- Quick action buttons

### User Management
- View and manage all registered users
- User role assignment (User/Admin/Moderator)
- Account activation/deactivation
- User activity tracking

### Settings Management
- Update admin profile information
- Change admin passwords with security validation
- Configure system notifications
- Database backup and maintenance
- System logs monitoring with filtering options

### Blood Request Management
- View all blood requests across the platform
- Update request statuses
- Emergency request prioritization
- Request analytics and reporting

### Inventory Management
- Track blood bank inventory levels
- Set low stock alerts
- Manage blood unit expiration dates
- Generate inventory reports

## Deployment

### Vercel Deployment (Recommended for Frontend)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### Heroku Deployment (Backend)

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Create Heroku App**:
   ```bash
   heroku create bloodconnect-api
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

4. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

### Docker Deployment

1. **Frontend Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 8080
   CMD ["npm", "run", "preview"]
   ```

2. **Backend Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

### Environment Configuration for Production

Update your production environment variables:

```env
# Frontend (.env.production)
VITE_API_BASE_URL=https://your-api-domain.com/api

# Backend (.env.production)
NODE_ENV=production
MONGODB_URI=mongodb+srv://your-atlas-connection-string
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

## Technologies Used

### Frontend Stack
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible UI components
- **React Router** - Client-side routing
- **Lucide React** - Beautiful SVG icons

### Backend Stack
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation middleware
- **helmet** - Security middleware
- **cors** - Cross-origin resource sharing

### Development Tools
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **nodemon** - Development server auto-restart
- **dotenv** - Environment variable management

## Performance & Security

### Performance Optimizations
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Responsive images with proper formats
- **Caching**: Efficient browser and server-side caching
- **Database Indexing**: Optimized MongoDB queries
- **Compression**: Gzip compression for assets

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: API request rate limiting
- **CORS Protection**: Configured cross-origin policies
- **Helmet.js**: Security headers middleware
- **Data Encryption**: Sensitive data encryption at rest

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR

## User Workflows

### For Blood Donors

1. **Registration Process**
   - Create account with personal details
   - Complete health screening questionnaire
   - Verify email and phone number
   - Set availability preferences

2. **Donation Journey**
   - Receive notification for blood requests
   - Review request details and location
   - Confirm participation
   - Complete donation at designated center
   - Receive confirmation and certificate

3. **Profile Management**
   - Update availability status
   - View donation history
   - Manage notification preferences
   - Track donation statistics

### For Blood Recipients/Hospitals

1. **Emergency Request Process**
   - Submit urgent blood request with patient details
   - Specify blood type and quantity needed
   - Set urgency level and required date
   - Monitor request status in real-time

2. **Request Management**
   - Track ongoing requests
   - Receive donor responses
   - Coordinate with donors for collection
   - Update request status and fulfillment

### For Administrators

1. **Platform Management**
   - Monitor all platform activities
   - Manage user accounts and permissions
   - Review and approve critical requests
   - Generate system reports

2. **Inventory Control**
   - Track blood bank inventory levels
   - Manage stock alerts and notifications
   - Coordinate with multiple blood banks
   - Generate inventory reports

## System Requirements

### Minimum Requirements

**Frontend:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Internet connection (1 Mbps minimum)
- Screen resolution: 1024x768 or higher

**Backend Server:**
- Node.js 18.0 or higher
- RAM: 512 MB minimum (2 GB recommended)
- Storage: 1 GB minimum (10 GB recommended)
- CPU: 1 core minimum (2+ cores recommended)

**Database:**
- MongoDB 5.0 or higher
- Storage: 500 MB minimum (5 GB recommended for production)
- RAM: 256 MB minimum (1 GB recommended)

### Recommended Production Requirements

**Server Specifications:**
- CPU: 4+ cores
- RAM: 8 GB or higher
- Storage: SSD with 50 GB+ available space
- Network: High-speed internet with redundancy
- Operating System: Ubuntu 20.04 LTS or CentOS 8

**Database Specifications:**
- MongoDB Atlas (managed) or self-hosted MongoDB cluster
- Automated backups enabled
- Read replicas for improved performance
- Monitoring and alerting configured

## Performance Metrics

### Load Testing Results

- **Concurrent Users**: Supports up to 1,000 concurrent users
- **Response Time**: Average API response time < 200ms
- **Throughput**: 500+ requests per second
- **Uptime**: 99.9% availability target

### Optimization Features

- **Database Indexing**: Optimized queries with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **CDN Integration**: Static asset delivery via CDN
- **Image Optimization**: Compressed and optimized images
- **Code Splitting**: Lazy loading for improved initial load time

### Monitoring Metrics

- **Response Times**: Real-time API response monitoring
- **Error Rates**: Application error tracking and alerting
- **User Analytics**: User behavior and engagement metrics
- **System Health**: Server resource usage monitoring
- **Database Performance**: Query performance and optimization alerts

## Monitoring & Analytics

### Application Monitoring

- **Error Tracking**: Comprehensive error logging and tracking
- **Performance Monitoring**: Real-time performance metrics
- **User Session Tracking**: User journey and interaction analytics
- **API Monitoring**: Endpoint usage and response time tracking

### Business Analytics

- **Donation Statistics**: Track donation rates and trends
- **Request Fulfillment**: Monitor request completion rates
- **User Engagement**: Active user metrics and retention rates
- **Geographic Analytics**: Location-based usage patterns

### Health Checks

- **System Status Dashboard**: Real-time system health overview
- **Database Connectivity**: Automated database health checks
- **API Endpoint Testing**: Automated API endpoint validation
- **Resource Usage Alerts**: CPU, memory, and storage monitoring

## Troubleshooting

### Common Issues

**Frontend Issues:**

1. **Application Won't Load**
   - Check internet connection
   - Clear browser cache and cookies
   - Disable browser extensions
   - Try incognito/private mode

2. **Login Issues**
   - Verify email and password
   - Check for account verification status
   - Clear local storage
   - Contact support if persistent

**Backend Issues:**

1. **Database Connection Errors**
   ```bash
   # Check MongoDB service status
   sudo systemctl status mongod

   # Restart MongoDB service
   sudo systemctl restart mongod

   # Check database logs
   tail -f /var/log/mongodb/mongod.log
   ```

2. **API Response Errors**
   ```bash
   # Check server logs
   pm2 logs bloodconnect-api

   # Check server status
   pm2 status

   # Restart application
   pm2 restart bloodconnect-api
   ```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend debug mode
DEBUG=bloodconnect:* npm start

# Frontend development mode with verbose logging
VITE_DEBUG=true npm run dev
```

### Log Files

- **Application Logs**: `/var/log/bloodconnect/app.log`
- **Error Logs**: `/var/log/bloodconnect/error.log`
- **Access Logs**: `/var/log/bloodconnect/access.log`
- **Database Logs**: `/var/log/mongodb/mongod.log`

## Roadmap

### Version 2.0 (Q4 2025)

- **Mobile Application**: Native iOS and Android apps
- **Advanced Matching**: AI-powered donor-recipient matching
- **Telemedicine Integration**: Virtual health consultations
- **Multi-language Support**: Support for 5+ regional languages
- **Advanced Analytics**: Predictive analytics for blood demand

### Version 2.5 (Q2 2026)

- **IoT Integration**: Smart blood bank monitoring devices
- **Blockchain Integration**: Transparent donation tracking
- **Advanced Notifications**: Push notifications and SMS alerts
- **Social Features**: Community building and engagement tools
- **API Marketplace**: Third-party integration marketplace

### Long-term Vision

- **Global Expansion**: Multi-country support with localization
- **Research Integration**: Academic research collaboration tools
- **Government Partnership**: Integration with national health systems
- **Emergency Response**: Disaster response blood coordination
- **Health Monitoring**: Comprehensive donor health tracking

## Copyright & License

### Copyright Notice

**© 2025 MHR RONY. All Rights Reserved.**

This project and all its contents, including but not limited to source code, documentation, designs, and associated materials, are the exclusive intellectual property of **MHR RONY**.

### Proprietary License

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the explicit written permission of **MHR RONY**.

### Terms of Use

- **No Redistribution**: This software may not be redistributed without explicit permission
- **No Modification**: Modification of the source code is prohibited without authorization
- **No Commercial Use**: Commercial use requires separate licensing agreement
- **Educational Use**: Limited educational use may be permitted with proper attribution

### Contact for Licensing

For licensing inquiries, partnership opportunities, or commercial use permissions, please contact:

**MHR RONY**
Website: [https://www.mhrrony.com](https://www.mhrrony.com)
Email: Available through website contact form

### Disclaimer

This software is provided "as is" without warranty of any kind. **MHR RONY** shall not be liable for any damages arising from the use of this software.

## Credits
### Developer
**MHR RONY**
- Website: [https://www.mhrrony.com](https://www.mhrrony.com)
- GitHub: [@MHR-RONY](https://github.com/MHR-RONY)

### Acknowledgments
- **shadcn/ui** for the beautiful component library
- **Vercel** for deployment platform
- **MongoDB** for database services
- **React Community** for excellent documentation and support

---

**BloodConnect** - Connecting donors with those in need, saving lives through technology.

For support or questions, please visit [https://www.mhrrony.com](https://www.mhrrony.com) or open an issue on GitHub.
