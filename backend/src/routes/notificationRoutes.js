const express = require('express');
const { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, getUserNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.patch('/:id/read', authMiddleware, markAsRead);
router.patch('/read-all', authMiddleware, markAllAsRead);

module.exports = router;
