const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Property, Auction } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true }); // Warning: This resets the DB
    console.log('Database synced. Seeding started...');

    // 1. Create Users
    const password = await bcrypt.hash('password123', 10);
    
    const admin = await User.create({
      name: 'Administrator',
      username: 'admin_user',
      email: 'admin@auction.com',
      password,
      role: 'ADMIN',
      isVerified: true
    });

    const staff = await User.create({
      name: 'Staff Member',
      username: 'staff_user',
      email: 'staff@auction.com',
      password,
      role: 'STAFF',
      isVerified: true
    });

    const owner = await User.create({
      name: 'Property Owner',
      username: 'owner_user',
      email: 'owner@auction.com',
      password,
      role: 'OWNER',
      isVerified: true
    });

    const customer = await User.create({
      name: 'Bidder One',
      username: 'customer_user',
      email: 'customer@auction.com',
      password,
      role: 'CUSTOMER',
      isVerified: true
    });

    console.log('Users created.');

    // 2. Create Sample Properties
    const prop1 = await Property.create({
      title: 'Modern Sunset Villa',
      description: 'Luxury villa with ocean view.',
      address: 'District 2, HCMC',
      startingPrice: 2500000,
      status: 'APPROVED',
      ownerId: owner.id
    });

    const prop2 = await Property.create({
      title: 'Skyline Penthouse',
      description: 'Stunning city views from the top floor.',
      address: 'District 1, HCMC',
      startingPrice: 1800000,
      status: 'PENDING',
      ownerId: owner.id
    });

    console.log('Properties created.');

    // 3. Create an Auction for prop1
    const now = new Date();
    await Auction.create({
      propertyId: prop1.id,
      startTime: now,
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 48), // 48 hours later
      depositAmount: 50000,
      status: 'ACTIVE'
    });

    console.log('Sample auction created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
