const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Best practice middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET /health: verifies database connection
app.get('/health', async (req, res, next) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'connected' });
  } catch (err) {
    next(err);
  }
});

// Routes
const customerRoutes = require('./routes/customerRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/customers', customerRoutes);
app.use('/categories', categoryRoutes);
app.use('/services', serviceRoutes);
app.use('/partners', partnerRoutes);
app.use('/bookings', bookingRoutes);
app.use('/ratings', ratingRoutes);
app.use('/admin', adminRoutes);
app.use('/', adminRoutes);
app.use('/api', require('./routes'));

// 404 Route Not Found handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start server and verify database connection pool
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  try {
    const connection = await db.getConnection();
    console.log(`Connected to MySQL database: ${process.env.DB_NAME || 'home_services_db'}`);
    connection.release();
  } catch (err) {
    console.warn('Database connection status:', err.message);
  }
});

module.exports = app;
