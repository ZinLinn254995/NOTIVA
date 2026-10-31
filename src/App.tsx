/**
 * NOTIVA — Manual Music Notation Studio
 * Main Application Entry Point
 * Manages views: Dashboard, My Music Sheets, Music Editor, Instrument Library, Settings
 */

import React, { useState, useEffect } from 'react';
import { MusicDocument } from './types/music';
import {
  loadAllDocuments,
  saveAllDocuments,
  getActiveDocumentId,
  setActiveDocumentId,
  saveDocument,
  duplicateDocument,
  deleteDocument,
  exportDocumentToJson,
  importDocumentFromJson,
  loadSettings,
  saveSettings,
  AppSettings,
} from './utils/storage';
import { createNewDocument, createShowcaseDocument } from './utils/sampleData';
import { TopBar, NavTab } from './components/navigation/TopBar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MySheetsView } from './components/sheets/MySheetsView';
import { EditorWorkspace } from './components/editor/EditorWorkspace';
import { InstrumentLibraryView } from './components/library/InstrumentLibraryView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [documents, setDocuments] = useState<MusicDocument[]>([]);
  const [activeDocId, setActiveDocIdState] = useState<string>('');
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // Initialize storage and documents on mount
  useEffect(() => {
    const loadedDocs = loadAllDocuments();
    setDocuments(loadedDocs);

    const initialActiveId = getActiveDocumentId();
    if (loadedDocs.some((d) => d.id === initialActiveId)) {
      setActiveDocIdState(initialActiveId);
    } else if (loadedDocs.length > 0) {
      setActiveDocIdState(loadedDocs[0].id);
      setActiveDocumentId(loadedDocs[0].id);
    }

    // Apply dark class to html
    if (settings.theme === 'dark') {
      window.document.documentElement.classList.add('dark');
    } else {
      window.document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
  };

  const handleOpenSheet = (docId: string) => {
    setActiveDocIdState(docId);
    setActiveDocumentId(docId);
    setActiveTab('editor');
  };

  const handleNewSheet = () => {
    const count = documents.length + 1;
    const newDoc = createNewDocument(`Song Composition ${count}`, '4/4', 100);
    saveDocument(newDoc);
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    setActiveDocIdState(newDoc.id);
    setActiveDocumentId(newDoc.id);
    setActiveTab('editor');
  };

  const handleNewFromTemplate = (type: 'standard' | 'ballad' | 'compound' | 'chord_chart') => {
    let title = 'New Pop Song';
    let timeSig = '4/4';
    let tempo = 110;

    if (type === 'ballad') {
      title = 'Acoustic Ballad in 3/4';
      timeSig = '3/4';
      tempo = 84;
    } else if (type === 'compound') {
      title = 'Compound Folk in 6/8';
      timeSig = '6/8';
      tempo = 68;
    } else if (type === 'chord_chart') {
      title = 'Rehearsal Chord Chart';
      timeSig = '4/4';
      tempo = 100;
    }

    const newDoc = createNewDocument(title, timeSig, tempo);
    saveDocument(newDoc);
    setDocuments([newDoc, ...documents]);
    setActiveDocIdState(newDoc.id);
    setActiveDocumentId(newDoc.id);
    setActiveTab('editor');
  };

  const handleDuplicateSheet = (doc: MusicDocument) => {
    const copy = duplicateDocument(doc);
    setDocuments([copy, ...documents]);
  };

  const handleDeleteSheet = (docId: string) => {
    deleteDocument(docId);
    const remaining = documents.filter((d) => d.id !== docId);
    setDocuments(remaining);
    if (activeDocId === docId && remaining.length > 0) {
      setActiveDocIdState(remaining[0].id);
      setActiveDocumentId(remaining[0].id);
    }
  };

  const handleRenameSheet = (docId: string, newTitle: string) => {
    const updated = documents.map((d) => {
      if (d.id === docId) {
        const item = {
          ...d,
          title: newTitle,
          metadata: { ...d.metadata, songTitle: newTitle },
          updatedAt: new Date().toISOString(),
        };
        saveDocument(item);
        return item;
      }
      return d;
    });
    setDocuments(updated);
  };

  const handleImportSheet = (jsonString: string) => {
    const imported = importDocumentFromJson(jsonString);
    setDocuments([imported, ...documents]);
    setActiveDocIdState(imported.id);
    setActiveDocumentId(imported.id);
    setActiveTab('editor');
  };

  const handleExportSheet = (doc: MusicDocument) => {
    exportDocumentToJson(doc);
  };

  const handleDocumentChange = (updatedDoc: MusicDocument) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
    );
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleReloadDocuments = () => {
    const reloaded = loadAllDocuments();
    setDocuments(reloaded);
    if (reloaded.length > 0) {
      setActiveDocIdState(reloaded[0].id);
      setActiveDocumentId(reloaded[0].id);
    }
  };

  // Active document for Editor and Instrument Library
  const activeDocument =
    documents.find((d) => d.id === activeDocId) ||
    documents[0] ||
    createShowcaseDocument();

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* 3-Zone Top Navigation Bar */}
      <TopBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onNewSheet={handleNewSheet}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView
            documents={documents}
            onOpenSheet={handleOpenSheet}
            onNewSheet={handleNewSheet}
            onNewFromTemplate={handleNewFromTemplate}
            onDuplicateSheet={handleDuplicateSheet}
            onExportSheet={handleExportSheet}
          />
        )}

        {activeTab === 'sheets' && (
          <MySheetsView
            documents={documents}
            onOpenSheet={handleOpenSheet}
            onNewSheet={handleNewSheet}
            onDuplicateSheet={handleDuplicateSheet}
            onDeleteSheet={handleDeleteSheet}
            onRenameSheet={handleRenameSheet}
            onImportSheet={handleImportSheet}
            onExportSheet={handleExportSheet}
          />
        )}

        {activeTab === 'editor' && (
          <EditorWorkspace
            key={activeDocument.id}
            initialDocument={activeDocument}
            onDocumentChange={handleDocumentChange}
            octaveStyle={settings.octaveStyle}
          />
        )}

        {activeTab === 'library' && (
          <InstrumentLibraryView
            document={activeDocument}
            onUpdateDocument={handleDocumentChange}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReloadDocuments={handleReloadDocuments}
          />
        )}
      </main>
    </div>
  );
}
