const express = require('express');
const { createAuction, getAuctions, getAuctionById, registerForAuction, checkRegistration } = require('../controllers/auctionController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', getAuctions);
router.get('/:id', getAuctionById);
router.post('/', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), createAuction);
router.post('/:id/register', authMiddleware, roleMiddleware(['CUSTOMER']), registerForAuction);
router.get('/:id/check-registration', authMiddleware, checkRegistration);

module.exports = router;
