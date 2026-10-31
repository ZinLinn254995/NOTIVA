/**
 * NOTIVA — Manual Music Notation Studio
 * Core Data Models & Provenance Architecture
 * Version: 1.0.0
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'assumed' | null;
export type VerificationStatus = 'unconfirmed' | 'confirmed' | 'dismissed';

export interface Provenance {
  rawText: string;
  confidence: ConfidenceLevel;
  status: VerificationStatus;
  userEdit?: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  notes?: string;
}

export type EventKind = 'note' | 'rest' | 'sustain' | 'ambiguous' | 'group';

export interface MusicEvent {
  id: string;
  kind: EventKind;
  value: string; // e.g. "1", "2", "3", "0", "-", "Am7", "x", etc.
  octave?: number; // -2, -1, 0, 1, 2
  octaveRaw?: string; // "'", "''", ",", ",,", or custom raw
  durationModifier?: string; // "/" (eighth), "//" (sixteenth), "-" (sustain), "." (dotted)
  offsetTick?: number | null; // integer ticks relative to bar (e.g. 480 ticks per quarter note), nullable if ambiguous
  durationTick?: number | null; // nullable if ambiguous
  rawText: string;
  provenance: Provenance;
  isUnderlined?: boolean; // eighth note
  isDoubleUnderlined?: boolean; // sixteenth note
  isDotted?: boolean;
  beamGroupId?: string; // for grouped pairs like 1/ 2/
}

export type RowType = 'melody' | 'chord' | 'rhythm';
export type ChordLayoutType = 'single' | 'equal_split' | 'slot_based' | 'unknown';

export interface MusicRow {
  id: string;
  barId: string;
  trackId: string;
  type: RowType;
  rawInput: string;
  events: MusicEvent[];
  chordLayout?: ChordLayoutType;
  provenance?: Provenance;
}

export type CueType = 'Enter' | 'Exit' | 'Solo' | 'Fill' | 'Unknown';

export interface InstrumentCue {
  id: string;
  trackId: string;
  instrumentLabel: string;
  cueType: CueType;
  scope?: string; // optional scope description
}

export interface MusicBar {
  id: string;
  sectionId: string;
  barNumber: number;
  timeSignature?: string; // optional override for this bar (e.g. "3/4" in a "4/4" piece)
  repeatStart?: boolean; // |:
  repeatEnd?: boolean; // :|
  barMarker?: string; // "$", "Fine", "To CHO", "D.S.", "Roll", "Rit.", "Final Hit", etc.
  cues?: InstrumentCue[];
  rowIds: string[];
}

export interface MusicSection {
  id: string;
  name: string; // "Intro", "Verse 1", "Chorus (CHO)", "Bridge", "Solo", "Music", "Outro", etc.
  repeatStart?: boolean;
  repeatEnd?: boolean;
  marker?: string;
  barIds: string[];
}

export interface MusicTrack {
  id: string;
  name: string; // "Piano", "Chord", "Violin", "Oboe", "Vocal", "Bass", "Drum", etc.
  role: string;
  color?: string;
  isMuted?: boolean;
}

export interface RhythmPattern {
  id: string;
  name: string;
  rawNotation: string;
  symbolLegend: Record<string, string>;
  gridDefinition?: string;
  trackAssignment?: string;
}

export interface SymbolDefinition {
  label: string;
  description: string;
  suggestedGlyph?: string;
}

export type ArrangementMode = 'ALL' | 'Only Rhythm' | 'Drum Only' | 'Custom Arrangement';

export interface DocumentMetadata {
  songTitle: string;
  originalKey: string;
  notatedKey: string;
  soundingKey: string;
  keyModifier: string; // preserves exact raw text (e.g. "#", "b", "capo 2", "drop D")
  tempoBpm: number;
  beatUnit: number; // 4 for quarter, 8 for eighth
  timeSignature: string; // e.g. "4/4", "3/4", "6/8"
  styleGenre: string;
  notedBy: string;
  date: string;
  notes: string;
  provenance: Provenance;
}

export interface MusicDocument {
  schemaVersion: '1.0.0';
  id: string;
  title: string;
  metadata: DocumentMetadata;
  sections: MusicSection[];
  bars: Record<string, MusicBar>;
  tracks: MusicTrack[];
  rows: Record<string, MusicRow>;
  rhythmPatterns: RhythmPattern[];
  symbolLegend: Record<string, SymbolDefinition>;
  arrangementMode: ArrangementMode;
  customInstruments: Array<{ id: string; name: string; alias: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  id: string;
  code:
    | 'incomplete_bar'
    | 'overfull_bar'
    | 'missing_duration'
    | 'unknown_rhythm_symbol'
    | 'ambiguous_octave'
    | 'ambiguous_rest'
    | 'invalid_chord_syntax'
    | 'repeat_mismatch'
    | 'ds_target_missing'
    | 'unresolved_marker';
  severity: 'error' | 'warning' | 'info';
  location: {
    sectionId?: string;
    sectionName?: string;
    barId?: string;
    barNumber?: number;
    rowId?: string;
    trackName?: string;
    eventId?: string;
    symbol?: string;
  };
  description: string;
  suggestion: string;
  status: VerificationStatus;
}
