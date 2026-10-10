/**
 * EcoGen AI - Resource Estimation Service
 * 
 * Computes illustrative estimates of energy consumption, computational effort,
 * carbon emissions (g CO2e), and energy savings for AI image generation.
 * 
 * Note: These figures are model-based illustrative estimates for comparative 
 * educational and transparency purposes, not physical hardware sensor readings.
 */

/**
 * Retrieves configurable baseline values from environment variables
 */
function getBaselineConfig() {
  const ecoEnergyWh = parseFloat(process.env.ECO_ENERGY_WH) || 0.5;
  const highEnergyWh = parseFloat(process.env.HIGH_ENERGY_WH) || 2.0;
  const gridCarbonIntensity = parseFloat(process.env.GRID_CARBON_INTENSITY) || 475; // g CO2e / kWh

  return {
    ecoEnergyWh,
    highEnergyWh,
    gridCarbonIntensity
  };
}

/**
 * Normalizes quality input string
 * @param {string} quality - 'eco' or 'high' / 'high_quality'
 * @returns {string} normalized tier: 'eco' or 'high'
 */
function normalizeQuality(quality) {
  if (!quality || typeof quality !== 'string') return 'eco';
  const cleaned = quality.toLowerCase().trim().replace(/[-_]/g, '');
  if (cleaned.includes('high')) return 'high';
  return 'eco';
}

/**
 * Calculates resource estimates and savings relative to the High Quality baseline
 * 
 * @param {string} quality - 'eco' or 'high'
 * @returns {Object} resource estimation metrics
 */
function calculateResourceEstimates(quality) {
  const { ecoEnergyWh, highEnergyWh, gridCarbonIntensity } = getBaselineConfig();
  const tier = normalizeQuality(quality);

  let energyWh;
  let computationalEffort;
  let energySavedWh;
  let energySavedPercentage;

  if (tier === 'high') {
    energyWh = highEnergyWh;
    computationalEffort = 'high';
    // When High Quality is selected, savings relative to baseline is zero
    energySavedWh = 0;
    energySavedPercentage = 0;
  } else {
    // Eco tier
    energyWh = ecoEnergyWh;
    computationalEffort = 'low';
    energySavedWh = parseFloat(Math.max(0, highEnergyWh - ecoEnergyWh).toFixed(3));
    energySavedPercentage = highEnergyWh > 0 
      ? parseFloat(((energySavedWh / highEnergyWh) * 100).toFixed(1))
      : 0;
  }

  // Defensible estimate of carbon emissions:
  // kWh = energyWh / 1000
  // Emissions (g CO2e) = kWh * gridCarbonIntensity (g CO2e / kWh)
  const carbonEmissionsGramsCO2e = parseFloat(
    ((energyWh / 1000) * gridCarbonIntensity).toFixed(3)
  );

  return {
    energyWh,
    estimated: true,
    computationalEffort,
    energySavedWh,
    energySavedPercentage,
    carbonEmissionsGramsCO2e,
    disclaimer: 'Illustrative estimates based on configurable GPU baseline models, not measured electricity consumption.'
  };
}

/**
 * Returns available quality tier specifications and configuration for GET /api/quality-tiers
 */
function getQualityTiers() {
  const { ecoEnergyWh, highEnergyWh, gridCarbonIntensity } = getBaselineConfig();

  const ecoSavings = parseFloat(Math.max(0, highEnergyWh - ecoEnergyWh).toFixed(3));
  const ecoSavingsPercent = highEnergyWh > 0
    ? parseFloat(((ecoSavings / highEnergyWh) * 100).toFixed(1))
    : 0;

  const ecoCarbon = parseFloat(((ecoEnergyWh / 1000) * gridCarbonIntensity).toFixed(3));
  const highCarbon = parseFloat(((highEnergyWh / 1000) * gridCarbonIntensity).toFixed(3));

  return {
    success: true,
    qualityTiers: [
      {
        id: 'eco',
        name: 'Eco Mode',
        description: 'Optimized for energy efficiency using fewer inference steps and reduced computational overhead.',
        computationalEffort: 'low',
        estimatedEnergyWh: ecoEnergyWh,
        energySavedWh: ecoSavings,
        energySavedPercentage: ecoSavingsPercent,
        estimatedCarbonEmissionsGCO2e: ecoCarbon,
        isBaseline: false
      },
      {
        id: 'high',
        name: 'High Quality Mode',
        description: 'Maximum visual fidelity and resolution using full computational effort.',
        computationalEffort: 'high',
        estimatedEnergyWh: highEnergyWh,
        energySavedWh: 0,
        energySavedPercentage: 0,
        estimatedCarbonEmissionsGCO2e: highCarbon,
        isBaseline: true
      }
    ],
    baseline: {
      highQualityBaselineEnergyWh: highEnergyWh,
      gridCarbonIntensityGPerKwh: gridCarbonIntensity,
      estimated: true,
      disclaimer: 'Resource values are illustrative estimates based on configurable models and are not direct hardware measurements.'
    }
  };
}

module.exports = {
  getBaselineConfig,
  normalizeQuality,
  calculateResourceEstimates,
  getQualityTiers
};
