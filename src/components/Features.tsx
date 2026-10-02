import React from 'react';
import { Scissors, Sliders, Download } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="w-full max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Engineered for Commercial Asset Preparation
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sub-pixel precision with zero manual masking and pixel-accurate edge transitions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="rounded-2xl liquid-glass p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-4 border border-blue-500/20">
            <Scissors className="h-5 w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1.5">
            Micro-Edge & Hair Matting
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Feathered alpha gradient analysis preserves delicate hair strands, transparent glass, mesh fabrics, and natural ground contact shadows.
          </p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl liquid-glass p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-4 border border-blue-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1.5">
            Real-Time Backdrop Simulation
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Test isolated subjects directly against e-commerce pure white (#FFFFFF), dark cycloramas, and travertine neutrals before downloading.
          </p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl liquid-glass p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-sky-400 mb-4 border border-blue-500/20">
            <Download className="h-5 w-5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1.5">
            Uncompressed Alpha PNG
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Exports 32-bit PNG assets retaining original input resolution and color profiles, ready for immediate inclusion into Figma, Shopify, or print.
          </p>
        </div>
      </div>

      {/* Real-World Use Cases Banner */}
      <div id="workflows" className="mt-6 rounded-2xl liquid-glass p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Universal Studio Compatibility
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg">
              Prepared for automated background removal APIs for product catalogs, corporate directories, and design systems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl glass-island px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              E-Commerce Products
            </span>
            <span className="rounded-xl glass-island px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              Executive Headshots
            </span>
            <span className="rounded-xl glass-island px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              Fashion & Streetwear
            </span>
            <span className="rounded-xl glass-island px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              ID & Passport Photos
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
