const express = require('express');
const { postProperty, getProperties, approveProperty, getPropertyById } = require('../controllers/propertyController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, roleMiddleware(['OWNER']), postProperty);
router.patch('/:id/approve', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), approveProperty);

module.exports = router;
