// Test the exact browser scenario
console.log('🔍 SIMULATING BROWSER FORM SUBMISSION');
console.log('=====================================\n');

// Test case that simulates what you're experiencing
function testBrowserScenario() {
	console.log('Testing the exact scenario from your browser...\n');

	// This simulates what happens when:
	// 1. User selects "A+" from dropdown
	// 2. User enters "10" in units field
	// 3. User selects "31/08/2025" in date field
	// 4. Storage location defaults to "Main Storage"

	const formData = {
		bloodType: 'A+',       // Selected from dropdown
		units: '10',           // Entered in input field
		expiryDate: new Date('2025-08-31'), // Selected from date picker
		location: 'Main Storage'
	};

	console.log('Form data that should be valid:');
	console.log(formData);

	// Run the exact validation logic from your component
	console.log('\n--- Running Validation ---');

	// Debug logging (what you'll see in browser console)
	console.log('Form submission debug:', {
		bloodType: formData.bloodType,
		units: formData.units,
		expiryDate: formData.expiryDate,
		bloodTypeEmpty: !formData.bloodType,
		unitsEmpty: !formData.units,
		expiryDateEmpty: !formData.expiryDate
	});

	// Validation step 1: Check required fields
	if (!formData.bloodType || formData.bloodType === '' || !formData.units || !formData.expiryDate) {
		const missing = [];
		if (!formData.bloodType) missing.push('Blood Type');
		if (!formData.units) missing.push('Units');
		if (!formData.expiryDate) missing.push('Expiry Date');

		console.log('❌ VALIDATION FAILED: Required fields missing');
		console.log(`Missing fields: ${missing.join(', ')}`);
		return false;
	}

	// Validation step 2: Check units is positive number
	const unitsNumber = parseInt(formData.units);
	if (isNaN(unitsNumber) || unitsNumber <= 0) {
		console.log('❌ VALIDATION FAILED: Units must be positive number');
		console.log(`Units value: "${formData.units}" -> parsed: ${unitsNumber}`);
		return false;
	}

	// Validation step 3: Check expiry date is in future
	const now = new Date();
	if (formData.expiryDate <= now) {
		console.log('❌ VALIDATION FAILED: Expiry date must be in future');
		console.log(`Expiry date: ${formData.expiryDate}`);
		console.log(`Current date: ${now}`);
		return false;
	}

	console.log('✅ ALL VALIDATIONS PASSED!');
	console.log('This data should successfully add to inventory');
	return true;
}

// Test potential edge cases that might cause issues
function testEdgeCases() {
	console.log('\n\n🧪 TESTING EDGE CASES');
	console.log('=====================\n');

	const edgeCases = [
		{
			name: "Blood type with extra spaces",
			bloodType: " A+ ",
			units: "10",
			expiryDate: new Date('2025-08-31')
		},
		{
			name: "Units as string with spaces",
			bloodType: "A+",
			units: " 10 ",
			expiryDate: new Date('2025-08-31')
		},
		{
			name: "Tomorrow's date (should pass)",
			bloodType: "A+",
			units: "10",
			expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
		},
		{
			name: "undefined vs null vs empty string",
			scenarios: [
				{ bloodType: undefined, label: "undefined" },
				{ bloodType: null, label: "null" },
				{ bloodType: "", label: "empty string" },
				{ bloodType: "   ", label: "spaces only" }
			]
		}
	];

	edgeCases.slice(0, 3).forEach((testCase, index) => {
		console.log(`${index + 1}. ${testCase.name}`);
		console.log(`   Blood Type: "${testCase.bloodType}"`);
		console.log(`   Units: "${testCase.units}"`);
		console.log(`   Expiry: ${testCase.expiryDate}`);

		// Test trimming
		const trimmedBloodType = testCase.bloodType?.trim();
		const trimmedUnits = testCase.units?.trim();

		console.log(`   After trim - Blood Type: "${trimmedBloodType}", Units: "${trimmedUnits}"`);

		const isValid = trimmedBloodType && trimmedUnits && testCase.expiryDate &&
			!isNaN(parseInt(trimmedUnits)) && parseInt(trimmedUnits) > 0 &&
			testCase.expiryDate > new Date();

		console.log(`   Result: ${isValid ? '✅ PASS' : '❌ FAIL'}\n`);
	});

	// Test the undefined/null scenarios
	console.log('4. Testing undefined/null/empty variations:');
	edgeCases[3].scenarios.forEach(scenario => {
		const isEmpty = !scenario.bloodType || scenario.bloodType === '' || scenario.bloodType.trim() === '';
		console.log(`   ${scenario.label}: ${scenario.bloodType} -> isEmpty: ${isEmpty}`);
	});
}

// Run tests
testBrowserScenario();
testEdgeCases();

console.log('\n\n💡 DEBUGGING TIPS:');
console.log('==================');
console.log('1. Open browser dev tools (F12)');
console.log('2. Go to Console tab');
console.log('3. Fill out the form and click "Add Stock"');
console.log('4. Look for the debug message starting with "Form submission debug:"');
console.log('5. Check which field shows as empty or problematic');
console.log('6. If bloodType shows as empty, the Select component might not be updating state');
console.log('7. If units shows as empty, the Input component might not be updating state');
console.log('8. If expiryDate shows as null/undefined, the date picker might not be working');
