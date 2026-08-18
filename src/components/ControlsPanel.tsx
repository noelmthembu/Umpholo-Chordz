import type { ChangeEvent } from 'react';
import type { CascadeDirection, FeelKey, InstrumentKey, StyleKey } from '../types';
import { NOTE_NAMES } from '../theory/scales';
import { FEEL_PROFILES } from '../theory/feels';
import { CascadeKnob } from './CascadeKnob';

export interface ControlsState {
  rootPc: number;
  mode: FeelKey;
  style: StyleKey;
  bpm: number;
  bars: number;
  swing: number;
  chordInstrument: InstrumentKey;
  cascadeMs: number;
  cascadeDirection: CascadeDirection;
  handBalance: 'balanced' | 'leadSing' | 'bassSolid' | 'warmTrio';
}

interface ControlsPanelProps {
  state: ControlsState;
  onChange: <K extends keyof ControlsState>(key: K, value: ControlsState[K]) => void;
  onGenerateChords: () => void;
  onExportMidi: () => void;
  onOpen150Progressions: () => void;
  onOpenVoicingExplorer: () => void;
  exportDisabled: boolean;
}

const FEEL_ORDER: FeelKey[] = [
  'soulful',
  'jazzy',
  'modaljazz',
  'bossanova',
  'coltrane',
  'ballad',
  'bebopprivate',
  'gospel',
  'rnb',
  'minor',
  'major',
  'jazzblues',
];

const INSTRUMENTS: { value: InstrumentKey; label: string }[] = [
  { value: 'piano', label: 'Grand Piano (Steinway Concert Grand, 4 Velocity Layers)' },
  { value: 'rhodes', label: 'Rhodes Mk I (Warm sampled electric piano)' },
  { value: 'pad', label: 'Lush Analog Pad (sampled velvet strings)' },
  { value: 'organ', label: 'Drawbar B3 Organ (gospel rotary)' },
  { value: 'abtpiano', label: 'ABT Piano (custom one-shots)' },
];

export function ControlsPanel({
  state,
  onChange,
  onGenerateChords,
  onExportMidi,
  onOpen150Progressions,
  onOpenVoicingExplorer,
  exportDisabled,
}: ControlsPanelProps) {
  const currentFeel = FEEL_PROFILES[state.mode] || FEEL_PROFILES.soulful;

  return (
    <div className="controls-column">
      {/* 1. Quick Master Libraries Buttons */}
      <div className="panel quick-launcher-panel">
        <div className="quick-launcher-grid">
          <button
            type="button"
            className="btn-launcher btn-launcher-presets"
            onClick={onOpen150Progressions}
          >
            <span className="launcher-icon">📚</span>
            <div className="launcher-content">
              <strong className="launcher-title">150 Performed Progressions</strong>
              <span className="launcher-sub">Standards, Bebop, Neo-Soul &amp; Coltrane</span>
            </div>
          </button>

          <button
            type="button"
            className="btn-launcher btn-launcher-voicings"
            onClick={onOpenVoicingExplorer}
          >
            <span className="launcher-icon">🎹</span>
            <div className="launcher-content">
              <strong className="launcher-title">1,500+ Jazz Voicings</strong>
              <span className="launcher-sub">Rootless, Drop-2, Quartal &amp; USTs</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Key & Harmonic Feel */}
      <div className="panel">
        <h2>Harmonic Foundation</h2>
        <div className="field-row">
          <div className="field">
            <label htmlFor="rootSel">Tonic Root</label>
            <select
              id="rootSel"
              value={state.rootPc}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('rootPc', Number(e.target.value))}
            >
              {NOTE_NAMES.map((n, i) => (
                <option value={i} key={n}>
                  Key: {n}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="modeSel">Genre Feel</label>
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
        <p className="hint">{currentFeel.description}</p>

        {/* Pianist & Artist Influence */}
        <div className="field">
          <label htmlFor="styleSel">Pianist Touch &amp; Artist Influence</label>
          <select
            id="styleSel"
            value={state.style}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange('style', e.target.value as StyleKey)}
          >
            <optgroup label="Jazz Legends &amp; Modern Masters">
              <option value="billevans">Bill Evans — rootless A/B, delicate guide-tone voice leading</option>
              <option value="herbie">Herbie Hancock — quartal sus4s, open fifths, rich modal color</option>
              <option value="glasper">Robert Glasper — neo-soul clusters, dragging pocket, tight 2nds</option>
              <option value="mccoytyner">McCoy Tyner — powerful stacked 4ths, pentatonic stabs</option>
              <option value="kennybarron">Kenny Barron — 5-voice concert spreads, open 4ths/5ths</option>
              <option value="barryharris">Barry Harris — 6th-diminished scale, locked-hands drop-2</option>
            </optgroup>
            <optgroup label="Private School Amapiano Pioneers">
              <option value="kelvinmomo">Kelvin Momo — Private School pioneer, moody minimalist jazz</option>
              <option value="kabza">Kabza De Small — spacious, soulful, foundational Amapiano piano</option>
              <option value="melmusiq">MelMusiq — melodic, flowing soulful piano runs</option>
              <option value="jappino">Jappino — rich, jazz-forward chord work</option>
              <option value="bandros">Bandros — deep, meditative extended voicings</option>
              <option value="stixx">Stixx — bright, bouncy jazzy stabs</option>
              <option value="soulfuldesciple">Soulful Deciple — gospel-tinged, lush 9ths</option>
              <option value="djstoks">DJ Stokie — soulful, warm chord pads</option>
              <option value="masmusiq">Mas Musiq — catchy, melodic piano hooks</option>
              <option value="deepphil">Deep Phil — deep-house-tinged smooth chords</option>
              <option value="djyvino">Djy Vino — soulful Private School warmth</option>
            </optgroup>
          </select>
        </div>

        {/* Hand Balance Profile */}
        <div className="field">
          <label htmlFor="handBalanceSel">Pianist Velocity Balance</label>
          <select
            id="handBalanceSel"
            value={state.handBalance}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChange('handBalance', e.target.value as 'balanced' | 'leadSing' | 'bassSolid' | 'warmTrio')
            }
          >
            <option value="leadSing">Melody Singing (Top voice +8%, inner tones warm &amp; recessed)</option>
            <option value="balanced">Natural Balanced Touch (Even Steinway response)</option>
            <option value="bassSolid">Bass Grounded (Solid root foundation for low registers)</option>
            <option value="warmTrio">Warm Trio Comping (Inner guide tones prominent)</option>
          </select>
        </div>

        {/* Tempo and Swing */}
        <div className="field">
          <div className="range-readout">
            <label>Tempo (BPM)</label>
            <span className="val">{state.bpm}</span>
          </div>
          <input
            type="range"
            min={60}
            max={160}
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
            <label htmlFor="swingRange">Jazz Swing</label>
            <input
              id="swingRange"
              type="range"
              min={0}
              max={65}
              value={state.swing}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange('swing', Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* 3. Cascade Strum Control */}
      <div className="panel">
        <CascadeKnob
          value={state.cascadeMs}
          direction={state.cascadeDirection}
          onChange={(val) => onChange('cascadeMs', val)}
          onDirectionChange={(dir) => onChange('cascadeDirection', dir)}
        />
      </div>

      {/* 4. Playback Instrument */}
      <div className="panel">
        <h2>Sound &amp; Tone</h2>
        <div className="field">
          <label htmlFor="chordInst">Instrument Sample Layer</label>
          <select
            id="chordInst"
            value={state.chordInstrument}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              onChange('chordInstrument', e.target.value as InstrumentKey)
            }
          >
            {INSTRUMENTS.map((i) => (
              <option value={i.value} key={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Generation & MIDI Export */}
      <div className="panel">
        <h2>Generate &amp; Export</h2>
        <button className="btn btn-primary" onClick={onGenerateChords}>
          ✨ Generate Jazz Chords
        </button>
        <div className="btn-row" style={{ marginTop: 10 }}>
          <button className="btn btn-ghost" onClick={onExportMidi} disabled={exportDisabled}>
            ⬇ Export Progression MIDI
          </button>
        </div>
      </div>
    </div>
  );
}
