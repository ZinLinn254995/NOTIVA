/**
 * NOTIVA — Manual Music Notation Studio
 * Section Manager Component
 * Handles creating, renaming, reordering, deleting, and jumping to song sections
 */

import React, { useState } from 'react';
import { MusicSection } from '../../types/music';
import { SECTION_SUGGESTIONS } from '../../utils/sampleData';
import {
  FolderTree,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  X,
  Layers,
} from 'lucide-react';

interface SectionManagerProps {
  sections: MusicSection[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
  onAddSection: (name: string) => void;
  onRenameSection: (sectionId: string, newName: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: 'left' | 'right') => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection,
  onMoveSection,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [customName, setCustomName] = useState('');
  const [editingSecId, setEditingSecId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (sec: MusicSection) => {
    setEditingSecId(sec.id);
    setEditingName(sec.name);
  };

  const handleSaveRename = (secId: string) => {
    if (editingName.trim()) {
      onRenameSection(secId, editingName.trim());
    }
    setEditingSecId(null);
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onAddSection(customName.trim());
      setCustomName('');
      setShowAddMenu(false);
    }
  };

  return (
    <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-4 overflow-x-auto shrink-0 select-none">
      {/* Sections Tab List */}
      <div className="flex items-center gap-1.5 min-w-max">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
          <Layers className="w-3.5 h-3.5" />
          Sections:
        </span>

        {sections.map((sec, index) => {
          const isActive = sec.id === activeSectionId;
          const isEditing = editingSecId === sec.id;

          return (
            <div
              key={sec.id}
              className={`group flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-sky-600/20 text-sky-200 border-sky-500 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                    className="w-24 px-1.5 py-0.5 bg-slate-950 border border-sky-500 rounded text-xs text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(sec.id)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingSecId(null)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectSection(sec.id)}
                  className="flex items-center gap-1.5 text-left font-semibold"
                >
                  <span>{sec.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({sec.barIds.length})</span>
                </button>
              )}

              {/* Hover actions: rename, reorder, delete */}
              {!isEditing && (
                <div className="hidden group-hover:flex items-center gap-0.5 ml-1 border-l border-slate-700/60 pl-1 text-slate-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartRename(sec);
                    }}
                    className="hover:text-sky-300 p-0.5"
                    title="Rename section"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(sec.id, 'left');
                      }}
                      className="hover:text-white p-0.5"
                      title="Move left"
                    >
                      <ChevronLeft className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {index < sections.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSection(sec.id, 'right');
                      }}
                      className="hover:text-white p-0.5"
                      title="Move right"
                    >
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  )}
                  {sections.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSection(sec.id);
                      }}
                      className="hover:text-rose-400 p-0.5"
                      title="Delete section"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Section Button & Popover */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 hover:border-sky-500/50 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Section</span>
        </button>

        {showAddMenu && (
          <div className="absolute right-0 top-10 z-30 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 space-y-2 text-xs">
            <div className="px-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Suggested Sections
            </div>
            <div className="grid grid-cols-2 gap-1">
              {SECTION_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  onClick={() => {
                    onAddSection(sug);
                    setShowAddMenu(false);
                  }}
                  className="text-left px-2 py-1.5 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-200 transition-colors truncate font-medium"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Custom section name input */}
            <form onSubmit={handleCreateCustom} className="pt-2 border-t border-slate-800 flex gap-1">
              <input
                type="text"
                placeholder="Custom name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-200 text-xs focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium"
              >
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
