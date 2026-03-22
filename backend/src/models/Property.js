const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  area: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  beds: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  baths: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  propertyType: {
    type: DataTypes.STRING,
    defaultValue: 'House'
  },
  startingPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1 // Must be > 0 VND
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'WITHDRAWN'),
    defaultValue: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = Property;
