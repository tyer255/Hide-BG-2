import React from 'react';
import { Upload, Layers } from 'lucide-react';

interface HeroIntroProps {
  onUploadClick: () => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({ onUploadClick }) => {
  // Smoothly scrolls down to the bottom quick drop section
  const handleScrollToDrop = () => {
    const el = document.getElementById('quick-drop-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onUploadClick();
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto pt-8 sm:pt-14 pb-6 px-4 sm:px-6 text-center">
      {/* Clean Studio Badge (No AI Gradients) */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200/90 dark:border-white/10 mb-6 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-sky-400" />
        <span>Sub-Pixel Alpha Matting Engine</span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
        <span className="text-slate-600 dark:text-slate-400">v2.4</span>
      </div>

      {/* Main Punchy Headline (Solid Professional Typography) */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-5 sm:mb-6 leading-[1.12]">
        Instant Background Isolation.
        <br />
        <span className="text-slate-900 dark:text-white">Studio Precision in One Click.</span>
      </h1>

      {/* Editorial Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
        Drop any product, portrait, or fashion photo. Isolate subjects with fine-hair transparency, preserve contact shadows, and download clean 32-bit PNGs.
      </p>

      {/* CTA Buttons Row (Solid Clean Colors) */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mb-8">
        <button
          type="button"
          onClick={handleScrollToDrop}
          className="flex items-center gap-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 px-7 py-3.5 text-sm sm:text-base font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Upload className="h-5 w-5" />
          <span>Upload Image</span>
        </button>

        <a
          href="#interactive-editor"
          className="flex items-center gap-2 rounded-2xl glass-island px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-xs"
        >
          <Layers className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          <span>Try Interactive Demo Below ↓</span>
        </a>
      </div>

      {/* Unboxed Trust Markers */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <span>Instant Client Processing</span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span>Original Resolution Retained</span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span>Zero Watermarks</span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
        <span>100% Private Local Execution</span>
      </div>
    </section>
  );
};
