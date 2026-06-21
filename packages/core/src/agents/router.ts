import type { AnthropicClient } from "./shared-client-type.js";
import { parseJsonResponse } from "../anthropic-client.js";
import type { RouterDecision, SupportTicket } from "../types.js";

const SYSTEM_PROMPT = `You are the Router agent in Concord, a multi-agent support triage system.

Your only job is to classify an incoming support ticket into exactly one category:
- "billing": payments, invoices, refunds, subscription charges, pricing disputes.
- "technical": bugs, errors, integration issues, things not working as documented.
- "account": login, access, permissions, profile or settings changes.
- "general": anything that doesn't clearly fit the above, including pure questions.

Respond with ONLY a JSON object, no prose, no markdown fence:
{"category": "billing" | "technical" | "account" | "general", "confidence": 0.0-1.0, "reasoning": "one sentence"}`;

export async function runRouter(
  client: AnthropicClient,
  ticket: SupportTicket,
): Promise<RouterDecision> {
  const raw = await client.complete(SYSTEM_PROMPT, ticket.body);
  const decision = parseJsonResponse<RouterDecision>(raw);

  if (!["billing", "technical", "account", "general"].includes(decision.category)) {
    throw new Error(`Router returned an unrecognized category: ${decision.category}`);
  }

  return decision;
}
