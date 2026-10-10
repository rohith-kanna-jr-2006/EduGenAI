/**
 * EduGenAI - Generation Policy Service
 * 
 * Selects and applies energy-aware generation policies based on user condition:
 * - 'economy': Lower computational effort (fewer inference steps, lower relative compute units)
 * - 'high_quality': Full computational effort (more inference steps for high visual fidelity)
 * 
 * Provides transparent computational estimates without falsely claiming
 * that relative compute units are direct hardware electricity meter readings.
 */

function getBaselineConfig() {
  const economySteps = parseInt(process.env.ECONOMY_STEPS, 10) || 15;
  const highQualitySteps = parseInt(process.env.HIGH_QUALITY_STEPS, 10) || 50;
  const ecoEnergyWh = parseFloat(process.env.ECO_ENERGY_WH) || 0.5;
  const highEnergyWh = parseFloat(process.env.HIGH_ENERGY_WH) || 2.0;
  const gridCarbonIntensity = parseFloat(process.env.GRID_CARBON_INTENSITY) || 475; // g CO2e / kWh

  return {
    economySteps,
    highQualitySteps,
    ecoEnergyWh,
    highEnergyWh,
    gridCarbonIntensity
  };
}

/**
 * Builds prompt and negative prompt incorporating category style and user constraints
 */
function compilePromptAndConstraints(prompt, category, constraints = []) {
  let enhancedPrompt = prompt.trim();
  const negativePromptTokens = [];

  // Category-specific positive styling
  if (category) {
    const cat = category.toLowerCase();
    if (cat === 'worksheet') {
      enhancedPrompt += ', educational coloring worksheet, clean black and white line art, high contrast outline, pedagogical illustration';
      negativePromptTokens.push('color', 'gradient', 'shading', 'photorealistic', 'clutter');
    } else if (cat === 'poster') {
      enhancedPrompt += ', educational classroom infographic poster, clear visual hierarchy, curriculum standard';
    } else if (cat === 'flashcard') {
      enhancedPrompt += ', educational flashcard illustration, isolated focal object, white background, simple composition';
    } else if (cat === 'illustration') {
      enhancedPrompt += ', textbook educational illustration, accurate scientific details, clean rendering';
    }
  }

  // Handle constraints
  if (Array.isArray(constraints) && constraints.length > 0) {
    constraints.forEach((c) => {
      const lower = c.toLowerCase().trim();
      if (lower === 'no text' || lower === 'no labels' || lower.includes('no text')) {
        negativePromptTokens.push('text', 'watermark', 'words', 'letters', 'labels', 'signature', 'font', 'typography');
      } else if (lower.includes('dark background')) {
        enhancedPrompt += ', dark background, dark mode aesthetic';
      } else if (lower.includes('white background')) {
        enhancedPrompt += ', isolated on plain pure white background';
        negativePromptTokens.push('complex background', 'scenery');
      } else {
        enhancedPrompt += `, ${c}`;
      }
    });
  }

  // Default educational negative prompt
  negativePromptTokens.push('low quality', 'blurry', 'distorted', 'disfigured', 'inappropriate', 'nsfw');

  return {
    enhancedPrompt,
    negativePrompt: Array.from(new Set(negativePromptTokens)).join(', ')
  };
}

/**
 * Selects generation policy based on user condition and computes resource savings
 * 
 * @param {string} condition - 'economy' | 'high_quality'
 * @param {string} category - Image category
 * @param {Array<string>} constraints - User constraints
 * @param {Object} settings - Generation settings (width, height, guidanceScale, seed)
 * @returns {Object} Selected policy and execution parameters
 */
function selectPolicy(condition = 'economy', category = 'education', constraints = [], settings = {}) {
  const {
    economySteps,
    highQualitySteps,
    ecoEnergyWh,
    highEnergyWh,
    gridCarbonIntensity
  } = getBaselineConfig();

  const isEconomy = condition !== 'high_quality';

  // Inference steps configuration
  const inferenceSteps = isEconomy ? economySteps : highQualitySteps;
  const computationalEffort = isEconomy ? 'low' : 'high';

  // Relative Compute Units calculation (using High Quality 50 steps as baseline)
  const relativeComputeUnits = inferenceSteps;
  const relativeComputeSavedUnits = Math.max(0, highQualitySteps - inferenceSteps);
  const relativeComputeSavingsPercentage = highQualitySteps > 0
    ? parseFloat(((relativeComputeSavedUnits / highQualitySteps) * 100).toFixed(1))
    : 0;

  // Illustrative Energy Estimates
  const energyWh = isEconomy ? ecoEnergyWh : highEnergyWh;
  const energySavedWh = isEconomy
    ? parseFloat(Math.max(0, highEnergyWh - ecoEnergyWh).toFixed(3))
    : 0;
  const energySavedPercentage = isEconomy && highEnergyWh > 0
    ? parseFloat(((energySavedWh / highEnergyWh) * 100).toFixed(1))
    : 0;

  // Estimated carbon emissions in grams CO2e (energyWh / 1000 * carbon intensity)
  const estimatedCarbonEmissionsGCO2e = parseFloat(
    ((energyWh / 1000) * gridCarbonIntensity).toFixed(3)
  );

  // Compile prompt and negative constraints
  const { enhancedPrompt, negativePrompt } = compilePromptAndConstraints(
    settings.prompt || '',
    category,
    constraints
  );

  return {
    condition: isEconomy ? 'economy' : 'high_quality',
    category,
    constraints,
    policy: {
      inferenceSteps,
      computationalEffort,
      relativeComputeUnits,
      relativeComputeSavedUnits,
      relativeComputeSavingsPercentage,
      estimatedEnergyWh: energyWh,
      energySavedWh,
      energySavedPercentage,
      estimatedCarbonEmissionsGCO2e,
      isEstimated: true,
      disclaimer: 'Compute units and energy values are model-based comparative estimates. Reducing inference steps reduces computational effort, but actual physical electricity consumption depends on specific server hardware and data center infrastructure.'
    },
    modelParameters: {
      prompt: enhancedPrompt,
      originalPrompt: settings.prompt || '',
      negativePrompt,
      numInferenceSteps: inferenceSteps,
      guidanceScale: settings.guidanceScale || (isEconomy ? 5.0 : 7.5),
      width: settings.width || 1024,
      height: settings.height || 1024,
      seed: settings.seed !== undefined && settings.seed !== null
        ? settings.seed
        : Math.floor(Math.random() * 1000000)
    }
  };
}

module.exports = {
  getBaselineConfig,
  compilePromptAndConstraints,
  selectPolicy
};
