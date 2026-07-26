const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const canteenRoutes = require('./routes/canteenRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || true }));
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

const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
