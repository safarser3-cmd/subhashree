import React, { useState } from 'react';
import { Sparkles, Image, Heart, Share2, Menu, X, PlusCircle, Instagram, Youtube, Twitter } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenSubmitModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenSubmitModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Photo Gallery' },
    { id: 'social', label: 'Social Feed' },
    { id: 'fanart', label: 'Fan Art Hub' },
    { id: 'fanwall', label: 'Fan Wall' }
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <img
                id="nav-brand-logo-img"
                src="/assets/avatar.jpg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://iili.io/CmQCdAl.jpg';
                }}
                alt="Shubhashree Sahu"
                className="w-full h-full rounded-full object-cover object-center"
              />
            </div>
            <div>
              <div className="font-syne text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>SHUBHASHREE SAHU</span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-sans text-rose-300/80 font-medium tracking-wide">
                Official Fan Club & Community
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Social Quick Links */}
            <div className="flex items-center gap-1.5 pr-2 border-r border-white/10 text-slate-400">
              <a
                href="https://instagram.com/subhaslyf"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-pink-400 hover:bg-white/5 transition-colors"
                title="Instagram (@subhaslyf)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@subhaback"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-red-400 hover:bg-white/5 transition-colors"
                title="YouTube (@subhaback)"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/againsubha"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:text-sky-400 hover:bg-white/5 transition-colors"
                title="X / Twitter (@againsubha)"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Submit Fan Art Button */}
            <button
              id="navbar-submit-fanart-btn"
              onClick={onOpenSubmitModal}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-sans text-xs font-bold tracking-wide shadow-lg shadow-rose-500/25 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Fan Art</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="navbar-submit-fanart-btn-mobile"
              onClick={onOpenSubmitModal}
              className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-xs font-bold sm:hidden flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit</span>
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Follow Shubhashree:</span>
            <div className="flex items-center gap-3 text-slate-300">
              <a href="https://instagram.com/subhaslyf" target="_blank" rel="noreferrer" className="hover:text-pink-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@subhaback" target="_blank" rel="noreferrer" className="hover:text-red-400">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://x.com/againsubha" target="_blank" rel="noreferrer" className="hover:text-sky-400">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
