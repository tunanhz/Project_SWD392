const express = require('express');
const { initiatePayment, handleCallback, checkoutAuction, getTransactions, refundDeposit, getReceipt } = require('../controllers/paymentController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.post('/checkout/:auctionId', authMiddleware, checkoutAuction);
router.get('/callback', handleCallback);
router.get('/transactions', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), getTransactions);
router.post('/refund/:depositId', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), refundDeposit);
router.get('/receipt/:paymentId', authMiddleware, getReceipt);

module.exports = router;
