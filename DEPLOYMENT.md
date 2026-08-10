# MSX Media Server 2.0 Deployment Guide

## Quick Start

1. Push this repository to GitHub
2. Import into Vercel
3. Add environment variables (see below)
4. Deploy
5. Point your MSX client to the Vercel URL

## Environment Variables Required

Add these to your Vercel project settings under Environment Variables:

### Required

`TMDB_API_KEY`
Your TMDB (The Movie Database) API key. Get it free from https://www.themoviedb.org/settings/api
This enables movies, TV shows, and search functionality.

### Optional

`SUBDL_API_KEY`
SubDL subtitle service API key. Only needed if implementing subtitle functionality.

`FOOTBALL_SOURCE`
URL to authorized football stream (your own source, format: valid stream URL or leave blank)

`CRICKET_SOURCE`
URL to authorized cricket stream (your own source, format: valid stream URL or leave blank)

`F1_SOURCE`
URL to authorized F1 stream (your own source, format: valid stream URL or leave blank)

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click "Settings"
3. Click "Environment Variables"
4. Add each variable:
   - Name: TMDB_API_KEY
   - Value: (your actual API key)
   - Select "Production" (or all environments)
   - Click "Save and Deploy"
5. Repeat for other variables
6. Vercel will automatically redeploy when you add variables

## Server URL

After deployment, your server will be at:
`https://your-project-name.vercel.app`

Use this URL in your MSX configuration.

## API Endpoints

All endpoints:
- Return JSON responses
- Support GET requests only
- Include CORS headers for cross-origin requests
- Are cached for 5 minutes

### Health Check
`GET https://your-project-name.vercel.app/api/health`
Response: Service status and version

### Configuration
`GET https://your-project-name.vercel.app/api/config`
Response: Which services are configured and available

### Main Catalog
`GET https://your-project-name.vercel.app/api/catalog`
Response: MSX-compatible home page structure

### Movies
`GET /api/movies?type=popular&page=1` Popular movies
`GET /api/movies?type=search&query=inception&page=1` Search movies
`GET /api/movies?type=details&id=27205` Single movie details

### TV Shows
`GET /api/shows?type=popular&page=1` Popular TV shows
`GET /api/shows?type=search&query=breaking&page=1` Search TV shows
`GET /api/shows?type=details&id=1399` Single show details

### Search (Combined)
`GET /api/search?query=matrix&type=all&page=1` Search all
Type options: all, movies, shows

### Sports Sources
`GET /api/sports` Get configured sports URLs

## Local Development

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Add your actual API keys to `.env.local`
4. Run `npm install` (no dependencies, just initializes)
5. Run `npm start` to start local server on port 3000
6. Test at `http://localhost:3000/api/health`

## Response Format

All successful responses:
```json
{
  "error": false,
  "status": 200,
  "data": { ... }
}
```

All error responses:
```json
{
  "error": true,
  "status": 400,
  "message": "Error description",
  "details": "Additional details"
}
```

## Performance Notes

Responses are cached for 5 minutes to reduce TMDB API usage.
This improves response time and reduces API costs.
Cache is cleared automatically after 5 minutes.

## Security Notes

All API keys are stored as Vercel environment variables.
API keys are never exposed to frontend/client code.
All TMDB calls happen server-side through API routes.
No secrets are committed to GitHub.

## Troubleshooting

If endpoints return 503 (Service Unavailable):
Check that TMDB_API_KEY is set in Vercel environment variables.

If search returns no results:
Check query is at least 2 characters.
Check TMDB API has matching content.

If images don't load:
TMDB poster/backdrop URLs should load directly from TMDB's CDN.

## Support

For TMDB API issues: https://www.themoviedb.org/settings/api
For Vercel issues: https://vercel.com/docs
For this project issues: Check README.md
