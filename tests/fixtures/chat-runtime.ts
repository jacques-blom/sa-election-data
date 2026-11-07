import variant from '@jitl/quickjs-wasmfile-release-sync';
import wasm from '../../node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.wasm';
import { newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import { analyse } from '../../src/lib/chat/sandbox.ts';

const quickjs = await newQuickJSWASMModuleFromVariant(newVariant(variant, { wasmModule: wasm }));
export default {
  fetch(request: Request) {
    try {
      const code = new URL(request.url).pathname === '/loop' ? 'while (true) {}' : 'const n: number = datasets.sample.reduce((a,b) => a+b, 0); return {n, network: typeof fetch};';
      return Response.json(analyse(quickjs, code, { sample: [7, 9, 11] }));
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'failed' }, { status: 422 }); }
  },
};
