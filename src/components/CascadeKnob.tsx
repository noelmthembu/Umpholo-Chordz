import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { CascadeDirection } from '../types';

interface CascadeKnobProps {
  value: number; // 0 to 80 ms
  direction: CascadeDirection;
  onChange: (value: number) => void;
  onDirectionChange: (direction: CascadeDirection) => void;
}

const PRESETS: { label: string; ms: number; dir: CascadeDirection; desc: string }[] = [
  { label: 'Tight', ms: 4, dir: 'ease', desc: 'Punchy simultaneous block attack' },
  { label: 'Pianist Roll', ms: 22, dir: 'ease', desc: 'Natural Steinway wrist & finger roll' },
  { label: 'Lush Cascade', ms: 45, dir: 'ease', desc: 'Slow, expressive neo-soul waterfall' },
  { label: 'Harp Strum', ms: 75, dir: 'up', desc: 'Wide bottom-to-top harp sweep' },
  { label: 'LH Flam', ms: 28, dir: 'flam', desc: 'Split LH bass grounding then RH cluster' },
  { label: 'Top-Down', ms: 30, dir: 'down', desc: 'Melody-first reverse cascade' },
];

export function CascadeKnob({
  value,
  direction,
  onChange,
  onDirectionChange,
}: CascadeKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startYRef.current = e.clientY;
      startValRef.current = value;
    },
    [value]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const newVal = Math.max(0, Math.min(80, Math.round(startValRef.current + deltaY * 0.5)));
      onChange(newVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  // Rotary angle: -135deg (0ms) to +135deg (80ms)
  const angle = -135 + (value / 80) * 270;

  return (
    <div className="cascade-control-box">
      <div className="cascade-header">
        <div className="cascade-title-row">
          <span className="cascade-badge">HUMAN STRUM</span>
          <h3 className="cascade-title">Cascade Knob</h3>
        </div>
        <div className="cascade-readout">
          <span className="cascade-ms">{value}</span>
          <span className="cascade-unit">ms</span>
        </div>
      </div>

      <p className="cascade-desc">
        Natural pianistic finger roll — adjusts micro-stagger of notes from bottom to top for realistic jazz touch.
      </p>

      <div className="cascade-knob-container">
        <div
          className={`rotary-knob ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
          aria-hidden="true"
        >
          <div className="knob-dial" style={{ transform: `rotate(${angle}deg)` }}>
            <div className="knob-indicator" />
          </div>
          <div className="knob-core">
            <span className="knob-text">{value}ms</span>
          </div>
        </div>

        {/* Visual Cascade Ripple Waves */}
        <div className="cascade-visualizer">
          {[...Array(6)].map((_, i) => {
            const delay = (i * (value / 80) * 0.12).toFixed(3);
            return (
              <div
                key={i}
                className="cascade-bar"
                style={{
                  height: `${30 + i * 10}%`,
                  animationDelay: `${delay}s`,
                  opacity: Math.max(0.2, 0.4 + (value / 80) * 0.6),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Range Slider for Accessible / Direct Touch */}
      <div className="cascade-slider-row">
        <label className="sr-only" htmlFor="cascadeTiming">Cascade timing</label>
        <input
          id="cascadeTiming"
          type="range"
          min={0}
          max={80}
          value={value}
          aria-valuetext={`${value} milliseconds` }
          onChange={(e) => onChange(Number(e.target.value))}
          className="cascade-slider"
        />
      </div>

      {/* Cascade Direction Selector */}
      <div className="direction-selector">
        <span className="direction-label">Roll Curve:</span>
        <div className="direction-buttons">
          <button
            type="button"
            className={`btn-dir ${direction === 'ease' ? 'active' : ''}`}
            onClick={() => onDirectionChange('ease')}
            title="Pianist Roll (Exponential ease-in: bass planted, treble ripples)"
          >
            Pianist roll
          </button>
          <button
            type="button"
            className={`btn-dir ${direction === 'up' ? 'active' : ''}`}
            onClick={() => onDirectionChange('up')}
            title="Linear Upward Strum (Bottom to top)"
          >
            Upward
          </button>
          <button
            type="button"
            className={`btn-dir ${direction === 'down' ? 'active' : ''}`}
            onClick={() => onDirectionChange('down')}
            title="Reverse Roll (Treble melody first)"
          >
            Top-down
          </button>
          <button
            type="button"
            className={`btn-dir ${direction === 'flam' ? 'active' : ''}`}
            onClick={() => onDirectionChange('flam')}
            title="Two-Handed Flam (LH bass note precedes RH chord)"
          >
            Flam
          </button>
        </div>
      </div>

      {/* Preset Quick-Buttons */}
      <div className="cascade-presets">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className={`btn-preset ${value === p.ms && direction === p.dir ? 'active' : ''}`}
            onClick={() => {
              onChange(p.ms);
              onDirectionChange(p.dir);
            }}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
