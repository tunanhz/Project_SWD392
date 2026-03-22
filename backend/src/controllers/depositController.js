const { Deposit, Auction, Property } = require('../models');

const createDeposit = async (req, res) => {
  try {
    const { auctionId } = req.body;
    const userId = req.user.userId;

    const auction = await Auction.findByPk(auctionId);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // Check if already deposited
    const existing = await Deposit.findOne({
      where: { auctionId, userId, status: 'SUCCESS' }
    });
    if (existing) return res.status(400).json({ message: 'Deposit already paid' });

    const deposit = await Deposit.create({
      auctionId,
      userId,
      amount: auction.depositAmount,
      status: 'SUCCESS',
      paymentDate: new Date()
    });

    res.status(201).json(deposit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyDeposits = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deposits = await Deposit.findAll({
      where: { userId },
      include: [
        {
          model: Auction,
          as: 'auction',
          include: [
            { model: Property, as: 'property', attributes: ['title', 'address'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createDeposit, getMyDeposits };
