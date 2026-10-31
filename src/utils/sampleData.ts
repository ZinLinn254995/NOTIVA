/**
 * NOTIVA — Manual Music Notation Studio
 * Sample Data & Template Factory
 */

import { MusicDocument, MusicBar, MusicRow, SymbolDefinition, MusicTrack } from '../types/music';
import { parseMelodyString, parseChordString, parseRhythmString, createProvenance } from './notationParser';

export const DEFAULT_SYMBOL_LEGEND: Record<string, SymbolDefinition> = {
  B: { label: 'Bass Drum / Kick', description: 'Deep bass drum hit or pedal tap' },
  x: { label: 'Hi-Hat / Ghost', description: 'Closed hi-hat or muted percussive touch' },
  H: { label: 'Hat Hit / Rimshot', description: 'Sharp accent on hi-hat or snare rim' },
  '+': { label: 'Choke / Muted', description: 'Hand choke or staccato damped note' },
  o: { label: 'Open Hi-Hat', description: 'Sustained open hi-hat ring' },
  T: { label: 'Tom / Accent', description: 'Middle or low tom strike' },
  '8': { label: 'Eighth Accent', description: 'Driving eighth-note pulse mark' },
};

export const DEFAULT_TRACKS: MusicTrack[] = [
  { id: 'track_chord', name: 'Chord', role: 'Harmony / Progression', color: '#6366f1' },
  { id: 'track_melody', name: 'Melody', role: 'Lead Vocal / Instrument', color: '#0ea5e9' },
  { id: 'track_rhythm', name: 'Rhythm', role: 'Groove / Percussion', color: '#10b981' },
];

export const INSTRUMENT_PRESETS = [
  { name: 'KB', role: 'Keyboard / Synth', alias: 'K.B Synth' },
  { name: 'Piano', role: 'Acoustic Piano', alias: 'Grand Piano' },
  { name: 'Violin', role: 'Strings / Lead', alias: 'Vln' },
  { name: 'Oboe', role: 'Woodwind', alias: 'Ob' },
  { name: 'GT Clean', role: 'Electric Guitar', alias: 'Guitar Clean' },
  { name: 'Bass', role: 'Electric / Acoustic Bass', alias: 'Bass GT' },
  { name: 'Drum', role: 'Percussion / Drum Kit', alias: 'Drums' },
  { name: 'Horn String', role: 'Orchestral Brass/Strings', alias: 'Horns' },
  { name: 'Choir', role: 'Vocal Ensemble', alias: 'Vocals' },
  { name: 'Vocal + Plucking', role: 'Acoustic Lead', alias: 'Unplugged' },
  { name: 'ALL', role: 'Full Ensemble', alias: 'Tutti' },
  { name: 'Only Rhythm', role: 'Rhythm Section', alias: 'Rhythm Only' },
  { name: 'Drum Only', role: 'Drum Solo / Intro', alias: 'Drums Only' },
  { name: 'K.B Synth Only', role: 'Ambient Keyboard', alias: 'Synth Only' },
];

export const SECTION_SUGGESTIONS = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus (CHO)',
  'Bridge',
  'Solo',
  'Music',
  'Outro',
  'End',
  'Fine',
];

/**
 * Creates a brand new empty song document
 */
export function createNewDocument(title: string = 'Untitled Song', timeSignature: string = '4/4', tempoBpm: number = 100): MusicDocument {
  const docId = 'doc_' + Math.random().toString(36).substring(2, 9);
  const introSecId = 'sec_' + Math.random().toString(36).substring(2, 9);
  const verseSecId = 'sec_' + Math.random().toString(36).substring(2, 9);

  const bars: Record<string, MusicBar> = {};
  const rows: Record<string, MusicRow> = {};

  const barIdsIntro: string[] = [];
  const barIdsVerse: string[] = [];

  let barCounter = 1;

  // 2 bars for Intro
  for (let i = 0; i < 2; i++) {
    const barId = 'bar_' + Math.random().toString(36).substring(2, 9);
    barIdsIntro.push(barId);

    const chordRowId = 'row_' + Math.random().toString(36).substring(2, 9);
    const melodyRowId = 'row_' + Math.random().toString(36).substring(2, 9);

    rows[chordRowId] = {
      id: chordRowId,
      barId,
      trackId: 'track_chord',
      type: 'chord',
      rawInput: 'C',
      events: parseChordString('C', 4),
      chordLayout: 'single',
    };

    rows[melodyRowId] = {
      id: melodyRowId,
      barId,
      trackId: 'track_melody',
      type: 'melody',
      rawInput: '1 2 3 5',
      events: parseMelodyString('1 2 3 5'),
    };

    bars[barId] = {
      id: barId,
      sectionId: introSecId,
      barNumber: barCounter++,
      rowIds: [chordRowId, melodyRowId],
    };
  }

  // 2 bars for Verse
  for (let i = 0; i < 2; i++) {
    const barId = 'bar_' + Math.random().toString(36).substring(2, 9);
    barIdsVerse.push(barId);

    const chordRowId = 'row_' + Math.random().toString(36).substring(2, 9);
    const melodyRowId = 'row_' + Math.random().toString(36).substring(2, 9);

    rows[chordRowId] = {
      id: chordRowId,
      barId,
      trackId: 'track_chord',
      type: 'chord',
      rawInput: i === 0 ? 'Am' : 'G',
      events: parseChordString(i === 0 ? 'Am' : 'G', 4),
      chordLayout: 'single',
    };

    rows[melodyRowId] = {
      id: melodyRowId,
      barId,
      trackId: 'track_melody',
      type: 'melody',
      rawInput: i === 0 ? '6, 1 2 3' : '5 - - -',
      events: parseMelodyString(i === 0 ? '6, 1 2 3' : '5 - - -'),
    };

    bars[barId] = {
      id: barId,
      sectionId: verseSecId,
      barNumber: barCounter++,
      rowIds: [chordRowId, melodyRowId],
    };
  }

  return {
    schemaVersion: '1.0.0',
    id: docId,
    title,
    metadata: {
      songTitle: title,
      originalKey: 'G',
      notatedKey: 'G',
      soundingKey: 'G',
      keyModifier: '',
      tempoBpm,
      beatUnit: 4,
      timeSignature,
      styleGenre: 'Contemporary',
      notedBy: 'Composer',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      provenance: createProvenance('Initial document draft'),
    },
    sections: [
      { id: introSecId, name: 'Intro', barIds: barIdsIntro },
      { id: verseSecId, name: 'Verse 1', barIds: barIdsVerse },
    ],
    bars,
    tracks: [...DEFAULT_TRACKS],
    rows,
    rhythmPatterns: [
      {
        id: 'pat_basic_rock',
        name: 'Basic Rock 4/4',
        rawNotation: 'B x H x',
        symbolLegend: { B: 'Bass', x: 'Hi-Hat', H: 'Snare' },
        gridDefinition: '16-step',
      },
    ],
    symbolLegend: { ...DEFAULT_SYMBOL_LEGEND },
    arrangementMode: 'ALL',
    customInstruments: [
      { id: 'inst_kb', name: 'KB', alias: 'Keyboard' },
      { id: 'inst_oboe', name: 'Oboe', alias: 'Woodwind' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Creates the showcase sample song demonstrating all NOTIVA capabilities
 */
export function createShowcaseDocument(): MusicDocument {
  const docId = 'doc_showcase_dawn_mandalay';
  const secIntro = 'sec_intro';
  const secVerse = 'sec_verse_1';
  const secChorus = 'sec_cho';
  const secOutro = 'sec_outro';

  const bars: Record<string, MusicBar> = {};
  const rows: Record<string, MusicRow> = {};

  const barData: Array<{
    secId: string;
    chord: string;
    melody: string;
    rhythm?: string;
    repeatStart?: boolean;
    repeatEnd?: boolean;
    barMarker?: string;
    cues?: Array<{ label: string; type: 'Enter' | 'Exit' | 'Solo' | 'Fill' }>;
  }> = [
    // Intro
    {
      secId: secIntro,
      chord: 'G',
      melody: "1/ 2/ 3 5",
      rhythm: 'B . x B',
      barMarker: '$',
      cues: [{ label: 'Piano', type: 'Enter' }],
    },
    {
      secId: secIntro,
      chord: 'Em',
      melody: "6, 1 2/ 3/ 5 -",
      rhythm: 'B x H x',
      cues: [{ label: 'Drum', type: 'Enter' }],
    },
    {
      secId: secIntro,
      chord: 'C',
      melody: "3/ 2/ 1 6,",
      rhythm: 'B . x B',
    },
    {
      secId: secIntro,
      chord: 'D7',
      melody: "2 - - -",
      rhythm: 'B x H +',
      repeatEnd: true,
      cues: [{ label: 'Vocal', type: 'Enter' }],
    },

    // Verse 1
    {
      secId: secVerse,
      chord: 'G',
      melody: "1 1 2 3",
      rhythm: 'B . x x',
      repeatStart: true,
    },
    {
      secId: secVerse,
      chord: 'Bm',
      melody: "3 2 1 -",
      rhythm: 'B . x x',
    },
    {
      secId: secVerse,
      chord: 'C',
      melody: "6, 1 2/ 3/ 2",
      rhythm: 'B . x B',
    },
    {
      secId: secVerse,
      chord: 'D',
      melody: "1 - - -",
      rhythm: 'B x H +',
      repeatEnd: true,
    },

    // Chorus (CHO)
    {
      secId: secChorus,
      chord: 'G',
      melody: "5 5 6 5",
      rhythm: 'B x H x',
      barMarker: 'To CHO',
      cues: [{ label: 'ALL', type: 'Enter' }],
    },
    {
      secId: secChorus,
      chord: 'C',
      melody: "3/ 2/ 1 2 -",
      rhythm: 'B x H x',
    },
    {
      secId: secChorus,
      chord: 'Am',
      melody: "2 3 5 3",
      rhythm: 'B x H x',
      cues: [{ label: 'Violin', type: 'Solo' }],
    },
    {
      secId: secChorus,
      chord: 'D',
      melody: "1 - - -",
      rhythm: 'B x H T',
      barMarker: 'Rit.',
    },

    // Outro
    {
      secId: secOutro,
      chord: 'G/B',
      melody: "3 5 1' -",
      rhythm: 'B . x .',
      barMarker: 'Roll',
    },
    {
      secId: secOutro,
      chord: 'G',
      melody: "1' - - -",
      rhythm: 'B - - -',
      barMarker: 'Fine',
      cues: [{ label: 'Piano', type: 'Fill' }],
    },
  ];

  const introBarIds: string[] = [];
  const verseBarIds: string[] = [];
  const chorusBarIds: string[] = [];
  const outroBarIds: string[] = [];

  barData.forEach((b, idx) => {
    const barId = `bar_showcase_${idx + 1}`;
    if (b.secId === secIntro) introBarIds.push(barId);
    else if (b.secId === secVerse) verseBarIds.push(barId);
    else if (b.secId === secChorus) chorusBarIds.push(barId);
    else if (b.secId === secOutro) outroBarIds.push(barId);

    const chordRowId = `row_chord_${barId}`;
    const melodyRowId = `row_melody_${barId}`;
    const rowIds = [chordRowId, melodyRowId];

    rows[chordRowId] = {
      id: chordRowId,
      barId,
      trackId: 'track_chord',
      type: 'chord',
      rawInput: b.chord,
      events: parseChordString(b.chord, 4),
      chordLayout: b.chord.includes(' ') ? 'equal_split' : 'single',
    };

    rows[melodyRowId] = {
      id: melodyRowId,
      barId,
      trackId: 'track_melody',
      type: 'melody',
      rawInput: b.melody,
      events: parseMelodyString(b.melody),
    };

    if (b.rhythm) {
      const rhythmRowId = `row_rhythm_${barId}`;
      rowIds.push(rhythmRowId);
      rows[rhythmRowId] = {
        id: rhythmRowId,
        barId,
        trackId: 'track_rhythm',
        type: 'rhythm',
        rawInput: b.rhythm,
        events: parseRhythmString(b.rhythm, 4),
      };
    }

    bars[barId] = {
      id: barId,
      sectionId: b.secId,
      barNumber: idx + 1,
      repeatStart: b.repeatStart,
      repeatEnd: b.repeatEnd,
      barMarker: b.barMarker,
      cues: b.cues?.map((c, cIdx) => ({
        id: `cue_${barId}_${cIdx}`,
        trackId: 'track_melody',
        instrumentLabel: c.label,
        cueType: c.type,
      })),
      rowIds,
    };
  });

  return {
    schemaVersion: '1.0.0',
    id: docId,
    title: 'Dawn Over Mandalay (သံလွင်မနက်ခင်း)',
    metadata: {
      songTitle: 'Dawn Over Mandalay (သံလွင်မနက်ခင်း)',
      originalKey: 'G',
      notatedKey: 'G',
      soundingKey: 'G',
      keyModifier: 'Standard Tuning (440Hz)',
      tempoBpm: 96,
      beatUnit: 4,
      timeSignature: '4/4',
      styleGenre: 'Acoustic Folk / Ballad',
      notedBy: 'Maung Than & NOTIVA Team',
      date: '2026-10-30',
      notes: 'Preserves traditional Burmese modal nuances alongside numbered Jianpu notation and chord chart cues.',
      provenance: createProvenance('Curated master score', 'high'),
    },
    sections: [
      { id: secIntro, name: 'Intro', barIds: introBarIds, marker: '$' },
      { id: secVerse, name: 'Verse 1', barIds: verseBarIds },
      { id: secChorus, name: 'Chorus (CHO)', barIds: chorusBarIds, marker: 'To CHO' },
      { id: secOutro, name: 'Outro', barIds: outroBarIds, marker: 'Fine' },
    ],
    bars,
    tracks: [...DEFAULT_TRACKS],
    rows,
    rhythmPatterns: [
      {
        id: 'pat_mandalay_folk',
        name: 'Mandalay Folk Pulse',
        rawNotation: 'B . x B x',
        symbolLegend: { B: 'Bass Drum / Tap', x: 'Hi-Hat / Brush' },
        gridDefinition: '8-step',
      },
    ],
    symbolLegend: { ...DEFAULT_SYMBOL_LEGEND },
    arrangementMode: 'ALL',
    customInstruments: [
      { id: 'inst_kb', name: 'KB', alias: 'Keyboard' },
      { id: 'inst_vocal', name: 'Vocal + Plucking', alias: 'Acoustic Guitar & Voice' },
      { id: 'inst_violin', name: 'Violin', alias: 'Fiddle' },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
