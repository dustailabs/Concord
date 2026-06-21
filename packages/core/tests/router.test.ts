import { describe, expect, it } from "vitest";
import { runRouter } from "../src/agents/router.js";
import type { AnthropicClient } from "../src/agents/shared-client-type.js";
import type { SupportTicket } from "../src/types.js";

function fakeClient(response: string): AnthropicClient {
  return { complete: async () => response };
}

const ticket: SupportTicket = { id: "T-1", body: "I was charged twice for my subscription." };

describe("runRouter", () => {
  it("parses a well-formed classification", async () => {
    const client = fakeClient(
      JSON.stringify({ category: "billing", confidence: 0.94, reasoning: "Duplicate charge mentioned." }),
    );

    const decision = await runRouter(client, ticket);

    expect(decision.category).toBe("billing");
    expect(decision.confidence).toBeGreaterThan(0.5);
  });

  it("tolerates a markdown-fenced JSON response", async () => {
    const client = fakeClient(
      "```json\n" +
        JSON.stringify({ category: "technical", confidence: 0.7, reasoning: "Sounds like a bug." }) +
        "\n```",
    );

    const decision = await runRouter(client, ticket);
    expect(decision.category).toBe("technical");
  });

  it("rejects an unrecognized category", async () => {
    const client = fakeClient(JSON.stringify({ category: "shipping", confidence: 0.5, reasoning: "n/a" }));
    await expect(runRouter(client, ticket)).rejects.toThrow(/unrecognized category/);
  });
});
