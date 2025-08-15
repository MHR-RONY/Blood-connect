// Debug route to test blood request validation
router.post('/debug-test', [
	authenticate,
	body('patient.name').trim().isLength({ min: 2, max: 100 }),
	body('patient.age').isInt({ min: 0, max: 150 }),
	body('patient.gender').isIn(['male', 'female', 'other']),
	body('patient.bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
	body('patient.contactNumber').isMobilePhone(),
	body('patient.relationship').isIn(['self', 'family', 'friend', 'hospital', 'doctor', 'other']),
	body('hospital.name').trim().notEmpty(),
	body('hospital.address').trim().notEmpty(),
	body('hospital.city').trim().notEmpty(),
	body('hospital.area').trim().notEmpty(),
	body('hospital.contactNumber').isMobilePhone(),
	body('hospital.doctorName').trim().notEmpty(),
	body('bloodRequirement.units').isInt({ min: 1, max: 10 }),
	body('bloodRequirement.urgency').isIn(['low', 'medium', 'high', 'critical']),
	body('bloodRequirement.requiredBy').isISO8601(),
	body('bloodRequirement.purpose').isIn(['surgery', 'accident', 'cancer-treatment', 'anemia', 'pregnancy-complications', 'blood-disorder', 'organ-transplant', 'other']),
	validate
], async (req, res) => {
	console.log('Debug request body:', JSON.stringify(req.body, null, 2));
	res.json({
		message: 'Debug test successful',
		receivedData: req.body
	});
});

module.exports = router;
