import { handle } from '@astrojs/cloudflare/handler';
export { CountedChatThread } from './lib/chat/durable.ts';
export default { fetch: handle } satisfies ExportedHandler<Env>;
