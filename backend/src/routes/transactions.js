const express = require('express');
const prisma = require('../lib/prisma');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(authenticateToken);

// Helper to construct date range query
function buildDateFilter(from, to) {
  const dateFilter = {};
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) dateFilter.gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate)) {
      // If only date string was passed without time, include full end of day
      if (to.length === 10) {
        toDate.setHours(23, 59, 59, 999);
      }
      dateFilter.lte = toDate;
    }
  }
  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

// GET /api/transactions - Get transactions for current user with filtering
router.get('/', async (req, res) => {
  try {
    const { type, limit, from, to } = req.query;

    const where = { userId: req.user.id };
    if (type) {
      where.type = type;
    }

    const dateFilter = buildDateFilter(from, to);
    if (dateFilter) {
      where.date = dateFilter;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : undefined
    });

    res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/stats - Calculate stats & breakdown for current user with optional date filtering
router.get('/stats', async (req, res) => {
  try {
    const { from, to } = req.query;

    const where = { userId: req.user.id };
    const dateFilter = buildDateFilter(from, to);
    if (dateFilter) {
      where.date = dateFilter;
    }

    const transactions = await prisma.transaction.findMany({
      where
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length,
      categoryBreakdown
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

// GET /api/transactions/export/csv - Export transactions to CSV file
router.get('/export/csv', async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { userId: req.user.id };
    const dateFilter = buildDateFilter(from, to);
    if (dateFilter) where.date = dateFilter;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { currency: true }
    });
    const currency = user?.currency || 'PLN';

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // CSV Header with UTF-8 BOM so Excel displays Polish characters correctly
    let csv = '\uFEFF';
    csv += 'ID;Data;Typ;Kategoria;Kwota;Waluta;Komentarz\n';

    transactions.forEach(t => {
      const d = new Date(t.date).toISOString().replace('T', ' ').substring(0, 19);
      const typ = t.type === 'expense' ? 'Wydatek' : 'Przychód';
      const safeComment = (t.comment || '').replace(/"/g, '""');
      csv += `${t.id};"${d}";"${typ}";"${t.category}";${t.amount.toFixed(2)};"${currency}";"${safeComment}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="LifeTrack_Transactions_${new Date().toISOString().substring(0,10)}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

// POST /api/transactions - Create new transaction
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, comment, date } = req.body;

    if (!type || amount === undefined || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type: type.toLowerCase(),
        amount: numAmount,
        category: category.trim(),
        comment: comment ? comment.trim() : null,
        date: date ? new Date(date) : new Date()
      }
    });

    res.status(201).json({
      message: 'Transaction recorded successfully!',
      data: transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// DELETE /api/transactions/:id - Delete a transaction
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

   await prisma.transaction.delete({
      where: { id }
    });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// PUT /api/transactions/:id - Update an existing transaction
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    const { type, amount, category, comment, date } = req.body;

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    const updateData = {};
    if (type) {
      const normalizedType = type.toLowerCase();
      if (!['income', 'expense'].includes(normalizedType)) {
        return res.status(400).json({ error: 'Type must be "income" or "expense"' });
      }
      updateData.type = normalizedType;
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      updateData.amount = numAmount;
    }

    if (category) {
      updateData.category = category.trim();
    }

    if (comment !== undefined) {
      updateData.comment = comment ? comment.trim() : null;
    }

    if (date) {
      const d = new Date(date);
      if (!isNaN(d)) {
        updateData.date = d;
      }
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Transaction updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

module.exports = router;
