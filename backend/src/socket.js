const socketIo = require('socket.io');
const { Bid, Auction, User } = require('./models');

const MIN_BID_INCREMENT = 1000000; // FR7: Minimum increment ≥ 1,000,000 VND

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
      console.log(`Client ${socket.id} joined auction ${auctionId}`);
    });

    socket.on('placeBid', async (data) => {
      const { auctionId, userId, amount } = data;
      try {
        const auction = await Auction.findByPk(auctionId, {
          include: [{ model: require('./models').Property, as: 'property' }]
        });
        if (!auction || auction.status !== 'ACTIVE') {
          return socket.emit('error', { message: 'Auction is not active' });
        }

        // BR-13: Check if auction is paused
        if (auction.status === 'PAUSED') {
          return socket.emit('error', { message: 'Auction is currently paused due to technical issues' });
        }

        // BR-05: Check if auction is still open
        if (new Date() > new Date(auction.endTime)) {
          return socket.emit('error', { message: 'Auction has ended. No bids accepted after closing time (BR-05).' });
        }

        // Verify deposit (BR-18)
        const { Deposit } = require('./models');
        const deposit = await Deposit.findOne({
          where: { auctionId, userId, status: 'SUCCESS' }
        });
        if (!deposit) {
          return socket.emit('error', { message: 'You must pay the deposit before bidding (BR-18)' });
        }

        // Validate bid amount > starting price
        const startingPrice = parseFloat(auction.property?.startingPrice || 0);
        if (amount <= startingPrice) {
          return socket.emit('error', { message: `Bid must be higher than starting price (${startingPrice.toLocaleString('vi-VN')} VND)` });
        }

        // Validate bid amount > current highest bid
        const highestBid = await Bid.findOne({
          where: { auctionId },
          order: [['amount', 'DESC']]
        });

        if (highestBid) {
          const highestAmount = parseFloat(highestBid.amount);
          
          if (amount <= highestAmount) {
            return socket.emit('error', { message: `Bid must be higher than current highest (${highestAmount.toLocaleString('vi-VN')} VND)` });
          }

          // FR7: Minimum increment validation ≥ 1,000,000 VND
          if (amount - highestAmount < MIN_BID_INCREMENT) {
            return socket.emit('error', { 
              message: `Mức tăng tối thiểu là ${MIN_BID_INCREMENT.toLocaleString('vi-VN')} VND. Giá thầu tối thiểu: ${(highestAmount + MIN_BID_INCREMENT).toLocaleString('vi-VN')} VND (FR7)` 
            });
          }
        } else {
          // First bid: must be at least startingPrice + MIN_BID_INCREMENT
          if (amount < startingPrice + MIN_BID_INCREMENT) {
            return socket.emit('error', {
              message: `Giá thầu đầu tiên phải ít nhất ${(startingPrice + MIN_BID_INCREMENT).toLocaleString('vi-VN')} VND`
            });
          }
        }

        // Create the bid (BR-17: cannot edit after submission)
        const bid = await Bid.create({
          auctionId,
          bidderId: userId,
          amount
        });

        // BR-06: Anonymize identity when broadcasting
        io.to(auctionId).emit('newBid', {
          amount: bid.amount,
          bidTime: bid.bidTime,
          message: 'A new bid has been placed!'
        });

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

const getIo = () => io;

module.exports = { initSocket, getIo };
