from pathlib import Path
import zipfile
root=Path(__file__).resolve().parents[1]
out=root/'out/counted-councils-source.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
    for item in sorted(root.rglob('*')):
        rel=item.relative_to(root)
        if not item.is_file() or any(part in ('node_modules','out','__pycache__') for part in rel.parts):continue
        archive.write(item,'council-focus/'+str(rel))
print(out)
