const express = require('express');
const { createComplaint, getComplaints, getMyComplaints, respondToComplaint } = require('../controllers/complaintController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['CUSTOMER']), createComplaint);
router.get('/', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), getComplaints);
router.get('/my', authMiddleware, getMyComplaints);
router.patch('/:id/respond', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), respondToComplaint);

module.exports = router;
