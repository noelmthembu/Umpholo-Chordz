import { SplendidGrandPiano, ElectricPiano, Soundfont } from 'smplr';
import type { InstrumentKey } from '../types';
import { ABT_PIANO_URLS, OneShotPianoInstrument } from './oneShotPiano';
import { SmplrInstrument } from './smplrInstrument';

/** Common surface every playable instrument (sampled or synth) exposes to
 * the transport scheduler — lets the app treat every instrument
 * interchangeably. `volume` only needs a `.value` in (roughly) decibels —
 * both Tone.Param and the plain object SmplrInstrument uses satisfy this
 * structurally. */
export interface PlayableInstrument {
  triggerAttackRelease(
    notes: string | string[],
    duration: number | string,
    time?: number,
    /** Single scalar applied to all notes, or a per-note array (same length as notes). */
    velocity?: number | number[]
  ): void;
  volume: { value: number };
  dispose(): void;
}

export type SynthMap = Record<InstrumentKey, PlayableInstrument>;

/**
 * Build the instrument palette. Every option here is a *real, multi-sampled*
 * instrument rather than a basic oscillator synth — piano/rhodes/organ/pad
 * are streamed via `smplr` (open-source, browser-ready sample libraries —
 * a Steinway grand, GregSullivan electric pianos, and a General MIDI
 * soundfont for organ/pad), the same sample-playback approach a DAW like
 * BandLab uses for its stock instruments. There's no way to fetch BandLab's
 * own proprietary sound library directly — it isn't published or licensed
 * for that — so this is the closest equivalent: real recorded instruments
 * instead of synthesized approximations. The ABT one-shot piano (your own
 * uploaded recordings) stays available as its own option.
 */
export function buildSynths(): SynthMap {
  const piano = new SmplrInstrument((ctx, opts) => SplendidGrandPiano(ctx, opts));

  const rhodes = new SmplrInstrument((ctx, opts) =>
    ElectricPiano(ctx, { ...opts, instrument: 'WurlitzerEP200' })
  );

  const organ = new SmplrInstrument((ctx, opts) =>
    Soundfont(ctx, { ...opts, instrument: 'drawbar_organ' })
  );

  const pad = new SmplrInstrument((ctx, opts) =>
    Soundfont(ctx, { ...opts, instrument: 'pad_2_warm' })
  );

  const abtpiano = new OneShotPianoInstrument(ABT_PIANO_URLS);

  const map: SynthMap = { piano, rhodes, organ, pad, abtpiano };
  Object.values(map).forEach((s) => {
    s.volume.value = -6;
  });
  return map;
}

/** Resolves once every sampled instrument in the map has finished loading
 * its audio buffers. */
export function whenSynthsReady(synths: SynthMap): Promise<void> {
  const loaders = Object.values(synths)
    .map((s) => (s as { loaded?: Promise<void> }).loaded)
    .filter((p): p is Promise<void> => !!p);
  return Promise.all(loaders).then(() => undefined);
}

export function disposeSynths(synths: SynthMap): void {
  Object.values(synths).forEach((s) => s.dispose());
}
