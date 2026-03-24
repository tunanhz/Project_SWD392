const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const { 
  User, Property, Auction, Bid, Deposit, Payment, 
  Notification, Complaint, LegalDocument, ActivityLog, PropertyImage, Report
} = require('../models');

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('🚀 Database synced. Seeding comprehensive test data started...');

    const password = await bcrypt.hash('password123', 10);

    // ──────────── 1. USERS ────────────
    const admin = await User.create({
      name: 'Nguyen Van Admin', username: 'admin_user', email: 'admin@auction.com',
      phone: '0901000001', password, role: 'ADMIN', isVerified: true, bank_account: 'VCA-123456789'
    });

    const staff = await User.create({
      name: 'Tran Thi Staff', username: 'staff_user', email: 'staff@auction.com',
      phone: '0901000002', password, role: 'STAFF', isVerified: true, bank_account: 'VCA-987654321'
    });

    const owner1 = await User.create({
      name: 'Le Van Owner', username: 'owner_user', email: 'owner@auction.com',
      phone: '0901000003', password, role: 'OWNER', isVerified: true, bank_account: 'OWN-111111111'
    });

    const owner2 = await User.create({
      name: 'Pham Thi Lan', username: 'owner_lan', email: 'lan@auction.com',
      phone: '0901000004', password, role: 'OWNER', isVerified: true, bank_account: 'OWN-222222222'
    });

    const customer1 = await User.create({
      name: 'Vo Minh Bidder', username: 'customer_user', email: 'customer@auction.com',
      phone: '0901000005', password, role: 'CUSTOMER', isVerified: true, bank_account: 'CUS-333333333'
    });

    const customer2 = await User.create({
      name: 'Hoang Anh Duc', username: 'customer_duc', email: 'duc@auction.com',
      phone: '0901000006', password, role: 'CUSTOMER', isVerified: true, bank_account: 'CUS-444444444'
    });

    const customer3 = await User.create({
      name: 'Nguyen Thi Mai', username: 'customer_mai', email: 'mai@auction.com',
      phone: '0901000007', password, role: 'CUSTOMER', isVerified: true, bank_account: 'CUS-555555555'
    });

    console.log('✅ 7 Users created.');

    // ──────────── 2. PROPERTIES ────────────
    const prop1 = await Property.create({
      title: 'Modern Sunset Villa', description: 'Biệt thự hiện đại với view biển tuyệt đẹp, hồ bơi riêng.',
      address: 'Đường Trần Não, Quận 2, TP.HCM', startingPrice: 2500000000,
      area: 450, beds: 5, baths: 4, propertyType: 'Villa', status: 'APPROVED', ownerId: owner1.id
    });

    const prop2 = await Property.create({
      title: 'Skyline Penthouse', description: 'Căn hộ penthouse tầng 35 tại trung tâm Quận 1.',
      address: 'Đường Nguyễn Huệ, Quận 1, TP.HCM', startingPrice: 1800000000,
      area: 220, beds: 3, baths: 3, propertyType: 'Penthouse', status: 'PENDING', ownerId: owner1.id
    });

    const prop3 = await Property.create({
      title: 'Heritage French Mansion', description: 'Biệt thự phong cách Pháp cổ điển, phục chế hoàn toàn.',
      address: 'Đường Phạm Ngọc Thạch, Quận 3, TP.HCM', startingPrice: 4200000000,
      area: 800, beds: 7, baths: 6, propertyType: 'Villa', status: 'APPROVED', ownerId: owner1.id
    });

    const prop4 = await Property.create({
      title: 'Riverside Luxury Apartment', description: 'Căn hộ cao cấp ven sông Sài Gòn, tầng 22.',
      address: 'Đường Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM', startingPrice: 950000000,
      area: 110, beds: 2, baths: 2, propertyType: 'Apartment', status: 'APPROVED', ownerId: owner2.id
    });

    const prop5 = await Property.create({
      title: 'Garden Townhouse', description: 'Nhà phố liên kế có sân vườn, 4 tầng.',
      address: 'Đường Lê Văn Việt, TP. Thủ Đức, TP.HCM', startingPrice: 650000000,
      area: 180, beds: 4, baths: 3, propertyType: 'House', status: 'SOLD', ownerId: owner2.id
    });

    const prop6 = await Property.create({
      title: 'Eco Green Residence', description: 'Căn hộ thân thiện môi trường, view công viên.',
      address: 'Đường Nguyễn Văn Linh, Quận 7, TP.HCM', startingPrice: 500000000,
      area: 100, beds: 2, baths: 1, propertyType: 'Apartment', status: 'REJECTED', ownerId: owner2.id
    });

    const prop7 = await Property.create({
      title: 'Downtown Office Loft', description: 'Căn hộ dạng loft tại trung tâm quận 1.',
      address: 'Đường Lý Tự Trọng, Quận 1, TP.HCM', startingPrice: 780000000,
      area: 150, beds: 1, baths: 1, propertyType: 'Apartment', status: 'WITHDRAWN', ownerId: owner1.id
    });

    const prop8 = await Property.create({
      title: 'Ocean View Villa', description: 'Biệt thự view biển tuyệt đẹp chưa lên sàn.',
      address: 'Đường ven biển, Nha Trang', startingPrice: 3500000000,
      area: 300, beds: 4, baths: 3, propertyType: 'Villa', status: 'APPROVED', ownerId: owner1.id
    });

    const prop9 = await Property.create({
      title: 'City Center Condo', description: 'Căn hộ chung cư cao cấp ở trung tâm.',
      address: 'Đường Hàm Nghi, Quận 1, TP.HCM', startingPrice: 1200000000,
      area: 85, beds: 2, baths: 2, propertyType: 'Apartment', status: 'APPROVED', ownerId: owner2.id
    });

    const prop10 = await Property.create({
      title: 'Suburban Family Home', description: 'Nhà cho gia đình ở vùng ngoại ô.',
      address: 'Đường Nguyễn Oanh, Gò Vấp, TP.HCM', startingPrice: 850000000,
      area: 120, beds: 3, baths: 2, propertyType: 'House', status: 'APPROVED', ownerId: owner1.id
    });

    const prop11 = await Property.create({
      title: 'Luxury Estate', description: 'Khu đất rộng rãi với thiết kế cao cấp.',
      address: 'Đường Mai Chí Thọ, Quận 2, TP.HCM', startingPrice: 5500000000,
      area: 600, beds: 6, baths: 5, propertyType: 'Villa', status: 'APPROVED', ownerId: owner2.id
    });

    console.log('✅ 11 Properties created.');

    // ──────────── 3. PROPERTY IMAGES ────────────
    const imageData = [
      { propertyId: prop1.id, imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop2.id, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop3.id, imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop4.id, imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop5.id, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop6.id, imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop7.id, imageUrl: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop8.id, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop9.id, imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop10.id, imageUrl: 'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&q=80&w=800' },
      { propertyId: prop11.id, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1f51722e1e?auto=format&fit=crop&q=80&w=800' },
    ];
    for (const img of imageData) {
      await PropertyImage.create(img);
    }
    console.log('✅ Property Images created.');

    // ──────────── 4. LEGAL DOCUMENTS ────────────
    await LegalDocument.bulkCreate([
      { propertyId: prop1.id, fileName: 'Sổ đỏ.pdf', filePath: '/uploads/so_do_prop1.pdf', fileType: 'pdf' },
      { propertyId: prop3.id, fileName: 'Giấy phép xây dựng.pdf', filePath: '/uploads/gp_prop3.pdf', fileType: 'pdf' },
    ]);
    console.log('✅ Legal Documents created.');

    // ──────────── 5. AUCTIONS ────────────
    const now = new Date();
    
    // Active Auction
    const auctionActive = await Auction.create({
      propertyId: prop1.id, startTime: new Date(now.getTime() - 3600000), 
      endTime: new Date(now.getTime() + 86400000), depositAmount: 50000000, status: 'ACTIVE'
    });

    // Upcoming Auction
    const auctionUpcoming = await Auction.create({
      propertyId: prop3.id, startTime: new Date(now.getTime() + 86400000), 
      endTime: new Date(now.getTime() + 172800000), depositAmount: 100000000, status: 'UPCOMING'
    });

    // Completed Auction
    const auctionCompleted = await Auction.create({
      propertyId: prop5.id, startTime: new Date(now.getTime() - 172800000), 
      endTime: new Date(now.getTime() - 86400000), depositAmount: 20000000, status: 'COMPLETED', winnerId: customer1.id
    });

    // Paused Auction
    const auctionPaused = await Auction.create({
      propertyId: prop4.id, startTime: new Date(now.getTime() - 86400000), 
      endTime: new Date(now.getTime() + 86400000), depositAmount: 15000000, status: 'PAUSED', pauseReason: 'Technical Issue'
    });

    // Cancelled Auction
    const auctionCancelled = await Auction.create({
      propertyId: prop2.id, startTime: new Date(now.getTime() - 86400000), 
      endTime: new Date(now.getTime() + 86400000), depositAmount: 18000000, status: 'CANCELLED'
    });

    // Completed without Payment (To test 'Pay' in My Bids)
    const auctionCompletedNoPayment = await Auction.create({
      propertyId: prop9.id, startTime: new Date(now.getTime() - 172800000), 
      endTime: new Date(now.getTime() - 86400000), depositAmount: 30000000, status: 'COMPLETED', winnerId: customer2.id
    });

    const endMarch30 = new Date('2026-03-30T23:59:59Z');
    
    // Active Auctions ending Mar 30, 2026
    const auctionActiveEnd30_1 = await Auction.create({
      propertyId: prop10.id, startTime: new Date(now.getTime() - 3600000), 
      endTime: endMarch30, depositAmount: 40000000, status: 'ACTIVE'
    });
    
    const auctionActiveEnd30_2 = await Auction.create({
      propertyId: prop11.id, startTime: new Date(now.getTime() - 7200000), 
      endTime: endMarch30, depositAmount: 200000000, status: 'ACTIVE'
    });

    console.log('✅ 8 Auctions created (including ending 30/3/2026).');

    // ──────────── 6. DEPOSITS ────────────
    await Deposit.bulkCreate([
      { userId: customer1.id, auctionId: auctionActive.id, amount: 50000000, status: 'SUCCESS' },
      { userId: customer2.id, auctionId: auctionActive.id, amount: 50000000, status: 'SUCCESS' },
      { userId: customer1.id, auctionId: auctionCompleted.id, amount: 20000000, status: 'SUCCESS' },
      { userId: customer3.id, auctionId: auctionCompleted.id, amount: 20000000, status: 'REFUNDED' }, // Lost the auction, got refunded
      { userId: customer2.id, auctionId: auctionUpcoming.id, amount: 100000000, status: 'PENDING' },
      // Deposits for completed without payment
      { userId: customer2.id, auctionId: auctionCompletedNoPayment.id, amount: 30000000, status: 'SUCCESS' }, // winner
      { userId: customer1.id, auctionId: auctionCompletedNoPayment.id, amount: 30000000, status: 'REFUNDED' }, // loser
      // Deposits for 30/3 auctions
      { userId: customer3.id, auctionId: auctionActiveEnd30_1.id, amount: 40000000, status: 'SUCCESS' },
      { userId: customer1.id, auctionId: auctionActiveEnd30_1.id, amount: 40000000, status: 'SUCCESS' },
      { userId: customer2.id, auctionId: auctionActiveEnd30_2.id, amount: 200000000, status: 'SUCCESS' },
      { userId: customer3.id, auctionId: auctionActiveEnd30_2.id, amount: 200000000, status: 'SUCCESS' },
    ]);
    console.log('✅ Deposits created.');

    // ──────────── 7. BIDS ────────────
    // Bids for active auction
    await Bid.bulkCreate([
      { auctionId: auctionActive.id, bidderId: customer1.id, amount: 2550000000, bidTime: new Date(now.getTime() - 1800000) },
      { auctionId: auctionActive.id, bidderId: customer2.id, amount: 2600000000, bidTime: new Date(now.getTime() - 900000) },
    ]);

    // Bids for completed auction
    await Bid.bulkCreate([
      { auctionId: auctionCompleted.id, bidderId: customer3.id, amount: 660000000, bidTime: new Date(now.getTime() - 120000000) },
      { auctionId: auctionCompleted.id, bidderId: customer1.id, amount: 680000000, bidTime: new Date(now.getTime() - 100000000) },
    ]);

    // Bids for completed auction without payment
    await Bid.bulkCreate([
      { auctionId: auctionCompletedNoPayment.id, bidderId: customer1.id, amount: 1250000000, bidTime: new Date(now.getTime() - 100000000) },
      { auctionId: auctionCompletedNoPayment.id, bidderId: customer2.id, amount: 1300000000, bidTime: new Date(now.getTime() - 90000000) },
    ]);

    // Bids for Mar 30 active auctions
    await Bid.bulkCreate([
      { auctionId: auctionActiveEnd30_1.id, bidderId: customer1.id, amount: 860000000, bidTime: new Date(now.getTime() - 100000) },
      { auctionId: auctionActiveEnd30_1.id, bidderId: customer3.id, amount: 880000000, bidTime: new Date(now.getTime() - 50000) },
      { auctionId: auctionActiveEnd30_2.id, bidderId: customer2.id, amount: 5600000000, bidTime: new Date(now.getTime() - 150000) },
    ]);
    console.log('✅ Bids created.');

    // ──────────── 8. PAYMENTS ────────────
    await Payment.create({
      userId: customer1.id, auctionId: auctionCompleted.id, amount: 680000000, 
      type: 'REMAINING_BALANCE', status: 'SUCCESS', transactionId: 'TXN123456', paymentMethod: 'VNPAY'
    });
    console.log('✅ Payments created.');

    // ──────────── 9. NOTIFICATIONS ────────────
    await Notification.bulkCreate([
      { userId: customer1.id, type: 'AUCTION_WON', title: 'Chúc mừng!', message: 'Bạn đã thắng đấu giá Garden Townhouse.' },
      { userId: customer2.id, type: 'BID_OUTBID', title: 'Bị vượt mặt!', message: 'Ai đó đã đặt giá cao hơn bạn tại Modern Sunset Villa.' },
      { userId: owner1.id, type: 'PROPERTY_APPROVED', title: 'Tài sản được duyệt', message: 'Heritage French Mansion đã sẵn sàng để đấu giá.' },
    ]);
    console.log('✅ Notifications created.');

    // ──────────── 10. COMPLAINTS ────────────
    await Complaint.create({
      userId: customer3.id, auctionId: auctionCompleted.id, subject: 'Vấn đề bàn giao', 
      description: 'Tôi thấy có vết nứt nhỏ trên tường phòng khách.', status: 'OPEN', deadline: new Date(now.getTime() + 259200000)
    });
    console.log('✅ Complaints created.');

    // ──────────── 11. ACTIVITY LOGS ────────────
    await ActivityLog.bulkCreate([
      { userId: admin.id, action: 'ADMIN_LOGIN' },
      { userId: admin.id, action: 'APPROVED_PROPERTY_' + prop1.id },
      { userId: customer1.id, action: 'PLACED_BID_ON_' + auctionActive.id },
    ]);
    console.log('✅ Activity Logs created.');

    // ──────────── 12. REPORTS ────────────
    await Report.bulkCreate([
      { reportType: 'SYSTEM_HEALTH', date: new Date() },
      { reportType: 'FINANCIAL_SUMMARY', date: new Date() },
      { reportType: 'AUCTION_PERFORMANCE', date: new Date() }
    ]);
    console.log('✅ System Reports created.');

    console.log('\n🎉 Comprehensive seeding completed successfully!');
    console.log('\nTest Accounts (Password: password123):');
    console.log('  Admin:    admin@auction.com');
    console.log('  Staff:    staff@auction.com');
    console.log('  Owner:    owner@auction.com');
    console.log('  Customer: customer@auction.com');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
