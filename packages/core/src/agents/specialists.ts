import type { AnthropicClient } from "./shared-client-type.js";
import { parseJsonResponse } from "../anthropic-client.js";
import type { SpecialistCategory, SpecialistDraft, SupportTicket } from "../types.js";

const RESPONSE_CONTRACT = `Respond with ONLY a JSON object, no prose, no markdown fence:
{"draftResolution": "...", "requiresEscalation": true | false, "reasoning": "one sentence"}`;

const DOMAIN_PROMPTS: Record<SpecialistCategory, string> = {
  billing: `You are the Billing specialist agent in Concord. You handle payments, invoices,
refunds, subscription charges, and pricing disputes. Propose a concrete resolution
(e.g. issue a refund, explain a charge, adjust a plan). Set requiresEscalation to true
for anything involving a refund over a small, routine amount, suspected fraud, or a
customer who is explicitly angry about money.`,

  technical: `You are the Technical specialist agent in Concord. You handle bugs, errors,
integration issues, and anything not working as documented. Propose a concrete fix or
clear next diagnostic step. Set requiresEscalation to true if the issue suggests a
production outage, data loss, or a security concern.`,

  account: `You are the Account specialist agent in Concord. You handle login, access,
permissions, and profile or settings changes. Propose a concrete resolution. Set
requiresEscalation to true if the request involves account ownership disputes,
identity verification, or anything affecting a customer's ability to access billing data.`,

  general: `You are the General specialist agent in Concord. You handle requests that
don't clearly belong to billing, technical, or account issues — including product
questions and feedback. Propose a concrete, helpful response. Set requiresEscalation
to true only if the request is clearly outside what a support agent can answer.`,
};

export function createSpecialistAgent(category: SpecialistCategory) {
  const systemPrompt = `${DOMAIN_PROMPTS[category]}\n\n${RESPONSE_CONTRACT}`;

  return async function run(
    client: AnthropicClient,
    ticket: SupportTicket,
  ): Promise<SpecialistDraft> {
    const raw = await client.complete(systemPrompt, ticket.body);
    const parsed = parseJsonResponse<Omit<SpecialistDraft, "category">>(raw);
    return { category, ...parsed };
  };
}

export const specialistAgents: Record<
  SpecialistCategory,
  ReturnType<typeof createSpecialistAgent>
> = {
  billing: createSpecialistAgent("billing"),
  technical: createSpecialistAgent("technical"),
  account: createSpecialistAgent("account"),
  general: createSpecialistAgent("general"),
};
