/**
 * NOTIVA — Manual Music Notation Studio
 * Rhythm Row Editor
 * Supports custom rhythm glyphs, user-configurable symbol legend, and raw pattern inputs
 */

import React, { useState, useEffect } from 'react';
import { MusicRow, SymbolDefinition, MusicEvent } from '../../types/music';
import { parseRhythmString, serializeRhythmEvents } from '../../utils/notationParser';
import { Drum, Trash2, HelpCircle } from 'lucide-react';

interface RhythmRowEditorProps {
  row: MusicRow;
  trackName: string;
  symbolLegend: Record<string, SymbolDefinition>;
  onUpdateRow: (updated: MusicRow) => void;
  onDeleteRow: () => void;
  onSelectEvent?: (evt: MusicEvent) => void;
  activeEventId?: string;
}

export const RhythmRowEditor: React.FC<RhythmRowEditorProps> = ({
  row,
  trackName,
  symbolLegend,
  onUpdateRow,
  onDeleteRow,
  onSelectEvent,
  activeEventId,
}) => {
  const [inputText, setInputText] = useState(row.rawInput || serializeRhythmEvents(row.events));
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isTyping) {
      setInputText(row.rawInput || serializeRhythmEvents(row.events));
    }
  }, [row.rawInput, row.events, isTyping]);

  const handleInputChange = (val: string) => {
    setIsTyping(true);
    setInputText(val);
    const parsedEvents = parseRhythmString(val);
    onUpdateRow({
      ...row,
      rawInput: val,
      events: parsedEvents,
    });
  };

  const insertSymbol = (sym: string) => {
    const updated = inputText.trim() ? `${inputText.trim()} ${sym}` : sym;
    handleInputChange(updated);
  };

  return (
    <div className="rounded-lg bg-slate-900/90 border border-slate-800 p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <Drum className="w-3.5 h-3.5" />
            {trackName} (Rhythm Track)
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{row.events.length} hit{row.events.length !== 1 ? 's' : ''}</span>
        </div>

        <button
          onClick={onDeleteRow}
          className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
          title="Remove Rhythm Row"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input */}
      <div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={() => setIsTyping(false)}
          placeholder="Enter rhythm symbols e.g. B . x B x | H + o T"
          className="w-full px-3 py-1.5 text-sm font-mono bg-slate-950 text-slate-100 rounded-md border border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 tracking-wider font-semibold"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-0.5">
          <span>Separate symbols with space: "B x H x" · Rest with "." or "0"</span>
        </div>
      </div>

      {/* Visual Rhythm Event Chips */}
      {row.events.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/70 rounded-md border border-slate-800/80 min-h-[36px]">
          {row.events.map((evt, idx) => {
            const isSelected = activeEventId === evt.id;
            const symInfo = symbolLegend[evt.value];

            return (
              <button
                key={evt.id || idx}
                onClick={() => onSelectEvent?.(evt)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400'
                    : 'bg-slate-800/90 text-emerald-300 border-slate-700 hover:border-emerald-500'
                }`}
                title={symInfo ? `${symInfo.label}: ${symInfo.description}` : `Custom symbol: ${evt.value}`}
              >
                <span>{evt.value}</span>
                {symInfo && (
                  <span className="text-[10px] text-slate-400 font-normal font-sans">
                    {symInfo.label.split('/')[0].trim()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Rhythm Symbol Buttons from active legend */}
      <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/60">
        <span className="text-[10px] font-medium text-slate-500 mr-1">Symbols:</span>
        {Object.entries(symbolLegend).map(([glyph, def]) => (
          <button
            key={glyph}
            onClick={() => insertSymbol(glyph)}
            className="px-2 h-6 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-medium transition-colors"
            title={`${def.label} — ${def.description}`}
          >
            {glyph}
          </button>
        ))}
        <button
          onClick={() => insertSymbol('.')}
          className="px-2 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-mono transition-colors"
          title="Rest / Space (.)"
        >
          .
        </button>
      </div>
    </div>
  );
};
