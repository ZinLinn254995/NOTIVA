/**
 * NOTIVA — Manual Music Notation Studio
 * Instrument & Rhythm Symbol Library View
 * Configures instrument presets, symbol legends, reusable rhythm patterns, and arrangement modes
 */

import React, { useState } from 'react';
import { MusicDocument, SymbolDefinition, RhythmPattern } from '../../types/music';
import { INSTRUMENT_PRESETS } from '../../utils/sampleData';
import {
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Tag,
  Radio,
  Drum,
  Save,
  Check,
  Sparkles,
} from 'lucide-react';

interface InstrumentLibraryViewProps {
  document: MusicDocument;
  onUpdateDocument: (updated: MusicDocument) => void;
}

export const InstrumentLibraryView: React.FC<InstrumentLibraryViewProps> = ({
  document: doc,
  onUpdateDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'symbols' | 'patterns' | 'instruments'>('symbols');

  // Symbol legend editing states
  const [legend, setLegend] = useState<Record<string, SymbolDefinition>>(doc.symbolLegend);
  const [newGlyph, setNewGlyph] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [legendSavedMessage, setLegendSavedMessage] = useState(false);

  // Pattern states
  const [patterns, setPatterns] = useState<RhythmPattern[]>(doc.rhythmPatterns || []);
  const [newPatName, setNewPatName] = useState('');
  const [newPatNotation, setNewPatNotation] = useState('');

  // Custom instruments
  const [customInsts, setCustomInsts] = useState(doc.customInstruments || []);
  const [newInstName, setNewInstName] = useState('');
  const [newInstAlias, setNewInstAlias] = useState('');

  // Arrangement mode
  const [arrangementMode, setArrangementMode] = useState(doc.arrangementMode || 'ALL');

  // Add symbol to legend
  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGlyph.trim() || !newLabel.trim()) return;

    const glyphKey = newGlyph.trim();
    const updatedLegend = {
      ...legend,
      [glyphKey]: {
        label: newLabel.trim(),
        description: newDesc.trim() || 'Custom rhythm symbol',
      },
    };

    setLegend(updatedLegend);
    const updatedDoc: MusicDocument = {
      ...doc,
      symbolLegend: updatedLegend,
      updatedAt: new Date().toISOString(),
    };
    onUpdateDocument(updatedDoc);

    setNewGlyph('');
    setNewLabel('');
    setNewDesc('');
  };

  const handleDeleteSymbol = (glyph: string) => {
    const updatedLegend = { ...legend };
    delete updatedLegend[glyph];
    setLegend(updatedLegend);
    onUpdateDocument({
      ...doc,
      symbolLegend: updatedLegend,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSaveLegend = () => {
    onUpdateDocument({
      ...doc,
      symbolLegend: legend,
      updatedAt: new Date().toISOString(),
    });
    setLegendSavedMessage(true);
    setTimeout(() => setLegendSavedMessage(false), 2500);
  };

  // Add Pattern
  const handleAddPattern = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim() || !newPatNotation.trim()) return;

    const newPat: RhythmPattern = {
      id: 'pat_' + Math.random().toString(36).substring(2, 9),
      name: newPatName.trim(),
      rawNotation: newPatNotation.trim(),
      symbolLegend: Object.fromEntries(Object.entries(legend).map(([k, v]) => [k, v.label])),
      gridDefinition: 'Custom',
    };

    const updated = [...patterns, newPat];
    setPatterns(updated);
    onUpdateDocument({
      ...doc,
      rhythmPatterns: updated,
      updatedAt: new Date().toISOString(),
    });

    setNewPatName('');
    setNewPatNotation('');
  };

  const handleDeletePattern = (patId: string) => {
    const updated = patterns.filter((p) => p.id !== patId);
    setPatterns(updated);
    onUpdateDocument({
      ...doc,
      rhythmPatterns: updated,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Custom Instrument
  const handleAddCustomInstrument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim()) return;

    const newInst = {
      id: 'inst_' + Math.random().toString(36).substring(2, 9),
      name: newInstName.trim(),
      alias: newInstAlias.trim() || newInstName.trim(),
    };

    const updated = [...customInsts, newInst];
    setCustomInsts(updated);
    onUpdateDocument({
      ...doc,
      customInstruments: updated,
      updatedAt: new Date().toISOString(),
    });

    setNewInstName('');
    setNewInstAlias('');
  };

  const handleUpdateArrangement = (mode: any) => {
    setArrangementMode(mode);
    onUpdateDocument({
      ...doc,
      arrangementMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex-1 min-w-0 overflow-y-auto bg-slate-950 px-4 py-5 sm:p-6 lg:p-8 space-y-5 lg:space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Instrument & Symbol Library</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Configure custom rhythm glyph legends, reusable pattern libraries, and instrument labels
          </p>
        </div>

        {/* Global Arrangement Mode Selector */}
        <div className="flex max-w-full flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          <span className="text-slate-400 font-semibold px-2">Arrangement:</span>
          {(['ALL', 'Only Rhythm', 'Drum Only', 'Custom Arrangement'] as const).map((m) => (
            <button
              key={m}
              onClick={() => handleUpdateArrangement(m)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                arrangementMode === m
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('symbols')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'symbols'
              ? 'bg-slate-900 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Drum className="w-3.5 h-3.5" />
          <span>Rhythm Symbol Legend</span>
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'patterns'
              ? 'bg-slate-900 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Reusable Rhythm Patterns</span>
        </button>
        <button
          onClick={() => setActiveTab('instruments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'instruments'
              ? 'bg-slate-900 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Supported Instruments & Labels</span>
        </button>
      </div>

      {/* TAB 1: RHYTHM SYMBOL LEGEND */}
      {activeTab === 'symbols' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">User-Configurable Symbol Legend</h2>
              <p className="text-xs text-slate-500">
                Different handwritten sheets use symbols differently. Assign definitions while preserving raw glyphs.
              </p>
            </div>

            {legendSavedMessage && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                Legend saved
              </span>
            )}
          </div>

          {/* Add New Symbol Form */}
          <form
            onSubmit={handleAddSymbol}
            className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Glyph (e.g. B, x, H, +, 8)</label>
              <input
                type="text"
                maxLength={4}
                value={newGlyph}
                onChange={(e) => setNewGlyph(e.target.value)}
                placeholder="Glyph"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Technique / Sound</label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Snare Rimshot"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description / Notes</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Side stick on rim"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Symbol</span>
              </button>
            </div>
          </form>

          {/* Table of active legend symbols */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 w-24">Glyph</th>
                  <th className="px-5 py-3 w-64">Meaning / Technique</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3 text-right w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {Object.entries(legend).map(([glyph, def]) => (
                  <tr key={glyph} className="hover:bg-slate-900/60 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-base text-emerald-400">
                      {glyph}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-200">{def.label}</td>
                    <td className="px-5 py-3.5 text-slate-400">{def.description}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteSymbol(glyph)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Delete from legend"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REUSABLE RHYTHM PATTERNS */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Rhythm Pattern Library</h2>
              <p className="text-xs text-slate-500">
                Create and reuse rhythmic building blocks across multiple bars and documents.
              </p>
            </div>
          </div>

          {/* Add Pattern Form */}
          <form
            onSubmit={handleAddPattern}
            className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Pattern Name</label>
              <input
                type="text"
                value={newPatName}
                onChange={(e) => setNewPatName(e.target.value)}
                placeholder="e.g. 16th Funk Beat"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Raw Notation Tokens</label>
              <input
                type="text"
                value={newPatNotation}
                onChange={(e) => setNewPatNotation(e.target.value)}
                placeholder="e.g. B . x B x H x"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Pattern</span>
              </button>
            </div>
          </form>

          {/* Patterns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pat) => (
              <div
                key={pat.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-xs font-bold text-slate-200">{pat.name}</h3>
                  <button
                    onClick={() => handleDeletePattern(pat.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-sm text-emerald-400 font-bold tracking-wider">
                  {pat.rawNotation}
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Grid: {pat.gridDefinition || 'Standard'}</span>
                  <span className="font-mono text-slate-400">
                    {pat.rawNotation.split(' ').length} beats
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORTED INSTRUMENTS & LABELS */}
      {activeTab === 'instruments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Supported Instrument Presets & Custom Labels</h2>
              <p className="text-xs text-slate-500">
                Preserves original handwritten instrument aliases and cues (Enter, Exit, Solo, Fill).
              </p>
            </div>
          </div>

          {/* Add custom instrument form */}
          <form
            onSubmit={handleAddCustomInstrument}
            className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Instrument Name</label>
              <input
                type="text"
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                placeholder="e.g. Burmese Saung Harp"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Score Alias / Abbreviation</label>
              <input
                type="text"
                value={newInstAlias}
                onChange={(e) => setNewInstAlias(e.target.value)}
                placeholder="e.g. Saung"
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Instrument</span>
              </button>
            </div>
          </form>

          {/* Standard Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INSTRUMENT_PRESETS.map((inst) => (
              <div
                key={inst.name}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{inst.name}</div>
                  <div className="text-[11px] text-slate-400">{inst.role}</div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {inst.alias}
                </span>
              </div>
            ))}

            {customInsts.map((inst) => (
              <div
                key={inst.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-sky-500/30 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-sky-300">{inst.name}</div>
                  <div className="text-[11px] text-slate-400">Custom Instrument</div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {inst.alias}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
