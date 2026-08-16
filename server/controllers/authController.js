const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, nextId } = require('../config/db');

function sign(user) {
  return jwt.sign(
    { id: user.id, userId: user.user_id, role: user.role, fullName: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

exports.register = async (req, res) => {
  try {
    const { fullName, userId, email, address, password, confirmPassword } = req.body;
    if (!fullName || !userId || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const db = readDB();
    const exists = db.users.find(
      u => u.user_id.toLowerCase() === userId.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
    if (exists) {
      return res.status(409).json({ message: 'User ID or email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextId(db, 'users'),
      full_name: fullName,
      user_id: userId,
      email,
      address: address || '',
      password: hashed,
      role: 'user',
      created_at: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);

    const token = sign(newUser);
    res.status(201).json({ token, user: publicUser(newUser) });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: 'User ID and password required' });
    }

    // Predefined admin account (from .env), not stored as a hashed user record.
    if (userId === process.env.ADMIN_USER_ID && password === process.env.ADMIN_PASSWORD) {
      const adminUser = { id: 0, user_id: process.env.ADMIN_USER_ID, full_name: 'Administrator', role: 'admin', email: 'admin@learntrack.dev' };
      const token = sign(adminUser);
      return res.json({ token, user: adminUser });
    }

    const db = readDB();
    const user = db.users.find(u => u.user_id.toLowerCase() === userId.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = sign(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

exports.getProfile = (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(user));
};

exports.updateProfile = (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { fullName, address, email } = req.body;
  if (fullName) user.full_name = fullName;
  if (address !== undefined) user.address = address;
  if (email) user.email = email;
  writeDB(db);
  res.json(publicUser(user));
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  writeDB(db);
  res.json({ message: 'Password updated successfully' });
};
