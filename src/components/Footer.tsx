import React, { useState } from 'react';
import { Sparkles, Heart, ArrowUp, Instagram, Youtube, Twitter, Send, Check, Share2, Copy } from 'lucide-react';
import { INFLUENCER_PROFILE } from '../data/shubhashreeData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setSubscribed(false);
    }, 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent('Check out the official Shubhashree Sahu Fan Portal! ✨💖');
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <footer className="bg-[#07080b] border-t border-white/10 pt-16 pb-12 text-slate-400 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0b0c10] flex items-center justify-center">
                  <span className="font-syne font-bold text-sm text-rose-400">SS</span>
                </div>
              </div>
              <div>
                <span className="font-syne text-lg font-bold text-white block">
                  SHUBHASHREE SAHU
                </span>
                <span className="text-xs text-rose-400 font-sans">
                  Community Portal
                </span>
              </div>
            </div>

            <p className="font-sans text-sm text-slate-400 leading-relaxed max-w-sm">
              A community hub for all the latest updates, HD photos, and a place to connect with other supporters of Shubhashree.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={INFLUENCER_PROFILE.platforms.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={INFLUENCER_PROFILE.platforms.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href={INFLUENCER_PROFILE.platforms.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>

              <div className="h-5 w-[1px] bg-white/10 mx-1" />

              <button
                onClick={handleTwitterShare}
                className="px-3.5 h-9 rounded-xl bg-sky-500/10 hover:bg-sky-500 hover:text-white border border-sky-500/30 text-sky-300 text-xs font-syne font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Share on Twitter / X"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Portal</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3.5 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-syne font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copy Portal Link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Home Spotlight
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  About Shubhashree
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('gallery')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  HD Photo Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('social')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Live Social Media Stream
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fanart')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Fan Art & Video Edits Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('fanwall')}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Fan Wall & Wishes
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter / Fan Alerts (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-syne text-xs font-bold uppercase tracking-wider text-white">
              Alerts & Updates
            </h4>
            <p className="font-sans text-xs text-slate-400">
              Get notified when new lookbooks, YouTube vlogs, or community giveaways drop.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>You are on the VIP Fan List!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Join
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Massive Brand Text - Like Datawizz Reference */}
        <div className="py-10 sm:py-16 flex justify-center items-center w-full border-b border-white/5">
          <span className="font-urbanist font-black text-[22vw] leading-none text-white tracking-tighter select-none drop-shadow-2xl">
            SUBU
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Built with ❤️ in Bangalore.
          </div>

          <div className="flex items-center gap-6">
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">Privacy Policy</a>
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors">Terms of Service</a>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/10"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
