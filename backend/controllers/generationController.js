/**
 * EduGenAI - Generation Controller
 * 
 * Orchestrates request validation, generation policy enforcement,
 * relative compute estimation, SDXL model invocation, and history persistence.
 */

const { getEffectivePolicy } = require('../services/generationPolicyService');
const { calculateResourceEstimates, getQualityTiers: fetchQualityTiers } = require('../services/resourceEstimationService');
const { invokeModelService, checkModelHealth } = require('../services/modelService');
const { saveRecord, getHistory: fetchHistory, deleteRecord } = require('../services/historyService');

/**
 * Health check endpoint
 * GET /api/health
 */
async function healthCheck(req, res) {
  const modelCheck = await checkModelHealth();

  res.status(200).json({
    success: true,
    message: 'EduGenAI backend is running',
    modelService: {
      status: modelCheck.status,
      configured: modelCheck.configured
    }
  });
}

/**
 * Quality tiers and condition baselines endpoint
 * GET /api/quality-tiers (and GET /api/conditions)
 */
function getQualityTiers(req, res) {
  const tiersData = fetchQualityTiers();
  res.status(200).json(tiersData);
}

/**
 * Image generation endpoint
 * POST /api/generate (and POST /api/generation/create)
 */
async function generate(req, res, next) {
  try {
    const validatedData = req.validatedData || req.body;
    const { prompt, combinedPrompt, category, constraints, condition, settings } = validatedData;

    // 1. Enforce server-side policy (Economy: 15 steps, High Quality: 30 steps)
    const effectivePolicy = getEffectivePolicy(condition, settings);

    // 2. Compute illustrative relative compute proxy estimates
    const resourceEstimates = calculateResourceEstimates(condition);

    // 3. Invoke external SDXL model service via HTTP
    // Never returns fake image URLs if generation fails (throws ModelServiceError)
    const modelResult = await invokeModelService({
      prompt: combinedPrompt,
      width: effectivePolicy.width,
      height: effectivePolicy.height,
      steps: effectivePolicy.steps,
      guidanceScale: effectivePolicy.guidanceScale,
      seed: effectivePolicy.seed
    });

    // 4. Persist generation record to disk without secrets
    const record = saveRecord({
      prompt,
      combinedPrompt,
      category,
      constraints,
      condition: effectivePolicy.condition,
      steps: effectivePolicy.steps,
      guidanceScale: effectivePolicy.guidanceScale,
      seed: effectivePolicy.seed,
      image: modelResult.image,
      measurements: modelResult.measurements,
      resourceEstimates
    });

    // 5. Return standardized JSON response
    return res.status(200).json({
      success: true,
      image: {
        url: modelResult.image.url,
        data: modelResult.image.data
      },
      metadata: {
        tier: effectivePolicy.condition,
        category: category,
        resolution: `${effectivePolicy.width}x${effectivePolicy.height}`,
        steps: effectivePolicy.steps,
        guidanceScale: effectivePolicy.guidanceScale,
        seed: effectivePolicy.seed,
        generationSeconds: modelResult.measurements.generationSeconds,
        peakGpuMemoryGiB: modelResult.measurements.peakGpuMemoryGiB,
        relativeUnits: resourceEstimates.relativeUnits,
        baselineUnits: resourceEstimates.baselineUnits,
        estimatedRelativeReductionPercent: resourceEstimates.estimatedRelativeReductionPercent,
        measurementType: resourceEstimates.measurementType
      },
      // Compatible payload for existing React frontend state
      data: {
        id: record.id,
        title: prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt,
        prompt,
        category,
        modelUsed: `SDXL (${effectivePolicy.condition === 'economy' ? 'Economy 15-Steps' : 'High Quality 30-Steps'})`,
        status: 'completed',
        downloadUrl: modelResult.image.url || modelResult.image.data,
        dimensions: `${effectivePolicy.width} x ${effectivePolicy.height}`,
        createdAt: record.createdAt,
        resources: {
          steps: effectivePolicy.steps,
          relativeUnits: resourceEstimates.relativeUnits,
          savingsPercent: resourceEstimates.estimatedRelativeReductionPercent
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Generation history endpoint
 * GET /api/history (and GET /api/generation/history)
 */
function getHistory(req, res) {
  const { limit, offset, search, category, status } = req.query;
  const historyData = fetchHistory({ limit, offset, search, category, status });
  res.status(200).json(historyData);
}

/**
 * Delete generation record endpoint
 * DELETE /api/generation/:id
 */
function deleteGeneration(req, res) {
  const { id } = req.params;
  const deleted = deleteRecord(id);
  res.status(200).json({ success: true, deleted });
}

module.exports = {
  healthCheck,
  getQualityTiers,
  generate,
  getHistory,
  deleteGeneration
};
