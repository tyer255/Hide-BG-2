import React, { useState } from 'react';
import { ShoppingBag, User, Sparkles, Watch, ArrowRight, Check } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { ImageMetadata } from '../types';

interface InteractiveShowcaseProps {
  onSelectSampleAndScroll: (sample: ImageMetadata) => void;
}

export const InteractiveShowcase: React.FC<InteractiveShowcaseProps> = ({
  onSelectSampleAndScroll,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const categories = [
    {
      id: 0,
      title: 'E-Commerce & Retail',
      subtitle: 'Footwear, Apparel & Products',
      icon: ShoppingBag,
      sample: SAMPLE_IMAGES[0],
      highlights: [
        'Preserved ground contact shadows',
        'Pure white #FFFFFF Amazon/Shopify ready',
        'Clean sole grip contour separation',
      ],
      description: 'Isolate catalog products seamlessly without floating cutout artifacts or lost shadow depth.',
    },
    {
      id: 1,
      title: 'Executive Headshots',
      subtitle: 'Portraits & ID Profiles',
      icon: User,
      sample: SAMPLE_IMAGES[1],
      highlights: [
        'Sub-pixel hair strands matting',
        'Natural skin luminance preservation',
        'Suit fabric anti-aliasing',
      ],
      description: 'Eliminate backdrop halos around hair and shoulders for sharp LinkedIn and executive directory photos.',
    },
    {
      id: 2,
      title: 'Fashion & Lookbooks',
      subtitle: 'Editorial & Streetwear',
      icon: Sparkles,
      sample: SAMPLE_IMAGES[2],
      highlights: [
        'Full-body silhouette isolation',
        'Delicate trench coat folds preserved',
        'Accessory transparency matting',
      ],
      description: 'Prepare high-fashion lookbook cutouts ready for multi-layer compositing in Figma, InDesign, or print.',
    },
    {
      id: 3,
      title: 'Luxury Goods & Macro',
      subtitle: 'Jewelry & Chronographs',
      icon: Watch,
      sample: SAMPLE_IMAGES[3],
      highlights: [
        'Sapphire glass reflection retained',
        'Gold bezel specular shine intact',
        'Leather strap texture clarity',
      ],
      description: 'Maintain subtle metal highlights and curved glass glare on high-value jewelry and watch photography.',
    },
  ];

  const current = categories[activeTab];

  return (
    <section id="use-cases" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
          Explore Commercial Use-Cases
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Click across product categories to test specialized edge matting algorithms for commercial workflows.
        </p>
      </div>

      {/* Interactive Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl glass-island mb-6 sm:mb-8">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = activeTab === idx;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(idx)}
              className={`flex flex-col items-center sm:items-start p-2.5 sm:p-3.5 rounded-xl transition-all text-center sm:text-left ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 font-bold'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-blue-400 dark:text-blue-600' : 'text-slate-400'}`} />
                <span className="text-[11px] sm:text-xs md:text-sm font-semibold truncate">{cat.title}</span>
              </div>
              <span className={`text-[10px] sm:text-[11px] truncate hidden sm:inline ${isActive ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                {cat.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Category Interactive Card */}
      <div className="rounded-2xl sm:rounded-3xl liquid-glass p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row items-center gap-6 sm:gap-8 shadow-xl relative overflow-hidden">
        {/* Left: Dual Preview Viewport with Clean Header Badges */}
        <div className="w-full lg:w-1/2 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Original Column */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-slate-700 dark:text-slate-300">
                  Original Photo
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-950/80 border border-black/5 dark:border-white/10 flex items-center justify-center p-2.5 shadow-inner">
                <img
                  src={current.sample.originalUrl}
                  alt={current.sample.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            </div>

            {/* Cutout Column */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-center py-1 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-blue-700 dark:text-sky-300">
                  Isolated Cutout
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-transparency-light dark:bg-transparency-dark border border-black/5 dark:border-white/10 flex items-center justify-center p-2.5 shadow-inner">
                <img
                  src={current.sample.cutoutUrl}
                  alt={current.sample.name}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-semibold text-slate-900 dark:text-white">
              {current.sample.name}
            </span>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              {current.sample.width}×{current.sample.height} px · PNG
            </span>
          </div>
        </div>

        {/* Right: Feature Highlights & Quick Action */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 mb-3">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-800 dark:text-slate-200">
                {current.title}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2.5">
              {current.subtitle}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {current.description}
            </p>

            {/* Bullet Highlights */}
            <div className="space-y-2.5 mb-8">
              {current.highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action to test in live studio editor */}
          <button
            type="button"
            onClick={() => onSelectSampleAndScroll(current.sample)}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 py-3.5 text-sm font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <span>Inspect in Studio Split Slider</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
