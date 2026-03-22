const cron = require('node-cron');
const { Auction, Bid, Property, User, Deposit } = require('../models');
const { Op } = require('sequelize');
const { sendWinnerNotification } = require('./emailService');
const { createNotification } = require('../controllers/notificationController');

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

      // 2. Close ACTIVE auctions whose endTime has passed (BR-16)
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

        // Get property details for notifications
        const property = await Property.findByPk(auction.propertyId);

        // Determine winner: highest valid bid (BR-19)
        const winningBid = await Bid.findOne({
          where: { auctionId: auction.id },
          order: [['amount', 'DESC']],
          include: [{ model: User, as: 'bidder', attributes: ['id', 'username', 'email', 'name'] }]
        });

        if (winningBid) {
          console.log(`Winner of auction ${auction.id}: ${winningBid.bidder.username} with bid ${Number(winningBid.amount).toLocaleString('vi-VN')} VND`);
          
          auction.winnerId = winningBid.bidder.id;
          await auction.save();

          // Update property status to SOLD
          if (property) {
            property.status = 'SOLD';
            await property.save();
          }

          // Send winner notification email
          const remainingAmount = Number(winningBid.amount) - Number(auction.depositAmount);
          await sendWinnerNotification(winningBid.bidder.email, {
            propertyTitle: property?.title || 'N/A',
            propertyAddress: property?.address || 'N/A',
            winningAmount: winningBid.amount,
            depositAmount: auction.depositAmount,
            remainingAmount: remainingAmount
          });

          // Create in-app notification for winner
          await createNotification(
            winningBid.bidder.id,
            'AUCTION_WON',
            `🎉 Bạn đã thắng đấu giá "${property?.title}"!`,
            `Giá thắng: ${Number(winningBid.amount).toLocaleString('vi-VN')} VND. Vui lòng hoàn tất thanh toán số tiền còn lại: ${remainingAmount.toLocaleString('vi-VN')} VND.`,
            { auctionId: auction.id, propertyId: auction.propertyId, winningAmount: winningBid.amount }
          );

          // Notify all other participants that the auction has ended
          const allDeposits = await Deposit.findAll({
            where: { auctionId: auction.id, status: 'SUCCESS', userId: { [Op.ne]: winningBid.bidder.id } }
          });
          for (const deposit of allDeposits) {
            await createNotification(
              deposit.userId,
              'AUCTION_ENDED',
              `Phiên đấu giá "${property?.title}" đã kết thúc`,
              `Người khác đã thắng đấu giá này. Tiền đặt cọc của bạn sẽ được hoàn trả.`,
              { auctionId: auction.id }
            );
          }

          // Notify via socket
          try {
            const { getIo } = require('../socket');
            const io = getIo();
            if (io) {
              io.to(auction.id).emit('auctionEnded', {
                winnerId: winningBid.bidder.id,
                winningAmount: winningBid.amount,
                message: 'Auction has ended!'
              });
            }
          } catch (e) { /* socket not available */ }

        } else {
          console.log(`Auction ${auction.id} closed with no bids.`);
        }
      }
    } catch (error) {
      console.error('Error in auction cron:', error);
    }
  }, {
    timezone: 'Asia/Ho_Chi_Minh' // BR-07: GMT+7
  });
};

module.exports = { initCron };
