import { handleRequest, successResponse } from './lib/errors.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    successResponse(res, {
      service: 'MSX Media Server',
      status: 'operational',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });
}
