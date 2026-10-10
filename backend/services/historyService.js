/**
 * EcoGen AI - History Persistence Service
 * 
 * Provides lightweight, persistent file-based JSON storage for image generation history.
 * - Stores prompt, selected quality, timestamp, image URL, and resource estimates.
 * - Strictly never stores API keys or provider secrets.
 * - Persists automatically to backend/data/history.json across server restarts.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data directory and file exist
function initializeStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf8');
    }
  } catch (err) {
    console.error('[HistoryService] Failed to initialize history storage:', err.message);
  }
}

// Load history records from disk
function readHistory() {
  try {
    initializeStorage();
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('[HistoryService] Error reading history file:', err.message);
  }
  return [];
}

// Persist history records to disk
function writeHistory(records) {
  try {
    initializeStorage();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('[HistoryService] Error writing history file:', err.message);
    return false;
  }
}

/**
 * Save a new generation record
 * 
 * @param {Object} generation - generation metadata
 * @returns {Object} saved record
 */
function saveRecord({ prompt, quality, image, resources, provider, model }) {
  const records = readHistory();

  const record = {
    id: `gen_${crypto.randomUUID()}`,
    prompt,
    quality,
    image: {
      url: image.url
    },
    resources: {
      energyWh: resources.energyWh,
      estimated: resources.estimated,
      computationalEffort: resources.computationalEffort,
      energySavedWh: resources.energySavedWh,
      energySavedPercentage: resources.energySavedPercentage,
      carbonEmissionsGramsCO2e: resources.carbonEmissionsGramsCO2e
    },
    provider: provider || 'openai',
    model: model || 'default',
    createdAt: new Date().toISOString()
  };

  // Prepend to array so newest is first
  records.unshift(record);

  // Keep a cap of the last 500 records to prevent unbounded disk growth
  if (records.length > 500) {
    records.length = 500;
  }

  writeHistory(records);
  return record;
}

/**
 * Get history records with pagination support
 * 
 * @param {number} limit - maximum records to return
 * @param {number} offset - number of records to skip
 * @returns {Object} paginated history results
 */
function getHistory(limit = 20, offset = 0) {
  const records = readHistory();
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const items = records.slice(parsedOffset, parsedOffset + parsedLimit);

  return {
    success: true,
    total: records.length,
    limit: parsedLimit,
    offset: parsedOffset,
    hasMore: parsedOffset + parsedLimit < records.length,
    history: items,
    storageType: 'persistent_json_file'
  };
}

// Initialize on module load
initializeStorage();

module.exports = {
  saveRecord,
  getHistory
};
