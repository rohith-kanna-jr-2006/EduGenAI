const assert = require('assert');
const express = require('express');
const generationRoutes = require('../routes/generationRoutes');

console.log('--- Starting API Route & Persistence Integration Tests ---');

const app = express();
app.use(express.json());
app.use('/api', generationRoutes);

async function runApiTests() {
  const http = require('http');
  const server = http.createServer(app);
  
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const axios = require('axios');

  try {
    // 1. GET /api/health
    const health = await axios.get(`${baseUrl}/health`);
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.success, true);
    console.log('  ✓ GET /api/health');

    // 2. GET /api/history & GET /api/generation/history
    const history1 = await axios.get(`${baseUrl}/history`);
    assert.strictEqual(history1.status, 200);
    assert.ok(Array.isArray(history1.data.items));
    assert.strictEqual(history1.data.storageType, 'persistent_disk_json');
    console.log('  ✓ GET /api/history');

    const history2 = await axios.get(`${baseUrl}/generation/history`);
    assert.strictEqual(history2.status, 200);
    assert.strictEqual(history1.data.items.length, history2.data.items.length);
    console.log('  ✓ GET /api/generation/history matches /api/history');

    // 3. GET /api/quality/reviews
    const reviews = await axios.get(`${baseUrl}/quality/reviews`);
    assert.strictEqual(reviews.status, 200);
    assert.ok(Array.isArray(reviews.data.pending));
    assert.ok(Array.isArray(reviews.data.approved));
    console.log('  ✓ GET /api/quality/reviews');

    // 4. GET /api/budget/summary
    const budget = await axios.get(`${baseUrl}/budget/summary`);
    assert.strictEqual(budget.status, 200);
    assert.strictEqual(typeof budget.data.totalAllocatedTokens, 'number');
    console.log('  ✓ GET /api/budget/summary');

    // 5. GET /api/analytics
    const analytics = await axios.get(`${baseUrl}/analytics`);
    assert.strictEqual(analytics.status, 200);
    assert.strictEqual(typeof analytics.data.totalSpendUSD, 'number');
    console.log('  ✓ GET /api/analytics');

    console.log('\n--- All API Integration Tests Passed! ---');
  } catch (err) {
    console.error('API Test Error:', err.message);
    process.exit(1);
  } finally {
    server.close();
  }
}

runApiTests();
