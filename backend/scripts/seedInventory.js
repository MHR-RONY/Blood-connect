const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

// Import the Inventory model
const Inventory = require('../models/Inventory');

const sampleInventoryData = [
	{
		bloodType: 'O+',
		batches: [
			{
				batchId: 'O+-20240815-001',
				units: 25,
				expiryDate: new Date('2025-10-15'),
				donationDate: new Date('2024-08-15'),
				location: 'Main Storage',
				status: 'available'
			},
			{
				batchId: 'O+-20240810-002',
				units: 20,
				expiryDate: new Date('2025-10-20'),
				donationDate: new Date('2024-08-10'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 10, low: 25, good: 50 }
	},
	{
		bloodType: 'O-',
		batches: [
			{
				batchId: 'O--20240812-001',
				units: 8,
				expiryDate: new Date('2025-10-18'),
				donationDate: new Date('2024-08-12'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 5, low: 15, good: 30 }
	},
	{
		bloodType: 'A+',
		batches: [
			{
				batchId: 'A+-20240813-001',
				units: 35,
				expiryDate: new Date('2025-10-16'),
				donationDate: new Date('2024-08-13'),
				location: 'Main Storage',
				status: 'available'
			},
			{
				batchId: 'A+-20240811-002',
				units: 15,
				expiryDate: new Date('2025-10-21'),
				donationDate: new Date('2024-08-11'),
				location: 'Emergency Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 8, low: 20, good: 40 }
	},
	{
		bloodType: 'A-',
		batches: [
			{
				batchId: 'A--20240814-001',
				units: 12,
				expiryDate: new Date('2025-10-17'),
				donationDate: new Date('2024-08-14'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 5, low: 15, good: 25 }
	},
	{
		bloodType: 'B+',
		batches: [
			{
				batchId: 'B+-20240809-001',
				units: 28,
				expiryDate: new Date('2025-10-19'),
				donationDate: new Date('2024-08-09'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 6, low: 18, good: 35 }
	},
	{
		bloodType: 'B-',
		batches: [
			{
				batchId: 'B--20240808-001',
				units: 4,
				expiryDate: new Date('2025-09-28'),
				donationDate: new Date('2024-08-08'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 3, low: 10, good: 20 }
	},
	{
		bloodType: 'AB+',
		batches: [
			{
				batchId: 'AB+-20240807-001',
				units: 16,
				expiryDate: new Date('2025-10-22'),
				donationDate: new Date('2024-08-07'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 4, low: 12, good: 24 }
	},
	{
		bloodType: 'AB-',
		batches: [
			{
				batchId: 'AB--20240806-001',
				units: 2,
				expiryDate: new Date('2025-10-14'),
				donationDate: new Date('2024-08-06'),
				location: 'Main Storage',
				status: 'available'
			}
		],
		thresholds: { critical: 2, low: 8, good: 15 }
	}
];

async function seedInventory() {
	try {
		// Connect to MongoDB
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
		console.log('Connected to MongoDB');

		// Clear existing inventory
		await Inventory.deleteMany({});
		console.log('Cleared existing inventory data');

		// Insert sample data
		for (const inventoryData of sampleInventoryData) {
			const inventory = new Inventory(inventoryData);
			await inventory.save();

			// Reload the document to get calculated fields
			const savedInventory = await Inventory.findById(inventory._id);
			console.log(`Created inventory for ${inventoryData.bloodType}:`);
			console.log(`  - Batches: ${savedInventory.batches.length}`);
			console.log(`  - First batch expiry: ${savedInventory.batches[0]?.expiryDate}`);
			console.log(`  - First batch status: ${savedInventory.batches[0]?.status}`);
			console.log(`  - First batch units: ${savedInventory.batches[0]?.units}`);
			console.log(`  - Current date: ${new Date()}`);
			console.log(`  - Available Units: ${savedInventory.availableUnits}`);
			console.log(`  - Status: ${savedInventory.status}`);
			console.log(`  - Units field: ${savedInventory.units}`);
		}

		console.log('Sample inventory data created successfully!');

		// Display summary
		const totalInventory = await Inventory.find();
		const summary = totalInventory.map(item => ({
			bloodType: item.bloodType,
			units: item.availableUnits,
			status: item.status,
			nextExpiry: item.nextExpiryDate
		}));

		console.log('\nInventory Summary:');
		console.table(summary);

	} catch (error) {
		console.error('Error seeding inventory:', error);
	} finally {
		await mongoose.connection.close();
		console.log('Database connection closed');
	}
}

// Run the seed function
seedInventory();
