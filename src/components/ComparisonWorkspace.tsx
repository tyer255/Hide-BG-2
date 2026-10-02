import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  SlidersHorizontal,
  Columns,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  Hand,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UploadCloud,
} from 'lucide-react';
import { ImageMetadata, ViewMode, BackdropMode } from '../types';
import { SAMPLE_IMAGES } from '../data/sampleImages';

interface ComparisonWorkspaceProps {
  image: ImageMetadata;
  onDownload: () => void;
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: ImageMetadata) => void;
  onResetToDemo: () => void;
  isDemo?: boolean;
  isProcessing?: boolean;
  theme: 'light' | 'dark';
}

export const ComparisonWorkspace: React.FC<ComparisonWorkspaceProps> = ({
  image,
  onDownload,
  onFileSelect,
  onSampleSelect,
  onResetToDemo,
  isDemo = image.category !== 'custom',
  isProcessing = false,
  theme,
}) => {
  // Interaction & Display States
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [backdropMode, setBackdropMode] = useState<BackdropMode>('checkerboard-light');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPanPos, setStartPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPeekingOriginal, setIsPeekingOriginal] = useState<boolean>(false);
  const [isCanvasDragOver, setIsCanvasDragOver] = useState<boolean>(false);

  // References
  const stageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom, pan, and smoothly settle slider at center (50/50) when image changes or processing finishes
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSliderPosition(50);
  }, [image.id, isProcessing]);

  // Adjust theme backdrop default
  useEffect(() => {
    if (backdropMode === 'checkerboard-light' && theme === 'dark') {
      setBackdropMode('checkerboard-dark');
    } else if (backdropMode === 'checkerboard-dark' && theme === 'light') {
      setBackdropMode('checkerboard-light');
    }
  }, [theme]);

  // Smooth scroll helper to main upload area
  const handleScrollToUpload = () => {
    const el = document.getElementById('quick-drop-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      fileInputRef.current?.click();
    }
  };

  // Handle stage pointer interactions (Split slider dragging or Panning)
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isProcessing) return;

    if (isPanMode || e.button === 1) {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    if (viewMode === 'slider' && stageRef.current) {
      setIsDraggingSlider(true);
      updateSliderFromPointer(e.clientX);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y,
      });
      return;
    }

    if (isDraggingSlider && viewMode === 'slider') {
      updateSliderFromPointer(e.clientX);
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingSlider(false);
    setIsPanning(false);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
  };

  const updateSliderFromPointer = (clientX: number) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const rawPos = ((clientX - rect.left) / rect.width) * 100;
    const clampedPos = Math.max(0, Math.min(100, rawPos));
    setSliderPosition(clampedPos);
  };

  // Zoom management
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prev) => Math.max(0.5, Math.min(prev + delta, 3)));
    }
  };

  // Drag & drop directly onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCanvasDragOver(true);
  };

  const handleDragLeave = () => {
    setIsCanvasDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCanvasDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Backdrop style class resolver
  const getBackdropStyle = () => {
    switch (backdropMode) {
      case 'checkerboard-light':
        return 'bg-transparency-light';
      case 'checkerboard-dark':
        return 'bg-transparency-dark';
      case 'white':
        return 'bg-white';
      case 'slate':
        return 'bg-slate-900';
      case 'travertine':
        return 'bg-[#e2e8f0]';
      case 'studio-gray':
        return 'bg-[#64748b]';
      default:
        return 'bg-transparency-light';
    }
  };

  return (
    <div id="interactive-editor" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex flex-col items-center scroll-mt-24">
      {/* Hidden file input for drag/drop fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* ========================================================================= */}
      {/* DESKTOP/TABLET TOP CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="w-full hidden sm:flex items-center justify-between gap-3 mb-4">
        {/* Left: Show Demo Mode tabs ONLY when in demo state */}
        {isDemo ? (
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl glass-island">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-sky-500/15 dark:text-sky-400 text-xs font-semibold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-sky-400" />
              Demo Mode
            </span>

            {/* 4 Sample Switcher Pills */}
            <div className="flex items-center gap-1">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSampleSelect(sample)}
                  className={`px-3 py-1 text-xs font-medium rounded-xl transition-all cursor-pointer ${
                    image.id === sample.id && !isProcessing
                      ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                  }`}
                >
                  {sample.id === 'sample-sneaker' && 'Sneaker'}
                  {sample.id === 'sample-portrait' && 'Portrait'}
                  {sample.id === 'sample-fashion' && 'Fashion'}
                  {sample.id === 'sample-watch' && 'Watch'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Real Image Active: Demo Mode completely hidden, show only custom image status & return button */
          <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-island">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 text-xs font-semibold tracking-wide uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              Custom Photo Active
            </span>

            <button
              type="button"
              onClick={onResetToDemo}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Return to initial demo state"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Demo</span>
            </button>
          </div>
        )}

        {/* Right: View Mode Segmented Island */}
        <div className="flex items-center gap-1 p-1 rounded-2xl glass-island">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cutout-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer ${
              viewMode === 'cutout-only'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Cutout Only</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE TOP STATUS BAR */}
      {/* ========================================================================= */}
      <div className="w-full flex sm:hidden flex-col gap-1.5 mb-2.5">
        {/* Show 4-Column Grid ONLY when in Demo state */}
        {isDemo ? (
          <div className="grid grid-cols-4 gap-1 w-full p-1 rounded-2xl glass-island">
            {SAMPLE_IMAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => onSampleSelect(sample)}
                className={`flex items-center justify-center py-2 px-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  image.id === sample.id && !isProcessing
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {sample.id === 'sample-sneaker' && 'Sneaker'}
                {sample.id === 'sample-portrait' && 'Portrait'}
                {sample.id === 'sample-fashion' && 'Fashion'}
                {sample.id === 'sample-watch' && 'Watch'}
              </button>
            ))}
          </div>
        ) : (
          /* Real Image Active: Demo tabs completely hidden on mobile */
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl glass-island text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Custom Photo Active
            </span>
            <button
              type="button"
              onClick={onResetToDemo}
              className="flex items-center gap-1 text-blue-600 dark:text-sky-400 font-semibold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Return to Demo</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. THE VISUAL CENTERPIECE: Prominent Workspace Canvas */}
      {/* ========================================================================= */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 liquid-glass transition-all duration-300 shadow-xl">
        <div
          ref={stageRef}
          onWheel={handleWheel}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] sm:max-h-[72vh] overflow-hidden rounded-xl sm:rounded-2xl select-none transition-all touch-none ${
            isProcessing
              ? 'cursor-wait'
              : isPanMode
              ? 'cursor-grab active:cursor-grabbing'
              : 'cursor-ew-resize'
          } ${getBackdropStyle()}`}
        >
          {/* Transformable Inner Content Canvas */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* IN-PROCESSING STATE: Display user's original image clearly */}
            {isProcessing ? (
              <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                <img
                  src={image.originalUrl}
                  alt="Processing preview"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain drop-shadow-md select-none"
                />
              </div>
            ) : (
              <>
                {/* MODE 1: Interactive Draggable Split Slider (Settles at center 50/50) */}
                {viewMode === 'slider' && (
                  <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                    {/* Layer A: Processed Cutout (Background Layer) */}
                    <img
                      src={isPeekingOriginal ? image.originalUrl : image.cutoutUrl}
                      alt="Removed background cutout"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-md select-none transition-all"
                    />

                    {/* Layer B: Original Image (Clipped Left Side) */}
                    {!isPeekingOriginal && (
                      <div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none transition-all duration-75"
                        style={{
                          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
                        }}
                      >
                        <img
                          src={image.originalUrl}
                          alt="Original photo"
                          referrerPolicy="no-referrer"
                          className="max-w-full max-h-full object-contain select-none"
                        />
                      </div>
                    )}

                    {/* Draggable Divider Handle */}
                    {!isPeekingOriginal && (
                      <div
                        className="absolute top-0 bottom-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-75"
                        style={{
                          left: `${sliderPosition}%`,
                          transform: 'translateX(-50%)',
                          width: '40px',
                        }}
                      >
                        {/* Vertical Hairline with Specular Glow */}
                        <div className="absolute inset-y-0 w-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.9),0_0_2px_rgba(0,0,0,0.5)]" />

                        {/* Tactile Ergonomic Center Grip Handle */}
                        <div
                          className={`relative z-10 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full glass-island shadow-xl transition-transform ${
                            isDraggingSlider ? 'scale-110 ring-4 ring-blue-500/30' : 'hover:scale-105'
                          }`}
                        >
                          <div className="flex items-center gap-0.5 font-bold text-[9px] sm:text-[10px] text-slate-800 dark:text-white">
                            <span>◀</span>
                            <span>▶</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: Synchronized Side-by-Side Comparison */}
                {viewMode === 'side-by-side' && (
                  <div className="relative w-full h-full grid grid-cols-2 divide-x divide-black/10 dark:divide-white/10 p-2 sm:p-4 gap-2 sm:gap-4 pointer-events-none">
                    <div className="relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl bg-black/5 dark:bg-white/5 p-2 sm:p-3 overflow-hidden">
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-md sm:rounded-lg bg-black/70 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
                        Original
                      </span>
                      <img
                        src={image.originalUrl}
                        alt="Original"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    <div className="relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl p-2 sm:p-3 overflow-hidden">
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 rounded-md sm:rounded-lg bg-blue-600 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-white uppercase tracking-wider backdrop-blur-sm">
                        Removed
                      </span>
                      <img
                        src={image.cutoutUrl}
                        alt="Removed Cutout"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain drop-shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* MODE 3: Cutout Only */}
                {viewMode === 'cutout-only' && (
                  <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 pointer-events-none">
                    <img
                      src={isPeekingOriginal ? image.originalUrl : image.cutoutUrl}
                      alt="Cutout inspection"
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain drop-shadow-lg"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* IN-CANVAS PROCESSING ANIMATION & STATUS PILL */}
          {isProcessing && (
            <>
              {/* Subtle Moving Scan Beam across 100% of the Image */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl sm:rounded-2xl">
                <div className="absolute inset-y-0 w-48 sm:w-64 animate-scan-beam bg-gradient-to-r from-transparent via-blue-500/25 to-transparent flex items-center justify-center">
                  <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_16px_rgba(59,130,246,0.9),0_0_4px_rgba(255,255,255,0.9)]" />
                </div>
              </div>

              {/* Discreet In-Canvas Status Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-island shadow-lg backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-sky-400"></span>
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Isolating background...
                </span>
              </div>
            </>
          )}

          {/* Floating Corner Badges for Context */}
          {!isProcessing && viewMode === 'slider' && !isPeekingOriginal && (
            <>
              <div
                className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-20 pointer-events-none rounded-lg sm:rounded-xl glass-island px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200 transition-opacity duration-200"
                style={{ opacity: sliderPosition < 15 ? 0 : 1 }}
              >
                ORIGINAL
              </div>

              <div
                className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 pointer-events-none rounded-lg sm:rounded-xl glass-island px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold tracking-wide text-blue-600 dark:text-sky-400 transition-opacity duration-200"
                style={{ opacity: sliderPosition > 85 ? 0 : 1 }}
              >
                REMOVED
              </div>
            </>
          )}

          {/* DESKTOP FLOATING OVERLAY: Bottom-Left Compact Backdrop Island (hidden on mobile) */}
          <div className="hidden sm:flex absolute bottom-4 left-4 z-20 items-center gap-1.5 p-1 rounded-2xl glass-island shadow-lg">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2">
              Backdrop:
            </span>

            {/* Transparent Checkerboard */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBackdropMode(theme === 'dark' ? 'checkerboard-dark' : 'checkerboard-light');
              }}
              className={`h-7 w-7 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'checkerboard-light' || backdropMode === 'checkerboard-dark'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/10 dark:border-white/10 hover:scale-105'
              } ${theme === 'dark' ? 'bg-transparency-dark' : 'bg-transparency-light'}`}
              title="Transparent Grid"
            />

            {/* Pure White */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBackdropMode('white');
              }}
              className={`h-7 w-7 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'white'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/10 dark:border-white/10 hover:scale-105'
              } bg-white`}
              title="Solid Studio White"
            />

            {/* Light Neutral Gray */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBackdropMode('travertine');
              }}
              className={`h-7 w-7 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'travertine'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/10 dark:border-white/10 hover:scale-105'
              } bg-[#e2e8f0]`}
              title="Solid Light Gray"
            />

            {/* Dark Slate */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBackdropMode('slate');
              }}
              className={`h-7 w-7 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'slate'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/10 dark:border-white/10 hover:scale-105'
              } bg-slate-900`}
              title="Solid Dark Slate"
            />
          </div>

          {/* DESKTOP FLOATING OVERLAY: Bottom-Right Compact Zoom Island (hidden on mobile) */}
          <div className="hidden sm:flex absolute bottom-4 right-4 z-20 items-center gap-1 p-1 rounded-2xl glass-island shadow-lg">
            {/* Hold to Compare */}
            <button
              type="button"
              disabled={isProcessing}
              onMouseDown={() => setIsPeekingOriginal(true)}
              onMouseUp={() => setIsPeekingOriginal(false)}
              onMouseLeave={() => setIsPeekingOriginal(false)}
              onTouchStart={() => setIsPeekingOriginal(true)}
              onTouchEnd={() => setIsPeekingOriginal(false)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                isPeekingOriginal
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Press and hold to view original photo"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Peek</span>
            </button>

            <div className="h-4 w-px bg-black/10 dark:bg-white/10" />

            {/* Pan Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPanMode(!isPanMode);
              }}
              className={`flex items-center justify-center h-7 w-7 rounded-xl transition-all cursor-pointer ${
                isPanMode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Pan Tool"
            >
              <Hand className="h-3.5 w-3.5" />
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomOut();
              }}
              disabled={zoom <= 0.5}
              className="flex items-center justify-center h-7 w-7 rounded-xl text-slate-700 hover:text-slate-900 disabled:opacity-30 transition-colors dark:text-slate-300 dark:hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            {/* 100% Reset */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              className="px-2 py-1 text-xs font-mono tabular-nums text-slate-900 dark:text-white font-semibold transition-colors cursor-pointer"
              title="Reset Zoom (Fit)"
            >
              {Math.round(zoom * 100)}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleZoomIn();
              }}
              disabled={zoom >= 3}
              className="flex items-center justify-center h-7 w-7 rounded-xl text-slate-700 hover:text-slate-900 disabled:opacity-30 transition-colors dark:text-slate-300 dark:hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>

            {/* Fit Frame */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleResetZoom();
              }}
              className="flex items-center justify-center h-7 w-7 rounded-xl text-slate-700 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:text-white cursor-pointer"
              title="Fit to view"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* DRAG-OVER DROPZONE INDICATOR */}
          {isCanvasDragOver && (
            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-blue-600/20 backdrop-blur-md border-4 border-dashed border-blue-500 rounded-2xl pointer-events-none transition-all">
              <UploadCloud className="h-14 w-14 text-blue-600 dark:text-sky-300 animate-bounce" />
              <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                Drop photo to replace
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE DEDICATED STACK (Visible ONLY on mobile < 640px) */}
      {/* ========================================================================= */}
      <div className="w-full flex sm:hidden flex-col gap-2.5 mt-3">
        {/* Step A: Comparison View Mode Controls */}
        <div className="w-full p-1 rounded-2xl glass-island flex items-center justify-between gap-1 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Split Slider</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Columns className="h-3.5 w-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cutout-only')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              viewMode === 'cutout-only'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-white dark:text-slate-950'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Cutout</span>
          </button>
        </div>

        {/* Step B: Split Slider Range Scrubber */}
        {!isProcessing && viewMode === 'slider' && (
          <div className="w-full p-2.5 rounded-2xl glass-island flex items-center gap-2.5 shadow-sm">
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Before
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-sky-400"
            />
            <span className="text-[10px] font-bold text-blue-600 dark:text-sky-400 uppercase tracking-wider">
              After ({Math.round(sliderPosition)}%)
            </span>
          </div>
        )}

        {/* Step C: Zoom & Viewport Controls Toolbar */}
        <div className="w-full p-1.5 rounded-2xl glass-island flex items-center justify-between shadow-sm">
          {/* Peek Original Button */}
          <button
            type="button"
            disabled={isProcessing}
            onMouseDown={() => setIsPeekingOriginal(true)}
            onMouseUp={() => setIsPeekingOriginal(false)}
            onMouseLeave={() => setIsPeekingOriginal(false)}
            onTouchStart={() => setIsPeekingOriginal(true)}
            onTouchEnd={() => setIsPeekingOriginal(false)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isPeekingOriginal
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Hold to Peek</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Pan Hand Toggle */}
            <button
              type="button"
              onClick={() => setIsPanMode(!isPanMode)}
              className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all cursor-pointer ${
                isPanMode
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20'
              }`}
              title="Pan"
            >
              <Hand className="h-4 w-4" />
            </button>

            {/* Zoom Out */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            {/* Zoom Percentage */}
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-mono tabular-nums text-slate-900 dark:text-white font-bold"
            >
              {Math.round(zoom * 100)}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            {/* Reset / Fit */}
            <button
              type="button"
              onClick={handleResetZoom}
              className="flex items-center justify-center h-8 w-8 rounded-xl text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 cursor-pointer"
              title="Fit Frame"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Step D: Background Preview Controls */}
        <div className="w-full p-2.5 rounded-2xl glass-island flex items-center justify-between gap-2 shadow-sm">
          <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
            Backdrop Preview:
          </span>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Grid */}
            <button
              type="button"
              onClick={() => setBackdropMode(theme === 'dark' ? 'checkerboard-dark' : 'checkerboard-light')}
              className={`h-8 w-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                backdropMode === 'checkerboard-light' || backdropMode === 'checkerboard-dark'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/15 dark:border-white/20'
              } ${theme === 'dark' ? 'bg-transparency-dark' : 'bg-transparency-light'}`}
              title="Transparent Grid"
            />

            {/* White */}
            <button
              type="button"
              onClick={() => setBackdropMode('white')}
              className={`h-8 w-8 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'white'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/15 dark:border-white/20'
              } bg-white`}
              title="Solid White"
            />

            {/* Light Gray */}
            <button
              type="button"
              onClick={() => setBackdropMode('travertine')}
              className={`h-8 w-8 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'travertine'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/15 dark:border-white/20'
              } bg-[#e2e8f0]`}
              title="Light Gray"
            />

            {/* Dark Slate */}
            <button
              type="button"
              onClick={() => setBackdropMode('slate')}
              className={`h-8 w-8 rounded-xl border transition-all cursor-pointer ${
                backdropMode === 'slate'
                  ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                  : 'border-black/15 dark:border-white/20'
              } bg-slate-900`}
              title="Dark Slate"
            />
          </div>
        </div>

        {/* Step E: Download & Upload Actions */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={onDownload}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 py-3 text-sm font-semibold shadow-lg shadow-blue-500/25 active:scale-98 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download Transparent PNG</span>
          </button>

          <button
            type="button"
            onClick={handleScrollToUpload}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 py-2.5 text-xs font-semibold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-98 transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Another Photo</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP/TABLET BOTTOM ACTION STRIP (hidden on mobile) */}
      {/* ========================================================================= */}
      <div className="hidden sm:flex w-full mt-5 p-3.5 sm:p-4 rounded-3xl glass-island flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        {/* Upload Trigger / Drop hint -> Smoothly scrolls to main upload area */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleScrollToUpload}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Your Photo</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
            or drop anywhere onto the canvas
          </span>
        </div>

        {/* Dedicated Split Scrubber Slider */}
        {!isProcessing && viewMode === 'slider' && (
          <div className="w-full md:max-w-md flex items-center gap-3 px-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Before
            </span>

            <div className="relative flex-1 flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200/90 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-sky-400 focus:outline-none"
              />
            </div>

            <span className="text-[11px] font-semibold text-blue-600 dark:text-sky-400 whitespace-nowrap">
              After ({Math.round(sliderPosition)}%)
            </span>
          </div>
        )}

        {/* Metadata info & Download Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
              {image.name}
            </p>
            <p className="text-[10px] font-mono text-slate-500">
              {image.width > 0 ? `${image.width}×${image.height} · ${image.format}` : image.format}
            </p>
          </div>

          <button
            type="button"
            onClick={onDownload}
            disabled={isProcessing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 dark:shadow-sky-500/20 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
