import { NOTE_NAMES } from '../theory/scales';

interface KeyboardVisualizerProps {
  activeMidiNotes: number[];
  rootPc?: number;
  startMidi?: number; // default C2 = 36
  endMidi?: number;   // default C6 = 84
  showLabels?: boolean;
}

const IS_BLACK_KEY = [false, true, false, true, false, false, true, false, true, false, true, false];

export function KeyboardVisualizer({
  activeMidiNotes,
  rootPc,
  startMidi = 36, // C2
  endMidi = 84,   // C6
  showLabels = true,
}: KeyboardVisualizerProps) {
  const activeSet = new Set(activeMidiNotes);

  const whiteKeys: number[] = [];
  const blackKeys: { midi: number; whiteIndex: number }[] = [];

  let whiteCount = 0;
  for (let m = startMidi; m <= endMidi; m++) {
    const pc = m % 12;
    if (!IS_BLACK_KEY[pc]) {
      whiteKeys.push(m);
      whiteCount++;
    } else {
      blackKeys.push({ midi: m, whiteIndex: whiteCount - 1 });
    }
  }

  return (
    <div className="piano-keyboard-container">
      <div className="piano-keyboard">
        {/* White Keys */}
        {whiteKeys.map((midi) => {
          const pc = midi % 12;
          const isActive = activeSet.has(midi);
          const isRoot = rootPc !== undefined && pc === rootPc;

          return (
            <div
              key={midi}
              className={`white-key ${isActive ? 'active' : ''} ${isRoot ? 'root-key' : ''}`}
            >
              {showLabels && (
                <span className="key-label">
                  {NOTE_NAMES[pc]}
                  <sub style={{ fontSize: 9 }}>{Math.floor(midi / 12) - 1}</sub>
                </span>
              )}
            </div>
          );
        })}

        {/* Black Keys */}
        {blackKeys.map(({ midi, whiteIndex }) => {
          const pc = midi % 12;
          const isActive = activeSet.has(midi);
          const isRoot = rootPc !== undefined && pc === rootPc;
          // Calculate percentage position relative to white keys
          const leftPercent = ((whiteIndex + 0.65) / whiteKeys.length) * 100;

          return (
            <div
              key={midi}
              className={`black-key ${isActive ? 'active' : ''} ${isRoot ? 'root-key' : ''}`}
              style={{ left: `${leftPercent}%` }}
            >
              {showLabels && isActive && (
                <span className="black-key-label">{NOTE_NAMES[pc]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
