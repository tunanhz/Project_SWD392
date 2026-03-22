const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, VerificationToken } = require('../models');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

const register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      username, 
      email, 
      password: hashedPassword, 
      role,
      isVerified: false
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: user.id,
      token,
      type: 'EMAIL_VERIFY',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    // Send verification email
    await sendVerificationEmail(email, token);

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.', 
      userId: user.id 
    });
  } catch (error) {
    let message = 'Registration failed. Please try again.';
    if (error.name === 'SequelizeUniqueConstraintError') {
      message = 'Email or username already exists.';
    } else if (error.name === 'SequelizeValidationError') {
      message = error.errors[0].message;
    }
    res.status(400).json({ error: message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params; console.log('TRYING TO VERIFY TOKEN:', token);
    const verificationToken = await VerificationToken.findOne({
      where: { 
        token, 
        type: 'EMAIL_VERIFY'
      },
      include: [{ model: User, as: 'user' }]
    });

    if (!verificationToken || new Date(verificationToken.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = verificationToken.user;
    user.isVerified = true;
    await user.save();

    // Delete used token
    await verificationToken.destroy();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Email verification failed.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact admin.' });
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      return res.status(423).json({ 
        message: `Account is locked due to too many failed login attempts. Try again in ${remainingMinutes} minutes.` 
      });
    }

    // Reset lock if it has expired
    if (user.lockedUntil && new Date(user.lockedUntil) <= new Date()) {
      user.lockedUntil = null;
      user.failedLoginAttempts = 0;
      await user.save();
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.failedLoginAttempts += 1;

      // Lock account after MAX_FAILED_ATTEMPTS
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
        await user.save();
        return res.status(423).json({ 
          message: `Account locked for ${LOCK_DURATION_MINUTES} minutes due to ${MAX_FAILED_ATTEMPTS} failed login attempts.` 
        });
      }

      await user.save();
      return res.status(401).json({ 
        message: `Invalid credentials. ${MAX_FAILED_ATTEMPTS - user.failedLoginAttempts} attempts remaining.` 
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, avatar: user.avatar, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists or not (security)
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    // Delete any existing password reset tokens for this user
    await VerificationToken.destroy({
      where: { userId: user.id, type: 'PASSWORD_RESET' }
    });

    // Create new reset token
    const token = crypto.randomBytes(32).toString('hex');
    await VerificationToken.create({
      userId: user.id,
      token,
      type: 'PASSWORD_RESET',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    await sendPasswordResetEmail(email, token);

    res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process request.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const resetToken = await VerificationToken.findOne({
      where: { 
        token, 
        type: 'PASSWORD_RESET'
      },
      include: [{ model: User, as: 'user' }]
    });

    if (!resetToken || new Date(resetToken.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = resetToken.user;
    user.password = await bcrypt.hash(newPassword, 10);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    // Delete used token
    await resetToken.destroy();

    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: 'Password reset failed.' });
  }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
