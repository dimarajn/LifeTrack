const express = require('express');
const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// GET /api/goals - Get all savings goals for current user
router.get('/', async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    console.error('Fetch goals error:', error);
    res.status(500).json({ error: 'Failed to fetch savings goals' });
  }
});

// POST /api/goals - Create a new savings goal
router.post('/', async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline, color } = req.body;

    if (!title || targetAmount === undefined) {
      return res.status(400).json({ error: 'Title and target amount are required' });
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({ error: 'Target amount must be a positive number' });
    }

    const numCurrent = currentAmount ? Math.max(0, parseFloat(currentAmount) || 0) : 0;

    let parsedDeadline = null;
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d)) parsedDeadline = d;
    }

    const goal = await prisma.goal.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        targetAmount: numTarget,
        currentAmount: numCurrent,
        deadline: parsedDeadline,
        color: color || '#3B82F6'
      }
    });

    res.status(201).json({
      message: 'Savings goal created successfully',
      data: goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Failed to create savings goal' });
  }
});

// PATCH /api/goals/:id/deposit - Add funds to a savings goal
router.patch('/:id/deposit', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount } = req.body;

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount === 0) {
      return res.status(400).json({ error: 'Valid deposit amount is required' });
    }

    const existing = await prisma.goal.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const updatedAmount = Math.max(0, existing.currentAmount + addAmount);

    const updated = await prisma.goal.update({
      where: { id },
      data: { currentAmount: updatedAmount }
    });

    res.json({
      message: 'Goal updated',
      data: updated
    });
  } catch (error) {
    console.error('Deposit goal error:', error);
    res.status(500).json({ error: 'Failed to update goal amount' });
  }
});

// DELETE /api/goals/:id - Delete a savings goal
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.goal.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await prisma.goal.delete({
      where: { id }
    });

    res.json({ message: 'Savings goal deleted' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Failed to delete savings goal' });
  }
});

module.exports = router;
