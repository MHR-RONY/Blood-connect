const express = require('express');
const router = express.Router();
const SSLCommerzPayment = require('sslcommerz-lts');
const { authenticate } = require('../middleware/auth');
const Payment = require('../models/Payment');

// SSLCommerz Configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID || 'codec6877f70ea1b0a';
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'codec6877f70ea1b0a@ssl';
const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

// Initiate Payment
router.post('/initiate', authenticate, async (req, res) => {
	try {
		const {
			amount,
			purpose,
			donorName,
			donorEmail,
			donorPhone,
			message,
			isAnonymous
		} = req.body;

		// Validate required fields
		if (!amount || !donorName || !donorEmail || !donorPhone) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields'
			});
		}

		// Generate unique transaction ID
		const tran_id = `BC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Prepare payment data for SSLCommerz
		const data = {
			total_amount: parseFloat(amount),
			currency: 'BDT',
			tran_id: tran_id,
			success_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/success`,
			fail_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/failed`,
			cancel_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/cancelled`,
			ipn_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/payment/ipn`,
			shipping_method: 'NO',
			product_name: purpose || 'General Donation',
			product_category: 'Blood Donation',
			product_profile: 'non-physical-goods',
			cus_name: donorName,
			cus_email: donorEmail,
			cus_add1: 'Dhaka, Bangladesh',
			cus_add2: 'Dhaka',
			cus_city: 'Dhaka',
			cus_state: 'Dhaka',
			cus_postcode: '1000',
			cus_country: 'Bangladesh',
			cus_phone: donorPhone,
			cus_fax: donorPhone,
			ship_name: donorName,
			ship_add1: 'Dhaka, Bangladesh',
			ship_add2: 'Dhaka',
			ship_city: 'Dhaka',
			ship_state: 'Dhaka',
			ship_postcode: 1000,
			ship_country: 'Bangladesh'
		};

		// Initialize SSLCommerz
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

		// Initiate payment
		const apiResponse = await sslcz.init(data);

		if (apiResponse.status === 'SUCCESS') {
			// Store transaction details in database
			const payment = new Payment({
				transactionId: tran_id,
				userId: req.user._id,
				amount: parseFloat(amount),
				purpose,
				donorName,
				donorEmail,
				donorPhone,
				message,
				isAnonymous: isAnonymous || false,
				status: 'PENDING',
				sessionkey: apiResponse.sessionkey
			});

			await payment.save();

			res.json({
				success: true,
				data: {
					gateway_url: apiResponse.GatewayPageURL,
					transaction_id: tran_id,
					sessionkey: apiResponse.sessionkey
				}
			});
		} else {
			res.status(400).json({
				success: false,
				message: 'Payment initiation failed',
				error: apiResponse
			});
		}
	} catch (error) {
		console.error('Payment initiation error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
			error: error.message
		});
	}
});

// Payment Success Callback (GET request from SSLCommerz redirect)
router.get('/success', async (req, res) => {
	try {
		const { tran_id, val_id, amount, card_type, bank_tran_id } = req.query;

		console.log('Payment success GET callback received:', { tran_id, val_id, amount, card_type, bank_tran_id });

		// Initialize SSLCommerz for validation
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

		// Validate the transaction with SSLCommerz
		const validationData = { val_id: val_id };
		const validationResponse = await sslcz.validate(validationData);

		console.log('Validation response:', validationResponse);

		if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
			// Update payment status in database
			const payment = await Payment.findOne({ transactionId: tran_id });
			if (payment) {
				await payment.updateStatus('SUCCESS', {
					validationId: val_id,
					bankTransactionId: bank_tran_id || validationResponse.bank_tran_id,
					cardType: card_type || validationResponse.card_type,
					gatewayResponse: validationResponse
				});
				console.log(`Payment ${tran_id} validated and marked as SUCCESS`);
			}

			// Redirect to frontend dashboard with payments tab active
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
			res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_success=true&tran_id=${tran_id}`);
		} else {
			console.log(`Payment validation failed for ${tran_id}:`, validationResponse);
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
			res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&tran_id=${tran_id}`);
		}
	} catch (error) {
		console.error('Payment success callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&error=server_error`);
	}
});

// Payment Success Callback (POST request)
router.post('/success', async (req, res) => {
	try {
		const { tran_id, val_id, amount, card_type, bank_tran_id } = req.body;

		console.log('Payment success POST callback received:', { tran_id, val_id, amount, card_type, bank_tran_id });

		// Initialize SSLCommerz for validation
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

		// Validate the transaction with SSLCommerz
		const validationData = { val_id: val_id };
		const validationResponse = await sslcz.validate(validationData);

		console.log('Validation response:', validationResponse);

		if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
			// Update payment status in database
			const payment = await Payment.findOne({ transactionId: tran_id });
			if (payment) {
				await payment.updateStatus('SUCCESS', {
					validationId: val_id,
					bankTransactionId: bank_tran_id || validationResponse.bank_tran_id,
					cardType: card_type || validationResponse.card_type,
					gatewayResponse: validationResponse
				});
				console.log(`Payment ${tran_id} validated and marked as SUCCESS`);
			}

			// Redirect to frontend dashboard with payments tab active
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
			res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_success=true&tran_id=${tran_id}`);
		} else {
			console.log(`Payment validation failed for ${tran_id}:`, validationResponse);
			const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
			res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&tran_id=${tran_id}`);
		}
	} catch (error) {
		console.error('Payment success callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&error=server_error`);
	}
});

// Payment Failed Callback (GET request from SSLCommerz redirect)
router.get('/failed', async (req, res) => {
	try {
		const { tran_id, error } = req.query;

		console.log('Payment failed GET callback received:', { tran_id, error });

		// Update payment status to failed in database
		const payment = await Payment.findOne({ transactionId: tran_id });
		if (payment) {
			await payment.updateStatus('FAILED', { gatewayResponse: { error } });
		}

		// Redirect to frontend dashboard with payments tab and error info
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&tran_id=${tran_id}&error=${error || 'payment_failed'}`);
	} catch (error) {
		console.error('Payment failed callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&error=server_error`);
	}
});

// Payment Failed Callback
router.post('/failed', async (req, res) => {
	try {
		const { tran_id, error } = req.body;

		console.log('Payment failed POST callback received:', { tran_id, error });

		// Update payment status to failed in database
		const payment = await Payment.findOne({ transactionId: tran_id });
		if (payment) {
			await payment.updateStatus('FAILED', { gatewayResponse: { error } });
		}

		// Redirect to frontend dashboard with payments tab and error info
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&tran_id=${tran_id}&error=${error || 'payment_failed'}`);
	} catch (error) {
		console.error('Payment failed callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_failed=true&error=server_error`);
	}
});

// Payment Cancelled Callback (GET request from SSLCommerz redirect)
router.get('/cancelled', async (req, res) => {
	try {
		const { tran_id } = req.query;

		console.log('Payment cancelled GET callback received:', { tran_id });

		// Update payment status to cancelled in database
		const payment = await Payment.findOne({ transactionId: tran_id });
		if (payment) {
			await payment.updateStatus('CANCELLED');
		}

		// Redirect to frontend dashboard with payments tab and cancelled info
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_cancelled=true&tran_id=${tran_id}`);
	} catch (error) {
		console.error('Payment cancelled callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_cancelled=true&error=server_error`);
	}
});

// Payment Cancelled Callback
router.post('/cancelled', async (req, res) => {
	try {
		const { tran_id } = req.body;

		console.log('Payment cancelled POST callback received:', { tran_id });

		// Update payment status to cancelled in database
		const payment = await Payment.findOne({ transactionId: tran_id });
		if (payment) {
			await payment.updateStatus('CANCELLED');
		}

		// Redirect to frontend dashboard with payments tab and cancelled info
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_cancelled=true&tran_id=${tran_id}`);
	} catch (error) {
		console.error('Payment cancelled callback error:', error);
		const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
		res.redirect(`${frontendUrl}/dashboard?activeTab=payments&payment_cancelled=true&error=server_error`);
	}
});

// IPN (Instant Payment Notification) endpoint
router.post('/ipn', async (req, res) => {
	try {
		const { tran_id, val_id, amount, status } = req.body;

		console.log('IPN received:', { tran_id, val_id, amount, status });

		if (status === 'VALID') {
			// Initialize SSLCommerz for validation
			const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

			// Validate the transaction with SSLCommerz
			const validationData = { val_id: val_id };
			const validationResponse = await sslcz.validate(validationData);

			if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
				// Payment confirmed via IPN
				const payment = await Payment.findOne({ transactionId: tran_id });
				if (payment && payment.status !== 'SUCCESS') {
					await payment.updateStatus('SUCCESS', {
						validationId: val_id,
						ipnReceived: true,
						ipnData: req.body,
						gatewayResponse: validationResponse
					});
					console.log(`IPN validated and payment ${tran_id} confirmed as SUCCESS`);
				}
			}
		}

		res.status(200).send('IPN received');
	} catch (error) {
		console.error('IPN processing error:', error);
		res.status(500).send('IPN processing failed');
	}
});

// Get Payment Status
router.get('/status/:transactionId', authenticate, async (req, res) => {
	try {
		const { transactionId } = req.params;

		// Query database for payment status
		const payment = await Payment.findOne({ transactionId }).select('-sessionkey -gatewayResponse');

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: 'Payment not found'
			});
		}

		res.json({
			success: true,
			data: payment
		});
	} catch (error) {
		console.error('Get payment status error:', error);
		res.status(500).json({
			success: false,
			message: 'Error fetching payment status'
		});
	}
});

// Get Payment History for User
router.get('/history', authenticate, async (req, res) => {
	try {
		const { page = 1, limit = 10, status } = req.query;

		const filter = { userId: req.user._id };
		if (status) {
			filter.status = status;
		}

		const payments = await Payment.find(filter)
			.select('-sessionkey -gatewayResponse')
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		const total = await Payment.countDocuments(filter);

		res.json({
			success: true,
			data: {
				payments,
				pagination: {
					current: page,
					pages: Math.ceil(total / limit),
					total
				}
			}
		});
	} catch (error) {
		console.error('Get payment history error:', error);
		res.status(500).json({
			success: false,
			message: 'Error fetching payment history'
		});
	}
});

// Manual validation endpoint for existing transactions
router.post('/validate/:transactionId', authenticate, async (req, res) => {
	try {
		const { transactionId } = req.params;

		// Find the payment in database
		const payment = await Payment.findOne({ transactionId });

		if (!payment) {
			return res.status(404).json({
				success: false,
				message: 'Payment not found'
			});
		}

		// If already successful, return current status
		if (payment.status === 'SUCCESS') {
			return res.json({
				success: true,
				message: 'Payment already validated',
				data: payment
			});
		}

		// Initialize SSLCommerz for transaction query
		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

		// Query transaction status by transaction ID
		const queryData = { tran_id: transactionId };
		const queryResponse = await sslcz.transactionQueryByTransactionId(queryData);

		console.log('Transaction query response:', queryResponse);

		if (queryResponse && (queryResponse.status === 'VALID' || queryResponse.status === 'VALIDATED')) {
			// Update payment status in database
			await payment.updateStatus('SUCCESS', {
				validationId: queryResponse.val_id,
				bankTransactionId: queryResponse.bank_tran_id,
				cardType: queryResponse.card_type,
				gatewayResponse: queryResponse
			});

			console.log(`Transaction ${transactionId} manually validated and marked as SUCCESS`);

			res.json({
				success: true,
				message: 'Payment validated successfully',
				data: {
					transaction_id: transactionId,
					status: 'SUCCESS',
					validation_response: queryResponse
				}
			});
		} else if (queryResponse && queryResponse.status === 'FAILED') {
			// Update payment status to failed
			await payment.updateStatus('FAILED', {
				gatewayResponse: queryResponse
			});

			res.json({
				success: false,
				message: 'Payment validation failed',
				data: {
					transaction_id: transactionId,
					status: 'FAILED',
					validation_response: queryResponse
				}
			});
		} else {
			res.json({
				success: false,
				message: 'Payment status unclear',
				data: {
					transaction_id: transactionId,
					status: 'PENDING',
					validation_response: queryResponse
				}
			});
		}
	} catch (error) {
		console.error('Manual validation error:', error);
		res.status(500).json({
			success: false,
			message: 'Error validating payment',
			error: error.message
		});
	}
});

// Validate all pending payments
router.post('/validate-all', authenticate, async (req, res) => {
	try {
		// Find all pending payments for this user
		const pendingPayments = await Payment.find({
			userId: req.user._id,
			status: 'PENDING'
		});

		if (pendingPayments.length === 0) {
			return res.json({
				success: true,
				message: 'No pending payments found',
				data: { updated: 0 }
			});
		}

		const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
		let updatedCount = 0;

		// Validate each pending payment
		for (const payment of pendingPayments) {
			try {
				const queryData = { tran_id: payment.transactionId };
				const queryResponse = await sslcz.transactionQueryByTransactionId(queryData);

				if (queryResponse && (queryResponse.status === 'VALID' || queryResponse.status === 'VALIDATED')) {
					await payment.updateStatus('SUCCESS', {
						validationId: queryResponse.val_id,
						bankTransactionId: queryResponse.bank_tran_id,
						cardType: queryResponse.card_type,
						gatewayResponse: queryResponse
					});
					updatedCount++;
					console.log(`Payment ${payment.transactionId} validated via batch process`);
				} else if (queryResponse && queryResponse.status === 'FAILED') {
					await payment.updateStatus('FAILED', {
						gatewayResponse: queryResponse
					});
					updatedCount++;
				}
			} catch (err) {
				console.error(`Error validating payment ${payment.transactionId}:`, err);
			}
		}

		res.json({
			success: true,
			message: `Validated ${updatedCount} payments`,
			data: {
				total_pending: pendingPayments.length,
				updated: updatedCount
			}
		});
	} catch (error) {
		console.error('Batch validation error:', error);
		res.status(500).json({
			success: false,
			message: 'Error validating payments',
			error: error.message
		});
	}
});

module.exports = router;
