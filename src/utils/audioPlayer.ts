/**
 * NOTIVA — Manual Music Notation Studio
 * Web Audio Player
 * Clean, zero-dependency synthesizer for auditioning manual notation (numbered melody, chords, rhythm)
 */

import { MusicDocument, MusicBar, MusicRow, MusicEvent } from '../types/music';
import { parseTimeSignature } from './validation';
import { TICKS_PER_QUARTER } from './notationParser';

// Scale semitone offsets for major scale degrees (1 to 7)
const MAJOR_SCALE_INTERVALS: Record<number, number> = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};

// Base MIDI note for Key (octave 4)
const KEY_BASE_MIDI: Record<string, number> = {
  C: 60,
  'C#': 61,
  Db: 61,
  D: 62,
  'D#': 63,
  Eb: 63,
  E: 64,
  F: 65,
  'F#': 66,
  Gb: 66,
  G: 67,
  'G#': 68,
  Ab: 68,
  A: 69,
  'A#': 70,
  Bb: 70,
  B: 71,
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimeout: any = null;
  private onHighlightCallback?: (barId: string, eventId?: string) => void;
  private onStopCallback?: () => void;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playNoteTone(freq: number, durationSec: number, type: OscillatorType = 'triangle') {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationSec);
    } catch {
      // Audio context error ignore
    }
  }

  public playRhythmClick(symbol: string) {
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (symbol.toUpperCase() === 'B') {
        // Bass drum thump
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      } else {
        // High click / hat / tap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore audio error
    }
  }

  public playDocument(
    doc: MusicDocument,
    onHighlight: (barId: string, eventId?: string) => void,
    onStop: () => void,
    startFromBarId?: string
  ) {
    this.stop();
    this.initCtx();
    this.isPlaying = true;
    this.onHighlightCallback = onHighlight;
    this.onStopCallback = onStop;

    const keyName = doc.metadata.notatedKey || doc.metadata.originalKey || 'C';
    const baseMidi = KEY_BASE_MIDI[keyName.replace(/m$/, '')] || 60;
    const tempo = Math.max(30, Math.min(300, doc.metadata.tempoBpm || 100));
    const secondsPerQuarter = 60 / tempo;
    const secondsPerTick = secondsPerQuarter / TICKS_PER_QUARTER;

    // Collect all bars in playback order
    const orderedBars: MusicBar[] = [];
    doc.sections.forEach((sec) => {
      sec.barIds.forEach((bId) => {
        const bar = doc.bars[bId];
        if (bar) orderedBars.push(bar);
      });
    });

    if (orderedBars.length === 0) {
      this.stop();
      return;
    }

    let startIndex = 0;
    if (startFromBarId) {
      const idx = orderedBars.findIndex((b) => b.id === startFromBarId);
      if (idx !== -1) startIndex = idx;
    }

    let barIndex = startIndex;

    const playNextBar = () => {
      if (!this.isPlaying || barIndex >= orderedBars.length) {
        this.stop();
        return;
      }

      const bar = orderedBars[barIndex];
      this.onHighlightCallback?.(bar.id);

      const timeSig = parseTimeSignature(bar.timeSignature || doc.metadata.timeSignature || '4/4');
      const barDurationSec = (timeSig.beats * 4 * secondsPerQuarter) / timeSig.unit;

      // Find melody and rhythm rows in this bar
      bar.rowIds.forEach((rId) => {
        const row = doc.rows[rId];
        if (!row) return;

        if (row.type === 'melody') {
          let accumSec = 0;
          row.events.forEach((evt) => {
            const eventSec = ((evt.durationTick ?? TICKS_PER_QUARTER) * secondsPerTick);
            const playTime = accumSec;

            this.currentTimeout = setTimeout(() => {
              if (!this.isPlaying) return;
              this.onHighlightCallback?.(bar.id, evt.id);

              if (evt.kind === 'note') {
                const degree = parseInt(evt.value, 10);
                if (degree >= 1 && degree <= 7) {
                  const semitone = MAJOR_SCALE_INTERVALS[degree] ?? 0;
                  const octaveOffset = (evt.octave ?? 0) * 12;
                  const noteMidi = baseMidi + semitone + octaveOffset;
                  this.playNoteTone(midiToFreq(noteMidi), Math.max(0.1, eventSec * 0.9));
                }
              }
            }, playTime * 1000);

            accumSec += eventSec;
          });
        } else if (row.type === 'rhythm') {
          let accumSec = 0;
          row.events.forEach((evt) => {
            const eventSec = ((evt.durationTick ?? TICKS_PER_QUARTER) * secondsPerTick);
            const playTime = accumSec;

            setTimeout(() => {
              if (!this.isPlaying) return;
              if (evt.kind === 'note') {
                this.playRhythmClick(evt.value);
              }
            }, playTime * 1000);

            accumSec += eventSec;
          });
        }
      });

      // Schedule next bar
      barIndex++;
      this.currentTimeout = setTimeout(() => {
        playNextBar();
      }, barDurationSec * 1000);
    };

    playNextBar();
  }

  public stop() {
    this.isPlaying = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.onStopCallback?.();
  }

  public getPlaybackState(): boolean {
    return this.isPlaying;
  }
}

export const audioEngine = new AudioEngine();
