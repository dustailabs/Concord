import { Header } from "./components/Header.js";
import { Footer } from "./components/Footer.js";
import { HeroDemo } from "./components/HeroDemo.js";
import { TicketForm } from "./components/TicketForm.js";

const PIPELINE = [
  {
    name: "Router",
    description: "Reads the ticket once and classifies it — billing, technical, account, or general — with a confidence score and a one-line reason.",
  },
  {
    name: "Specialist",
    description: "One of four domain agents picks up the ticket and drafts a resolution, flagging anything that needs a human in the loop.",
  },
  {
    name: "Synthesizer",
    description: "Turns the internal draft into a customer-facing reply and an internal summary, and sets the final status: resolved or escalated.",
  },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="px-6 lg:px-10">
        <section className="mx-auto max-w-3xl pt-10 pb-16 text-center">
          <h1 className="font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Three agents. <span className="text-signal">One resolved ticket.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted">
            Concord routes a support ticket to the right specialist, drafts a resolution, and
            writes the reply — and shows you every handoff as it happens.
          </p>
        </section>

        <section className="mx-auto max-w-2xl pb-20">
          <HeroDemo />
        </section>

        <section className="mx-auto max-w-4xl pb-20">
          <h2 className="font-display text-sm font-medium uppercase tracking-wider text-muted">
            How the pipeline works
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {PIPELINE.map((stage, index) => (
              <div key={stage.name} className="rounded-2xl border border-border bg-panel p-5">
                <span className="font-mono text-xs text-signal">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-base font-medium text-ink">{stage.name}</h3>
                <p className="mt-2 text-sm text-muted">{stage.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl pb-24">
          <h2 className="font-display text-sm font-medium uppercase tracking-wider text-muted">
            Run a real ticket
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            This calls Claude directly from your browser with your own Anthropic API key — the
            same engine that ships in the open-source repo, with no backend in between.
          </p>
          <div className="mt-6">
            <TicketForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
