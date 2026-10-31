/**
 * NOTIVA — Manual Music Notation Studio
 * Metadata Modal Component
 * Edits Song Metadata: Title, Keys, Key Modifier (raw), Tempo, Time Sig, Genre, Noted By, Date, Notes
 */

import React, { useState } from 'react';
import { DocumentMetadata } from '../../types/music';
import { X, FileText, Music, Clock, User, Calendar, ShieldCheck } from 'lucide-react';

interface MetadataModalProps {
  metadata: DocumentMetadata;
  title: string;
  onClose: () => void;
  onSave: (newTitle: string, newMetadata: DocumentMetadata) => void;
}

export const MetadataModal: React.FC<MetadataModalProps> = ({
  metadata,
  title,
  onClose,
  onSave,
}) => {
  const [songTitle, setSongTitle] = useState(title || metadata.songTitle || '');
  const [originalKey, setOriginalKey] = useState(metadata.originalKey || '');
  const [notatedKey, setNotatedKey] = useState(metadata.notatedKey || '');
  const [soundingKey, setSoundingKey] = useState(metadata.soundingKey || '');
  const [keyModifier, setKeyModifier] = useState(metadata.keyModifier || '');
  const [tempoBpm, setTempoBpm] = useState<number>(metadata.tempoBpm || 100);
  const [beatUnit, setBeatUnit] = useState<number>(metadata.beatUnit || 4);
  const [timeSignature, setTimeSignature] = useState(metadata.timeSignature || '4/4');
  const [styleGenre, setStyleGenre] = useState(metadata.styleGenre || '');
  const [notedBy, setNotedBy] = useState(metadata.notedBy || '');
  const [date, setDate] = useState(metadata.date || '');
  const [notes, setNotes] = useState(metadata.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(songTitle, {
      ...metadata,
      songTitle,
      originalKey,
      notatedKey,
      soundingKey,
      keyModifier, // raw preserved
      tempoBpm: Number(tempoBpm),
      beatUnit: Number(beatUnit),
      timeSignature,
      styleGenre,
      notedBy,
      date,
      notes,
    });
    onClose();
  };

  const KEY_OPTIONS = ['', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Song Details & Notation Metadata</h2>
              <p className="text-xs text-slate-400">Configure key signatures, tempo, tuning, and score provenance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Song Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Song Title
            </label>
            <input
              type="text"
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              placeholder="e.g. Dawn Over Mandalay (သံလွင်မနက်ခင်း)"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Key signatures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Original Key</label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                {KEY_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k || '— Unspecified —'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Notated Key (1 = ?)</label>
              <select
                value={notatedKey}
                onChange={(e) => setNotatedKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                {KEY_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k || '— Unspecified —'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Sounding Key (Concert)</label>
              <select
                value={soundingKey}
                onChange={(e) => setSoundingKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              >
                {KEY_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k || '— Unspecified —'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Modifier Raw Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Key Modifier (Raw Text preserved)
            </label>
            <input
              type="text"
              value={keyModifier}
              onChange={(e) => setKeyModifier(e.target.value)}
              placeholder="e.g. Capo 2, Drop D, A=432Hz, Flat 5 tuning, etc."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Stores arbitrary tuning instructions exactly as handwritten on score sheets without forced standardization.
            </p>
          </div>

          {/* Timing Grid: Tempo, Time Sig, Beat Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tempo (BPM)</label>
              <input
                type="number"
                min="30"
                max="320"
                value={tempoBpm}
                onChange={(e) => setTempoBpm(parseInt(e.target.value, 10) || 100)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Time Signature</label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value="4/4">4/4 (Common)</option>
                <option value="3/4">3/4 (Waltz)</option>
                <option value="6/8">6/8 (Compound)</option>
                <option value="2/4">2/4 (March)</option>
                <option value="2/2">2/2 (Cut Time)</option>
                <option value="5/4">5/4 (Complex)</option>
                <option value="7/8">7/8 (Complex)</option>
                <option value="12/8">12/8 (Blues)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Beat Unit</label>
              <select
                value={beatUnit}
                onChange={(e) => setBeatUnit(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500 font-mono"
              >
                <option value={4}>4 (Quarter note ♩)</option>
                <option value={8}>8 (Eighth note ♪)</option>
                <option value={2}>2 (Half note 𝅗𝅥)</option>
              </select>
            </div>
          </div>

          {/* Style, Noted By, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Style / Genre</label>
              <input
                type="text"
                value={styleGenre}
                onChange={(e) => setStyleGenre(e.target.value)}
                placeholder="e.g. Ballad, Folk, Jazz, Pop"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Noted By / Transcriber</label>
              <input
                type="text"
                value={notedBy}
                onChange={(e) => setNotedBy(e.target.value)}
                placeholder="e.g. Arranger or Composer"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Performance Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Performance & Archival Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record modal nuances, instrument instructions, rehearsal marks, or source references..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Provenance preserved with timestamp
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm"
              >
                Apply Metadata
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
