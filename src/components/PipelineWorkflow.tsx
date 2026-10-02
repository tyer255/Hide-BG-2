import React, { useState } from 'react';
import { Layers, Cpu, Download } from 'lucide-react';

export const PipelineWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      number: '01',
      title: 'High-Res Ingestion',
      icon: Layers,
      spec: 'Raw Ingestion',
      metric: '0.0s Lossless',
      details: 'Accepts raw JPG, PNG, and WEBP assets up to 25MB. Canvas preserves 100% of native pixel dimensions with zero pre-compression downscaling.',
    },
    {
      number: '02',
      title: 'Alpha Gradient Matting',
      icon: Cpu,
      spec: 'Sub-Pixel Masking',
      metric: '32-Bit Depth',
      details: 'Computes Euclidean luminance & chroma boundary distances. Smooth alpha feathering prevents harsh jagged borders and eliminates color bleeding.',
    },
    {
      number: '03',
      title: 'Backdrop Simulation & Export',
      icon: Download,
      spec: 'Commercial Output',
      metric: 'Instant PNG',
      details: 'Preview isolated subjects on e-commerce white, transparent alpha, or studio slate, and download lossless transparent PNG assets in 1 click.',
    },
  ];

  return (
    <section id="technology" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          How Hide BG Isolates Every Pixel
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          A dedicated client-side studio pipeline engineered for high-fidelity edge preservation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = activeStep === idx;
          return (
            <div
              key={step.number}
              onClick={() => setActiveStep(idx)}
              className={`cursor-pointer rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all ${
                isSelected
                  ? 'liquid-glass ring-2 ring-slate-900/10 dark:ring-white/20 shadow-lg scale-[1.01]'
                  : 'glass-island opacity-90 hover:opacity-100 hover:scale-[1.005]'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {step.number}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10">
                  {step.metric}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-white/10">
                  <Icon className="h-5 w-5 stroke-[2]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.details}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
