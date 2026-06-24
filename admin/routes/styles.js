const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const STYLES_FILE = path.join(__dirname, '..', '..', 'src', 'data', 'styles.json');

// Helper: read styles from JSON file
function readStyles() {
  try {
    const data = fs.readFileSync(STYLES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write styles to JSON file
function writeStyles(styles) {
  const dir = path.dirname(STYLES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STYLES_FILE, JSON.stringify(styles, null, 2), 'utf-8');
}

// GET /api/styles - Return all styles (public, no auth needed)
router.get('/', (req, res) => {
  const styles = readStyles();
  res.json({ success: true, styles });
});

// POST /api/styles - Add new style (requires admin auth)
router.post('/', (req, res) => {
  const { id, name, nameEn, nameZh, color, icon, type } = req.body;

  if (!id || !name || !type) {
    return res.status(400).json({ success: false, error: 'id, name, and type are required' });
  }

  const styles = readStyles();

  // Check for duplicate id
  if (styles.find(s => s.id === id)) {
    return res.status(409).json({ success: false, error: 'Style with this id already exists' });
  }

  const newStyle = {
    id,
    name: name || '',
    nameEn: nameEn || '',
    nameZh: nameZh || '',
    color: color || '#6B7280',
    icon: icon || '',
    type: type || 'style',
  };

  styles.push(newStyle);
  writeStyles(styles);

  res.status(201).json({ success: true, style: newStyle });
});

// PUT /api/styles/:id - Update a style (requires admin auth)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, nameEn, nameZh, color, icon, type } = req.body;

  const styles = readStyles();
  const index = styles.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Style not found' });
  }

  if (name !== undefined) styles[index].name = name;
  if (nameEn !== undefined) styles[index].nameEn = nameEn;
  if (nameZh !== undefined) styles[index].nameZh = nameZh;
  if (color !== undefined) styles[index].color = color;
  if (icon !== undefined) styles[index].icon = icon;
  if (type !== undefined) styles[index].type = type;

  writeStyles(styles);

  res.json({ success: true, style: styles[index] });
});

// DELETE /api/styles/:id - Delete a style (requires admin auth)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const styles = readStyles();
  const index = styles.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Style not found' });
  }

  styles.splice(index, 1);
  writeStyles(styles);

  res.json({ success: true, message: 'Style deleted' });
});

module.exports = router;
