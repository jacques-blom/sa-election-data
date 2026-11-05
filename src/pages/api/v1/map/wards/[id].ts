import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { findMapWard } from '../../../../../lib/maps/ward-catalogue.ts';
import { getWardResults, ballotResults, reporting, freshness } from '../../../../../lib/places/results.ts';
import { wardUrl } from '../../../../../lib/places/catalogue.ts';
import type { MapWardResponse } from '../../../../../lib/maps/ward-types.ts';
import { partyLogo } from '../../../../../lib/parties/logos.ts';
export const GET: APIRoute = async ({ params }) => {
  const ward = findMapWard(params.id ?? '');
  if (!ward) return Response.json({ error: 'Unknown ward' }, { status: 404 });
  try {
    const row = await getWardResults(env.RESULTS_DB, ward.id, env.RAW_RESULTS);
    const ballot = row ? ballotResults(row, 'ward') : null;
    const body: MapWardResponse = {
      year: 2026, status: 'provisional', ward, url: wardUrl(ward.id),
      result: row && ballot ? {
        total: ballot.total, progress: reporting(row), freshness: freshness(row), source: row.source,
        parties: ballot.parties.slice(0, 3).map(p => ({ name: p.party_name, logo: partyLogo(p), candidate: p.candidate_name, votes: p.votesForBallot, share: p.share })),
      } : null,
    };
    return Response.json(body, { headers: { 'Cache-Control': 'public, max-age=15, s-maxage=15', 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    console.error('Map ward unavailable', { id: ward.id, error });
    return Response.json({ error: 'Results temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
};
