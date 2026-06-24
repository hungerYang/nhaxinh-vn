const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const DATA_PATH = path.resolve('/workspace/nhaxinh/src/data/products.json');

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
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const data = await readData();
    return res.json(data);
  } catch (err) {
    console.error('Error reading products:', err);
    return res.status(500).json({ error: 'Failed to read products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const data = await readData();
    const item = data.find(p => p.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Error reading product:', err);
    return res.status(500).json({ error: 'Failed to read product' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const data = await readData();
    const newItem = {
      ...req.body,
      id: generateId(),
      // Ensure affiliate fields have defaults
      platform: req.body.platform || 'shopee',
      affiliateUrl: req.body.affiliateUrl || req.body.shopeeUrl || '',
      affiliateEnabled: req.body.affiliateEnabled !== undefined ? req.body.affiliateEnabled : true,
    };
    data.push(newItem);
    await writeData(data);
    return res.status(201).json(newItem);
  } catch (err) {
    console.error('Error creating product:', err);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    data[index] = { ...data[index], ...req.body, id: req.params.id };
    await writeData(data);
    return res.json(data[index]);
  } catch (err) {
    console.error('Error updating product:', err);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const deleted = data.splice(index, 1)[0];
    await writeData(data);
    return res.json({ message: 'Product deleted', deleted });
  } catch (err) {
    console.error('Error deleting product:', err);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
