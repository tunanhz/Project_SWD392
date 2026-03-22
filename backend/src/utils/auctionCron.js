const cron = require('node-cron');
const { Auction, Bid, Property, User } = require('../models');
const { Op } = require('sequelize');

// Run every minute
const initCron = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
      // 1. Activate UPCOMING auctions whose startTime has arrived
      const upcomingAuctions = await Auction.findAll({
        where: {
          startTime: { [Op.lte]: now },
          status: 'UPCOMING'
        }
      });
      for (const auction of upcomingAuctions) {
        auction.status = 'ACTIVE';
        await auction.save();
        console.log(`Auction ${auction.id} activated.`);
      }

      // 2. Close ACTIVE auctions whose endTime has passed
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

        // Determine winner: highest bid
        const winningBid = await Bid.findOne({
          where: { auctionId: auction.id },
          order: [['amount', 'DESC']],
          include: [{ model: User, as: 'bidder', attributes: ['id', 'username', 'email'] }]
        });

        if (winningBid) {
          console.log(`Winner of auction ${auction.id}: ${winningBid.bidder.username} with bid $${winningBid.amount}`);
          
          // Update property status to SOLD
          const property = await Property.findByPk(auction.propertyId);
          if (property) {
            property.status = 'SOLD';
            await property.save();
          }
        } else {
          console.log(`Auction ${auction.id} closed with no bids.`);
        }
      }
    } catch (error) {
      console.error('Error in auction cron:', error);
    }
  });
};

module.exports = { initCron };

