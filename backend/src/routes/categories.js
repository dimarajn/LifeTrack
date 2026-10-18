const express = require('express');
const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CATEGORIES = [
  // Expenses
  { id: 'def-1', name: 'Food', type: 'expense', color: '#FF6384', isDefault: true },
  { id: 'def-2', name: 'Transport', type: 'expense', color: '#36A2EB', isDefault: true },
  { id: 'def-3', name: 'Rent', type: 'expense', color: '#FFCE56', isDefault: true },
  { id: 'def-4', name: 'Entertainment', type: 'expense', color: '#9966FF', isDefault: true },
  { id: 'def-5', name: 'Health', type: 'expense', color: '#4BC0C0', isDefault: true },
  { id: 'def-6', name: 'Bills', type: 'expense', color: '#FF9F40', isDefault: true },
  { id: 'def-7', name: 'Shopping', type: 'expense', color: '#EC4899', isDefault: true },
  { id: 'def-8', name: 'Other', type: 'expense', color: '#6B7280', isDefault: true },
  
  // Incomes
  { id: 'def-9', name: 'Salary', type: 'income', color: '#10B981', isDefault: true },
  { id: 'def-10', name: 'Freelance', type: 'income', color: '#3B82F6', isDefault: true },
  { id: 'def-11', name: 'Gift', type: 'income', color: '#8B5CF6', isDefault: true },
  { id: 'def-12', name: 'Investments', type: 'income', color: '#F59E0B', isDefault: true },
  { id: 'def-13', name: 'Other', type: 'income', color: '#6B7280', isDefault: true },
];

// GET /api/categories - get all categories (system defaults + user custom)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    let userCategories = [];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifetrack_super_secret_jwt_key_2026_diploma');
        userCategories = await prisma.category.findMany({
          where: { userId: decoded.id },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        // Token invalid/expired - continue with defaults
      }
    }

    const allCategories = [
      ...userCategories.map(c => ({ ...c, isDefault: false })),
      ...DEFAULT_CATEGORIES
    ];

    const income = allCategories.filter(c => c.type === 'income');
    const expense = allCategories.filter(c => c.type === 'expense');

    res.json({ income, expense });
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - create custom category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, type, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Category name and type are required' });
    }

    const normalizedType = type.toLowerCase();
    if (!['income', 'expense'].includes(normalizedType)) {
      return res.status(400).json({ error: 'Type must be either "income" or "expense"' });
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user or in defaults
    const existingUserCategory = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name: { equals: trimmedName, mode: 'insensitive' },
        type: normalizedType
      }
    });

    if (existingUserCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        type: normalizedType,
        color: color || '#3B82F6',
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Category created successfully',
      data: { ...newCategory, isDefault: false }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// DELETE /api/categories/:id - delete custom category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const category = await prisma.category.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found or cannot delete default categories' });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
