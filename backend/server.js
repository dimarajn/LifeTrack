require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Temporary data storage in RAM
let transactions = [];

// Default categories
const categories = {
    income: ['Salary', 'Freelance', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Rent', 'Entertainment', 'Health', 'Other']
};

// Route to check server status
app.get('/api/status', (req, res) => {
    res.json({ 
        message: "LifeTrack Server is running smoothly!",
        timestamp: new Date().toISOString()
    });
});

// Route to get all categories
app.get('/api/categories', (req, res) => {
    res.json(categories);
});

// Route to add a new transaction (Income/Expense)
app.post('/api/transactions', (req, res) => {
    const { type, amount, category, comment } = req.body;

    // Basic validation
    if (!type || !amount || !category) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const newTransaction = {
        id: Date.now(),
        type,      // "income" or "expense"
        amount: Number(amount),
        category,
        comment: comment || "",
        date: new Date().toLocaleString()
    };

    transactions.push(newTransaction);
    console.log(`New record added: ${type} - ${amount} [${category}]`);

    res.json({ 
        message: "Transaction recorded successfully!",
        data: newTransaction,
        count: transactions.length
    });
});

// Route to get all recorded transactions
app.get('/api/transactions', (req, res) => {
    res.json(transactions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});