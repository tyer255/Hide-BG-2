import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ImageMetadata } from '../types';
import { SAMPLE_IMAGES } from '../data/sampleImages';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: ImageMetadata) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelect,
  onSampleSelect,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Editorial Headline with Generous Breathing Room */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 sm:mb-5 leading-tight">
          Clean Studio Background Isolation
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Remove backgrounds with sub-pixel edge fidelity. Inspect cutouts in high resolution, compare original details, and download transparent assets.
        </p>
      </div>

      {/* Main Drag & Drop Glass Panel: Spacious & Inviting */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-3xl p-10 sm:p-16 transition-all duration-200 ${
          isDragging
            ? 'border-2 border-blue-500 bg-blue-50/60 shadow-2xl dark:border-sky-400 dark:bg-slate-900/80 scale-[1.01]'
            : 'border border-slate-200/90 bg-white/90 hover:border-slate-300 hover:bg-white shadow-[0_16px_40px_-8px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-900/60 dark:hover:border-white/20 dark:hover:bg-slate-900/80'
        } backdrop-blur-xl`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={handleInputChange}
        />

        <div className="flex flex-col items-center justify-center text-center">
          {/* Upload Glyph */}
          <div
            className={`mb-8 flex h-22 w-22 items-center justify-center rounded-3xl transition-transform duration-200 ${
              isDragging
                ? 'scale-110 bg-blue-600 text-white dark:bg-sky-500 dark:text-slate-950'
                : 'bg-slate-100 text-slate-700 group-hover:scale-105 group-hover:bg-slate-200/90 dark:bg-slate-800 dark:text-slate-300'
            } border border-slate-200/80 dark:border-white/10 shadow-xs`}
          >
            <UploadCloud className="h-10 w-10 stroke-[1.75]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white mb-3 tracking-tight">
            Drop an image here, or{' '}
            <span className="text-blue-600 dark:text-sky-400 underline decoration-blue-500/30 dark:decoration-sky-400/40 underline-offset-4 group-hover:decoration-blue-600 dark:group-hover:decoration-sky-400">
              browse files
            </span>
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
            <span>PNG, JPG, or WEBP</span>
            <span aria-hidden="true">·</span>
            <span>Up to 25MB</span>
            <span aria-hidden="true">·</span>
            <span>Full Resolution Retained</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2.5 rounded-2xl bg-slate-900 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <ImageIcon className="h-5 w-5" />
            <span>Select Image from Computer</span>
          </button>
        </div>
      </div>

      {/* Quick Instant Studio Samples Strip: Spacious & High Contrast */}
      <div id="samples" className="mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 px-1">
          <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Or test with instant studio samples
          </span>
          <span className="text-xs text-slate-400">Click any photo below to inspect</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSampleSelect(sample)}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200/90 bg-white/90 p-4 text-left shadow-xs transition-all hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.98] dark:border-white/10 dark:bg-slate-900/70 dark:hover:border-white/20 dark:hover:bg-slate-800"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-slate-950">
                <img
                  src={sample.originalUrl}
                  alt={sample.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-300">
                    {sample.name}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-sky-400 shrink-0 ml-1" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="capitalize">{sample.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-500">
                    {sample.width}×{sample.height}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Spec Footnote Strip */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/10 pt-8">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Local high-fidelity edge processing</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Commercial alpha transparency export</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>No watermarks or compression limits</span>
        </div>
      </div>
    </div>
  );
};
