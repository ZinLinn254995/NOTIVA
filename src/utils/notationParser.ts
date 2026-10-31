/**
 * NOTIVA — Manual Music Notation Studio
 * Notation Parser & Serializer for Melody (Jianpu), Chords, and Rhythm
 */

import { MusicEvent, EventKind, Provenance } from '../types/music';

// Default ticks: Quarter note = 480 ticks
export const TICKS_PER_QUARTER = 480;

/**
 * Creates default provenance for user input or parsed token
 */
export function createProvenance(rawText: string, confidence: 'high' | 'medium' | 'low' | 'assumed' = 'high'): Provenance {
  return {
    rawText,
    confidence,
    status: 'unconfirmed',
    userEdit: true,
    confirmedAt: new Date().toISOString(),
  };
}

/**
 * Parse a single melody token string into a MusicEvent
 * Examples:
 * "1" -> note 1, octave 0, quarter
 * "5'" -> note 5, octave +1
 * "6," -> note 6, octave -1
 * "3/" -> note 3, eighth (underlined)
 * "2//" -> note 2, sixteenth (double underlined)
 * "5/." -> note 5, dotted eighth
 * "0" -> rest
 * "-" -> sustain dash
 * "?" or ambiguous glyphs -> ambiguous event, rawText preserved!
 */
export function parseMelodyToken(token: string, offsetTick: number | null = null): MusicEvent {
  const rawText = token;
  const trimmed = token.trim();

  if (!trimmed) {
    return {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      kind: 'ambiguous',
      value: '',
      rawText: token,
      provenance: createProvenance(token, 'low'),
    };
  }

  // Check if sustain dash
  if (trimmed === '-' || trimmed === '—') {
    return {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      kind: 'sustain',
      value: '-',
      rawText,
      durationTick: TICKS_PER_QUARTER,
      offsetTick,
      provenance: createProvenance(rawText, 'high'),
    };
  }

  // Check if rest
  if (trimmed.startsWith('0')) {
    const isEighth = trimmed.includes('/');
    const isSixteenth = trimmed.includes('//');
    const isDotted = trimmed.includes('.');
    let dur = TICKS_PER_QUARTER;
    if (isSixteenth) dur = TICKS_PER_QUARTER / 4;
    else if (isEighth) dur = TICKS_PER_QUARTER / 2;
    if (isDotted) dur = Math.round(dur * 1.5);

    return {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      kind: 'rest',
      value: '0',
      durationModifier: isSixteenth ? '//' : isEighth ? '/' : undefined,
      isUnderlined: isEighth && !isSixteenth,
      isDoubleUnderlined: isSixteenth,
      isDotted,
      durationTick: dur,
      offsetTick,
      rawText,
      provenance: createProvenance(rawText, 'high'),
    };
  }

  // Regex to extract note (1-7), octave marks (', ,, etc.), duration modifiers (//, /, -, .)
  const match = trimmed.match(/^([1-7])(['`,]*)([\/]{1,2})?(\.)?(-*)$/);

  if (match) {
    const noteVal = match[1];
    const octavePart = match[2];
    const slashPart = match[3] || '';
    const dotPart = match[4] || '';
    const dashPart = match[5] || '';

    // Calculate octave: count apostrophes (up) vs commas (down)
    let octave = 0;
    const upCount = (octavePart.match(/['`]/g) || []).length;
    const downCount = (octavePart.match(/[,]/g) || []).length;
    octave = upCount - downCount;

    const isSixteenth = slashPart === '//';
    const isEighth = slashPart === '/';
    const isDotted = !!dotPart;

    let dur = TICKS_PER_QUARTER;
    if (isSixteenth) dur = TICKS_PER_QUARTER / 4;
    else if (isEighth) dur = TICKS_PER_QUARTER / 2;
    if (isDotted) dur = Math.round(dur * 1.5);
    if (dashPart) {
      dur += dashPart.length * TICKS_PER_QUARTER;
    }

    return {
      id: 'evt_' + Math.random().toString(36).substring(2, 9),
      kind: 'note',
      value: noteVal,
      octave,
      octaveRaw: octavePart || undefined,
      durationModifier: slashPart || (dashPart ? '-' : undefined),
      isUnderlined: isEighth,
      isDoubleUnderlined: isSixteenth,
      isDotted,
      durationTick: dur,
      offsetTick,
      rawText,
      provenance: createProvenance(rawText, 'high'),
    };
  }

  // If pattern does not strictly match 1-7, treat as ambiguous or custom note without discarding!
  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    kind: 'ambiguous',
    value: trimmed,
    rawText,
    offsetTick,
    durationTick: null, // do not invent durations when ambiguous!
    provenance: createProvenance(rawText, 'low'),
  };
}

/**
 * Parse an entire melody row string (e.g. "1/ 2/ 3 5 | 6, 1 2/ 3/ 5 -") into MusicEvents
 */
export function parseMelodyString(input: string): MusicEvent[] {
  if (!input || !input.trim()) return [];

  // Split by whitespace while preserving tokens
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  let currentTick = 0;

  const events: MusicEvent[] = tokens.map((tok) => {
    const evt = parseMelodyToken(tok, currentTick);
    if (evt.durationTick !== null && evt.durationTick !== undefined) {
      currentTick += evt.durationTick;
    }
    return evt;
  });

  // Identify grouped pairs of 8th/16th notes for beam rendering
  for (let i = 0; i < events.length; i++) {
    if (events[i].isUnderlined || events[i].isDoubleUnderlined) {
      if (i + 1 < events.length && (events[i + 1].isUnderlined || events[i + 1].isDoubleUnderlined)) {
        const groupId = `beam_${i}_${i + 1}`;
        events[i].beamGroupId = groupId;
        events[i + 1].beamGroupId = groupId;
      }
    }
  }

  return events;
}

/**
 * Serialize melody events back into human-readable raw notation string
 */
export function serializeMelodyEvents(events: MusicEvent[]): string {
  return events
    .map((e) => {
      if (e.rawText) return e.rawText;
      let s = e.value;
      if (e.octave && e.octave > 0) s += "'".repeat(e.octave);
      else if (e.octave && e.octave < 0) s += ','.repeat(Math.abs(e.octave));
      if (e.isDoubleUnderlined) s += '//';
      else if (e.isUnderlined) s += '/';
      if (e.isDotted) s += '.';
      return s;
    })
    .join(' ');
}

/**
 * Parse Chord row string (e.g. "C", "Am G/B", "C - - -", "F#m7")
 */
export function parseChordString(input: string, beatsInBar: number = 4): MusicEvent[] {
  if (!input || !input.trim()) return [];

  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const totalTicks = beatsInBar * TICKS_PER_QUARTER;
  const tickPerChord = Math.floor(totalTicks / tokens.length);

  return tokens.map((tok, idx) => {
    const raw = tok.trim();
    const isSustain = raw === '-' || raw === '—' || raw === '%';

    return {
      id: 'chord_' + Math.random().toString(36).substring(2, 9),
      kind: isSustain ? 'sustain' : 'note',
      value: raw,
      rawText: raw,
      offsetTick: idx * tickPerChord,
      durationTick: tickPerChord,
      provenance: createProvenance(raw, 'high'),
    };
  });
}

/**
 * Serialize chord events back to string
 */
export function serializeChordEvents(events: MusicEvent[]): string {
  return events.map((e) => e.rawText || e.value).join(' ');
}

/**
 * Parse Rhythm row string (e.g. "B . x B x", "H + o T")
 */
export function parseRhythmString(input: string, beatsInBar: number = 4): MusicEvent[] {
  if (!input || !input.trim()) return [];

  const tokens = input.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const totalTicks = beatsInBar * TICKS_PER_QUARTER;
  const tickPerEvent = Math.floor(totalTicks / tokens.length);

  return tokens.map((tok, idx) => {
    const raw = tok.trim();
    const isRest = raw === '0' || raw === '.';
    const isSustain = raw === '-' || raw === '—';

    return {
      id: 'rhythm_' + Math.random().toString(36).substring(2, 9),
      kind: isRest ? 'rest' : isSustain ? 'sustain' : 'note',
      value: raw,
      rawText: raw,
      offsetTick: idx * tickPerEvent,
      durationTick: tickPerEvent,
      provenance: createProvenance(raw, 'high'),
    };
  });
}

/**
 * Serialize rhythm events back to string
 */
export function serializeRhythmEvents(events: MusicEvent[]): string {
  return events.map((e) => e.rawText || e.value).join(' ');
}

/**
 * Valid chord root and syntax check
 */
export function isValidChordSyntax(chord: string): boolean {
  if (!chord) return false;
  if (chord === '-' || chord === '—' || chord === '%') return true;
  // Standard chord regex matching Root (A-G with optional #/b) and extensions, slash chords
  const chordRegex = /^[A-G][#b]?(maj|min|m|M|dim|aug|sus[24]?|add[0-9]|dom|[\d])?(\/[A-G][#b]?)?$/i;
  // Also tolerate loose modifiers like Am7, Bbmaj7, C/E, Gsus, etc.
  const looseChordRegex = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|M)?[0-9]*(\/[A-G][#b]?)?$/i;
  return chordRegex.test(chord) || looseChordRegex.test(chord);
}
