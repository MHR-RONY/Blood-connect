const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class AdminManager {
	async connect() {
		try {
			await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
			console.log('✅ Connected to MongoDB');
		} catch (error) {
			console.error('❌ MongoDB connection failed:', error.message);
			process.exit(1);
		}
	}

	async disconnect() {
		await mongoose.connection.close();
		console.log('📤 Database connection closed');
	}

	async createAdmin(email = 'admin@bloodconnect.com', password = 'admin123') {
		try {
			// Check if admin already exists
			const existingAdmin = await User.findOne({ email, role: 'admin' });

			if (existingAdmin) {
				console.log(`⚠️  Admin user already exists with email: ${email}`);
				return existingAdmin;
			}

			// Create admin user
			const adminData = {
				firstName: 'System',
				lastName: 'Administrator',
				email: email,
				password: password,
				phone: '01700000000',
				dateOfBirth: new Date('1990-01-01'),
				gender: 'prefer-not-to-say',
				bloodType: 'O+',
				weight: 70,
				location: {
					city: 'Dhaka',
					area: 'System'
				},
				role: 'admin',
				isVerified: true,
				isAvailableDonor: false
			};

			const adminUser = new User(adminData);
			await adminUser.save();

			console.log('🎉 Admin user created successfully!');
			console.log(`📧 Email: ${email}`);
			console.log(`🔑 Password: ${password}`);
			console.log('⚠️  IMPORTANT: Please change the password after first login!');

			return adminUser;

		} catch (error) {
			console.error('❌ Error creating admin user:', error.message);
			throw error;
		}
	}

	async updateAdminPassword(email, newPassword) {
		try {
			const admin = await User.findOne({ email, role: 'admin' }).select('+password');

			if (!admin) {
				console.log(`❌ Admin user not found with email: ${email}`);
				return null;
			}

			admin.password = newPassword;
			await admin.save();

			console.log(`✅ Password updated successfully for admin: ${email}`);
			return admin;

		} catch (error) {
			console.error('❌ Error updating admin password:', error.message);
			throw error;
		}
	}

	async listAdmins() {
		try {
			const admins = await User.find({ role: 'admin' }).select('-password');

			console.log('👑 Admin Users:');
			console.log('================');

			if (admins.length === 0) {
				console.log('No admin users found');
			} else {
				admins.forEach((admin, index) => {
					console.log(`${index + 1}. ${admin.firstName} ${admin.lastName}`);
					console.log(`   📧 Email: ${admin.email}`);
					console.log(`   📱 Phone: ${admin.phone}`);
					console.log(`   ✅ Verified: ${admin.isVerified}`);
					console.log(`   📅 Created: ${admin.createdAt}`);
					console.log('   ─────────────────────────────');
				});
			}

			return admins;

		} catch (error) {
			console.error('❌ Error listing admins:', error.message);
			throw error;
		}
	}

	async removeAdmin(email) {
		try {
			// Prevent removing the default admin
			if (email === 'admin@bloodconnect.com') {
				console.log('⚠️  Cannot remove the default admin account for security reasons');
				return false;
			}

			const result = await User.deleteOne({ email, role: 'admin' });

			if (result.deletedCount === 1) {
				console.log(`✅ Admin user removed: ${email}`);
				return true;
			} else {
				console.log(`❌ Admin user not found: ${email}`);
				return false;
			}

		} catch (error) {
			console.error('❌ Error removing admin:', error.message);
			throw error;
		}
	}
}

// Command line interface
const runCommand = async () => {
	const adminManager = new AdminManager();
	await adminManager.connect();

	const command = process.argv[2];
	const email = process.argv[3];
	const password = process.argv[4];

	try {
		switch (command) {
			case 'create':
				await adminManager.createAdmin(email, password);
				break;

			case 'list':
				await adminManager.listAdmins();
				break;

			case 'update-password':
				if (!email || !password) {
					console.log('Usage: node adminManager.js update-password <email> <new-password>');
					break;
				}
				await adminManager.updateAdminPassword(email, password);
				break;

			case 'remove':
				if (!email) {
					console.log('Usage: node adminManager.js remove <email>');
					break;
				}
				await adminManager.removeAdmin(email);
				break;

			default:
				console.log('📋 Available commands:');
				console.log('  create [email] [password] - Create default or custom admin');
				console.log('  list                     - List all admin users');
				console.log('  update-password <email> <password> - Update admin password');
				console.log('  remove <email>          - Remove admin user');
				console.log('');
				console.log('Examples:');
				console.log('  node adminManager.js create');
				console.log('  node adminManager.js create custom@admin.com mypassword');
				console.log('  node adminManager.js list');
				console.log('  node adminManager.js update-password admin@bloodconnect.com newpassword');
		}
	} catch (error) {
		console.error('💥 Command failed:', error.message);
	} finally {
		await adminManager.disconnect();
		process.exit(0);
	}
};

// Run if called directly
if (require.main === module) {
	runCommand();
}

module.exports = AdminManager;
