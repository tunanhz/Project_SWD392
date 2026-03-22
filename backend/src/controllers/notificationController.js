const { Notification } = require('../models');

const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.count({
      where: { userId, isRead: false }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    notification.isRead = true;
    await notification.save();
    res.json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Internal helper - used by other controllers/cron
const createNotification = async (userId, type, title, message, metadata = null) => {
  try {
    const notification = await Notification.create({
      userId, type, title, message, metadata
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification };
