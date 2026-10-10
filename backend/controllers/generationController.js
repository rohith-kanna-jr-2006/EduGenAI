/**
 * EduGenAI - Generation Controller
 * 
 * Orchestrates request validation, energy-aware generation policy selection,
 * SDXL model invocation, and history persistence.
 */

const { selectPolicy } = require('../services/generationPolicyService');
const { invokeSdxlModel, checkModelServiceHealth } = require('../services/modelService');
const { saveRecord, getHistory: fetchHistory, deleteRecord } = require('../services/historyService');

/**
 * Health check endpoint
 * GET /api/health
 */
async function healthCheck(req, res) {
  const modelHealth = await checkModelServiceHealth();

  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'EduGenAI Backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    modelService: {
      endpoint: process.env.SDXL_MODEL_ENDPOINT || 'http://localhost:8000/generate',
      status: modelHealth.status
    }
  });
}

/**
 * Available conditions and resource baselines endpoint
 * GET /api/quality-tiers or GET /api/conditions
 */
function getConditions(req, res) {
  const economySteps = parseInt(process.env.ECONOMY_STEPS, 10) || 15;
  const highQualitySteps = parseInt(process.env.HIGH_QUALITY_STEPS, 10) || 50;
  const ecoEnergyWh = parseFloat(process.env.ECO_ENERGY_WH) || 0.5;
  const highEnergyWh = parseFloat(process.env.HIGH_ENERGY_WH) || 2.0;
  const gridCarbonIntensity = parseFloat(process.env.GRID_CARBON_INTENSITY) || 475;

  const ecoSavingsWh = parseFloat(Math.max(0, highEnergyWh - ecoEnergyWh).toFixed(3));
  const ecoSavingsPercent = highEnergyWh > 0 ? parseFloat(((ecoSavingsWh / highEnergyWh) * 100).toFixed(1)) : 0;

  res.status(200).json({
    success: true,
    conditions: [
      {
        id: 'economy',
        name: 'Economy Mode',
        description: 'Optimized for sustainability and speed using fewer inference steps to reduce computational effort.',
        inferenceSteps: economySteps,
        computationalEffort: 'low',
        relativeComputeUnits: economySteps,
        relativeComputeSavedUnits: highQualitySteps - economySteps,
        relativeComputeSavingsPercentage: highQualitySteps > 0 ? ((highQualitySteps - economySteps) / highQualitySteps) * 100 : 0,
        estimatedEnergyWh: ecoEnergyWh,
        energySavedWh: ecoSavingsWh,
        energySavedPercentage: ecoSavingsPercent,
        estimatedCarbonGCO2e: parseFloat(((ecoEnergyWh / 1000) * gridCarbonIntensity).toFixed(3))
      },
      {
        id: 'high_quality',
        name: 'High Quality Mode',
        description: 'Maximum visual detail and fidelity using full inference steps.',
        inferenceSteps: highQualitySteps,
        computationalEffort: 'high',
        relativeComputeUnits: highQualitySteps,
        relativeComputeSavedUnits: 0,
        relativeComputeSavingsPercentage: 0,
        estimatedEnergyWh: highEnergyWh,
        energySavedWh: 0,
        energySavedPercentage: 0,
        estimatedCarbonGCO2e: parseFloat(((highEnergyWh / 1000) * gridCarbonIntensity).toFixed(3))
      }
    ],
    baseline: {
      highQualityBaselineSteps: highQualitySteps,
      highQualityBaselineEnergyWh: highEnergyWh,
      disclaimer: 'Compute units and energy values are model-based comparative estimates. Reducing inference steps reduces GPU compute workload, but actual physical electricity consumption depends on runtime hardware and data center infrastructure.'
    }
  });
}

/**
 * Image generation endpoint
 * POST /api/generate and POST /api/generation/create
 */
async function generate(req, res, next) {
  try {
    const payload = req.validatedData || req.body;
    const { prompt, category, constraints, condition, settings } = payload;

    // 1. Select generation policy based on user condition
    const policyDecision = selectPolicy(condition, category, constraints, {
      ...settings,
      prompt
    });

    // 2. Invoke the external SDXL Model Service via HTTP
    // Will throw ModelServiceError if offline, timeout, or failed (no mock images!)
    const modelResult = await invokeSdxlModel(policyDecision.modelParameters);

    // 3. Persist record to history
    const record = saveRecord({
      prompt,
      category,
      constraints,
      condition: policyDecision.condition,
      image: modelResult.image,
      policy: policyDecision.policy,
      measurements: modelResult.measurements,
      settings: policyDecision.modelParameters
    });

    // 4. Return response compatible with both API specification and React frontend
    return res.status(200).json({
      success: true,
      image: {
        url: modelResult.image.url
      },
      condition: policyDecision.condition,
      category: policyDecision.category,
      policy: policyDecision.policy,
      measurements: modelResult.measurements,
      data: {
        id: record.id,
        title: prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt,
        prompt,
        category: category || 'worksheet',
        gradeLevel: req.body.gradeLevel || 'Standard Curriculum',
        modelUsed: `SDXL (${policyDecision.condition === 'economy' ? 'Eco' : 'HQ'})`,
        status: 'completed',
        downloadUrl: modelResult.image.url,
        dimensions: `${policyDecision.modelParameters.width} x ${policyDecision.modelParameters.height}`,
        createdAt: record.createdAt,
        resources: policyDecision.policy
      },
      message: 'Image generated successfully via SDXL pipeline.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * History endpoint
 * GET /api/history and GET /api/generation/history
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
  getConditions,
  generate,
  getHistory,
  deleteGeneration
};
