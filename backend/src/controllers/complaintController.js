const { Complaint, Auction, User, Property } = require('../models');
const { Op } = require('sequelize');

const createComplaint = async (req, res) => {
  try {
    const { auctionId, subject, description } = req.body;
    const userId = req.user.userId;

    // Validate auction exists
    const auction = await Auction.findByPk(auctionId, {
      include: [{ model: Property, as: 'property' }]
    });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    // BR-19: Can only file complaint within 24 hours of auction end
    if (auction.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Can only file complaints for completed auctions' });
    }

    const auctionEndTime = new Date(auction.endTime);
    const now = new Date();
    const hoursSinceEnd = (now - auctionEndTime) / (1000 * 60 * 60);
    
    if (hoursSinceEnd > 24) {
      return res.status(400).json({ 
        message: 'Complaint deadline has passed. Complaints must be filed within 24 hours of auction end (BR-19).' 
      });
    }

    // Check if user already has an open complaint for this auction
    const existingComplaint = await Complaint.findOne({
      where: { userId, auctionId, status: { [Op.in]: ['OPEN', 'IN_PROGRESS'] } }
    });
    if (existingComplaint) {
      return res.status(400).json({ message: 'You already have an active complaint for this auction' });
    }

    const complaint = await Complaint.create({
      userId,
      auctionId,
      subject,
      description,
      deadline: new Date(auctionEndTime.getTime() + 24 * 60 * 60 * 1000) // 24h from auction end
    });

    res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
        { 
          model: Auction, as: 'auction',
          include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const complaints = await Complaint.findAll({
      where: { userId },
      include: [
        { 
          model: Auction, as: 'auction',
          include: [{ model: Property, as: 'property', attributes: ['title', 'address'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body; // status: IN_PROGRESS, RESOLVED, REJECTED

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (['RESOLVED', 'REJECTED'].includes(complaint.status)) {
      return res.status(400).json({ message: 'This complaint has already been resolved/rejected' });
    }

    complaint.response = response;
    complaint.status = status;
    complaint.respondedBy = req.user.userId;
    complaint.respondedAt = new Date();
    await complaint.save();

    // Create notification for the customer
    const { createNotification } = require('./notificationController');
    await createNotification(
      complaint.userId,
      'COMPLAINT_RESPONSE',
      `Khiếu nại #${complaint.id.substring(0, 8)} đã được phản hồi`,
      `Trạng thái: ${status}. Phản hồi: ${response}`,
      { complaintId: complaint.id }
    );

    res.json({ message: 'Complaint responded successfully', complaint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createComplaint, getComplaints, getMyComplaints, respondToComplaint };
