const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

dotenv.config({ path: '../.env' });

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Campus navigator API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/canteen-items', canteenRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
