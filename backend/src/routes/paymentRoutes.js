const express = require('express');
const { initiatePayment, handleCallback, checkoutAuction } = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/checkout/:auctionId', authMiddleware, checkoutAuction);
router.get('/callback', handleCallback);

module.exports = router;
