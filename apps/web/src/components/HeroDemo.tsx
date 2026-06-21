import { useEffect, useState } from "react";
import { DispatchBoard, type DisplayStep } from "./DispatchBoard.js";

interface ScriptedTicket {
  label: string;
  body: string;
  steps: { label: string; readout: string }[];
}

const SCRIPT: ScriptedTicket[] = [
  {
    label: "T-4471",
    body: "My last invoice shows $58 but my plan is $29/month.",
    steps: [
      { label: "Router", readout: "category: billing · confidence 0.94" },
      { label: "Billing Specialist", readout: "Found a duplicate charge on Jun 14 — draft refund." },
      { label: "Synthesizer", readout: "status: resolved — refund issued, reply sent." },
    ],
  },
  {
    label: "T-4472",
    body: "Webhook deliveries stopped after I rotated my API key.",
    steps: [
      { label: "Router", readout: "category: technical · confidence 0.88" },
      { label: "Technical Specialist", readout: "Stale key cached in webhook config — needs re-auth." },
      { label: "Synthesizer", readout: "status: escalated — flagged for on-call engineer." },
    ],
  },
  {
    label: "T-4473",
    body: "Can I add a teammate to my workspace without upgrading?",
    steps: [
      { label: "Router", readout: "category: account · confidence 0.81" },
      { label: "Account Specialist", readout: "Free tier allows 1 seat — explain upgrade path." },
      { label: "Synthesizer", readout: "status: resolved — plan limits explained, reply sent." },
    ],
  },
];

const STEP_INTERVAL_MS = 950;
const HOLD_MS = 2600;

export function HeroDemo() {
  const [ticketIndex, setTicketIndex] = useState(0);
  const [phase, setPhase] = useState(0); // 0..steps.length: how many steps have reached "active or further"

  const ticket = SCRIPT[ticketIndex];
  const totalSteps = ticket.steps.length;

  useEffect(() => {
    if (phase < totalSteps) {
      const t = setTimeout(() => setPhase((p) => p + 1), STEP_INTERVAL_MS);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setPhase(0);
      setTicketIndex((i) => (i + 1) % SCRIPT.length);
    }, HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, totalSteps]);

  const steps: DisplayStep[] = ticket.steps.map((step, index) => ({
    label: step.label,
    readout: phase > index ? step.readout : undefined,
    status: phase > index + 1 || phase === totalSteps ? "done" : phase === index + 1 ? "active" : "idle",
  }));

  return <DispatchBoard ticketLabel={ticket.label} ticketBody={ticket.body} steps={steps} />;
}
