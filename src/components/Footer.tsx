import React from 'react';
import { Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 py-8 text-xs text-slate-500 transition-colors dark:border-white/8 dark:bg-[#05070a] dark:text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-sky-400">
            <Layers className="h-3 w-3" />
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Hide BG Studio</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span>Background Isolation Workspace</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span>Shortcuts:</span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">Space + Drag</span>
          <span>Pan</span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">+ / -</span>
          <span>Zoom</span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">0 / Esc</span>
          <span>Reset</span>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Privacy-first local processing · No data stored
        </div>
      </div>
    </footer>
  );
};
