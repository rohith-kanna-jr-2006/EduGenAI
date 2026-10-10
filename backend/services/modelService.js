/**
 * EduGenAI - Model Service
 * 
 * Manages HTTP communication between Express backend and the external
 * Python-based Stable Diffusion XL (SDXL) model service (e.g., hosted in Google Colab,
 * RunPod, or local GPU server).
 * 
 * Strict safety rules:
 * - Never returns fake or mock images if inference fails.
 * - Never claims images were generated if the model service is unreachable.
 * - Captures actual performance measurements from the model service where provided.
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
 * Sends generation parameters to the external SDXL Model Service
 * 
 * @param {Object} modelParams - compiled parameters from generationPolicyService
 * @returns {Promise<Object>} Generated image payload and actual runtime measurements
 */
async function invokeSdxlModel(modelParams) {
  const endpoint = process.env.SDXL_MODEL_ENDPOINT || 'http://localhost:8000/generate';
  const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 90000; // 90s for SDXL diffusion

  const payload = {
    prompt: modelParams.prompt,
    negative_prompt: modelParams.negativePrompt,
    num_inference_steps: modelParams.numInferenceSteps,
    guidance_scale: modelParams.guidanceScale,
    width: modelParams.width,
    height: modelParams.height,
    seed: modelParams.seed
  };

  const startTime = Date.now();

  try {
    const response = await axios.post(endpoint, payload, {
      timeout: timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SDXL_API_KEY ? { 'Authorization': `Bearer ${process.env.SDXL_API_KEY}` } : {})
      }
    });

    const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));
    const data = response.data;

    // Validate model response payload
    const imageUrl = data?.image || data?.image_url || data?.url;
    if (!imageUrl) {
      throw new ModelServiceError(
        'The SDXL model service returned a response, but no valid image data or URL was found.',
        502,
        data
      );
    }

    // Extract actual performance measurements provided by Python SDXL backend
    const measurements = {
      measuredInferenceTimeSeconds: data.metrics?.inference_time_seconds || elapsedSeconds,
      device: data.metrics?.device || data.device || 'SDXL Engine',
      actualSteps: data.metrics?.steps || modelParams.numInferenceSteps,
      memoryAllocatedMb: data.metrics?.gpu_memory_allocated_mb || null
    };

    return {
      success: true,
      image: {
        url: imageUrl
      },
      measurements
    };
  } catch (error) {
    // If request timed out
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new ModelServiceError(
        `SDXL model inference timed out after ${timeoutMs / 1000} seconds. The model server may be overloaded or cold-starting.`,
        504,
        { endpoint, timeoutMs }
      );
    }

    // If connection refused or not found (Colab / server not running)
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new ModelServiceError(
        `Cannot connect to SDXL model service at "${endpoint}". Please verify that your Python/Google Colab SDXL inference server is running and accessible.`,
        503,
        {
          endpoint,
          solution: 'Start your SDXL inference service (e.g. running the provided Colab script) and update SDXL_MODEL_ENDPOINT in backend/.env'
        }
      );
    }

    // If model service returned an HTTP error code (e.g. 500, 422)
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.detail || error.response.data?.error || error.response.statusText;
      throw new ModelServiceError(
        `SDXL model service responded with error (${status}): ${errorMsg}`,
        status >= 500 ? 502 : status,
        error.response.data
      );
    }

    // Generic error
    throw new ModelServiceError(
      `Failed to communicate with SDXL model service: ${error.message}`,
      503,
      { endpoint, originalError: error.message }
    );
  }
}

/**
 * Checks connectivity to the SDXL model service endpoint
 */
async function checkModelServiceHealth() {
  const endpoint = process.env.SDXL_MODEL_ENDPOINT || 'http://localhost:8000/generate';
  const healthUrl = endpoint.replace(/\/generate\/?$/, '/health');

  try {
    const res = await axios.get(healthUrl, { timeout: 4000 });
    return {
      status: 'online',
      endpoint,
      details: res.data
    };
  } catch (err) {
    return {
      status: 'offline',
      endpoint,
      error: err.message
    };
  }
}

module.exports = {
  invokeSdxlModel,
  checkModelServiceHealth,
  ModelServiceError
};
