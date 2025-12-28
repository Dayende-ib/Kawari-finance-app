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
const platformRoutes = require('./src/simpleRoutes/platformRoutes');
const suggestionsRoutes = require('./src/simpleRoutes/suggestionsRoutes');
const chatbotRoutes = require('./src/simpleRoutes/chatbotRoutes');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorHandler');
const { adminOrSeller } = require('./src/middlewares/roleMiddleware');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.length === 0) return callback(null, true);
  if (allowedOrigins.includes('*')) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('CORS not allowed'));
};
app.use(
  cors({
    origin: isAllowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/customers', authMiddleware, adminOrSeller, customerRoutes);
app.use('/api/transactions', authMiddleware, adminOrSeller, transactionRoutes);
app.use('/api/invoices', authMiddleware, adminOrSeller, invoiceRoutes);
app.use('/api/stats', authMiddleware, adminOrSeller, statsRoutes);
app.use('/api/suggestions', authMiddleware, adminOrSeller, suggestionsRoutes);
app.use('/api/chatbot', authMiddleware, adminOrSeller, chatbotRoutes);
app.use('/api/platform', platformRoutes);

// Global error handler
app.use(errorHandler);

if (require.main === module) {
  const { connect } = require('./src/mongo');
  const User = require('./src/models/User');
  const { hashPassword } = require('./src/utils/hash');

  const ensureSuperAdmin = async () => {
    const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    if (!email || !password) return;

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      if (existing.role !== 'super_admin') {
        await User.updateOne({ _id: existing._id }, { $set: { role: 'super_admin', companyId: null, name } });
      }
      return;
    }

    const passwordHash = await hashPassword(password);
    await User.create({ name, email, passwordHash, role: 'super_admin', companyId: null });
  };

  connect()
    .then(ensureSuperAdmin)
    .catch((err) => {
      console.warn('Mongo connect failed:', err.message);
    });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
