import apiDocumentation from '../../../docs/api.md?raw';
import { PersistentChatThread } from './thread.ts';
import { chatEnabled } from './availability.ts';
import { runNativeChat } from './native-agent.ts';
import { runAnalysis } from './sandbox-worker.ts';
import { renderSvgImage } from '../og/render.ts';
import type { ChatEvent, ChatMessage } from './contracts.ts';

export class CountedChatThread extends PersistentChatThread {
  protected async generate(messages: ChatMessage[], signal: AbortSignal, emit: (event: ChatEvent) => void) {
    if (!chatEnabled) throw new Error('AI inference is disabled in production.');
    let cache: Cache | undefined;
    try { cache = await caches.open('counted-chat-v1'); } catch { /* R2 still caches public chart artifacts. */ }
    await runNativeChat({ messages, signal, emit, apiKey: this.env.OPENROUTER_API_KEY, modelId: this.env.CHAT_MODEL,
      bindings: this.env, origin: 'https://counted.co.za', documentation: apiDocumentation,
      renderImage: renderSvgImage, runAnalysis, cache });
  }
}
