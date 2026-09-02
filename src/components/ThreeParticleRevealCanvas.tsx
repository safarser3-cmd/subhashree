import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { HeroPhoto } from '../types';
import { subscribeToHeroPhotos } from '../lib/firestoreService';

interface ParticleRevealProps {
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
  onExploreGallery?: () => void;
}

export const ThreeParticleRevealCanvas: React.FC<ParticleRevealProps> = ({
  currentImageIndex = 0,
  onImageChange,
  onExploreGallery,
}) => {
  const [heroPhotos, setHeroPhotos] = useState<HeroPhoto[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(currentImageIndex);
  
  useEffect(() => {
    const unsubscribe = subscribeToHeroPhotos((photos) => {
      setHeroPhotos(photos);
    });
    return () => unsubscribe();
  }, []);

  const activePhoto = heroPhotos[activePhotoIdx] || heroPhotos[0];

  const handleSelectPhoto = (index: number) => {
    setActivePhotoIdx(index);
    if (onImageChange) onImageChange(index);
  };

  const handleNext = () => {
    if (heroPhotos.length === 0) return;
    const nextIdx = (activePhotoIdx + 1) % heroPhotos.length;
    handleSelectPhoto(nextIdx);
  };

  const handlePrev = () => {
    if (heroPhotos.length === 0) return;
    const prevIdx = (activePhotoIdx - 1 + heroPhotos.length) % heroPhotos.length;
    handleSelectPhoto(prevIdx);
  };

  if (heroPhotos.length === 0) {
    return (
      <div className="relative w-full h-screen min-h-[600px] bg-[#08090e] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <div
      id="home"
      className="relative w-full h-screen min-h-[600px] overflow-hidden select-none bg-[#08090e] flex items-center justify-center"
    >
      {/* 1. Underlying High-Resolution Shubhashree Sahu Background Image */}
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
          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110 pointer-events-none transition-all duration-700"
        />

        {/* Primary full-fidelity photo */}
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
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105 transition-all duration-700 select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/85 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Bottom Controls & Photo Switcher */}
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
          {heroPhotos.map((photo, i) => (
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
                className="w-full h-full object-cover"
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
