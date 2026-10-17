const express = require('express');
const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Freelance', 'Gift', 'Investments', 'Other'],
  expense: ['Food', 'Transport', 'Rent', 'Entertainment', 'Health', 'Bills', 'Shopping', 'Other']
};

// GET /api/categories - get available categories
router.get('/', async (req, res) => {
  try {
    // If user is authenticated, we could also load custom categories
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let customCategories = [];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifetrack_super_secret_jwt_key_2026_diploma');
        customCategories = await prisma.category.findMany({
          where: { userId: decoded.id }
        });
      } catch (e) {
        // Ignore token errors for categories endpoint
      }
    }

    const income = [...DEFAULT_CATEGORIES.income];
    const expense = [...DEFAULT_CATEGORIES.expense];

    customCategories.forEach(c => {
      if (c.type === 'income' && !income.includes(c.name)) income.push(c.name);
      if (c.type === 'expense' && !expense.includes(c.name)) expense.push(c.name);
    });

    res.json({ income, expense });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
