import { useEffect, useRef } from 'react';
import type { Chord } from '../types';
import { midiToNoteName } from '../theory/scales';

interface PianoRollProps {
  chords: Chord[];
  activeChordIndex?: number | null;
  cascadeMs?: number;
}

export function PianoRoll({ chords, activeChordIndex, cascadeMs = 22 }: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#15172b');
    bgGrad.addColorStop(1, '#0e0f1d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    const totalBeats = chords.reduce((sum, c) => sum + c.lengthBeats, 0) || 16;
    const pxPerBeat = w / totalBeats;

    // Grid lines per beat and bar
    ctx.strokeStyle = '#252844';
    ctx.lineWidth = 1;
    for (let b = 0; b <= totalBeats; b++) {
      const x = b * pxPerBeat;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Bar lines
    ctx.strokeStyle = '#3d426b';
    ctx.lineWidth = 1.5;
    for (let b = 0; b <= totalBeats; b += 4) {
      const x = b * pxPerBeat;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    const allMidis = chords.flatMap((c) => c.midiNotes);
    const minM = allMidis.length ? Math.min(...allMidis) - 3 : 48;
    const maxM = allMidis.length ? Math.max(...allMidis) + 3 : 84;
    const range = Math.max(maxM - minM, 12);
    const noteH = Math.max(h / range, 5);
    const y = (midi: number) => h - ((midi - minM) / range) * (h - 20) - 10;

    // Draw chords notes with velocity coloring & micro cascade slant
    chords.forEach((c, cIdx) => {
      const isActive = activeChordIndex === cIdx;
      const n = c.midiNotes.length;

      // Active bar highlight column
      if (isActive) {
        ctx.fillStyle = 'rgba(79, 209, 197, 0.08)';
        ctx.fillRect(c.startBeat * pxPerBeat, 0, c.lengthBeats * pxPerBeat, h);
      }

      c.midiNotes.forEach((m, i) => {
        // Cascade onset stagger
        const cascadeRatio = n > 1 ? i / (n - 1) : 0;
        const cascadeOffsetPx = (cascadeMs / 1000) * pxPerBeat * 2 * cascadeRatio;
        const noteX = c.startBeat * pxPerBeat + 2 + cascadeOffsetPx;
        const noteW = Math.max(8, c.lengthBeats * pxPerBeat - 4 - cascadeOffsetPx);
        const noteY = y(m) - noteH / 2;

        // Color based on voice role (Bass = deep gold, Guide = warm amber, Melody = bright cyan/gold)
        let noteGrad: CanvasGradient;
        if (i === 0) {
          // Bass
          noteGrad = ctx.createLinearGradient(noteX, noteY, noteX + noteW, noteY);
          noteGrad.addColorStop(0, '#d97706');
          noteGrad.addColorStop(1, '#b45309');
        } else if (i === n - 1) {
          // Top voice (Melody / Lead)
          noteGrad = ctx.createLinearGradient(noteX, noteY, noteX + noteW, noteY);
          noteGrad.addColorStop(0, '#4fd1c5');
          noteGrad.addColorStop(1, '#38b2ac');
        } else {
          // Inner guide tones
          noteGrad = ctx.createLinearGradient(noteX, noteY, noteX + noteW, noteY);
          noteGrad.addColorStop(0, '#f59e0b');
          noteGrad.addColorStop(1, '#d97706');
        }

        ctx.fillStyle = isActive ? '#fef08a' : noteGrad;
        ctx.shadowColor = isActive ? 'rgba(254, 240, 138, 0.4)' : 'transparent';
        ctx.shadowBlur = isActive ? 8 : 0;

        // Rounded rect note block
        ctx.beginPath();
        const r = 3;
        ctx.roundRect(noteX, noteY, noteW, noteH * 0.82, r);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Note text label
        if (noteW > 24) {
          ctx.fillStyle = '#111827';
          ctx.font = 'bold 9px "Space Grotesk", sans-serif';
          ctx.fillText(midiToNoteName(m), noteX + 4, noteY + noteH * 0.65);
        }
      });
    });
  }, [chords, activeChordIndex, cascadeMs]);

  return (
    <>
      <div className="roll-wrap">
        <canvas ref={canvasRef} id="pianoRoll" width={1200} height={230} />
      </div>
      <div className="legend">
        <span>
          <i style={{ background: '#4fd1c5' }} />
          Top Voice (Melody / Color)
        </span>
        <span>
          <i style={{ background: '#f59e0b' }} />
          Inner Guide Tones (3 &amp; 7)
        </span>
        <span>
          <i style={{ background: '#b45309' }} />
          Bass Foundation
        </span>
        <span>
          <i style={{ background: '#3d426b' }} />
          Bar Lines
        </span>
      </div>
    </>
  );
}
