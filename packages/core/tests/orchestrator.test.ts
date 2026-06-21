import { afterEach, describe, expect, it, vi } from "vitest";
import { runTicket } from "../src/orchestrator.js";
import type { SupportTicket, TraceEvent } from "../src/types.js";

const ticket: SupportTicket = { id: "T-4471", body: "My last invoice has the wrong amount on it." };

/**
 * Stubs global fetch to return canned responses in sequence: router,
 * specialist, synthesizer — mirroring the three calls the orchestrator
 * makes per ticket.
 */
function stubFetchSequence(responses: string[]) {
  let call = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      const text = responses[call++] ?? responses[responses.length - 1];
      return {
        ok: true,
        json: async () => ({ content: [{ type: "text", text }] }),
        text: async () => text,
      } as Response;
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("runTicket", () => {
  it("runs router -> specialist -> synthesizer and returns a resolution", async () => {
    stubFetchSequence([
      JSON.stringify({ category: "billing", confidence: 0.9, reasoning: "Invoice amount dispute." }),
      JSON.stringify({
        draftResolution: "Recalculate the invoice and issue a credit for the difference.",
        requiresEscalation: false,
        reasoning: "Routine billing correction.",
      }),
      JSON.stringify({
        customerReply: "Thanks for flagging this — we've corrected your invoice and applied a credit.",
        internalSummary: "Billing error corrected, credit applied.",
        status: "resolved",
      }),
    ]);

    const events: TraceEvent[] = [];
    const { resolution, trace } = await runTicket(ticket, {
      apiKey: "test-key",
      onTrace: (event) => events.push(event),
    });

    expect(resolution.status).toBe("resolved");
    expect(trace.filter((e) => e.status === "completed")).toHaveLength(3);
    expect(events).toHaveLength(trace.length);
  });

  it("propagates a failure from the router and stops the pipeline", async () => {
    stubFetchSequence(["not valid json"]);

    await expect(runTicket(ticket, { apiKey: "test-key" })).rejects.toThrow();
  });
});
