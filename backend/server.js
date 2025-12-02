require('dotenv').config();
const express = require('express');
const cors = require('cors');


const authMiddleware = require('./src/middlewares/authMiddleware');

const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const invoiceRoutes = require('./src/routes/invoiceRoutes');
const salesRoutes = require('./src/routes/salesRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const transactionController = require('./src/controllers/transactionController');
const mobileMoneyRoutes = require('./src/routes/mobileMoneyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/customers', authMiddleware,customerRoutes);
app.use('/api/transactions', authMiddleware, transactionRoutes);
app.use('/api/invoices', authMiddleware, invoiceRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/expenses', authMiddleware, expenseRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/stats', authMiddleware, transactionRoutes);
app.use('/api/mobile-money', authMiddleware, mobileMoneyRoutes);

// Statistiques globales
app.get('/api/stats', authMiddleware, transactionController.getStatistics);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
