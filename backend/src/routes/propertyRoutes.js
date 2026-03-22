const express = require('express');
const { postProperty, getProperties, getMyProperties, approveProperty, getPropertyById, updateProperty, withdrawProperty, uploadLegalDocument } = require('../controllers/propertyController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.get('/my', authMiddleware, roleMiddleware(['OWNER']), getMyProperties);
router.get('/', getProperties);
router.get('/:id', getPropertyById);
router.post('/', authMiddleware, roleMiddleware(['OWNER']), postProperty);
router.put('/:id', authMiddleware, roleMiddleware(['OWNER']), updateProperty);
router.patch('/:id/approve', authMiddleware, roleMiddleware(['STAFF', 'ADMIN']), approveProperty);
router.patch('/:id/withdraw', authMiddleware, roleMiddleware(['OWNER']), withdrawProperty);
router.post('/:id/documents', authMiddleware, roleMiddleware(['OWNER']), upload.single('document'), uploadLegalDocument);

module.exports = router;
