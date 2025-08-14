const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/inventory
// @desc    Get all blood inventory
// @access  Private (Admin)
router.get('/', authenticate, async (req, res) => {
	try {
		const inventory = await Inventory.find()
			.populate('updatedBy', 'name email')
			.sort({ bloodType: 1 });

		// Ensure all blood types exist
		const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
		const inventoryMap = {};

		inventory.forEach(item => {
			inventoryMap[item.bloodType] = item;
		});

		// Create missing blood types with zero inventory
		for (const bloodType of bloodTypes) {
			if (!inventoryMap[bloodType]) {
				const newInventory = new Inventory({
					bloodType,
					units: 0,
					batches: [],
					updatedBy: req.user.id
				});
				await newInventory.save();
				inventoryMap[bloodType] = newInventory;
			}
		}

		// Get updated inventory with all blood types
		const completeInventory = await Inventory.find()
			.populate('updatedBy', 'name email')
			.sort({ bloodType: 1 });

		// Format response with calculated fields
		const formattedInventory = completeInventory.map(item => ({
			_id: item._id,
			bloodType: item.bloodType,
			units: item.availableUnits,
			availableUnits: item.availableUnits,
			expiredUnits: item.expiredUnits,
			status: item.status,
			nextExpiryDate: item.nextExpiryDate,
			batches: item.batches.filter(batch => batch.status === 'available' && batch.expiryDate > new Date()),
			allBatches: item.batches,
			thresholds: item.thresholds,
			lastUpdated: item.lastUpdated,
			updatedBy: item.updatedBy
		}));

		res.json(formattedInventory);
	} catch (error) {
		console.error('Get inventory error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private (Admin)
router.get('/stats', authenticate, async (req, res) => {
	try {
		const inventory = await Inventory.find();

		const stats = {
			totalUnits: 0,
			totalBloodTypes: inventory.length,
			criticalCount: 0,
			lowStockCount: 0,
			expiredUnits: 0,
			expiringIn7Days: 0,
			byBloodType: {}
		};

		const sevenDaysFromNow = new Date();
		sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

		inventory.forEach(item => {
			const available = item.availableUnits;
			const expired = item.expiredUnits;

			stats.totalUnits += available;
			stats.expiredUnits += expired;

			if (item.status === 'Critical') stats.criticalCount++;
			if (item.status === 'Low' || item.status === 'Critical') stats.lowStockCount++;

			// Count units expiring in 7 days
			const expiringUnits = item.batches
				.filter(batch =>
					batch.status === 'available' &&
					batch.expiryDate > new Date() &&
					batch.expiryDate <= sevenDaysFromNow
				)
				.reduce((total, batch) => total + batch.units, 0);

			stats.expiringIn7Days += expiringUnits;

			stats.byBloodType[item.bloodType] = {
				units: available,
				status: item.status,
				nextExpiry: item.nextExpiryDate,
				expired: expired,
				expiringIn7Days: expiringUnits
			};
		});

		res.json(stats);
	} catch (error) {
		console.error('Get inventory stats error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route   POST /api/inventory/add-stock
// @desc    Add blood stock (new batch)
// @access  Private (Admin)
router.post('/add-stock', [
	authenticate,
	body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
	body('units').isInt({ min: 1 }),
	body('expiryDate').isISO8601(),
	body('donorId').optional().isMongoId(),
	body('location').optional().isString()
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { bloodType, units, expiryDate, donorId, location } = req.body;

		let inventory = await Inventory.findOne({ bloodType });

		if (!inventory) {
			inventory = new Inventory({
				bloodType,
				units: 0,
				batches: [],
				updatedBy: req.user.id
			});
		}

		// Generate batch ID
		const batchId = `${bloodType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

		// Add new batch
		inventory.batches.push({
			batchId,
			units: parseInt(units),
			expiryDate: new Date(expiryDate),
			donorId: donorId || null,
			location: location || 'Main Storage',
			status: 'available'
		});

		inventory.updatedBy = req.user.id;
		await inventory.save();

		res.json({
			message: 'Stock added successfully',
			inventory: {
				bloodType: inventory.bloodType,
				units: inventory.availableUnits,
				status: inventory.status,
				batchId
			}
		});
	} catch (error) {
		console.error('Add stock error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route   POST /api/inventory/remove-stock
// @desc    Remove blood stock (use blood)
// @access  Private (Admin)
router.post('/remove-stock', [
	authenticate,
	body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
	body('units').isInt({ min: 1 }),
	body('reason').optional().isString()
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { bloodType, units, reason } = req.body;

		const inventory = await Inventory.findOne({ bloodType });

		if (!inventory) {
			return res.status(404).json({ message: 'Blood type not found in inventory' });
		}

		if (inventory.availableUnits < units) {
			return res.status(400).json({
				message: `Insufficient stock. Available: ${inventory.availableUnits} units, Requested: ${units} units`
			});
		}

		// Remove units from oldest batches first (FIFO)
		let unitsToRemove = parseInt(units);
		const availableBatches = inventory.batches
			.filter(batch => batch.status === 'available' && batch.expiryDate > new Date())
			.sort((a, b) => a.expiryDate - b.expiryDate);

		for (const batch of availableBatches) {
			if (unitsToRemove <= 0) break;

			if (batch.units <= unitsToRemove) {
				// Use entire batch
				unitsToRemove -= batch.units;
				batch.status = 'used';
			} else {
				// Partially use batch
				batch.units -= unitsToRemove;
				unitsToRemove = 0;
			}
		}

		inventory.updatedBy = req.user.id;
		await inventory.save();

		res.json({
			message: 'Stock removed successfully',
			inventory: {
				bloodType: inventory.bloodType,
				units: inventory.availableUnits,
				status: inventory.status,
				reason: reason || 'Used for patient care'
			}
		});
	} catch (error) {
		console.error('Remove stock error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route   PUT /api/inventory/:bloodType/thresholds
// @desc    Update stock thresholds
// @access  Private (Admin)
router.put('/:bloodType/thresholds', [
	authenticate,
	body('critical').isInt({ min: 0 }),
	body('low').isInt({ min: 0 }),
	body('good').isInt({ min: 0 })
], async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { bloodType } = req.params;
		const { critical, low, good } = req.body;

		const inventory = await Inventory.findOne({ bloodType });

		if (!inventory) {
			return res.status(404).json({ message: 'Blood type not found' });
		}

		inventory.thresholds = { critical, low, good };
		inventory.updatedBy = req.user.id;
		await inventory.save();

		res.json({
			message: 'Thresholds updated successfully',
			thresholds: inventory.thresholds
		});
	} catch (error) {
		console.error('Update thresholds error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

// @route   DELETE /api/inventory/expired
// @desc    Remove expired blood batches
// @access  Private (Admin)
router.delete('/expired', authenticate, async (req, res) => {
	try {
		const inventories = await Inventory.find();
		let totalExpiredUnits = 0;
		let affectedBloodTypes = [];

		for (const inventory of inventories) {
			const expiredBatches = inventory.batches.filter(batch =>
				batch.expiryDate <= new Date() && batch.status === 'available'
			);

			if (expiredBatches.length > 0) {
				const expiredUnits = expiredBatches.reduce((sum, batch) => sum + batch.units, 0);
				totalExpiredUnits += expiredUnits;
				affectedBloodTypes.push({
					bloodType: inventory.bloodType,
					expiredUnits,
					batchCount: expiredBatches.length
				});

				// Mark expired batches
				expiredBatches.forEach(batch => {
					batch.status = 'expired';
				});

				inventory.updatedBy = req.user.id;
				await inventory.save();
			}
		}

		res.json({
			message: 'Expired blood removed successfully',
			totalExpiredUnits,
			affectedBloodTypes,
			summary: `Removed ${totalExpiredUnits} expired units from ${affectedBloodTypes.length} blood types`
		});
	} catch (error) {
		console.error('Remove expired error:', error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
