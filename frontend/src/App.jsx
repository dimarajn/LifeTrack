import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [serverMessage, setServerMessage] = useState('Connecting...');
  const [transactions, setTransactions] = useState([]);
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');

  useEffect(() => {
    // Fetch server status
    fetch('http://localhost:5001/api/status')
      .then(res => res.json())
      .then(data => setServerMessage(data.message))
      .catch(() => setServerMessage('Backend is offline 🔴'));

    // Load initial transactions
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    fetch('http://localhost:5001/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(err => console.error('Fetch error:', err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRecord = { type, amount: Number(amount), category };

    // Send new transaction to backend
    fetch('http://localhost:5001/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord)
    })
    .then(res => res.json())
    .then(() => {
      setAmount('');
      fetchTransactions();
    });
  };

  // --- CHART LOGIC ---
  // Filter only expenses for the pie chart
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Get unique categories
  const uniqueCategories = [...new Set(expenses.map(t => t.category))];
  
  // Calculate total amount per category
  const dataPoints = uniqueCategories.map(cat => {
    return expenses
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  // Prepare data object for Chart.js
  const chartData = {
    labels: uniqueCategories,
    datasets: [
      {
        data: dataPoints,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>LifeTrack Dashboard</h1>
      <p style={{ color: '#4CAF50' }}>{serverMessage}</p>

      {/* Input Form Section */}
      <div style={{ padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '8px', color: 'white', marginBottom: '20px' }}>
        <h3>Add New Transaction</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '8px' }}>
            <option value="expense">Expense (-)</option>
            <option value="income">Income (+)</option>
          </select>
          <input 
            type="number" placeholder="Amount (PLN)" value={amount} 
            onChange={(e) => setAmount(e.target.value)} style={{ padding: '8px', width: '120px' }} required
          />
          <input 
            type="text" placeholder="Category (e.g. Rent)" value={category} 
            onChange={(e) => setCategory(e.target.value)} style={{ padding: '8px' }} required
          />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>
            Add
          </button>
        </form>
      </div>

      {/* Chart and Transaction List Section */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Pie Chart Container */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ color: 'black', textAlign: 'center', marginTop: 0 }}>Expenses Breakdown</h3>
          {expenses.length > 0 ? (
            <Pie data={chartData} />
          ) : (
            <p style={{ color: 'black', textAlign: 'center' }}>Add some expenses to see the chart</p>
          )}
        </div>

        {/* Transaction History Container */}
        <div style={{ flex: 1, padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', color: 'black' }}>
          <h3 style={{ marginTop: 0 }}>Recent Transactions</h3>
          {transactions.length === 0 ? <p>No records yet.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {transactions.map((t, index) => (
                <li key={index} style={{ padding: '10px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{t.category}</strong></span>
                  <span style={{ color: t.type === 'expense' ? 'red' : 'green', fontWeight: 'bold' }}>
                    {t.type === 'expense' ? '-' : '+'}{t.amount} PLN
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;