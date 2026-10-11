/**
 * EduGenAI - Generation Request Validation Utility
 * 
 * Enforces strict validation for POST /api/generate:
 * - prompt: required, non-empty trimmed string, max 1000 chars
 * - category: allowed: education, art, general, science, design
 * - constraints: array of strings (max 10 items, max 100 chars each)
 * - condition: 'economy' | 'high_quality'
 * - settings: width == 1024, height == 1024, guidanceScale (1.0-20.0), seed (integer or auto-generated)
 */

const ALLOWED_CATEGORIES = [
  'education',
  'art',
  'general',
  'science',
  'design',
  'worksheet',
  'flashcard',
  'poster',
  'illustration'
];
const ALLOWED_CONDITIONS = ['economy', 'high_quality'];
const MAX_PROMPT_LENGTH = 1000;
const MAX_CONSTRAINTS_COUNT = 10;
const MAX_CONSTRAINT_LENGTH = 100;
const MIN_GUIDANCE_SCALE = 1.0;
const MAX_GUIDANCE_SCALE = 20.0;
const MAX_SEED_VALUE = 2147483647;

/**
 * Combines image prompt safely with constraints
 * @param {string} prompt 
 * @param {Array<string>} constraints 
 * @returns {string} combined prompt
 */
function combinePromptWithConstraints(prompt, constraints = []) {
  const trimmedPrompt = prompt.trim();
  if (!Array.isArray(constraints) || constraints.length === 0) {
    return trimmedPrompt;
  }
  const cleanConstraints = constraints
    .map((c) => (typeof c === 'string' ? c.trim() : ''))
    .filter((c) => c.length > 0);

  if (cleanConstraints.length === 0) {
    return trimmedPrompt;
  }

  return `${trimmedPrompt}, ${cleanConstraints.join(', ')}`;
}

/**
 * Validates generation request payload
 * @param {Object} body - Request body
 * @returns {Object} validation result { isValid, errors, sanitized }
 */
function validateGenerationPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: [{ field: 'body', message: 'Request body must be a valid JSON object.' }],
      sanitized: null
    };
  }

  const {
    prompt,
    category,
    constraints,
    condition,
    settings,
    gradeLevel,
    aspectRatio,
    modelMode,
    selectedModelId,
    selectedModel
  } = body;

  // 1. Prompt validation
  let validatedPrompt = '';
  if (prompt === undefined || prompt === null || typeof prompt !== 'string') {
    errors.push({ field: 'prompt', message: 'Prompt is required and must be a string.' });
  } else {
    validatedPrompt = prompt.trim();
    if (validatedPrompt.length === 0) {
      errors.push({ field: 'prompt', message: 'Prompt cannot be empty after trimming.' });
    } else if (validatedPrompt.length > MAX_PROMPT_LENGTH) {
      errors.push({
        field: 'prompt',
        message: `Prompt exceeds maximum allowed length of ${MAX_PROMPT_LENGTH} characters.`
      });
    }
  }

  // 2. Category validation
  let validatedCategory = 'worksheet';
  if (category !== undefined && category !== null) {
    if (typeof category !== 'string') {
      errors.push({ field: 'category', message: 'Category must be a string.' });
    } else {
      const lowerCategory = category.toLowerCase().trim();
      if (!ALLOWED_CATEGORIES.includes(lowerCategory)) {
        errors.push({
          field: 'category',
          message: `Unsupported category "${category}". Allowed categories are: ${ALLOWED_CATEGORIES.join(', ')}.`
        });
      } else {
        validatedCategory = lowerCategory;
      }
    }
  }

  // 3. Constraints validation
  let validatedConstraints = [];
  if (constraints !== undefined && constraints !== null) {
    if (!Array.isArray(constraints)) {
      errors.push({ field: 'constraints', message: 'Constraints must be an array of strings.' });
    } else if (constraints.length > MAX_CONSTRAINTS_COUNT) {
      errors.push({
        field: 'constraints',
        message: `Constraints array cannot exceed ${MAX_CONSTRAINTS_COUNT} items.`
      });
    } else {
      for (let i = 0; i < constraints.length; i++) {
        const item = constraints[i];
        if (typeof item !== 'string') {
          errors.push({
            field: `constraints[${i}]`,
            message: `Constraint at index ${i} must be a string.`
          });
        } else {
          const trimmedItem = item.trim();
          if (trimmedItem.length > MAX_CONSTRAINT_LENGTH) {
            errors.push({
              field: `constraints[${i}]`,
              message: `Constraint "${trimmedItem.substring(0, 20)}..." exceeds maximum length of ${MAX_CONSTRAINT_LENGTH} characters.`
            });
          } else if (trimmedItem.length > 0) {
            validatedConstraints.push(trimmedItem);
          }
        }
      }
    }
  }

  // 4. Condition validation (default to economy if not provided)
  let validatedCondition = 'economy';
  if (condition !== undefined && condition !== null) {
    if (typeof condition !== 'string') {
      errors.push({ field: 'condition', message: 'Condition must be a string.' });
    } else {
      const lowerCondition = condition.toLowerCase().trim();
      if (!ALLOWED_CONDITIONS.includes(lowerCondition)) {
        errors.push({
          field: 'condition',
          message: `Invalid condition "${condition}". Allowed conditions are: ${ALLOWED_CONDITIONS.join(', ')}.`
        });
      } else {
        validatedCondition = lowerCondition;
      }
    }
  }

  // 5. Settings validation
  const validatedSettings = {
    width: 1024,
    height: 1024,
    guidanceScale: 5.0,
    seed: Math.floor(Math.random() * MAX_SEED_VALUE)
  };

  if (settings !== undefined && settings !== null) {
    if (typeof settings !== 'object' || Array.isArray(settings)) {
      errors.push({ field: 'settings', message: 'Settings must be an object if provided.' });
    } else {
      // Width must be 1024
      if (settings.width !== undefined && settings.width !== null) {
        const widthNum = Number(settings.width);
        if (!Number.isInteger(widthNum) || widthNum !== 1024) {
          errors.push({
            field: 'settings.width',
            message: `Unsupported width ${settings.width}. Width must be exactly 1024 for SDXL.`
          });
        }
      }

      // Height must be 1024
      if (settings.height !== undefined && settings.height !== null) {
        const heightNum = Number(settings.height);
        if (!Number.isInteger(heightNum) || heightNum !== 1024) {
          errors.push({
            field: 'settings.height',
            message: `Unsupported height ${settings.height}. Height must be exactly 1024 for SDXL.`
          });
        }
      }

      // Guidance scale validation
      if (settings.guidanceScale !== undefined && settings.guidanceScale !== null) {
        const gs = Number(settings.guidanceScale);
        if (typeof gs !== 'number' || !Number.isFinite(gs) || gs < MIN_GUIDANCE_SCALE || gs > MAX_GUIDANCE_SCALE) {
          errors.push({
            field: 'settings.guidanceScale',
            message: `Guidance scale must be a finite number between ${MIN_GUIDANCE_SCALE} and ${MAX_GUIDANCE_SCALE}.`
          });
        } else {
          validatedSettings.guidanceScale = gs;
        }
      }

      // Seed validation
      if (settings.seed !== undefined && settings.seed !== null) {
        const s = Number(settings.seed);
        if (!Number.isInteger(s) || s < 0 || s > MAX_SEED_VALUE) {
          errors.push({
            field: 'settings.seed',
            message: `Seed must be an integer between 0 and ${MAX_SEED_VALUE}.`
          });
        } else {
          validatedSettings.seed = s;
        }
      }
    }
  }

  // Combine prompt with constraints safely
  const combinedPrompt = combinePromptWithConstraints(validatedPrompt, validatedConstraints);

  return {
    isValid: errors.length === 0,
    errors,
    sanitized: {
      prompt: validatedPrompt,
      combinedPrompt,
      category: validatedCategory,
      constraints: validatedConstraints,
      condition: validatedCondition,
      settings: validatedSettings,
      gradeLevel: typeof gradeLevel === 'string' ? gradeLevel : 'Grade 5 (Elementary)',
      aspectRatio: typeof aspectRatio === 'string' ? aspectRatio : '1:1',
      modelMode: typeof modelMode === 'string' ? modelMode : 'auto',
      selectedModelId: typeof selectedModelId === 'string' ? selectedModelId : null,
      selectedModel: typeof selectedModel === 'string' ? selectedModel : null
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
        message: 'Invalid generation request parameters.',
        details: result.errors
      }
    });
  }

  req.validatedData = result.sanitized;
  next();
}

module.exports = {
  ALLOWED_CATEGORIES,
  ALLOWED_CONDITIONS,
  combinePromptWithConstraints,
  validateGenerationPayload,
  validateGenerationRequest
};
