import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, ArrowUpRight } from 'lucide-react';

interface QuickDropCtaProps {
  onFileSelect: (file: File) => void;
  onOpenStudio: () => void;
}

export const QuickDropCta: React.FC<QuickDropCtaProps> = ({
  onFileSelect,
  onOpenStudio,
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
    <section id="quick-drop-section" className="w-full max-w-5xl mx-auto py-12 sm:py-16 px-4 sm:px-6 scroll-mt-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Main Glass Card with Specular White Gloss Sheen in Both Light and Dark Mode */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-3xl p-8 sm:p-14 liquid-glass text-center transition-all duration-300 ${
          isDragging
            ? 'ring-4 ring-blue-500/50 scale-[1.01]'
            : 'hover:scale-[1.005]'
        }`}
      >
        {/* Specular White Gloss / Diagonal Glass Reflection Layer (Highly visible in Light Mode) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/60 via-white/10 to-transparent dark:from-white/15 dark:via-transparent dark:to-white/5 rounded-3xl"
        />

        {/* Diagonal Light Sheen Glare */}
        <div
          aria-hidden="true"
          className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-gradient-to-br from-white/40 via-white/15 to-transparent blur-3xl pointer-events-none transform -rotate-45"
        />

        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Studio Icon with Glass Glow */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-sky-500/15 border border-blue-500/25 text-blue-600 dark:text-sky-400 mb-6 shadow-md backdrop-blur-md">
            <UploadCloud className="h-8 w-8 stroke-[2]" />
          </div>

          {/* Heading: Solid Dark in Light Mode, Vibrant in Dark Mode */}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Ready to Isolate Your Photos?
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8 leading-relaxed">
            Drop an image here or click to select from your device. Retain full resolution with instant transparent export.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 px-7 py-3.5 text-sm font-bold shadow-xl transition-all active:scale-95 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Select Photo from Computer</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenStudio();
              }}
              className="flex items-center gap-1.5 rounded-2xl glass-island px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Jump to Studio Workspace</span>
              <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-sky-400" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
