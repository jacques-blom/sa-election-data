type Council = { id: string; status: string; href: string };

/** Each ready council gets one place in the shuffle, independent of party or size. */
export async function randomPlayableCouncil<T extends Council>(
  councils: T[], exclude: string | null, playable: (council: T) => Promise<boolean>, random = Math.random,
): Promise<T | null> {
  const candidates = councils.filter(c => c.id !== exclude && ['reported', 'estimated'].includes(c.status));
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j]!, candidates[i]!];
  }
  // Bound data reads if the directory is stale or the result store is unavailable.
  for (const candidate of candidates.slice(0, 8)) {
    try { if (await playable(candidate)) return candidate; }
    catch { /* A failed read must not send the player to an unusable council. */ }
  }
  return null;
}
