const Inventory = require('../models/Inventory');
const BloodBatch = require('../models/BloodBatch');

// @desc    Add or Update Blood Stock Batch
// @route   POST /api/inventory/batch
// @access  Private (Blood Bank Manager only)
const addBloodBatch = async (req, res, next) => {
    try {
        const { batchNumber, bloodGroup, componentType, quantityUnits, collectionDate, expiryDate, storageTemperature } = req.body;

        // Create granular batch
        const batch = await BloodBatch.create({
            batchNumber,
            bloodBank: req.user._id,
            bloodGroup,
            componentType,
            quantityUnits,
            collectionDate,
            expiryDate,
            storageTemperature
        });

        // Update aggregate Inventory collection
        let inventory = await Inventory.findOne({
            bloodBank: req.user._id,
            bloodGroup,
            componentType
        });

        if (inventory) {
            inventory.unitsAvailable += Number(quantityUnits);
            await inventory.save();
        } else {
            inventory = await Inventory.create({
                bloodBank: req.user._id,
                bloodGroup,
                componentType,
                unitsAvailable: quantityUnits
            });
        }

        res.status(201).json({
            success: true,
            batch,
            currentStock: inventory
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Inventory Stock for a Blood Bank
// @route   GET /api/inventory
// @access  Public / Private
const getInventory = async (req, res, next) => {
    try {
        const bloodBankId = req.query.bloodBank || req.user?._id;
        
        const stock = await Inventory.find({ bloodBank: bloodBankId });
        res.json({ success: true, count: stock.length, stock });
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Batches (with Expiry Warnings)
// @route   GET /api/inventory/batches
// @access  Private (Blood Bank / Admin)
const getBatches = async (req, res, next) => {
    try {
        const batches = await BloodBatch.find({ bloodBank: req.user._id }).sort({ expiryDate: 1 });
        res.json({ success: true, count: batches.length, batches });
    } catch (error) {
        next(error);
    }
};

module.exports = { addBloodBatch, getInventory, getBatches };