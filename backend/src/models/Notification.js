const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('AUCTION_WON', 'AUCTION_ENDED', 'BID_OUTBID', 'DEPOSIT_REFUND', 'PAYMENT_RECEIVED', 'PROPERTY_APPROVED', 'PROPERTY_REJECTED', 'COMPLAINT_RESPONSE', 'SYSTEM'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Notification;
