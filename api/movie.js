import { handleRequest, successResponse, errorResponse } from './lib/errors.js';
import { getMovieDetails, getShowDetails } from './lib/tmdb.js';

const SUBDL_BASE_URL = 'https://api.subdl.com/api/v1/subtitles';

function clean(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

async function getSubtitles({ title, year, tmdbId }) {
  if (!process.env.SUBDL_API_KEY) return [];

  const params = new URLSearchParams({
    api_key: process.env.SUBDL_API_KEY,
    film_name: clean(title),
    languages: 'en',
  });
  if (year && /^\d{4}$/.test(String(year))) params.set('year', String(year));
  if (tmdbId) params.set('tmdb_id', String(tmdbId));

  const response = await fetch(`${SUBDL_BASE_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return [];

  const payload = await response.json();
  return Array.isArray(payload?.subtitles)
    ? payload.subtitles.map((item) => ({
        language: item.language || null,
        release_name: item.release_name || null,
        url: item.url || null,
        download_url: item.download_url || null,
        hearing_impaired: item.hearing_impaired ?? item.hi ?? null,
      }))
    : [];
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    if (!process.env.TMDB_API_KEY) {
      return errorResponse(res, 503, 'Media service not available', 'TMDB_API_KEY is not configured');
    }

    const { id, type = 'movie' } = req.query;
    if (!id) return errorResponse(res, 400, 'A TMDB id is required');
    if (type !== 'movie' && type !== 'tv') {
      return errorResponse(res, 400, 'Invalid type', 'Use movie or tv');
    }

    const details = type === 'tv' ? await getShowDetails(id) : await getMovieDetails(id);
    const title = details.title || '';
    const year = String(details.releaseDate || details.firstAirDate || '').slice(0, 4);
    const subtitles = await getSubtitles({ title, year, tmdbId: id });

    return successResponse(res, {
      ...details,
      subtitles,
      playback: null,
      playbackMessage: 'No playback source is configured. Add an authorized playback provider separately; this endpoint does not scrape or proxy third-party streams.',
    });
  });
}
