const { Auction, Property, Bid, Deposit, User } = require('../models');

const createAuction = async (req, res) => {
  try {
    const { propertyId, startTime, endTime, depositAmount } = req.body;
    
    const property = await Property.findByPk(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Property must be APPROVED before creating an auction' });
    }

    // Check if auction already exists for this property
    const existing = await Auction.findOne({ where: { propertyId } });
    if (existing) return res.status(400).json({ message: 'An auction already exists for this property' });

    const auction = await Auction.create({
      propertyId,
      startTime,
      endTime,
      depositAmount,
      status: new Date(startTime) <= new Date() ? 'ACTIVE' : 'UPCOMING'
    });

    res.status(201).json(auction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        { 
          model: Property, 
          as: 'property',
          include: [
            { model: User, as: 'owner', attributes: ['username'] }
          ]
        },
        { model: Bid, as: 'bids', attributes: ['amount', 'bidTime'] },
        { model: Deposit, as: 'auctionDeposits' }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findByPk(id, {
      include: [
        { 
          model: Property, 
          as: 'property',
          include: [
            { model: User, as: 'owner', attributes: ['username'] },
            { model: require('../models').PropertyImage, as: 'images' }
          ]
        },
        { 
          model: Bid, 
          as: 'bids',
          attributes: ['id', 'amount', 'bidTime'],
          order: [['amount', 'DESC']]
        },
        { model: Deposit, as: 'auctionDeposits' }
      ]
    });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerForAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const auction = await Auction.findByPk(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status === 'COMPLETED' || auction.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Auction is no longer accepting registrations' });
    }

    // Check if already deposited
    const existingDeposit = await Deposit.findOne({
      where: { auctionId: id, userId, status: 'SUCCESS' }
    });
    if (existingDeposit) {
      return res.status(400).json({ message: 'Already registered for this auction' });
    }

    // Create deposit record
    const deposit = await Deposit.create({
      auctionId: id,
      userId,
      amount: auction.depositAmount,
      status: 'SUCCESS', // In real app, this would be PENDING until payment gateway confirms
      paymentDate: new Date()
    });

    res.status(201).json({ message: 'Registered successfully', deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deposit = await Deposit.findOne({
      where: { auctionId: id, userId, status: 'SUCCESS' }
    });

    res.json({ registered: !!deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAuction, getAuctions, getAuctionById, registerForAuction, checkRegistration };
