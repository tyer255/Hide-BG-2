import React from 'react';
import { Layers, Sun, Moon } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-colors duration-200 dark:border-white/10 dark:bg-[#07090e]/80">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark with studio icon */}
        <a href="#workspace" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950 transition-transform group-hover:scale-105">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Hide BG
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          <a
            href="#workspace"
            className="transition-colors hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Studio Editor
          </a>
          <a
            href="#use-cases"
            className="transition-colors hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Use-Cases
          </a>
          <a
            href="#technology"
            className="transition-colors hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Pipeline Engine
          </a>
          <a
            href="#specs"
            className="transition-colors hover:text-slate-900 dark:hover:text-white font-medium"
          >
            Precision Matrix
          </a>
        </nav>

        {/* Zone 3: Theme Switcher Only */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white active:scale-95"
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
