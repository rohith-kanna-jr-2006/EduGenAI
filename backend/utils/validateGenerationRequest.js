/**
 * EduGenAI - Request Validation Middleware & Validator
 * 
 * Validates generation requests for:
 * - prompt: required, non-empty, 3-1000 chars
 * - category: optional string
 * - constraints: optional array of strings
 * - condition: required / normalized ('economy' | 'high_quality')
 * - settings: width, height, guidanceScale, seed
 */

function validateGenerationPayload(body) {
  const errors = [];
  const { prompt, category, constraints, condition, settings } = body || {};

  // 1. Prompt validation
  if (prompt === undefined || prompt === null || typeof prompt !== 'string') {
    errors.push({ field: 'prompt', message: 'Prompt is required and must be a string.' });
  } else {
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      errors.push({ field: 'prompt', message: 'Prompt cannot be empty after trimming.' });
    } else if (trimmedPrompt.length < 3) {
      errors.push({ field: 'prompt', message: 'Prompt must be at least 3 characters long.' });
    } else if (trimmedPrompt.length > 1000) {
      errors.push({ field: 'prompt', message: 'Prompt exceeds maximum length of 1000 characters.' });
    }
  }

  // 2. Condition validation ('economy' vs 'high_quality')
  let normalizedCondition = 'economy';
  if (condition !== undefined && condition !== null) {
    if (typeof condition !== 'string') {
      errors.push({ field: 'condition', message: 'Condition must be a string ("economy" or "high_quality").' });
    } else {
      const cond = condition.toLowerCase().trim().replace(/[-]/g, '_');
      if (['economy', 'eco', 'low'].includes(cond)) {
        normalizedCondition = 'economy';
      } else if (['high_quality', 'high', 'highquality'].includes(cond)) {
        normalizedCondition = 'high_quality';
      } else {
        errors.push({
          field: 'condition',
          message: `Invalid condition "${condition}". Supported conditions are: "economy" and "high_quality".`
        });
      }
    }
  }

  // 3. Category validation (optional)
  let validatedCategory = 'education';
  if (category !== undefined && category !== null) {
    if (typeof category !== 'string' || category.trim().length === 0) {
      errors.push({ field: 'category', message: 'Category must be a non-empty string if provided.' });
    } else {
      validatedCategory = category.trim();
    }
  }

  // 4. Constraints validation (optional array of strings)
  let validatedConstraints = [];
  if (constraints !== undefined && constraints !== null) {
    if (!Array.isArray(constraints)) {
      errors.push({ field: 'constraints', message: 'Constraints must be an array of strings.' });
    } else {
      for (let i = 0; i < constraints.length; i++) {
        if (typeof constraints[i] !== 'string') {
          errors.push({ field: `constraints[${i}]`, message: 'Each constraint must be a string.' });
        } else {
          validatedConstraints.push(constraints[i].trim());
        }
      }
    }
  }

  // 5. Settings validation (optional object)
  const validatedSettings = {
    width: 1024,
    height: 1024,
    guidanceScale: normalizedCondition === 'high_quality' ? 7.5 : 5.0,
    seed: null
  };

  if (settings !== undefined && settings !== null) {
    if (typeof settings !== 'object' || Array.isArray(settings)) {
      errors.push({ field: 'settings', message: 'Settings must be an object.' });
    } else {
      if (settings.width !== undefined) {
        const w = parseInt(settings.width, 10);
        if (isNaN(w) || w < 256 || w > 2048) {
          errors.push({ field: 'settings.width', message: 'Width must be an integer between 256 and 2048.' });
        } else {
          validatedSettings.width = w;
        }
      }

      if (settings.height !== undefined) {
        const h = parseInt(settings.height, 10);
        if (isNaN(h) || h < 256 || h > 2048) {
          errors.push({ field: 'settings.height', message: 'Height must be an integer between 256 and 2048.' });
        } else {
          validatedSettings.height = h;
        }
      }

      if (settings.guidanceScale !== undefined) {
        const gs = parseFloat(settings.guidanceScale);
        if (isNaN(gs) || gs < 1.0 || gs > 20.0) {
          errors.push({ field: 'settings.guidanceScale', message: 'Guidance scale must be a number between 1.0 and 20.0.' });
        } else {
          validatedSettings.guidanceScale = gs;
        }
      }

      if (settings.seed !== undefined && settings.seed !== null) {
        const s = parseInt(settings.seed, 10);
        if (isNaN(s)) {
          errors.push({ field: 'settings.seed', message: 'Seed must be an integer if specified.' });
        } else {
          validatedSettings.seed = s;
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      prompt: prompt ? prompt.trim() : '',
      category: validatedCategory,
      constraints: validatedConstraints,
      condition: normalizedCondition,
      settings: validatedSettings
    }
  };
}

/**
 * Express middleware for generation request validation
 */
function validateGenerationRequest(req, res, next) {
  const result = validateGenerationPayload(req.body);

  if (!result.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request payload validation failed.',
        details: result.errors
      }
    });
  }

  // Attach sanitized and validated payload to req.validatedData
  req.validatedData = result.sanitized;
  next();
}

module.exports = {
  validateGenerationPayload,
  validateGenerationRequest
};
