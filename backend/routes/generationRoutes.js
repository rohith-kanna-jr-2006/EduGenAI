/**
 * EcoGen AI - Generation Routes
 * 
 * Maps endpoints to controller actions and applies validation/rate-limiting middleware.
 */

const express = require('express');
const router = express.Router();

const {
  healthCheck,
  getQualityTiers,
  generate,
  getHistory
} = require('../controllers/generationController');

const { validateGenerateRequest } = require('../middleware/validateRequest');
const { generateLimiter } = require('../middleware/rateLimiter');

// GET /api/health - Server health and operational status
router.get('/health', healthCheck);

// GET /api/quality-tiers - List available tiers and baseline metrics
router.get('/quality-tiers', getQualityTiers);

// POST /api/generate - Validate, generate image, compute savings
router.post('/generate', generateLimiter, validateGenerateRequest, generate);

// GET /api/history - Retrieve generation log records
router.get('/history', getHistory);

module.exports = router;
