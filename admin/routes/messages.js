const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in .env.admin or environment.');
}
const MESSAGES_FILE = path.join(__dirname, '..', 'data', 'messages.json');
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper: read messages from JSON file
function readMessages() {
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write messages to JSON file
function writeMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf-8');
}

// Helper: read users from JSON file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Local middleware: verify JWT for user auth
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

// GET /api/messages/conversations - Get all conversations for current user
router.get('/conversations', requireUserAuth, (req, res) => {
  const currentUserId = req.user.userId;
  const messages = readMessages();
  const users = readUsers();

  // Get messages involving current user
  const userMessages = messages.filter(
    m => m.fromUserId === currentUserId || m.toUserId === currentUserId
  );

  // Group by conversation partner
  const conversationsMap = {};
  for (const msg of userMessages) {
    const partnerId = msg.fromUserId === currentUserId ? msg.toUserId : msg.fromUserId;
    if (!conversationsMap[partnerId]) {
      conversationsMap[partnerId] = {
        partnerId,
        lastMessage: msg,
        unreadCount: 0,
      };
    }
    // Update last message if newer
    if (new Date(msg.createdAt) > new Date(conversationsMap[partnerId].lastMessage.createdAt)) {
      conversationsMap[partnerId].lastMessage = msg;
    }
    // Count unread messages (sent to current user, not read)
    if (msg.toUserId === currentUserId && !msg.read) {
      conversationsMap[partnerId].unreadCount++;
    }
  }

  // Build response with partner info
  const conversations = Object.values(conversationsMap)
    .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
    .map(conv => {
      const partner = users.find(u => u.id === conv.partnerId);
      return {
        partnerId: conv.partnerId,
        partnerName: partner ? partner.name : 'Unknown',
        partnerAvatar: partner ? partner.avatar : '',
        lastMessage: conv.lastMessage.content,
        lastMessageAt: conv.lastMessage.createdAt,
        unreadCount: conv.unreadCount,
      };
    });

  return res.json({ success: true, conversations });
});

// GET /api/messages/:userId - Get messages between current user and another user
router.get('/:userId', requireUserAuth, (req, res) => {
  const currentUserId = req.user.userId;
  const otherUserId = req.params.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  const messages = readMessages();

  // Get messages between the two users
  const conversationMessages = messages.filter(
    m =>
      (m.fromUserId === currentUserId && m.toUserId === otherUserId) ||
      (m.fromUserId === otherUserId && m.toUserId === currentUserId)
  );

  // Sort by date (oldest first)
  conversationMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Paginate
  const paginatedMessages = conversationMessages.slice(offset, offset + limit);
  const total = conversationMessages.length;

  // Mark messages sent to current user as read
  let updated = false;
  for (const msg of messages) {
    if (msg.fromUserId === otherUserId && msg.toUserId === currentUserId && !msg.read) {
      msg.read = true;
      updated = true;
    }
  }
  if (updated) {
    writeMessages(messages);
  }

  return res.json({
    success: true,
    messages: paginatedMessages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  });
});

// POST /api/messages/:userId - Send a message to another user
router.post('/:userId', requireUserAuth, (req, res) => {
  const currentUserId = req.user.userId;
  const toUserId = req.params.userId;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Nội dung tin nhắn không được để trống.' });
  }

  if (content.length > 5000) {
    return res.status(400).json({ success: false, error: 'Tin nhắn quá dài. Tối đa 5000 ký tự.' });
  }

  // Verify target user exists
  const users = readUsers();
  const targetUser = users.find(u => u.id === toUserId);
  if (!targetUser) {
    return res.status(404).json({ success: false, error: 'Người dùng không tồn tại.' });
  }

  const messages = readMessages();
  const newMessage = {
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    fromUserId: currentUserId,
    toUserId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  writeMessages(messages);

  return res.status(201).json({ success: true, message: newMessage });
});

// POST /api/messages/:messageId/read - Mark a message as read
router.post('/:messageId/read', requireUserAuth, (req, res) => {
  const currentUserId = req.user.userId;
  const messageId = req.params.messageId;
  const messages = readMessages();

  const msgIndex = messages.findIndex(m => m.id === messageId);
  if (msgIndex === -1) {
    return res.status(404).json({ success: false, error: 'Tin nhắn không tồn tại.' });
  }

  const msg = messages[msgIndex];
  if (msg.toUserId !== currentUserId) {
    return res.status(403).json({ success: false, error: 'Bạn không có quyền đánh dấu tin nhắn này.' });
  }

  messages[msgIndex].read = true;
  writeMessages(messages);

  return res.json({ success: true, message: messages[msgIndex] });
});

module.exports = router;
