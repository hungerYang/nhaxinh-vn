const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required.');
}

const DATA_PATH = path.join(__dirname, '..', '..', 'src', 'data', 'submissions.json');

// Middleware: verify admin JWT
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: admin access required' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware: verify user JWT (for POST submissions)
function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    if (decoded.role !== 'user') {
      return res.status(401).json({ error: 'Unauthorized: not a user token' });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Helper: read JSON data
async function readData() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

// Helper: write JSON data
async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: generate unique ID
function generateId() {
  return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// GET /api/submissions (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const data = await readData();
    return res.json(data);
  } catch (err) {
    console.error('Error reading submissions:', err);
    return res.status(500).json({ error: 'Failed to read submissions' });
  }
});

// GET /api/submissions/:id (admin only)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const data = await readData();
    const item = data.find(s => s.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Error reading submission:', err);
    return res.status(500).json({ error: 'Failed to read submission' });
  }
});

// POST /api/submissions (user auth - logged in users can submit)
router.post('/', requireUser, async (req, res) => {
  try {
    const data = await readData();
    const newItem = {
      ...req.body,
      id: generateId(),
      userId: req.user.userId,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };
    data.push(newItem);
    await writeData(data);
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating submission:', err);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
});

// PUT /api/submissions/:id (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    data[index] = { ...data[index], ...req.body, id: req.params.id };
    await writeData(data);
    return res.json(data[index]);
  } catch (err) {
    console.error('Error updating submission:', err);
    return res.status(500).json({ error: 'Failed to update submission' });
  }
});

// DELETE /api/submissions/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    const deleted = data.splice(index, 1)[0];
    await writeData(data);
    return res.json({ message: 'Submission deleted', deleted });
  } catch (err) {
    console.error('Error deleting submission:', err);
    return res.status(500).json({ error: 'Failed to delete submission' });
  }
});

module.exports = router;
