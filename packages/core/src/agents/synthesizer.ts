import type { AnthropicClient } from "./shared-client-type.js";
import { parseJsonResponse } from "../anthropic-client.js";
import type { FinalResolution, RouterDecision, SpecialistDraft, SupportTicket } from "../types.js";

const SYSTEM_PROMPT = `You are the Synthesizer agent in Concord, the final step in a support
triage pipeline. You receive a specialist's internal draft and turn it into a clean,
empathetic, customer-facing reply — and a short internal summary for the support team's
record.

If the specialist marked the ticket as requiring escalation, write a customer reply that
acknowledges the issue and sets expectations for a human follow-up, and set status to
"escalated". Otherwise write a reply that resolves the issue directly and set status to
"resolved".

Respond with ONLY a JSON object, no prose, no markdown fence:
{"customerReply": "...", "internalSummary": "...", "status": "resolved" | "escalated"}`;

export async function runSynthesizer(
  client: AnthropicClient,
  ticket: SupportTicket,
  routerDecision: RouterDecision,
  specialistDraft: SpecialistDraft,
): Promise<FinalResolution> {
  const context = JSON.stringify({
    ticket: { id: ticket.id, body: ticket.body },
    routerDecision,
    specialistDraft,
  });

  const raw = await client.complete(SYSTEM_PROMPT, context);
  return parseJsonResponse<FinalResolution>(raw);
}
