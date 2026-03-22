const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auction = sequelize.define('Auction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED'),
    defaultValue: 'UPCOMING'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  pauseReason: {
    type: DataTypes.STRING,
    allowNull: true
  },
  pausedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Auction;
