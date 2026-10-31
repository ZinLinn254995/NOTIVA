/**
 * NOTIVA — Manual Music Notation Studio
 * Chord Row Editor
 * Supports common and slash chords, independent track, editable layout modes, and raw text preservation
 */

import React, { useState, useEffect } from 'react';
import { MusicRow, ChordLayoutType, MusicEvent } from '../../types/music';
import { parseChordString, serializeChordEvents, isValidChordSyntax } from '../../utils/notationParser';
import { Sliders, Trash2, AlertCircle } from 'lucide-react';

interface ChordRowEditorProps {
  row: MusicRow;
  trackName: string;
  onUpdateRow: (updated: MusicRow) => void;
  onDeleteRow: () => void;
  onSelectEvent?: (evt: MusicEvent) => void;
  activeEventId?: string;
}

export const ChordRowEditor: React.FC<ChordRowEditorProps> = ({
  row,
  trackName,
  onUpdateRow,
  onDeleteRow,
  onSelectEvent,
  activeEventId,
}) => {
  const [inputText, setInputText] = useState(row.rawInput || serializeChordEvents(row.events));
  const [layoutMode, setLayoutMode] = useState<ChordLayoutType>(row.chordLayout || 'single');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setInputText(row.rawInput || serializeChordEvents(row.events));
    }
  }, [row.rawInput, row.events, isTyping]);

  const handleInputChange = (val: string, newLayout?: ChordLayoutType) => {
    setIsTyping(true);
    setInputText(val);
    const mode = newLayout || layoutMode;
    const parsedEvents = parseChordString(val);
    onUpdateRow({
      ...row,
      rawInput: val,
      events: parsedEvents,
      chordLayout: mode,
    });
  };

  const handleLayoutChange = (mode: ChordLayoutType) => {
    setLayoutMode(mode);
    onUpdateRow({
      ...row,
      chordLayout: mode,
    });
  };

  const insertChord = (chord: string) => {
    const updated = inputText.trim() ? `${inputText.trim()} ${chord}` : chord;
    handleInputChange(updated);
  };

  return (
    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-indigo-400">
            <Sliders className="w-3.5 h-3.5" />
            {trackName} (Chord Track)
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{row.events.length} chord{row.events.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Layout mode switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
            {(['single', 'equal_split', 'slot_based', 'unknown'] as ChordLayoutType[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleLayoutChange(mode)}
                className={`px-2 py-0.5 rounded transition-colors capitalize ${
                  layoutMode === mode
                    ? 'bg-indigo-600 text-white font-medium shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'equal_split' ? 'Equal Split' : mode === 'slot_based' ? 'Slot' : mode}
              </button>
            ))}
          </div>

          <button
            onClick={onDeleteRow}
            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
            title="Remove Chord Row"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setIsTyping(false)}
          placeholder="Enter chords e.g. C, Am G/B, Dm7, F#m, Bb, Gsus"
          className="w-full px-3 py-1.5 text-sm font-mono bg-slate-950 text-slate-100 rounded-md border border-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600 tracking-wide font-medium"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-0.5">
          <span>Separate chords with space: "C G/B Am F" · Sustain with "-"</span>
        </div>
      </div>

      {/* Visual Chord Tokens */}
      {row.events.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/70 rounded-md border border-slate-800/80 min-h-[36px]">
          {row.events.map((evt, idx) => {
            const isSelected = activeEventId === evt.id;
            const isValid = isValidChordSyntax(evt.value);

            return (
              <button
                key={evt.id || idx}
                onClick={() => onSelectEvent?.(evt)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all border flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-400'
                    : !isValid
                    ? 'bg-rose-500/10 text-rose-300 border-rose-600/50'
                    : 'bg-slate-800/90 text-indigo-300 border-slate-700 hover:border-indigo-500'
                }`}
                title={`Inspect chord: ${evt.rawText}`}
              >
                <span>{evt.value}</span>
                {!isValid && <AlertCircle className="w-3 h-3 text-rose-400" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Chord Palette */}
      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/60">
        <span className="text-[10px] font-medium text-slate-500 mr-1">Chords:</span>
        {['C', 'G', 'Am', 'F', 'Em', 'Dm', 'D', 'Bb', 'G/B', 'C/E', 'D7', '-'].map((c) => (
          <button
            key={c}
            onClick={() => insertChord(c)}
            className="px-2 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};
