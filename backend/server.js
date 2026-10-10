/**
 * EcoGen AI - Backend Server Entry Point
 * 
 * Express application server for Energy-Efficient AI Image Generation.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const generationRoutes = require('./routes/generationRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ==========================================
// CORS Configuration
// ==========================================
// Allow requests from FRONTEND_URL, local Vite (5173), and Create React App (3000)
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser clients (curl, Postman) or matching origins
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In development mode, allow localhost on any port
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy does not allow access from origin ${origin}`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// ==========================================
// Body Parsing Middleware
// ==========================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ==========================================
// API Routes
// ==========================================
// Mount all generation and resource routes under /api
app.use('/api', generationRoutes);

// Root route with informative metadata
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'EcoGen AI API',
    description: 'Energy-Efficient AI Image Generation System Backend',
    version: '1.0.0',
    documentation: '/api/quality-tiers',
    healthCheck: '/api/health',
    status: 'online'
  });
});

// ==========================================
// Error Handling
// ==========================================
// 404 Handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// ==========================================
// Server Initialization
// ==========================================
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🌱 EcoGen AI Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Allowed Frontend Origin: ${FRONTEND_URL}`);
  console.log(`🤖 Active Image Provider: ${process.env.IMAGE_PROVIDER || 'openai'}`);
  console.log(`⚡ Eco Baseline: ${process.env.ECO_ENERGY_WH || '0.5'} Wh | High Baseline: ${process.env.HIGH_ENERGY_WH || '2.0'} Wh`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, closing EcoGen AI backend gracefully...');
  server.close(() => {
    console.log('EcoGen AI server terminated.');
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, closing EcoGen AI backend gracefully...');
  server.close(() => {
    console.log('EcoGen AI server terminated.');
  });
});

module.exports = app;
