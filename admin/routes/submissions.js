const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const DATA_PATH = path.resolve('/workspace/nhaxinh/src/data/submissions.json');

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

// GET /api/submissions
router.get('/', async (req, res) => {
  try {
    const data = await readData();
    return res.json(data);
  } catch (err) {
    console.error('Error reading submissions:', err);
    return res.status(500).json({ error: 'Failed to read submissions' });
  }
});

// GET /api/submissions/:id
router.get('/:id', async (req, res) => {
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

// POST /api/submissions
router.post('/', async (req, res) => {
  try {
    const data = await readData();
    const newItem = {
      ...req.body,
      id: generateId(),
    };
    data.push(newItem);
    await writeData(data);
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating submission:', err);
    return res.status(500).json({ error: 'Failed to create submission' });
  }
});

// PUT /api/submissions/:id
router.put('/:id', async (req, res) => {
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

// DELETE /api/submissions/:id
router.delete('/:id', async (req, res) => {
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
