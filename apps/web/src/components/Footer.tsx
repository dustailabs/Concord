export function Footer() {
  return (
    <footer className="mt-20 border-t border-border px-6 py-10 lg:px-10">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <p className="max-w-md text-sm text-muted">
          Concord is an open-source reference build from Dust AI Labs, an AI engineering
          consultancy. Want a system like this built around your own data and tools?
        </p>
        <a
          href="https://github.com/dustailabs"
          className="rounded-lg border border-border px-4 py-2 font-mono text-xs text-ink hover:border-signal hover:text-signal"
        >
          github.com/dustailabs
        </a>
      </div>
    </footer>
  );
}
