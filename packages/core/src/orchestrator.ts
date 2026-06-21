import { createAnthropicClient, type AnthropicClientOptions } from "./anthropic-client.js";
import { runRouter } from "./agents/router.js";
import { specialistAgents } from "./agents/specialists.js";
import { runSynthesizer } from "./agents/synthesizer.js";
import type { FinalResolution, SupportTicket, TraceEvent, TraceListener } from "./types.js";

export interface RunTicketOptions extends AnthropicClientOptions {
  onTrace?: TraceListener;
}

export interface RunTicketResult {
  resolution: FinalResolution;
  trace: TraceEvent[];
}

function emit(listener: TraceListener | undefined, event: TraceEvent, into: TraceEvent[]) {
  into.push(event);
  listener?.(event);
}

/**
 * Runs a single support ticket through the full Concord pipeline:
 *
 *   1. Router classifies the ticket into a category.
 *   2. The matching specialist drafts an internal resolution.
 *   3. The synthesizer turns that draft into a customer-facing reply.
 *
 * Each step's start/completion/failure is emitted via `onTrace`, which is
 * how the web demo renders the live dispatch board. The full trace is also
 * returned for callers that just want the final transcript (CLI, tests).
 */
export async function runTicket(
  ticket: SupportTicket,
  options: RunTicketOptions,
): Promise<RunTicketResult> {
  const { onTrace, ...clientOptions } = options;
  const client = createAnthropicClient(clientOptions);
  const trace: TraceEvent[] = [];

  emit(onTrace, { role: "router", agentName: "Router", status: "started", timestamp: Date.now() }, trace);
  let routerDecision;
  try {
    routerDecision = await runRouter(client, ticket);
    emit(
      onTrace,
      { role: "router", agentName: "Router", status: "completed", output: routerDecision, timestamp: Date.now() },
      trace,
    );
  } catch (error) {
    emit(
      onTrace,
      { role: "router", agentName: "Router", status: "failed", error: String(error), timestamp: Date.now() },
      trace,
    );
    throw error;
  }

  const specialistName = `${routerDecision.category[0].toUpperCase()}${routerDecision.category.slice(1)} Specialist`;
  emit(
    onTrace,
    { role: "specialist", agentName: specialistName, status: "started", timestamp: Date.now() },
    trace,
  );
  let specialistDraft;
  try {
    specialistDraft = await specialistAgents[routerDecision.category](client, ticket);
    emit(
      onTrace,
      {
        role: "specialist",
        agentName: specialistName,
        status: "completed",
        output: specialistDraft,
        timestamp: Date.now(),
      },
      trace,
    );
  } catch (error) {
    emit(
      onTrace,
      { role: "specialist", agentName: specialistName, status: "failed", error: String(error), timestamp: Date.now() },
      trace,
    );
    throw error;
  }

  emit(
    onTrace,
    { role: "synthesizer", agentName: "Synthesizer", status: "started", timestamp: Date.now() },
    trace,
  );
  try {
    const resolution = await runSynthesizer(client, ticket, routerDecision, specialistDraft);
    emit(
      onTrace,
      { role: "synthesizer", agentName: "Synthesizer", status: "completed", output: resolution, timestamp: Date.now() },
      trace,
    );
    return { resolution, trace };
  } catch (error) {
    emit(
      onTrace,
      { role: "synthesizer", agentName: "Synthesizer", status: "failed", error: String(error), timestamp: Date.now() },
      trace,
    );
    throw error;
  }
}
