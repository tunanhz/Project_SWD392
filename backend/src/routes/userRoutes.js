const express = require('express');
const { getAllUsers, updateUser, deleteUser, getProfile, updateMyProfile, uploadAvatar } = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { uploadCloudinary } = require('../middleware/uploadCloudinary');
const router = express.Router();

// Profile routes (for the authenticated user)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateMyProfile);
router.post('/profile/avatar', authMiddleware, uploadCloudinary.single('avatar'), uploadAvatar);

// Admin routes
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), getAllUsers);
router.patch('/:id', authMiddleware, roleMiddleware(['ADMIN']), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteUser);

module.exports = router;
