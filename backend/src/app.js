const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const depositRoutes = require('./routes/depositRoutes');
const userRoutes = require('./routes/userRoutes');
const activityLogger = require('./middleware/activityLogger');

app.use(cors());
app.use(express.json());
app.use(activityLogger);

app.get('/', (req, res) => {
  res.send('Online Real Estate Auction Backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
