export function Hero() {
  return (
    <section className="hero">
      <div className="hero-eyebrow">Amapholas Chord Generator</div>
      <h1 className="display">
        Umpholo <em>— Amapholas Piano Engine</em>
      </h1>
      <p className="sub">
        Soulful, jazz-extended Private-School-style Amapiano chord progressions — voiced,
        sequenced, played back, and exported to MIDI, right in the browser.
      </p>
      <div className="artist-strip">
        <span className="artist-chip">Kabza De Small</span>
        <span className="artist-chip">Kelvin Momo</span>
        <span className="artist-chip">MelMusiq</span>
        <span className="artist-chip">DJ Stokie</span>
        <span className="artist-chip">Soulful Deciple</span>
        <span className="artist-chip">Melo Musiq</span>
        <span className="artist-chip">Stixx</span>
        <span className="artist-chip">Bandros</span>
        <span className="artist-chip">Mas Musiq</span>
        <span className="artist-chip">Deep Phil</span>
        <span className="artist-chip">Djy Vino</span>
        <span className="artist-chip">Jappino</span>
      </div>
      <div className="pulse-rail">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="bar" key={i} />
        ))}
      </div>
    </section>
  );
}
