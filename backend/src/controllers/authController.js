const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      username, 
      email, 
      password: hashedPassword, 
      role 
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

module.exports = { register, login };
