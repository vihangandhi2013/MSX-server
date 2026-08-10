import { handleRequest, successResponse } from './lib/errors.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    const sources = {
      football: process.env.FOOTBALL_SOURCE || null,
      cricket: process.env.CRICKET_SOURCE || null,
      f1: process.env.F1_SOURCE || null,
    };

    successResponse(res, sources);
  });
}
