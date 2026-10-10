/**
 * EduGenAI - Generation Policy Service
 * 
 * Centralizes and applies inference policies based on the requested condition:
 * - Economy: 15 inference steps, 1024x1024, guidance scale 5.0
 * - High Quality: 30 inference steps, 1024x1024, guidance scale 5.0
 * 
 * Crucial rule: The frontend does not directly control inference steps.
 * The backend selects and enforces steps to manage computational workload.
 */

function getPolicyConfiguration() {
  const economySteps = parseInt(process.env.ECONOMY_STEPS, 10) || 15;
  const highQualitySteps = parseInt(process.env.HIGH_QUALITY_STEPS, 10) || 30;

  return {
    economy: {
      condition: 'economy',
      steps: economySteps,
      width: 1024,
      height: 1024,
      defaultGuidanceScale: 5.0
    },
    high_quality: {
      condition: 'high_quality',
      steps: highQualitySteps,
      width: 1024,
      height: 1024,
      defaultGuidanceScale: 5.0
    }
  };
}

/**
 * Returns effective generation policy for a given condition
 * Overrides any client-supplied step settings to enforce server-side control.
 * 
 * @param {string} condition - 'economy' | 'high_quality'
 * @param {Object} userSettings - client settings (guidanceScale, seed)
 * @returns {Object} Effective policy settings
 */
function getEffectivePolicy(condition = 'economy', userSettings = {}) {
  const config = getPolicyConfiguration();
  const basePolicy = config[condition] || config.economy;

  // Enforce fixed dimensions 1024x1024 and server-enforced steps
  return {
    condition: basePolicy.condition,
    steps: basePolicy.steps,
    width: 1024,
    height: 1024,
    guidanceScale: userSettings.guidanceScale !== undefined && userSettings.guidanceScale !== null
      ? userSettings.guidanceScale
      : basePolicy.defaultGuidanceScale,
    seed: userSettings.seed
  };
}

module.exports = {
  getPolicyConfiguration,
  getEffectivePolicy
};
