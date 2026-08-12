/** Find the MIDI note with the given pitch class closest to a target MIDI note. */
export function closestMidiForPc(pc: number, target: number): number {
  const base = target - (((target - pc) % 12) + 12) % 12;
  const candidates = [base - 12, base, base + 12, base + 24];
  return candidates.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best));
}

/**
 * Voice-lead a set of pitch classes against the previous chord's notes:
 * each new tone is greedily matched to whichever remaining previous note it
 * can reach with the smallest melodic step, and that previous note is then
 * "used up" so it can't be claimed twice. This keeps common tones held and
 * minimizes jumps between consecutive chords — the smooth, soulful motion
 * that makes a jazz chord sequence feel like it's breathing rather than
 * hopping around the keyboard.
 */
export function voiceLeadUpperStructure(pcs: number[], prevNotes: number[], fallbackCenter: number): number[] {
  const remaining = [...prevNotes];
  return pcs.map((pc) => {
    if (remaining.length === 0) return closestMidiForPc(pc, fallbackCenter);
    let bestIdx = 0;
    let bestNote = closestMidiForPc(pc, remaining[0]);
    let bestDist = Math.abs(bestNote - remaining[0]);
    for (let i = 1; i < remaining.length; i++) {
      const candidate = closestMidiForPc(pc, remaining[i]);
      const dist = Math.abs(candidate - remaining[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestNote = candidate;
        bestIdx = i;
      }
    }
    remaining.splice(bestIdx, 1);
    return bestNote;
  });
}
