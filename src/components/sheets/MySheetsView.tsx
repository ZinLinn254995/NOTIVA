/**
 * NOTIVA — Manual Music Notation Studio
 * My Music Sheets View
 * Search, filter, rename, duplicate, delete (with confirmation), import & export music documents
 */

import React, { useState, useMemo, useRef } from 'react';
import { MusicDocument } from '../../types/music';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Search,
  Plus,
  Upload,
  Download,
  Copy,
  Trash2,
  Edit3,
  FileMusic,
  ArrowUpRight,
  Filter,
  Check,
  X,
} from 'lucide-react';

interface MySheetsViewProps {
  documents: MusicDocument[];
  onOpenSheet: (docId: string) => void;
  onNewSheet: () => void;
  onDuplicateSheet: (doc: MusicDocument) => void;
  onDeleteSheet: (docId: string) => void;
  onRenameSheet: (docId: string, newTitle: string) => void;
  onImportSheet: (jsonString: string) => void;
  onExportSheet: (doc: MusicDocument) => void;
}

export const MySheetsView: React.FC<MySheetsViewProps> = ({
  documents,
  onOpenSheet,
  onNewSheet,
  onDuplicateSheet,
  onDeleteSheet,
  onRenameSheet,
  onImportSheet,
  onExportSheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyFilter, setSelectedKeyFilter] = useState('ALL');
  const [docToDelete, setDocToDelete] = useState<MusicDocument | null>(null);

  // Inline rename state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.metadata.styleGenre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.metadata.notedBy.toLowerCase().includes(searchQuery.toLowerCase());

      const docKey = doc.metadata.notatedKey || doc.metadata.originalKey || 'C';
      const matchesKey = selectedKeyFilter === 'ALL' || docKey === selectedKeyFilter;

      return matchesSearch && matchesKey;
    });
  }, [documents, searchQuery, selectedKeyFilter]);

  // Unique keys available in docs
  const availableKeys = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      const k = d.metadata.notatedKey || d.metadata.originalKey;
      if (k) set.add(k);
    });
    return Array.from(set).sort();
  }, [documents]);

  const handleStartRename = (doc: MusicDocument) => {
    setEditingDocId(doc.id);
    setEditingTitle(doc.title);
  };

  const handleSaveRename = (docId: string) => {
    if (editingTitle.trim()) {
      onRenameSheet(docId, editingTitle.trim());
    }
    setEditingDocId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportSheet(text);
      } catch (err: any) {
        alert('Could not import JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Music Sheets</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage, organize, and export your personal score collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <button
            onClick={onNewSheet}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Music Sheet</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, genre, or composer..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Key Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter Key:
          </span>
          <select
            value={selectedKeyFilter}
            onChange={(e) => setSelectedKeyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Keys</option>
            {availableKeys.map((k) => (
              <option key={k} value={k}>
                1 = {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800 space-y-3">
          <FileMusic className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No music sheets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No compositions match your search query or key filter.'
              : 'Create your first piece using the button above.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const barCount = Object.keys(doc.bars).length;
            const isEditing = editingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header & Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center gap-2">
                      <span>1 = {doc.metadata.notatedKey || 'C'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.metadata.timeSignature || '4/4'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doc.metadata.tempoBpm || 100} BPM</span>
                    </div>

                    <span>{doc.metadata.styleGenre || 'Piece'}</span>
                  </div>

                  {/* Inline Rename Form or Display */}
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-slate-950 border border-sky-500 rounded text-sm text-white focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(doc.id)}
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingDocId(null)}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="text-base font-bold text-slate-100 flex items-center justify-between group">
                      <span className="truncate">{doc.title}</span>
                      <button
                        onClick={() => handleStartRename(doc)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 p-1 transition-opacity"
                        title="Rename title"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </h3>
                  )}

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {doc.sections.map((s) => s.name).join(' · ')}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    {barCount} bars · {doc.sections.length} sections
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateSheet(doc)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Duplicate music sheet"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onExportSheet(doc)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Export JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete piece"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenSheet(doc.id)}
                      className="ml-1 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Open</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <ConfirmationModal
          isOpen={!!docToDelete}
          title="Delete Music Sheet?"
          message={`Are you sure you want to permanently delete "${docToDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete Sheet"
          isDestructive={true}
          onConfirm={() => {
            onDeleteSheet(docToDelete.id);
            setDocToDelete(null);
          }}
          onCancel={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
};
