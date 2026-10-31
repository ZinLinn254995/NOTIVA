/**
 * NOTIVA — Manual Music Notation Studio
 * Core Music Editor Workspace
 * Orchestrates Bar Grid, Tracks, Row Editors, SVG Sheet Preview, Undo/Redo, Audio Playback & Validation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MusicDocument,
  MusicBar,
  MusicRow,
  MusicSection,
  MusicEvent,
  MusicTrack,
} from '../../types/music';
import { parseMelodyString, parseChordString, parseRhythmString } from '../../utils/notationParser';
import { validateMusicDocument } from '../../utils/validation';
import { audioEngine } from '../../utils/audioPlayer';
import { saveDocument } from '../../utils/storage';
import { SectionManager } from './SectionManager';
import { BarCard } from './BarCard';
import { MetadataModal } from './MetadataModal';
import { ValidationPanel } from './ValidationPanel';
import { EventDetailModal } from './EventDetailModal';
import { SheetPreview } from '../sheet/SheetPreview';
import {
  Save,
  Undo2,
  Redo2,
  Play,
  Square,
  Sliders,
  AlertCircle,
  Eye,
  Columns,
  Grid3X3,
  Plus,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface EditorWorkspaceProps {
  initialDocument: MusicDocument;
  onDocumentChange?: (doc: MusicDocument) => void;
  octaveStyle?: 'marks' | 'dots';
}

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({
  initialDocument,
  onDocumentChange,
  octaveStyle = 'marks',
}) => {
  // Document state
  const [doc, setDoc] = useState<MusicDocument>(initialDocument);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveStatusText, setSaveStatusText] = useState<string>('Saved');

  // History stack for Undo and Redo
  const [history, setHistory] = useState<MusicDocument[]>([]);
  const [redoStack, setRedoStack] = useState<MusicDocument[]>([]);

  // Selection & Navigation
  const [activeSectionId, setActiveSectionId] = useState<string>(
    initialDocument.sections[0]?.id || ''
  );
  const [activeBarId, setActiveBarId] = useState<string>(
    initialDocument.sections[0]?.barIds[0] || ''
  );
  const [activeEvent, setActiveEvent] = useState<MusicEvent | null>(null);

  // View Layout: 'split' | 'editor' | 'sheet'
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'sheet'>('split');

  // Modals & Drawers
  const [showMetadataModal, setShowMetadataModal] = useState<boolean>(false);
  const [showValidationPanel, setShowValidationPanel] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playingBarId, setPlayingBarId] = useState<string | undefined>(undefined);
  const [playingEventId, setPlayingEventId] = useState<string | undefined>(undefined);

  // Validation issues
  const validationIssues = validateMusicDocument(doc);

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<any>(null);

  // Push new state to history stack (max 50 states)
  const commitChange = useCallback((newDoc: MusicDocument) => {
    setHistory((prev) => [...prev.slice(-49), doc]);
    setRedoStack([]);
    setDoc(newDoc);
    setHasUnsavedChanges(true);
    setSaveStatusText('Unsaved changes');
    onDocumentChange?.(newDoc);
  }, [doc, onDocumentChange]);

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [doc, ...prev]);
    setDoc(previous);
    setHasUnsavedChanges(true);
    setSaveStatusText('Unsaved changes');
    onDocumentChange?.(previous);
  }, [history, doc, onDocumentChange]);

  // Redo
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack((prev) => prev.slice(1));
    setHistory((prev) => [...prev, doc]);
    setDoc(next);
    setHasUnsavedChanges(true);
    setSaveStatusText('Unsaved changes');
    onDocumentChange?.(next);
  }, [redoStack, doc, onDocumentChange]);

  // Keyboard shortcut listeners (Ctrl+Z / Ctrl+Y / Cmd+Z / Cmd+Shift+Z / Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
          e.preventDefault();
          handleManualSave();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, doc]);

  // Background Auto-Save debounced
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    if (hasUnsavedChanges) {
      autoSaveTimerRef.current = setTimeout(() => {
        saveDocument(doc);
        setHasUnsavedChanges(false);
        setSaveStatusText('All changes autosaved');
      }, 4000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [doc, hasUnsavedChanges]);

  // Manual save
  const handleManualSave = () => {
    saveDocument(doc);
    setHasUnsavedChanges(false);
    setSaveStatusText('All changes saved');
  };

  // Audio Playback
  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setPlayingBarId(undefined);
      setPlayingEventId(undefined);
    } else {
      setIsPlaying(true);
      audioEngine.playDocument(
        doc,
        (barId, eventId) => {
          setPlayingBarId(barId);
          setPlayingEventId(eventId);
        },
        () => {
          setIsPlaying(false);
          setPlayingBarId(undefined);
          setPlayingEventId(undefined);
        },
        activeBarId
      );
    }
  };

  // Section operations
  const handleSelectSection = (secId: string) => {
    setActiveSectionId(secId);
    const sec = doc.sections.find((s) => s.id === secId);
    if (sec && sec.barIds.length > 0) {
      setActiveBarId(sec.barIds[0]);
    }
  };

  const handleAddSection = (name: string) => {
    const newSecId = 'sec_' + Math.random().toString(36).substring(2, 9);
    const newBarId = 'bar_' + Math.random().toString(36).substring(2, 9);
    const totalBarsCount = Object.keys(doc.bars).length;

    const newBar: MusicBar = {
      id: newBarId,
      sectionId: newSecId,
      barNumber: totalBarsCount + 1,
      rowIds: [],
    };

    const newSection: MusicSection = {
      id: newSecId,
      name,
      barIds: [newBarId],
    };

    const updated: MusicDocument = {
      ...doc,
      sections: [...doc.sections, newSection],
      bars: {
        ...doc.bars,
        [newBarId]: newBar,
      },
      updatedAt: new Date().toISOString(),
    };

    commitChange(updated);
    setActiveSectionId(newSecId);
    setActiveBarId(newBarId);
  };

  const handleRenameSection = (secId: string, newName: string) => {
    const updatedSections = doc.sections.map((s) =>
      s.id === secId ? { ...s, name: newName } : s
    );
    commitChange({
      ...doc,
      sections: updatedSections,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSection = (secId: string) => {
    if (doc.sections.length <= 1) return; // Keep at least one section
    const secToDelete = doc.sections.find((s) => s.id === secId);
    if (!secToDelete) return;

    const newBars = { ...doc.bars };
    const newRows = { ...doc.rows };

    secToDelete.barIds.forEach((bId) => {
      const b = newBars[bId];
      if (b) {
        b.rowIds.forEach((rId) => delete newRows[rId]);
        delete newBars[bId];
      }
    });

    const newSections = doc.sections.filter((s) => s.id !== secId);
    // Renumber remaining bars sequentially
    let counter = 1;
    newSections.forEach((s) => {
      s.barIds.forEach((bId) => {
        if (newBars[bId]) newBars[bId].barNumber = counter++;
      });
    });

    commitChange({
      ...doc,
      sections: newSections,
      bars: newBars,
      rows: newRows,
      updatedAt: new Date().toISOString(),
    });

    setActiveSectionId(newSections[0].id);
  };

  const handleMoveSection = (secId: string, direction: 'left' | 'right') => {
    const idx = doc.sections.findIndex((s) => s.id === secId);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= doc.sections.length) return;

    const newSections = [...doc.sections];
    const [moved] = newSections.splice(idx, 1);
    newSections.splice(targetIdx, 0, moved);

    // Renumber bars
    const newBars = { ...doc.bars };
    let counter = 1;
    newSections.forEach((s) => {
      s.barIds.forEach((bId) => {
        if (newBars[bId]) newBars[bId].barNumber = counter++;
      });
    });

    commitChange({
      ...doc,
      sections: newSections,
      bars: newBars,
      updatedAt: new Date().toISOString(),
    });
  };

  // Bar operations
  const handleUpdateBar = (updatedBar: MusicBar) => {
    commitChange({
      ...doc,
      bars: {
        ...doc.bars,
        [updatedBar.id]: updatedBar,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDuplicateBar = (barId: string) => {
    const sourceBar = doc.bars[barId];
    if (!sourceBar) return;

    const newBarId = 'bar_' + Math.random().toString(36).substring(2, 9);
    const newRowIds: string[] = [];
    const newRows = { ...doc.rows };

    sourceBar.rowIds.forEach((oldRId) => {
      const oldRow = doc.rows[oldRId];
      if (oldRow) {
        const newRId = 'row_' + Math.random().toString(36).substring(2, 9);
        newRowIds.push(newRId);
        newRows[newRId] = {
          ...oldRow,
          id: newRId,
          barId: newBarId,
          events: oldRow.events.map((evt) => ({
            ...evt,
            id: 'evt_' + Math.random().toString(36).substring(2, 9),
          })),
        };
      }
    });

    const newBar: MusicBar = {
      ...sourceBar,
      id: newBarId,
      rowIds: newRowIds,
    };

    // Insert new bar right after source in section
    const newSections = doc.sections.map((sec) => {
      if (sec.id === sourceBar.sectionId) {
        const idx = sec.barIds.indexOf(barId);
        const updatedBarIds = [...sec.barIds];
        updatedBarIds.splice(idx + 1, 0, newBarId);
        return { ...sec, barIds: updatedBarIds };
      }
      return sec;
    });

    // Renumber
    const newBars = { ...doc.bars, [newBarId]: newBar };
    let counter = 1;
    newSections.forEach((s) => {
      s.barIds.forEach((bId) => {
        if (newBars[bId]) newBars[bId].barNumber = counter++;
      });
    });

    commitChange({
      ...doc,
      sections: newSections,
      bars: newBars,
      rows: newRows,
      updatedAt: new Date().toISOString(),
    });
    setActiveBarId(newBarId);
  };

  const handleAddBarAfter = (barId: string) => {
    const sourceBar = doc.bars[barId];
    if (!sourceBar) return;

    const newBarId = 'bar_' + Math.random().toString(36).substring(2, 9);
    const newBar: MusicBar = {
      id: newBarId,
      sectionId: sourceBar.sectionId,
      barNumber: sourceBar.barNumber + 1,
      rowIds: [],
    };

    const newSections = doc.sections.map((sec) => {
      if (sec.id === sourceBar.sectionId) {
        const idx = sec.barIds.indexOf(barId);
        const updatedBarIds = [...sec.barIds];
        updatedBarIds.splice(idx + 1, 0, newBarId);
        return { ...sec, barIds: updatedBarIds };
      }
      return sec;
    });

    const newBars = { ...doc.bars, [newBarId]: newBar };
    let counter = 1;
    newSections.forEach((s) => {
      s.barIds.forEach((bId) => {
        if (newBars[bId]) newBars[bId].barNumber = counter++;
      });
    });

    commitChange({
      ...doc,
      sections: newSections,
      bars: newBars,
      updatedAt: new Date().toISOString(),
    });
    setActiveBarId(newBarId);
  };

  const handleDeleteBar = (barId: string) => {
    const barToDelete = doc.bars[barId];
    if (!barToDelete) return;

    // Check if it's the only bar in the entire piece
    const totalBars = Object.keys(doc.bars).length;
    if (totalBars <= 1) return;

    const newBars = { ...doc.bars };
    const newRows = { ...doc.rows };

    barToDelete.rowIds.forEach((rId) => delete newRows[rId]);
    delete newBars[barId];

    const newSections = doc.sections.map((sec) => ({
      ...sec,
      barIds: sec.barIds.filter((id) => id !== barId),
    }));

    // Renumber
    let counter = 1;
    newSections.forEach((s) => {
      s.barIds.forEach((bId) => {
        if (newBars[bId]) newBars[bId].barNumber = counter++;
      });
    });

    commitChange({
      ...doc,
      sections: newSections,
      bars: newBars,
      rows: newRows,
      updatedAt: new Date().toISOString(),
    });
  };

  // Row operations
  const handleUpdateRow = (updatedRow: MusicRow) => {
    commitChange({
      ...doc,
      rows: {
        ...doc.rows,
        [updatedRow.id]: updatedRow,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddRow = (barId: string, trackId: string, type: 'melody' | 'chord' | 'rhythm') => {
    const newRowId = 'row_' + Math.random().toString(36).substring(2, 9);
    const initialInput = type === 'chord' ? 'C' : type === 'melody' ? '1 2 3 5' : 'B x H x';
    const initialEvents =
      type === 'chord'
        ? parseChordString(initialInput)
        : type === 'melody'
        ? parseMelodyString(initialInput)
        : parseRhythmString(initialInput);

    const newRow: MusicRow = {
      id: newRowId,
      barId,
      trackId,
      type,
      rawInput: initialInput,
      events: initialEvents,
      chordLayout: type === 'chord' ? 'single' : undefined,
    };

    const targetBar = doc.bars[barId];
    if (!targetBar) return;

    commitChange({
      ...doc,
      bars: {
        ...doc.bars,
        [barId]: {
          ...targetBar,
          rowIds: [...targetBar.rowIds, newRowId],
        },
      },
      rows: {
        ...doc.rows,
        [newRowId]: newRow,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteRow = (rowId: string) => {
    const targetRow = doc.rows[rowId];
    if (!targetRow) return;

    const bar = doc.bars[targetRow.barId];
    const newRows = { ...doc.rows };
    delete newRows[rowId];

    const updatedBars = bar
      ? {
          ...doc.bars,
          [bar.id]: {
            ...bar,
            rowIds: bar.rowIds.filter((id) => id !== rowId),
          },
        }
      : doc.bars;

    commitChange({
      ...doc,
      bars: updatedBars,
      rows: newRows,
      updatedAt: new Date().toISOString(),
    });
  };

  // Event inspector
  const handleSaveEvent = (updatedEvt: MusicEvent) => {
    // Find row containing event
    const newRows = { ...doc.rows };
    let found = false;

    for (const rId of Object.keys(newRows)) {
      const row = newRows[rId];
      const evtIdx = row.events.findIndex((e) => e.id === updatedEvt.id);
      if (evtIdx !== -1) {
        const newEvents = [...row.events];
        newEvents[evtIdx] = updatedEvt;
        newRows[rId] = {
          ...row,
          events: newEvents,
        };
        found = true;
        break;
      }
    }

    if (found) {
      commitChange({
        ...doc,
        rows: newRows,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Current active section's bars
  const activeSection = doc.sections.find((s) => s.id === activeSectionId) || doc.sections[0];
  const activeBarsInView = activeSection?.barIds.map((bId) => doc.bars[bId]).filter(Boolean) || [];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none overflow-hidden">
      {/* Top Studio Control Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0 gap-4">
        {/* Left: Title & Save Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMetadataModal(true)}
            className="group flex items-center gap-2 hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors text-left"
            title="Click to edit song metadata"
          >
            <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                <span>{doc.title || 'Untitled Song'}</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({doc.metadata.timeSignature || '4/4'} · 1 = {doc.metadata.notatedKey || 'C'})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasUnsavedChanges ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span>{saveStatusText}</span>
              </div>
            </div>
          </button>

          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              hasUnsavedChanges
                ? 'bg-sky-600 hover:bg-sky-500 text-white border-sky-500 shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Save changes (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        {/* Center: Audio Transport & Tempo */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
            title={isPlaying ? 'Stop playback' : 'Play notation from active bar'}
          >
            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Stop' : 'Audition'}</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Tempo BPM */}
          <div className="flex items-center gap-1 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min="30"
              max="300"
              value={doc.metadata.tempoBpm || 100}
              onChange={(e) => {
                const bpm = parseInt(e.target.value, 10) || 100;
                commitChange({
                  ...doc,
                  metadata: { ...doc.metadata, tempoBpm: bpm },
                  updatedAt: new Date().toISOString(),
                });
              }}
              className="w-12 px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-xs text-white focus:outline-none focus:border-sky-500 tabular-nums font-bold"
            />
            <span className="text-slate-500 text-[10px]">BPM</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* Undo & Redo */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                history.length === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-1.5 rounded hover:bg-slate-800 transition-colors ${
                redoStack.length === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Validation & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Validation Drawer Toggle */}
          <button
            onClick={() => setShowValidationPanel(!showValidationPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              validationIssues.length > 0
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-600/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Open Validation Issues Panel"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Validation</span>
            {validationIssues.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-600 text-white font-mono font-bold">
                {validationIssues.length}
              </span>
            )}
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid Editor Only"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View (Editor + Live Sheet)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('sheet')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'sheet'
                  ? 'bg-slate-800 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Music Sheet Preview Only"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Manager Nav Ribbon */}
      <SectionManager
        sections={doc.sections}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        onAddSection={handleAddSection}
        onRenameSection={handleRenameSection}
        onDeleteSection={handleDeleteSection}
        onMoveSection={handleMoveSection}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Grid Column */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div
            className={`flex-1 flex flex-col overflow-y-auto p-5 space-y-4 ${
              viewMode === 'split' ? 'max-w-[55%] border-r border-slate-800' : 'w-full'
            }`}
          >
            {/* Section Banner */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  {activeSection?.name}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-400">
                  {activeBarsInView.length} measure{activeBarsInView.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Add Bar Button */}
              <button
                onClick={() => {
                  const lastBarId = activeSection.barIds[activeSection.barIds.length - 1];
                  if (lastBarId) handleAddBarAfter(lastBarId);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Measure</span>
              </button>
            </div>

            {/* List of Bars in Active Section */}
            <div className="space-y-4">
              {activeBarsInView.map((bar) => (
                <BarCard
                  key={bar.id}
                  bar={bar}
                  rows={doc.rows}
                  tracks={doc.tracks}
                  symbolLegend={doc.symbolLegend}
                  isActive={activeBarId === bar.id || playingBarId === bar.id}
                  activeEventId={playingEventId}
                  onSelectBar={(bId) => setActiveBarId(bId)}
                  onUpdateBar={handleUpdateBar}
                  onUpdateRow={handleUpdateRow}
                  onAddRow={handleAddRow}
                  onDeleteRow={handleDeleteRow}
                  onDuplicateBar={handleDuplicateBar}
                  onDeleteBar={handleDeleteBar}
                  onAddBarAfter={handleAddBarAfter}
                  onSelectEvent={(evt) => setActiveEvent(evt)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SVG Sheet Preview Column */}
        {(viewMode === 'sheet' || viewMode === 'split') && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <SheetPreview
              document={doc}
              activeBarId={activeBarId || playingBarId}
              activeEventId={playingEventId}
              onSelectBar={(bId) => {
                setActiveBarId(bId);
                const targetBar = doc.bars[bId];
                if (targetBar) setActiveSectionId(targetBar.sectionId);
              }}
              octaveStyle={octaveStyle}
            />
          </div>
        )}
      </div>

      {/* Modals & Overlays */}
      {showMetadataModal && (
        <MetadataModal
          title={doc.title}
          metadata={doc.metadata}
          onClose={() => setShowMetadataModal(false)}
          onSave={(newTitle, newMetadata) => {
            commitChange({
              ...doc,
              title: newTitle,
              metadata: newMetadata,
              updatedAt: new Date().toISOString(),
            });
          }}
        />
      )}

      {/* Validation Panel */}
      <ValidationPanel
        issues={validationIssues}
        isOpen={showValidationPanel}
        onClose={() => setShowValidationPanel(false)}
        onSelectBar={(barId) => {
          setActiveBarId(barId);
          const bar = doc.bars[barId];
          if (bar) setActiveSectionId(bar.sectionId);
        }}
        onConfirmIssue={(issueId) => {
          // Keep issue non-destructive
          setShowValidationPanel(false);
        }}
        onDismissIssue={(issueId) => {
          // Handled via local dismissed state if needed
        }}
      />

      {/* Event Inspector Modal */}
      {activeEvent && (
        <EventDetailModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};
