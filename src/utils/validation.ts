// Validation utility functions for form validation

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface SignUpFormData {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	bloodType: string;
	weight: string;
	location: {
		city: string;
		area: string;
		coordinates?: {
			lat: number;
			lng: number;
		};
	};
	agreedToTerms: boolean;
	isAvailableDonor: boolean;
}

export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
	// Bangladeshi phone number validation (11 digits starting with 01)
	const phoneRegex = /^01[3-9]\d{8}$/;
	const cleanPhone = phone.replace(/[^\d]/g, '');

	// Check if it's in the correct Bangladeshi format
	if (phoneRegex.test(cleanPhone)) {
		return true;
	}

	// Check if it's in international format and can be converted
	if (cleanPhone.length === 13 && cleanPhone.startsWith('880')) {
		const localFormat = '0' + cleanPhone.substring(3);
		return phoneRegex.test(localFormat);
	}

	// Check if it's missing the leading 0
	if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
		const withLeadingZero = '0' + cleanPhone;
		return phoneRegex.test(withLeadingZero);
	}

	return false;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters long');
	}

	if (!/(?=.*[a-z])/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/(?=.*[A-Z])/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/(?=.*\d)/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (!/(?=.*[@$!%*?&])/.test(password)) {
		errors.push('Password must contain at least one special character (@$!%*?&)');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

export const validateAge = (dateOfBirth: string): boolean => {
	const today = new Date();
	const birthDate = new Date(dateOfBirth);
	const age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		return age - 1 >= 18;
	}

	return age >= 18;
};

export const validateWeight = (weight: string): boolean => {
	const weightNum = parseFloat(weight);
	return weightNum >= 45 && weightNum <= 200; // Minimum weight for blood donation is typically 45kg
};

export const validateSignUpForm = (formData: SignUpFormData): ValidationResult => {
	const errors: string[] = [];

	// Required fields validation
	if (!formData.firstName.trim()) {
		errors.push('First name is required');
	} else if (formData.firstName.length < 2) {
		errors.push('First name must be at least 2 characters long');
	}

	if (!formData.lastName.trim()) {
		errors.push('Last name is required');
	} else if (formData.lastName.length < 2) {
		errors.push('Last name must be at least 2 characters long');
	}

	if (!formData.email.trim()) {
		errors.push('Email is required');
	} else if (!validateEmail(formData.email)) {
		errors.push('Please enter a valid email address');
	}

	if (!formData.password) {
		errors.push('Password is required');
	} else {
		const passwordValidation = validatePassword(formData.password);
		if (!passwordValidation.isValid) {
			errors.push(...passwordValidation.errors);
		}
	}

	if (!formData.confirmPassword) {
		errors.push('Password confirmation is required');
	} else if (formData.password !== formData.confirmPassword) {
		errors.push('Passwords do not match');
	}

	if (!formData.phone.trim()) {
		errors.push('Phone number is required');
	} else if (!validatePhone(formData.phone)) {
		errors.push('Please enter a valid Bangladeshi phone number (01XXXXXXXXX)');
	}

	if (!formData.dateOfBirth) {
		errors.push('Date of birth is required');
	} else if (!validateAge(formData.dateOfBirth)) {
		errors.push('You must be at least 18 years old to register');
	}

	if (!formData.gender) {
		errors.push('Gender is required');
	}

	if (!formData.bloodType) {
		errors.push('Blood type is required');
	}

	if (!formData.weight.trim()) {
		errors.push('Weight is required');
	} else if (!validateWeight(formData.weight)) {
		errors.push('Weight must be between 45kg and 200kg');
	}

	if (!formData.location.city) {
		errors.push('City/District is required');
	}

	if (!formData.location.area) {
		errors.push('Area is required');
	}

	if (!formData.agreedToTerms) {
		errors.push('You must agree to the Terms of Service and Privacy Policy');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

export const sanitizeInput = (input: string): string => {
	return input.trim().replace(/[<>]/g, '');
};

export const formatPhoneNumber = (phone: string): string => {
	// Remove all non-digit characters
	const digits = phone.replace(/\D/g, '');

	// Handle different input formats and return Bangladeshi format (01XXXXXXXXX)
	if (digits.length === 11 && digits.startsWith('01')) {
		// Already in correct format (01XXXXXXXXX)
		return digits;
	} else if (digits.length === 13 && digits.startsWith('880')) {
		// Remove country code and add 0 (8801XXXXXXXXX -> 01XXXXXXXXX)
		return '0' + digits.substring(3);
	} else if (digits.length === 10 && digits.startsWith('1')) {
		// Add leading 0 (1XXXXXXXXX -> 01XXXXXXXXX)
		return '0' + digits;
	}

	// Return as is if format is unexpected
	return digits;
};
