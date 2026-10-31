/**
 * NOTIVA — Manual Music Notation Studio
 * Melody Row Editor (Numbered Jianpu Notation)
 * Supports direct text typing, quick glyph pad, individual token editing, and provenance inspection
 */

import React, { useState, useEffect } from 'react';
import { MusicRow, MusicEvent } from '../../types/music';
import { parseMelodyString, parseMelodyToken, serializeMelodyEvents } from '../../utils/notationParser';
import { Music, HelpCircle, Sparkles, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface MelodyRowEditorProps {
  row: MusicRow;
  trackName: string;
  onUpdateRow: (updated: MusicRow) => void;
  onDeleteRow: () => void;
  onSelectEvent?: (evt: MusicEvent) => void;
  activeEventId?: string;
}

export const MelodyRowEditor: React.FC<MelodyRowEditorProps> = ({
  row,
  trackName,
  onUpdateRow,
  onDeleteRow,
  onSelectEvent,
  activeEventId,
}) => {
  const [inputText, setInputText] = useState(row.rawInput || serializeMelodyEvents(row.events));
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setInputText(row.rawInput || serializeMelodyEvents(row.events));
    }
  }, [row.rawInput, row.events, isTyping]);

  const handleInputChange = (val: string) => {
    setIsTyping(true);
    setInputText(val);
    const parsedEvents = parseMelodyString(val);
    onUpdateRow({
      ...row,
      rawInput: val,
      events: parsedEvents,
    });
  };

  const handleInputBlur = () => {
    setIsTyping(false);
  };

  // Quick glyph insert into current input
  const insertGlyph = (glyph: string) => {
    const updated = inputText.trim() ? `${inputText.trim()} ${glyph}` : glyph;
    handleInputChange(updated);
  };

  return (
    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-sky-400">
            <Music className="w-3.5 h-3.5" />
            {trackName} (Melody · Jianpu)
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{row.events.length} notes</span>
        </div>

        <button
          onClick={onDeleteRow}
          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
          title="Remove Melody Row"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Direct Text Input */}
      <div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleInputBlur}
          placeholder="Type numbered notes: 1/ 2/ 3 5 | 6, 1 2/ 3/ 5 -"
          className="w-full px-3 py-1.5 text-sm font-mono bg-slate-950 text-slate-100 rounded-md border border-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600 tracking-wide"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-0.5">
          <span>Notes: 1-7 · Rest: 0 · Octave: ' (up) / , (down) · Eighth: / · Sixteenth: // · Sustain: -</span>
        </div>
      </div>

      {/* Visual Token Chips */}
      {row.events.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/70 rounded-md border border-slate-800/80 min-h-[38px]">
          {row.events.map((evt, idx) => {
            const isSelected = activeEventId === evt.id;
            const isAmbiguous = evt.kind === 'ambiguous';
            const isUnderlined = evt.isUnderlined;
            const isDoubleUnderlined = evt.isDoubleUnderlined;

            return (
              <button
                key={evt.id || idx}
                onClick={() => onSelectEvent?.(evt)}
                className={`relative group px-2 py-1 rounded text-xs font-mono transition-all flex flex-col items-center justify-center min-w-[28px] border ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400 shadow-sm'
                    : isAmbiguous
                    ? 'bg-amber-500/10 text-amber-300 border-amber-600/50'
                    : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-slate-500'
                }`}
                title={`Click to inspect event: ${evt.rawText || evt.value}`}
              >
                {/* Upper Octave indicator */}
                {evt.octave && evt.octave > 0 && (
                  <span className="text-[10px] leading-none text-sky-400 font-bold -mb-1">
                    {"'".repeat(evt.octave)}
                  </span>
                )}

                {/* Main Note Value */}
                <span className={`text-sm font-semibold leading-tight ${isAmbiguous ? 'text-amber-400' : ''}`}>
                  {evt.value}
                  {evt.isDotted ? '.' : ''}
                </span>

                {/* Lower Octave indicator */}
                {evt.octave && evt.octave < 0 && (
                  <span className="text-[10px] leading-none text-sky-400 font-bold -mt-1">
                    {','.repeat(Math.abs(evt.octave))}
                  </span>
                )}

                {/* Underline for Eighth / Sixteenth note */}
                {isUnderlined && (
                  <div className="w-full h-[1.5px] bg-slate-300 rounded-full mt-0.5" />
                )}
                {isDoubleUnderlined && (
                  <div className="w-full space-y-[1px] mt-0.5">
                    <div className="w-full h-[1px] bg-slate-300 rounded-full" />
                    <div className="w-full h-[1px] bg-slate-300 rounded-full" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Glyph Insertion Pad */}
      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/60">
        <span className="text-[10px] font-medium text-slate-500 mr-1">Insert:</span>

        {/* Note degree buttons 1-7 */}
        {['1', '2', '3', '4', '5', '6', '7'].map((deg) => (
          <button
            key={deg}
            onClick={() => insertGlyph(deg)}
            className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition-colors"
          >
            {deg}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Rest & Sustain */}
        <button
          onClick={() => insertGlyph('0')}
          className="px-2 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          title="Rest (0)"
        >
          0
        </button>
        <button
          onClick={() => insertGlyph('-')}
          className="px-2 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          title="Sustain (-)"
        >
          —
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Octave modifiers */}
        <button
          onClick={() => insertGlyph("1'")}
          className="px-1.5 h-6 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono transition-colors"
          title="Upper Octave (')"
        >
          1'
        </button>
        <button
          onClick={() => insertGlyph('1,')}
          className="px-1.5 h-6 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono transition-colors"
          title="Lower Octave (,)"
        >
          1,
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        {/* Duration modifiers */}
        <button
          onClick={() => insertGlyph('1/')}
          className="px-1.5 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          title="Eighth note (/)"
        >
          1/
        </button>
        <button
          onClick={() => insertGlyph('1//')}
          className="px-1.5 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          title="Sixteenth note (//)"
        >
          1//
        </button>
      </div>
    </div>
  );
};
