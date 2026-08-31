import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image, Heart, Share2, Menu, X, PlusCircle, Instagram, Youtube, Twitter, LogOut, LogIn, UserCircle2, LayoutDashboard } from 'lucide-react';
import { useCurrentUser } from '../lib/authContext';
import { signInWithGoogle, signInAsGuest, signOutCurrentUser } from '../lib/authService';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onOpenSubmitModal: () => void;
  onOpenMyUploads: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  onOpenSubmitModal,
  onOpenMyUploads
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showGlobalGuestPrompt, setShowGlobalGuestPrompt] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [globalAuthError, setGlobalAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, ready } = useCurrentUser();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [userMenuOpen]);

  const handleGlobalGoogleSignIn = async () => {
    setGlobalAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithGoogle();
      setUserMenuOpen(false);
    } catch (e: any) {
      setGlobalAuthError(e?.message || 'Google sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGlobalGuestSignIn = async () => {
    setGlobalAuthError(null);
    const name = guestName.trim();
    if (!name) {
      setGlobalAuthError('Please enter a display name to continue as guest.');
      return;
    }
    setAuthBusy(true);
    try {
      await signInAsGuest(name);
      setShowGlobalGuestPrompt(false);
      setGuestName('');
      setUserMenuOpen(false);
    } catch (e: any) {
      setGlobalAuthError(e?.message || 'Guest sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGlobalSignOut = async () => {
    try {
      await signOutCurrentUser();
      setUserMenuOpen(false);
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0c0d14]/40 backdrop-blur-2xl backdrop-saturate-180 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
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

            {/* Auth chip / Sign-in dropdown */}
            <div className="relative" ref={userMenuRef}>
              {!ready ? (
                <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
              ) : user ? (
                <button
                  id="navbar-user-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  title={user.displayName || 'Account'}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'avatar'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                      {(user.displayName || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-[11px] font-semibold text-slate-200 max-w-[120px] truncate">
                    {user.displayName || 'Fan'}
                  </span>
                </button>
              ) : (
                <button
                  id="navbar-signin-btn"
                  onClick={() => {
                    setUserMenuOpen((v) => !v);
                    setGlobalAuthError(null);
                    setShowGlobalGuestPrompt(false);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold tracking-wide transition flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#13151c] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 animate-fade-in">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-2">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'avatar'}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold">
                            {(user.displayName || 'A').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">
                            {user.displayName || 'Anonymous Fan'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.isAnonymous ? 'Guest' : user.email || 'Google account'}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-white/10 my-2" />
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenMyUploads();
                        }}
                        className="w-full text-left text-xs text-slate-200 hover:bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Uploads
                      </button>
                      <button
                        onClick={handleGlobalSignOut}
                        className="w-full text-left text-xs text-rose-300 hover:bg-white/5 rounded-xl px-3 py-2 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-400 px-1">
                        Sign in to post on the Fan Wall and submit Fan Art.
                      </p>
                      <button
                        onClick={handleGlobalGoogleSignIn}
                        disabled={authBusy}
                        className="w-full px-3 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-60"
                      >
                        <LogIn className="w-4 h-4" />
                        {authBusy ? 'Connecting…' : 'Continue with Google'}
                      </button>
                      <button
                        onClick={() => {
                          setShowGlobalGuestPrompt((v) => !v);
                          setGlobalAuthError(null);
                        }}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <UserCircle2 className="w-4 h-4" />
                        Continue as Guest
                      </button>
                      {showGlobalGuestPrompt && (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            maxLength={32}
                            placeholder="Display name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                          <button
                            onClick={handleGlobalGuestSignIn}
                            disabled={authBusy}
                            className="w-full px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs disabled:opacity-60"
                          >
                            {authBusy ? 'Signing in…' : 'Continue as Guest'}
                          </button>
                        </div>
                      )}
                      {globalAuthError && (
                        <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/40 text-[11px] text-rose-200">
                          {globalAuthError}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
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
        <div className="lg:hidden bg-[#0c0d14]/75 backdrop-blur-2xl backdrop-saturate-180 border-b border-white/[0.08] px-4 pt-2 pb-6 space-y-2 animate-fade-in">
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

          {user ? (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyUploads();
                }}
                className="w-full mt-3 text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/10 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" /> My Uploads
              </button>
              <button
                onClick={handleGlobalSignOut}
                className="w-full mt-2 text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-white/10 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign out ({user.displayName || 'Fan'})
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setUserMenuOpen(true);
                setShowGlobalGuestPrompt(false);
              }}
              className="w-full mt-3 text-left px-4 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 text-white shadow-md flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
};
