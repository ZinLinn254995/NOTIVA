/**
 * NOTIVA — Manual Music Notation Studio
 * Top Navigation Bar
 * Follows strict 3-Zone Top Bar Contract: Brand Wordmark — 5 Single-Line Nav Links — 1 Primary Action
 */

import React from 'react';
import { Plus } from 'lucide-react';

export type NavTab = 'dashboard' | 'sheets' | 'editor' | 'library' | 'settings';

interface TopBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewSheet: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onNewSheet,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0 select-none">
      {/* Zone 1: Brand Wordmark (Single text element) */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
        NOTIVA
      </button>

      {/* Zone 2: 5 Concise Single-Line Navigation Links */}
      <nav className="flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'dashboard'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('sheets')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'sheets'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Music Sheets
        </button>
        <button
          onClick={() => onSelectTab('editor')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'editor'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Music Editor
        </button>
        <button
          onClick={() => onSelectTab('library')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'library'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Instrument Library
        </button>
        <button
          onClick={() => onSelectTab('settings')}
          className={`whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'settings'
              ? 'text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onNewSheet}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Music Sheet</span>
        </button>
      </div>
    </header>
  );
};
