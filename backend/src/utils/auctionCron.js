const cron = require('node-cron');
const { Auction } = require('../models');
const { Op } = require('sequelize');

// BR-05: Automatically close auctions when endTime is reached
const initCron = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Checking for auctions to close...');
    const now = new Date();
    try {
      const expiredAuctions = await Auction.findAll({
        where: {
          endTime: { [Op.lte]: now },
          status: 'ACTIVE'
        }
      });

      for (const auction of expiredAuctions) {
        auction.status = 'COMPLETED';
        await auction.save();
        console.log(`Auction ${auction.id} closed.`);
        // Here you would also trigger the "Notify Winner" logic
      }
    } catch (error) {
      console.error('Error in auction closing cron:', error);
    }
  });
};

module.exports = { initCron };
