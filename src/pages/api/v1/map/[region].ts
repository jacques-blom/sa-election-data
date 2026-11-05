import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { regions, type Region } from '../../../../lib/maps/config.ts';
import { municipalityResults, ballotResults, reporting, freshness } from '../../../../lib/places/results.ts';
import { wardNumber, wardUrl } from '../../../../lib/places/catalogue.ts';
import { partyLogo } from '../../../../lib/parties/logos.ts';
export const GET: APIRoute = async ({ params }) => {
    if (!Object.hasOwn(regions, params.region ?? ''))
        return Response.json({ error: 'Unknown map region' }, { status: 404 });
    const region = params.region as Region;
    try {
        const results = await municipalityResults(env.RESULTS_DB, regions[region].municipalityId, env.RAW_RESULTS);
        if (!results.length)
            return Response.json({ error: 'Results unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
        return Response.json({ region, year: 2026, status: 'provisional', wards: results.filter(r => r.level === 'ward').map(r => {
                const ballot = ballotResults(r, 'ward');
                return { id: r.id, number: wardNumber(r.id), url: wardUrl(r.id), total: ballot.total, progress: reporting(r), freshness: freshness(r), source: r.source,
                    parties: ballot.parties.slice(0, 3).map(p => ({ name: p.party_name, logo: partyLogo(p), candidate: p.candidate_name, votes: p.votesForBallot, share: p.share })),
                    note: 'Whole ward, ward ballot only. Provisional figures do not establish an elected winner.' };
            }) }, { headers: { 'Cache-Control': 'public, max-age=15, s-maxage=15', 'Access-Control-Allow-Origin': '*' } });
    }
    catch (e) {
        console.error('Map results unavailable', e);
        return Response.json({ error: 'Results temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
};
