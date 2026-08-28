import React, { useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface ParticleRevealProps {
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
  onExploreGallery?: () => void;
}

export const R2_BASE_URL = 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page';

export const BACKGROUND_PHOTOS = [
  {
    id: 'saree-heritage',
    name: 'Sambalpuri Silk Ikat',
    tag: 'Traditional Handloom',
    url: `${R2_BASE_URL}/hero1.jpg`,
    fallback: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'sunset-glamour',
    name: 'Sunset Spotlight',
    tag: 'Editorial Glamour',
    url: `${R2_BASE_URL}/hero2.jpg`,
    fallback: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'red-carpet-noir',
    name: 'Power Saree Noir',
    tag: 'Red Carpet Gala',
    url: `${R2_BASE_URL}/hero3.jpg`,
    fallback: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'outdoor-grace',
    name: 'Sanctuary Bloom',
    tag: 'Eco-Green Series',
    url: `${R2_BASE_URL}/hero4.jpg`,
    fallback: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1920&q=90',
  },
];

export const ThreeParticleRevealCanvas: React.FC<ParticleRevealProps> = ({
  currentImageIndex = 0,
  onImageChange,
  onExploreGallery,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(currentImageIndex);
  const activePhoto = BACKGROUND_PHOTOS[activePhotoIdx];

  const handleSelectPhoto = (index: number) => {
    setActivePhotoIdx(index);
    if (onImageChange) onImageChange(index);
  };

  const handleNext = () => {
    const nextIdx = (activePhotoIdx + 1) % BACKGROUND_PHOTOS.length;
    handleSelectPhoto(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activePhotoIdx - 1 + BACKGROUND_PHOTOS.length) % BACKGROUND_PHOTOS.length;
    handleSelectPhoto(prevIdx);
  };

  return (
    <div className="relative w-full h-[calc(100vh-72px)] min-h-[600px] overflow-hidden select-none bg-[#08090e] flex items-center justify-center">
      {/* 1. Underlying High-Resolution Shubhashree Sahu Background Image (Rotated to Landscape) */}
      <div className="absolute inset-0 z-0 overflow-hidden flex items-center justify-center pointer-events-none">
        {/* Ambient atmospheric blur layer */}
        <img
          key={`ambient-${activePhoto.id}`}
          src={activePhoto.url}
          alt=""
          aria-hidden="true"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (activePhoto.fallback && target.src !== activePhoto.fallback) {
              target.src = activePhoto.fallback;
            }
          }}
          className="absolute w-[120vh] h-[120vw] max-w-none max-h-none object-cover blur-3xl opacity-40 scale-125 pointer-events-none transition-all duration-700 rotate-90"
        />

        {/* Primary full-fidelity photo: rotated 90 degrees to landscape for widescreen fit */}
        <img
          key={activePhoto.id}
          src={activePhoto.url}
          alt={activePhoto.name}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (activePhoto.fallback && target.src !== activePhoto.fallback) {
              target.src = activePhoto.fallback;
            }
          }}
          className="absolute w-[calc(100vh-72px)] h-[100vw] max-w-none max-h-none object-cover object-center filter brightness-105 contrast-105 transition-all duration-700 select-none rotate-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/85 via-transparent to-[#0b0c10]/40 pointer-events-none" />
      </div>

      {/* 2. Top-left portrait info tag */}
      <div className="absolute top-6 left-6 z-20 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs text-rose-300 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span>{activePhoto.tag}</span>
        <span className="text-white/40">•</span>
        <span className="text-white">{activePhoto.name}</span>
      </div>

      {/* 3. Bottom Controls & Photo Switcher */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 w-[95vw] sm:w-auto rounded-3xl sm:rounded-full glass-panel bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
          title="Previous Photo"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Thumbnails */}
        <div className="flex items-center gap-1.5">
          {BACKGROUND_PHOTOS.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => handleSelectPhoto(i)}
              className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                activePhotoIdx === i
                  ? 'border-rose-400 scale-110 shadow-md shadow-rose-500/40'
                  : 'border-white/20 opacity-60 hover:opacity-100'
              }`}
              title={`Portrait: ${photo.name}`}
            >
              <img
                src={photo.url}
                alt={photo.name}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (photo.fallback && target.src !== photo.fallback) {
                    target.src = photo.fallback;
                  }
                }}
                className="w-full h-full object-cover rotate-90 scale-125"
              />
            </button>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
          title="Next Photo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Photo Title */}
        <span className="hidden sm:inline text-xs text-slate-300 font-medium px-2">
          {activePhoto.name}
        </span>

        {/* Explore Gallery Shortcut */}
        {onExploreGallery && (
          <button
            onClick={onExploreGallery}
            className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/25 cursor-pointer ml-1"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Gallery</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
