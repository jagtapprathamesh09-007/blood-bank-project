const EmergencyRequest = require('../models/EmergencyRequest');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const { getCompatibleBloodGroups } = require('../utils/compatibility');

// @desc    Direct Patient Emergency Request (Public - No Token Required)
// @route   POST /api/requests
// @access  Public
const createPatientRequest = async (req, res, next) => {
    try {
        const { 
            patientName, 
            requiredBloodGroup, 
            componentType, 
            unitsRequired, 
            contactPhone,
            hospitalNode 
        } = req.body;

        // Kisi bhi existing hospital ka ID attach karo agar schema required demand kare
        let defaultHospital = null;
        const anyHospital = await User.findOne({ role: 'hospital' });
        if (anyHospital) {
            defaultHospital = anyHospital._id;
        }

        const newRequest = await EmergencyRequest.create({
            hospital: defaultHospital,
            patientName: patientName || 'Emergency Patient',
            requiredBloodGroup: requiredBloodGroup || 'O+',
            componentType: componentType || 'Whole Blood',
            unitsRequired: unitsRequired ? Number(unitsRequired) : 1,
            urgencyLevel: 'Critical',
            contactPhone: contactPhone || '9876543210',
            status: 'Pending',
            location: {
                type: 'Point',
                coordinates: [72.8777, 19.0760]
            },
            notes: hospitalNode ? `Target Hospital: ${hospitalNode}` : ''
        });

        res.status(201).json({
            success: true,
            message: 'Emergency Blood Request Logged for ER Verification',
            request: newRequest
        });
    } catch (error) {
        console.error('SERVER 500 ERROR DETAILS:', error);
        res.status(500).json({ error: error.message });
    }
};

// @desc    Create Emergency Request & Find Nearest Blood Banks
// @route   POST /api/requests/emergency
// @access  Private (Hospital Only)
const createEmergencyRequest = async (req, res, next) => {
    try {
        const { patientName, requiredBloodGroup, componentType, unitsRequired, urgencyLevel, longitude, latitude } = req.body;

        const emergencyRequest = await EmergencyRequest.create({
            hospital: req.user._id,
            patientName,
            requiredBloodGroup,
            componentType,
            unitsRequired,
            urgencyLevel,
            location: {
                type: 'Point',
                coordinates: [
                    longitude || (req.user.location && req.user.location.coordinates ? req.user.location.coordinates[0] : 0), 
                    latitude || (req.user.location && req.user.location.coordinates ? req.user.location.coordinates[1] : 0)
                ]
            },
            status: 'Pending'
        });

        const compatibleGroups = getCompatibleBloodGroups(requiredBloodGroup, componentType);

        const nearbyBloodBanks = await User.find({
            role: 'blood_bank',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: emergencyRequest.location.coordinates
                    },
                    $maxDistance: 50000
                }
            }
        }).select('_id facilityName contactNumber location');

        const bloodBankIds = nearbyBloodBanks.map(b => b._id);

        const matchingStock = await Inventory.find({
            bloodBank: { $in: bloodBankIds },
            bloodGroup: { $in: compatibleGroups },
            componentType: componentType,
            unitsAvailable: { $gte: unitsRequired }
        }).populate('bloodBank', 'facilityName contactNumber location');

        const io = req.app.get('io');
        if (io) {
            io.emit('CODE_RED_EMERGENCY', {
                message: `CRITICAL EMERGENCY: ${unitsRequired} units of ${requiredBloodGroup} (${componentType}) needed!`,
                request: emergencyRequest,
                compatibleGroups
            });
        }

        res.status(201).json({
            success: true,
            emergencyRequest,
            compatibleGroups,
            nearbyMatchedBanks: matchingStock
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Active Emergency Requests
// @route   GET /api/requests
// @access  Public (Allowed for Tracking Radar & Dashboards)
const getEmergencyRequests = async (req, res, next) => {
    try {
        const requests = await EmergencyRequest.find()
            .populate('hospital', 'facilityName contactNumber location')
            .populate('assignedBloodBank', 'facilityName contactNumber')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: requests.length, requests });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Emergency Request Status
// @route   PUT /api/requests/:id/status
// @access  Private (Blood Bank / Driver / Hospital)
const updateRequestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const request = await EmergencyRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ success: false, error: 'Request not found' });
        }

        request.status = status;
        await request.save();

        res.json({ success: true, request });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    createPatientRequest,
    createEmergencyRequest, 
    getEmergencyRequests, 
    updateRequestStatus 
};