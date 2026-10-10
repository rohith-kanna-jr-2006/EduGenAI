/**
 * EduGenAI - SDXL Model Service Integration
 * 
 * Manages HTTP communication between the Express backend and the external
 * Python-based Stable Diffusion XL (SDXL) model service.
 * 
 * Configured via MODEL_SERVICE_URL in .env.
 * 
 * Critical integrity rules:
 * - Never returns a fake successful response.
 * - Never invents image URLs or placeholders if model generation fails.
 * - Surfaces genuine generation duration and peak GPU memory only when available.
 */

const axios = require('axios');

class ModelServiceError extends Error {
  constructor(message, statusCode = 503, details = null) {
    super(message);
    this.name = 'ModelServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Sends generation parameters to the external SDXL Model Service via HTTP
 * 
 * @param {Object} params - Validated generation parameters
 * @param {string} params.prompt - Combined prompt with constraints
 * @param {number} params.width - Fixed at 1024
 * @param {number} params.height - Fixed at 1024
 * @param {number} params.steps - 15 (economy) or 30 (high_quality)
 * @param {number} params.guidanceScale - Guidance scale (default 5.0)
 * @param {number} params.seed - Integer seed
 * @returns {Promise<Object>} Generated image payload and genuine measurements
 */
async function invokeModelService(params) {
  const modelServiceUrl = process.env.MODEL_SERVICE_URL || process.env.SDXL_MODEL_ENDPOINT;

  if (!modelServiceUrl || modelServiceUrl.trim() === '') {
    throw new ModelServiceError(
      'MODEL_SERVICE_URL is not configured. Please set MODEL_SERVICE_URL in backend/.env to point to your active SDXL inference endpoint (e.g. Google Colab ngrok tunnel or local GPU server).',
      503,
      { code: 'MODEL_SERVICE_NOT_CONFIGURED' }
    );
  }

  const timeoutMs = parseInt(process.env.GENERATION_TIMEOUT_MS, 10) || 180000; // 180s default for SDXL

  // Payload format matching SDXL inference API
  const requestPayload = {
    prompt: params.prompt,
    width: params.width,
    height: params.height,
    steps: params.steps,
    num_inference_steps: params.steps, // diffusers compatibility alias
    guidance_scale: params.guidanceScale,
    seed: params.seed
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  if (process.env.MODEL_SERVICE_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.MODEL_SERVICE_API_KEY.trim()}`;
  }

  const startTime = Date.now();

  try {
    const response = await axios.post(modelServiceUrl, requestPayload, {
      timeout: timeoutMs,
      headers
    });

    const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    const responseData = response.data;

    // Validate that the model returned image data or an accessible URL
    const rawImage = responseData?.image || responseData?.image_url || responseData?.url || responseData?.data;

    if (!rawImage) {
      throw new ModelServiceError(
        'The SDXL model service completed the request, but did not return any image data or accessible image URL.',
        502,
        { upstreamResponse: responseData }
      );
    }

    let imageUrl = null;
    let imageData = null;

    if (typeof rawImage === 'string') {
      if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
        imageUrl = rawImage;
      } else if (rawImage.startsWith('data:image/')) {
        imageData = rawImage;
        imageUrl = rawImage; // accessible in browser img tags
      } else {
        // Raw base64 string without data prefix
        imageData = `data:image/jpeg;base64,${rawImage}`;
        imageUrl = imageData;
      }
    }

    // Genuine measurements extraction (only when genuinely reported)
    let generationSeconds = elapsedSeconds;
    if (responseData.metrics?.generation_seconds !== undefined && responseData.metrics.generation_seconds !== null) {
      generationSeconds = Number(responseData.metrics.generation_seconds);
    } else if (responseData.metrics?.inference_time_seconds !== undefined && responseData.metrics.inference_time_seconds !== null) {
      generationSeconds = Number(responseData.metrics.inference_time_seconds);
    }

    let peakGpuMemoryGiB = null;
    if (responseData.metrics?.peak_gpu_memory_gib !== undefined && responseData.metrics.peak_gpu_memory_gib !== null) {
      peakGpuMemoryGiB = Number(responseData.metrics.peak_gpu_memory_gib);
    } else if (responseData.metrics?.gpu_memory_allocated_mb !== undefined && responseData.metrics.gpu_memory_allocated_mb !== null) {
      peakGpuMemoryGiB = parseFloat((responseData.metrics.gpu_memory_allocated_mb / 1024).toFixed(2));
    }

    return {
      image: {
        url: imageUrl,
        data: imageData
      },
      measurements: {
        generationSeconds,
        peakGpuMemoryGiB
      }
    };
  } catch (error) {
    if (error instanceof ModelServiceError) {
      throw error;
    }

    // Request timeout (HTTP 504)
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new ModelServiceError(
        `SDXL model generation timed out after ${timeoutMs / 1000} seconds. The upstream inference pipeline may be overloaded or initializing.`,
        504,
        { timeoutMs, endpoint: modelServiceUrl }
      );
    }

    // Connection refused / unreachable endpoint (HTTP 503)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new ModelServiceError(
        `Cannot connect to SDXL model service at "${modelServiceUrl}". Please verify that your Python/Google Colab SDXL inference server is running and accessible.`,
        503,
        { endpoint: modelServiceUrl, error: error.message }
      );
    }

    // Upstream server responded with an error (HTTP 502 / upstream status)
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail || error.response.data?.error || error.response.statusText;
      throw new ModelServiceError(
        `SDXL model service failed with status ${status}: ${detail}`,
        status >= 500 ? 502 : status,
        { upstreamStatus: status, upstreamData: error.response.data }
      );
    }

    // Generic network / communication error (HTTP 502)
    throw new ModelServiceError(
      `Failed to communicate with SDXL model service: ${error.message}`,
      502,
      { error: error.message }
    );
  }
}

/**
 * Checks connectivity to the model service without triggering an image generation
 */
async function checkModelHealth() {
  const modelServiceUrl = process.env.MODEL_SERVICE_URL || process.env.SDXL_MODEL_ENDPOINT;

  if (!modelServiceUrl) {
    return {
      configured: false,
      status: 'not_configured',
      message: 'MODEL_SERVICE_URL is not set in environment variables'
    };
  }

  const healthUrl = modelServiceUrl.replace(/\/generate\/?$/, '/health');

  try {
    const res = await axios.get(healthUrl, { timeout: 3000 });
    return {
      configured: true,
      status: 'online',
      endpoint: modelServiceUrl,
      details: res.data
    };
  } catch (err) {
    return {
      configured: true,
      status: 'offline',
      endpoint: modelServiceUrl,
      error: err.message
    };
  }
}

module.exports = {
  invokeModelService,
  checkModelHealth,
  ModelServiceError
};
