# Admin Setup Guide

This guide covers setting up and managing administrator accounts for the BloodConnect application.

## Default Admin Account

A default admin account is automatically created with the following credentials:

- **Email:** `admin@bloodconnect.com`
- **Password:** `admin123`

⚠️ **IMPORTANT:** Change the password immediately after first login for security reasons.

## Admin Login

1. Navigate to: `http://localhost:8080/admin/login`
2. Enter the admin credentials
3. You'll be redirected to the admin dashboard upon successful authentication

## Admin Management Scripts

The backend includes several scripts for managing admin accounts:

### Create Default Admin
```bash
# From the backend directory
npm run create-admin
```

### Admin Management Commands
```bash
# List all admin users
npm run admin list

# Create custom admin
npm run admin create custom@admin.com mypassword

# Update admin password
npm run admin update-password admin@bloodconnect.com newpassword

# Remove admin (cannot remove default admin)
npm run admin remove custom@admin.com
```

### Direct Script Usage
```bash
# From backend directory
node scripts/adminManager.js [command] [arguments]
```

Available commands:
- `create [email] [password]` - Create admin user
- `list` - List all admin users
- `update-password <email> <password>` - Update password
- `remove <email>` - Remove admin user

## API Endpoints

### Change Admin Password
```
PUT /api/admin/change-password
Authorization: Bearer <admin-token>

Body:
{
  "currentPassword": "admin123",
  "newPassword": "mynewpassword",
  "confirmPassword": "mynewpassword"
}
```

## Security Features

1. **Role-based Access Control:** Only users with `role: 'admin'` can access admin routes
2. **Protected Routes:** Admin routes are protected by `AdminProtectedRoute` component
3. **Password Validation:** Strong password requirements for all admin accounts
4. **Session Management:** JWT-based authentication with secure token handling
5. **Audit Logging:** All admin login attempts are monitored (configured in backend)

## Admin Dashboard Features

Once logged in, admins have access to:

- 📊 **Dashboard:** Overview statistics and metrics
- 👥 **Users Management:** View and manage user accounts
- 🩸 **Donors Management:** Manage blood donor registrations
- 📝 **Requests Management:** Handle blood requests
- 📦 **Inventory Management:** Blood bank inventory tracking
- 🚨 **Emergency Management:** Handle emergency requests
- 💰 **Donations Management:** Track monetary donations
- ⚙️ **Settings:** System configuration and preferences

## Best Practices

1. **Change Default Password:** Always change the default password after first login
2. **Use Strong Passwords:** Follow password complexity requirements
3. **Regular Updates:** Update admin passwords regularly
4. **Limited Access:** Only grant admin access to trusted personnel
5. **Monitor Activity:** Regularly review admin activity logs
6. **Backup Access:** Maintain multiple admin accounts for backup access

## Troubleshooting

### Can't Access Admin Dashboard
1. Verify you're using the correct admin login URL: `/admin/login`
2. Ensure your account has `role: 'admin'` in the database
3. Check if the backend server is running on port 3001
4. Clear browser cache and cookies if experiencing login issues

### Password Issues
1. Use the password update script if you forget the admin password
2. Ensure new passwords meet complexity requirements
3. Check database connection if password updates fail

### Database Issues
1. Verify MongoDB is running and accessible
2. Check environment variables for correct database URL
3. Ensure the admin user exists in the database with `npm run admin list`

## Environment Variables

Ensure these variables are set in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/bloodconnect
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=development
```

## Support

For additional support or to report admin-related issues, contact the development team or check the application logs for detailed error messages.
