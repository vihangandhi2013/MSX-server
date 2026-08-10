import { handleRequest, successResponse, errorResponse } from './lib/errors.js';
import { getPopularMovies, searchMovies, getMovieDetails } from './lib/tmdb.js';

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    if (!process.env.TMDB_API_KEY) {
      return errorResponse(res, 503, 'Movie service not available', 'TMDB_API_KEY is not configured');
    }

    const { type = 'popular', query, id, page = '1' } = req.query;
    const pageNum = Math.max(1, Math.min(parseInt(page), 500));

    try {
      if (type === 'popular') {
        const result = await getPopularMovies(pageNum);
        return successResponse(res, result);
      }

      if (type === 'search') {
        if (!query) {
          return errorResponse(res, 400, 'Search query is required');
        }
        const result = await searchMovies(query, pageNum);
        return successResponse(res, result);
      }

      if (type === 'details' && id) {
        const result = await getMovieDetails(id);
        return successResponse(res, result);
      }

      errorResponse(res, 400, 'Invalid request', 'Specify type: popular, search (with query), or details (with id)');
    } catch (err) {
      throw err;
    }
  });
}
