import './index.css';

/**
 * App root — providers and router will be wired up in Phase 2 and Phase 10.
 * For now this renders a placeholder to verify the dev server works.
 */
function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-8 text-center max-w-md w-full mx-4 animate-fade-in">
        <div className="text-5xl mb-4">🏥</div>
        <h1 className="text-2xl font-bold text-gradient mb-2">
          Insurance Management Platform
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          Phase 0 complete — dev server is running
        </p>
        <div className="mt-6 flex gap-2 justify-center text-xs" style={{ color: 'var(--color-muted)' }}>
          <span className="px-2 py-1 rounded" style={{ background: 'var(--color-border)' }}>React</span>
          <span className="px-2 py-1 rounded" style={{ background: 'var(--color-border)' }}>Vite</span>
          <span className="px-2 py-1 rounded" style={{ background: 'var(--color-border)' }}>Tailwind CSS</span>
        </div>
      </div>
    </div>
  );
}

export default App;
