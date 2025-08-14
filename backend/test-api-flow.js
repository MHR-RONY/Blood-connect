const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testInventoryAPICall() {
	try {
		console.log('🔄 TESTING INVENTORY API CALL');
		console.log('==============================\n');

		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
		console.log('✅ Connected to MongoDB');

		// Get User model to create a test token
		const User = require('./models/User');
		const Inventory = require('./models/Inventory');

		// Find an admin user
		const adminUser = await User.findOne({ role: 'admin' });

		if (!adminUser) {
			console.log('❌ No admin user found');
			return;
		}

		console.log('✅ Found admin user:', adminUser.email);

		// Create a test JWT token
		const token = jwt.sign(
			{
				userId: adminUser._id,
				role: adminUser.role
			},
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: '1h' }
		);

		console.log('✅ Generated test JWT token');

		// Simulate the API call data
		const testData = {
			bloodType: 'B+',
			units: 15,
			expiryDate: '2025-12-25T00:00:00.000Z',
			location: 'Main Storage'
		};

		console.log('\n📦 Test inventory data:');
		console.log(testData);

		// Find or create inventory for this blood type
		let inventory = await Inventory.findOne({ bloodType: testData.bloodType });

		if (!inventory) {
			console.log(`\n📝 Creating new inventory record for ${testData.bloodType}`);
			inventory = new Inventory({
				bloodType: testData.bloodType,
				batches: [],
				thresholds: {
					critical: 5,
					low: 15,
					good: 30
				}
			});
		} else {
			console.log(`\n📝 Found existing inventory for ${testData.bloodType}`);
			console.log(`   Current units: ${inventory.availableUnits}`);
			console.log(`   Current status: ${inventory.status}`);
		}

		// Generate batch ID
		const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

		// Add new batch
		const newBatch = {
			batchId,
			units: testData.units,
			donationDate: new Date(),
			expiryDate: new Date(testData.expiryDate),
			location: testData.location,
			status: 'available'
		};

		inventory.batches.push(newBatch);

		console.log(`\n➕ Adding new batch:`);
		console.log(`   Batch ID: ${batchId}`);
		console.log(`   Units: ${testData.units}`);
		console.log(`   Expiry: ${testData.expiryDate}`);
		console.log(`   Location: ${testData.location}`);

		// Save to database
		const savedInventory = await inventory.save();

		console.log('\n✅ SUCCESS! Inventory updated:');
		console.log(`   Blood Type: ${savedInventory.bloodType}`);
		console.log(`   Total Available Units: ${savedInventory.availableUnits}`);
		console.log(`   Status: ${savedInventory.status}`);
		console.log(`   Total Batches: ${savedInventory.batches.length}`);

		// Test what the API response would look like
		const apiResponse = {
			success: true,
			data: {
				bloodType: savedInventory.bloodType,
				availableUnits: savedInventory.availableUnits,
				status: savedInventory.status,
				newBatch: newBatch
			},
			message: `Successfully added ${testData.units} units of ${testData.bloodType} blood`
		};

		console.log('\n📡 API Response would be:');
		console.log(JSON.stringify(apiResponse, null, 2));

		mongoose.disconnect();

	} catch (error) {
		console.error('❌ Error:', error.message);
		console.error('Stack:', error.stack);
		mongoose.disconnect();
	}
}

// Test the authentication flow
async function testAuthToken() {
	console.log('\n🔐 TESTING AUTH TOKEN');
	console.log('====================\n');

	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
		const User = require('./models/User');

		// Find admin user
		const adminUser = await User.findOne({ role: 'admin' });

		if (adminUser) {
			console.log('✅ Admin user found:');
			console.log(`   Email: ${adminUser.email}`);
			console.log(`   Role: ${adminUser.role}`);
			console.log(`   ID: ${adminUser._id}`);

			// Create token (this is what happens during login)
			const token = jwt.sign(
				{
					userId: adminUser._id,
					role: adminUser.role
				},
				process.env.JWT_SECRET || 'your-secret-key',
				{ expiresIn: '24h' }
			);

			console.log('\n🎫 Generated JWT token (first 50 chars):');
			console.log(token.substring(0, 50) + '...');

			// Verify token (this is what happens on API calls)
			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
				console.log('\n✅ Token verification successful:');
				console.log(`   User ID: ${decoded.userId}`);
				console.log(`   Role: ${decoded.role}`);
				console.log(`   Expires: ${new Date(decoded.exp * 1000)}`);

				console.log('\n💾 This token should be stored as "bloodconnect_token" in localStorage');

			} catch (verifyError) {
				console.log('❌ Token verification failed:', verifyError.message);
			}

		} else {
			console.log('❌ No admin user found in database');
		}

		mongoose.disconnect();

	} catch (error) {
		console.error('❌ Auth test error:', error.message);
		mongoose.disconnect();
	}
}

// Run all tests
async function runAllTests() {
	await testInventoryAPICall();
	await testAuthToken();

	console.log('\n\n🎯 NEXT STEPS FOR DEBUGGING:');
	console.log('============================');
	console.log('1. Make sure you are logged in as admin');
	console.log('2. Check browser localStorage for "bloodconnect_token"');
	console.log('3. Open browser console and look for debug messages when submitting form');
	console.log('4. Verify which field is showing as empty in the console log');
	console.log('5. Check network tab to see if API call is being made');
	console.log('6. If API call fails, check the error response');
}

runAllTests();
