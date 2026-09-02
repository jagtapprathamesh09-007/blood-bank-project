const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper Function: Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @desc    Register New User (Multi-Role)
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, facilityName, contactNumber, bloodGroup, longitude, latitude } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists with this email');
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            facilityName,
            contactNumber,
            bloodGroup,
            location: {
                type: 'Point',
                coordinates: [longitude || 0, latitude || 0]
            }
        });

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                facilityName: user.facilityName,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login User
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    facilityName: user.facilityName,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all registered blood banks
// @route   GET /api/auth/blood-banks
// @access  Public / Private
const getBloodBanks = async (req, res, next) => {
    try {
        const bloodBanks = await User.find({ role: 'blood_bank' }).select('name facilityName location contactNumber');
        res.json({ success: true, count: bloodBanks.length, bloodBanks });
    } catch (error) {
        next(error);
    }
};

module.exports = { registerUser, loginUser, getMe, getBloodBanks }; 