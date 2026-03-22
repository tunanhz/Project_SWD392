const { Auction, Property, Bid, Deposit, User, Payment } = require('../models');
const { createPaymentUrl } = require('../utils/vnpay');

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

    // Create a PENDING payment record
    const payment = await Payment.create({
      amount: auction.depositAmount,
      userId,
      type: 'AUCTION_DEPOSIT',
      auctionId: id,
      status: 'PENDING',
      paymentMethod: 'VNPAY'
    });

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: auction.depositAmount * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payment.id,
      vnp_OrderInfo: `Deposit for auction ${id}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/payment/callback`,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14)
    };

    const paymentUrl = createPaymentUrl(vnpParams, process.env.VNPAY_HASH_SECRET);

    res.status(201).json({ message: 'Payment initiated', paymentUrl, paymentId: payment.id });
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

// BR-13: Emergency pause auction
const pauseAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const auction = await Auction.findByPk(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'ACTIVE') {
      return res.status(400).json({ message: 'Only active auctions can be paused' });
    }

    auction.status = 'PAUSED';
    auction.pauseReason = reason || 'Technical issue affecting fairness';
    auction.pausedAt = new Date();
    await auction.save();

    // Notify via socket if available
    try {
      const { getIo } = require('../socket');
      const io = getIo();
      if (io) {
        io.to(id).emit('auctionPaused', {
          message: `Phiên đấu giá đã bị tạm dừng: ${auction.pauseReason}`,
          pausedAt: auction.pausedAt
        });
      }
    } catch (e) { /* socket not available */ }

    res.json({ message: 'Auction paused successfully', auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resume a paused auction
const resumeAuction = async (req, res) => {
  try {
    const { id } = req.params;

    const auction = await Auction.findByPk(id);
    if (!auction) return res.status(404).json({ message: 'Auction not found' });
    if (auction.status !== 'PAUSED') {
      return res.status(400).json({ message: 'Only paused auctions can be resumed' });
    }

    auction.status = 'ACTIVE';
    auction.pauseReason = null;
    auction.pausedAt = null;
    await auction.save();

    // Notify via socket
    try {
      const { getIo } = require('../socket');
      const io = getIo();
      if (io) {
        io.to(id).emit('auctionResumed', {
          message: 'Phiên đấu giá đã được tiếp tục!',
          resumedAt: new Date()
        });
      }
    } catch (e) { /* socket not available */ }

    res.json({ message: 'Auction resumed successfully', auction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAuction, getAuctions, getAuctionById, registerForAuction, checkRegistration, pauseAuction, resumeAuction };
