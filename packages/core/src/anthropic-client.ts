import type { AnthropicMessageResponse } from "./types.js";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AnthropicClientOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  /**
   * Required to call the API directly from a browser (no backend proxy).
   * Concord's web demo runs entirely client-side, so this is set to true there.
   * Never enable this in a production app that handles real customer data —
   * it exposes the API key to anyone inspecting network traffic.
   */
  dangerouslyAllowBrowser?: boolean;
}

export class AnthropicRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "AnthropicRequestError";
  }
}

/**
 * Creates a minimal client for issuing single-turn completions against
 * Claude. Concord's agents each get one of these, configured with their
 * own system prompt at call time — there's no shared mutable state, which
 * keeps agents safe to run concurrently.
 */
export function createAnthropicClient(options: AnthropicClientOptions) {
  const { apiKey, model = "claude-sonnet-4-6", maxTokens = 1024 } = options;

  if (!apiKey) {
    throw new AnthropicRequestError(
      "Missing Anthropic API key. Set ANTHROPIC_API_KEY (Node) or supply one in the demo's key field (browser).",
    );
  }

  async function complete(systemPrompt: string, userMessage: string): Promise<string> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    };

    if (options.dangerouslyAllowBrowser) {
      headers["anthropic-dangerous-direct-browser-access"] = "true";
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new AnthropicRequestError(
        `Anthropic API request failed (${response.status}): ${body.slice(0, 300)}`,
        response.status,
      );
    }

    const data = (await response.json()) as AnthropicMessageResponse;
    const textBlock = data.content.find((block) => block.type === "text");

    if (!textBlock?.text) {
      throw new AnthropicRequestError("Anthropic API returned no text content.");
    }

    return textBlock.text;
  }

  return { complete };
}

/**
 * Agents ask the model to respond as JSON-only. Models occasionally wrap
 * that in a markdown fence anyway — this strips it before parsing so a
 * stray ```json``` doesn't crash the pipeline.
 */
export function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (cause) {
    throw new AnthropicRequestError(
      `Could not parse model response as JSON: ${cleaned.slice(0, 200)}`,
    );
  }
}
