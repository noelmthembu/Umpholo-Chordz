import * as Tone from 'tone';

/**
 * A velocity-switching sampled instrument built from three real one-shot
 * recordings (loud/mid/soft dynamic layers of the same note), rather than
 * a synthesized approximation. Wraps three Tone.Sampler instances — one
 * per dynamic layer — and picks between them per note based on the
 * triggering velocity, the way a round-robin/velocity-layered sampler
 * instrument works.
 *
 * All three source recordings were pitch-verified (via autocorrelation +
 * FFT spectral peak analysis) to be C4 (~261.3 Hz), so that's the base
 * note each Tone.Sampler repitches from for every other note played.
 */

const BASE_NOTE = 'C4';

export interface OneShotLayerUrls {
  loud: string;
  mid: string;
  soft: string;
}

export class OneShotPianoInstrument {
  private vol: Tone.Volume;
  private loud: Tone.Sampler;
  private mid: Tone.Sampler;
  private soft: Tone.Sampler;
  readonly loaded: Promise<void>;

  constructor(urls: OneShotLayerUrls) {
    this.vol = new Tone.Volume(0).toDestination();

    let resolveLoaded: () => void;
    let remaining = 3;
    this.loaded = new Promise((resolve) => {
      resolveLoaded = resolve;
    });
    const onOneLoaded = () => {
      remaining -= 1;
      if (remaining <= 0) resolveLoaded();
    };

    const makeLayer = (url: string) =>
      new Tone.Sampler({
        urls: { [BASE_NOTE]: url },
        release: 1.2,
        attack: 0.004,
        onload: onOneLoaded,
      }).connect(this.vol);

    this.loud = makeLayer(urls.loud);
    this.mid = makeLayer(urls.mid);
    this.soft = makeLayer(urls.soft);
  }

  get volume(): Tone.Param<'decibels'> {
    return this.vol.volume;
  }

  private layerFor(velocity: number): Tone.Sampler {
    if (velocity >= 0.72) return this.loud;
    if (velocity >= 0.4) return this.mid;
    return this.soft;
  }

  triggerAttackRelease(
    notes: string | string[],
    duration: number | string,
    time?: number,
    velocity = 0.8
  ): void {
    this.layerFor(velocity).triggerAttackRelease(notes, duration, time, velocity);
  }

  dispose(): void {
    this.loud.dispose();
    this.mid.dispose();
    this.soft.dispose();
    this.vol.dispose();
  }
}

export const ABT_PIANO_URLS: OneShotLayerUrls = {
  loud: '/samples/piano/abt-piano-loud.wav',
  mid: '/samples/piano/abt-piano-mid.wav',
  soft: '/samples/piano/abt-piano-soft.wav',
};
