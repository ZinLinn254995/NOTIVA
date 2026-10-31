/**
 * NOTIVA — Manual Music Notation Studio
 * Bar Card Component
 * Represents a measure supporting independent Melody, Chord, Rhythm rows and instrument cues
 */

import React, { useState } from 'react';
import { MusicBar, MusicRow, MusicTrack, SymbolDefinition, MusicEvent, CueType } from '../../types/music';
import { MelodyRowEditor } from './MelodyRowEditor';
import { ChordRowEditor } from './ChordRowEditor';
import { RhythmRowEditor } from './RhythmRowEditor';
import {
  Copy,
  Plus,
  Trash2,
  Repeat,
  Flag,
  Radio,
  MoreVertical,
  PlusCircle,
  Tag,
  Clock,
} from 'lucide-react';

interface BarCardProps {
  bar: MusicBar;
  rows: Record<string, MusicRow>;
  tracks: MusicTrack[];
  symbolLegend: Record<string, SymbolDefinition>;
  isActive: boolean;
  activeEventId?: string;
  onSelectBar: (barId: string) => void;
  onUpdateBar: (updatedBar: MusicBar) => void;
  onUpdateRow: (updatedRow: MusicRow) => void;
  onAddRow: (barId: string, trackId: string, type: 'melody' | 'chord' | 'rhythm') => void;
  onDeleteRow: (rowId: string) => void;
  onDuplicateBar: (barId: string) => void;
  onDeleteBar: (barId: string) => void;
  onAddBarAfter: (barId: string) => void;
  onSelectEvent?: (evt: MusicEvent) => void;
}

export const BarCard: React.FC<BarCardProps> = ({
  bar,
  rows,
  tracks,
  symbolLegend,
  isActive,
  activeEventId,
  onSelectBar,
  onUpdateBar,
  onUpdateRow,
  onAddRow,
  onDeleteRow,
  onDuplicateBar,
  onDeleteBar,
  onAddBarAfter,
  onSelectEvent,
}) => {
  const [showAddRowMenu, setShowAddRowMenu] = useState(false);
  const [showMarkerMenu, setShowMarkerMenu] = useState(false);
  const [showCueModal, setShowCueModal] = useState(false);

  // Cue form states
  const [cueLabel, setCueLabel] = useState('Piano');
  const [cueType, setCueType] = useState<CueType>('Enter');

  const barRows = bar.rowIds.map((rId) => rows[rId]).filter(Boolean);

  const toggleRepeatStart = () => {
    onUpdateBar({
      ...bar,
      repeatStart: !bar.repeatStart,
    });
  };

  const toggleRepeatEnd = () => {
    onUpdateBar({
      ...bar,
      repeatEnd: !bar.repeatEnd,
    });
  };

  const setBarMarker = (marker: string | undefined) => {
    onUpdateBar({
      ...bar,
      barMarker: marker,
    });
    setShowMarkerMenu(false);
  };

  const handleAddCue = () => {
    const newCue = {
      id: 'cue_' + Math.random().toString(36).substring(2, 9),
      trackId: 'track_lead',
      instrumentLabel: cueLabel,
      cueType: cueType,
    };
    onUpdateBar({
      ...bar,
      cues: [...(bar.cues || []), newCue],
    });
    setShowCueModal(false);
  };

  const handleRemoveCue = (cueId: string) => {
    onUpdateBar({
      ...bar,
      cues: (bar.cues || []).filter((c) => c.id !== cueId),
    });
  };

  return (
    <div
      onClick={() => onSelectBar(bar.id)}
      className={`rounded-xl border transition-all ${
        isActive
          ? 'bg-slate-900/95 border-sky-500/70 shadow-lg shadow-sky-950/30 ring-1 ring-sky-500/50'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      } p-4 space-y-3.5`}
    >
      {/* Bar Header Bar */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* Bar Number Badge */}
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
            Bar {bar.barNumber}
          </span>

          {/* Repeat Start button |: */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRepeatStart();
            }}
            className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors border ${
              bar.repeatStart
                ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Repeat Start |:"
          >
            |:
          </button>

          {/* Repeat End button :| */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleRepeatEnd();
            }}
            className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-colors border ${
              bar.repeatEnd
                ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Repeat End :|"
          >
            :|
          </button>

          {/* Bar Marker Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMarkerMenu(!showMarkerMenu);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors border ${
                bar.barMarker
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Add or edit Bar Marker"
            >
              <Flag className="w-3 h-3" />
              <span>{bar.barMarker || 'Marker'}</span>
            </button>

            {/* Marker Dropdown */}
            {showMarkerMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-7 left-0 z-30 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 text-xs"
              >
                {['$', 'Fine', 'To CHO', 'D.S.', 'Roll', 'Rit.', 'Final Hit'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setBarMarker(m)}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors font-medium"
                  >
                    {m}
                  </button>
                ))}
                {bar.barMarker && (
                  <button
                    onClick={() => setBarMarker(undefined)}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-950/50 text-rose-400 transition-colors border-t border-slate-800 mt-1"
                  >
                    Clear Marker
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Instrument Cue Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCueModal(true);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200 transition-colors"
            title="Add Instrument Cue"
          >
            <Radio className="w-3 h-3 text-indigo-400" />
            <span>Cue</span>
          </button>
        </div>

        {/* Bar Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateBar(bar.id);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
            title="Duplicate Bar"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddBarAfter(bar.id);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
            title="Insert Bar After"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBar(bar.id);
            }}
            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
            title="Delete Bar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Attached Instrument Cues */}
      {bar.cues && bar.cues.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {bar.cues.map((cue) => (
            <div
              key={cue.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] bg-indigo-950/60 border border-indigo-800/80 text-indigo-300"
            >
              <span>
                {cue.instrumentLabel}: <strong>{cue.cueType}</strong>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCue(cue.id);
                }}
                className="hover:text-rose-300 ml-0.5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Rows in this Bar */}
      <div className="space-y-2.5">
        {barRows.length === 0 ? (
          <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
            No notation rows in this bar. Add a Chord, Melody, or Rhythm row below.
          </div>
        ) : (
          barRows.map((row) => {
            const track = tracks.find((t) => t.id === row.trackId);
            const trackName = track?.name || 'Track';

            if (row.type === 'melody') {
              return (
                <MelodyRowEditor
                  key={row.id}
                  row={row}
                  trackName={trackName}
                  onUpdateRow={onUpdateRow}
                  onDeleteRow={() => onDeleteRow(row.id)}
                  onSelectEvent={onSelectEvent}
                  activeEventId={activeEventId}
                />
              );
            }

            if (row.type === 'chord') {
              return (
                <ChordRowEditor
                  key={row.id}
                  row={row}
                  trackName={trackName}
                  onUpdateRow={onUpdateRow}
                  onDeleteRow={() => onDeleteRow(row.id)}
                  onSelectEvent={onSelectEvent}
                  activeEventId={activeEventId}
                />
              );
            }

            if (row.type === 'rhythm') {
              return (
                <RhythmRowEditor
                  key={row.id}
                  row={row}
                  trackName={trackName}
                  symbolLegend={symbolLegend}
                  onUpdateRow={onUpdateRow}
                  onDeleteRow={() => onDeleteRow(row.id)}
                  onSelectEvent={onSelectEvent}
                  activeEventId={activeEventId}
                />
              );
            }

            return null;
          })
        )}
      </div>

      {/* Add Row Button / Dropdown */}
      <div className="relative pt-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddRowMenu(!showAddRowMenu);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-sky-400 py-1 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Notation Row</span>
        </button>

        {showAddRowMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-8 left-0 z-20 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 text-xs"
          >
            <div className="px-2 py-1 text-[10px] text-slate-500 font-semibold uppercase">Choose Row Type</div>
            <button
              onClick={() => {
                onAddRow(bar.id, 'track_melody', 'melody');
                setShowAddRowMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-sky-300 font-medium flex items-center justify-between"
            >
              <span>+ Melody (Jianpu)</span>
            </button>
            <button
              onClick={() => {
                onAddRow(bar.id, 'track_chord', 'chord');
                setShowAddRowMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-indigo-300 font-medium flex items-center justify-between"
            >
              <span>+ Chord Row</span>
            </button>
            <button
              onClick={() => {
                onAddRow(bar.id, 'track_rhythm', 'rhythm');
                setShowAddRowMenu(false);
              }}
              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-800 text-emerald-300 font-medium flex items-center justify-between"
            >
              <span>+ Rhythm Row</span>
            </button>
          </div>
        )}
      </div>

      {/* Cue Modal */}
      {showCueModal && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-400" />
              Add Instrument Cue for Bar {bar.barNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Instrument / Role</label>
                <input
                  type="text"
                  value={cueLabel}
                  onChange={(e) => setCueLabel(e.target.value)}
                  placeholder="e.g. Piano, Violin, Drum, ALL, KB"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Cue Action</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Enter', 'Exit', 'Solo', 'Fill', 'Unknown'] as CueType[]).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setCueType(action)}
                      className={`px-2 py-1.5 rounded text-xs font-medium border text-center transition-colors ${
                        cueType === action
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCueModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCue}
                className="px-3 py-1.5 rounded text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Attach Cue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
