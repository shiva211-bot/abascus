const systems = [
  ["01 / EXHIBITION", "Project intelligence", "A structured surface for discovering technical work without fake metrics or manufactured social proof."],
  ["02 / DEPLOYMENT", "Operational context", "Deployment metadata and health signals will connect to real provider data in later phases."],
  ["03 / ENGINE", "Holographic core", "The visual boundary is ready for the pure Three.js neural shield engine in Phase 3."],
];

export default function HomePage() {
  return (
    <>
      <header className="site-header">
        <nav className="site-shell nav" aria-label="Primary navigation">
          <a className="brand" href="/" aria-label="Abascus home">
            <span className="brand-mark" aria-hidden="true" />
            <span>Abascus</span>
          </a>
          <div className="nav-links">
            <a href="#systems">Systems</a>
            <a href="#architecture">Architecture</a>
          </div>
          <div className="nav-actions">
            <a className="button button-primary" href="#systems">Explore system</a>
          </div>
        </nav>
      </header>

      <main>
        <section className="site-shell hero" aria-labelledby="hero-title">
          <div>
            <span className="eyebrow">Quantum Security Core / Phase 2</span>
            <h1 id="hero-title">Build. <span>Exhibit.</span> Deploy.</h1>
            <p className="hero-copy">
              Abascus is the visual foundation for a technical project exhibition platform:
              structured project intelligence, deployment context, and a holographic interface
              designed to make complex systems legible.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#systems">Explore system</a>
              <a className="button" href="#architecture">View architecture</a>
            </div>
          </div>

          <div className="core-frame" id="architecture" aria-label="Holographic core visual boundary">
            <div className="core-orb" aria-hidden="true" />
            <div className="core-label">
              <span>Local triage / <strong>engine reserved</strong></span>
              <span>Core boundary / <strong>ready</strong></span>
            </div>
          </div>
        </section>

        <section className="site-shell section" id="systems" aria-labelledby="systems-title">
          <div className="section-heading">
            <div>
              <span className="eyebrow">System architecture</span>
              <h2 id="systems-title">One interface. Three layers.</h2>
            </div>
            <p>
              The visual system is deliberately separated from application and business logic.
              The Phase 3 WebGL engine can attach to this boundary without redesigning the shell.
            </p>
          </div>

          <div className="system-grid">
            {systems.map(([index, title, description]) => (
              <article className="system-card" key={index}>
                <small>{index}</small>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-shell site-footer">
        Abascus / Visual foundation / Phase 2
      </footer>
    </>
  );
}
