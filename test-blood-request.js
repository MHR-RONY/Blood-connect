// Test script to verify blood request functionality
const testBloodRequestAPI = async () => {
	const API_BASE_URL = 'http://localhost:3001/api';

	// Test authentication first by getting a real user token
	// For this test, we'll assume user is logged in

	const testRequestData = {
		patient: {
			name: "Test Patient",
			age: 30,
			gender: "male",
			bloodType: "O+",
			contactNumber: "+8801234567890",
			relationship: "self"
		},
		hospital: {
			name: "Test Hospital",
			address: "123 Test Street, Test Area",
			city: "Dhaka",
			area: "Dhanmondi",
			contactNumber: "+8801987654321",
			doctorName: "Dr. Test Doctor"
		},
		bloodRequirement: {
			units: 2,
			urgency: "high",
			requiredBy: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
			purpose: "Medical treatment"
		},
		additionalNotes: "This is a test blood request"
	};

	try {
		// This would require a valid auth token
		console.log('Test blood request data:', JSON.stringify(testRequestData, null, 2));
		console.log('To test this fully, please:');
		console.log('1. Open http://localhost:8080 in your browser');
		console.log('2. Login to your account');
		console.log('3. Navigate to /request page');
		console.log('4. Fill out the form and submit');
		console.log('5. Check your profile page for the request history');
	} catch (error) {
		console.error('Test error:', error);
	}
};

testBloodRequestAPI();
