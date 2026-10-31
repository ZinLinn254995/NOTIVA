/**
 * NOTIVA — Manual Music Notation Studio
 * Settings View
 * Theme (Dark/Light), Language (English/Burmese ready), Octave display, Autosave & Data Backup/Restore
 */

import React, { useRef, useState } from 'react';
import { AppSettings, loadAllDocuments, saveAllDocuments } from '../../utils/storage';
import { createShowcaseDocument } from '../../utils/sampleData';
import {
  Moon,
  Sun,
  Globe,
  Music,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onReloadDocuments: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onReloadDocuments,
}) => {
  const [backupSuccessMessage, setBackupSuccessMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = (theme: 'dark' | 'light') => {
    onUpdateSettings({ ...settings, theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleExportAll = () => {
    const docs = loadAllDocuments();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(docs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `notiva_all_scores_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          saveAllDocuments(parsed);
          onReloadDocuments();
          setBackupSuccessMessage(true);
          setTimeout(() => setBackupSuccessMessage(false), 3000);
        } else {
          alert('Invalid backup file. Array of NOTIVA documents expected.');
        }
      } catch (err: any) {
        alert('Could not parse backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSampleSongs = () => {
    if (window.confirm('Reload sample song "Dawn Over Mandalay"? This will add it back to your library.')) {
      const showcase = createShowcaseDocument();
      const current = loadAllDocuments();
      // If already exists, replace or append
      const filtered = current.filter((d) => d.id !== showcase.id);
      saveAllDocuments([showcase, ...filtered]);
      onReloadDocuments();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportBackup}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Studio Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Appearance, localization, notation typography, and local data persistence
        </p>
      </div>

      {backupSuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Scores restored successfully from backup JSON!</span>
        </div>
      )}

      {/* Appearance Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Moon className="w-4 h-4 text-sky-400" />
          <span>Appearance & Theme</span>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => toggleTheme('dark')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
              settings.theme === 'dark'
                ? 'bg-slate-800 text-white border-sky-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Mode</span>
          </button>
          <button
            onClick={() => toggleTheme('light')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
              settings.theme === 'light'
                ? 'bg-slate-800 text-white border-sky-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Mode</span>
          </button>
        </div>
      </div>

      {/* Language Section (English & Burmese structured) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Globe className="w-4 h-4 text-sky-400" />
          <span>Interface Language</span>
        </div>
        <p className="text-xs text-slate-400">
          Select interface language. Burmese language dictionary is cleanly mapped without layout shift.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => onUpdateSettings({ ...settings, language: 'en' })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
              settings.language === 'en'
                ? 'bg-sky-600/20 text-sky-300 border-sky-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>English (Default)</span>
          </button>
          <button
            onClick={() => onUpdateSettings({ ...settings, language: 'my' })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
              settings.language === 'my'
                ? 'bg-sky-600/20 text-sky-300 border-sky-500 shadow-sm'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>မြန်မာစာ (Burmese)</span>
          </button>
        </div>
      </div>

      {/* Notation Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Music className="w-4 h-4 text-sky-400" />
          <span>Notation & Octave Typography</span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">Octave Representation</label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => onUpdateSettings({ ...settings, octaveStyle: 'marks' })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                settings.octaveStyle === 'marks'
                  ? 'bg-slate-800 text-white border-sky-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <div className="font-semibold text-slate-200">Apostrophe & Comma</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">1' (upper) / 1, (lower)</div>
            </button>

            <button
              onClick={() => onUpdateSettings({ ...settings, octaveStyle: 'dots' })}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-all ${
                settings.octaveStyle === 'dots'
                  ? 'bg-slate-800 text-white border-sky-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              <div className="font-semibold text-slate-200">Superscript & Subscript Dots</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">1̇ (upper) / 1̣ (lower)</div>
            </button>
          </div>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Data Persistence & Portability</span>
        </div>
        <p className="text-xs text-slate-400">
          NOTIVA Phase 1 runs completely in your browser without requiring a backend account or internet connection.
          You can backup your entire library of scores to a JSON file anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export All Scores to JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore from Backup JSON</span>
          </button>

          <button
            onClick={handleResetSampleSongs}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Sample Composition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
