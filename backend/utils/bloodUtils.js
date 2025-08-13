// Blood compatibility matrix for efficient lookups
const bloodCompatibility = {
	// Donor -> Recipients
	donorToRecipient: {
		'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
		'O+': ['O+', 'A+', 'B+', 'AB+'],
		'A-': ['A-', 'A+', 'AB-', 'AB+'],
		'A+': ['A+', 'AB+'],
		'B-': ['B-', 'B+', 'AB-', 'AB+'],
		'B+': ['B+', 'AB+'],
		'AB-': ['AB-', 'AB+'],
		'AB+': ['AB+']
	},

	// Recipient -> Donors
	recipientFromDonor: {
		'O-': ['O-'],
		'O+': ['O-', 'O+'],
		'A-': ['O-', 'A-'],
		'A+': ['O-', 'O+', 'A-', 'A+'],
		'B-': ['O-', 'B-'],
		'B+': ['O-', 'O+', 'B-', 'B+'],
		'AB-': ['O-', 'A-', 'B-', 'AB-'],
		'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal recipient
	}
};

/**
 * Check if a donor can donate to a recipient
 * @param {string} donorBloodType - Donor's blood type
 * @param {string} recipientBloodType - Recipient's blood type
 * @returns {boolean} - True if compatible
 */
const isCompatible = (donorBloodType, recipientBloodType) => {
	return bloodCompatibility.donorToRecipient[donorBloodType]?.includes(recipientBloodType) || false;
};

/**
 * Get all blood types that a donor can donate to
 * @param {string} donorBloodType - Donor's blood type
 * @returns {string[]} - Array of compatible recipient blood types
 */
const getCompatibleRecipients = (donorBloodType) => {
	return bloodCompatibility.donorToRecipient[donorBloodType] || [];
};

/**
 * Get all blood types that can donate to a recipient
 * @param {string} recipientBloodType - Recipient's blood type
 * @returns {string[]} - Array of compatible donor blood types
 */
const getCompatibleDonors = (recipientBloodType) => {
	return bloodCompatibility.recipientFromDonor[recipientBloodType] || [];
};

/**
 * Calculate compatibility score between donor and recipient
 * @param {string} donorBloodType - Donor's blood type
 * @param {string} recipientBloodType - Recipient's blood type
 * @returns {number} - Compatibility score (0-100)
 */
const getCompatibilityScore = (donorBloodType, recipientBloodType) => {
	if (!isCompatible(donorBloodType, recipientBloodType)) {
		return 0;
	}

	// Exact match gets highest score
	if (donorBloodType === recipientBloodType) {
		return 100;
	}

	// Universal donor O- gets high score but not perfect
	if (donorBloodType === 'O-') {
		return 90;
	}

	// Same ABO group but different Rh factor
	const donorABO = donorBloodType.slice(0, -1);
	const recipientABO = recipientBloodType.slice(0, -1);

	if (donorABO === recipientABO) {
		return 80;
	}

	// Compatible but different ABO groups
	return 70;
};

/**
 * Find the best donors for a recipient from a list of donors
 * @param {string} recipientBloodType - Recipient's blood type
 * @param {Array} donors - Array of donor objects with bloodType property
 * @returns {Array} - Sorted array of compatible donors with compatibility scores
 */
const findBestDonors = (recipientBloodType, donors) => {
	return donors
		.filter(donor => isCompatible(donor.bloodType, recipientBloodType))
		.map(donor => ({
			...donor,
			compatibilityScore: getCompatibilityScore(donor.bloodType, recipientBloodType)
		}))
		.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};

/**
 * Get blood type rarity score (for prioritization)
 * @param {string} bloodType - Blood type
 * @returns {number} - Rarity score (1-10, higher is rarer)
 */
const getBloodTypeRarity = (bloodType) => {
	const rarityScores = {
		'AB-': 10, // Rarest (0.6% of population)
		'B-': 9,   // Very rare (1.5%)
		'AB+': 8,  // Rare (3.4%)
		'A-': 7,   // Uncommon (6.3%)
		'O-': 6,   // Universal donor but uncommon (6.6%)
		'B+': 5,   // Less common (8.5%)
		'A+': 4,   // Common (35.7%)
		'O+': 3    // Most common (37.4%)
	};

	return rarityScores[bloodType] || 5;
};

/**
 * Calculate donation eligibility based on last donation date
 * @param {Date} lastDonationDate - Date of last donation
 * @returns {Object} - Eligibility info with canDonate boolean and daysUntilEligible
 */
const checkDonationEligibility = (lastDonationDate) => {
	if (!lastDonationDate) {
		return { canDonate: true, daysUntilEligible: 0 };
	}

	const minDaysBetweenDonations = 56; // 8 weeks
	const daysSinceLastDonation = Math.floor(
		(new Date() - new Date(lastDonationDate)) / (1000 * 60 * 60 * 24)
	);

	const canDonate = daysSinceLastDonation >= minDaysBetweenDonations;
	const daysUntilEligible = canDonate ? 0 : minDaysBetweenDonations - daysSinceLastDonation;

	return { canDonate, daysUntilEligible };
};

/**
 * Calculate blood shelf life and expiry
 * @param {Date} donationDate - Date when blood was donated
 * @param {string} component - Blood component type ('whole', 'rbc', 'platelets', 'plasma')
 * @returns {Object} - Expiry info with expiryDate, daysRemaining, isExpired
 */
const calculateBloodExpiry = (donationDate, component = 'whole') => {
	const shelfLife = {
		whole: 35,      // Whole blood: 35 days
		rbc: 42,        // Red blood cells: 42 days
		platelets: 5,   // Platelets: 5 days
		plasma: 365     // Plasma: 1 year when frozen
	};

	const daysValid = shelfLife[component] || shelfLife.whole;
	const expiryDate = new Date(donationDate);
	expiryDate.setDate(expiryDate.getDate() + daysValid);

	const now = new Date();
	const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
	const isExpired = daysRemaining <= 0;

	return {
		expiryDate,
		daysRemaining: Math.max(0, daysRemaining),
		isExpired,
		shelfLifeDays: daysValid
	};
};

/**
 * Generate blood bag ID
 * @param {string} bloodType - Blood type
 * @param {Date} donationDate - Donation date
 * @returns {string} - Unique blood bag ID
 */
const generateBloodBagId = (bloodType, donationDate = new Date()) => {
	const date = donationDate.toISOString().slice(0, 10).replace(/-/g, '');
	const bloodCode = bloodType.replace(/[+-]/g, (match) => match === '+' ? 'P' : 'N');
	const random = Math.random().toString(36).substr(2, 4).toUpperCase();
	return `BB${date}${bloodCode}${random}`;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // Earth's radius in kilometers
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

module.exports = {
	bloodCompatibility,
	isCompatible,
	getCompatibleRecipients,
	getCompatibleDonors,
	getCompatibilityScore,
	findBestDonors,
	getBloodTypeRarity,
	checkDonationEligibility,
	calculateBloodExpiry,
	generateBloodBagId,
	calculateDistance
};
