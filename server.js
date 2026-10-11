const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
try {
  const generationRoutes = require('./backend/routes/generationRoutes');
  app.use('/api', generationRoutes);
} catch (err) {
  console.warn('Failed to mount generation routes:', err.message);
}

// Serve static frontend assets
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`EduGenAI server running on http://${HOST}:${PORT}`);
});
