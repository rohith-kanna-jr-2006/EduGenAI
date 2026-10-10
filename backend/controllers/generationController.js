/**
 * EcoGen AI - Generation Controller
 * 
 * Handles HTTP requests for:
 * - GET  /api/health
 * - GET  /api/quality-tiers
 * - POST /api/generate
 * - GET  /api/history
 */

const {
  calculateResourceEstimates,
  getQualityTiers: fetchQualityTiers,
  normalizeQuality
} = require('../services/resourceEstimationService');

const {
  generateImage: requestImageGeneration
} = require('../services/imageGenerationService');

const {
  saveRecord,
  getHistory: fetchHistory
} = require('../services/historyService');

/**
 * Health check endpoint
 * GET /api/health
 */
function healthCheck(req, res) {
  res.status(200).json({
    success: true,
    status: 'healthy',
    message: 'EcoGen AI backend is operational and ready to serve requests.',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    activeProvider: process.env.IMAGE_PROVIDER || 'openai'
  });
}

/**
 * Quality tiers and resource baseline endpoint
 * GET /api/quality-tiers
 */
function getQualityTiers(req, res) {
  const tiersData = fetchQualityTiers();
  res.status(200).json(tiersData);
}

/**
 * Image generation and resource estimation endpoint
 * POST /api/generate
 */
async function generate(req, res, next) {
  try {
    const { prompt, quality = 'eco' } = req.body;
    const normalizedQuality = normalizeQuality(quality);

    // 1. Calculate resource consumption and savings estimates
    const resourceEstimates = calculateResourceEstimates(normalizedQuality);

    // 2. Generate actual image via selected provider
    // Note: If no API key is configured or generation fails, this throws
    // and is caught without returning fake success responses
    const generationResult = await requestImageGeneration(prompt, normalizedQuality);

    // 3. Persist record to history
    saveRecord({
      prompt,
      quality: normalizedQuality,
      image: { url: generationResult.url },
      resources: resourceEstimates,
      provider: generationResult.provider,
      model: generationResult.model
    });

    // 4. Return standard response format
    return res.status(200).json({
      success: true,
      image: {
        url: generationResult.url
      },
      quality: normalizedQuality,
      resources: {
        energyWh: resourceEstimates.energyWh,
        estimated: true,
        computationalEffort: resourceEstimates.computationalEffort,
        energySavedWh: resourceEstimates.energySavedWh,
        energySavedPercentage: resourceEstimates.energySavedPercentage,
        carbonEmissionsGramsCO2e: resourceEstimates.carbonEmissionsGramsCO2e
      },
      message: 'Image generated successfully. Resource values are illustrative estimates.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generation history endpoint
 * GET /api/history
 */
function getHistory(req, res) {
  const { limit, offset } = req.query;
  const historyData = fetchHistory(limit, offset);
  res.status(200).json(historyData);
}

module.exports = {
  healthCheck,
  getQualityTiers,
  generate,
  getHistory
};
