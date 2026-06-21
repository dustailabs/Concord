export type StepStatus = "idle" | "active" | "done" | "failed";

export interface DisplayStep {
  label: string;
  status: StepStatus;
  /** Short, mono-set readout line — a reasoning string, a draft summary, etc. */
  readout?: string;
}

const STATUS_STYLES: Record<StepStatus, { dot: string; text: string }> = {
  idle: { dot: "bg-border", text: "text-muted" },
  active: { dot: "bg-signal animate-blink", text: "text-signal" },
  done: { dot: "bg-resolved", text: "text-resolved" },
  failed: { dot: "bg-escalated", text: "text-escalated" },
};

function StatusLabel({ status }: { status: StepStatus }) {
  const labels: Record<StepStatus, string> = {
    idle: "queued",
    active: "working",
    done: "done",
    failed: "failed",
  };
  return <span className={`text-xs uppercase tracking-wider ${STATUS_STYLES[status].text}`}>{labels[status]}</span>;
}

export function DispatchRow({ step, index }: { step: DisplayStep; index: number }) {
  return (
    <div className="flex items-start gap-4 border-t border-border/60 py-4 first:border-t-0 animate-fade-in">
      <span className="mt-1 font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</span>
      <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${STATUS_STYLES[step.status].dot}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-display text-sm font-medium text-ink">{step.label}</p>
          <StatusLabel status={step.status} />
        </div>
        <p className="mt-1 truncate font-mono text-xs text-muted">{step.readout ?? "—"}</p>
      </div>
    </div>
  );
}

export function DispatchBoard({
  ticketLabel,
  ticketBody,
  steps,
}: {
  ticketLabel: string;
  ticketBody: string;
  steps: DisplayStep[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-panel shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted">{ticketLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-resolved" aria-hidden />
          <span className="font-mono text-xs text-muted">live trace</span>
        </div>
      </div>
      <p className="border-b border-border px-5 py-3 font-mono text-sm text-ink/90">"{ticketBody}"</p>
      <div className="px-5">
        {steps.map((step, index) => (
          <DispatchRow key={step.label} step={step} index={index} />
        ))}
      </div>
    </div>
  );
}
