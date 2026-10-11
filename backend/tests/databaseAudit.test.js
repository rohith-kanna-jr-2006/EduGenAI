/**
 * EduGenAI - Comprehensive Database Audit & Consistency Test Suite
 * 
 * Verifies:
 * 1. Storage mechanism & atomic file handling.
 * 2. Normalization of legacy & incomplete records (null cost, missing metrics).
 * 3. Prevention of failed or imageless generations from being persisted.
 * 4. Contract parity between generation responses and stored records.
 * 5. Preservation of SDXL image references (data URLs and http URLs).
 * 6. Deletion and update operations.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const historyService = require('../services/historyService');

console.log('--- Starting EduGenAI Database Audit Test Suite ---');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // 1. Audit persistence architecture
  test('Audit 1: Database storage type and retrieval', () => {
    const res = historyService.getHistory({ limit: 10 });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.storageType, 'persistent_disk_json');
    assert.ok(Array.isArray(res.items));
    assert.ok(Array.isArray(res.history));
  });

  // 2. Legacy record normalization safety
  test('Audit 2: Legacy record normalization handles missing cost safely without crashing or fabrication', () => {
    const legacyRecord = {
      id: 'gen_legacy_test_01',
      title: 'Diagram of a flowering plant cell structure',
      prompt: 'Diagram of a flowering plant cell structure',
      image: { url: 'https://example.com/plant.png' }
      // intentionally missing cost, tokensUsed, modelUsed, gradeLevel, etc.
    };

    const normalized = historyService.normalizeRecord(legacyRecord);
    assert.ok(normalized);
    assert.strictEqual(normalized.id, 'gen_legacy_test_01');
    assert.strictEqual(normalized.title, 'Diagram of a flowering plant cell structure');
    assert.strictEqual(normalized.cost, null, 'Missing cost must be null, never fabricated or undefined');
    assert.strictEqual(typeof normalized.tokensUsed, 'number');
    assert.strictEqual(normalized.gradeLevel, 'Grade 5 (Elementary)');
    assert.strictEqual(normalized.reviewStatus, 'approved');
    assert.strictEqual(normalized.status, 'completed');
  });

  // 3. Ensuring failed generations are NOT persisted
  test('Audit 3: Failed generations are rejected from persistence', () => {
    assert.throws(() => {
      historyService.saveRecord({
        prompt: 'Failed prompt',
        status: 'failed',
        image: { url: 'https://example.com/failed.png' }
      });
    }, /Cannot persist failed or error generation record/);

    assert.throws(() => {
      historyService.saveRecord({
        prompt: 'Error prompt',
        status: 'error',
        image: { url: 'https://example.com/error.png' }
      });
    }, /Cannot persist failed or error generation record/);

    assert.throws(() => {
      historyService.saveRecord({
        prompt: 'Imageless prompt',
        status: 'completed'
        // missing image
      });
    }, /Cannot persist generation record without a valid image reference/);

    assert.throws(() => {
      historyService.saveRecord({
        prompt: 'Empty image prompt',
        status: 'completed',
        image: { url: '   ' }
      });
    }, /Cannot persist generation record without a valid image reference/);
  });

  // 4. Preserving SDXL image references and genuine measurements
  test('Audit 4: SDXL image references and measurements are faithfully persisted', () => {
    const fakeDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...test...';
    const sdxlRecord = historyService.saveRecord({
      prompt: 'Water cycle illustration for grade 4',
      combinedPrompt: 'Water cycle illustration for grade 4 with precipitation arrows',
      category: 'worksheet',
      gradeLevel: 'Grade 4 (Elementary)',
      aspectRatio: '1:1',
      condition: 'economy',
      steps: 15,
      guidanceScale: 5.0,
      modelUsed: 'SDXL (Economy 15-Steps)',
      modelId: 'sdxl-turbo',
      image: { url: fakeDataUrl, data: fakeDataUrl },
      measurements: {
        generationSeconds: 2.34,
        peakGpuMemoryGiB: 6.85
      },
      resourceEstimates: {
        relativeUnits: 0.5,
        baselineUnits: 1.0,
        estimatedRelativeReductionPercent: 50,
        measurementType: 'illustrative relative compute proxy'
      },
      cost: null // SDXL has no API dollar cost
    });

    assert.ok(sdxlRecord);
    assert.strictEqual(sdxlRecord.cost, null);
    assert.strictEqual(sdxlRecord.generationSeconds, 2.34);
    assert.strictEqual(sdxlRecord.peakGpuMemoryGiB, 6.85);
    assert.strictEqual(sdxlRecord.image.url, fakeDataUrl);
    assert.strictEqual(sdxlRecord.downloadUrl, fakeDataUrl);
    assert.strictEqual(sdxlRecord.gradeLevel, 'Grade 4 (Elementary)');

    // Verify it is retrievable via getHistory
    const retrieved = historyService.getHistory({ search: 'Water cycle illustration for grade 4' });
    assert.ok(retrieved.items.length >= 1);
    const found = retrieved.items.find(r => r.id === sdxlRecord.id);
    assert.ok(found);
    assert.strictEqual(found.cost, null);
    assert.strictEqual(found.modelUsed, 'SDXL (Economy 15-Steps)');

    // Clean up test record to preserve baseline state
    historyService.deleteRecord(sdxlRecord.id);
  });

  // 5. Deletion and updates
  test('Audit 5: Updating and deleting generation records', () => {
    const temp = historyService.saveRecord({
      prompt: 'Temporary audit test prompt',
      image: { url: 'https://example.com/test.png' },
      reviewStatus: 'pending'
    });

    assert.strictEqual(temp.reviewStatus, 'pending');

    const updated = historyService.updateRecord(temp.id, { reviewStatus: 'approved' });
    assert.ok(updated);
    assert.strictEqual(updated.reviewStatus, 'approved');

    const deleted = historyService.deleteRecord(temp.id);
    assert.strictEqual(deleted, true);

    const recheck = historyService.getHistory({ search: 'Temporary audit test prompt' });
    const stillExists = recheck.items.find(r => r.id === temp.id);
    assert.strictEqual(stillExists, undefined);
  });

  // 6. Formatting resilience simulation for Overview and History pages
  test('Audit 6: Overview and History page cost formatting safety simulation', () => {
    const testCases = [
      { cost: 0.0032, expected: '$0.0032' },
      { cost: null, modelUsed: 'SDXL Turbo', expected: 'Self-hosted (SDXL)' },
      { cost: null, modelUsed: 'Flux', expected: 'Local GPU' },
      { cost: undefined, modelUsed: 'SDXL Base', expected: 'Self-hosted (SDXL)' },
      { cost: 0, expected: '$0.0000' }
    ];

    function safeFormatCost(item) {
      if (item?.cost !== null && item?.cost !== undefined && !Number.isNaN(Number(item?.cost))) {
        return `$${Number(item.cost).toFixed(4)}`;
      }
      if (item?.modelUsed && item.modelUsed.toLowerCase().includes('sdxl')) {
        return 'Self-hosted (SDXL)';
      }
      return 'Local GPU';
    }

    testCases.forEach((tc, idx) => {
      const res = safeFormatCost(tc);
      assert.strictEqual(res, tc.expected, `Case ${idx} failed: got ${res}, expected ${tc.expected}`);
    });
  });

  console.log(`\n--- Test Results: ${passed} passed, ${failed} failed ---`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
