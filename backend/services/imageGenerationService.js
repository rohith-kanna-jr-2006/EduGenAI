/**
 * EcoGen AI - Modular Image Generation Service
 * 
 * Supports real AI image generation providers with true computational effort
 * differentiation between Eco and High Quality tiers.
 * 
 * Supported Providers:
 * 1. OpenAI (DALL-E 3 standard vs hd, or DALL-E 2 512x512 vs 1024x1024)
 * 2. Hugging Face (Inference API with steps and resolution parameters)
 * 3. Stability AI (Text-to-Image with step and resolution control)
 * 4. Pollinations (Zero-key open AI provider option)
 */

class ApiKeyMissingError extends Error {
  constructor(provider, customMessage) {
    super(
      customMessage ||
      `AI Image Generation API key is missing for provider "${provider}". Please configure IMAGE_API_KEY in backend/.env.`
    );
    this.name = 'ApiKeyMissingError';
    this.statusCode = 503;
    this.provider = provider;
    this.guide = `To fix this:\n1. Open backend/.env\n2. Set IMAGE_PROVIDER=${provider}\n3. Set IMAGE_API_KEY=<your_${provider}_api_key>\n4. Restart the backend server.`;
  }
}

class GenerationProviderError extends Error {
  constructor(message, statusCode = 502, providerDetails = null) {
    super(message);
    this.name = 'GenerationProviderError';
    this.statusCode = statusCode;
    this.providerDetails = providerDetails;
  }
}

/**
 * Generate image using OpenAI DALL-E API
 */
async function generateWithOpenAI(prompt, quality, timeoutMs) {
  const apiKey = process.env.IMAGE_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    throw new ApiKeyMissingError('openai', 
      'OpenAI API key is missing. Please add your OpenAI API key (sk-...) to IMAGE_API_KEY in backend/.env to generate images.'
    );
  }

  const model = process.env.IMAGE_MODEL || 'dall-e-3';
  const isDallE3 = model.toLowerCase().includes('dall-e-3');

  let payload;
  if (isDallE3) {
    // DALL-E 3 differentiates computational effort via 'quality': 'standard' vs 'hd'
    payload = {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: quality === 'high' ? 'hd' : 'standard',
      response_format: 'url'
    };
  } else {
    // DALL-E 2 differentiates via resolution: 512x512 vs 1024x1024
    payload = {
      model: 'dall-e-2',
      prompt: prompt,
      n: 1,
      size: quality === 'high' ? '1024x1024' : '512x512',
      response_format: 'url'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || `OpenAI API returned status ${response.status}`;
      throw new GenerationProviderError(
        `OpenAI Image Generation failed: ${errorMsg}`,
        response.status === 401 ? 401 : 502,
        data?.error
      );
    }

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new GenerationProviderError('OpenAI did not return a valid image URL in response.');
    }

    return {
      url: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt || prompt,
      provider: 'openai',
      model: payload.model,
      settings: {
        qualitySetting: isDallE3 ? payload.quality : `${payload.size}`,
        computationalTier: quality
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new GenerationProviderError(`OpenAI request timed out after ${timeoutMs / 1000}s`, 504);
    }
    throw err;
  }
}

/**
 * Generate image using Hugging Face Inference API
 */
async function generateWithHuggingFace(prompt, quality, timeoutMs) {
  const apiKey = process.env.IMAGE_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_')) {
    throw new ApiKeyMissingError('huggingface', 
      'Hugging Face API token is missing. Please add your token (hf_...) to IMAGE_API_KEY in backend/.env to generate images.'
    );
  }

  const model = process.env.IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';
  const endpoint = `https://api-inference.huggingface.co/models/${model}`;

  // Computational effort differentiation:
  // Eco: 15 inference steps, 512x512 resolution
  // High: 40 inference steps, 1024x1024 resolution
  const steps = quality === 'high' ? 40 : 15;
  const width = quality === 'high' ? 1024 : 512;
  const height = quality === 'high' ? 1024 : 512;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: steps,
          width,
          height
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson = null;
      try { errorJson = JSON.parse(errorText); } catch (_) {}
      const msg = errorJson?.error || errorText || `Hugging Face returned status ${response.status}`;
      throw new GenerationProviderError(`Hugging Face API failed: ${msg}`, response.status === 401 ? 401 : 502);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const dataUrl = `data:${contentType};base64,${base64}`;

    return {
      url: dataUrl,
      provider: 'huggingface',
      model,
      settings: {
        steps,
        resolution: `${width}x${height}`,
        computationalTier: quality
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new GenerationProviderError(`Hugging Face request timed out after ${timeoutMs / 1000}s`, 504);
    }
    throw err;
  }
}

/**
 * Generate image using Pollinations.ai (Free Open-Access Provider)
 * Useful for development and demonstration without requiring a paid API key
 */
async function generateWithPollinations(prompt, quality, timeoutMs) {
  // Computational effort differentiation:
  // Eco: 512x512, turbo model
  // High: 1024x1024, default model
  const width = quality === 'high' ? 1024 : 512;
  const height = quality === 'high' ? 1024 : 512;
  const seed = Math.floor(Math.random() * 1000000);
  const model = quality === 'high' ? 'flux' : 'turbo';

  const encodedPrompt = encodeURIComponent(prompt.trim());
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Verify that the generated image is accessible and actually produced
    const checkResponse = await fetch(imageUrl, {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!checkResponse.ok) {
      throw new GenerationProviderError(
        `Pollinations provider failed to generate image (status ${checkResponse.status}).`,
        502
      );
    }

    const contentType = checkResponse.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      throw new GenerationProviderError('Pollinations returned non-image content.', 502);
    }

    return {
      url: imageUrl,
      provider: 'pollinations',
      model,
      settings: {
        resolution: `${width}x${height}`,
        computationalTier: quality
      }
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new GenerationProviderError(`Pollinations request timed out after ${timeoutMs / 1000}s`, 504);
    }
    throw err;
  }
}

/**
 * Main dispatcher for image generation
 * 
 * @param {string} prompt - Image generation prompt
 * @param {string} quality - 'eco' or 'high'
 * @returns {Promise<Object>} Generated image payload
 */
async function generateImage(prompt, quality = 'eco') {
  const provider = (process.env.IMAGE_PROVIDER || 'openai').toLowerCase().trim();
  const timeoutMs = parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 60000;

  switch (provider) {
    case 'openai':
      return await generateWithOpenAI(prompt, quality, timeoutMs);
    case 'huggingface':
    case 'hf':
      return await generateWithHuggingFace(prompt, quality, timeoutMs);
    case 'pollinations':
      return await generateWithPollinations(prompt, quality, timeoutMs);
    default:
      throw new GenerationProviderError(
        `Unsupported IMAGE_PROVIDER "${provider}". Supported providers: openai, huggingface, pollinations.`,
        400
      );
  }
}

module.exports = {
  generateImage,
  ApiKeyMissingError,
  GenerationProviderError
};
