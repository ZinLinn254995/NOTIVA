/**
 * NOTIVA — Manual Music Notation Studio
 * SVG Music Sheet Preview Component
 * Generates high-fidelity vector rendering of Numbered Notation (Jianpu), Chords, Rhythm & Markers
 */

import React, { useState, useMemo, useRef } from 'react';
import { MusicDocument, ValidationIssue } from '../../types/music';
import { validateMusicDocument } from '../../utils/validation';
import { Printer, Download, Eye, AlertCircle, FileCheck, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface SheetPreviewProps {
  document: MusicDocument;
  activeBarId?: string;
  activeEventId?: string;
  onSelectBar?: (barId: string) => void;
  octaveStyle?: 'marks' | 'dots';
}

export const SheetPreview: React.FC<SheetPreviewProps> = ({
  document: doc,
  activeBarId,
  activeEventId,
  onSelectBar,
  octaveStyle = 'marks',
}) => {
  const [previewMode, setPreviewMode] = useState<'normal' | 'warnings' | 'export'>('normal');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const validationIssues = useMemo(() => {
    return validateMusicDocument(doc);
  }, [doc]);

  const issuesByBar = useMemo(() => {
    const map = new Map<string, ValidationIssue[]>();
    validationIssues.forEach((issue) => {
      if (issue.location.barId) {
        const arr = map.get(issue.location.barId) || [];
        arr.push(issue);
        map.set(issue.location.barId, arr);
      }
    });
    return map;
  }, [validationIssues]);

  // Layout parameters
  const PAGE_WIDTH = 920;
  const BARS_PER_SYSTEM = 4;
  const MARGIN_LEFT = 40;
  const MARGIN_RIGHT = 40;
  const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
  const BAR_WIDTH = USABLE_WIDTH / BARS_PER_SYSTEM;
  const SYSTEM_HEIGHT = 135;
  const HEADER_HEIGHT = 160;

  // Flatten all bars with section metadata
  const flattenedBars = useMemo(() => {
    const list: Array<{
      barId: string;
      sectionId: string;
      sectionName: string;
      sectionMarker?: string;
      isFirstInSection: boolean;
    }> = [];

    doc.sections.forEach((sec) => {
      sec.barIds.forEach((barId, idx) => {
        list.push({
          barId,
          sectionId: sec.id,
          sectionName: sec.name,
          sectionMarker: sec.marker,
          isFirstInSection: idx === 0,
        });
      });
    });
    return list;
  }, [doc]);

  const totalSystems = Math.ceil(flattenedBars.length / BARS_PER_SYSTEM) || 1;
  const totalSvgHeight = HEADER_HEIGHT + totalSystems * SYSTEM_HEIGHT + 60;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSvg = () => {
    const svgElem = containerRef.current?.querySelector('svg');
    if (!svgElem) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, '_').toLowerCase()}_score.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isExportMode = previewMode === 'export';
  const isDarkCanvas = !isExportMode;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-slate-950/80 border-b border-slate-800 shrink-0">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setPreviewMode('normal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewMode === 'normal'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Normal Preview
          </button>
          <button
            onClick={() => setPreviewMode('warnings')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewMode === 'warnings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            With Warnings ({validationIssues.length})
          </button>
          <button
            onClick={() => setPreviewMode('export')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              previewMode === 'export'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Export-Ready Paper
          </button>
        </div>

        {/* Zoom & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs text-slate-300">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
              className="p-1 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono tabular-nums">{Math.round(zoomScale * 100)}%</span>
            <button
              onClick={() => setZoomScale((z) => Math.min(2, z + 0.1))}
              className="p-1 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="p-1 text-slate-400 hover:text-white ml-1 border-l border-slate-700 pl-1.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            title="Download SVG file"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* SVG Container Canvas */}
      <div
        ref={containerRef}
        className={`flex-1 min-w-0 overflow-auto p-3 sm:p-6 flex justify-start sm:justify-center ${
          isExportMode ? 'bg-slate-200' : 'bg-slate-950'
        }`}
      >
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className={`shadow-2xl rounded-sm ${
            isExportMode ? 'bg-white text-slate-900 border border-slate-300' : 'bg-[#0f172a] text-slate-100 border border-slate-800'
          }`}
        >
          <svg
            width={PAGE_WIDTH}
            height={totalSvgHeight}
            viewBox={`0 0 ${PAGE_WIDTH} ${totalSvgHeight}`}
            className="select-none font-sans"
            style={{ display: 'block' }}
          >
            {/* Background */}
            <rect
              width={PAGE_WIDTH}
              height={totalSvgHeight}
              fill={isExportMode ? '#FFFFFF' : '#0F172A'}
            />

            {/* Title & Metadata Header */}
            <g transform={`translate(${PAGE_WIDTH / 2}, 45)`}>
              {/* Song Title */}
              <text
                textAnchor="middle"
                fontSize="24"
                fontWeight="700"
                fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                fill={isExportMode ? '#0F172A' : '#F8FAFC'}
              >
                {doc.title || 'Untitled Song'}
              </text>
            </g>

            {/* Meta row: Key & Tempo (Left), Author & Date (Right) */}
            <g transform={`translate(${MARGIN_LEFT}, 85)`}>
              <text
                fontSize="12"
                fontWeight="600"
                fill={isExportMode ? '#334155' : '#94A3B8'}
                fontFamily="'JetBrains Mono', monospace"
              >
                1 = {doc.metadata.notatedKey || doc.metadata.originalKey || 'C'}
                {doc.metadata.keyModifier ? ` (${doc.metadata.keyModifier})` : ''}
                {'   '}
                {doc.metadata.timeSignature || '4/4'}
                {'   '}
                ♩ = {doc.metadata.tempoBpm || 100}
              </text>
              {doc.metadata.styleGenre && (
                <text
                  y="18"
                  fontSize="11"
                  fill={isExportMode ? '#64748B' : '#64748B'}
                >
                  Style: {doc.metadata.styleGenre}
                </text>
              )}
            </g>

            <g transform={`translate(${PAGE_WIDTH - MARGIN_RIGHT}, 85)`}>
              <text
                textAnchor="end"
                fontSize="12"
                fontWeight="500"
                fill={isExportMode ? '#334155' : '#94A3B8'}
              >
                {doc.metadata.notedBy ? `Noted by: ${doc.metadata.notedBy}` : ''}
              </text>
              <text
                y="18"
                textAnchor="end"
                fontSize="11"
                fill={isExportMode ? '#64748B' : '#64748B'}
              >
                {doc.metadata.date || ''}
              </text>
            </g>

            {/* Hairline divider under header */}
            <line
              x1={MARGIN_LEFT}
              y1={125}
              x2={PAGE_WIDTH - MARGIN_RIGHT}
              y2={125}
              stroke={isExportMode ? '#CBD5E1' : '#334155'}
              strokeWidth="1"
            />

            {/* Systems and Bars */}
            {flattenedBars.map((barInfo, index) => {
              const systemIndex = Math.floor(index / BARS_PER_SYSTEM);
              const barInSystem = index % BARS_PER_SYSTEM;
              const barX = MARGIN_LEFT + barInSystem * BAR_WIDTH;
              const systemY = HEADER_HEIGHT + systemIndex * SYSTEM_HEIGHT;

              const bar = doc.bars[barInfo.barId];
              if (!bar) return null;

              const isBarSelected = activeBarId === bar.id;
              const barIssues = issuesByBar.get(bar.id) || [];
              const hasErrors = barIssues.some((i) => i.severity === 'error');
              const hasWarnings = barIssues.some((i) => i.severity === 'warning');

              // Find chord and melody rows
              const chordRowId = bar.rowIds.find((rId) => doc.rows[rId]?.type === 'chord');
              const melodyRowId = bar.rowIds.find((rId) => doc.rows[rId]?.type === 'melody');
              const rhythmRowId = bar.rowIds.find((rId) => doc.rows[rId]?.type === 'rhythm');

              const chordRow = chordRowId ? doc.rows[chordRowId] : undefined;
              const melodyRow = melodyRowId ? doc.rows[melodyRowId] : undefined;
              const rhythmRow = rhythmRowId ? doc.rows[rhythmRowId] : undefined;

              return (
                <g
                  key={bar.id}
                  transform={`translate(${barX}, ${systemY})`}
                  onClick={() => onSelectBar?.(bar.id)}
                  className="cursor-pointer"
                >
                  {/* Bar Background highlight */}
                  <rect
                    width={BAR_WIDTH}
                    height={SYSTEM_HEIGHT - 20}
                    fill={
                      isBarSelected
                        ? isExportMode
                          ? 'rgba(59, 130, 246, 0.08)'
                          : 'rgba(59, 130, 246, 0.15)'
                        : previewMode === 'warnings' && (hasErrors || hasWarnings)
                        ? hasErrors
                          ? 'rgba(239, 68, 68, 0.1)'
                          : 'rgba(245, 158, 11, 0.1)'
                        : 'transparent'
                    }
                    rx="3"
                  />

                  {/* Section Label if first bar in section */}
                  {barInfo.isFirstInSection && (
                    <g transform="translate(4, -8)">
                      <rect
                        x="0"
                        y="-14"
                        width={barInfo.sectionName.length * 8 + 16}
                        height="18"
                        rx="4"
                        fill={isExportMode ? '#F1F5F9' : '#1E293B'}
                        stroke={isExportMode ? '#94A3B8' : '#475569'}
                        strokeWidth="0.8"
                      />
                      <text
                        x="8"
                        y="-2"
                        fontSize="11"
                        fontWeight="700"
                        fill={isExportMode ? '#0F172A' : '#38BDF8'}
                      >
                        {barInfo.sectionName}
                      </text>
                    </g>
                  )}

                  {/* Bar number */}
                  <text
                    x="6"
                    y="14"
                    fontSize="10"
                    fontFamily="'JetBrains Mono', monospace"
                    fill={isExportMode ? '#94A3B8' : '#64748B'}
                  >
                    {bar.barNumber}
                  </text>

                  {/* Bar Marker e.g. Fine, Roll, Rit., $, To CHO */}
                  {bar.barMarker && (
                    <text
                      x={BAR_WIDTH - 8}
                      y="14"
                      textAnchor="end"
                      fontSize="10"
                      fontWeight="700"
                      fill={isExportMode ? '#DC2626' : '#F43F5E'}
                    >
                      {bar.barMarker}
                    </text>
                  )}

                  {/* Instrument Cues */}
                  {bar.cues && bar.cues.length > 0 && (
                    <g transform="translate(6, 26)">
                      {bar.cues.map((c, cIdx) => (
                        <text
                          key={c.id || cIdx}
                          x={cIdx * 55}
                          y="0"
                          fontSize="9"
                          fontWeight="600"
                          fontStyle="italic"
                          fill={isExportMode ? '#4F46E5' : '#818CF8'}
                        >
                          [{c.instrumentLabel}: {c.cueType}]
                        </text>
                      ))}
                    </g>
                  )}

                  {/* Left Barline or Repeat Start |: */}
                  {bar.repeatStart ? (
                    <g transform="translate(0, 15)">
                      <line x1="1" y1="0" x2="1" y2={SYSTEM_HEIGHT - 35} stroke={isExportMode ? '#0F172A' : '#CBD5E1'} strokeWidth="3" />
                      <line x1="5" y1="0" x2="5" y2={SYSTEM_HEIGHT - 35} stroke={isExportMode ? '#0F172A' : '#CBD5E1'} strokeWidth="1" />
                      <circle cx="9" cy={(SYSTEM_HEIGHT - 35) / 2 - 8} r="2" fill={isExportMode ? '#0F172A' : '#CBD5E1'} />
                      <circle cx="9" cy={(SYSTEM_HEIGHT - 35) / 2 + 8} r="2" fill={isExportMode ? '#0F172A' : '#CBD5E1'} />
                    </g>
                  ) : (
                    <line
                      x1="0"
                      y1="18"
                      x2="0"
                      y2={SYSTEM_HEIGHT - 22}
                      stroke={isExportMode ? '#94A3B8' : '#334155'}
                      strokeWidth={barInSystem === 0 ? '1.5' : '1'}
                    />
                  )}

                  {/* Right Barline or Repeat End :| or Section double bar */}
                  {bar.repeatEnd ? (
                    <g transform={`translate(${BAR_WIDTH - 10}, 15)`}>
                      <circle cx="2" cy={(SYSTEM_HEIGHT - 35) / 2 - 8} r="2" fill={isExportMode ? '#0F172A' : '#CBD5E1'} />
                      <circle cx="2" cy={(SYSTEM_HEIGHT - 35) / 2 + 8} r="2" fill={isExportMode ? '#0F172A' : '#CBD5E1'} />
                      <line x1="6" y1="0" x2="6" y2={SYSTEM_HEIGHT - 35} stroke={isExportMode ? '#0F172A' : '#CBD5E1'} strokeWidth="1" />
                      <line x1="9" y1="0" x2="9" y2={SYSTEM_HEIGHT - 35} stroke={isExportMode ? '#0F172A' : '#CBD5E1'} strokeWidth="3" />
                    </g>
                  ) : barInSystem === BARS_PER_SYSTEM - 1 ? (
                    <line
                      x1={BAR_WIDTH}
                      y1="18"
                      x2={BAR_WIDTH}
                      y2={SYSTEM_HEIGHT - 22}
                      stroke={isExportMode ? '#0F172A' : '#94A3B8'}
                      strokeWidth="1.5"
                    />
                  ) : null}

                  {/* CHORD ROW DISPLAY */}
                  {chordRow && chordRow.events.length > 0 && (
                    <g transform="translate(10, 42)">
                      {chordRow.events.map((evt, eIdx) => {
                        const chordSpacing = (BAR_WIDTH - 20) / Math.max(1, chordRow.events.length);
                        const cx = eIdx * chordSpacing + 8;
                        return (
                          <text
                            key={evt.id || eIdx}
                            x={cx}
                            y="0"
                            fontSize="13"
                            fontWeight="700"
                            fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                            fill={isExportMode ? '#1E293B' : '#A5B4FC'}
                          >
                            {evt.value}
                          </text>
                        );
                      })}
                    </g>
                  )}

                  {/* MELODY (JIANPU) ROW DISPLAY */}
                  {melodyRow && melodyRow.events.length > 0 && (
                    <g transform="translate(10, 72)">
                      {melodyRow.events.map((evt, eIdx) => {
                        const noteCount = melodyRow.events.length;
                        const noteSpacing = (BAR_WIDTH - 20) / Math.max(1, noteCount);
                        const nx = eIdx * noteSpacing + 10;
                        const isNoteActive = activeEventId === evt.id;

                        const isNote = evt.kind === 'note';
                        const isRest = evt.kind === 'rest';
                        const isSustain = evt.kind === 'sustain';
                        const isAmbiguous = evt.kind === 'ambiguous';

                        return (
                          <g key={evt.id || eIdx} transform={`translate(${nx}, 0)`}>
                            {/* Active event halo */}
                            {isNoteActive && (
                              <circle
                                cx="4"
                                cy="-4"
                                r="12"
                                fill="rgba(56, 189, 248, 0.25)"
                              />
                            )}

                            {/* Upper octave mark */}
                            {isNote && evt.octave && evt.octave > 0 && (
                              octaveStyle === 'dots' ? (
                                <circle
                                  cx="4"
                                  cy="-14"
                                  r="1.8"
                                  fill={isExportMode ? '#0F172A' : '#F8FAFC'}
                                />
                              ) : (
                                <text
                                  x="3"
                                  y="-12"
                                  fontSize="10"
                                  fontWeight="700"
                                  textAnchor="middle"
                                  fill={isExportMode ? '#0F172A' : '#F8FAFC'}
                                >
                                  {evt.octaveRaw || "'".repeat(evt.octave)}
                                </text>
                              )
                            )}

                            {/* Lower octave mark */}
                            {isNote && evt.octave && evt.octave < 0 && (
                              octaveStyle === 'dots' ? (
                                <circle
                                  cx="4"
                                  cy="7"
                                  r="1.8"
                                  fill={isExportMode ? '#0F172A' : '#F8FAFC'}
                                />
                              ) : (
                                <text
                                  x="3"
                                  y="8"
                                  fontSize="10"
                                  fontWeight="700"
                                  textAnchor="middle"
                                  fill={isExportMode ? '#0F172A' : '#F8FAFC'}
                                >
                                  {evt.octaveRaw || ','.repeat(Math.abs(evt.octave))}
                                </text>
                              )
                            )}

                            {/* The note glyph itself (1-7, 0, -) */}
                            <text
                              x="4"
                              y="0"
                              textAnchor="middle"
                              fontSize="16"
                              fontWeight="600"
                              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                              fill={
                                isAmbiguous
                                  ? isExportMode
                                    ? '#D97706'
                                    : '#FBBF24'
                                  : isExportMode
                                  ? '#0F172A'
                                  : '#F8FAFC'
                              }
                            >
                              {evt.value}
                            </text>

                            {/* Dotted note */}
                            {evt.isDotted && (
                              <circle
                                cx="12"
                                cy="-2"
                                r="1.5"
                                fill={isExportMode ? '#0F172A' : '#F8FAFC'}
                              />
                            )}

                            {/* Underline for 8th note */}
                            {evt.isUnderlined && (
                              <line
                                x1="-1"
                                y1="3"
                                x2="9"
                                y2="3"
                                stroke={isExportMode ? '#0F172A' : '#F8FAFC'}
                                strokeWidth="1.2"
                              />
                            )}

                            {/* Double underline for 16th note */}
                            {evt.isDoubleUnderlined && (
                              <>
                                <line
                                  x1="-1"
                                  y1="2.5"
                                  x2="9"
                                  y2="2.5"
                                  stroke={isExportMode ? '#0F172A' : '#F8FAFC'}
                                  strokeWidth="1.2"
                                />
                                <line
                                  x1="-1"
                                  y1="5"
                                  x2="9"
                                  y2="5"
                                  stroke={isExportMode ? '#0F172A' : '#F8FAFC'}
                                  strokeWidth="1.2"
                                />
                              </>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* RHYTHM ROW DISPLAY */}
                  {rhythmRow && rhythmRow.events.length > 0 && (
                    <g transform="translate(10, 96)">
                      {rhythmRow.events.map((evt, eIdx) => {
                        const count = rhythmRow.events.length;
                        const spacing = (BAR_WIDTH - 20) / Math.max(1, count);
                        const rx = eIdx * spacing + 10;
                        return (
                          <g key={evt.id || eIdx} transform={`translate(${rx}, 0)`}>
                            <text
                              x="4"
                              y="0"
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="600"
                              fontFamily="'JetBrains Mono', monospace"
                              fill={isExportMode ? '#059669' : '#34D399'}
                            >
                              {evt.value}
                            </text>
                            {/* Small rhythm beat tick */}
                            <line
                              x1="4"
                              y1="3"
                              x2="4"
                              y2="6"
                              stroke={isExportMode ? '#64748B' : '#475569'}
                              strokeWidth="0.8"
                            />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* Warning indicator in previewMode == 'warnings' */}
                  {previewMode === 'warnings' && barIssues.length > 0 && (
                    <g transform={`translate(${BAR_WIDTH - 18}, 28)`}>
                      <circle
                        cx="6"
                        cy="6"
                        r="6"
                        fill={hasErrors ? '#EF4444' : '#F59E0B'}
                      />
                      <text
                        x="6"
                        y="9.5"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="bold"
                        fill="#FFFFFF"
                      >
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Final double barline at end of piece */}
            <g transform={`translate(${PAGE_WIDTH - MARGIN_RIGHT}, ${HEADER_HEIGHT + (totalSystems - 1) * SYSTEM_HEIGHT})`}>
              <line
                x1="-4"
                y1="18"
                x2="-4"
                y2={SYSTEM_HEIGHT - 22}
                stroke={isExportMode ? '#0F172A' : '#CBD5E1'}
                strokeWidth="1.2"
              />
              <line
                x1="0"
                y1="18"
                x2="0"
                y2={SYSTEM_HEIGHT - 22}
                stroke={isExportMode ? '#0F172A' : '#CBD5E1'}
                strokeWidth="3.5"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
