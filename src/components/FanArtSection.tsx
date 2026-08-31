import React, { useState } from 'react';
import { FanArtSubmission } from '../types';
import { Palette, Heart, PlusCircle, Video, Feather, Sparkles, User, Share2, Check, ExternalLink, LogIn, Star, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';
import { approveFanArtInFirestore, featureFanArtInGallery, unfeatureFanArtFromGallery, deleteFanArtFromFirestore, rejectFanArtInFirestore } from '../lib/firestoreService';
import { useAdmin } from '../hooks/useAdmin';

interface FanArtSectionProps {
  fanArts: FanArtSubmission[];
  onOpenSubmitModal: () => void;
  onLikeArt: (id: string) => void;
  likedArtIds: Set<string>;
}

export const FanArtSection: React.FC<FanArtSectionProps> = ({
  fanArts,
  onOpenSubmitModal,
  onLikeArt,
  likedArtIds
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedArtId, setCopiedArtId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth hooks
  const [user, loading] = useAuthState(auth);
  const [signInWithGoogle, , loadingGoogle] = useSignInWithGoogle(auth);
  const [viewMode, setViewMode] = useState<'live' | 'pending'>('live');
  const [visibleCount, setVisibleCount] = useState(6);

  // Give the Firestore subscription time to provide the first result.
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'Digital Illustration', 'Pencil Sketch', 'Video Edit & Reel', 'Poetry & Words'];

  const isAdmin = useAdmin(user);
  
  // A fan art is approved if its status is 'approved' or if it was featured (legacy mapping)
  const isApproved = (art: FanArtSubmission) => art.status === 'approved' || (!art.status && art.isFeatured);
  const isPending = (art: FanArtSubmission) => art.status === 'pending' || (!art.status && !art.isFeatured);

  const pendingArts = fanArts.filter(isPending);
  const liveArts = fanArts.filter(isApproved);

  const activeArts = isAdmin && viewMode === 'pending' ? pendingArts : liveArts;

  const filteredArts = activeArts.filter(
    (art) => (selectedCategory === 'All' || art.category === selectedCategory)
  );

  const displayedArts = filteredArts.slice(0, visibleCount);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeArt(id);
    if (!likedArtIds.has(id)) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#fb7185', '#f59e0b']
      });
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.href);
    setCopiedArtId(id);
    setTimeout(() => setCopiedArtId(null), 2000);
  };

  const handleApprove = async (art: FanArtSubmission, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;

    try {
      let finalImageUrl = art.imageUrl;
      let finalVideoUrl = art.videoUrl;

      // If it's hosted on our Cloudflare Worker, move it to /approved/
      const token = await auth.currentUser?.getIdToken();
      const urlToMove = art.imageUrl || art.videoUrl;

      if (urlToMove && urlToMove.includes('/pending/')) {
        const storageKey = urlToMove.substring(urlToMove.indexOf('pending/'));
        
        if (storageKey) {
          const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://fanart-upload.safarser3.workers.dev';
          const cleanUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
          try {
            const res = await fetch(`${cleanUrl}/approve`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ storageKey })
            });

            if (res.ok) {
              const data = await res.json();
              if (art.imageUrl) finalImageUrl = data.url;
              if (art.videoUrl) finalVideoUrl = data.url;
            } else {
              console.error("Worker failed to move file to /approved/");
            }
          } catch (e) {
            console.error("Fetch to Worker /approve failed", e);
          }
        }
      }

      await approveFanArtInFirestore(art.id, finalImageUrl, finalVideoUrl);
    } catch (err) {
      console.error("Error approving artwork:", err);
    }
  };

  const handleFeature = async (art: FanArtSubmission, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    
    if (art.isFeatured) {
      if (window.confirm("Are you sure you want to remove this artwork from the Gallery?")) {
        try {
          await unfeatureFanArtFromGallery(art.id);
          alert("Artwork removed from the Gallery.");
        } catch (err) {
          console.error("Error unfeaturing artwork:", err);
          alert("Failed to unfeature artwork.");
        }
      }
      return;
    }

    try {
      await featureFanArtInGallery(art);
      alert("Successfully featured! It will now appear in the Gallery/Wallpaper section.");
    } catch (err) {
      console.error("Error featuring artwork:", err);
      alert("Failed to feature artwork.");
    }
  };

  const handleReject = async (art: FanArtSubmission, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to reject and delete this artwork?")) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      const urlToMove = art.imageUrl || art.videoUrl;

      // Delete from R2 (using reject route)
      if (urlToMove && (urlToMove.includes('/pending/') || urlToMove.includes('/approved/'))) {
        let storageKey = '';
        if (urlToMove.includes('/pending/')) storageKey = urlToMove.substring(urlToMove.indexOf('pending/'));
        if (urlToMove.includes('/approved/')) storageKey = urlToMove.substring(urlToMove.indexOf('approved/'));
        
        if (storageKey) {
          const workerUrl = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://fanart-upload.safarser3.workers.dev';
          const cleanUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
          try {
            await fetch(`${cleanUrl}/reject`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ storageKey })
            });
          } catch (e) {
            console.error("Failed to move to rejected in R2, but deleting from DB anyway.", e);
          }
        }
      }
      
      await rejectFanArtInFirestore(art.id);
    } catch (err) {
      console.error("Error rejecting artwork:", err);
    }
  };

  return (
    <section id="fanart" className="py-20 bg-[#0e1017] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Palette className="w-3.5 h-3.5" />
              <span>FAN ART & CREATIVE HUB</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Community Creations & Edits
            </h2>
            <p className="font-sans text-slate-400 text-base mt-2 max-w-xl">
              A dedicated showcase for digital illustrations, pencil sketches, cinematic video edits, and poetry created with love by fans worldwide.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <button
                id="fanart-section-submit-btn"
                onClick={onOpenSubmitModal}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-sans text-xs font-bold tracking-wide shadow-xl shadow-rose-500/25 transition-all hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Your Artwork / Edit</span>
              </button>
            ) : (
              <button
                id="fanart-section-login-btn"
                onClick={() => signInWithGoogle()}
                disabled={loading || loadingGoogle}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-bold tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center gap-2 border border-white/10"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading || loadingGoogle ? 'Connecting...' : 'Sign in with Google to Submit'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-105'
                  : 'glass-panel text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isAdmin && (
          <div className="flex justify-start mb-8">
            <div className="flex bg-black/40 p-1 rounded-full border border-white/10">
              <button
                onClick={() => setViewMode('live')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-colors ${
                  viewMode === 'live' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Live Feed
              </button>
              <button
                onClick={() => setViewMode('pending')}
                className={`px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-colors ${
                  viewMode === 'pending' ? 'bg-yellow-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending Approvals
                {pendingArts.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${viewMode === 'pending' ? 'bg-black text-yellow-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {pendingArts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fan Art Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-panel rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between h-[450px]">
                <div>
                  <div className="h-64 w-full bg-white/5 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-3/4 bg-white/10 animate-pulse rounded" />
                    <div className="h-3 w-full bg-white/5 animate-pulse rounded" />
                    <div className="h-3 w-5/6 bg-white/5 animate-pulse rounded" />
                  </div>
                </div>
                <div className="p-4 bg-[#13151c] border-t border-white/5 flex items-center justify-between h-[72px]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
                    <div>
                      <div className="h-3 w-20 bg-white/10 animate-pulse rounded mb-1" />
                      <div className="h-2 w-16 bg-white/5 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
                    <div className="w-14 h-8 rounded-xl bg-white/5 animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : displayedArts.length === 0 ? (
            <div className="col-span-full glass-panel rounded-3xl border border-white/10 p-12 text-center">
              <Palette className="mx-auto mb-4 h-10 w-10 text-rose-400" />
              <h3 className="font-syne text-xl font-bold text-white">No community creations yet</h3>
              <p className="mt-2 text-sm text-slate-400">Be the first fan to share an artwork, edit, or poem.</p>
            </div>
          ) : (
            displayedArts.map((art) => {
              const isLiked = likedArtIds.has(art.id);
              const totalLikes = art.likes;

              return (
              <div
                key={art.id}
                id={`fanart-card-${art.id}`}
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-rose-500/50 shadow-2xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Visual Image / Video / Poem Block */}
                <div>
                  {art.imageUrl ? (
                    <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={art.imageUrl.replace('/pending/', '/fanart/')}
                        alt={art.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {!art.isFeatured && isAdmin && (
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/90 backdrop-blur-md text-black shadow-md shadow-yellow-500/20 mb-1 animate-pulse">
                            PENDING APPROVAL
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-rose-300 border border-white/10">
                          {art.category}
                        </span>
                        {art.size && (
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 backdrop-blur-md text-slate-100 border border-white/10 shadow-md">
                            {art.size}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : art.category === 'Video Edit & Reel' ? (
                    <div className="h-56 bg-gradient-to-br from-rose-900/40 via-purple-900/40 to-black p-6 flex flex-col items-center justify-center text-center relative border-b border-white/5">
                      {!art.isFeatured && isAdmin && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/90 backdrop-blur-md text-black shadow-md shadow-yellow-500/20 animate-pulse">
                            PENDING APPROVAL
                          </span>
                        </div>
                      )}
                      <div className="w-14 h-14 rounded-full bg-rose-500/30 border border-rose-500 text-rose-300 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                        <Video className="w-7 h-7" />
                      </div>
                      <span className="font-syne text-sm font-bold text-white">
                        Cinematic 4K Fan Edit Reel
                      </span>
                      <span className="text-xs text-rose-300/80 mt-1">
                        High Energy Sound & Transitions
                      </span>
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-[#181924] to-[#11131a] p-6 flex flex-col justify-center relative border-b border-white/5 overflow-hidden">
                      {!art.isFeatured && isAdmin && (
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-yellow-500/90 backdrop-blur-md text-black shadow-md shadow-yellow-500/20 animate-pulse">
                            PENDING APPROVAL
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-2">
                        <Feather className="w-4 h-4" />
                        <span>Fan Tribute Poem</span>
                      </div>
                      <p className="font-sans text-xs italic text-slate-300 leading-relaxed line-clamp-4">
                        “{art.textEssay}”
                      </p>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-syne text-lg font-bold text-white group-hover:text-rose-400 transition-colors">
                      {art.title}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {art.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Artist Handle & Like Button */}
                <div className="p-4 bg-[#13151c] border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-syne text-xs font-bold text-slate-200 block">
                        {art.artistName}
                      </span>
                      {art.artistHandle && (
                        <span className="text-[10px] text-rose-400 font-sans">
                          {art.artistHandle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && viewMode === 'pending' && (
                      <>
                        <button
                          onClick={(e) => handleApprove(art, e)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
                          title="Approve Fan Art"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={(e) => handleReject(art, e)}
                          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Reject and Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    {isAdmin && viewMode === 'live' && (
                      <>
                        <button
                          onClick={(e) => handleFeature(art, e)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            art.isFeatured 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                          }`}
                          title={art.isFeatured ? "Unfeature from Gallery" : "Feature as Wallpaper"}
                        >
                          <Star className={`w-3.5 h-3.5 ${art.isFeatured ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          onClick={(e) => handleReject(art, e)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Delete Fan Art"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => handleShare(art.id, e)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Share artwork"
                    >
                      {copiedArtId === art.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => handleLike(art.id, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-white/5 hover:bg-rose-500 hover:text-white text-slate-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      <span>{totalLikes.toLocaleString()}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
          )}
        </div>

        {visibleCount < filteredArts.length && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/10"
            >
              Load More Artworks
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
