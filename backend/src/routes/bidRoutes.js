const express = require('express');
const { getBidsByAuction, getMyBids } = require('../controllers/bidController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/my', authMiddleware, getMyBids);
router.get('/auction/:auctionId', getBidsByAuction);

module.exports = router;
