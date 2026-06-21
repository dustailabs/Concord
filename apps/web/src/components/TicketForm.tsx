import { useState } from "react";
import { runTicket, type TraceEvent } from "@concord/core";
import { DispatchBoard, type DisplayStep, type StepStatus } from "./DispatchBoard.js";

const ROLE_LABELS: Record<string, string> = {
  router: "Router",
  specialist: "Specialist",
  synthesizer: "Synthesizer",
};

const PLACEHOLDER_TICKET =
  "I was charged for two seats but I only added one teammate this month.";

function readoutFor(event: TraceEvent): string | undefined {
  if (event.status === "failed") return event.error;
  if (event.status !== "completed" || !event.output) return undefined;
  if ("reasoning" in event.output && event.role !== "synthesizer") {
    return event.output.reasoning;
  }
  if ("status" in event.output) {
    return `status: ${event.output.status}`;
  }
  return undefined;
}

export function TicketForm() {
  const [apiKey, setApiKey] = useState("");
  const [body, setBody] = useState(PLACEHOLDER_TICKET);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim() || !body.trim() || running) return;

    setRunning(true);
    setError(null);
    setTrace([]);

    try {
      await runTicket(
        { id: "T-LIVE", body },
        {
          apiKey: apiKey.trim(),
          dangerouslyAllowBrowser: true,
          onTrace: (event) => setTrace((prev) => [...prev.filter((e2) => e2.agentName !== event.agentName), event]),
        },
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong running the pipeline.");
    } finally {
      setRunning(false);
    }
  }

  const orderedAgents = ["router", "specialist", "synthesizer"];
  const steps: DisplayStep[] = orderedAgents.map((role) => {
    const event = trace.find((e) => e.role === role);
    const status: StepStatus = !event ? "idle" : event.status === "started" ? "active" : event.status === "completed" ? "done" : "failed";
    return {
      label: event?.agentName ?? ROLE_LABELS[role],
      status,
      readout: event ? readoutFor(event) : undefined,
    };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-panel p-5">
        <label className="block">
          <span className="text-sm font-medium text-ink">Anthropic API key</span>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="mt-1.5 w-full rounded-lg border border-border bg-base px-3 py-2 font-mono text-sm text-ink placeholder:text-muted"
            autoComplete="off"
          />
          <span className="mt-1.5 block text-xs text-muted">
            Stays in your browser's memory for this session only — never stored, never sent anywhere but Anthropic's API.
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-ink">Support ticket</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-border bg-base px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
        </label>

        <button
          type="submit"
          disabled={running || !apiKey.trim()}
          className="mt-4 w-full rounded-lg bg-signal px-4 py-2.5 font-display text-sm font-medium text-base disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? "Dispatching agents…" : "Run ticket through Concord"}
        </button>

        {error && <p className="mt-3 text-sm text-escalated">{error}</p>}
      </form>

      <DispatchBoard ticketLabel="T-LIVE" ticketBody={body} steps={steps} />
    </div>
  );
}
