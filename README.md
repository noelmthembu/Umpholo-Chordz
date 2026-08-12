# Umpholo — Amapholas Chord Generator (React + TypeScript)

A typed, componentized Vite + React + TypeScript app that generates jazz-
extended, "Amapholas" / Private-School-piano-style Amapiano chord
progressions, plays them back via Tone.js, and exports them as a MIDI file.

This version is **chords-only** — the freestyle-keys melody generator and
the log-drum reference click have been removed to keep the app focused on
chord progression generation.

## Modes: real genre harmony, not random diatonic stacks

The **Mode** dropdown picks one of seven genre "feels" — **Minor, Major,
Soulful, Jazzy, Gospel, R&B, Jazz Blues** — each with hand-written,
genre-authentic chord progressions (`src/theory/feels.ts`), built from
named chord qualities (`src/theory/chords.ts`: maj9, m11, 7♭9, 7alt, dim7,
sus chords, etc.) rather than a scale's diatonic 7ths stacked at random.
Real functional harmony moves are baked into each one:

- **Minor** — natural-minor Amapiano loops (i–VI–III–VII, i–iv–VII–III),
  plus a proper minor ii°–V7–i cadence borrowing the harmonic-minor
  dominant.
- **Major** — warm major-key soul-pop movement: I–vi–ii–V circles,
  vi–IV–I–V loops.
- **Soulful** — the Private School Piano register (Kabza De Small, Kelvin
  Momo): Dorian minor-7 harmony with a brightened dominant IV chord,
  spacious rootless voicings.
- **Jazzy** — ii–V–I chains with secondary dominants and a tritone
  substitution (bII7 in place of V7), bebop/jazz-standard vocabulary.
- **Gospel** — I–vi–ii–V circle-of-fifths movement with a chromatic
  passing diminished 7th (#Idim7) and a plagal IV–I "amen" cadence.
- **R&B** — neo-soul modal-interchange loops: a borrowed minor iv against
  the major tonic, quartal-friendly extended chords.
- **Jazz Blues** — a full 12-bar jazz-blues form: dominant 7ths
  throughout, a #IVdim7 passing chord in bar 6, and a VI7–ii turnaround.

The artist references describe the general harmonic *language* each feel
draws on (secondary dominants, borrowed chords, extended jazz voicings),
not a transcription of any specific recording.

## Style profiles — voicing, not chord choice

The "Amapholas Artist Influence" dropdown no longer decides *which* chords
play (the Mode's templates do that) — it shapes how they're **voiced**:
`altProb` controls how often an extra, harmonically-appropriate color tone
(♭9/♯9/♯11/add13, matched to the chord's function) gets layered on top, and
`register` shifts the bass/upper-structure octave. The full set of
influences: **Kabza De Small, MelMusiq, Kelvin Momo, DJ Stokie, Soulful
Deciple, Melo Musiq, Stixx, Bandros, Mas Musiq, Deep Phil, Djy Vino, and
Jappino.**

- **Voice leading** (`src/theory/voicing.ts`) — each chord's upper structure
  (everything above the root) is voice-led against the previous chord: new
  tones are greedily matched to the closest previous tone, so common notes
  are held and the rest move by the smallest possible step instead of
  jumping around the keyboard. The bass root does the same against the
  previous root. This is what makes the progression feel like it's
  breathing rather than hopping between unrelated voicings.

## Project layout

```
src/
  types.ts                 shared domain types (Chord, StyleProfile, FeelKey, QualityKey ...)
  theory/
    scales.ts               note names, underlying 7-note modes, scale construction
    chords.ts                chord-quality tone tables + chord-symbol namer
    feels.ts                 the 7 genre "Mode" profiles + their hand-written progressions
    progressions.ts          Amapholas artist voicing profiles, generateProgression()
    voicing.ts                voice-leading between consecutive chords
  audio/
    synths.ts                instrument palette: sampled piano/rhodes/organ/pad (via smplr) + sampled ABT piano
    smplrInstrument.ts        adapter: wraps a real `smplr` sampled instrument for the transport
    oneShotPiano.ts           velocity-switching sampler built from real one-shot recordings
    transport.ts              Tone.Transport / Tone.Part chord scheduling
  midi/
    midiWriter.ts             hand-rolled Standard MIDI File (format 1, 2 tracks) writer + download helper
  state/
    useSession.ts             React hook: session state + non-repetition memory
  components/
    Hero.tsx, ControlsPanel.tsx, ChordStrip.tsx, PianoRoll.tsx,
    TransportBar.tsx, SessionLog.tsx
  App.tsx                    wires controls, session state, and the audio engine together
  main.tsx                   React root
  styles.css
public/
  samples/piano/             the three ABT one-shot piano recordings (16-bit PCM WAV)
```

## Instruments: real samples, not oscillator synths

The old "piano/rhodes/pad" options were basic Tone.js oscillator synths
(`Tone.Synth`/`FMSynth`/`AMSynth`), which is why they sounded thin/synthetic.
They're now real multi-sampled instruments streamed via
[`smplr`](https://github.com/danigb/smplr) (MIT-licensed, samples served
straight from GitHub Pages, no server or API key needed):

- **Grand Piano** — `SplendidGrandPiano`, a sampled Steinway with 4 velocity layers.
- **Rhodes / Wurli** — `ElectricPiano` (`WurlitzerEP200`), real electric-piano samples.
- **Drawbar Organ** — General MIDI soundfont (`drawbar_organ`) — gospel B3-style organ.
- **Warm Pad** — General MIDI soundfont (`pad_2_warm`).
- **ABT Piano** — unchanged, your own uploaded one-shot recordings.

There's no way to pull BandLab's own instrument library directly — it's
proprietary and isn't published for that — so this is the closest
equivalent available: real recorded instruments played back through the
same sample-playback approach, instead of synthesized approximations.
`src/audio/smplrInstrument.ts` adapts each `smplr` instrument to the app's
existing `PlayableInstrument` interface so the Tone.js transport can
schedule it exactly like everything else, sharing Tone's own AudioContext
so the timing lines up sample-accurately.

## The ABT sampled piano

"ABT Piano" in the instrument dropdown is a real sampled instrument, not a
synth — built from three uploaded one-shot recordings (`abt-piano-loud.wav`,
`abt-piano-mid.wav`, `abt-piano-soft.wav`). All three were pitch-verified
(autocorrelation + FFT spectral-peak analysis both agree) to be the same
note, **C4**, at three different playing dynamics — i.e. loud/mid/soft
velocity layers of one note, not three different pitches.

`src/audio/oneShotPiano.ts` wraps them in three `Tone.Sampler` instances
(one per layer, each repitching from C4 for every other note via Tone's
built-in sample repitching) and picks between them per note based on the
triggering velocity — the same principle a velocity-layered sampler
instrument uses. Because the source recordings are long (~17s, with a
natural decay tail), each layer applies a `release` envelope so notes fade
out rather than always ringing out fully when a chord's duration ends.

Swap in your own one-shots by replacing the three files in
`public/samples/piano/` (keep the same filenames, or update the paths in
`ABT_PIANO_URLS` in `oneShotPiano.ts`) — if they're a different pitch than
C4, update `BASE_NOTE` in that file to match.

## Setup

```bash
npm install
npm run dev       # local dev server (Vite), usually http://localhost:5173
npm run build     # type-checks (tsc -b) then produces a static build in dist/
npm run preview   # serve the production build locally
```

`tone` ships its own TypeScript type declarations, so no `@types/tone`
package is needed.

## Deployment

`npm run build` outputs a fully static `dist/` folder — deploy it anywhere
that serves static files (Vercel, Netlify, GitHub Pages, or any static
bucket). Browsers require a user gesture before audio can start — the app
already calls `Tone.start()` inside the Play button's click handler.
