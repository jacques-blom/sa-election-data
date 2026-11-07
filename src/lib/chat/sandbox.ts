import { transform } from 'sucrase';
import type { QuickJSWASMModule } from 'quickjs-emscripten-core';

/** The only guest input is JSON. No host functions, network, filesystem or credentials. */
export function analyse(quickjs: QuickJSWASMModule, source: string, datasets: Record<string, unknown>, signal?: AbortSignal) {
  if (source.length > 12000) throw new Error('Analysis code is too long.');
  const input = JSON.stringify(datasets);
  if (input.length > 500_000) throw new Error('Select fewer datasets for this analysis.');
  signal?.throwIfAborted();
  const code = transform(source, { transforms: ['typescript'], disableESTransforms: true, filePath: 'analysis.ts' }).code;
  const runtime = quickjs.newRuntime();
  runtime.setMemoryLimit(16 * 1024 * 1024);
  runtime.setMaxStackSize(256 * 1024);
  // Date.now() can be fixed during synchronous execution on Workers. The interrupt
  // count is an independent instruction budget, so infinite loops still terminate.
  let interrupts = 0;
  const deadline = Date.now() + 1000;
  runtime.setInterruptHandler(() => ++interrupts > 500 || Date.now() > deadline || !!signal?.aborted);
  const context = runtime.newContext();
  try {
    const result = context.evalCode(`"use strict"; const datasets = JSON.parse(${JSON.stringify(input)});\n` +
      `JSON.stringify((() => {\n${code}\n})())`, 'analysis.js');
    if (result.error) {
      // Only guest exception messages cross the boundary, never host stacks.
      const error = context.dump(result.error) as { message?: string };
      result.error.dispose();
      throw new Error(`Analysis stopped: ${(error?.message ?? 'invalid computation').slice(0, 200)}`);
    }
    try {
      const json = context.getString(result.value);
      if (!json || json === 'undefined') throw new Error('Return a JSON value from the script.');
      if (json.length > 32_000) throw new Error('Return a smaller result (maximum 32,000 characters).');
      return JSON.parse(json) as unknown;
    } finally { result.value.dispose(); }
  } finally { context.dispose(); runtime.dispose(); }
}
