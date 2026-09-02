const LogisticDispatch = require('../models/LogisticDispatch');
const EmergencyRequest = require('../models/EmergencyRequest');
const Inventory = require('../models/Inventory');
const logAudit = require('../utils/auditLogger');

// @desc    Accept Request & Assign Dispatch (Blood Bank Manager)
// @route   POST /api/dispatch/accept
// @access  Private (Blood Bank Manager)
const acceptAndDispatch = async (req, res, next) => {
    try {
        const { requestId, driverId, vehicleNumber, estimatedTimeArrival } = req.body;

        const request = await EmergencyRequest.findById(requestId);
        if (!request) {
            res.status(404);
            throw new Error('Emergency request not found');
        }

        if (request.status !== 'Pending') {
            res.status(400);
            throw new Error('This request has already been processed or cancelled');
        }

        // Deduct inventory stock
        const inventory = await Inventory.findOne({
            bloodBank: req.user._id,
            bloodGroup: request.requiredBloodGroup,
            componentType: request.componentType
        });

        if (!inventory || inventory.unitsAvailable < request.unitsRequired) {
            res.status(400);
            throw new Error('Insufficient stock available in inventory to fulfill request');
        }

        inventory.unitsAvailable -= Number(request.unitsRequired);
        await inventory.save();

        // Update Request Status
        request.status = 'Accepted';
        request.assignedBloodBank = req.user._id;
        if (driverId) request.assignedDriver = driverId;
        await request.save();

        // Create Logistic Dispatch Record
        const dispatch = await LogisticDispatch.create({
            emergencyRequest: request._id,
            bloodBank: req.user._id,
            hospital: request.hospital,
            driver: driverId || null,
            vehicleNumber: vehicleNumber || 'MH-31-EMG-108',
            estimatedTimeArrival: estimatedTimeArrival || '20 mins',
            status: 'Assigned'
        });

        // Audit Logging
        await logAudit(
            req.user._id,
            'REQUEST_ACCEPTED',
            `Accepted emergency request ${requestId} for ${request.unitsRequired} units of ${request.requiredBloodGroup}`,
            req.ip,
            'INFO'
        );

        // Emit Socket.io event for real-time status update to Hospital Dashboard
        const io = req.app.get('io');
        io.emit('DISPATCH_STATUS_UPDATED', {
            message: `Your emergency request for ${request.requiredBloodGroup} has been accepted and assigned!`,
            dispatch,
            request
        });

        res.status(201).json({
            success: true,
            message: 'Dispatch initiated successfully',
            dispatch,
            remainingStock: inventory.unitsAvailable
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Transit Status & GPS Location (Driver / System)
// @route   PUT /api/dispatch/:id/status
// @access  Private (Driver / Blood Bank / Admin)
const updateDispatchStatus = async (req, res, next) => {
    try {
        const { status, longitude, latitude, estimatedTimeArrival } = req.body;

        const dispatch = await LogisticDispatch.findById(req.params.id).populate('emergencyRequest');
        if (!dispatch) {
            res.status(404);
            throw new Error('Dispatch record not found');
        }

        if (status) dispatch.status = status;
        if (estimatedTimeArrival) dispatch.estimatedTimeArrival = estimatedTimeArrival;
        if (longitude && latitude) {
            dispatch.currentLocation = {
                type: 'Point',
                coordinates: [longitude, latitude]
            };
        }

        await dispatch.save();

        // Update corresponding Emergency Request status
        if (status === 'Delivered') {
            await EmergencyRequest.findByIdAndUpdate(dispatch.emergencyRequest._id, { status: 'Fulfilled' });
        } else if (status === 'In-Transit' || status === 'Dispatched') {
            await EmergencyRequest.findByIdAndUpdate(dispatch.emergencyRequest._id, { status: status });
        }

        // Emit Socket Event for real-time live map tracking
        const io = req.app.get('io');
        io.emit('LIVE_LOCATION_UPDATE', {
            dispatchId: dispatch._id,
            status: dispatch.status,
            coordinates: dispatch.currentLocation.coordinates,
            estimatedTimeArrival: dispatch.estimatedTimeArrival
        });

        res.json({ success: true, dispatch });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Active Dispatches
// @route   GET /api/dispatch
// @access  Private
const getDispatches = async (req, res, next) => {
    try {
        const dispatches = await LogisticDispatch.find()
            .populate('emergencyRequest')
            .populate('bloodBank', 'facilityName contactNumber')
            .populate('hospital', 'facilityName contactNumber')
            .populate('driver', 'name contactNumber')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: dispatches.length, dispatches });
    } catch (error) {
        next(error);
    }
};

module.exports = { acceptAndDispatch, updateDispatchStatus, getDispatches };