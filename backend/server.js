require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/docs/swaggerSpec');

const authRoutes = require('./src/routes/auth');
const transactionRoutes = require('./src/routes/transactions');
const categoryRoutes = require('./src/routes/categories');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Interactive Swagger/OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "LifeTrack API Documentation",
  customCss: '.swagger-ui .topbar { background-color: #17181f; }'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: "LifeTrack Server is running smoothly!",
    database: "Connected (PostgreSQL / Neon)",
    docs: "/api/docs",
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend in production if built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 LifeTrack Server is running on port ${PORT}`);
    console.log(`📖 Swagger API Documentation: http://localhost:${PORT}/api/docs`);
  });
}

module.exports = app;
