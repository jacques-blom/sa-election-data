import { open } from 'node:fs/promises';
import { getPlatformProxy } from 'wrangler';
import { BASEMAP_KEY, WARDS_KEY } from '../../src/lib/maps/config.ts';
const key = process.argv.includes('--wards') ? WARDS_KEY : BASEMAP_KEY;
const proxy = await getPlatformProxy<Env>({ configPath: 'wrangler.jsonc', persist: { path: '.wrangler/state/v3' }, remoteBindings: false });
const file = await open(`.data/maps/${key}`, 'r');
let upload: R2MultipartUpload | undefined;
try {
    const { size } = await file.stat();
    upload = await proxy.env.MAP_TILES.createMultipartUpload(key, { httpMetadata: { contentType: 'application/octet-stream', cacheControl: 'public, max-age=31536000, immutable' } });
    const parts: R2UploadedPart[] = [];
    for (let offset = 0; offset < size; offset += 8 * 1024 * 1024) {
        const buffer = Buffer.alloc(Math.min(8 * 1024 * 1024, size - offset));
        await file.read(buffer, 0, buffer.length, offset);
        parts.push(await upload.uploadPart(parts.length + 1, buffer));
        if (parts.length % 10 === 0)
            console.log(`Loaded ${parts.length} parts`);
    }
    await upload.complete(parts);
    console.log(`Local R2 loaded: ${key} (${size} bytes)`);
}
catch (e) {
    await upload?.abort();
    throw e;
}
finally {
    await file.close();
    await proxy.dispose();
}
