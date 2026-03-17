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
        const auction = await Auction.findByPk(auctionId);
        if (!auction || auction.status !== 'ACTIVE') {
          return socket.emit('error', { message: 'Auction is not active' });
        }

        // BR-05: Check if auction is still open
        if (new Date() > new Date(auction.endTime)) {
          return socket.emit('error', { message: 'Auction has ended' });
        }

        // Create the bid
        const bid = await Bid.create({
          auctionId,
          bidderId: userId,
          amount
        });

        // BR-06: Anonymize identity when broadcasting (only send bid amount and time)
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
