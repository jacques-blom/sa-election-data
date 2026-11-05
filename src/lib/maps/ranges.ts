/** A single HTTP range. End offsets are inclusive; invalid/unsatisfiable ranges return null. */
export function byteRange(header: string, size: number): {
    offset: number;
    length: number;
} | null {
    const m = /^bytes=(\d*)-(\d*)$/.exec(header);
    if (!m || (!m[1] && !m[2]) || size <= 0)
        return null;
    if (!m[1]) {
        const n = Number(m[2]);
        return Number.isSafeInteger(n) && n > 0 ? { offset: Math.max(0, size - n), length: Math.min(size, n) } : null;
    }
    const start = Number(m[1]), end = m[2] ? Number(m[2]) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start)
        return null;
    return { offset: start, length: Math.min(end, size - 1) - start + 1 };
}
