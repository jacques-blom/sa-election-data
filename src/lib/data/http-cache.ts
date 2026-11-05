// If-None-Match uses weak comparison for GET/HEAD. Cloudflare can weaken a
// strong ETag when compressing the response, without changing its JSON data.
export function matchesIfNoneMatch(header: string | null, etag: string) {
  const normalized = etag.replace(/^W\//, '');
  return header?.split(',').some((value) => {
    const tag = value.trim();
    return tag === '*' || tag.replace(/^W\//, '') === normalized;
  }) ?? false;
}
