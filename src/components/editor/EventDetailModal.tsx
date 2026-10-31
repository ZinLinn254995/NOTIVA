/**
 * NOTIVA — Manual Music Notation Studio
 * Event Detail & Provenance Inspector Modal
 * Allows inspection and precise manual adjustment of note/chord/rhythm tokens and provenance records
 */

import React, { useState } from 'react';
import { MusicEvent, EventKind, ConfidenceLevel, VerificationStatus } from '../../types/music';
import { X, Sparkles, Clock, ShieldCheck, Tag, Info } from 'lucide-react';

interface EventDetailModalProps {
  event: MusicEvent;
  onClose: () => void;
  onSave: (updatedEvent: MusicEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onSave,
}) => {
  const [kind, setKind] = useState<EventKind>(event.kind);
  const [value, setValue] = useState(event.value);
  const [octave, setOctave] = useState<number>(event.octave ?? 0);
  const [durationModifier, setDurationModifier] = useState<string>(event.durationModifier || '');
  const [isDotted, setIsDotted] = useState<boolean>(!!event.isDotted);
  const [isUnderlined, setIsUnderlined] = useState<boolean>(!!event.isUnderlined);
  const [isDoubleUnderlined, setIsDoubleUnderlined] = useState<boolean>(!!event.isDoubleUnderlined);
  const [rawText, setRawText] = useState(event.rawText || '');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(event.provenance?.confidence || 'high');
  const [status, setStatus] = useState<VerificationStatus>(event.provenance?.status || 'unconfirmed');
  const [provenanceNote, setProvenanceNote] = useState(event.provenance?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let computedUnderline = isUnderlined;
    let computedDoubleUnderline = isDoubleUnderlined;

    if (durationModifier === '/') {
      computedUnderline = true;
      computedDoubleUnderline = false;
    } else if (durationModifier === '//') {
      computedUnderline = false;
      computedDoubleUnderline = true;
    }

    const updated: MusicEvent = {
      ...event,
      kind,
      value,
      octave,
      octaveRaw: octave > 0 ? "'".repeat(octave) : octave < 0 ? ','.repeat(Math.abs(octave)) : undefined,
      durationModifier: durationModifier || undefined,
      isDotted,
      isUnderlined: computedUnderline,
      isDoubleUnderlined: computedDoubleUnderline,
      rawText,
      provenance: {
        ...event.provenance,
        rawText,
        confidence,
        status,
        userEdit: true,
        confirmedAt: new Date().toISOString(),
        notes: provenanceNote,
      },
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-slate-100">Notation Event & Provenance</h3>
            <span className="font-mono text-xs text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {event.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Raw Text and Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Raw Original Text</label>
              <input
                type="text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Parsed Glyph / Value</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>
          </div>

          {/* Event Kind */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Event Category</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(['note', 'rest', 'sustain', 'ambiguous', 'group'] as EventKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`px-2 py-1.5 rounded text-[11px] font-medium border text-center transition-colors capitalize ${
                    kind === k
                      ? 'bg-sky-600 text-white border-sky-500 font-semibold'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Octave & Duration for Melody Notes */}
          {kind === 'note' && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Octave Shift</label>
                <div className="flex items-center gap-1">
                  {[-2, -1, 0, 1, 2].map((oct) => (
                    <button
                      key={oct}
                      type="button"
                      onClick={() => setOctave(oct)}
                      className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                        octave === oct
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {oct === 0 ? '0' : oct > 0 ? `+${oct}` : oct}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Duration Slash</label>
                <div className="flex items-center gap-1">
                  {[
                    { label: 'Quarter', val: '' },
                    { label: '8th (/)', val: '/' },
                    { label: '16th (//)', val: '//' },
                  ].map((d) => (
                    <button
                      key={d.val}
                      type="button"
                      onClick={() => {
                        setDurationModifier(d.val);
                        if (d.val === '/') {
                          setIsUnderlined(true);
                          setIsDoubleUnderlined(false);
                        } else if (d.val === '//') {
                          setIsUnderlined(false);
                          setIsDoubleUnderlined(true);
                        } else {
                          setIsUnderlined(false);
                          setIsDoubleUnderlined(false);
                        }
                      }}
                      className={`flex-1 py-1 rounded text-xs font-mono font-medium border transition-colors ${
                        durationModifier === d.val
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {d.val || '♩ 1'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Provenance Record */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Provenance & Interpretation Record</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-400 mb-0.5">Confidence Level</label>
                <select
                  value={confidence || 'high'}
                  onChange={(e) => setConfidence(e.target.value as ConfidenceLevel)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none"
                >
                  <option value="high">High (Certain)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low (Uncertain)</option>
                  <option value="assumed">Assumed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-0.5">Review Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VerificationStatus)}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none"
                >
                  <option value="unconfirmed">Unconfirmed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-0.5">Transcriber Note</label>
              <input
                type="text"
                value={provenanceNote}
                onChange={(e) => setProvenanceNote(e.target.value)}
                placeholder="e.g. Unclear handwritten comma vs dot; verified with audio sample."
                className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg font-medium bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
