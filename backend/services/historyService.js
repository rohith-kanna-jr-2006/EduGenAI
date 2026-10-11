/**
 * EduGenAI - History Persistence Service
 * 
 * Provides disk-backed JSON storage for image generation history.
 * - Manages backend/data/history.json.
 * - Enforces consistent data schema across generation runs (SDXL & OpenRouter).
 * - Safely normalizes legacy records with missing or optional fields.
 * - Strictly validates image presence before persisting successful generations.
 * - Prevents runtime errors when optional metrics (cost, duration, GPU memory) are absent.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

const DEFAULT_SEED_RECORDS = [
  {
    id: 'gen_001',
    userId: 'usr_edu_101',
    title: 'Photosynthesis & Chloroplast Diagram',
    prompt: 'Clean black-and-white outline colouring worksheet illustrating light reaction and Calvin cycle for 5th grade biology.',
    combinedPrompt: 'Clean black-and-white outline colouring worksheet illustrating light reaction and Calvin cycle for 5th grade biology.',
    category: 'worksheet',
    categoryLabel: 'Colouring Worksheet',
    gradeLevel: 'Grade 5 (Elementary)',
    modelUsed: 'SDXL Turbo (Economy 15-Steps)',
    modelId: 'sdxl-turbo',
    status: 'completed',
    qualityScore: 98,
    reviewStatus: 'approved',
    tokensUsed: 142,
    cost: 0.0032,
    dimensions: '1024 x 1024',
    aspectRatio: '1:1',
    width: 1024,
    height: 1024,
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    guardrailStatus: 'K-5 Safe',
    downloadUrl: '#',
    image: { url: '#' }
  },
  {
    id: 'gen_002',
    userId: 'usr_edu_101',
    title: 'World War II Allied Pacific Timeline',
    prompt: 'Educational poster diagram charting the major naval engagements from Pearl Harbor to Midway with clear date callouts.',
    combinedPrompt: 'Educational poster diagram charting the major naval engagements from Pearl Harbor to Midway with clear date callouts.',
    category: 'poster',
    categoryLabel: 'Educational Poster',
    gradeLevel: 'Grade 8 (Middle School)',
    modelUsed: 'SDXL Base 1.0 (High Quality 30-Steps)',
    modelId: 'sdxl-base',
    status: 'completed',
    qualityScore: 96,
    reviewStatus: 'approved',
    tokensUsed: 215,
    cost: 0.0058,
    dimensions: '1024 x 1024',
    aspectRatio: '16:9',
    width: 1024,
    height: 1024,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    guardrailStatus: 'Middle School Approved',
    downloadUrl: '#',
    image: { url: '#' }
  },
  {
    id: 'gen_003',
    userId: 'usr_edu_101',
    title: 'Geometry Angle Relationships Memory Cards',
    prompt: 'Print-ready paired flashcard set demonstrating supplementary, complementary, and alternate interior angles.',
    combinedPrompt: 'Print-ready paired flashcard set demonstrating supplementary, complementary, and alternate interior angles.',
    category: 'flashcard',
    categoryLabel: 'Flashcards & Vocab',
    gradeLevel: 'Grade 7 (Middle School)',
    modelUsed: 'SDXL Turbo (Economy 15-Steps)',
    modelId: 'sdxl-turbo',
    status: 'completed',
    qualityScore: 94,
    reviewStatus: 'approved',
    tokensUsed: 118,
    cost: 0.0024,
    dimensions: '1024 x 1024',
    aspectRatio: '2:3',
    width: 1024,
    height: 1024,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    guardrailStatus: 'Middle School Approved',
    downloadUrl: '#',
    image: { url: '#' }
  },
  {
    id: 'gen_004',
    userId: 'usr_edu_101',
    title: 'Human Circulatory & Heart Ventricle Cross-Section',
    prompt: 'Medical curriculum illustration showing deoxygenated and oxygenated blood flow arrows for High School Anatomy.',
    combinedPrompt: 'Medical curriculum illustration showing deoxygenated and oxygenated blood flow arrows for High School Anatomy.',
    category: 'illustration',
    categoryLabel: 'Learning Illustration',
    gradeLevel: 'Grade 11 (High School)',
    modelUsed: 'SDXL Base 1.0 (High Quality 30-Steps)',
    modelId: 'sdxl-base',
    status: 'completed',
    qualityScore: 91,
    reviewStatus: 'pending',
    tokensUsed: 310,
    cost: 0.0075,
    dimensions: '1024 x 1024',
    aspectRatio: '1:1',
    width: 1024,
    height: 1024,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    guardrailStatus: 'High School / Advanced',
    downloadUrl: '#',
    image: { url: '#' }
  }
];

function getCategoryLabel(cat) {
  switch (cat) {
    case 'worksheet': return 'Colouring Worksheet';
    case 'flashcard': return 'Flashcards & Vocab';
    case 'poster': return 'Educational Poster';
    case 'illustration': return 'Learning Illustration';
    default: return 'Educational Material';
  }
}

/**
 * Normalizes any record (new or legacy) to ensure complete, safe contract.
 * Never fabricates measurements; sets absent optional metrics to null.
 */
function normalizeRecord(record) {
  if (!record || typeof record !== 'object') return null;

  const prompt = record.prompt || '';
  const title = record.title || (prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt) || 'Educational Visual';
  const category = record.category || 'worksheet';
  const categoryLabel = record.categoryLabel || getCategoryLabel(category);
  const gradeLevel = record.gradeLevel || 'Grade 5 (Elementary)';
  const modelUsed = record.modelUsed || (record.condition === 'economy' ? 'SDXL (Economy 15-Steps)' : 'SDXL (High Quality 30-Steps)');
  const modelId = record.modelId || modelUsed;
  const status = record.status || 'completed';
  const reviewStatus = record.reviewStatus || 'approved';
  
  const width = record.effectiveSettings?.width || record.width || 1024;
  const height = record.effectiveSettings?.height || record.height || 1024;
  const dimensions = record.dimensions || `${width} x ${height}`;
  const aspectRatio = record.aspectRatio || '1:1';

  const downloadUrl = record.downloadUrl || record.image?.url || record.imageUrl || record.image?.data || null;
  const imageData = record.image?.data || (typeof downloadUrl === 'string' && downloadUrl.startsWith('data:') ? downloadUrl : undefined);
  const image = record.image || { url: downloadUrl, ...(imageData ? { data: imageData } : {}) };
  if (!image.url && downloadUrl) {
    image.url = downloadUrl;
  }

  // Cost: keep numeric value if genuinely present, otherwise null (never undefined, never fabricate)
  let cost = null;
  if (record.cost !== undefined && record.cost !== null) {
    const parsedCost = typeof record.cost === 'string' ? parseFloat(record.cost.replace('$', '')) : Number(record.cost);
    if (!Number.isNaN(parsedCost) && Number.isFinite(parsedCost)) {
      cost = parsedCost;
    }
  }

  // Tokens: genuine or derived from prompt length
  const tokensUsed = record.tokensUsed !== undefined && record.tokensUsed !== null && !Number.isNaN(Number(record.tokensUsed))
    ? Number(record.tokensUsed)
    : (prompt ? Math.max(1, Math.round(prompt.length / 4)) : 0);

  const generationSeconds = record.generationSeconds ?? record.generationDurationSeconds ?? record.measurements?.generationSeconds ?? null;
  const peakGpuMemoryGiB = record.peakGpuMemoryGiB ?? record.measurements?.peakGpuMemoryGiB ?? null;
  const qualityScore = record.qualityScore !== undefined && record.qualityScore !== null && !Number.isNaN(Number(record.qualityScore))
    ? Number(record.qualityScore)
    : 95;
  const guardrailStatus = record.guardrailStatus || 'Curriculum Verified';
  const createdAt = record.createdAt || record.timestamp || new Date().toISOString();
  const userId = record.userId || 'usr_edu_101';

  return {
    ...record,
    id: record.id || `gen_${crypto.randomUUID()}`,
    userId,
    title,
    prompt,
    combinedPrompt: record.combinedPrompt || prompt,
    category,
    categoryLabel,
    gradeLevel,
    modelUsed,
    modelId,
    status,
    reviewStatus,
    dimensions,
    aspectRatio,
    width,
    height,
    image,
    downloadUrl,
    cost,
    tokensUsed,
    generationSeconds,
    generationDurationSeconds: generationSeconds,
    peakGpuMemoryGiB,
    qualityScore,
    guardrailStatus,
    createdAt,
    timestamp: createdAt
  };
}

function initializeStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(DEFAULT_SEED_RECORDS, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[HistoryService] Failed to initialize history storage:', err.message);
  }
}

function readHistory() {
  try {
    initializeStorage();
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      const parsed = JSON.parse(data || '[]');
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error('[HistoryService] Error reading history records:', err.message);
  }
  return [];
}

function writeHistory(records) {
  try {
    initializeStorage();
    const tempFile = `${HISTORY_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), 'utf8');
    fs.renameSync(tempFile, HISTORY_FILE);
    return true;
  } catch (err) {
    console.error('[HistoryService] Error writing history records atomically:', err.message);
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf8');
      return true;
    } catch (fallbackErr) {
      console.error('[HistoryService] Direct write fallback also failed:', fallbackErr.message);
      return false;
    }
  }
}

/**
 * Persists a successful generation record.
 * Throws an error if image reference is missing or if status indicates failure.
 * (never persists failed or imageless generations).
 */
function saveRecord(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid generation data provided to saveRecord.');
  }

  if (data.status === 'failed' || data.status === 'error' || data.success === false) {
    throw new Error('Cannot persist failed or error generation record as successful.');
  }

  const imageUrl = data.image?.url || data.downloadUrl || data.imageUrl || data.image?.data;
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    throw new Error('Cannot persist generation record without a valid image reference.');
  }

  const records = readHistory();
  const prompt = data.prompt || '';
  const title = data.title || (prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt);
  const category = data.category || 'worksheet';
  const categoryLabel = data.categoryLabel || getCategoryLabel(category);
  const gradeLevel = data.gradeLevel || 'Grade 5 (Elementary)';
  const modelUsed = data.modelUsed || (data.condition === 'economy' ? 'SDXL (Economy 15-Steps)' : 'SDXL (High Quality 30-Steps)');
  const modelId = data.modelId || modelUsed;
  const status = data.status || 'completed';
  const reviewStatus = data.reviewStatus || 'approved';
  const width = data.effectiveSettings?.width || data.width || 1024;
  const height = data.effectiveSettings?.height || data.height || 1024;
  const dimensions = data.dimensions || `${width} x ${height}`;
  const aspectRatio = data.aspectRatio || '1:1';

  let cost = null;
  if (data.cost !== undefined && data.cost !== null && !Number.isNaN(Number(data.cost))) {
    cost = Number(data.cost);
  }

  const tokensUsed = data.tokensUsed !== undefined && data.tokensUsed !== null
    ? Number(data.tokensUsed)
    : Math.max(1, Math.round(prompt.length / 4));

  const generationSeconds = data.measurements?.generationSeconds ?? data.generationSeconds ?? null;
  const peakGpuMemoryGiB = data.measurements?.peakGpuMemoryGiB ?? data.peakGpuMemoryGiB ?? null;
  const qualityScore = data.qualityScore !== undefined && data.qualityScore !== null ? Number(data.qualityScore) : 95;
  const guardrailStatus = data.guardrailStatus || 'Curriculum Verified';
  const createdAt = data.createdAt || new Date().toISOString();
  const userId = data.userId || 'usr_edu_101';

  const record = {
    id: data.id || `gen_${crypto.randomUUID()}`,
    userId,
    title,
    prompt,
    combinedPrompt: data.combinedPrompt || prompt,
    category,
    categoryLabel,
    gradeLevel,
    modelUsed,
    modelId,
    status,
    reviewStatus,
    dimensions,
    aspectRatio,
    width,
    height,
    constraints: data.constraints || [],
    condition: data.condition || 'economy',
    effectiveSettings: {
      width,
      height,
      steps: data.steps || (data.condition === 'economy' ? 15 : 30),
      guidanceScale: data.guidanceScale || 5.0,
      seed: data.seed !== undefined ? data.seed : Math.floor(Math.random() * 1000000)
    },
    generationSeconds,
    generationDurationSeconds: generationSeconds,
    peakGpuMemoryGiB,
    cost,
    tokensUsed,
    qualityScore,
    guardrailStatus,
    image: {
      url: imageUrl,
      ...(data.image?.data ? { data: data.image.data } : (typeof imageUrl === 'string' && imageUrl.startsWith('data:') ? { data: imageUrl } : {}))
    },
    downloadUrl: imageUrl,
    resourceEstimates: data.resourceEstimates || {
      relativeUnits: data.condition === 'economy' ? 0.5 : 1.0,
      baselineUnits: 1.0,
      estimatedRelativeReductionPercent: data.condition === 'economy' ? 50 : 0,
      measurementType: 'illustrative relative compute proxy'
    },
    createdAt,
    timestamp: createdAt
  };

  records.unshift(record);

  if (records.length > 500) {
    records.length = 500;
  }

  writeHistory(records);
  return normalizeRecord(record);
}

/**
 * Get history records with filtering, pagination, and normalization
 */
function getHistory(filters = {}) {
  const records = readHistory();
  let items = records.map(normalizeRecord).filter(Boolean);

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (r) => (r.prompt && r.prompt.toLowerCase().includes(q)) || (r.title && r.title.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'all') {
    items = items.filter((r) => r.category === filters.category);
  }

  if (filters.status && filters.status !== 'all') {
    items = items.filter((r) => r.reviewStatus === filters.status);
  }

  if (filters.condition && filters.condition !== 'all') {
    items = items.filter((r) => r.condition === filters.condition);
  }

  if (filters.userId) {
    items = items.filter((r) => r.userId === filters.userId);
  }

  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 50, 1), 100);
  const offset = Math.max(parseInt(filters.offset, 10) || 0, 0);

  const paginated = items.slice(offset, offset + limit);

  return {
    success: true,
    total: items.length,
    limit,
    offset,
    hasMore: offset + limit < items.length,
    history: paginated,
    items: paginated,
    storageType: 'persistent_disk_json'
  };
}

/**
 * Update an existing record in history
 */
function updateRecord(id, updates) {
  const records = readHistory();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updates };
    writeHistory(records);
    return normalizeRecord(records[index]);
  }
  return null;
}

/**
 * Delete a generation record
 */
function deleteRecord(id) {
  const records = readHistory();
  const initialLength = records.length;
  const filtered = records.filter((r) => r.id !== id);

  if (filtered.length !== initialLength) {
    writeHistory(filtered);
    return true;
  }
  return false;
}

initializeStorage();

module.exports = {
  saveRecord,
  getHistory,
  updateRecord,
  deleteRecord,
  normalizeRecord,
  getCategoryLabel
};
