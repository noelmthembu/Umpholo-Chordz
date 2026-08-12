import type { ChangeEvent } from 'react';
import type { FeelKey, InstrumentKey, StyleKey } from '../types';
import { NOTE_NAMES } from '../theory/scales';
import { STYLE_PROFILES } from '../theory/progressions';
import { FEEL_PROFILES } from '../theory/feels';

export interface ControlsState {
  rootPc: number;
  mode: FeelKey;
  style: StyleKey;
  bpm: number;
  bars: number;
  swing: number;
  chordInstrument: InstrumentKey;
}

interface ControlsPanelProps {
  state: ControlsState;
  onChange: <K extends keyof ControlsState>(key: K, value: ControlsState[K]) => void;
  onGenerateChords: () => void;
  onExportMidi: () => void;
  exportDisabled: boolean;
}

const FEEL_ORDER: FeelKey[] = ['minor', 'major', 'soulful', 'jazzy', 'gospel', 'rnb', 'jazzblues'];

const INSTRUMENTS: { value: InstrumentKey; label: string }[] = [
  { value: 'piano', label: 'Grand Piano (sampled Steinway, 4 velocity layers)' },
  { value: 'rhodes', label: 'Rhodes / Wurli (sampled electric piano)' },
  { value: 'organ', label: 'Drawbar Organ (gospel)' },
  { value: 'pad', label: 'Warm Pad (sampled)' },
  { value: 'abtpiano', label: 'ABT Piano (your uploaded one-shots)' },
];

export function ControlsPanel({
  state,
  onChange,
  onGenerateChords,
  onExportMidi,
  exportDisabled,
}: ControlsPanelProps) {
  return (
    <div>
      <div className="panel">
        <h2>Key &amp; Mode</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="rootSel">Root</label>
            <select
              id="rootSel"
              value={state.rootPc}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('rootPc', Number(e.target.value))}
            >
              {NOTE_NAMES.map((n, i) => (
                <option value={i} key={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="modeSel">Mode</label>
            <select
              id="modeSel"
              value={state.mode}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('mode', e.target.value as FeelKey)}
            >
              {FEEL_ORDER.map((m) => (
                <option value={m} key={m}>
                  {FEEL_PROFILES[m].label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="hint">{FEEL_PROFILES[state.mode].description}</p>

        <div className="field">
          <label htmlFor="styleSel">Amapholas Artist Influence</label>
          <select
            id="styleSel"
            value={state.style}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('style', e.target.value as StyleKey)}
          >
            {(Object.keys(STYLE_PROFILES) as StyleKey[]).map((k) => (
              <option value={k} key={k}>
                {STYLE_PROFILES[k].label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <div className="range-readout">
            <label>Tempo</label>
            <span className="val">{state.bpm}</span>
          </div>
          <input
            type="range"
            min={105}
            max={120}
            value={state.bpm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('bpm', Number(e.target.value))}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="barsInput">Length (bars)</label>
            <input
              id="barsInput"
              type="number"
              min={2}
              max={16}
              value={state.bars}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('bars', Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="swingRange">Swing</label>
            <input
              id="swingRange"
              type="range"
              min={0}
              max={60}
              value={state.swing}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('swing', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Instrument</h2>
        <div className="field">
          <label htmlFor="chordInst">Chords</label>
          <select
            id="chordInst"
            value={state.chordInstrument}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('chordInstrument', e.target.value as InstrumentKey)}
          >
            {INSTRUMENTS.map((i) => (
              <option value={i.value} key={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <h2>Generate</h2>
        <button className="btn btn-primary" onClick={onGenerateChords}>
          Generate Chords
        </button>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onExportMidi} disabled={exportDisabled}>
            Export MIDI ⬇
          </button>
        </div>
      </div>
    </div>
  );
}
