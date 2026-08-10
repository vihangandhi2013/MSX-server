import { handleRequest, successResponse, errorResponse } from './lib/errors.js';
import { searchMovies, searchShows } from './lib/tmdb.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    if (!process.env.TMDB_API_KEY) {
      return errorResponse(res, 503, 'Search service not available', 'TMDB_API_KEY is not configured');
    }

    const { query, type = 'all', page = '1' } = req.query;

    if (!query || query.trim().length < 2) {
      return errorResponse(res, 400, 'Search query must be at least 2 characters');
    }

    const pageNum = Math.max(1, Math.min(parseInt(page), 500));

    try {
      const results = {};

      if (type === 'all' || type === 'movies') {
        results.movies = await searchMovies(query, pageNum);
      }

      if (type === 'all' || type === 'shows') {
        results.shows = await searchShows(query, pageNum);
      }

      if (Object.keys(results).length === 0) {
        return errorResponse(res, 400, 'Invalid type parameter', 'Use: all, movies, or shows');
      }

      successResponse(res, results);
    } catch (err) {
      throw err;
    }
  });
}
