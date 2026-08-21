# Browser validation — full piano arranger

The local application was opened successfully and a new four-bar soulful progression was generated.

Observed generated cards:

| Bar | Chord | Bass foundation | Right hand | Total notes |
|---|---|---|---|---:|
| 1 | Cm9 | C2, C3 | D#3, A#3, D4, F4, C5 | 7 |
| 2 | Gm11 | G1, G2 | A#3, F4, A4, C5, G5 | 7 |
| 3 | F9 | F2, F3 | A4, C5, D#5, F5, G5 | 7 |
| 4 | Cm9 | C2, C3 | A#4, C5, D5, D#5, G5 | 7 |

The interface displays separate **Bass** and **RH** note lists on every card. Each card exposes **Move left**, **Voice**, **Move right**, and **Remove** controls, alongside audition. The active-voicing description confirms full-piano construction with a root-plus-octave bass and enriched color tone.

## Arranger interaction results

The **Voice** control changed bar 1 from `D#3 A#3 D4 F4 C5` to a higher alternate `D#4 A#4 D5 F5 G5`, retaining the `C2 C3` foundation and seven sounding notes. The **Move right** control then moved the first `Cm9` to bar 2; `Gm11` became bar 1 and all card labels and the piano roll updated to the revised order.

The rebuilt application logs one new entry for a move action. The duplicate revoice messages shown in the first interaction came from the pre-cleanup development state and were addressed by moving logging outside state updater functions before the final rebuild.

The final **Voice** check changed the reordered `Gm11` to `G2 G3` bass with `A#4 D5 F5 A5 C6` in the right hand and produced exactly one new log entry. The **Remove** control deleted the third-bar `F9`, relabeled the remaining cards as bars 1–3, and redrew the piano roll with the contiguous three-chord timeline.

## Export verification

The edited three-chord progression was exported and inspected as `umpholo-jazz-C-soulful-1787334562416.mid`. It contains three simultaneous chord events of **seven notes each**. The exported bass notes are G2 / G3 for the first chord and C2 / C3 for the following two chords, with five upper voices per chord; the cascade micro-timing is also present in the note-on offsets.

The local browser session was closed after export verification; no production changes or external submissions were made during validation.
