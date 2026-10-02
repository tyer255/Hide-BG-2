import React, { useEffect, useRef } from 'react';
import { Check, X, MoveHorizontal } from 'lucide-react';

export const PrecisionMatrix: React.FC = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  // Auto-nudge horizontal scroll on mobile when scrolled into view
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            // Only trigger gentle peek animation on mobile/small viewports where table overflows
            if (window.innerWidth < 768) {
              setTimeout(() => {
                container.scrollTo({ left: 75, behavior: 'smooth' });
                setTimeout(() => {
                  container.scrollTo({ left: 0, behavior: 'smooth' });
                }, 750);
              }, 300);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const rows = [
    {
      feature: 'Sub-Pixel Hair & Mesh Matting',
      clearcut: 'Feathered alpha gradients',
      standard: 'Harsh jagged boundary cut',
      isClearCutWin: true,
    },
    {
      feature: 'Ground Contact Shadows',
      clearcut: 'Preserved natural falloff',
      standard: 'Erased (Subject looks floating)',
      isClearCutWin: true,
    },
    {
      feature: 'Export Resolution',
      clearcut: 'Full 100% Original Resolution',
      standard: 'Downscaled to 500px unless paid',
      isClearCutWin: true,
    },
    {
      feature: 'Backdrop Simulation',
      clearcut: 'Live interactive studio palettes',
      standard: 'Fixed default white only',
      isClearCutWin: true,
    },
    {
      feature: 'Data Privacy',
      clearcut: '100% Local In-Browser Canvas',
      standard: 'Uploaded to third-party cloud',
      isClearCutWin: true,
    },
  ];

  return (
    <section id="specs" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
          Precision Studio Architecture
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          How Hide BG compares against generic automated background strippers.
        </p>
      </div>

      {/* Mobile Swipe Hint Badge */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 mb-3 text-xs font-semibold text-blue-600 dark:text-sky-400">
        <MoveHorizontal className="h-4 w-4 animate-pulse" />
        <span className="font-bold text-blue-700 dark:text-sky-300">
          Swipe table horizontally to compare
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl sm:rounded-3xl liquid-glass shadow-xl border border-black/5 dark:border-white/10">
        <div ref={tableContainerRef} className="overflow-x-auto no-scrollbar scroll-smooth">
          <table className="w-full text-left text-xs sm:text-sm min-w-[580px] sm:min-w-full">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                <th className="py-4 px-5 sm:px-6 font-bold text-slate-900 dark:text-slate-200">
                  Feature / Capability
                </th>
                <th className="py-4 px-5 sm:px-6 font-bold text-blue-600 dark:text-sky-400">
                  Hide BG Studio
                </th>
                <th className="py-4 px-5 sm:px-6 font-medium text-slate-500 dark:text-slate-400">
                  Generic Web Removers
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="py-4 px-5 sm:px-6 font-semibold text-slate-900 dark:text-slate-100">
                    {row.feature}
                  </td>
                  <td className="py-4 px-5 sm:px-6 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                    <span>{row.clearcut}</span>
                  </td>
                  <td className="py-4 px-5 sm:px-6 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-500">
                        <X className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                      <span>{row.standard}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
