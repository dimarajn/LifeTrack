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
        monthlyBudget: true,
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
        monthlyBudget: user.monthlyBudget,
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
        monthlyBudget: true,
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

// Fallback exchange rates (relative to 1 PLN) in case external API is unreachable
const FALLBACK_FROM_PLN = {
  PLN: 1,
  EUR: 0.228,
  USD: 0.255,
  GBP: 0.191
};

async function fetchLiveRates(baseCurrency = 'PLN') {
  const base = baseCurrency.toUpperCase();
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=PLN,EUR,USD,GBP`);
    if (res.ok) {
      const data = await res.json();
      return {
        base,
        date: data.date,
        source: 'ECB (European Central Bank)',
        rates: { ...data.rates, [base]: 1 }
      };
    }
  } catch (err) {
    console.warn('Live exchange rate fetch warning, using fallback:', err.message);
  }

  // Fallback calculation via PLN
  const baseInPln = FALLBACK_FROM_PLN[base] || 1;
  const fallbackRates = {};
  for (const [curr, val] of Object.entries(FALLBACK_FROM_PLN)) {
    fallbackRates[curr] = Number((val / baseInPln).toFixed(5));
  }
  return {
    base,
    date: new Date().toISOString().split('T')[0],
    source: 'Fallback',
    rates: fallbackRates
  };
}

// GET /api/auth/rates - Get live exchange rates for currency selector
router.get('/rates', async (req, res) => {
  try {
    const base = (req.query.base || 'PLN').toUpperCase();
    const rateInfo = await fetchLiveRates(base);
    res.json(rateInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// PUT /api/auth/currency - Update user preferred currency & convert all amounts by live exchange rate
router.put('/currency', authenticateToken, async (req, res) => {
  try {
    const { currency } = req.body;
    const allowedCurrencies = ['PLN', 'EUR', 'USD', 'GBP'];

    if (!currency || !allowedCurrencies.includes(currency.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid currency. Supported: PLN, EUR, USD, GBP' });
    }

    const targetCurrency = currency.toUpperCase();

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldCurrency = (currentUser.currency || 'PLN').toUpperCase();

    if (oldCurrency === targetCurrency) {
      return res.json({
        message: 'Currency unchanged',
        rate: 1,
        user: {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          currency: currentUser.currency,
          monthlyBudget: currentUser.monthlyBudget,
          createdAt: currentUser.createdAt
        }
      });
    }

    // Fetch live exchange rate from oldCurrency -> targetCurrency
    const rateData = await fetchLiveRates(oldCurrency);
    const rate = rateData.rates[targetCurrency] || 1;

    // Fetch user's transactions and goals to convert their amounts
    const [userTransactions, userGoals] = await Promise.all([
      prisma.transaction.findMany({ where: { userId: req.user.id } }),
      prisma.goal.findMany({ where: { userId: req.user.id } })
    ]);

    const newBudget = currentUser.monthlyBudget
      ? Math.round(currentUser.monthlyBudget * rate * 100) / 100
      : null;

    // Execute all conversions atomically
    const ops = [
      ...userTransactions.map(tx =>
        prisma.transaction.update({
          where: { id: tx.id },
          data: { amount: Math.max(0.01, Math.round(tx.amount * rate * 100) / 100) }
        })
      ),
      ...userGoals.map(g =>
        prisma.goal.update({
          where: { id: g.id },
          data: {
            targetAmount: Math.max(0.01, Math.round(g.targetAmount * rate * 100) / 100),
            currentAmount: Math.round(g.currentAmount * rate * 100) / 100
          }
        })
      ),
      prisma.user.update({
        where: { id: req.user.id },
        data: {
          currency: targetCurrency,
          monthlyBudget: newBudget
        },
        select: {
          id: true,
          email: true,
          name: true,
          currency: true,
          monthlyBudget: true,
          createdAt: true
        }
      })
    ];

    const results = await prisma.$transaction(ops);
    const updatedUser = results[results.length - 1];

    res.json({
      message: `Currency converted from ${oldCurrency} to ${targetCurrency} (rate: ${rate})`,
      rate,
      rateDate: rateData.date,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update currency error:', error);
    res.status(500).json({ error: 'Failed to update currency' });
  }
});

// PUT /api/auth/budget - Update user monthly budget limit
router.put('/budget', authenticateToken, async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    let parsedBudget = null;

    if (monthlyBudget !== null && monthlyBudget !== '' && monthlyBudget !== undefined) {
      parsedBudget = parseFloat(monthlyBudget);
      if (isNaN(parsedBudget) || parsedBudget < 0) {
        return res.status(400).json({ error: 'Budget must be a positive number or null' });
      }
      if (parsedBudget === 0) parsedBudget = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { monthlyBudget: parsedBudget },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        monthlyBudget: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Monthly budget updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Failed to update monthly budget' });
  }
});

// DELETE /api/auth/account - Delete user account and all personal data (RODO / GDPR Art. 17)
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    // Prevent deleting the shared demo account
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (currentUser.email === 'demo@lifetrack.app') {
      return res.status(403).json({ error: 'Demo account cannot be deleted' });
    }

    await prisma.user.delete({
      where: { id: req.user.id }
    });

    res.json({ message: 'Account and all associated personal data deleted permanently (RODO Art. 17)' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
});

module.exports = router;
