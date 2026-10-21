const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Warm up Neon serverless database connection on startup
prisma.$connect().catch((err) => {
  console.warn('Initial DB warmup warning (Neon waking up):', err.message);
});

module.exports = prisma;
