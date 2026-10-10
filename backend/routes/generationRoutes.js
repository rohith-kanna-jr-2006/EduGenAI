/**
 * EduGenAI - Generation Routes
 * 
 * Maps endpoints to controller actions and middlewares.
 * Supports both /api/generate and existing React frontend endpoints (/generation/create, etc.)
 */

const express = require('express');
const router = express.Router();

const {
  healthCheck,
  getQualityTiers,
  generate,
  getHistory,
  deleteGeneration
} = require('../controllers/generationController');

const { validateGenerationRequest } = require('../utils/validateGenerationRequest');
const { generateLimiter } = require('../middleware/rateLimiter');

// GET /api/health - Backend and SDXL model health
router.get('/health', healthCheck);

// GET /api/quality-tiers & GET /api/conditions - Available conditions and baselines
router.get('/quality-tiers', getQualityTiers);
router.get('/conditions', getQualityTiers);

// POST /api/generate & POST /api/generation/create - Run energy-aware generation
router.post('/generate', generateLimiter, validateGenerationRequest, generate);
router.post('/generation/create', generateLimiter, validateGenerationRequest, generate);

// GET /api/history & GET /api/generation/history - Retrieval
router.get('/history', getHistory);
router.get('/generation/history', getHistory);

// DELETE /api/generation/:id - Delete record
router.delete('/generation/:id', deleteGeneration);

// ==========================================
// Educational System Endpoints (for React Frontend compatibility)
// ==========================================

// GET /api/models - Available models
router.get('/models', (req, res) => {
  res.status(200).json({
    models: [
      {
        id: 'sdxl-turbo',
        name: 'SDXL Turbo Education',
        provider: 'Stability AI / Edu Fine-tune',
        specialty: 'High-speed energy-efficient generation (15 steps)',
        latency: '2.1s avg',
        costPerImage: '$0.0024',
        status: 'operational',
        rating: '98.9% K-12 Safe'
      },
      {
        id: 'sdxl-base',
        name: 'Stable Diffusion XL Base 1.0',
        provider: 'Stability AI',
        specialty: 'Full fidelity curriculum diagrams (50 steps)',
        latency: '4.5s avg',
        costPerImage: '$0.0058',
        status: 'operational',
        rating: '99.4% K-12 Safe'
      }
    ]
  });
});

// GET /api/rules & POST /api/rules - Dynamic routing policies
let rulesStore = [
  {
    id: 'rule_1',
    name: 'Print Worksheet Vector Line-Art Optimizer',
    category: 'worksheet',
    targetModel: 'SDXL Turbo (Economy)',
    priority: 1,
    active: true,
    condition: 'Prompt contains "coloring", "worksheet", or "outline"',
    maxCostCap: '$0.0030',
    latencyTarget: '< 2.5s'
  },
  {
    id: 'rule_2',
    name: 'High School STEM Diagram Specialist',
    category: 'illustration',
    targetModel: 'SDXL Base 1.0 (High Quality)',
    priority: 2,
    active: true,
    condition: 'Grade >= 9 OR domain == "anatomy/physics"',
    maxCostCap: '$0.0060',
    latencyTarget: '< 5.0s'
  }
];

router.get('/rules', (req, res) => {
  res.status(200).json({ rules: rulesStore });
});

router.post('/rules', (req, res) => {
  const newRule = { id: 'rule_' + Date.now(), ...req.body, active: true };
  rulesStore.push(newRule);
  res.status(201).json({ success: true, rule: newRule });
});

router.patch('/rules/:id', (req, res) => {
  const rule = rulesStore.find((r) => r.id === req.params.id);
  if (rule && req.body.active !== undefined) {
    rule.active = req.body.active;
  }
  res.status(200).json({ success: true, rule });
});

// GET /api/budget/summary - Budget analytics
router.get('/budget/summary', (req, res) => {
  res.status(200).json({
    totalAllocatedTokens: 50000,
    usedTokens: 14250,
    remainingTokens: 35750,
    projectedSavingsPercent: 38.4,
    totalCostUSD: 48.62,
    savingsUSD: 30.15
  });
});

// GET /api/analytics - Analytics trends
router.get('/analytics', (req, res) => {
  res.status(200).json({
    totalGenerations: 1248,
    averageCostPerImage: 0.0039,
    totalSpendUSD: 48.62,
    savingsPercent: 38.4
  });
});

// GET & PATCH /api/quality/reviews - Quality reviews
router.get('/quality/reviews', (req, res) => {
  res.status(200).json({ pending: [], approved: [], total: 0 });
});

// POST /api/auth/login & /api/auth/signup - Authentication
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  res.status(200).json({
    token: 'jwt_edugenai_' + Buffer.from(email || 'educator').toString('base64'),
    user: {
      id: 'usr_edu_101',
      name: email ? email.split('@')[0] : 'Educator',
      email: email || 'educator@school.edu',
      role: 'Curriculum Director'
    }
  });
});

router.post('/auth/signup', (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({
    token: 'jwt_edugenai_' + Buffer.from(email || 'new_user').toString('base64'),
    user: { id: 'usr_' + Date.now(), name: name || 'Educator', email }
  });
});

module.exports = router;
