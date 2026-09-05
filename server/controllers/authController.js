const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');

// In-memory fallback store if database is offline
const inMemoryUsers = [];

// Helper to generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_ai_recruitment_platform_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register new user (Candidate or Recruiter)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userRole = ['candidate', 'recruiter', 'admin'].includes(role) ? role : 'candidate';

    // DB Mode
    if (getDBStatus()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const user = await User.create({ name, email, password, role: userRole });
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // In-memory Fallback Mode
    const existing = inMemoryUsers.find(u => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const fallbackUser = {
      id: `mem_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      role: userRole
    };
    inMemoryUsers.push(fallbackUser);

    const token = generateToken(fallbackUser);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: fallbackUser.id,
        name: fallbackUser.name,
        email: fallbackUser.email,
        role: fallbackUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // DB Mode
    if (getDBStatus()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }

    // In-memory Fallback Mode
    const fallbackUser = inMemoryUsers.find(u => u.email === email.toLowerCase() && u.password === password);
    if (!fallbackUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(fallbackUser);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: fallbackUser.id,
        name: fallbackUser.name,
        email: fallbackUser.email,
        role: fallbackUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
