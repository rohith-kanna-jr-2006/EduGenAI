/**
 * EduGenAI - History Persistence Service
 * 
 * Provides disk-backed JSON storage for image generation history.
 * - Stores generation timestamp, prompt, category, condition, effective inference settings,
 *   generation duration, resource estimates, and image data.
 * - Strictly never stores API keys or secrets.
 * - Automatically initializes backend/data/history.json.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function initializeStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[HistoryService] Failed to initialize history directory:', err.message);
  }
}

function readHistory() {
  try {
    initializeStorage();
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('[HistoryService] Error reading history records:', err.message);
  }
  return [];
}

function writeHistory(records) {
  try {
    initializeStorage();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[HistoryService] Error writing history records:', err.message);
    return false;
  }
}

/**
 * Save a new generation record
 */
function saveRecord({
  prompt,
  combinedPrompt,
  category,
  constraints,
  condition,
  steps,
  guidanceScale,
  seed,
  image,
  measurements,
  resourceEstimates
}) {
  const records = readHistory();

  const record = {
    id: `gen_${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    prompt,
    combinedPrompt,
    category: category || 'education',
    constraints: constraints || [],
    condition: condition || 'economy',
    effectiveSettings: {
      width: 1024,
      height: 1024,
      steps,
      guidanceScale,
      seed
    },
    generationDurationSeconds: measurements?.generationSeconds || null,
    peakGpuMemoryGiB: measurements?.peakGpuMemoryGiB || null,
    resourceEstimates: {
      relativeUnits: resourceEstimates?.relativeUnits || (condition === 'economy' ? 0.5 : 1.0),
      baselineUnits: resourceEstimates?.baselineUnits || 1.0,
      estimatedRelativeReductionPercent: resourceEstimates?.estimatedRelativeReductionPercent || 0,
      measurementType: 'illustrative relative compute proxy, not measured energy'
    },
    image: {
      url: image?.url || null
    },
    downloadUrl: image?.url || null,
    createdAt: new Date().toISOString()
  };

  // Prepend to array
  records.unshift(record);

  // Cap at 500 records to prevent disk exhaustion
  if (records.length > 500) {
    records.length = 500;
  }

  writeHistory(records);
  return record;
}

/**
 * Get history records with filtering and pagination
 */
function getHistory(filters = {}) {
  const records = readHistory();
  let items = [...records];

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (r) => (r.prompt && r.prompt.toLowerCase().includes(q)) || (r.category && r.category.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'all') {
    items = items.filter((r) => r.category === filters.category);
  }

  if (filters.condition && filters.condition !== 'all') {
    items = items.filter((r) => r.condition === filters.condition);
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
  deleteRecord
};
