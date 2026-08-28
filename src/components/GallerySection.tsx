import React, { useState, useEffect, Suspense, lazy } from 'react';
import { GalleryItem, FanArtSubmission } from '../types';
import { 
  Image, 
  Heart, 
  Search, 
  Share2, 
  X, 
  Download, 
  Maximize2, 
  Check, 
  Smartphone, 
  Monitor, 
  Square, 
  Sparkles,
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { subscribeToGalleryItems, subscribeToFanArt } from '../lib/firestoreService';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

const AdminGalleryUpload = lazy(() => import('./AdminGalleryUpload'));

type ViewMode = 'all' | 'wallpapers' | 'photos';
type SizeFilter = 'all' | 'mobile' | 'desktop' | 'square';

export const GallerySection: React.FC = () => {
  const [user] = useAuthState(auth);
  
  const [baseItems, setBaseItems] = useState<GalleryItem[]>([]);
  const [featuredFanArts, setFeaturedFanArts] = useState<GalleryItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedSize, setSelectedSize] = useState<SizeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [previewDeviceMode, setPreviewDeviceMode] = useState<'fit' | 'phone' | 'desktop'>('fit');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const items = [...baseItems, ...featuredFanArts];

  // Subscribe to Firestore gallery items
  useEffect(() => {
    const unsubscribeGallery = subscribeToGalleryItems((fetchedItems) => {
      setBaseItems(fetchedItems);
      setIsLoading(false);
    });
    
    const unsubscribeFanArt = subscribeToFanArt((fetchedFanArts) => {
      const featured = fetchedFanArts
        .filter(art => art.isFeatured && (art.imageUrl || art.videoUrl))
        .map(art => {
          // Determine aspect ratio from size string if possible
          let aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | undefined;
          let orientation: 'mobile' | 'desktop' | 'square' | 'portrait' | undefined;
          
          if (art.size?.includes('9:16')) {
            aspectRatio = '9:16';
            orientation = 'mobile';
          } else if (art.size?.includes('16:9')) {
            aspectRatio = '16:9';
            orientation = 'desktop';
          } else if (art.size?.includes('1:1')) {
            aspectRatio = '1:1';
            orientation = 'square';
          } else if (art.size?.includes('4:5')) {
            aspectRatio = '4:5';
            orientation = 'portrait';
          }

          const galleryItem: GalleryItem = {
            id: `featured-${art.id}`,
            title: art.title,
            category: 'Featured Fan Art' as any, // Cast to any to bypass strict type check for categories
            imageUrl: art.imageUrl || art.videoUrl || '',
            date: art.submittedAt,
            aspectRatio,
            orientation,
            caption: `By ${art.artistName} - ${art.description}`,
            likes: art.likes,
            tags: ['Fan Art', 'Featured']
          };
          return galleryItem;
        });
      setFeaturedFanArts(featured);
    });

    return () => {
      unsubscribeGallery();
      unsubscribeFanArt();
    };
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

  const categories = ['All', 'Featured Fan Art'];

  const sizeOptions: Array<{ id: SizeFilter; label: string; icon: React.ReactNode; sub: string }> = [
    { id: 'all', label: 'All Sizes', icon: <Layers className="w-3.5 h-3.5" />, sub: 'Original Cuts' },
    { id: 'mobile', label: 'Mobile 9:16', icon: <Smartphone className="w-3.5 h-3.5" />, sub: 'Phone Lockscreen' },
    { id: 'desktop', label: 'Desktop 16:9', icon: <Monitor className="w-3.5 h-3.5" />, sub: '4K Widescreen' },
    { id: 'square', label: 'Square 1:1', icon: <Square className="w-3.5 h-3.5" />, sub: 'Avatars & DP' },
  ];

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

  const handleDownload = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const response = await fetch(item.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Shubhashree-${item.title.replace(/\s+/g, '-').toLowerCase()}-${item.orientation || 'wallpaper'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback if CORS blocks the fetch
      window.open(item.imageUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredItems = items.filter((item) => {
    // 1. View Mode (All vs Wallpaper vs Photos)
    if (viewMode === 'wallpapers' && item.orientation !== 'mobile' && item.orientation !== 'desktop') {
      return false;
    }

    // 2. Size/Orientation Filter
    if (selectedSize !== 'all') {
      const itemOrientation = item.orientation || (item.aspectRatio === '9:16' ? 'mobile' : item.aspectRatio === '16:9' ? 'desktop' : 'square');
      if (itemOrientation !== selectedSize) return false;
    }

    // 3. Category Filter
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    // 4. Search Query
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.resolution && item.resolution.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="gallery" className="py-20 bg-[#0b0c10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>ULTRA HD VISUAL HUB</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Gallery & Wallpapers
            </h2>
            <p className="font-sans text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Curated photoshoot captures and device-optimized wallpapers tailored for iPhone, Android lockscreens, and 4K desktop screens.
            </p>
          </div>

          {/* Right side controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {user?.email === 'safarser3@gmail.com' && (
              <Suspense fallback={<div className="w-8 h-8 rounded-full border-2 border-emerald-500/50 border-t-transparent animate-spin" />}>
                <AdminGalleryUpload />
              </Suspense>
            )}

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by resolution, look, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm font-sans text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="space-y-4 mb-10">
          {/* Top Bar: View Mode Switcher + Size Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md">
            
            {/* View Mode Pills (All / Wallpapers / Editorial Photos) */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Works
              </button>
              <button
                onClick={() => setViewMode('wallpapers')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'wallpapers'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Wallpapers Only</span>
              </button>
              <button
                onClick={() => setViewMode('photos')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'photos'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Editorial Lookbook</span>
              </button>
            </div>

            {/* Size & Orientation Filter Segment */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-rose-400" />
                <span>Size:</span>
              </span>
              {sizeOptions.map((opt) => {
                const isActive = selectedSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedSize(opt.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm shadow-rose-500/20'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className={isActive ? 'text-rose-400' : 'text-slate-400'}>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar: Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery & Wallpaper Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 flex flex-col h-[380px]">
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
          <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/10">
            <Image className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="font-syne text-lg font-bold text-white">No images match your active filters</h3>
            <p className="font-sans text-sm text-slate-400 mt-1">Try switching sizes or resetting category filters.</p>
            <button
              onClick={() => {
                setViewMode('all');
                setSelectedSize('all');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-full bg-rose-500 text-white text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isLiked = likedIds.has(item.id);
              const totalLikes = item.likes + (isLiked ? 1 : 0);
              const isMobile = item.orientation === 'mobile' || item.aspectRatio === '9:16';
              const isDesktop = item.orientation === 'desktop' || item.aspectRatio === '16:9';

              return (
                <div
                  key={item.id}
                  id={`gallery-item-${item.id}`}
                  onClick={() => {
                    setActiveItem(item);
                    setPreviewDeviceMode('fit');
                  }}
                  className="group relative rounded-3xl overflow-hidden bg-[#11131a]/80 border border-white/10 hover:border-rose-500/50 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Image Container with Natural Ratio Framing */}
                  <div className={`relative w-full overflow-hidden bg-slate-950 ${isMobile ? 'h-96' : isDesktop ? 'h-60' : 'h-72'}`}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Top Badges: Category & Size Tag */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-rose-300 border border-white/10">
                        {item.category}
                      </span>
                      {item.aspectRatio && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 backdrop-blur-md text-slate-200 border border-white/10 flex items-center gap-1">
                          {isMobile ? <Smartphone className="w-2.5 h-2.5 text-rose-400" /> : isDesktop ? <Monitor className="w-2.5 h-2.5 text-blue-400" /> : <Square className="w-2.5 h-2.5 text-amber-400" />}
                          <span>{item.aspectRatio}</span>
                        </span>
                      )}
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
                        onClick={(e) => handleDownload(item, e)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-rose-500 transition-all"
                        title="Download HD Wallpaper"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-white/20 transition-all"
                        title="Share link"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Resolution Watermark / Spec Badge at Bottom of Image */}
                    {item.resolution && (
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-mono font-medium tracking-tight text-white/90 bg-black/70 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                          {item.resolution}
                        </span>
                      </div>
                    )}

                    {/* Center Zoom Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-11 h-11 rounded-full bg-rose-500/90 backdrop-blur-md text-white flex items-center justify-center shadow-lg">
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

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
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

        {/* Fullscreen HD Lightbox & Device Wallpaper Preview Modal */}
        {activeItem && (
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in"
            onClick={() => setActiveItem(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-[#11131a] rounded-3xl overflow-hidden border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lightbox Image Left / Device Preview Stage */}
              <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-[340px] md:min-h-[480px] p-4 overflow-hidden">
                
                {/* Mode: Phone Frame Preview */}
                {previewDeviceMode === 'phone' ? (
                  <div className="relative w-64 h-[420px] rounded-[38px] border-4 border-slate-700 overflow-hidden shadow-2xl bg-black">
                    {/* Simulated Notch / Dynamic Island */}
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-20 border border-white/10" />
                    
                    {/* Wallpaper Artwork */}
                    <img
                      src={activeItem.imageUrl}
                      alt={activeItem.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Simulated Lockscreen Clock */}
                    <div className="absolute top-12 left-0 right-0 text-center text-white z-10 drop-shadow-md">
                      <p className="text-4xl font-light tracking-tight font-sans">09:41</p>
                      <p className="text-xs font-medium text-white/80 mt-0.5">Friday, August 28</p>
                    </div>
                  </div>
                ) : previewDeviceMode === 'desktop' ? (
                  /* Mode: Desktop Frame Preview */
                  <div className="relative w-full max-w-[420px] aspect-video rounded-xl border-4 border-slate-700 overflow-hidden shadow-2xl bg-black">
                    <img
                      src={activeItem.imageUrl}
                      alt={activeItem.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Simulated Taskbar */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/60 backdrop-blur-md border-t border-white/10 flex items-center px-2 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded bg-white/40" />
                      <div className="w-2.5 h-2.5 rounded bg-white/40" />
                    </div>
                  </div>
                ) : (
                  /* Mode: Full Clean Fit Artwork */
                  <img
                    src={activeItem.imageUrl}
                    alt={activeItem.title}
                    className="w-full h-full object-contain max-h-[72vh]"
                  />
                )}

                {/* Device Preview Toggle Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/15">
                  <button
                    onClick={() => setPreviewDeviceMode('fit')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      previewDeviceMode === 'fit' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Fit View
                  </button>
                  <button
                    onClick={() => setPreviewDeviceMode('phone')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      previewDeviceMode === 'phone' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Phone Mockup</span>
                  </button>
                  <button
                    onClick={() => setPreviewDeviceMode('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      previewDeviceMode === 'desktop' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3 h-3" />
                    <span>Desktop Mockup</span>
                  </button>
                </div>
              </div>

              {/* Lightbox Details Right */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {activeItem.category}
                    </span>
                    {activeItem.aspectRatio && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/10 text-slate-300">
                        {activeItem.aspectRatio}
                      </span>
                    )}
                  </div>

                  <h3 className="font-syne text-xl sm:text-2xl font-bold text-white leading-snug">
                    {activeItem.title}
                  </h3>

                  {activeItem.caption && (
                    <p className="font-sans text-xs text-slate-300 leading-relaxed">
                      {activeItem.caption}
                    </p>
                  )}

                  {/* Resolution & Specs Grid */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Resolution Spec:</span>
                      <span className="font-semibold font-mono text-rose-300">{activeItem.resolution || 'Original 4K Quality'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Date Captured:</span>
                      <span className="font-semibold text-white">{activeItem.date}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Total Community Likes:</span>
                      <div className="flex items-center gap-1 font-bold text-rose-400">
                        <Heart className="w-3.5 h-3.5 fill-rose-400" />
                        <span>{(activeItem.likes + (likedIds.has(activeItem.id) ? 1 : 0)).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Download & Like */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={(e) => handleDownload(activeItem, e)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Wallpaper ({activeItem.aspectRatio || 'Original HD'})</span>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleLike(activeItem.id)}
                      className={`flex-1 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        likedIds.has(activeItem.id)
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-white/10 hover:bg-rose-500 hover:text-white text-slate-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedIds.has(activeItem.id) ? 'fill-white' : ''}`} />
                      <span>{likedIds.has(activeItem.id) ? 'Liked' : 'Like'}</span>
                    </button>

                    <button
                      onClick={() => handleShare(activeItem)}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedId === activeItem.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
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

