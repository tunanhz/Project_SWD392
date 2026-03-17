const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Online Real Estate Auction Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);

module.exports = app;
