import variant from '@jitl/quickjs-wasmfile-release-sync';
import wasm from '@counted/quickjs.wasm';
import { newQuickJSWASMModuleFromVariant, newVariant } from 'quickjs-emscripten-core';
import { analyse } from './sandbox.ts';

// A statically bundled module: Workers never compiles arbitrary host JavaScript.
const quickjs = await newQuickJSWASMModuleFromVariant(newVariant(variant, { wasmModule: wasm }));
export const runAnalysis = (code: string, datasets: Record<string, unknown>, signal?: AbortSignal) => analyse(quickjs, code, datasets, signal);
