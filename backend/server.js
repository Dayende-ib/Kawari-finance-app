require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authMiddleware = require('./src/simpleRoutes/authMiddlewareSimple');
const authRoutes = require('./src/simpleRoutes/authRoutes');
const customerRoutes = require('./src/simpleRoutes/customersRoutes');
const transactionRoutes = require('./src/simpleRoutes/transactionsRoutes');
const invoiceRoutes = require('./src/simpleRoutes/invoicesRoutes');
const statsRoutes = require('./src/simpleRoutes/statsRoutes');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);

// Global error handler
app.use(errorHandler);

if (require.main === module) {
  const { connect } = require('./src/mongo');
  connect().catch((err) => {
    console.warn('Mongo connect failed:', err.message);
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
