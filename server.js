const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment from root and backend .env if available
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, 'backend', '.env'), override: true });

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

app.set('trust proxy', 1);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API routes under /api
try {
  const generationRoutes = require('./backend/routes/generationRoutes');
  const { errorHandler } = require('./backend/middleware/errorHandler');
  app.use('/api', generationRoutes);
  app.use('/api', errorHandler);
} catch (err) {
  console.warn('Failed to mount generation routes:', err.message);
}

// Serve static frontend assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback (compatible with Express 5 path-to-regexp)
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`EduGenAI server running on http://${HOST}:${PORT}`);
  });
}

module.exports = app;
