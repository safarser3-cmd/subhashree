import React, { useState, useEffect } from 'react';
import { FanArtSubmission } from '../types';
import { X, Sparkles, Image, Video, Feather, CheckCircle2, Link, AlertCircle, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '../lib/firebase';

interface SubmitFanArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (art: FanArtSubmission) => void;
}

export const SubmitFanArtModal: React.FC<SubmitFanArtModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistHandle, setArtistHandle] = useState('');
  const [category, setCategory] = useState<FanArtSubmission['category']>('Digital Illustration');
  const [size, setSize] = useState<FanArtSubmission['size']>('9:16 (Mobile)');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [textEssay, setTextEssay] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSubmissionAt, setLastSubmissionAt] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const [user, loadingAuth] = useAuthState(auth);
  const [signInWithGoogle, , loadingGoogle] = useSignInWithGoogle(auth);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setError(null);

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artistName.trim()) return;
    if (Date.now() - lastSubmissionAt < 60000) {
      setError('Please wait one minute before submitting another artwork.');
      return;
    }
    if (imageUrl && !imageUrl.startsWith('https://')) {
      setError('Artwork images must use a public HTTPS URL from Cloudflare R2.');
      return;
    }
    if (imageUrl.length > 2048 || videoUrl.length > 2048) {
      setError('Media URLs must be 2048 characters or shorter.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newArt: FanArtSubmission = {
      id: `fanart-${Date.now()}`,
      title: title.trim(),
      artistName: artistName.trim(),
      artistHandle: artistHandle.trim() ? (artistHandle.startsWith('@') ? artistHandle : `@${artistHandle}`) : undefined,
      category,
      size: ['Poetry & Words'].includes(category) ? undefined : size, // only set size for visual arts
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl.trim() || undefined,
      textEssay: textEssay.trim() || undefined,
      description: description.trim() || 'A creative fan homage celebrating Shubhashree Sahu.',
      submittedAt: 'Just now',
      likes: 1,
      isFeatured: false
    };

    try {
      await onSubmit(newArt);
      setLastSubmissionAt(Date.now());
      setIsSubmitting(false);
      setIsSuccess(true);

      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#f59e0b', '#38bdf8']
      });

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset
        setTitle('');
        setArtistName('');
        setArtistHandle('');
        setSize('9:16 (Mobile)');
        setImageUrl('');
        setVideoUrl('');
        setTextEssay('');
        setDescription('');
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-xl w-full bg-[#13151c] rounded-3xl overflow-hidden border border-white/20 shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181a24]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-lg font-bold text-white">
                Submit Your Fan Art & Edits
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Share your artwork, edits, or poetry with the global fan community
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto">
          {!user ? (
            <div className="py-12 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <LogIn className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <h4 className="font-syne text-2xl font-bold text-white mb-2">
                  Sign In Required
                </h4>
                <p className="font-sans text-sm text-slate-300 mb-6">
                  Sign in with Google to submit post/artwork. This protects our community from spam.
                </p>
                <button
                  type="button"
                  onClick={() => signInWithGoogle()}
                  disabled={loadingAuth || loadingGoogle}
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-bold tracking-wide transition-all hover:scale-105 cursor-pointer flex items-center gap-2 border border-white/10 mx-auto"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{loadingAuth || loadingGoogle ? 'Connecting...' : 'Sign in with Google to Continue'}</span>
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-12 text-center space-y-3 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-rose-400 mx-auto animate-bounce" />
              <h4 className="font-syne text-2xl font-bold text-white">
                Artwork Published Successfully!
              </h4>
              <p className="font-sans text-sm text-slate-300">
                Your creation is now featured on the community fan art hub.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      'Digital Illustration',
                      'Pencil Sketch',
                      'Video Edit & Reel',
                      'Wallpaper & Graphic',
                      'Poetry & Words'
                    ] as FanArtSubmission['category'][]
                  ).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left truncate ${
                        category === cat
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              {category !== 'Poetry & Words' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Artwork Size / Orientation *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        '9:16 (Mobile)',
                        '16:9 (Desktop)',
                        '1:1 (Instagram)',
                        '4:5 (Portrait)'
                      ] as FanArtSubmission['size'][]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-left truncate ${
                          size === s
                            ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Artwork / Edit Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saree Glow in Sunset"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Name / Artist Alias *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Riya Verma"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Social Handle (Instagram / Twitter)
                </label>
                <input
                  type="text"
                  placeholder="e.g. @riya_designs"
                  value={artistHandle}
                  onChange={(e) => setArtistHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Image / Video / Poem input according to category */}
              {category === 'Poetry & Words' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Poem or Tribute Words *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your poetic tribute or inspiring words..."
                    value={textEssay}
                    onChange={(e) => setTextEssay(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              ) : category === 'Video Edit & Reel' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Video URL (YouTube / Instagram Reel Link)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Upload Image or Paste Image URL
                  </label>
                  <div>
                    <input
                      type="url"
                      placeholder="https://pub-...r2.dev/..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />

                  {imageUrl && (
                    <div className="mt-2 h-28 w-full rounded-xl overflow-hidden bg-black relative border border-white/10">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description / Story behind the creation
                </label>
                <textarea
                  rows={2}
                  placeholder="What inspired you to make this art piece or edit?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-sans font-bold text-sm tracking-wide shadow-xl shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish to Fan Hub'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
