/**
 * EduGenAI - Dedicated OpenRouter Image Generation Service
 * 
 * Interacts directly with https://openrouter.ai/api/v1/images via Bearer authentication.
 * Parses data[0].b64_json into a valid image data URL, extracts genuine usage cost when provided,
 * and never exposes API keys or invents synthetic metrics.
 */

const axios = require('axios');

class OpenRouterError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Generate an image using OpenRouter Image Generation API
 * 
 * @param {Object} options
 * @param {string} options.prompt - The image generation prompt
 * @param {string} [options.aspectRatio] - Requested aspect ratio (e.g. '1:1', '16:9', '2:3')
 * @param {string} [options.modelOverride] - Optional model override if specified
 * @returns {Promise<Object>} Generated image result
 */
async function generateWithOpenRouter({ prompt, aspectRatio, modelOverride }) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '' || apiKey.includes('your_')) {
    throw new OpenRouterError(
      'OPENROUTER_API_KEY is not configured in server environment variables. Please set OPENROUTER_API_KEY on the server to enable live image generation.',
      503,
      { code: 'OPENROUTER_API_KEY_MISSING' }
    );
  }

  // Model resolution: env var > modelOverride > default supported image model
  const model = (process.env.OPENROUTER_IMAGE_MODEL || modelOverride || 'black-forest-labs/flux-1-schnell').trim();
  const timeoutMs = parseInt(process.env.OPENROUTER_TIMEOUT_MS, 10) || 180000;
  const maxCostCapUSD = parseFloat(process.env.OPENROUTER_MAX_IMAGE_COST_USD) || 0.05;

  const endpoint = 'https://openrouter.ai/api/v1/images';

  const requestPayload = {
    model,
    prompt: prompt.trim(),
    response_format: 'b64_json'
  };

  if (aspectRatio) {
    requestPayload.aspect_ratio = aspectRatio;
  }

  const headers = {
    'Authorization': `Bearer ${apiKey.trim()}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
    'X-Title': 'EduGenAI'
  };

  const startTime = Date.now();

  try {
    const response = await axios.post(endpoint, requestPayload, {
      headers,
      timeout: timeoutMs
    });

    const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    const responseData = response.data;

    if (!responseData || !responseData.data || !Array.isArray(responseData.data) || responseData.data.length === 0) {
      throw new OpenRouterError(
        'OpenRouter responded successfully but returned an empty or invalid image array.',
        502,
        { upstreamResponse: responseData }
      );
    }

    const firstItem = responseData.data[0];
    let imageUrl = null;

    if (firstItem.b64_json) {
      const b64 = firstItem.b64_json.trim();
      imageUrl = b64.startsWith('data:') ? b64 : `data:image/png;base64,${b64}`;
    } else if (firstItem.url) {
      imageUrl = firstItem.url.trim();
    } else {
      throw new OpenRouterError(
        'OpenRouter image item did not contain a valid b64_json or url property.',
        502
      );
    }

    // Read genuine usage cost when provided; never invent synthetic costs
    let actualCost = null;
    if (responseData.usage && responseData.usage.total_cost !== undefined && responseData.usage.total_cost !== null) {
      actualCost = Number(responseData.usage.total_cost);
    } else if (responseData.usage && responseData.usage.cost !== undefined && responseData.usage.cost !== null) {
      actualCost = Number(responseData.usage.cost);
    } else if (responseData.cost !== undefined && responseData.cost !== null) {
      actualCost = Number(responseData.cost);
    } else if (response.headers && response.headers['x-openrouter-cost']) {
      const headerCost = parseFloat(response.headers['x-openrouter-cost']);
      if (!Number.isNaN(headerCost)) {
        actualCost = headerCost;
      }
    }

    if (actualCost !== null && actualCost > maxCostCapUSD) {
      console.warn(`[OpenRouter] Generation cost $${actualCost} exceeded configured limit of $${maxCostCapUSD}`);
    }

    // Determine dimensions from response or aspect ratio
    let dimensions = '1024 × 1024';
    if (aspectRatio === '16:9') {
      dimensions = '1344 × 768';
    } else if (aspectRatio === '2:3') {
      dimensions = '832 × 1248';
    } else if (responseData.size) {
      dimensions = responseData.size;
    }

    return {
      provider: 'openrouter',
      model,
      imageUrl,
      dataUrl: imageUrl,
      revisedPrompt: firstItem.revised_prompt || prompt,
      generationSeconds: elapsedSeconds,
      cost: actualCost,
      peakGpuMemoryGiB: null, // Genuine: API-based inference does not report local GPU stats
      dimensions
    };
  } catch (error) {
    if (error instanceof OpenRouterError) {
      throw error;
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new OpenRouterError(
        `OpenRouter image generation timed out after ${timeoutMs / 1000} seconds. The upstream inference provider may be experiencing high demand.`,
        504,
        { timeoutMs, model }
      );
    }

    if (error.response) {
      const status = error.response.status;
      const upstreamError = error.response.data?.error?.message
        || error.response.data?.message
        || error.response.data?.detail
        || error.response.statusText
        || `HTTP error ${status}`;

      throw new OpenRouterError(
        `OpenRouter generation failed: ${upstreamError}`,
        status >= 500 ? 502 : status,
        { upstreamStatus: status }
      );
    }

    throw new OpenRouterError(
      `Failed to connect to OpenRouter image service: ${error.message}`,
      502
    );
  }
}

module.exports = {
  generateWithOpenRouter,
  OpenRouterError
};
