import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { X, ChevronLeft, ChevronRight, Eye, Heart, Compass, Sparkles, Share2, Download } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImageLightboxModalProps {
  item: GalleryItem | null;
  allItems: GalleryItem[];
  onClose: () => void;
  onSelect: (item: GalleryItem) => void;
  onLike: (id: string) => void;
  likedIds: Set<string>;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  item,
  allItems,
  onClose,
  onSelect,
  onLike,
  likedIds
}) => {
  const [showGoldenSpiral, setShowGoldenSpiral] = useState(false);

  useEffect(() => {
    if (!item) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const currentIndex = allItems.findIndex(i => i.id === item.id);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : allItems[allItems.length - 1];
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : allItems[0];
  const isLiked = likedIds.has(item.id);

  const handleLike = () => {
    onLike(item.id);
    if (!isLiked) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#d4af37', '#f3e5ab', '#882d17']
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shubhashree Sahu — ${item.title}`,
          text: item.admirationNote,
          url: window.location.href,
        });
      } catch {
        // Fallback copy
        navigator.clipboard.writeText(window.location.href);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-[#1a1410] border-2 border-[#d4af37]/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#120f0d]/80 text-[#f3e5ab] hover:bg-[#d4af37] hover:text-[#120f0d] border border-[#d4af37]/40 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Artwork Canvas */}
        <div className="lg:w-7/12 relative bg-[#100c09] flex items-center justify-center overflow-hidden min-h-[320px] lg:min-h-[540px]">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover max-h-[70vh] lg:max-h-[85vh] filter contrast-105"
          />

          {/* Golden Spiral / Proportion Grid Overlay */}
          {showGoldenSpiral && (
            <div className="absolute inset-0 bg-black/40 pointer-events-none flex items-center justify-center p-6 transition-all duration-300">
              <svg viewBox="0 0 500 600" className="w-full h-full text-[#f3e5ab] stroke-current stroke-[1.2] opacity-90">
                <rect x="25" y="25" width="450" height="550" fill="none" strokeDasharray="4 4" />
                <circle cx="250" cy="300" r="180" fill="none" />
                <line x1="25" y1="360" x2="475" y2="360" />
                <line x1="300" y1="25" x2="300" y2="575" />
                <path d="M 25 575 Q 25 360 300 360 Q 475 360 475 220 Q 475 25 250 25 Q 25 25 25 220" fill="none" />
                <circle cx="300" cy="360" r="8" fill="#d4af37" />
                <text x="315" y="355" fill="#f3e5ab" fontSize="14" fontFamily="Cinzel">GOLDEN RATIO Φ</text>
              </svg>
            </div>
          )}

          {/* Prev / Next Navigation overlay arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(prevItem);
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#120f0d]/75 text-[#f3e5ab] hover:bg-[#d4af37] hover:text-[#120f0d] border border-[#d4af37]/30 transition-all cursor-pointer"
            aria-label="Previous artwork"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(nextItem);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-[#120f0d]/75 text-[#f3e5ab] hover:bg-[#d4af37] hover:text-[#120f0d] border border-[#d4af37]/30 transition-all cursor-pointer"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Quick Overlay Switcher */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <span className="font-cinzel text-xs px-3 py-1 rounded-full bg-[#120f0d]/80 text-[#f3e5ab] border border-[#d4af37]/30">
              {item.category}
            </span>

            <button
              onClick={() => setShowGoldenSpiral(!showGoldenSpiral)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-cinzel tracking-wider border transition-all cursor-pointer ${
                showGoldenSpiral
                  ? 'bg-[#d4af37] text-[#120f0d] border-[#f3e5ab]'
                  : 'bg-[#120f0d]/80 text-[#f3e5ab] border-[#d4af37]/40 hover:bg-[#d4af37]/20'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showGoldenSpiral ? 'Hide Divine Ratio' : 'View Divine Ratio'}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Da Vinci Critical & Aesthetic Examination */}
        <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-parchment-texture">
          <div>
            <div className="flex items-center justify-between text-xs font-cinzel text-[#d4af37] uppercase tracking-wider mb-2">
              <span>{item.date}</span>
              <span className="bg-[#241a13] px-2.5 py-1 rounded-md border border-[#d4af37]/30">
                {item.goldenRatioRating}
              </span>
            </div>

            <h3 className="font-cinzel text-2xl font-bold text-[#fdf8f0]">
              {item.title}
            </h3>

            <p className="font-script text-2xl text-[#d4af37] mt-0.5 mb-4">
              Shubhashree Sahu
            </p>

            {/* Respectful Admiration Note */}
            <div className="space-y-3 font-cormorant text-base sm:text-lg text-[#dcd0c0] leading-relaxed mb-6">
              <p>{item.admirationNote}</p>
            </div>

            {/* Da Vinci Classical Annotation */}
            <div className="p-4 rounded-xl bg-[#140f0c] border border-[#d4af37]/30 relative mb-6">
              <Compass className="w-4 h-4 text-[#d4af37] mb-1" />
              <p className="font-cormorant text-sm sm:text-base italic text-[#f3e5ab]">
                {item.daVinciAnnotation}
              </p>
              <div className="mt-2 text-right font-cinzel text-[10px] text-[#8e7a68]">
                — Leonardo's Treatise on Human Proportion
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {item.tags.map(tag => (
                <span key={tag} className="font-cinzel text-[11px] px-2.5 py-0.5 rounded-full bg-[#251e18] text-[#c9b7a4] border border-[#3e3225]">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="pt-4 border-t border-[#3e3225] flex items-center justify-between gap-3">
            <button
              onClick={handleLike}
              className={`flex-1 py-2.5 px-4 rounded-xl font-cinzel text-xs tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLiked
                  ? 'bg-[#882d17] text-[#f7e7ce] border border-[#d4af37]/40'
                  : 'bg-[#261d16] text-[#f3e5ab] border border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-[#120f0d]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-[#f3e5ab]' : ''}`} />
              <span>{isLiked ? 'Admired' : 'Inscribe Praise'}</span>
              <span>({item.likes + (isLiked ? 1 : 0)})</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-[#261d16] text-[#d4af37] border border-[#d4af37]/40 hover:bg-[#d4af37]/20 transition-all cursor-pointer"
              title="Share Treatise"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
