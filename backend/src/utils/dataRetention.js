const cron = require('node-cron');
const { Auction, Bid, Payment, Deposit, ActivityLog } = require('../models');
const { Op } = require('sequelize');

// BR-20: Archive data older than 5 years
// Runs monthly on the 1st at 2:00 AM (GMT+7)
const initDataRetention = () => {
  cron.schedule('0 2 1 * *', async () => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    try {
      console.log(`[Data Retention] Starting archive process for data before ${fiveYearsAgo.toISOString()}`);

      // Archive old activity logs (soft-delete by flagging)
      const archivedLogs = await ActivityLog.update(
        { action: '[ARCHIVED] ' + ActivityLog.sequelize.col('action') },
        {
          where: {
            timestamp: { [Op.lt]: fiveYearsAgo },
            action: { [Op.notLike]: '[ARCHIVED]%' }
          }
        }
      );

      console.log(`[Data Retention] Archived ${archivedLogs[0]} activity logs`);
      console.log('[Data Retention] Note: Auction, Bid, Payment, Deposit data is NEVER deleted (BR-20 compliance)');
      console.log('[Data Retention] Archive process completed successfully');
    } catch (error) {
      console.error('[Data Retention] Error:', error.message);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh'
  });

  console.log('[Data Retention] Monthly archive cron job initialized (BR-20: 5-year retention)');
};

module.exports = { initDataRetention };
