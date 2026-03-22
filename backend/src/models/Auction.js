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
    type: DataTypes.ENUM('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'UPCOMING'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Auction;
