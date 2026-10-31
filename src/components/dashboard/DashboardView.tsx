/**
 * NOTIVA — Manual Music Notation Studio
 * Dashboard View
 * Provides high-level studio stats, quick sheet creation, templates, and recent compositions
 */

import React from 'react';
import { MusicDocument } from '../../types/music';
import {
  Plus,
  Music,
  FileMusic,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  Sliders,
  Copy,
  Download,
} from 'lucide-react';

interface DashboardViewProps {
  documents: MusicDocument[];
  onOpenSheet: (docId: string) => void;
  onNewSheet: () => void;
  onNewFromTemplate: (type: 'standard' | 'ballad' | 'compound' | 'chord_chart') => void;
  onDuplicateSheet: (doc: MusicDocument) => void;
  onExportSheet: (doc: MusicDocument) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  onOpenSheet,
  onNewSheet,
  onNewFromTemplate,
  onDuplicateSheet,
  onExportSheet,
}) => {
  const totalSheets = documents.length;
  const totalBars = documents.reduce(
    (acc, doc) => acc + Object.keys(doc.bars).length,
    0
  );
  const draftDocs = documents.filter((d) => d.metadata.provenance.status === 'unconfirmed').length || 1;

  // Sorted by updatedAt descending
  const recentDocs = [...documents].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Studio Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Music Notation Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Write Music. Shape Ideas. Manual notation workspace for composers and arrangers.
          </p>
        </div>

        <button
          onClick={onNewSheet}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-950/40 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Music Sheet</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Total Music Sheets</div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">{totalSheets}</div>
          <div className="text-[11px] text-slate-500">Saved in browser storage</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Total Measures Written</div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono tabular-nums">{totalBars}</div>
          <div className="text-[11px] text-slate-500">Across all scores & sections</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="text-xs font-semibold text-slate-400">Draft Documents</div>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono tabular-nums">{draftDocs}</div>
          <div className="text-[11px] text-slate-500">In-progress manual notations</div>
        </div>
      </div>

      {/* Starter Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Starter Templates</h2>
          <span className="text-xs text-slate-500">Quickly initialize standard song forms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => onNewFromTemplate('standard')}
            className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="text-xs font-bold text-sky-400 group-hover:text-sky-300">Standard 4/4 Pop & Song</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Intro + Verse + Chorus with 4/4 time signature and numbered melody row.
            </p>
          </button>

          <button
            onClick={() => onNewFromTemplate('ballad')}
            className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">3/4 Ballad / Waltz</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              3 beats per measure for lyrical acoustic folk and traditional waltzes.
            </p>
          </button>

          <button
            onClick={() => onNewFromTemplate('compound')}
            className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">6/8 Compound Acoustic</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Compound meter with dotted quarter beat units and plucking rhythm tracks.
            </p>
          </button>

          <button
            onClick={() => onNewFromTemplate('chord_chart')}
            className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group"
          >
            <div className="text-xs font-bold text-amber-400 group-hover:text-amber-300">Lead Sheet & Chord Only</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Dedicated harmonic chart for rhythm sections and band rehearsals.
            </p>
          </button>
        </div>
      </div>

      {/* Recently Edited Music Sheets */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200">Recently Edited Documents</h2>
          <span className="text-xs text-slate-500">Quick access to saved compositions</span>
        </div>

        {recentDocs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
            No music documents yet. Click "Create New Music Sheet" to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentDocs.map((item) => {
              const barCount = Object.keys(item.bars).length;
              const sectionNames = item.sections.map((s) => s.name).join(' · ');

              return (
                <div
                  key={item.id}
                  onClick={() => onOpenSheet(item.id)}
                  className="p-5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-1.5">
                    {/* Unboxed Metadata Header */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>1 = {item.metadata.notatedKey || 'C'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.metadata.timeSignature || '4/4'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.metadata.tempoBpm || 100} BPM</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Sections snippet */}
                    <p className="text-xs text-slate-400 truncate">
                      {sectionNames || 'Untitled Section'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-500">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>{barCount} bars</span>
                      <span>·</span>
                      <span>{item.sections.length} sections</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicateSheet(item);
                        }}
                        className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="Duplicate score"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportSheet(item);
                        }}
                        className="p-1 hover:text-slate-200 hover:bg-slate-800 rounded"
                        title="Export JSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <span className="p-1 text-sky-400 group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
