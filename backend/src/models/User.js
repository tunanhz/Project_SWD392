const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('ADMIN', 'STAFF', 'OWNER', 'CUSTOMER'),
    defaultValue: 'CUSTOMER'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    // BR-09: Encrypt bank_account before saving
    beforeCreate: (user) => {
      if (user.bank_account) {
        user.bank_account = encrypt(user.bank_account);
      }
    },
    beforeUpdate: (user) => {
      if (user.changed('bank_account') && user.bank_account) {
        user.bank_account = encrypt(user.bank_account);
      }
    }
  }
});

// Instance method to get decrypted bank account
User.prototype.getDecryptedBankAccount = function () {
  return this.bank_account ? decrypt(this.bank_account) : null;
};

module.exports = User;
