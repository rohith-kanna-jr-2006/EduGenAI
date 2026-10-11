const assert = require('assert');
const express = require('express');
const generationRoutes = require('../routes/generationRoutes');
const { generateWithGemini } = require('../services/geminiImageService');
const historyService = require('../services/historyService');

console.log('--- Starting Gemini Integration & Model Switch Tests ---');

const app = express();
app.use(express.json());
app.use('/api', generationRoutes);

async function runGeminiTests() {
  const http = require('http');
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const axios = require('axios');

  try {
    // 1. Direct Service Call
    console.log('1. Testing generateWithGemini service directly...');
    const result = await generateWithGemini({
      prompt: 'Diagram of a eukaryotic plant cell with cell wall and vacuole',
      category: 'worksheet',
      gradeLevel: 'Grade 6',
      aspectRatio: '1:1'
    });

    assert.strictEqual(result.provider, 'gemini');
    assert.ok(result.dataUrl.startsWith('data:image/'));
    assert.ok(result.generationSeconds > 0);
    console.log('  ✓ generateWithGemini generated valid visual payload');

    // 2. HTTP POST /api/generation/create using Gemini
    console.log('2. Testing POST /api/generation/create with modelMode: manual & Gemini model...');
    const genRes = await axios.post(`${baseUrl}/generation/create`, {
      prompt: 'Printable photosynthesis coloring sheet for elementary students',
      category: 'worksheet',
      gradeLevel: 'Grade 4 (Elementary)',
      aspectRatio: '1:1',
      modelMode: 'manual',
      selectedModelId: 'gemini-3.1-flash-lite'
    });

    assert.strictEqual(genRes.status, 200);
    assert.strictEqual(genRes.data.success, true);
    assert.strictEqual(genRes.data.metadata.provider, 'gemini');
    assert.ok(genRes.data.image.url.startsWith('data:image/'));
    assert.ok(genRes.data.data.id);
    console.log('  ✓ POST /api/generation/create returned 200 with Gemini metadata and image URL');

    // 3. Verify record was persisted to database history
    const historyRes = await axios.get(`${baseUrl}/history?search=photosynthesis`);
    assert.strictEqual(historyRes.status, 200);
    const found = historyRes.data.items.find(i => i.id === genRes.data.data.id);
    assert.ok(found, 'Generated record must be saved in database history');
    assert.strictEqual(found.category, 'worksheet');
    console.log('  ✓ Record was persisted and retrieved from disk-backed JSON store');

    // Clean up test record
    historyService.deleteRecord(genRes.data.data.id);

    console.log('\n--- All Gemini Integration Tests Passed! ---');
  } catch (err) {
    console.error('Gemini Test Error:', err.message);
    if (err.response?.data) {
      console.error('Response data:', err.response.data);
    }
    process.exit(1);
  } finally {
    server.close();
  }
}

runGeminiTests();
