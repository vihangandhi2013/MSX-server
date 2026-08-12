import { handleRequest, successResponse, errorResponse } from './lib/errors.js';

const SUBDL_BASE_URL = 'https://api.subdl.com/api/v1/subtitles';

function clean(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    if (!process.env.SUBDL_API_KEY) {
      return errorResponse(res, 503, 'Subtitle service not available', 'SUBDL_API_KEY is not configured');
    }

    const { title, film_name, year, imdb_id, tmdb_id, languages = 'en' } = req.query;
    const filmName = clean(film_name || title);

    if (!filmName && !imdb_id && !tmdb_id) {
      return errorResponse(res, 400, 'A title, imdb_id, or tmdb_id is required');
    }

    const params = new URLSearchParams({ api_key: process.env.SUBDL_API_KEY });
    if (filmName) params.set('film_name', filmName);
    if (year && /^\d{4}$/.test(String(year))) params.set('year', String(year));
    if (imdb_id) params.set('imdb_id', clean(imdb_id, 30));
    if (tmdb_id) params.set('tmdb_id', clean(tmdb_id, 30));
    if (languages) params.set('languages', clean(String(languages), 100));

    const response = await fetch(`${SUBDL_BASE_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return errorResponse(res, response.status >= 500 ? 502 : response.status, 'Subtitle provider request failed');
    }

    const payload = await response.json();
    const subtitles = Array.isArray(payload?.subtitles)
      ? payload.subtitles.map((item) => ({
          release_name: item.release_name || null,
          language: item.language || null,
          author: item.author || null,
          url: item.url || null,
          download_url: item.download_url || null,
          hi: item.hi ?? null,
          hearing_impaired: item.hearing_impaired ?? null,
        }))
      : [];

    successResponse(res, {
      film: payload?.film || null,
      subtitles,
    });
  });
}
