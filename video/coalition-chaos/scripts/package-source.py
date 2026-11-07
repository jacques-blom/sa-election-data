"""Package both editable compositions and their current source recordings."""
from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parents[1]
files = [root / name for name in [
    'package.json', 'package-lock.json', 'tsconfig.json', 'remotion.config.ts',
    '.gitignore', 'README.md',
]]
for directory in ['src', 'scripts', 'public/sprites', 'public/fonts', 'public/audio']:
    files.extend(p for p in (root / directory).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
metadata = root / 'public/gameplay/source.json'
files.append(metadata)
files.extend((root / 'public/gameplay').glob('*-edit.json'))
for recording in json.loads(metadata.read_text())['recordings']:
    files.append(root / 'public/gameplay' / recording['file'])
output = root / 'out/coalition-chaos-source.zip'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(set(files)):
        archive.write(path, Path('coalition-chaos') / path.relative_to(root))
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
print(f'Editable source ZIP: {output.stat().st_size:,} bytes')
