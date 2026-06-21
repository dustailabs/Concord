export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-6 lg:px-10">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-lg font-bold text-ink">Concord</span>
        <span className="font-mono text-xs text-muted">by Dust AI Labs</span>
      </div>
      <a
        href="https://github.com/dustailabs/concord"
        className="font-mono text-xs text-muted underline-offset-4 hover:text-ink hover:underline"
      >
        source →
      </a>
    </header>
  );
}
