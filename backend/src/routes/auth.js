const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'lifetrack_super_secret_jwt_key_2026_diploma';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, currency, gdprConsent } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!gdprConsent) {
      return res.status(400).json({ error: 'GDPR / RODO data processing consent is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name || null,
        currency: currency || 'PLN'
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// PUT /api/auth/currency - Update user preferred currency
router.put('/currency', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;
    const allowedCurrencies = ['PLN', 'EUR', 'USD', 'GBP'];

    if (!currency || !allowedCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid currency. Supported: PLN, EUR, USD, GBP' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { currency: currency.toUpperCase() },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Currency updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Failed to update currency' });
  }
});

module.exports = router;
