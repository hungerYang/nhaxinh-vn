const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Load .env.admin manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env.admin');
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.slice(0, eqIndex).trim();
        const value = trimmed.slice(eqIndex + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
} catch (err) {
  console.warn('Could not load .env.admin, using defaults:', err.message);
}

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const submissionRoutes = require('./routes/submissions');
const productRoutes = require('./routes/products');
const rebuildRoutes = require('./routes/rebuild');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');
const messageRoutes = require('./routes/messages');
const styleRoutes = require('./routes/styles');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:4000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4000',
    'https://hungeryang.github.io',
  ],
  credentials: true,
}));
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes (no auth middleware required)
app.use('/api/auth', authRoutes);

// User public routes (register & login - no auth middleware)
app.use('/api/users', userRoutes);

// Comment routes (GET is public, POST/DELETE require auth via route-level middleware)
app.use('/api/comments', commentRoutes);

// Protected API routes
app.use('/api/articles', authMiddleware, articleRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/rebuild', authMiddleware, rebuildRoutes);

// Upload route (user auth for image upload, used by submit form)
app.use('/api', uploadRoutes);

// Message routes (user auth handled at route level)
app.use('/api/messages', messageRoutes);

// Style routes (GET is public, POST/PUT/DELETE protected via route-level middleware)
app.use('/api/styles', styleRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`NhàXinh Admin API server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
