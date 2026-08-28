import React, { useState, useEffect } from 'react';
import { GalleryItem } from '../types';
import { Image, Heart, Search, Filter, Share2, X, Download, Tag, Maximize2, Check } from 'lucide-react';
import { subscribeToGalleryItems } from '../lib/firestoreService';

export const GallerySection: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to Firestore gallery items
  useEffect(() => {
    const unsubscribe = subscribeToGalleryItems((fetchedItems) => {
      setItems(fetchedItems);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (!activeItem) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem]);

  // Local likes state
  const [likedIds, setLikedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_gallery_likes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const categories = ['All', 'Traditional Sarees', 'Photoshoots', 'Casual & Travel', 'Red Carpet & Events', 'Portraits'];

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('shubhashree_gallery_likes', JSON.stringify(Array.from(next)));
      } catch {
        // Fallback
      }
      return next;
    });
  };

  const handleShare = (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="gallery" className="py-20 bg-[#0b0c10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Image className="w-3.5 h-3.5" />
              <span>EXCLUSIVE HD GALLERY</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Curated Visual Lookbook
            </h2>
            <p className="font-sans text-slate-400 text-base mt-2 max-w-xl">
              High-resolution captures celebrating Shubhashree’s style versatility, festive saree drapes, and candid radiance.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by look, tag, saree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-panel border border-white/10 text-sm font-sans text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-105'
                  : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-3xl overflow-hidden glass-panel border border-white/10 flex flex-col h-[350px]">
                <div className="h-72 w-full bg-white/5 animate-pulse" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="h-4 w-3/4 bg-white/10 animate-pulse rounded mb-2" />
                    <div className="h-3 w-1/2 bg-white/5 animate-pulse rounded" />
                  </div>
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="h-3 w-16 bg-white/5 animate-pulse rounded" />
                    <div className="h-3 w-12 bg-white/5 animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/10">
            <Image className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-syne text-lg font-bold text-white">No photos matched your search</h3>
            <p className="font-sans text-sm text-slate-400 mt-1">Try another keyword or category filter.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isLiked = likedIds.has(item.id);
              const totalLikes = item.likes + (isLiked ? 1 : 0);
              const isR2Rotated = item.imageUrl.includes('hero') || item.imageUrl.includes('Subhashree%20home%20page');

              return (
                <div
                  key={item.id}
                  id={`gallery-item-${item.id}`}
                  onClick={() => setActiveItem(item)}
                  className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 hover:border-rose-500/50 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative h-72 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ${
                        isR2Rotated ? 'rotate-90 scale-[1.35] group-hover:scale-[1.45]' : ''
                      }`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-rose-300 border border-white/10">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => toggleLike(item.id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-all ${
                          isLiked ? 'bg-rose-500 text-white' : 'bg-black/60 text-white hover:bg-rose-500'
                        }`}
                        title="Like Photo"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white/20 transition-all"
                        title="Share link"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Center Zoom Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-rose-500/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-syne text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="font-sans text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.date}</span>
                      <div className="flex items-center gap-1 text-rose-400 font-bold">
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-400' : ''}`} />
                        <span>{totalLikes.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fullscreen HD Lightbox Modal */}
        {activeItem && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-[#11131a] rounded-3xl overflow-hidden border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col md:flex-row max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lightbox Image Left */}
              <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[440px] overflow-hidden">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-contain max-h-[70vh]"
                />
              </div>

              {/* Lightbox Details Right - Clean Minimalist (Date & Likes Only) */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {activeItem.category}
                  </div>

                  <h3 className="font-syne text-xl sm:text-2xl font-bold text-white leading-snug">
                    {activeItem.title}
                  </h3>

                  {/* Clean Date & Likes Info Strip */}
                  <div className="pt-3 pb-3 border-y border-white/10 flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">Captured on:</span>
                    <span className="font-semibold text-white">{activeItem.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="text-slate-400">Total Appreciation:</span>
                    <div className="flex items-center gap-1.5 font-bold text-rose-400">
                      <Heart className="w-4 h-4 fill-rose-400" />
                      <span>{(activeItem.likes + (likedIds.has(activeItem.id) ? 1 : 0)).toLocaleString()} Likes</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="space-y-3 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(activeItem.id)}
                      className={`flex-1 py-3 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        likedIds.has(activeItem.id)
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-white/10 hover:bg-rose-500 hover:text-white text-slate-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedIds.has(activeItem.id) ? 'fill-white' : ''}`} />
                      <span>
                        {likedIds.has(activeItem.id) ? 'Liked' : 'Like Photo'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleShare(activeItem)}
                      className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedId === activeItem.id ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {copiedId === activeItem.id && (
                    <p className="text-center text-xs text-emerald-400 font-semibold animate-fade-in">
                      Link copied to clipboard!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
