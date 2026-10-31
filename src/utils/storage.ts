/**
 * NOTIVA — Manual Music Notation Studio
 * Storage Manager
 * Handles local browser storage, autosave, import/export, and duplication
 */

import { MusicDocument } from '../types/music';
import { createShowcaseDocument, createNewDocument } from './sampleData';

const STORAGE_KEY_DOCUMENTS = 'notiva_documents_v1';
const STORAGE_KEY_ACTIVE_ID = 'notiva_active_doc_id';
const STORAGE_KEY_SETTINGS = 'notiva_settings_v1';

export interface AppSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'my'; // English and Burmese ready
  octaveStyle: 'marks' | 'dots'; // ' for upper / , for lower, or dots above/below
  autoSaveEnabled: boolean;
  autoSaveIntervalSec: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  language: 'en',
  octaveStyle: 'marks',
  autoSaveEnabled: true,
  autoSaveIntervalSec: 15,
};

/**
 * Load all documents from localStorage
 */
export function loadAllDocuments(): MusicDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCUMENTS);
    if (!raw) {
      // First run: Seed with showcase document
      const initial = createShowcaseDocument();
      saveAllDocuments([initial]);
      return [initial];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = createShowcaseDocument();
    saveAllDocuments([initial]);
    return [initial];
  } catch (err) {
    console.error('Failed to load documents from storage:', err);
    return [createShowcaseDocument()];
  }
}

/**
 * Save array of documents to localStorage
 */
export function saveAllDocuments(docs: MusicDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DOCUMENTS, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents to storage:', err);
  }
}

/**
 * Get active document ID
 */
export function getActiveDocumentId(): string {
  const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
  if (stored) return stored;
  const docs = loadAllDocuments();
  return docs[0]?.id || 'doc_showcase_dawn_mandalay';
}

/**
 * Set active document ID
 */
export function setActiveDocumentId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

/**
 * Save single document
 */
export function saveDocument(doc: MusicDocument): void {
  const docs = loadAllDocuments();
  const updatedDoc = {
    ...doc,
    updatedAt: new Date().toISOString(),
  };
  const index = docs.findIndex((d) => d.id === doc.id);
  if (index >= 0) {
    docs[index] = updatedDoc;
  } else {
    docs.unshift(updatedDoc);
  }
  saveAllDocuments(docs);
}

/**
 * Duplicate a document with new stable IDs
 */
export function duplicateDocument(sourceDoc: MusicDocument): MusicDocument {
  const newDocId = 'doc_' + Math.random().toString(36).substring(2, 9);
  const copy: MusicDocument = JSON.parse(JSON.stringify(sourceDoc));

  copy.id = newDocId;
  copy.title = `${sourceDoc.title} (Copy)`;
  copy.metadata.songTitle = copy.title;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();

  // Remap section and bar IDs to ensure complete stability
  const secMap = new Map<string, string>();
  copy.sections.forEach((sec) => {
    const newSecId = 'sec_' + Math.random().toString(36).substring(2, 9);
    secMap.set(sec.id, newSecId);
    sec.id = newSecId;
  });

  const barMap = new Map<string, string>();
  const oldBars = { ...copy.bars };
  copy.bars = {};

  copy.sections.forEach((sec) => {
    sec.barIds = sec.barIds.map((oldBId) => {
      const newBId = 'bar_' + Math.random().toString(36).substring(2, 9);
      barMap.set(oldBId, newBId);
      const b = oldBars[oldBId];
      if (b) {
        b.id = newBId;
        b.sectionId = sec.id;
        copy.bars[newBId] = b;
      }
      return newBId;
    });
  });

  const oldRows = { ...copy.rows };
  copy.rows = {};
  Object.values(copy.bars).forEach((bar) => {
    bar.rowIds = bar.rowIds.map((oldRId) => {
      const newRId = 'row_' + Math.random().toString(36).substring(2, 9);
      const r = oldRows[oldRId];
      if (r) {
        r.id = newRId;
        r.barId = bar.id;
        // re-id events
        r.events = r.events.map((evt) => ({
          ...evt,
          id: 'evt_' + Math.random().toString(36).substring(2, 9),
        }));
        copy.rows[newRId] = r;
      }
      return newRId;
    });
  });

  saveDocument(copy);
  return copy;
}

/**
 * Delete a document
 */
export function deleteDocument(docId: string): void {
  const docs = loadAllDocuments().filter((d) => d.id !== docId);
  saveAllDocuments(docs);
}

/**
 * Export document as downloadable JSON file
 */
export function exportDocumentToJson(doc: MusicDocument): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(doc, null, 2));
  const downloadAnchor = document.createElement('a');
  const sanitizedTitle = doc.title.replace(/[^a-zA-Z0-9_\u1000-\u109F]/g, '_').toLowerCase();
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `${sanitizedTitle}_notiva.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import document from JSON string
 */
export function importDocumentFromJson(jsonString: string): MusicDocument {
  const parsed = JSON.parse(jsonString);
  if (!parsed || parsed.schemaVersion !== '1.0.0' || !parsed.id || !parsed.title) {
    throw new Error('Invalid NOTIVA document JSON format. Requires schemaVersion 1.0.0.');
  }

  // Ensure stable unique ID to avoid overwriting existing
  const importedId = 'doc_' + Math.random().toString(36).substring(2, 9);
  const importedDoc: MusicDocument = {
    ...parsed,
    id: importedId,
    title: parsed.title + ' (Imported)',
    updatedAt: new Date().toISOString(),
  };

  saveDocument(importedDoc);
  return importedDoc;
}

/**
 * Load app settings
 */
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save app settings
 */
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
