import type { ChatEvent } from './contracts.ts';

export const TEXT_BATCH_MS = 100;
export const TEXT_BATCH_BYTES = 4096;

/** One generation's text buffer. Only the sink publishes persisted events. */
export class TextBatcher {
  private text = '';
  private bytes = 0;
  private first = true;
  private closed = false;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly encoder = new TextEncoder();
  private readonly sink: (event: ChatEvent) => void;
  private readonly onTimerError: (error: unknown) => void;

  constructor(sink: (event: ChatEvent) => void, onTimerError: (error: unknown) => void) {
    this.sink = sink; this.onTimerError = onTimerError;
  }

  emit(event: ChatEvent) {
    if (this.closed) return;
    if (event.type !== 'text') {
      this.flush();
      if (event.type === 'done' || event.type === 'error') this.dispose();
      this.sink(event);
      return;
    }
    if (!event.text) return;
    this.text += event.text;
    this.bytes += this.encoder.encode(event.text).byteLength;
    if (this.first || this.bytes >= TEXT_BATCH_BYTES) {
      this.first = false;
      this.flush();
    } else if (!this.timer) {
      // A fixed deadline from the first buffered fragment, never a debounce.
      this.timer = setTimeout(() => {
        try { this.flush(); }
        catch (error) { this.dispose(); this.onTimerError(error); }
      }, TEXT_BATCH_MS);
    }
  }

  flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    if (!this.text) return;
    const text = this.text;
    this.text = ''; this.bytes = 0;
    this.sink({ type: 'text', text });
  }

  dispose() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = undefined;
    this.text = ''; this.bytes = 0; this.closed = true;
  }
}
