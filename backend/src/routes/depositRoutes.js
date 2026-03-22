const express = require('express');
const { createDeposit, getMyDeposits } = require('../controllers/depositController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['CUSTOMER']), createDeposit);
router.get('/my', authMiddleware, getMyDeposits);

module.exports = router;
