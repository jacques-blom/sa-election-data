import type { CallToolResult } from '@modelcontextprotocol/server';
import { Buffer } from 'node:buffer';
import { DataError, type DataReader } from '../data.ts';
import { resultImage, type ResultImage } from './model.ts';
import { imageDimensions, resultImageSvg } from './svg.ts';
import { publicUrl } from '../../site.ts';
import type { Level } from '../../data/normalize.ts';
import type { RequestedBallot } from '../summaries.ts';
import { changeImage, areaComparisonImage } from './comparison.ts';
import { councilImage } from './council.ts';

export type ResultsImageArgs = { year: number; level: Level; area_id: string; ballot: RequestedBallot; top: number; party_id?: string };
export type ComparisonImageArgs = { year: number; level: Level; area_ids: string[]; ballot: RequestedBallot;
  mode: 'previous_election' | 'areas'; top: number; party_id?: string };
export type CouncilImageArgs = { year: number; municipality_id: string; selected_party_ids: string[] };
export type PngRenderer = (svg: string) => Uint8Array;
export const imagePrefix = 'mcp-images/v1/';
export const maxPngBytes = 2 * 1024 * 1024;

export function createImageService(reader: DataReader, bucket: R2Bucket, render?: PngRenderer) {
  async function publish(model: ResultImage): Promise<CallToolResult> {
    if (!render) throw new DataError(503, 'Image rendering is temporarily unavailable.');
    const json = JSON.stringify(model);
    if (new TextEncoder().encode(json).length > 256 * 1024) throw new DataError(422, 'This chart contains too much data. Request a smaller chart.');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
    const id = Buffer.from(digest).toString('hex');
    const key = `${imagePrefix}${id}`;
    const existing = await bucket.get(`${key}.png`);
    if (existing && existing.size > maxPngBytes) throw new DataError(503, 'Stored image exceeds the size limit.');
    const png = existing ? new Uint8Array(await existing.arrayBuffer()) : render(resultImageSvg(model));
    if (png.byteLength > maxPngBytes) throw new DataError(422, 'The rendered image exceeds the size limit.');
    if (!existing) {
      // Publish the evidence first; no returned image URL can lack its chart data.
      await bucket.put(`${key}.json`, json, { httpMetadata: { contentType: 'application/json' } });
      await bucket.put(`${key}.png`, png, { httpMetadata: { contentType: 'image/png' } });
    }
    const image_url = publicUrl(`/images/results/${id}.png`);
    const data_url = publicUrl(`/images/results/${id}.json`);
    const structuredContent = { data: { image_url, mime_type: 'image/png', ...imageDimensions(model),
      alt_text: model.alt, image_markdown: `![${model.title.replace(/[\[\]\n\r]/g, '')} election chart](${image_url})`,
      snapshot_id: id, chart: model,
      display_instruction: 'The MCP Apps viewer displays this exact PNG. In clients without the viewer, embed image_markdown and provide download links. A link alone is not an inline image; do not claim it is displayed if the host does not render it. Preserve status and caveats.' },
      data_url, documentation_url: publicUrl('/api'), retrieved_at: new Date().toISOString() };
    return { structuredContent, content: [
      { type: 'text', text: JSON.stringify(structuredContent) },
      { type: 'image', data: Buffer.from(png).toString('base64'), mimeType: 'image/png' },
    ] };
  }
  return {
    async results(args: ResultsImageArgs) {
      if ((args.level === 'national') !== (args.area_id === 'ZA')) throw new DataError(400, 'Use ZA only for national results.');
      const summary = await reader.summary(args.year, args.level, args.area_id, args.ballot, 2000, 0);
      return publish(resultImage(summary, args.top, args.party_id));
    },
    async comparison(args: ComparisonImageArgs) {
      if (new Set(args.area_ids).size !== args.area_ids.length) throw new DataError(400, 'Area IDs must be distinct.');
      if (args.area_ids.some(id => (args.level === 'national') !== (id === 'ZA'))) throw new DataError(400, 'Use ZA only for national results.');
      if (args.mode === 'previous_election' && args.area_ids.length !== 1) throw new DataError(400, 'Previous-election charts require exactly one area.');
      if (args.mode === 'areas' && (args.area_ids.length < 2 || !args.party_id || args.party_id === '0')) throw new DataError(400, 'Area comparisons require at least two areas and a named party_id.');
      const summaries = await Promise.all(args.area_ids.map(id => reader.summary(args.year, args.level, id, args.ballot, 2000, 0)));
      return publish(args.mode === 'previous_election' ? changeImage(summaries[0]!, args.top, args.party_id) : areaComparisonImage(summaries, args.party_id!));
    },
    async council(args: CouncilImageArgs) {
      const summary = await reader.summary(args.year, 'municipality', args.municipality_id, 'auto', 2000, 0);
      return publish(councilImage(summary, args.selected_party_ids));
    },
  };
}
export type ImageService = ReturnType<typeof createImageService>;
