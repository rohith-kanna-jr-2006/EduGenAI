/**
 * EduGenAI - Dedicated Gemini Image & Visual Generation Service
 * 
 * Interacts with Google AI Studio using the official @google/genai SDK.
 * Supports:
 * - gemini-3.1-flash-lite-image (Native raster image generation)
 * - gemini-nano-banana-2.1 (High-fidelity image generation)
 * - gemini-3.1-flash-lite (Curriculum vector visual engine - generates SVG educational materials)
 * 
 * Provides automated resilience: if free-tier quota limits raster image generation,
 * it seamlessly generates a high-contrast pedagogical visual in SVG format.
 * Never exposes the GEMINI_API_KEY to client code.
 */

const { GoogleGenAI } = require('@google/genai');

class GeminiServiceError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = 'GeminiServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Initializes GoogleGenAI client with server environment key
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new GeminiServiceError(
      'GEMINI_API_KEY is not configured in server environment variables. Please ensure an API key is available in Google AI Studio.',
      503,
      { code: 'GEMINI_API_KEY_MISSING' }
    );
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

/**
 * Normalizes aspect ratio to standard format supported by Gemini imageConfig
 */
function normalizeAspectRatio(ratio) {
  const supported = ['1:1', '16:9', '4:3', '3:4', '9:16'];
  if (supported.includes(ratio)) return ratio;
  if (ratio === '2:3') return '3:4';
  return '1:1';
}

/**
 * Clean and extract raw SVG code from model response
 */
function extractSvg(text) {
  if (!text) return null;
  let clean = text.trim();
  // Strip markdown code fences if present
  if (clean.includes('```xml')) {
    clean = clean.split('```xml')[1].split('```')[0].trim();
  } else if (clean.includes('```svg')) {
    clean = clean.split('```svg')[1].split('```')[0].trim();
  } else if (clean.includes('```')) {
    clean = clean.split('```')[1].split('```')[0].trim();
  }

  const svgStart = clean.indexOf('<svg');
  const svgEnd = clean.lastIndexOf('</svg>');
  if (svgStart !== -1 && svgEnd !== -1) {
    return clean.substring(svgStart, svgEnd + 6).trim();
  }
  return null;
}

/**
 * Generate an educational visual using Gemini models
 * 
 * @param {Object} options
 * @param {string} options.prompt - Prompt text
 * @param {string} [options.category] - worksheet, poster, flashcard, illustration
 * @param {string} [options.gradeLevel] - Grade level target
 * @param {string} [options.aspectRatio] - '1:1', '16:9', '4:3', etc.
 * @param {string} [options.modelOverride] - Model override
 * @returns {Promise<Object>} Generated visual result
 */
async function generateWithGemini({ prompt, category = 'worksheet', gradeLevel, aspectRatio = '1:1', modelOverride }) {
  const ai = getGeminiClient();
  const startTime = Date.now();
  const normRatio = normalizeAspectRatio(aspectRatio);

  const preferredModel = (modelOverride || process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-lite').trim();

  // Try raster image generation if explicitly requested or if model is an image model
  const isImageModel = preferredModel.includes('-image') || preferredModel.includes('banana');

  if (isImageModel) {
    try {
      const response = await ai.models.generateContent({
        model: preferredModel,
        contents: prompt.trim(),
        config: {
          imageConfig: {
            aspectRatio: normRatio
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${mime};base64,${part.inlineData.data}`;
          const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));

          return {
            provider: 'gemini',
            model: preferredModel,
            format: 'png',
            imageUrl: dataUrl,
            dataUrl,
            generationSeconds: elapsedSeconds,
            cost: null, // Google AI Studio uses allocated key quota
            dimensions: normRatio === '16:9' ? '1344 × 768' : '1024 × 1024'
          };
        }
      }
    } catch (rasterErr) {
      console.warn(`[GeminiService] Raster image model ${preferredModel} quota unavailable (${rasterErr.message}). Switching to Gemini educational vector engine...`);
      // Seamlessly fall through to vector visual generation
    }
  }

  // Educational Vector Visual Generation (Gemini 3.1 Flash Lite)
  // Generates complete, scalable SVG educational visual with zero quota restrictions on standard keys
  const vectorModel = 'gemini-3.1-flash-lite';
  const viewBox = normRatio === '16:9' ? '0 0 1344 768' : normRatio === '4:3' ? '0 0 1024 768' : '0 0 1024 1024';

  const systemInstruction = `You are an expert educational visual designer and curriculum illustrator.
Generate ONLY a clean, valid, standalone, self-contained SVG graphic for classroom use.
Category: ${category}
Grade Level: ${gradeLevel || 'Elementary / Middle School'}
Dimensions: viewBox="${viewBox}"

Design requirements:
1. Create a complete, detailed, educational visual (e.g. outline coloring worksheet, diagram, chart, or flashcard).
2. Use clear vector shapes (<path>, <rect>, <circle>, <text>, <polygon>).
3. If it is a colouring worksheet, use crisp black strokes (stroke="black" stroke-width="2" or "3") and transparent/white fills (fill="none" or fill="#ffffff") so students can color it in.
4. Include clear, readable labels and title text (<text font-family="sans-serif" font-weight="bold">).
5. Output ONLY raw valid SVG code starting with <svg and ending with </svg>.
6. DO NOT wrap with markdown backticks (no \`\`\`xml or \`\`\`svg). DO NOT add explanatory text or preamble.`;

  try {
    const res = await ai.models.generateContent({
      model: vectorModel,
      contents: prompt.trim(),
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    const rawOutput = res.text || '';
    const svgCode = extractSvg(rawOutput);

    if (!svgCode) {
      throw new GeminiServiceError(
        'Gemini completed the request, but the output did not contain valid educational visual SVG data.',
        502,
        { rawOutput: rawOutput.slice(0, 200) }
      );
    }

    const base64Svg = Buffer.from(svgCode, 'utf8').toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;
    const elapsedSeconds = parseFloat(((Date.now() - startTime) / 1000).toFixed(2));

    return {
      provider: 'gemini',
      model: isImageModel ? `${preferredModel} (Vector Fallback)` : vectorModel,
      format: 'svg',
      imageUrl: dataUrl,
      dataUrl,
      generationSeconds: elapsedSeconds,
      cost: null, // AI Studio Free/Attached key
      dimensions: normRatio === '16:9' ? '1344 × 768' : '1024 × 1024',
      svgCode
    };
  } catch (err) {
    if (err instanceof GeminiServiceError) {
      throw err;
    }
    throw new GeminiServiceError(
      `Gemini generation failed: ${err.message}`,
      err.status || 502,
      { originalError: err.message }
    );
  }
}

module.exports = {
  generateWithGemini,
  GeminiServiceError
};
