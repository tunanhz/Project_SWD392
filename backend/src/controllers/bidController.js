const { Bid, Auction, Property, User, Payment } = require('../models');

const getBidsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.findAll({
      where: { auctionId },
      attributes: ['id', 'amount', 'bidTime', 'bidderId'], // BR-06: anonymize identity (frontend will hash bidderId)
      order: [['amount', 'DESC']]
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyBids = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bids = await Bid.findAll({
      where: { bidderId: userId },
      include: [
        {
          model: Auction,
          as: 'auction',
          include: [
            {
              model: Property,
              as: 'property',
              attributes: ['title', 'address', 'startingPrice']
            },
            {
              model: Payment,
              as: 'payment'
            }
          ]
        }
      ],
      order: [['bidTime', 'DESC']],
    });

    // Manual deduplication just in case joins cause multiple rows
    const uniqueBids = [];
    const seenIds = new Set();
    
    for (const bid of bids) {
      if (!seenIds.has(bid.id)) {
        uniqueBids.push(bid);
        seenIds.add(bid.id);
      }
    }

    res.json(uniqueBids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBidsByAuction, getMyBids };
