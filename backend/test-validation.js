const mongoose = require('mongoose');
require('dotenv').config();

// Test validation scenarios
const testCases = [
	{
		name: "Valid Data",
		bloodType: "A+",
		units: "10",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "Empty Blood Type",
		bloodType: "",
		units: "10",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "Empty Units",
		bloodType: "A+",
		units: "",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "Zero Units",
		bloodType: "A+",
		units: "0",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "Negative Units",
		bloodType: "A+",
		units: "-5",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "Invalid Units (string)",
		bloodType: "A+",
		units: "abc",
		expiryDate: new Date('2025-12-31'),
		location: "Main Storage"
	},
	{
		name: "No Expiry Date",
		bloodType: "A+",
		units: "10",
		expiryDate: null,
		location: "Main Storage"
	},
	{
		name: "Past Expiry Date",
		bloodType: "A+",
		units: "10",
		expiryDate: new Date('2024-01-01'),
		location: "Main Storage"
	},
	{
		name: "Today's Date (should fail)",
		bloodType: "A+",
		units: "10",
		expiryDate: new Date(),
		location: "Main Storage"
	}
];

// Simulate the validation logic from the component
function validateFormData(bloodType, units, expiryDate) {
	console.log('\n--- Validation Debug ---');
	console.log('Form submission debug:', {
		bloodType,
		units,
		expiryDate,
		bloodTypeEmpty: !bloodType,
		unitsEmpty: !units,
		expiryDateEmpty: !expiryDate
	});

	// First validation - required fields
	if (!bloodType || bloodType === '' || !units || !expiryDate) {
		const missing = [];
		if (!bloodType) missing.push('Blood Type');
		if (!units) missing.push('Units');
		if (!expiryDate) missing.push('Expiry Date');

		return {
			valid: false,
			error: `Please fill in all required fields. Missing: ${missing.join(', ')}`
		};
	}

	// Second validation - units must be positive number
	const unitsNumber = parseInt(units);
	if (isNaN(unitsNumber) || unitsNumber <= 0) {
		return {
			valid: false,
			error: 'Units must be a positive number'
		};
	}

	// Third validation - expiry date must be in future
	if (expiryDate <= new Date()) {
		return {
			valid: false,
			error: 'Expiry date must be in the future'
		};
	}

	return {
		valid: true,
		error: null
	};
}

async function runValidationTests() {
	console.log('🧪 BLOOD STOCK VALIDATION TESTS');
	console.log('================================\n');

	testCases.forEach((testCase, index) => {
		console.log(`\n${index + 1}. Testing: ${testCase.name}`);
		console.log('Input Data:', {
			bloodType: testCase.bloodType || '(empty)',
			units: testCase.units || '(empty)',
			expiryDate: testCase.expiryDate ? testCase.expiryDate.toISOString().split('T')[0] : '(null)',
			location: testCase.location
		});

		const result = validateFormData(
			testCase.bloodType,
			testCase.units,
			testCase.expiryDate
		);

		if (result.valid) {
			console.log('✅ PASS: Validation successful');
		} else {
			console.log('❌ FAIL:', result.error);
		}
		console.log('---');
	});

	console.log('\n🎯 Summary:');
	console.log('- Only test case 1 should pass (Valid Data)');
	console.log('- All other test cases should fail with specific error messages');
	console.log('- This helps identify which validation is triggering in your form');
}

// Test actual inventory addition
async function testInventoryAPI() {
	try {
		await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodconnect');
		console.log('\n🔌 Connected to MongoDB');

		const Inventory = require('./models/Inventory');

		// Test with valid data
		console.log('\n📦 Testing Inventory Model...');

		const testData = {
			bloodType: 'A+',
			units: 10,
			expiryDate: new Date('2025-12-31'),
			location: 'Main Storage'
		};

		console.log('Test data for inventory:', testData);

		// Check if inventory exists for this blood type
		let inventory = await Inventory.findOne({ bloodType: testData.bloodType });

		if (!inventory) {
			console.log('No existing inventory found for A+, creating new...');
			inventory = new Inventory({
				bloodType: testData.bloodType,
				batches: [],
				thresholds: {
					critical: 5,
					low: 15,
					good: 30
				}
			});
		}

		// Add new batch
		const batchId = `BATCH-${Date.now()}`;
		inventory.batches.push({
			batchId,
			units: testData.units,
			donationDate: new Date(),
			expiryDate: testData.expiryDate,
			location: testData.location
		});

		console.log('Adding batch:', {
			batchId,
			units: testData.units,
			expiryDate: testData.expiryDate,
			location: testData.location
		});

		const savedInventory = await inventory.save();
		console.log('✅ Successfully added to inventory!');
		console.log('New available units:', savedInventory.availableUnits);
		console.log('Status:', savedInventory.status);

		mongoose.disconnect();

	} catch (error) {
		console.error('❌ Database error:', error.message);
		mongoose.disconnect();
	}
}

// Run all tests
async function runAllTests() {
	await runValidationTests();
	await testInventoryAPI();
}

runAllTests();
