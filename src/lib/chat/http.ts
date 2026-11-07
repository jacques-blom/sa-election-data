import { threadIdSchema } from './contracts.ts';

export const chatHeaders = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
export const chatError = (error: string, status: number) => Response.json({ error }, { status, headers: chatHeaders });
export async function ownerHash(request: Request): Promise<string | null> {
  const parsed = threadIdSchema.safeParse(request.headers.get('X-Chat-Key'));
  if (!parsed.success) return null;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parsed.data));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}
