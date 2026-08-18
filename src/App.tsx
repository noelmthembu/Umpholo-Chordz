import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { Hero } from './components/Hero';
import { ControlsPanel, type ControlsState } from './components/ControlsPanel';
import { ChordStrip } from './components/ChordStrip';
import { PianoRoll } from './components/PianoRoll';
import { TransportBar } from './components/TransportBar';
import { SessionLog } from './components/SessionLog';
import { ModulationsPanel } from './components/ModulationsPanel';
import { ProgressionsLibraryModal } from './components/ProgressionsLibraryModal';
import { VoicingExplorerModal } from './components/VoicingExplorerModal';
import { KeyboardVisualizer } from './components/KeyboardVisualizer';
import { useSession } from './state/useSession';
import { buildSynths, disposeSynths, whenSynthsReady, type SynthMap } from './audio/synths';
import { scheduleTransport, playAuditionChord } from './audio/transport';
import { buildMidiFile, downloadMidi } from './midi/midiWriter';
import { NOTE_NAMES } from './theory/scales';
import type { Chord, GenerationParams } from './types';

const DEFAULT_STATE: ControlsState = {
  rootPc: 0, // C
  mode: 'soulful',
  style: 'kelvinmomo',
  bpm: 112,
  bars: 4,
  swing: 30,
  chordInstrument: 'piano',
  cascadeMs: 22,
  cascadeDirection: 'ease',
  handBalance: 'leadSing',
};

export default function App() {
  const [controls, setControls] = useState<ControlsState>(DEFAULT_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState<number | null>(null);

  // Modals
  const [is150ModalOpen, setIs150ModalOpen] = useState(false);
  const [isVoicingExplorerOpen, setIsVoicingExplorerOpen] = useState(false);

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
      cascadeMs: controls.cascadeMs,
      cascadeDirection: controls.cascadeDirection,
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
        cascadeMs: controls.cascadeMs,
        cascadeDirection: controls.cascadeDirection,
        handBalance: controls.handBalance,
        onActiveChordChange: (idx) => setActiveChordIndex(idx),
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
    setActiveChordIndex(null);
  }, []);

  // Export Main Progression MIDI
  const handleExportMidi = useCallback(() => {
    const bytes = buildMidiFile(session.chords, {
      bpm: controls.bpm,
      cascadeMs: controls.cascadeMs,
      cascadeDirection: controls.cascadeDirection,
      trackName: `Umpholo Jazz — ${NOTE_NAMES[controls.rootPc]} ${controls.mode}`,
    });
    const filename = `umpholo-jazz-${NOTE_NAMES[controls.rootPc]}-${controls.mode}-${Date.now()}.mid`;
    downloadMidi(bytes, filename);
  }, [session.chords, controls]);

  // Audition a chord or preview
  const handleAuditionSingleChord = useCallback(
    async (chord: Chord) => {
      await Tone.start();
      if (!synthsRef.current) return;
      playAuditionChord(
        synthsRef.current,
        controls.chordInstrument,
        chord.midiNotes,
        controls.cascadeMs,
        controls.cascadeDirection
      );
    },
    [controls.chordInstrument, controls.cascadeMs, controls.cascadeDirection]
  );

  const handleAuditionMidiNotes = useCallback(
    async (midiNotes: number[]) => {
      await Tone.start();
      if (!synthsRef.current) return;
      playAuditionChord(
        synthsRef.current,
        controls.chordInstrument,
        midiNotes,
        controls.cascadeMs,
        controls.cascadeDirection
      );
    },
    [controls.chordInstrument, controls.cascadeMs, controls.cascadeDirection]
  );

  // Preview a sequence of chords
  const handlePreviewSequence = useCallback(
    async (previewChords: Chord[]) => {
      await Tone.start();
      if (!synthsRef.current) return;
      partRef.current?.dispose();
      partRef.current = scheduleTransport({
        synths: synthsRef.current,
        chords: previewChords,
        bpm: controls.bpm,
        swing: controls.swing / 100,
        chordInstrument: controls.chordInstrument,
        cascadeMs: controls.cascadeMs,
        cascadeDirection: controls.cascadeDirection,
        handBalance: controls.handBalance,
        onActiveChordChange: (idx) => setActiveChordIndex(idx),
      });
      Tone.Transport.stop();
      Tone.Transport.start();
      setIsPlaying(true);
    },
    [controls]
  );

  // Load from 150 Progressions modal
  const handleLoadProgression = useCallback(
    (loadedChords: Chord[], bpm: number, rootPc: number) => {
      setControls((prev) => ({ ...prev, bpm, rootPc }));
      session.setChordsList(
        loadedChords,
        `Loaded preset progression in ${NOTE_NAMES[rootPc]} (${bpm} BPM) — [${loadedChords.map((c) => c.symbol).join(' – ')}]`
      );
      if (isPlaying) reschedule(loadedChords);
    },
    [session, isPlaying, reschedule]
  );

  // Live tempo sync
  useEffect(() => {
    if (isPlaying) Tone.Transport.bpm.value = controls.bpm;
  }, [controls.bpm, isPlaying]);

  // Reschedule when instruments, cascade, or balance change
  useEffect(() => {
    if (isPlaying) reschedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls.chordInstrument, controls.swing, controls.cascadeMs, controls.cascadeDirection, controls.handBalance]);

  // Active notes to display on the KeyboardVisualizer
  const activeChord =
    activeChordIndex !== null && session.chords[activeChordIndex]
      ? session.chords[activeChordIndex]
      : session.chords[0] || null;

  return (
    <>
      <Hero
        onOpen150Progressions={() => setIs150ModalOpen(true)}
        onOpenVoicingExplorer={() => setIsVoicingExplorerOpen(true)}
      />

      <div className="wrap">
        <ControlsPanel
          state={controls}
          onChange={handleChange}
          onGenerateChords={handleGenerateChords}
          onExportMidi={handleExportMidi}
          onOpen150Progressions={() => setIs150ModalOpen(true)}
          onOpenVoicingExplorer={() => setIsVoicingExplorerOpen(true)}
          exportDisabled={session.chords.length === 0}
        />

        <div className="main-content-column">
          {/* Active Chord Progression Panel */}
          <div className="panel">
            <div className="output-head">
              <div>
                <h2>Chord Progression</h2>
                <span className="sub-tagline">
                  {session.chords.length > 0
                    ? `${session.chords.length} Chords in ${NOTE_NAMES[controls.rootPc]} • Cascade: ${controls.cascadeMs}ms`
                    : 'Click Generate Chords or select from 150 Presets'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!samplesReady && (
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Loading piano sample layers…</span>
                )}
                <TransportBar isPlaying={isPlaying} onPlay={handlePlay} onStop={handleStop} />
              </div>
            </div>

            <ChordStrip
              chords={session.chords}
              activeChordIndex={activeChordIndex}
              onAuditionChord={handleAuditionSingleChord}
            />

            {/* Live Keyboard Visualizer */}
            {activeChord && (
              <div className="active-keyboard-strip">
                <div className="keyboard-header">
                  <span className="keyboard-chord-name">{activeChord.symbol}</span>
                  <span className="keyboard-notes-list">
                    Active Voicing: {activeChord.voicingLabel || activeChord.symbol}
                  </span>
                </div>
                <KeyboardVisualizer
                  activeMidiNotes={activeChord.midiNotes}
                  rootPc={activeChord.rootPc}
                  startMidi={36}
                  endMidi={84}
                />
              </div>
            )}

            <h2 style={{ marginTop: 22 }}>Piano Roll &amp; Cascade Timing</h2>
            <PianoRoll
              chords={session.chords}
              activeChordIndex={activeChordIndex}
              cascadeMs={controls.cascadeMs}
            />
          </div>

          {/* Suggested Modulations Panel */}
          <ModulationsPanel
            currentRootPc={controls.rootPc}
            bpm={controls.bpm}
            chordInstrument={controls.chordInstrument}
            onPreviewChords={handlePreviewSequence}
            onAppendChords={(appended) => session.appendChordsList(appended)}
            onSetRootKey={(newRoot) => handleChange('rootPc', newRoot)}
          />

          <SessionLog log={session.log} />
        </div>
      </div>

      {/* 150 Performed Progressions Modal */}
      <ProgressionsLibraryModal
        isOpen={is150ModalOpen}
        onClose={() => setIs150ModalOpen(false)}
        onLoadProgression={handleLoadProgression}
        onPreviewChords={handlePreviewSequence}
      />

      {/* 1,500+ Jazz Voicings Explorer Modal */}
      <VoicingExplorerModal
        isOpen={isVoicingExplorerOpen}
        onClose={() => setIsVoicingExplorerOpen(false)}
        onAuditionNotes={handleAuditionMidiNotes}
        onAddChordToTrack={(chord) => session.addSingleChord(chord)}
      />

      <footer>
        <strong>Umpholo Jazz Harmony Workstation</strong> — Featuring 1,500+ unique jazz chord voicings, 150 performed chord progressions, Steinway &amp; Rhodes sample layers with Web Audio API / Tone.js, cascade strum micro-timing, and Standard MIDI File (Format 1) export. 100% client-side.
      </footer>
    </>
  );
}
