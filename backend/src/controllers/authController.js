const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user.id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toJSON(),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ where: { email, isActive: true } });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken(user.id);
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON(),
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toJSON() });
});

const updateSavedStations = asyncHandler(async (req, res) => {
  const { stationId, action } = req.body;
  const user = req.user;

  let saved = user.savedStations || [];
  if (action === 'add' && !saved.includes(stationId)) {
    saved = [...saved, stationId];
  } else if (action === 'remove') {
    saved = saved.filter((id) => id !== stationId);
  }

  await user.update({ savedStations: saved });
  res.json({ success: true, savedStations: saved });
});

module.exports = { register, login, getMe, updateSavedStations };
