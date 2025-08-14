const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createDefaultAdmin = async () => {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
		console.log('✅ Connected to MongoDB');

		// Check if admin already exists
		const existingAdmin = await User.findOne({
			email: 'admin@bloodconnect.com',
			role: 'admin'
		});

		if (existingAdmin) {
			console.log('⚠️  Default admin user already exists!');
			console.log('📧 Email: admin@bloodconnect.com');
			console.log('🔑 Use existing password to login');
			process.exit(0);
		}

		// Create default admin user
		const adminData = {
			firstName: 'System',
			lastName: 'Administrator',
			email: 'admin@bloodconnect.com',
			password: 'admin123', // Default password - should be changed after first login
			phone: '01700000000', // Default admin phone
			dateOfBirth: new Date('1990-01-01'), // Default DOB
			gender: 'prefer-not-to-say',
			bloodType: 'O+', // Universal donor
			weight: 70, // Default weight
			location: {
				city: 'Dhaka',
				area: 'System'
			},
			role: 'admin',
			isVerified: true,
			isAvailableDonor: false // Admin account is not a donor
		};

		const adminUser = new User(adminData);
		await adminUser.save();

		console.log('🎉 Default admin user created successfully!');
		console.log('📧 Email: admin@bloodconnect.com');
		console.log('🔑 Password: admin123');
		console.log('⚠️  IMPORTANT: Please change the password after first login!');
		console.log('🚀 You can now login to the admin dashboard');

	} catch (error) {
		console.error('❌ Error creating default admin user:', error.message);

		if (error.code === 11000) {
			console.log('⚠️  Admin user might already exist with this email');
		}
	} finally {
		// Close the database connection
		await mongoose.connection.close();
		console.log('📤 Database connection closed');
		process.exit(0);
	}
};

// Run the script
createDefaultAdmin();
