/**
 * NOTIVA — Manual Music Notation Studio
 * Top Navigation Bar
 * Follows strict 3-Zone Top Bar Contract: Brand Wordmark — 5 Single-Line Nav Links — 1 Primary Action
 */

import React, { useState } from 'react';
import { Menu, Plus, X } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'sheets', label: 'My Music Sheets' },
    { id: 'editor', label: 'Music Editor' },
    { id: 'library', label: 'Instrument Library' },
    { id: 'settings', label: 'Settings' },
  ];

  const selectTab = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-950 border-b border-slate-800 shrink-0 select-none">
      <button
        type="button"
        onClick={() => selectTab('dashboard')}
        className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
        NOTIVA
      </button>

      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="sm:hidden inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-200"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-sm font-medium min-w-0" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => selectTab(item.id)}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === item.id ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="hidden sm:flex items-center shrink-0">
        <button
          onClick={onNewSheet}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">New Music Sheet</span>
          <span className="md:hidden">New Sheet</span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-40 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl sm:hidden">
          <nav className="grid gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`min-h-11 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-sky-600/20 text-sky-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => { onNewSheet(); setIsMenuOpen(false); }}
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" /> New Music Sheet
          </button>
        </div>
      )}
    </header>
  );
};
