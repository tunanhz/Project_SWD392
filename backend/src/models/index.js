const User = require('./User');
const Property = require('./Property');
const Auction = require('./Auction');
const Bid = require('./Bid');
const Payment = require('./Payment');
const Deposit = require('./Deposit');
const ActivityLog = require('./ActivityLog');
const PropertyImage = require('./PropertyImage');
const VerificationToken = require('./VerificationToken');
const Report = require('./Report');

// 1. User - Property (Owner)
User.hasMany(Property, { foreignKey: 'ownerId', as: 'ownedProperties', onDelete: 'CASCADE' });
Property.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// 2. Property - Auction (1:1 per approved property)
Property.hasOne(Auction, { foreignKey: 'propertyId', as: 'auction', onDelete: 'CASCADE' });
Auction.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// 3. User - Bid (Bidder)
User.hasMany(Bid, { foreignKey: 'bidderId', as: 'userBids', onDelete: 'CASCADE' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

// 4. Auction - Bid
Auction.hasMany(Bid, { foreignKey: 'auctionId', as: 'bids', onDelete: 'CASCADE' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

// 5. User - Deposit
User.hasMany(Deposit, { foreignKey: 'userId', as: 'userDeposits', onDelete: 'CASCADE' });
Deposit.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 6. Auction - Deposit
Auction.hasMany(Deposit, { foreignKey: 'auctionId', as: 'auctionDeposits', onDelete: 'CASCADE' });
Deposit.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

// 7. Auction - Payment
Auction.hasOne(Payment, { foreignKey: 'auctionId', as: 'payment', onDelete: 'CASCADE' });
Payment.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

// 8. Property - PropertyImage
Property.hasMany(PropertyImage, { foreignKey: 'propertyId', as: 'images', onDelete: 'CASCADE' });
PropertyImage.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });

// 9. User - ActivityLog
User.hasMany(ActivityLog, { foreignKey: 'userId', as: 'logs', onDelete: 'CASCADE' });
ActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 10. User - VerificationToken
User.hasMany(VerificationToken, { foreignKey: 'userId', as: 'tokens', onDelete: 'CASCADE' });
VerificationToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 11. Auction - User (Winner)
User.hasMany(Auction, { foreignKey: 'winnerId', as: 'wonAuctions', onDelete: 'SET NULL' });
Auction.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

module.exports = {
  User,
  Property,
  Auction,
  Bid,
  Payment,
  Deposit,
  ActivityLog,
  PropertyImage,
  VerificationToken,
  Report
};
