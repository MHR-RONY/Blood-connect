const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mhrronym0358:A5zqxFiFKGDXNMul@bloodconnectcluster.qg2uwlq.mongodb.net/bloodconnect?retryWrites=true&w=majority&appName=BloodConnectCluster';

async function updateUserStatus() {
	try {
		await mongoose.connect(MONGODB_URI);
		console.log('Connected to MongoDB');

		// Update all users to be active if they are not banned
		const result = await User.updateMany(
			{ isBanned: { $ne: true } }, // Users who are not banned
			{ $set: { isActive: true } }
		);

		console.log(`Updated ${result.modifiedCount} users to active status`);

		// Show current status
		const users = await User.find({}, 'firstName lastName isActive isBanned').sort({ createdAt: -1 });
		console.log('\nCurrent user status:');
		users.forEach(user => {
			console.log(`${user.firstName} ${user.lastName}: Active=${user.isActive}, Banned=${user.isBanned || false}`);
		});

		await mongoose.disconnect();
		console.log('\nDisconnected from MongoDB');
	} catch (error) {
		console.error('Error updating user status:', error);
		process.exit(1);
	}
}

updateUserStatus();
