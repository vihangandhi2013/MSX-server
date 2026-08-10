const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

let cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(key) {
  return `tmdb_${key}`;
}

function setCache(key, value) {
  const cacheKey = getCacheKey(key);
  cache.set(cacheKey, { value, timestamp: Date.now() });
}

function getCache(key) {
  const cacheKey = getCacheKey(key);
  const cached = cache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(cacheKey);
    return null;
  }
  return cached.value;
}

function clearOldCache() {
  const now = Date.now();
  for (const [key, data] of cache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
}

async function fetchTMDB(endpoint, params = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY not configured');
  }

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), { timeout: 10000 });
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function getImageUrl(path, size = 'w342') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function formatGenres(genreIds, genreMap) {
  if (!Array.isArray(genreIds)) return [];
  return genreIds
    .map(id => genreMap[id])
    .filter(Boolean);
}

function formatMovie(movie, genreMap = {}) {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview || '',
    rating: movie.vote_average || 0,
    releaseDate: movie.release_date || '',
    poster: getImageUrl(movie.poster_path, 'w342'),
    backdrop: getImageUrl(movie.backdrop_path, 'w1280'),
    genres: formatGenres(movie.genre_ids, genreMap),
    popularity: movie.popularity || 0,
  };
}

function formatShow(show, genreMap = {}) {
  return {
    id: show.id,
    title: show.name,
    description: show.overview || '',
    rating: show.vote_average || 0,
    firstAirDate: show.first_air_date || '',
    poster: getImageUrl(show.poster_path, 'w342'),
    backdrop: getImageUrl(show.backdrop_path, 'w1280'),
    genres: formatGenres(show.genre_ids, genreMap),
    popularity: show.popularity || 0,
  };
}

export async function getGenres(type = 'movie') {
  const cacheKey = `genres_${type}`;
  let cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB(`/genre/${type}/list`);
  const genreMap = {};
  (data.genres || []).forEach(g => {
    genreMap[g.id] = g.name;
  });

  setCache(cacheKey, genreMap);
  return genreMap;
}

export async function getPopularMovies(page = 1) {
  const cacheKey = `popular_movies_${page}`;
  let cached = getCache(cacheKey);
  if (cached) return cached;

  const genreMap = await getGenres('movie');
  const data = await fetchTMDB('/movie/popular', { page });

  const result = {
    page: data.page,
    totalPages: data.total_pages,
    movies: (data.results || []).map(movie => formatMovie(movie, genreMap)),
  };

  setCache(cacheKey, result);
  return result;
}

export async function getPopularShows(page = 1) {
  const cacheKey = `popular_tv_${page}`;
  let cached = getCache(cacheKey);
  if (cached) return cached;

  const genreMap = await getGenres('tv');
  const data = await fetchTMDB('/tv/popular', { page });

  const result = {
    page: data.page,
    totalPages: data.total_pages,
    shows: (data.results || []).map(show => formatShow(show, genreMap)),
  };

  setCache(cacheKey, result);
  return result;
}

export async function searchMovies(query, page = 1) {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const genreMap = await getGenres('movie');
  const data = await fetchTMDB('/search/movie', { query, page });

  return {
    page: data.page,
    totalPages: data.total_pages,
    movies: (data.results || [])
      .filter(m => m.poster_path)
      .map(movie => formatMovie(movie, genreMap)),
  };
}

export async function searchShows(query, page = 1) {
  if (!query || query.trim().length < 2) {
    throw new Error('Search query must be at least 2 characters');
  }

  const genreMap = await getGenres('tv');
  const data = await fetchTMDB('/search/tv', { query, page });

  return {
    page: data.page,
    totalPages: data.total_pages,
    shows: (data.results || [])
      .filter(s => s.poster_path)
      .map(show => formatShow(show, genreMap)),
  };
}

export async function getMovieDetails(movieId) {
  const cacheKey = `movie_${movieId}`;
  let cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB(`/movie/${movieId}`);
  const genreMap = await getGenres('movie');

  const result = {
    id: data.id,
    title: data.title,
    description: data.overview || '',
    rating: data.vote_average || 0,
    releaseDate: data.release_date || '',
    poster: getImageUrl(data.poster_path, 'w342'),
    backdrop: getImageUrl(data.backdrop_path, 'w1280'),
    genres: data.genres.map(g => g.name) || [],
    runtime: data.runtime || 0,
    budget: data.budget || 0,
    revenue: data.revenue || 0,
    status: data.status || '',
  };

  setCache(cacheKey, result);
  return result;
}

export async function getShowDetails(showId) {
  const cacheKey = `show_${showId}`;
  let cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await fetchTMDB(`/tv/${showId}`);
  const genreMap = await getGenres('tv');

  const result = {
    id: data.id,
    title: data.name,
    description: data.overview || '',
    rating: data.vote_average || 0,
    firstAirDate: data.first_air_date || '',
    poster: getImageUrl(data.poster_path, 'w342'),
    backdrop: getImageUrl(data.backdrop_path, 'w1280'),
    genres: data.genres.map(g => g.name) || [],
    numberOfSeasons: data.number_of_seasons || 0,
    numberOfEpisodes: data.number_of_episodes || 0,
    status: data.status || '',
    networks: (data.networks || []).map(n => n.name),
  };

  setCache(cacheKey, result);
  return result;
}

export function clearCache() {
  clearOldCache();
}
