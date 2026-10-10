/**
 * EcoGen AI - Request Validation Middleware
 * 
 * Validates request payload for POST /api/generate
 */

function validateGenerateRequest(req, res, next) {
  const { prompt, quality } = req.body || {};

  // Validate prompt
  if (prompt === undefined || prompt === null || typeof prompt !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        field: 'prompt',
        message: 'The "prompt" field is required and must be a string.'
      }
    });
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        field: 'prompt',
        message: 'The "prompt" field cannot be empty.'
      }
    });
  }

  if (trimmedPrompt.length > 1000) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        field: 'prompt',
        message: 'The "prompt" field exceeds maximum length of 1000 characters.'
      }
    });
  }

  // Validate quality tier if provided
  if (quality !== undefined && quality !== null) {
    if (typeof quality !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'quality',
          message: 'The "quality" field must be a string ("eco" or "high").'
        }
      });
    }

    const normalized = quality.toLowerCase().trim().replace(/[-_]/g, '');
    const validTiers = ['eco', 'high', 'highquality'];
    if (!validTiers.includes(normalized)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          field: 'quality',
          message: `Invalid quality tier "${quality}". Supported tiers are: "eco" and "high".`
        }
      });
    }
  }

  // Attach sanitized fields to req.body
  req.body.prompt = trimmedPrompt;
  req.body.quality = quality ? quality.trim() : 'eco';

  next();
}

module.exports = {
  validateGenerateRequest
};
