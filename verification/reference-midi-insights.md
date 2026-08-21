# Reference MIDI voicing findings

The supplied chord MIDI examples were parsed as note events and grouped into simultaneous/rolled piano attacks. The inspected material consistently uses a **low bass foundation plus an extended right-hand structure**, rather than a fixed four-note block chord.

| Reference set | Typical chord-note count | Typical lowest bass note | Typical top note | Typical span |
|---|---:|---:|---:|---:|
| TGBeats / JAppino examples | 5–8 | MIDI 34–42 | MIDI 62–63 | 23–28 semitones |
| NDS ShakaMan / JAppino examples | 5–7 | MIDI 39–42 | MIDI 63–65 | 24–26 semitones |
| Soulful / Bongza examples | 5–6 | MIDI 40–44 | MIDI 62–67 | 21–24 semitones |
| Zan’Ten & Friends chord examples | 6–7 | MIDI 31–39 | MIDI 65–67 | 26–31 semitones |

One short Zan’Ten file contains a high-register melodic fragment rather than sustained chord comping and was treated as an exception, not as a harmonic-density target.

## Design implications implemented

The generator now produces a **root-plus-octave bass when register space permits**, then selects a voice-led jazz upper structure and enriches it with a valid chord color tone where necessary. Generated piano chords therefore target **six or seven sounding notes**: one or two bass notes and four or five right-hand voices. The lowest register is constrained to MIDI 30–47, upper structure to MIDI 50–82, and adjacent bass notes choose the nearest usable octave for continuous movement.

The exported validation MIDI contained three seven-note chord events, each preserving the low foundation and five upper voices as well as the cascade timing.
