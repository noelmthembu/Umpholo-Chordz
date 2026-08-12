import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Hero } from './components/Hero';
import { ControlsPanel, type ControlsState } from './components/ControlsPanel';
import { ChordStrip } from './components/ChordStrip';
import { PianoRoll } from './components/PianoRoll';
import { TransportBar } from './components/TransportBar';
import { SessionLog } from './components/SessionLog';
import { useSession } from './state/useSession';
import { buildSynths, disposeSynths, whenSynthsReady, type SynthMap } from './audio/synths';
import { scheduleTransport } from './audio/transport';
import { buildMidiFile, downloadMidi } from './midi/midiWriter';
import { NOTE_NAMES } from './theory/scales';
import type { GenerationParams } from './types';

const DEFAULT_STATE: ControlsState = {
  rootPc: 0,
  mode: 'soulful',
  style: 'kelvinmomo',
  bpm: 112,
  bars: 4,
  swing: 30,
  chordInstrument: 'piano',
};

export default function App() {
  const [controls, setControls] = useState<ControlsState>(DEFAULT_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const session = useSession();

  const synthsRef = useRef<SynthMap | null>(null);
  const partRef = useRef<Tone.Part | null>(null);
  const [samplesReady, setSamplesReady] = useState(false);

  useEffect(() => {
    const synths = buildSynths();
    synthsRef.current = synths;
    whenSynthsReady(synths).then(() => setSamplesReady(true));
    return () => {
      disposeSynths(synths);
      partRef.current?.dispose();
    };
  }, []);

  const paramsFromControls = useCallback(
    (): GenerationParams => ({
      rootPc: controls.rootPc,
      mode: controls.mode,
      style: controls.style,
      bars: controls.bars,
      bpm: controls.bpm,
      swing: controls.swing / 100,
    }),
    [controls]
  );

  const handleChange = useCallback(<K extends keyof ControlsState>(key: K, value: ControlsState[K]) => {
    setControls((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reschedule = useCallback(
    (chords = session.chords) => {
      if (!synthsRef.current) return;
      partRef.current?.dispose();
      partRef.current = scheduleTransport({
        synths: synthsRef.current,
        chords,
        bpm: controls.bpm,
        swing: controls.swing / 100,
        chordInstrument: controls.chordInstrument,
      });
    },
    [controls, session.chords]
  );

  const handleGenerateChords = useCallback(() => {
    const c = session.generateChords(paramsFromControls());
    if (isPlaying) reschedule(c);
  }, [session, paramsFromControls, isPlaying, reschedule]);

  const handlePlay = useCallback(async () => {
    await Tone.start();
    if (synthsRef.current) await whenSynthsReady(synthsRef.current);
    let chords = session.chords;
    if (chords.length === 0) {
      chords = session.generateChords(paramsFromControls());
    }
    reschedule(chords);
    Tone.Transport.start();
    setIsPlaying(true);
  }, [session, paramsFromControls, reschedule]);

  const handleStop = useCallback(() => {
    Tone.Transport.stop();
    setIsPlaying(false);
  }, []);

  const handleExportMidi = useCallback(() => {
    const bytes = buildMidiFile(session.chords, controls.bpm);
    const filename = `umpholo-amapholas-${NOTE_NAMES[controls.rootPc]}-${controls.mode}-${Date.now()}.mid`;
    downloadMidi(bytes, filename);
  }, [session.chords, controls.bpm, controls.rootPc, controls.mode]);

  // live-update tempo while playing
  useEffect(() => {
    if (isPlaying) Tone.Transport.bpm.value = controls.bpm;
  }, [controls.bpm, isPlaying]);

  // reschedule when instrument/swing choices change during playback
  useEffect(() => {
    if (isPlaying) reschedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.chordInstrument, controls.swing]);

  return (
    <>
      <Hero />
      <div className="wrap">
        <ControlsPanel
          state={controls}
          onChange={handleChange}
          onGenerateChords={handleGenerateChords}
          onExportMidi={handleExportMidi}
          exportDisabled={session.chords.length === 0}
        />

        <div>
          <div className="panel">
            <div className="output-head">
              <h2>Chord Progression</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!samplesReady && (
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Loading piano samples…</span>
                )}
                <TransportBar isPlaying={isPlaying} onPlay={handlePlay} onStop={handleStop} />
              </div>
            </div>

            <ChordStrip chords={session.chords} />

            <h2 style={{ marginTop: 6 }}>Chord Roll</h2>
            <PianoRoll chords={session.chords} />
          </div>

          <SessionLog log={session.log} />
        </div>
      </div>

      <footer>
        Built with the Web Audio API via <code>Tone.js</code> for playback, and a hand-rolled
        Standard MIDI File (SMF format 1) writer for export — no server round-trip required. All
        generation, synthesis, and export happens client-side in your browser.
      </footer>
    </>
  );
}
