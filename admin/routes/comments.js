const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in .env.admin or environment.');
}
const COMMENTS_FILE = path.join(__dirname, '..', 'data', 'comments.json');

// Helper: read comments from JSON file
function readComments() {
  try {
    const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write comments to JSON file
function writeComments(comments) {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
}

// Middleware: verify JWT for user auth (same pattern as users.js)
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

// GET /api/comments/:articleId - Get all comments for an article (public)
router.get('/:articleId', (req, res) => {
  const { articleId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const comments = readComments();
  const articleComments = comments
    .filter(c => c.articleId === articleId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = articleComments.length;
  const start = (page - 1) * limit;
  const paginatedComments = articleComments.slice(start, start + limit);

  return res.json({
    success: true,
    comments: paginatedComments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// POST /api/comments/:articleId - Add a comment (requires user auth)
router.post('/:articleId', requireUserAuth, (req, res) => {
  const { articleId } = req.params;
  const { content } = req.body;

  // Validate content
  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Comment content is required' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ success: false, error: 'Comment content must be at most 1000 characters' });
  }

  const comments = readComments();

  // Look up user info from users.json
  const usersFile = path.join(__dirname, '..', 'data', 'users.json');
  let userName = 'Anonymous';
  let userAvatar = '';
  try {
    const usersData = fs.readFileSync(usersFile, 'utf-8');
    const users = JSON.parse(usersData);
    const user = users.find(u => u.id === req.user.userId);
    if (user) {
      userName = user.name;
      userAvatar = user.avatar || '';
    }
  } catch { /* ignore */ }

  const newComment = {
    id: 'c_' + Date.now(),
    articleId,
    userId: req.user.userId,
    userName,
    userAvatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: [],
  };

  comments.push(newComment);
  writeComments(comments);

  return res.status(201).json({ success: true, comment: newComment });
});

// POST /api/comments/:commentId/like - Like/unlike a comment (requires user auth)
router.post('/:commentId/like', requireUserAuth, (req, res) => {
  const { commentId } = req.params;
  const comments = readComments();
  const commentIndex = comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ success: false, error: 'Comment not found' });
  }

  const likes = comments[commentIndex].likes || [];
  const userId = req.user.userId;
  const likeIndex = likes.indexOf(userId);

  if (likeIndex === -1) {
    likes.push(userId);
  } else {
    likes.splice(likeIndex, 1);
  }

  comments[commentIndex].likes = likes;
  writeComments(comments);

  return res.json({ success: true, likes, count: likes.length });
});

// DELETE /api/comments/:commentId - Delete a comment (requires user auth, author only)
router.delete('/:commentId', requireUserAuth, (req, res) => {
  const { commentId } = req.params;
  const comments = readComments();
  const commentIndex = comments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return res.status(404).json({ success: false, error: 'Comment not found' });
  }

  // Only the comment author can delete
  if (comments[commentIndex].userId !== req.user.userId) {
    return res.status(403).json({ success: false, error: 'You can only delete your own comments' });
  }

  comments.splice(commentIndex, 1);
  writeComments(comments);

  return res.json({ success: true, message: 'Comment deleted successfully' });
});

module.exports = router;
