const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // If SMTP credentials are configured, use them
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('[Email] Using configured SMTP:', process.env.SMTP_HOST);
  } else {
    // Auto-create Ethereal test account (no config needed)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('[Email] Using Ethereal test account:', testAccount.user);
    console.log('[Email] View sent emails at: https://ethereal.email/login');
    console.log('[Email] Login:', testAccount.user, '/ Pass:', testAccount.pass);
  }
  return transporter;
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Auction Platform" <noreply@auction.vn>',
      to: email,
      subject: 'Xác minh tài khoản đăng ký',
      html: `
        <h2>Chào mừng bạn đến với Hệ thống Đấu giá Bất động sản!</h2>
        <p>Vui lòng xác minh email của bạn bằng cách nhấn vào liên kết bên dưới:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;">Xác minh Email</a>
        <p>Hoặc sao chép liên kết: ${verifyUrl}</p>
        <p>Liên kết có hiệu lực trong 24 giờ.</p>
      `
    });
    console.log(`[Email] Verification email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('[Email] Preview URL:', previewUrl);
  } catch (error) {
    console.error('[Email] Error sending verification email:', error.message);
  }
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Auction Platform" <noreply@auction.vn>',
      to: email,
      subject: 'Khôi phục mật khẩu',
      html: `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết bên dưới:</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#dc2626;color:white;text-decoration:none;border-radius:8px;">Đặt lại mật khẩu</a>
        <p>Hoặc sao chép liên kết: ${resetUrl}</p>
        <p>Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      `
    });
    console.log(`[Email] Password reset email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('[Email] Preview URL:', previewUrl);
  } catch (error) {
    console.error('[Email] Error sending password reset email:', error.message);
  }
};

const sendWinnerNotification = async (email, auctionDetails) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Auction Platform" <noreply@auction.vn>',
      to: email,
      subject: `🎉 Chúc mừng! Bạn đã thắng đấu giá - ${auctionDetails.propertyTitle}`,
      html: `
        <h2>🎉 Chúc mừng bạn đã thắng đấu giá!</h2>
        <table style="border-collapse:collapse;width:100%;">
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Tài sản</strong></td><td style="padding:8px;border:1px solid #ddd;">${auctionDetails.propertyTitle}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Địa chỉ</strong></td><td style="padding:8px;border:1px solid #ddd;">${auctionDetails.propertyAddress}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Giá thắng</strong></td><td style="padding:8px;border:1px solid #ddd;">${Number(auctionDetails.winningAmount).toLocaleString('vi-VN')} VND</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Đã đặt cọc</strong></td><td style="padding:8px;border:1px solid #ddd;">${Number(auctionDetails.depositAmount).toLocaleString('vi-VN')} VND</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Số tiền còn lại</strong></td><td style="padding:8px;border:1px solid #ddd;">${Number(auctionDetails.remainingAmount).toLocaleString('vi-VN')} VND</td></tr>
        </table>
        <p>Vui lòng hoàn tất thanh toán trong thời hạn quy định.</p>
      `
    });
    console.log(`[Email] Winner notification sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('[Email] Preview URL:', previewUrl);
  } catch (error) {
    console.error('[Email] Error sending winner notification:', error.message);
  }
};

const sendReceiptEmail = async (email, receiptData) => {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Auction Platform" <noreply@auction.vn>',
      to: email,
      subject: `Biên lai giao dịch #${receiptData.paymentId}`,
      html: `
        <h2>Biên lai Giao dịch</h2>
        <p>Mã giao dịch: <strong>${receiptData.paymentId}</strong></p>
        <p>Số tiền: <strong>${Number(receiptData.amount).toLocaleString('vi-VN')} VND</strong></p>
        <p>Loại: ${receiptData.type}</p>
        <p>Ngày: ${new Date(receiptData.date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
        <p>Trạng thái: ✅ Thành công</p>
      `
    });
    console.log(`[Email] Receipt email sent to ${email}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('[Email] Preview URL:', previewUrl);
  } catch (error) {
    console.error('[Email] Error sending receipt email:', error.message);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWinnerNotification, sendReceiptEmail };
