/** Semicircular layout from the coalition mockup; one point per council seat. */
export function councilPoints(total: number) {
  if (!Number.isSafeInteger(total) || total < 1 || total > 1000) return [];
  const rows = total > 150 ? 7 : total < 45 ? 4 : 5;
  const radii = Array.from({ length: rows }, (_, i) => 42 + i * 100 / (rows - 1));
  const sum = radii.reduce((a, b) => a + b, 0);
  const points: { x: number; y: number; angle: number }[] = [];
  let remaining = total;
  radii.forEach((radius, row) => {
    const n = row === rows - 1 ? remaining : Math.min(remaining, Math.round(total * radius / sum));
    remaining -= n;
    for (let j = 0; j < n; j++) {
      const angle = n === 1 ? Math.PI / 2 : Math.PI - j / (n - 1) * Math.PI;
      points.push({ x: 160 + Math.cos(angle) * radius, y: 151 - Math.sin(angle) * radius, angle });
    }
  });
  return points.sort((a, b) => b.angle - a.angle);
}
