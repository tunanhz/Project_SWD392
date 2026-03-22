const express = require('express');
const { postProperty, getProperties, getMyProperties, approveProperty, getPropertyById, updateProperty } = require('../controllers/propertyController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/my', authMiddleware, roleMiddleware(['OWNER']), getMyProperties);
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, roleMiddleware(['OWNER']), postProperty);
router.put('/:id', authMiddleware, roleMiddleware(['OWNER']), updateProperty);
router.patch('/:id/approve', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), approveProperty);

module.exports = router;

