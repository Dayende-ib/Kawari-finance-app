const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDb = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const financeRoutes = require('./routes/financeRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database
connectDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Kawari API ready' });
});

// 404 + Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Kawari API listening on port ${PORT}`);
});
