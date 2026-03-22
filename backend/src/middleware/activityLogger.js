const { ActivityLog } = require('../models');

const activityLogger = async (req, res, next) => {
  // Log after response is sent
  res.on('finish', async () => {
    try {
      if (req.user && req.user.userId) {
        await ActivityLog.create({
          userId: req.user.userId,
          action: `${req.method} ${req.originalUrl} [${res.statusCode}]`
        });
      }
    } catch (error) {
      console.error('Activity logging error:', error.message);
    }
  });
  next();
};

module.exports = activityLogger;
