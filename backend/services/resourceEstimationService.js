/**
 * EduGenAI - Resource Estimation Service
 * 
 * Computes comparative computational effort using illustrative relative compute units:
 * - Economy: 0.5 relative units (50% estimated relative reduction)
 * - High Quality: 1.0 relative units (0% estimated relative reduction)
 * 
 * Strict requirement:
 * Does NOT return fabricated electricity consumption (Wh) or carbon emission values.
 * Clearly labels all proxy metrics as:
 * "illustrative relative compute proxy, not measured energy"
 */

function getResourceBaselineConfig() {
  const economyUnits = parseFloat(process.env.ECONOMY_RELATIVE_UNITS) || 0.5;
  const highQualityUnits = parseFloat(process.env.HIGH_QUALITY_RELATIVE_UNITS) || 1.0;

  return {
    economyUnits,
    highQualityUnits
  };
}

/**
 * Calculates relative computational estimates for a given condition
 * 
 * @param {string} condition - 'economy' | 'high_quality'
 * @returns {Object} Relative compute estimation metrics
 */
function calculateResourceEstimates(condition = 'economy') {
  const { economyUnits, highQualityUnits } = getResourceBaselineConfig();

  const isEconomy = condition === 'economy';
  const relativeUnits = isEconomy ? economyUnits : highQualityUnits;
  const baselineUnits = highQualityUnits;

  // Relative Reduction Percentage = ((Baseline - Selected) / Baseline) * 100
  const estimatedRelativeReductionPercent = baselineUnits > 0
    ? Math.round(((baselineUnits - relativeUnits) / baselineUnits) * 100)
    : 0;

  return {
    relativeUnits,
    baselineUnits,
    estimatedRelativeReductionPercent,
    measurementType: 'illustrative relative compute proxy, not measured energy'
  };
}

/**
 * Returns available conditions and effective policies for GET /api/quality-tiers
 */
function getQualityTiers() {
  const { economyUnits, highQualityUnits } = getResourceBaselineConfig();
  const economySteps = parseInt(process.env.ECONOMY_STEPS, 10) || 15;
  const highQualitySteps = parseInt(process.env.HIGH_QUALITY_STEPS, 10) || 30;

  return {
    success: true,
    tiers: [
      {
        condition: 'economy',
        steps: economySteps,
        width: 1024,
        height: 1024,
        relativeUnits: economyUnits
      },
      {
        condition: 'high_quality',
        steps: highQualitySteps,
        width: 1024,
        height: 1024,
        relativeUnits: highQualityUnits
      }
    ],
    metadata: {
      baselineCondition: 'high_quality',
      baselineUnits: highQualityUnits,
      measurementType: 'illustrative relative compute proxy, not measured energy',
      disclaimer: 'Relative units represent an illustrative compute proxy based on inference steps. They do not represent physical electricity measurements or guaranteed kilowatt-hour reductions in every environment.'
    }
  };
}

module.exports = {
  getResourceBaselineConfig,
  calculateResourceEstimates,
  getQualityTiers
};
