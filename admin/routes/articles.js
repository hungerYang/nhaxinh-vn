const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const DATA_PATH = path.resolve('/workspace/nhaxinh/src/data/articles.json');

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
  return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const data = await readData();
    return res.json(data);
  } catch (err) {
    console.error('Error reading articles:', err);
    return res.status(500).json({ error: 'Failed to read articles' });
  }
});

// GET /api/articles/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await readData();
    const article = data.find(item => item.id === req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    return res.json(article);
  } catch (err) {
    console.error('Error reading article:', err);
    return res.status(500).json({ error: 'Failed to read article' });
  }
});

// POST /api/articles
router.post('/', async (req, res) => {
  try {
    const data = await readData();
    const newArticle = {
      ...req.body,
      id: generateId(),
    };
    data.push(newArticle);
    await writeData(data);
    return res.status(201).json(newArticle);
  } catch (err) {
    console.error('Error creating article:', err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/:id
router.put('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(item => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    data[index] = { ...data[index], ...req.body, id: req.params.id };
    await writeData(data);
    return res.json(data[index]);
  } catch (err) {
    console.error('Error updating article:', err);
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(item => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Article not found' });
    }
    const deleted = data.splice(index, 1)[0];
    await writeData(data);
    return res.json({ message: 'Article deleted', deleted });
  } catch (err) {
    console.error('Error deleting article:', err);
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

module.exports = router;
