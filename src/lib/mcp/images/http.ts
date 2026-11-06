import { imagePrefix } from './service.ts';
import { matchesIfNoneMatch } from '../../data/http-cache.ts';

/** Only generated public chart objects are addressable; never expose raw bucket keys. */
export async function readResultImage(request: Request, filename: string, bucket: R2Bucket) {
  const missing = () => new Response('Image not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } });
  if (!/^[a-f0-9]{64}\.(png|json)$/.test(filename)) return missing();
  const object = await bucket.get(imagePrefix + filename);
  if (!object) return missing();
  const headers = new Headers({ 'Content-Type': filename.endsWith('.png') ? 'image/png' : 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=31536000, immutable', 'ETag': object.httpEtag,
    'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff',
    'Content-Disposition': `inline; filename="counted-${filename}"` });
  if (matchesIfNoneMatch(request.headers.get('If-None-Match'), object.httpEtag)) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
