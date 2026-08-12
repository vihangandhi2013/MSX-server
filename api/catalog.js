import { handleRequest, successResponse, errorResponse } from './lib/errors.js';

const CATALOG_STRUCTURE = {
  pages: [
    {
      title: 'Home',
      items: [
        {
          title: '🌐 Browser',
          action: 'https://msx-server-vwwx.vercel.app/browser/',
        },
        {
          title: 'Popular Movies',
          action: 'content://movies/popular',
        },
        {
          title: 'Popular TV Shows',
          action: 'content://tv/popular',
        },
        {
          title: 'Search Movies',
          action: 'content://movies/search',
        },
        {
          title: 'Search TV Shows',
          action: 'content://tv/search',
        },
        {
          title: 'Football',
          action: 'content://sports/football',
        },
        {
          title: 'Cricket',
          action: 'content://sports/cricket',
        },
        {
          title: 'F1',
          action: 'content://sports/f1',
        },
      ],
    },
  ],
};

export default async function handler(req, res) {
  await handleRequest(req, res, async () => {
    if (!process.env.TMDB_API_KEY) {
      return errorResponse(
        res,
        503,
        'Media services not available',
        'TMDB_API_KEY is not configured'
      );
    }

    successResponse(res, CATALOG_STRUCTURE);
  });
}
