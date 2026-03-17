const express = require('express');
const { initiatePayment, handleCallback } = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/initiate', authMiddleware, initiatePayment);
router.get('/callback', handleCallback);

module.exports = router;
