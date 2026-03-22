const { Deposit, User, Auction, Bid, Payment, Property } = require('../models');
const { sendReceiptEmail } = require('../utils/emailService');
const { createNotification } = require('./notificationController');
const { createPaymentUrl, verifyReturnUrl } = require('../utils/vnpay');
const crypto = require('crypto');
const path = require('path');

const initiatePayment = async (req, res) => {
  try {
    const { amount, auctionId } = req.body;
    const vnpHashSecret = process.env.VNPAY_HASH_SECRET;
    
    // Create a PENDING payment record
    const payment = await Payment.create({
      amount,
      userId: req.user.userId,
      type: 'AUCTION_DEPOSIT',
      auctionId,
      status: 'PENDING',
      paymentMethod: 'VNPAY'
    });

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: amount * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payment.id,
      vnp_OrderInfo: `Deposit for auction ${auctionId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/payment/callback`,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14)
    };

    const paymentUrl = createPaymentUrl(vnpParams, vnpHashSecret);
    res.json({ paymentUrl, paymentId: payment.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleCallback = async (req, res) => {
  try {
    const vnpParams = req.query;
    const isValid = verifyReturnUrl({ ...vnpParams }, process.env.VNPAY_HASH_SECRET);

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const paymentId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: User, as: 'user' },
        { model: Auction, as: 'auction', include: [{ model: Property, as: 'property' }] }
      ]
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (responseCode === '00') {
      await payment.update({ 
        status: 'SUCCESS', 
        transactionId: vnpParams['vnp_TransactionNo'] 
      });

      if (payment.type === 'AUCTION_DEPOSIT') {
        await Deposit.findOrCreate({
          where: { userId: payment.userId, auctionId: payment.auctionId },
          defaults: {
            amount: payment.amount,
            status: 'SUCCESS'
          }
        });

        await createNotification(
          payment.userId,
          'PAYMENT_RECEIVED',
          'Deposit Paid Successfully',
          `You have successfully paid the deposit for "${payment.auction?.property?.title}". You can now place bids.`,
          { auctionId: payment.auctionId }
        );
      } else if (payment.type === 'AUCTION_CHECKOUT') {
        // Send receipt email
        if (payment.user) {
          await sendReceiptEmail(payment.user.email, {
            paymentId: payment.id,
            amount: payment.amount,
            type: 'Final Auction Payment',
            date: payment.createdAt
          });

          await createNotification(
            payment.userId,
            'PAYMENT_RECEIVED',
            'Full Payment Received',
            `Final payment for "${payment.auction?.property?.title}" confirmed. Property transfer is in progress.`,
            { paymentId: payment.id, auctionId: payment.auctionId }
          );
        }
      }

      res.json({ success: true, message: 'Payment successful' });
    } else {
      await payment.update({ status: 'FAILED' });
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkoutAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findByPk(auctionId, {
      include: [
        { model: Bid, as: 'bids' },
        { model: Property, as: 'property' }
      ]
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'COMPLETED') return res.status(400).json({ error: 'Auction is not completed yet' });
    if (auction.winnerId !== req.user.userId) return res.status(403).json({ error: 'You are not the winner of this auction' });

    const winningBid = auction.bids.reduce((max, bid) => Math.max(max, Number(bid.amount)), 0);
    const balance = winningBid - Number(auction.depositAmount);

    const payment = await Payment.create({
      amount: balance,
      userId: req.user.userId,
      type: 'AUCTION_CHECKOUT',
      auctionId: auction.id,
      status: 'PENDING',
      paymentMethod: 'VNPAY'
    });

    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE,
      vnp_Amount: balance * 100,
      vnp_CurrCode: 'VND',
      vnp_TxnRef: payment.id,
      vnp_OrderInfo: `Final payment for auction ${auctionId}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/en/payment/callback`,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_CreateDate: new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14)
    };

    const paymentUrl = createPaymentUrl(vnpParams, process.env.VNPAY_HASH_SECRET);
    res.json({ paymentUrl, paymentId: payment.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Staff: View all transactions
const getTransactions = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { 
          model: Auction, 
          as: 'auction',
          include: [
            { model: Property, as: 'property', attributes: ['title', 'address'] },
            { model: User, as: 'winner', attributes: ['id', 'username', 'email'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const deposits = await Deposit.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { 
          model: Auction, 
          as: 'auction',
          include: [{ model: Property, as: 'property', attributes: ['title'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ payments, deposits });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Refund deposit for non-winners
const refundDeposit = async (req, res) => {
  try {
    const { depositId } = req.params;
    const deposit = await Deposit.findByPk(depositId, {
      include: [
        { model: Auction, as: 'auction' },
        { model: User, as: 'user' }
      ]
    });

    if (!deposit) return res.status(404).json({ message: 'Deposit not found' });
    if (deposit.status === 'REFUNDED') {
      return res.status(400).json({ message: 'Deposit already refunded' });
    }

    // Only refund if auction is completed and user is not the winner
    const auction = deposit.auction;
    if (!auction || auction.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Auction must be completed before refunding deposits' });
    }
    if (auction.winnerId === deposit.userId) {
      return res.status(400).json({ message: 'Cannot refund deposit for the auction winner' });
    }

    deposit.status = 'REFUNDED';
    await deposit.save();

    // Notify user about refund
    await createNotification(
      deposit.userId,
      'DEPOSIT_REFUND',
      'Hoàn tiền đặt cọc',
      `Số tiền đặt cọc ${Number(deposit.amount).toLocaleString('vi-VN')} VND đã được hoàn lại.`,
      { depositId: deposit.id, auctionId: auction.id }
    );

    res.json({ message: 'Deposit refunded successfully', deposit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate receipt for a payment (returns JSON receipt data)
const getReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { 
          model: Auction, 
          as: 'auction',
          include: [
            { model: Property, as: 'property' },
            { model: User, as: 'winner', attributes: ['id', 'username', 'email', 'name'] }
          ]
        }
      ]
    });

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const receipt = {
      receiptId: `RCP-${payment.id.substring(0, 8).toUpperCase()}`,
      transactionId: payment.transactionId,
      paymentDate: payment.date,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      property: payment.auction?.property ? {
        title: payment.auction.property.title,
        address: payment.auction.property.address
      } : null,
      buyer: payment.auction?.winner ? {
        name: payment.auction.winner.name,
        username: payment.auction.winner.username,
        email: payment.auction.winner.email
      } : null,
      generatedAt: new Date().toISOString(),
      platform: 'Hệ thống Đấu giá Bất động sản Online'
    };

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { initiatePayment, handleCallback, checkoutAuction, getTransactions, refundDeposit, getReceipt };
