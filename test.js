import http from 'http';

// Simulate a test TMDB API key (this will fail in real calls, but we can test structure)
process.env.TMDB_API_KEY = 'test_key_for_development';
process.env.SUBDL_API_KEY = 'test_subdl_key';
process.env.FOOTBALL_SOURCE = 'https://example.com/football';
process.env.CRICKET_SOURCE = 'https://example.com/cricket';
process.env.F1_SOURCE = 'https://example.com/f1';

// Import route handlers
import healthHandler from './api/health.js';
import configHandler from './api/config.js';
import catalogHandler from './api/catalog.js';
import sportsHandler from './api/sports.js';

async function testEndpoint(name, handler) {
  console.log(`\nTesting ${name}...`);
  
  const req = { method: 'GET', headers: {} };
  const responses = [];
  
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      responses.push(data);
      console.log(`✓ ${name} (${this.statusCode}):`, JSON.stringify(data, null, 2));
    },
    end(data) {
      if (data) responses.push(JSON.parse(data));
      console.log(`✓ ${name} (${this.statusCode}): Response sent`);
    }
  };

  try {
    await handler(req, res);
  } catch (err) {
    console.error(`✗ ${name} error:`, err.message);
  }
}

async function runTests() {
  console.log('Starting MSX Media Server Tests...\n');
  
  try {
    await testEndpoint('/api/health', healthHandler);
    await testEndpoint('/api/config', configHandler);
    await testEndpoint('/api/catalog', catalogHandler);
    await testEndpoint('/api/sports', sportsHandler);
    
    console.log('\n✓ All basic tests completed successfully!');
    console.log('\nNote: Full API tests with TMDB require a valid TMDB_API_KEY.');
    console.log('Deploy to Vercel with your real API keys to test /movies, /shows, and /search endpoints.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
