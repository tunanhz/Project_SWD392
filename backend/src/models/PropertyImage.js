const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PropertyImage = sequelize.define('PropertyImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = PropertyImage;
