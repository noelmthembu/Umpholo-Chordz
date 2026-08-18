interface HeroProps {
  onOpen150Progressions?: () => void;
  onOpenVoicingExplorer?: () => void;
}

export function Hero({ onOpen150Progressions, onOpenVoicingExplorer }: HeroProps) {
  return (
    <section className="hero">
      <div className="hero-eyebrow">Professional Jazz &amp; Amapholas Piano Workstation</div>
      <h1 className="display">
        Umpholo <em>— Jazz Harmony &amp; Piano Engine</em>
      </h1>
      <p className="sub">
        Over 1,500 authentic jazz voicings, 150 performed chord progressions, real jazz pianist touch modeling, cascade strum knob, and suggested modulations — played back and exported to Standard MIDI Files right in your browser.
      </p>

      {/* Feature Highlights Grid */}
      <div className="hero-feature-pills">
        <div className="feature-pill" onClick={onOpenVoicingExplorer} role="button" tabIndex={0}>
          <span className="pill-num">1,500+</span>
          <span className="pill-text">Unique Jazz Voicings</span>
        </div>
        <div className="feature-pill" onClick={onOpen150Progressions} role="button" tabIndex={0}>
          <span className="pill-num">150</span>
          <span className="pill-text">Performed Progressions</span>
        </div>
        <div className="feature-pill">
          <span className="pill-icon">⚡</span>
          <span className="pill-text">Cascade Strum Knob</span>
        </div>
        <div className="feature-pill">
          <span className="pill-icon">🎹</span>
          <span className="pill-text">Real Jazz Pianist Touch</span>
        </div>
        <div className="feature-pill">
          <span className="pill-icon">🔄</span>
          <span className="pill-text">Suggested Modulations</span>
        </div>
      </div>

      <div className="artist-strip">
        <span className="artist-chip highlight">Bill Evans</span>
        <span className="artist-chip highlight">Herbie Hancock</span>
        <span className="artist-chip highlight">Robert Glasper</span>
        <span className="artist-chip highlight">McCoy Tyner</span>
        <span className="artist-chip highlight">Kenny Barron</span>
        <span className="artist-chip highlight">Barry Harris</span>
        <span className="artist-chip">Kelvin Momo</span>
        <span className="artist-chip">Kabza De Small</span>
        <span className="artist-chip">MelMusiq</span>
        <span className="artist-chip">DJ Stokie</span>
        <span className="artist-chip">Jappino</span>
        <span className="artist-chip">Stixx</span>
      </div>

      <div className="pulse-rail">
        {Array.from({ length: 12 }).map((_, i) => (
          <div className="bar" key={i} />
        ))}
      </div>
    </section>
  );
}
