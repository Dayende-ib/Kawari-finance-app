require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authMiddleware = require('./src/middlewares/authMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const transactionController = require('./src/controllers/transactionController');
const mobileMoneyRoutes = require('./src/routes/mobileMoneyRoutes');
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

app.use('/api/auth', authRoutes);
app.use('/api/customers', authMiddleware, customerRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/mobile-money', authMiddleware, mobileMoneyRoutes);

// Statistiques globales
app.get('/api/stats', authMiddleware, transactionController.getStatistics);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
