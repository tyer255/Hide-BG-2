/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { ComparisonWorkspace } from './components/ComparisonWorkspace';
import { InteractiveShowcase } from './components/InteractiveShowcase';
import { PipelineWorkflow } from './components/PipelineWorkflow';
import { PrecisionMatrix } from './components/PrecisionMatrix';
import { QuickDropCta } from './components/QuickDropCta';
import { Footer } from './components/Footer';
import { ImageMetadata, Theme } from './types';
import { SAMPLE_IMAGES } from './data/sampleImages';
import { backgroundProcessor } from './services/imageProcessor';

export default function App() {
  // Theme state: defaults to light mode
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('hidebg-theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // fallback
    }
    return 'light';
  });

  // Default image: opens directly with high-fidelity studio demo
  const [currentImage, setCurrentImage] = useState<ImageMetadata>(SAMPLE_IMAGES[0]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with HTML documentElement class
  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('hidebg-theme', theme);
    } catch {
      // safe fallback
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Immediate in-canvas placement + real background removal processing
  const handleFileSelect = async (file: File) => {
    try {
      // 1. Immediately create local URL for user's photo
      const objectUrl = URL.createObjectURL(file);
      
      // Fast temporary metadata so user's image is immediately visible in the editor canvas
      const tempImage: ImageMetadata = {
        id: `upload-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        originalUrl: objectUrl,
        cutoutUrl: objectUrl,
        width: 1200,
        height: 900,
        sizeBytes: file.size,
        format: file.type.replace('image/', '').toUpperCase() || 'PNG',
        category: 'custom',
      };

      setCurrentImage(tempImage);
      setIsProcessing(true);

      // Smoothly scroll to the studio workspace
      document.getElementById('interactive-editor')?.scrollIntoView({ behavior: 'smooth' });

      // 2. Execute real background processor in the background
      const result = await backgroundProcessor.processFile(file);

      // 3. Update with real background-removed cutout result
      setCurrentImage(result);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch demo sample and smooth scroll to editor
  const handleSampleSelect = (sample: ImageMetadata) => {
    setIsProcessing(false);
    setCurrentImage(sample);
  };

  const handleSelectSampleAndScroll = (sample: ImageMetadata) => {
    setIsProcessing(false);
    setCurrentImage(sample);
    document.getElementById('interactive-editor')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset to default demo
  const handleResetToDemo = () => {
    setIsProcessing(false);
    setCurrentImage(SAMPLE_IMAGES[0]);
  };

  // Trigger file dialog
  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Download transparent PNG
  const handleDownload = () => {
    if (!currentImage) return;
    backgroundProcessor.exportImage(currentImage);
  };

  return (
    <div className={`min-h-screen bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20 selection:text-blue-900 dark:selection:bg-sky-500/30 dark:selection:text-sky-200 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Global Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Interactive Homepage */}
      <main id="workspace" className="flex-1 flex flex-col items-center">
        {/* 1. Hero Introduction */}
        <HeroIntro onUploadClick={handleTriggerUpload} />

        {/* 2. Interactive Live Studio Workspace (Hero Centerpiece) */}
        <ComparisonWorkspace
          image={currentImage}
          theme={theme}
          isProcessing={isProcessing}
          onFileSelect={handleFileSelect}
          onSampleSelect={handleSampleSelect}
          onResetToDemo={handleResetToDemo}
          onDownload={handleDownload}
        />

        {/* 3. Interactive Category Use-Case Explorer */}
        <InteractiveShowcase
          onSelectSampleAndScroll={handleSelectSampleAndScroll}
        />

        {/* 4. Interactive 3-Step Pipeline Visualizer */}
        <PipelineWorkflow />

        {/* 5. Precision Quality Matrix */}
        <PrecisionMatrix />

        {/* 6. Quick Drop CTA Banner */}
        <QuickDropCta
          onFileSelect={handleFileSelect}
          onOpenStudio={() => {
            document.getElementById('interactive-editor')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}
