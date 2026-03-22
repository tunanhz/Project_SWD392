const { Deposit, User, Auction, Bid, Payment } = require('../models');

const initiatePayment = async (req, res) => {
  try {
    const { amount, auctionId } = req.body;
    // Mocking VNPay/MoMo redirection
    const mockPaymentUrl = `https://mock-payment-gateway.com/pay?amount=${amount}&ref=${auctionId}`;
    res.json({ paymentUrl: mockPaymentUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const handleCallback = async (req, res) => {
  // Mock callback from payment gateway
  try {
    const { ref, status, amount, userId } = req.query; // status: 'SUCCESS'
    if (status === 'SUCCESS') {
        // Log individual deposit or update user balance
        console.log(`Payment of ${amount} successful for user ${userId}`);
    }
    res.send('Payment Processed Successfully');
  } catch (error) {
    res.status(500).send('Callback Error');
  }
};

const checkoutAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findByPk(auctionId, {
      include: [{ model: Bid, as: 'bids' }]
    });

    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    if (auction.status !== 'COMPLETED') return res.status(400).json({ error: 'Auction is not completed yet' });
    if (auction.winnerId !== req.user.id) return res.status(403).json({ error: 'You are not the winner of this auction' });

    // Check if already paid (by checking if a payment exists)
    const existingPayment = await Payment.findOne({ where: { auctionId, type: 'AUCTION_CHECKOUT' } });
    if (existingPayment) {
      return res.status(400).json({ error: 'Auction balance is already paid' });
    }

    // Calculate remaining balance
    const winningBid = auction.bids.reduce((max, bid) => Math.max(max, Number(bid.amount)), 0);
    const balance = winningBid - Number(auction.depositAmount);

    // Mock payment success
    const payment = await Payment.create({
      amount: balance,
      type: 'AUCTION_CHECKOUT',
      auctionId: auction.id
    });

    res.json({ message: 'Payment successful, property ownership transferred!', payment, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { initiatePayment, handleCallback, checkoutAuction };
