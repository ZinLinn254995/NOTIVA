/**
 * NOTIVA — Manual Music Notation Studio
 * Validation Panel Component
 * Displays issues with location, suggestions, confirmation, jumping, and non-destructive dismissals
 */

import React, { useState } from 'react';
import { ValidationIssue } from '../../types/music';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  EyeOff,
  ArrowRight,
  X,
  Filter,
} from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  isOpen: boolean;
  onClose: () => void;
  onSelectBar?: (barId: string) => void;
  onConfirmIssue: (issueId: string) => void;
  onDismissIssue: (issueId: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  isOpen,
  onClose,
  onSelectBar,
  onConfirmIssue,
  onDismissIssue,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  if (!isOpen) return null;

  const filteredIssues = issues.filter((issue) => {
    if (filterSeverity === 'all') return true;
    return issue.severity === filterSeverity;
  });

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100">Score Validation</h3>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300">
            {issues.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 text-xs">
        <button
          onClick={() => setFilterSeverity('all')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterSeverity === 'all'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({issues.length})
        </button>
        {errorCount > 0 && (
          <button
            onClick={() => setFilterSeverity('error')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filterSeverity === 'error'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-800'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Errors ({errorCount})
          </button>
        )}
        <button
          onClick={() => setFilterSeverity('warning')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterSeverity === 'warning'
              ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
              : 'text-amber-400 hover:text-amber-300'
          }`}
        >
          Warnings ({warningCount})
        </button>
        <button
          onClick={() => setFilterSeverity('info')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
            filterSeverity === 'info'
              ? 'bg-sky-950/70 text-sky-300 border border-sky-800'
              : 'text-sky-400 hover:text-sky-300'
          }`}
        >
          Info ({infoCount})
        </button>
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-medium text-slate-300">No issues found</p>
            <p className="text-[11px] text-slate-500">All notation syntax, measures, and repeats appear consistent.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const isError = issue.severity === 'error';
            const isWarning = issue.severity === 'warning';

            return (
              <div
                key={issue.id}
                className={`rounded-xl p-3.5 border text-xs space-y-2.5 transition-all ${
                  isError
                    ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-800/60 text-amber-200'
                    : 'bg-sky-950/20 border-sky-800/60 text-sky-200'
                }`}
              >
                {/* Header with Severity & Location */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    {isError ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    )}
                    <span className="capitalize">{issue.code.replace(/_/g, ' ')}</span>
                  </div>

                  {issue.location.barNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-slate-300">
                      Bar {issue.location.barNumber}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-slate-300 leading-relaxed">{issue.description}</p>

                {/* Suggestion */}
                <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                  <span className="font-semibold text-slate-300">Suggestion:</span>
                  <p>{issue.suggestion}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50">
                  {issue.location.barId ? (
                    <button
                      onClick={() => onSelectBar?.(issue.location.barId!)}
                      className="flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300"
                    >
                      <span>Jump to Bar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onConfirmIssue(issue.id)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors"
                      title="Mark as confirmed user intention"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => onDismissIssue(issue.id)}
                      className="px-2 py-1 rounded bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 text-[10px] transition-colors"
                      title="Dismiss warning (does not alter or delete notation)"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
