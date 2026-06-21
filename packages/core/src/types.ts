/**
 * Core domain types for Concord's multi-agent orchestration engine.
 *
 * The pipeline is intentionally linear and inspectable:
 *   Ticket -> Router -> Specialist -> Synthesizer -> Resolution
 *
 * Every step emits a `TraceEvent`, which is how the web UI renders the
 * live "dispatch board" view of agents handing work off to one another.
 */

export type SpecialistCategory =
  | "billing"
  | "technical"
  | "account"
  | "general";

export interface SupportTicket {
  /** Short, human-assigned identifier shown in the UI, e.g. "T-4471". */
  id: string;
  /** Raw text of the customer's request. */
  body: string;
  /** Optional metadata a real integration (Zendesk, Intercom, etc.) would supply. */
  customerTier?: "free" | "pro" | "enterprise";
}

export interface RouterDecision {
  category: SpecialistCategory;
  /** 0-1 confidence the router has in this classification. */
  confidence: number;
  /** One-sentence rationale, surfaced in the trace for auditability. */
  reasoning: string;
}

export interface SpecialistDraft {
  category: SpecialistCategory;
  /** The specialist's proposed resolution, not yet customer-facing. */
  draftResolution: string;
  /** Whether the specialist believes this needs a human in the loop. */
  requiresEscalation: boolean;
  reasoning: string;
}

export interface FinalResolution {
  /** Customer-facing reply, ready to send. */
  customerReply: string;
  /** Internal-only summary for the support team's record. */
  internalSummary: string;
  status: "resolved" | "escalated";
}

export type AgentRole = "router" | "specialist" | "synthesizer";

/**
 * A single step in the pipeline, emitted as it happens so a caller
 * (CLI, web UI, tests) can observe progress in real time.
 */
export interface TraceEvent {
  role: AgentRole;
  agentName: string;
  status: "started" | "completed" | "failed";
  /** Present once status is "completed". Shape depends on role. */
  output?: RouterDecision | SpecialistDraft | FinalResolution;
  error?: string;
  timestamp: number;
}

export type TraceListener = (event: TraceEvent) => void;

/** Minimal shape of an Anthropic Messages API response we depend on. */
export interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>;
}
