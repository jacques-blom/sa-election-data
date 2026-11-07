export async function readBoundedJson(request: Pick<Request, 'body'>, maxBytes = 32_768): Promise<unknown> {
  if (!request.body) throw new Error('empty');
  const reader = request.body.getReader(), decoder = new TextDecoder();
  let size = 0, body = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error('too_large');
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

export function boundedSetting(value: string | undefined, fallback: number, max: number) {
  const number = Number(value);
  return value && Number.isInteger(number) && number >= 1 && number <= max ? number : fallback;
}

/** Local testing has its own allowance; production retains its configured cap. */
export function turnLimits(configured: string | undefined, localTestLimit = 0) {
  return localTestLimit === 100 ? { daily: 100, visitor: 100 }
    : { daily: boundedSetting(configured, 25, 500), visitor: 10 };
}

/** Shared, atomic D1 counters; no isolate-local limiter and no saved prompts/IPs. */
export async function reserveTurn(db: D1Database, ip: string, secret: string, dailyLimit: number, now = Date.now(), visitorLimit = 10) {
  const day = new Date(now).toISOString().slice(0, 10);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${day}:${ip}`));
  const visitor = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  const reserve = (bucket: string, cap: number) => db.prepare(`INSERT INTO chat_usage (bucket, day, turns) VALUES (?, ?, 1)
    ON CONFLICT (bucket, day) DO UPDATE SET turns=turns+1 WHERE turns < ? RETURNING turns`).bind(bucket, day, cap);
  // Failed attempts consume a reservation in any other bucket that succeeds.
  // This is deliberately conservative: concurrency can never overspend the caps.
  const global = await reserve('global', dailyLimit).first<{ turns: number }>();
  if (!global) return false;
  const results = await db.batch<{ turns: number }>([
    reserve(`visitor:${visitor}`, boundedSetting(String(visitorLimit), 10, 100)),
    reserve(`minute:${visitor}:${Math.floor(now / 60_000)}`, 3),
  ]);
  if (results.some(result => !result.results.length)) return false;
  if (global.turns === 1) {
    await db.prepare('DELETE FROM chat_usage WHERE day < ?').bind(new Date(now - 2 * 86400_000).toISOString().slice(0, 10)).run();
  }
  return true;
}
