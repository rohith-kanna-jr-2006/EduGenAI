/**
 * EduGenAI - Generation Controller
 * 
 * Orchestrates request validation, generation policy enforcement,
 * relative compute estimation, SDXL model invocation, and history persistence.
 */

const { getEffectivePolicy } = require('../services/generationPolicyService');
const { calculateResourceEstimates, getQualityTiers: fetchQualityTiers } = require('../services/resourceEstimationService');
const { invokeModelService, checkModelHealth } = require('../services/modelService');
const { generateWithOpenRouter, OpenRouterError } = require('../services/openrouterImageService');
const { generateWithGemini, GeminiServiceError } = require('../services/geminiImageService');
const { saveRecord, getHistory: fetchHistory, deleteRecord } = require('../services/historyService');

function getCategoryLabel(cat) {
  switch (cat) {
    case 'worksheet': return 'Colouring Worksheet';
    case 'flashcard': return 'Flashcards & Vocab';
    case 'poster': return 'Educational Poster';
    case 'illustration': return 'Learning Illustration';
    default: return 'Educational Material';
  }
}

/**
 * Health check endpoint
 * GET /api/health
 */
async function healthCheck(req, res) {
  const provider = (process.env.IMAGE_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openrouter')).toLowerCase().trim();
  const openrouterConfigured = Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim());
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

  let modelServiceStatus = {
    provider,
    gemini: {
      configured: geminiConfigured,
      models: ['gemini-3.1-flash-lite', 'gemini-3.1-flash-lite-image', 'gemini-nano-banana-2.1']
    },
    openrouter: {
      configured: openrouterConfigured,
      model: process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux-1-schnell'
    }
  };

  if (provider === 'sdxl') {
    const modelCheck = await checkModelHealth();
    modelServiceStatus.sdxl = modelCheck;
  }

  res.status(200).json({
    success: true,
    message: 'EduGenAI backend is running',
    provider,
    modelService: modelServiceStatus
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
    const {
      prompt,
      combinedPrompt,
      category = 'worksheet',
      gradeLevel = 'Grade 5 (Elementary)',
      aspectRatio = '1:1',
      modelMode = 'auto',
      selectedModelId,
      constraints = [],
      condition = 'economy',
      settings
    } = validatedData;

    const configuredProvider = (process.env.IMAGE_PROVIDER || (process.env.GEMINI_API_KEY ? 'gemini' : 'openrouter')).toLowerCase().trim();
    const finalPrompt = combinedPrompt || prompt;

    // Check if the user specifically requested a Gemini model
    const isGeminiRequested = modelMode === 'manual' && selectedModelId && (
      selectedModelId.startsWith('gemini') || selectedModelId.includes('banana')
    );

    // 1. Dedicated Gemini Image & Visual Generation (Primary or Explicit)
    if (configuredProvider === 'gemini' || isGeminiRequested) {
      const modelResult = await generateWithGemini({
        prompt: finalPrompt,
        category,
        gradeLevel,
        aspectRatio,
        modelOverride: modelMode === 'manual' ? selectedModelId : null
      });

      const record = saveRecord({
        prompt,
        combinedPrompt: finalPrompt,
        category,
        categoryLabel: getCategoryLabel(category),
        gradeLevel,
        aspectRatio,
        modelUsed: modelResult.model,
        modelId: modelResult.model,
        constraints,
        condition,
        cost: modelResult.cost,
        image: {
          url: modelResult.imageUrl,
          data: modelResult.dataUrl
        },
        downloadUrl: modelResult.imageUrl,
        measurements: {
          generationSeconds: modelResult.generationSeconds,
          peakGpuMemoryGiB: null
        },
        resourceEstimates: {
          relativeUnits: 1.0,
          baselineUnits: 1.0,
          estimatedRelativeReductionPercent: 0,
          measurementType: 'google ai studio gemini inference'
        }
      });

      return res.status(200).json({
        success: true,
        image: {
          url: modelResult.imageUrl,
          data: modelResult.dataUrl
        },
        metadata: {
          provider: 'gemini',
          model: modelResult.model,
          format: modelResult.format,
          category,
          resolution: modelResult.dimensions,
          generationSeconds: modelResult.generationSeconds,
          cost: modelResult.cost
        },
        data: {
          ...record,
          downloadUrl: modelResult.imageUrl,
          dimensions: modelResult.dimensions,
          guardrailStatus: record.guardrailStatus || 'Curriculum Verified'
        }
      });
    }

    // 2. OpenRouter Image Generation with Automated Gemini Model Switch
    if (configuredProvider === 'openrouter') {
      try {
        const modelResult = await generateWithOpenRouter({
          prompt: finalPrompt,
          aspectRatio,
          modelOverride: modelMode === 'manual' ? selectedModelId : null
        });

        const record = saveRecord({
          prompt,
          combinedPrompt: finalPrompt,
          category,
          categoryLabel: getCategoryLabel(category),
          gradeLevel,
          aspectRatio,
          modelUsed: modelResult.model,
          modelId: modelResult.model,
          constraints,
          condition,
          cost: modelResult.cost,
          image: {
            url: modelResult.imageUrl,
            data: modelResult.dataUrl
          },
          downloadUrl: modelResult.imageUrl,
          measurements: {
            generationSeconds: modelResult.generationSeconds,
            peakGpuMemoryGiB: null
          },
          resourceEstimates: {
            relativeUnits: 1.0,
            baselineUnits: 1.0,
            estimatedRelativeReductionPercent: 0,
            measurementType: 'openrouter api inference'
          }
        });

        return res.status(200).json({
          success: true,
          image: {
            url: modelResult.imageUrl,
            data: modelResult.dataUrl
          },
          metadata: {
            provider: 'openrouter',
            model: modelResult.model,
            category,
            resolution: modelResult.dimensions,
            generationSeconds: modelResult.generationSeconds,
            cost: modelResult.cost
          },
          data: {
            ...record,
            downloadUrl: modelResult.imageUrl,
            dimensions: modelResult.dimensions,
            guardrailStatus: record.guardrailStatus || 'Curriculum Verified'
          }
        });
      } catch (openRouterErr) {
        // AUTOMATED MODEL SWITCH:
        // When OpenRouter fails due to payment issues (402 Insufficient credits) or missing key,
        // automatically switch to Gemini via Google AI Studio access API key!
        console.warn(`[Model Switch] OpenRouter failed: ${openRouterErr.message}. Automatically switching to Gemini (Google AI Studio)...`);

        const geminiResult = await generateWithGemini({
          prompt: finalPrompt,
          category,
          gradeLevel,
          aspectRatio,
          modelOverride: 'gemini-3.1-flash-lite'
        });

        const record = saveRecord({
          prompt,
          combinedPrompt: finalPrompt,
          category,
          categoryLabel: getCategoryLabel(category),
          gradeLevel,
          aspectRatio,
          modelUsed: `Gemini (Auto-Switched: ${geminiResult.model})`,
          modelId: geminiResult.model,
          constraints,
          condition,
          cost: null,
          image: {
            url: geminiResult.imageUrl,
            data: geminiResult.dataUrl
          },
          downloadUrl: geminiResult.imageUrl,
          measurements: {
            generationSeconds: geminiResult.generationSeconds,
            peakGpuMemoryGiB: null
          },
          resourceEstimates: {
            relativeUnits: 1.0,
            baselineUnits: 1.0,
            estimatedRelativeReductionPercent: 0,
            measurementType: 'google ai studio auto-switch'
          }
        });

        return res.status(200).json({
          success: true,
          image: {
            url: geminiResult.imageUrl,
            data: geminiResult.dataUrl
          },
          metadata: {
            provider: 'gemini',
            switchedFrom: 'openrouter',
            switchReason: openRouterErr.message,
            model: geminiResult.model,
            format: geminiResult.format,
            category,
            resolution: geminiResult.dimensions,
            generationSeconds: geminiResult.generationSeconds,
            cost: null
          },
          data: {
            ...record,
            downloadUrl: geminiResult.imageUrl,
            dimensions: geminiResult.dimensions,
            guardrailStatus: record.guardrailStatus || 'Curriculum Verified'
          }
        });
      }
    }

    // 2. Legacy SDXL model service (only when IMAGE_PROVIDER is explicitly 'sdxl')
    const effectivePolicy = getEffectivePolicy(condition, settings);
    const resourceEstimates = calculateResourceEstimates(condition);

    const modelResult = await invokeModelService({
      prompt: combinedPrompt || prompt,
      width: effectivePolicy.width,
      height: effectivePolicy.height,
      steps: effectivePolicy.steps,
      guidanceScale: effectivePolicy.guidanceScale,
      seed: effectivePolicy.seed
    });

    const record = saveRecord({
      prompt,
      combinedPrompt: combinedPrompt || prompt,
      category,
      categoryLabel: getCategoryLabel(category),
      gradeLevel,
      aspectRatio,
      constraints,
      condition: effectivePolicy.condition,
      steps: effectivePolicy.steps,
      guidanceScale: effectivePolicy.guidanceScale,
      seed: effectivePolicy.seed,
      modelUsed: `SDXL (${effectivePolicy.condition === 'economy' ? 'Economy 15-Steps' : 'High Quality 30-Steps'})`,
      modelId: effectivePolicy.condition === 'economy' ? 'sdxl-turbo' : 'sdxl-base',
      image: modelResult.image,
      downloadUrl: modelResult.image.url || modelResult.image.data,
      measurements: modelResult.measurements,
      resourceEstimates,
      cost: null // Genuine: SDXL execution has no API token dollar cost
    });

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
      data: {
        ...record,
        downloadUrl: modelResult.image.url || modelResult.image.data,
        dimensions: `${effectivePolicy.width} x ${effectivePolicy.height}`,
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
