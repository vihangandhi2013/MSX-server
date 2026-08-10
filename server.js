import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

const routes = {
  '/api/health': async () => (await import('./api/health.js')).default,
  '/api/config': async () => (await import('./api/config.js')).default,
  '/api/catalog': async () => (await import('./api/catalog.js')).default,
  '/api/movies': async () => (await import('./api/movies.js')).default,
  '/api/shows': async () => (await import('./api/shows.js')).default,
  '/api/search': async () => (await import('./api/search.js')).default,
  '/api/sports': async () => (await import('./api/sports.js')).default,
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const handler = routes[pathname];

  if (handler) {
    const routeHandler = await handler();
    return routeHandler(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    error: true,
    status: 404,
    message: 'Endpoint not found',
  }));
});

server.listen(PORT, () => {
  console.log(`MSX Media Server listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Catalog: http://localhost:${PORT}/api/catalog`);
});
