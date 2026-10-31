/**
 * NOTIVA — Manual Music Notation Studio
 * Validation Engine
 * Detects structural and notation issues with stable IDs and non-destructive user corrections
 */

import { MusicDocument, ValidationIssue } from '../types/music';
import { TICKS_PER_QUARTER, isValidChordSyntax } from './notationParser';

export function parseTimeSignature(timeSig: string): { beats: number; unit: number } {
  const parts = timeSig.split('/');
  const beats = parseInt(parts[0], 10) || 4;
  const unit = parseInt(parts[1], 10) || 4;
  return { beats, unit };
}

export function validateMusicDocument(
  doc: MusicDocument,
  existingDismissedIds: Set<string> = new Set()
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const defaultTimeSig = parseTimeSignature(doc.metadata.timeSignature || '4/4');
  const expectedTicksPerBar = (defaultTimeSig.beats * 4 * TICKS_PER_QUARTER) / defaultTimeSig.unit;

  // Track repeat signs and D.S. / $ signs
  const repeatTracker: { current: { barId: string; barNum: number } | null } = { current: null };
  let hasDalSegno = false;
  let hasSegnoSign = false;

  const unknownRhythmSymbolMap = new Map<string, { count: number; bars: number[] }>();

  // Check all sections and bars
  doc.sections.forEach((section) => {
    section.barIds.forEach((barId) => {
      const bar = doc.bars[barId];
      if (!bar) return;

      const barNumber = bar.barNumber;

      // Repeat structure check
      if (bar.repeatStart) {
        repeatTracker.current = { barId, barNum: barNumber };
      }
      if (bar.repeatEnd) {
        if (!repeatTracker.current) {
          const issueId = `repeat_end_without_start_${barId}`;
          issues.push({
            id: issueId,
            code: 'repeat_mismatch',
            severity: 'warning',
            location: { sectionId: section.id, sectionName: section.name, barId, barNumber },
            description: `Bar ${barNumber} has repeat end ':|' without a preceding repeat start ':|'.`,
            suggestion: `Add repeat start '|:' to an earlier bar or remove this repeat end.`,
            status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
          });
        } else {
          repeatTracker.current = null; // matched
        }
      }

      // Check bar markers like D.S. and $ (Segno)
      if (bar.barMarker === '$' || section.marker === '$') {
        hasSegnoSign = true;
      }
      if (bar.barMarker === 'D.S.' || section.marker === 'D.S.') {
        hasDalSegno = true;
      }

      // Row checks
      bar.rowIds.forEach((rowId) => {
        const row = doc.rows[rowId];
        if (!row) return;

        const track = doc.tracks.find((t) => t.id === row.trackId);
        const trackName = track?.name || row.type;

        // Check melody rows
        if (row.type === 'melody') {
          let rowDurationTicks = 0;
          let hasAmbiguousDuration = false;

          row.events.forEach((evt) => {
            // Check ambiguous glyphs
            if (evt.kind === 'ambiguous') {
              hasAmbiguousDuration = true;
              const issueId = `ambiguous_token_${evt.id}`;
              issues.push({
                id: issueId,
                code: 'ambiguous_octave',
                severity: 'info',
                location: {
                  sectionId: section.id,
                  sectionName: section.name,
                  barId,
                  barNumber,
                  rowId,
                  trackName,
                  eventId: evt.id,
                  symbol: evt.value,
                },
                description: `Ambiguous notation symbol "${evt.value}" in bar ${barNumber}.`,
                suggestion: `Verify if this was intended as a note (1-7), rest (0), or sustain (-).`,
                status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
              });
            }

            if (evt.durationTick !== null && evt.durationTick !== undefined) {
              rowDurationTicks += evt.durationTick;
            } else {
              hasAmbiguousDuration = true;
            }
          });

          // Check bar total timing if there are events and none are ambiguous
          if (row.events.length > 0 && !hasAmbiguousDuration) {
            const tolerance = 10; // small tick tolerance
            if (rowDurationTicks < expectedTicksPerBar - tolerance) {
              const issueId = `incomplete_bar_${rowId}`;
              issues.push({
                id: issueId,
                code: 'incomplete_bar',
                severity: 'warning',
                location: { sectionId: section.id, sectionName: section.name, barId, barNumber, rowId, trackName },
                description: `Bar ${barNumber} (${trackName}) is incomplete: ${rowDurationTicks / TICKS_PER_QUARTER} beats vs expected ${expectedTicksPerBar / TICKS_PER_QUARTER}.`,
                suggestion: `Add notes, rests (0), or sustain (-) to complete the measure.`,
                status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
              });
            } else if (rowDurationTicks > expectedTicksPerBar + tolerance) {
              const issueId = `overfull_bar_${rowId}`;
              issues.push({
                id: issueId,
                code: 'overfull_bar',
                severity: 'warning',
                location: { sectionId: section.id, sectionName: section.name, barId, barNumber, rowId, trackName },
                description: `Bar ${barNumber} (${trackName}) is overfull: ${rowDurationTicks / TICKS_PER_QUARTER} beats exceed measure length.`,
                suggestion: `Adjust note durations or split notes into the next measure.`,
                status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
              });
            }
          }
        }

        // Check chord rows
        if (row.type === 'chord') {
          row.events.forEach((evt) => {
            if (evt.kind !== 'sustain' && !isValidChordSyntax(evt.value)) {
              const issueId = `invalid_chord_${evt.id}`;
              issues.push({
                id: issueId,
                code: 'invalid_chord_syntax',
                severity: 'warning',
                location: {
                  sectionId: section.id,
                  sectionName: section.name,
                  barId,
                  barNumber,
                  rowId,
                  trackName,
                  eventId: evt.id,
                  symbol: evt.value,
                },
                description: `Unrecognized chord symbol "${evt.value}" in bar ${barNumber}.`,
                suggestion: `Check chord spelling (e.g. C, Am, G/B, F#m, Bm7b5).`,
                status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
              });
            }
          });
        }

        // Check rhythm rows
        if (row.type === 'rhythm') {
          row.events.forEach((evt) => {
            const sym = evt.value;
            // Ignore standard rests/sustains
            if (sym !== '0' && sym !== '.' && sym !== '-' && sym !== '—') {
              if (!doc.symbolLegend[sym]) {
                const prev = unknownRhythmSymbolMap.get(sym) || { count: 0, bars: [] };
                prev.count++;
                if (!prev.bars.includes(barNumber)) prev.bars.push(barNumber);
                unknownRhythmSymbolMap.set(sym, prev);
              }
            }
          });
        }
      });
    });
  });

  // Check if D.S. was used without Segno $
  if (hasDalSegno && !hasSegnoSign) {
    const issueId = `ds_without_segno`;
    issues.push({
      id: issueId,
      code: 'ds_target_missing',
      severity: 'error',
      location: {},
      description: `Piece contains "D.S." (Dal Segno) jump marker, but no matching "$" (Segno) destination was found.`,
      suggestion: `Add a "$" marker to the target section or bar.`,
      status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
    });
  }

  // Check unclosed repeat start
  if (repeatTracker.current) {
    const unclosed = repeatTracker.current;
    const issueId = `unclosed_repeat_start_${unclosed.barId}`;
    issues.push({
      id: issueId,
      code: 'repeat_mismatch',
      severity: 'info',
      location: { barId: unclosed.barId, barNumber: unclosed.barNum },
      description: `Bar ${unclosed.barNum} opened a repeat '|:' that is not closed with ':|'.`,
      suggestion: `Add a repeat end ':|' to mark the end of the repeated section.`,
      status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
    });
  }

  // Grouped unknown rhythm symbols to avoid hundreds of duplicate warnings!
  unknownRhythmSymbolMap.forEach((data, symbol) => {
    const issueId = `unknown_rhythm_symbol_${symbol}`;
    issues.push({
      id: issueId,
      code: 'unknown_rhythm_symbol',
      severity: 'info',
      location: { symbol },
      description: `Custom rhythm symbol "${symbol}" used ${data.count} times (bars ${data.bars.slice(0, 5).join(', ')}${data.bars.length > 5 ? '...' : ''}) is not registered in the Symbol Legend.`,
      suggestion: `Add "${symbol}" to the Symbol Legend in Instrument Library to define its sound/technique.`,
      status: existingDismissedIds.has(issueId) ? 'dismissed' : 'unconfirmed',
    });
  });

  return issues;
}
