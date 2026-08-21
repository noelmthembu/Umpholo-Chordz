import { Icon } from './Icon';

interface HeroProps {
  onOpen150Progressions?: () => void;
  onOpenVoicingExplorer?: () => void;
}

export function Hero({ onOpen150Progressions, onOpenVoicingExplorer }: HeroProps) {
  return (
    <header className="hero">
      <div className="hero-inner">
        <p className="hero-eyebrow">Amapiano and jazz harmony workstation</p>
        <h1>
          Umpholo <span>Harmony Engine</span>
        </h1>
        <p className="hero-copy">
          Build playable chord progressions, shape the pianist’s touch, audition every decision, and export MIDI without leaving your browser.
        </p>

        <div className="hero-actions" aria-label="Explore the Umpholo library">
          <button type="button" className="hero-action" onClick={onOpen150Progressions}>
            <Icon name="library" aria-hidden="true" />
            <span>
              <strong>Progression library</strong>
              <small>150 performed starting points</small>
            </span>
            <Icon name="arrowRight" className="hero-action-arrow" aria-hidden="true" />
          </button>
          <button type="button" className="hero-action" onClick={onOpenVoicingExplorer}>
            <Icon name="keys" aria-hidden="true" />
            <span>
              <strong>Voicing library</strong>
              <small>1,500+ playable shapes</small>
            </span>
            <Icon name="arrowRight" className="hero-action-arrow" aria-hidden="true" />
          </button>
        </div>

        <p className="hero-proof">
          Built for rooted, rootless, quartal, drop-2, and upper-structure harmony.
        </p>
      </div>
    </header>
  );
}
