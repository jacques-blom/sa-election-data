import type { APIRoute } from 'astro';

// Start in the council featured in the trailer. The game's picker and dice
// let players move straight to another municipality from there.
export const GET: APIRoute = () => new Response(null, {
  status: 302,
  headers: {
    Location: '/2026/places/johannesburg/coalition',
    'Cache-Control': 'public, max-age=300',
  },
});
