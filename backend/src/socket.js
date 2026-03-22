const socketIo = require('socket.io');
const { Bid, Auction, User } = require('./models');

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

        // Check if auction is still open
        if (new Date() > new Date(auction.endTime)) {
          return socket.emit('error', { message: 'Auction has ended' });
        }

        // Verify deposit
        const { Deposit } = require('./models');
        const deposit = await Deposit.findOne({
          where: { auctionId, userId, status: 'SUCCESS' }
        });
        if (!deposit) {
          return socket.emit('error', { message: 'You must pay the deposit before bidding' });
        }

        // Validate bid amount > starting price
        const startingPrice = parseFloat(auction.property?.startingPrice || 0);
        if (amount <= startingPrice) {
          return socket.emit('error', { message: `Bid must be higher than starting price ($${startingPrice.toLocaleString()})` });
        }

        // Validate bid amount > current highest bid
        const highestBid = await Bid.findOne({
          where: { auctionId },
          order: [['amount', 'DESC']]
        });
        if (highestBid && amount <= parseFloat(highestBid.amount)) {
          return socket.emit('error', { message: `Bid must be higher than current highest ($${parseFloat(highestBid.amount).toLocaleString()})` });
        }

        // Create the bid
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
