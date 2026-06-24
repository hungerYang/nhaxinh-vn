const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in .env.admin or environment.');
}
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper: read users from JSON file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write users to JSON file
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

// Helper: hash password with SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper: sanitize user object (remove password)
function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// Local middleware: verify JWT for protected user routes
function requireUserAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authorization header missing or invalid' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(401).json({ success: false, error: 'Unauthorized: not a user token' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

// POST /api/users/register
router.post('/register', (req, res) => {
  const { email, password, name, locale } = req.body;

  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email format' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }

  // Check if email already registered
  const users = readUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }

  // Create new user
  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    name,
    locale: locale || 'vi',
    avatar: '',
    favorites: [],
    likes: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  // Generate JWT token
  const token = jwt.sign(
    { role: 'user', userId: newUser.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    token,
    user: sanitizeUser(newUser),
  });
});

// POST /api/users/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Verify password hash
  const inputHash = hashPassword(password);
  if (inputHash !== user.passwordHash) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { role: 'user', userId: user.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    token,
    user: sanitizeUser(user),
  });
});

// GET /api/users/profile (requires auth)
router.get('/profile', requireUserAuth, (req, res) => {

  const users = readUsers();
  const user = users.find(u => u.id === req.user.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({ success: true, user: sanitizeUser(user) });
});

// PUT /api/users/profile (requires auth)
router.put('/profile', requireUserAuth, (req, res) => {

  const { name, locale, avatar } = req.body;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === req.user.userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (name !== undefined) users[userIndex].name = name;
  if (locale !== undefined) users[userIndex].locale = locale;
  if (avatar !== undefined) users[userIndex].avatar = avatar;

  writeUsers(users);

  return res.json({ success: true, user: sanitizeUser(users[userIndex]) });
});

// POST /api/users/favorites/:articleId (requires auth)
router.post('/favorites/:articleId', requireUserAuth, (req, res) => {

  const { articleId } = req.params;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === req.user.userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const favorites = users[userIndex].favorites || [];
  const index = favorites.indexOf(articleId);

  if (index === -1) {
    favorites.push(articleId);
  } else {
    favorites.splice(index, 1);
  }

  users[userIndex].favorites = favorites;
  writeUsers(users);

  return res.json({ success: true, favorites });
});

// POST /api/users/likes/:articleId (requires auth)
router.post('/likes/:articleId', requireUserAuth, (req, res) => {

  const { articleId } = req.params;
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === req.user.userId);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const likes = users[userIndex].likes || [];
  const index = likes.indexOf(articleId);

  if (index === -1) {
    likes.push(articleId);
  } else {
    likes.splice(index, 1);
  }

  users[userIndex].likes = likes;
  writeUsers(users);

  return res.json({ success: true, likes });
});

// GET /api/users/favorites (requires auth)
router.get('/favorites', requireUserAuth, (req, res) => {

  const users = readUsers();
  const user = users.find(u => u.id === req.user.userId);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  return res.json({ success: true, favorites: user.favorites || [] });
});

module.exports = router;
