const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VerificationToken = sequelize.define('VerificationToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = VerificationToken;
