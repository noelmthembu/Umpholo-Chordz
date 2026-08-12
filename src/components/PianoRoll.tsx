import { useEffect, useRef } from 'react';
import type { Chord } from '../types';

interface PianoRollProps {
  chords: Chord[];
}

export function PianoRoll({ chords }: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#1b1d34';
    ctx.fillRect(0, 0, w, h);

    const bars = chords.length || 4;
    const totalBeats = bars * 4;
    const pxPerBeat = w / totalBeats;

    ctx.strokeStyle = '#3a3d5c';
    ctx.lineWidth = 1;
    for (let b = 0; b <= bars; b++) {
      ctx.beginPath();
      ctx.moveTo(b * 4 * pxPerBeat, 0);
      ctx.lineTo(b * 4 * pxPerBeat, h);
      ctx.stroke();
    }

    const allMidis = chords.flatMap((c) => c.midiNotes);
    const minM = allMidis.length ? Math.min(...allMidis) - 2 : 55;
    const maxM = allMidis.length ? Math.max(...allMidis) + 2 : 80;
    const range = Math.max(maxM - minM, 1);
    const noteH = Math.max(h / range, 3);
    const y = (midi: number) => h - ((midi - minM) / range) * h;

    ctx.fillStyle = 'rgba(232,176,74,0.7)';
    chords.forEach((c) => {
      c.midiNotes.forEach((m) => {
        ctx.fillRect(c.startBeat * pxPerBeat + 1, y(m) - noteH / 2, c.lengthBeats * pxPerBeat - 2, noteH * 0.7);
      });
    });
  }, [chords]);

  return (
    <>
      <div className="roll-wrap">
        <canvas ref={canvasRef} id="pianoRoll" width={1200} height={220} />
      </div>
      <div className="legend">
        <span>
          <i style={{ background: 'var(--accent)' }} />
          Chord tones
        </span>
        <span>
          <i style={{ background: '#3a3d5c' }} />
          Bar line
        </span>
      </div>
    </>
  );
}
