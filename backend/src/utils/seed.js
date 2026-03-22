const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { User, Property, Auction, Bid, Deposit, PropertyImage } = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true }); // Warning: This resets the DB
    console.log('Database synced. Seeding started...');

    const password = await bcrypt.hash('password123', 10);

    // ──────────── 1. USERS ────────────
    const admin = await User.create({
      name: 'Nguyen Van Admin',
      username: 'admin_user',
      email: 'admin@auction.com',
      phone: '0901000001',
      password,
      role: 'ADMIN',
      isVerified: true
    });

    const staff = await User.create({
      name: 'Tran Thi Staff',
      username: 'staff_user',
      email: 'staff@auction.com',
      phone: '0901000002',
      password,
      role: 'STAFF',
      isVerified: true
    });

    const owner1 = await User.create({
      name: 'Le Van Owner',
      username: 'owner_user',
      email: 'owner@auction.com',
      phone: '0901000003',
      password,
      role: 'OWNER',
      isVerified: true
    });

    const owner2 = await User.create({
      name: 'Pham Thi Lan',
      username: 'owner_lan',
      email: 'lan@auction.com',
      phone: '0901000004',
      password,
      role: 'OWNER',
      isVerified: true
    });

    const customer1 = await User.create({
      name: 'Vo Minh Bidder',
      username: 'customer_user',
      email: 'customer@auction.com',
      phone: '0901000005',
      password,
      role: 'CUSTOMER',
      isVerified: true
    });

    const customer2 = await User.create({
      name: 'Hoang Anh Duc',
      username: 'customer_duc',
      email: 'duc@auction.com',
      phone: '0901000006',
      password,
      role: 'CUSTOMER',
      isVerified: true
    });

    const customer3 = await User.create({
      name: 'Nguyen Thi Mai',
      username: 'customer_mai',
      email: 'mai@auction.com',
      phone: '0901000007',
      password,
      role: 'CUSTOMER',
      isVerified: true
    });

    console.log('✓ 7 users created.');

    // ──────────── 2. PROPERTIES ────────────
    const prop1 = await Property.create({
      title: 'Modern Sunset Villa',
      description: 'Biệt thự hiện đại với view biển tuyệt đẹp, 3 tầng, hồ bơi riêng, sân vườn rộng 200m². Nội thất cao cấp nhập khẩu từ Ý.',
      address: 'Đường Trần Não, Quận 2, TP.HCM',
      startingPrice: 2500000,
      area: 450,
      beds: 5,
      baths: 4,
      propertyType: 'Villa',
      status: 'APPROVED',
      ownerId: owner1.id
    });

    const prop2 = await Property.create({
      title: 'Skyline Penthouse',
      description: 'Căn hộ penthouse tầng 35 tại trung tâm Quận 1, view toàn cảnh thành phố. Ban công rộng, phòng khách double-height.',
      address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM',
      startingPrice: 1800000,
      area: 220,
      beds: 3,
      baths: 3,
      propertyType: 'Penthouse',
      status: 'PENDING',
      ownerId: owner1.id
    });

    const prop3 = await Property.create({
      title: 'Heritage French Mansion',
      description: 'Biệt thự phong cách Pháp cổ điển, được xây dựng từ năm 1925 và phục chế hoàn toàn. Khu vườn rộng với cây xanh trăm tuổi.',
      address: 'Đường Phạm Ngọc Thạch, Quận 3, TP.HCM',
      startingPrice: 4200000,
      area: 800,
      beds: 7,
      baths: 6,
      propertyType: 'Villa',
      status: 'APPROVED',
      ownerId: owner1.id
    });

    const prop4 = await Property.create({
      title: 'Riverside Luxury Apartment',
      description: 'Căn hộ cao cấp ven sông Sài Gòn, tầng 22, view sông thoáng mát. Tiện ích nội khu đầy đủ: gym, hồ bơi, BBQ.',
      address: 'Đường Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM',
      startingPrice: 950000,
      area: 110,
      beds: 2,
      baths: 2,
      propertyType: 'Apartment',
      status: 'APPROVED',
      ownerId: owner2.id
    });

    const prop5 = await Property.create({
      title: 'Garden Townhouse',
      description: 'Nhà phố liên kế có sân vườn, 4 tầng, thiết kế thông thoáng. Gần trường quốc tế, bệnh viện và trung tâm thương mại.',
      address: 'Đường Lê Văn Việt, TP. Thủ Đức, TP.HCM',
      startingPrice: 650000,
      area: 180,
      beds: 4,
      baths: 3,
      propertyType: 'House',
      status: 'APPROVED',
      ownerId: owner2.id
    });

    const prop6 = await Property.create({
      title: 'Eco Green Residence',
      description: 'Căn hộ xanh thân thiện môi trường, sử dụng năng lượng mặt trời, vật liệu tái chế. Tầng thấp, view công viên.',
      address: 'Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
      startingPrice: 520000,
      area: 95,
      beds: 2,
      baths: 2,
      propertyType: 'Apartment',
      status: 'PENDING',
      ownerId: owner2.id
    });

    const prop7 = await Property.create({
      title: 'Downtown Office Loft',
      description: 'Căn hộ dạng loft tại trung tâm quận 1, phù hợp làm văn phòng hoặc studio. Trần cao 4.5m, thiết kế industrial.',
      address: 'Đường Lý Tự Trọng, Quận 1, TP.HCM',
      startingPrice: 780000,
      area: 150,
      beds: 1,
      baths: 1,
      propertyType: 'Apartment',
      status: 'REJECTED',
      ownerId: owner1.id
    });

    console.log('✓ 7 properties created.');

    // ──────────── 3. PROPERTY IMAGES ────────────
    const imageData = [
      { propertyId: prop1.id, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop2.id, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop3.id, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop4.id, imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop5.id, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop6.id, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop7.id, imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800' },
    ];
    for (const img of imageData) {
      await PropertyImage.create(img);
    }
    console.log('✓ 7 property images created.');

    // ──────────── 4. AUCTIONS ────────────
    const now = new Date();

    // auction1: ACTIVE — ends in 48h
    const auction1 = await Auction.create({
      propertyId: prop1.id,
      startTime: new Date(now.getTime() - 1000 * 60 * 60 * 2), // started 2h ago
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 48),  // ends in 48h
      depositAmount: 50000,
      status: 'ACTIVE'
    });

    // auction2: ACTIVE — ends in 5h
    const auction2 = await Auction.create({
      propertyId: prop3.id,
      startTime: new Date(now.getTime() - 1000 * 60 * 60 * 24), // started 24h ago
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 5),    // ends in 5h
      depositAmount: 80000,
      status: 'ACTIVE'
    });

    // auction3: UPCOMING — starts in 24h
    const auction3 = await Auction.create({
      propertyId: prop4.id,
      startTime: new Date(now.getTime() + 1000 * 60 * 60 * 24), // starts in 24h
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 72),   // ends in 72h
      depositAmount: 20000,
      status: 'UPCOMING'
    });

    // auction4: ACTIVE — ends in 12h
    const auction4 = await Auction.create({
      propertyId: prop5.id,
      startTime: new Date(now.getTime() - 1000 * 60 * 60 * 6),  // started 6h ago
      endTime: new Date(now.getTime() + 1000 * 60 * 60 * 12),   // ends in 12h
      depositAmount: 15000,
      status: 'ACTIVE'
    });

    console.log('✓ 4 auctions created.');

    // ──────────── 5. DEPOSITS ────────────
    // customer1 deposits for auction1, auction2
    const dep1 = await Deposit.create({ userId: customer1.id, auctionId: auction1.id, amount: 50000, status: 'SUCCESS' });
    const dep2 = await Deposit.create({ userId: customer1.id, auctionId: auction2.id, amount: 80000, status: 'SUCCESS' });

    // customer2 deposits for auction1, auction4
    const dep3 = await Deposit.create({ userId: customer2.id, auctionId: auction1.id, amount: 50000, status: 'SUCCESS' });
    const dep4 = await Deposit.create({ userId: customer2.id, auctionId: auction4.id, amount: 15000, status: 'SUCCESS' });

    // customer3 deposits for auction2, auction4
    const dep5 = await Deposit.create({ userId: customer3.id, auctionId: auction2.id, amount: 80000, status: 'SUCCESS' });
    const dep6 = await Deposit.create({ userId: customer3.id, auctionId: auction4.id, amount: 15000, status: 'SUCCESS' });

    console.log('✓ 6 deposits created.');

    // ──────────── 6. BIDS ────────────
    // Auction 1 bids (Modern Sunset Villa)
    await Bid.create({ auctionId: auction1.id, bidderId: customer1.id, amount: 2550000, bidTime: new Date(now.getTime() - 1000 * 60 * 90) });
    await Bid.create({ auctionId: auction1.id, bidderId: customer2.id, amount: 2600000, bidTime: new Date(now.getTime() - 1000 * 60 * 60) });
    await Bid.create({ auctionId: auction1.id, bidderId: customer1.id, amount: 2700000, bidTime: new Date(now.getTime() - 1000 * 60 * 30) });
    await Bid.create({ auctionId: auction1.id, bidderId: customer2.id, amount: 2750000, bidTime: new Date(now.getTime() - 1000 * 60 * 10) });

    // Auction 2 bids (Heritage French Mansion)
    await Bid.create({ auctionId: auction2.id, bidderId: customer1.id, amount: 4300000, bidTime: new Date(now.getTime() - 1000 * 60 * 120) });
    await Bid.create({ auctionId: auction2.id, bidderId: customer3.id, amount: 4450000, bidTime: new Date(now.getTime() - 1000 * 60 * 60) });
    await Bid.create({ auctionId: auction2.id, bidderId: customer1.id, amount: 4500000, bidTime: new Date(now.getTime() - 1000 * 60 * 20) });

    // Auction 4 bids (Garden Townhouse)
    await Bid.create({ auctionId: auction4.id, bidderId: customer2.id, amount: 680000, bidTime: new Date(now.getTime() - 1000 * 60 * 180) });
    await Bid.create({ auctionId: auction4.id, bidderId: customer3.id, amount: 700000, bidTime: new Date(now.getTime() - 1000 * 60 * 90) });
    await Bid.create({ auctionId: auction4.id, bidderId: customer2.id, amount: 720000, bidTime: new Date(now.getTime() - 1000 * 60 * 45) });

    console.log('✓ 10 bids created.');

    // ──────────── DONE ────────────
    console.log('\n🎉 Seeding completed successfully!');
    console.log('\nTest accounts (password: password123):');
    console.log('  Admin:    admin@auction.com');
    console.log('  Staff:    staff@auction.com');
    console.log('  Owner 1:  owner@auction.com');
    console.log('  Owner 2:  lan@auction.com');
    console.log('  Customer: customer@auction.com');
    console.log('  Customer: duc@auction.com');
    console.log('  Customer: mai@auction.com');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
