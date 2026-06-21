import { createAnthropicClient } from "../anthropic-client.js";

/** The object shape returned by `createAnthropicClient` — one `complete` method. */
export type AnthropicClient = ReturnType<typeof createAnthropicClient>;
