export interface ReportingProgress { completed: number; expected: number; percent: number }

// An unfinished count must never round up to 100%.
export const progressLabel = (p: ReportingProgress | null) => p === null ? 'Unavailable'
  : (p.completed === p.expected ? 100 : Math.min(99.9, Math.round(p.percent * 10) / 10)).toFixed(1) + '%';
