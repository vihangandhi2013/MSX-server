# MSX Media Server 2.0

Production-ready Media Station X server with TMDB integration, running on Vercel.

## Features

- Popular movies and TV shows from TMDB
- Full-text search for movies and TV shows
- Detailed metadata: posters, backdrops, ratings, genres, release dates
- Sports source integration (user-configured)
- Built-in caching to reduce API calls
- CORS support for MSX clients
- Error handling and validation
- Serverless on Vercel

## Deploy to Vercel

1. Fork or clone this repository to GitHub.
2. Import the repository into Vercel.
3. In Vercel project settings, add these environment variables:
   - `TMDB_API_KEY` (required): Get from https://www.themoviedb.org/settings/api
   - `SUBDL_API_KEY` (optional): Subtitle service API key
   - `FOOTBALL_SOURCE` (optional): Authorized football stream URL
   - `CRICKET_SOURCE` (optional): Authorized cricket stream URL
   - `F1_SOURCE` (optional): Authorized F1 stream URL
4. Deploy. Vercel will automatically build and serve the API routes.
5. Your server URL will be: `https://your-project.vercel.app`

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your API keys
4. Run `npm install`
5. Run `npm start` or `npm run dev`
6. Test endpoints at `http://localhost:3000/api/*`

## API Endpoints

All endpoints return JSON with `error`, `status`, and `data` fields.

### Configuration

- `GET /api/health` - Server status
- `GET /api/config` - Service configuration status
- `GET /api/catalog` - MSX catalog structure

### Movies

- `GET /api/movies?type=popular&page=1` - Popular movies
- `GET /api/movies?type=search&query=inception&page=1` - Search movies
- `GET /api/movies?type=details&id=27205` - Movie details

### TV Shows

- `GET /api/shows?type=popular&page=1` - Popular TV shows
- `GET /api/shows?type=search&query=breaking&page=1` - Search TV shows
- `GET /api/shows?type=details&id=1399` - Show details

### Search

- `GET /api/search?query=matrix&type=all&page=1` - Search all (type: all, movies, shows)

### Sports

- `GET /api/sports` - Get configured sports sources

## Response Format

Success response:
```json
{
  "error": false,
  "status": 200,
  "data": { ... }
}
```

Error response:
```json
{
  "error": true,
  "status": 400,
  "message": "Error description",
  "details": "Additional details"
}
```

## Security

- API keys are stored as environment variables on Vercel
- Never commit `.env.local` or any secrets to GitHub
- Private API calls run server-side only
- No secrets exposed to frontend
- All requests validated and sanitized

## Caching

Responses are cached for 5 minutes to reduce TMDB API usage and improve performance.

## License

MIT
