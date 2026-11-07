import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const destination = fileURLToPath(new URL('../public/', import.meta.url));
// Resolved from the repository root below; keep copies with the editable film.
const repoPublic = fileURLToPath(new URL('../../../public/', import.meta.url));
for (const directory of ['sprites', 'fonts', 'gameplay', 'audio']) mkdirSync(`${destination}${directory}`, { recursive: true });
for (const file of ['leaders-expressions-v4.webp','leaders-walk-v4.webp','speaker-frames-v3.webp','council-chamber-v2.webp','random-die-pixel.webp']) {
  cpSync(`${repoPublic}images/coalition/${file}`, `${destination}sprites/${file}`);
}
for (const file of ['Silkscreen-Regular.ttf', 'Silkscreen-LICENSE.txt', 'SpaceGrotesk.ttf']) cpSync(`${repoPublic}fonts/${file}`, `${destination}fonts/${file}`);
