import { handleRequest, successResponse } from './lib/errors.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    const config = {
      tmdbConfigured: Boolean(process.env.TMDB_API_KEY),
      subdlConfigured: Boolean(process.env.SUBDL_API_KEY),
      sportsSourcesConfigured: {
        football: Boolean(process.env.FOOTBALL_SOURCE),
        cricket: Boolean(process.env.CRICKET_SOURCE),
        f1: Boolean(process.env.F1_SOURCE),
      },
      services: {
        movies: process.env.TMDB_API_KEY ? 'available' : 'not configured',
        tvShows: process.env.TMDB_API_KEY ? 'available' : 'not configured',
        search: process.env.TMDB_API_KEY ? 'available' : 'not configured',
        sports: (process.env.FOOTBALL_SOURCE || process.env.CRICKET_SOURCE || process.env.F1_SOURCE) ? 'available' : 'not configured',
      },
    };

    successResponse(res, config);
  });
}
