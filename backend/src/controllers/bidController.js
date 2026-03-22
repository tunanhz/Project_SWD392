const { Bid, Auction, Property, User, Payment } = require('../models');

const getBidsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.findAll({
      where: { auctionId },
      attributes: ['id', 'amount', 'bidTime'], // BR-06: anonymize identity
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
      order: [['bidTime', 'DESC']]
    });
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBidsByAuction, getMyBids };
