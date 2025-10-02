#!/usr/bin/env ts-node

/**
 * Test Script for AI Query Enhancement
 *
 * Tests the Claude-powered query enhancement with various search terms
 * to demonstrate how user queries are expanded for better search results.
 */

import { enhanceSearchQuery, clearQueryCache, getCacheStats } from '../src/lib/queryEnhancer.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const TEST_QUERIES = [
  'laptops',
  'pencils',
  'cybersecurity software',
  'janitorial supplies',
  'office furniture',
  'network equipment',
  'cleaning services',
  'IT support',
  'fire safety',
  'medical supplies'
];

async function testQuery(query: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Query: "${query}"`);
  console.log('='.repeat(60));

  const result = await enhanceSearchQuery(query);

  console.log('\nOriginal Query:', result.originalQuery);
  console.log('\nEnhanced Results:');
  console.log('  Categories:', result.categories.length > 0 ? result.categories.join(', ') : '(none)');
  console.log('  Keywords:', result.keywords.length > 0 ? result.keywords.join(', ') : '(none)');
  console.log('  Suppliers:', result.suppliers.length > 0 ? result.suppliers.join(', ') : '(none)');
}

async function main() {
  console.log('🧪 AI Query Enhancement Test Suite');
  console.log('═'.repeat(60));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ Error: ANTHROPIC_API_KEY not found in .env.local');
    console.log('\nTo run this test:');
    console.log('1. Add ANTHROPIC_API_KEY to .env.local');
    console.log('2. Run: npm run test-query-enhancement\n');
    process.exit(1);
  }

  console.log('\nTesting query enhancement with real Claude API calls...\n');

  // Test each query
  for (const query of TEST_QUERIES) {
    await testQuery(query);
    // Small delay between queries to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Test cache
  console.log('\n' + '='.repeat(60));
  console.log('Testing Cache');
  console.log('='.repeat(60));

  const stats1 = getCacheStats();
  console.log('\nCache stats after first run:', stats1);

  // Re-run first query to test cache
  console.log('\nRe-running first query to test cache hit...');
  await testQuery(TEST_QUERIES[0]);

  const stats2 = getCacheStats();
  console.log('\nCache stats after cache hit:', stats2);

  // Calculate estimated cost
  const totalQueries = TEST_QUERIES.length + 1; // +1 for cache test
  const avgInputTokens = 200;
  const avgOutputTokens = 100;
  const totalInputTokens = totalQueries * avgInputTokens;
  const totalOutputTokens = totalQueries * avgOutputTokens;
  const inputCost = (totalInputTokens / 1_000_000) * 0.80;
  const outputCost = (totalOutputTokens / 1_000_000) * 4.00;
  const totalCost = inputCost + outputCost;

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
  console.log(`\nTotal queries tested: ${totalQueries} (1 cached)`);
  console.log(`Estimated cost: $${totalCost.toFixed(4)}`);
  console.log(`  Input: ${totalInputTokens.toLocaleString()} tokens ($${inputCost.toFixed(4)})`);
  console.log(`  Output: ${totalOutputTokens.toLocaleString()} tokens ($${outputCost.toFixed(4)})`);
  console.log(`\nPer-query cost: ~$0.0003 (0.03 cents)`);
  console.log(`Monthly cost for 10,000 searches: ~$3.00\n`);
}

main().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
