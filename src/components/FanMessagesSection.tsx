import React, { useState, useEffect } from 'react';
import { FanMessage } from '../types';
import {
  Heart,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  LogIn,
  UserCircle2,
  LogOut,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  subscribeToFanMessages,
  addFanMessageToFirestore,
  likeFanMessageInFirestore,
  subscribeToLoveCount,
  incrementLoveCountInFirestore,
} from '../lib/firestoreService';
import {
  watchAuth,
  signInWithGoogle,
  signInAsGuest,
  signOutCurrentUser,
  AppUser,
} from '../lib/authService';
import { useCurrentUser } from '../lib/authContext';
import { moderateMessage, ModerationResult } from '../lib/moderation';

const MAX_MESSAGE_LENGTH = 500;

type UiState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'success' }
  | { kind: 'rejected'; reason: string };

export const FanMessagesSection: React.FC = () => {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [loveCount, setLoveCount] = useState<number>(18450);
  const [hasSentLove, setHasSentLove] = useState(false);
  const { user: currentUser, ready: authReady } = useCurrentUser();

  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [uiState, setUiState] = useState<UiState>({ kind: 'idle' });

  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [likedMsgIds, setLikedMsgIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_msg_likes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Firestore subscriptions
  useEffect(() => {
    const unsubscribeMsgs = subscribeToFanMessages((fetchedMsgs) => {
      setMessages(fetchedMsgs);
    });
    const unsubscribeLove = subscribeToLoveCount((count) => {
      setLoveCount(count);
    });
    return () => {
      unsubscribeMsgs();
      unsubscribeLove();
    };
  }, []);

  // Pre-fill sender name from auth profile when user signs in
  useEffect(() => {
    if (currentUser?.displayName) {
      setSenderName((prev) => prev || currentUser.displayName || '');
    }
  }, [currentUser]);

  // Reset success state after a delay
  useEffect(() => {
    if (uiState.kind === 'success') {
      const t = setTimeout(() => setUiState({ kind: 'idle' }), 4000);
      return () => clearTimeout(t);
    }
  }, [uiState]);

  const handleSendLove = () => {
    if (!hasSentLove) {
      incrementLoveCountInFirestore();
      setHasSentLove(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#38bdf8'],
      });
    }
  };

  const handleLikeMessage = (id: string, currentLikes: number) => {
    setLikedMsgIds((prev) => {
      const next = new Set(prev);
      const isAlreadyLiked = next.has(id);
      if (isAlreadyLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      likeFanMessageInFirestore(id, currentLikes + (isAlreadyLiked ? -1 : 1));
      try {
        localStorage.setItem('shubhashree_msg_likes', JSON.stringify(Array.from(next)));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthBusy(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      setAuthError(e?.message || 'Google sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthError(null);
    const name = guestNameInput.trim();
    if (!name) {
      setAuthError('Please enter a display name to continue as guest.');
      return;
    }
    setAuthBusy(true);
    try {
      await signInAsGuest(name);
      setShowGuestPrompt(false);
      setGuestNameInput('');
    } catch (e: any) {
      console.error(e);
      setAuthError(e?.message || 'Guest sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutCurrentUser();
      setMessage('');
      setSenderName('');
      setUiState({ kind: 'idle' });
    } catch (e) {
      console.error('Sign out failed', e);
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const finalName = senderName.trim() || currentUser.displayName || 'Anonymous Fan';
    const finalMessage = message.trim();
    if (!finalMessage) return;

    setUiState({ kind: 'checking' });

    const isAnon = currentUser.isAnonymous;
    const newMsg = {
      userId: currentUser.uid,
      senderName: finalName,
      photoURL: currentUser.photoURL || null,
      isAnonymous: isAnon,
      message: finalMessage,
      createdAt: new Date().toISOString(),
      likes: 0,
    };

    try {
      await addFanMessageToFirestore(newMsg);
      setUiState({ kind: 'success' });
      setMessage('');
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b'],
      });
    } catch (err: any) {
      console.error('Failed to post message', err);
      setUiState({
        kind: 'rejected',
        reason: err.message || 'Could not save your message right now. Please try again in a moment.',
      });
    }
  };

  const charLeft = MAX_MESSAGE_LENGTH - message.length;
  const isChecking = uiState.kind === 'checking';
  const isSuccess = uiState.kind === 'success';
  const isRejected = uiState.kind === 'rejected';

  const formatRelativeTime = (iso: string) => {
    if (!iso) return 'Just now';
    const created = new Date(iso).getTime();
    if (Number.isNaN(created)) return 'Just now';
    const diffSec = Math.floor((Date.now() - created) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  return (
    <section id="fanwall" className="py-20 bg-[#0b0c10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Heart className="w-3.5 h-3.5" />
            <span>FAN WALL OF LOVE & BLESSINGS</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Leave Your Heartfelt Message
          </h2>
          <p className="font-sans text-base sm:text-lg text-slate-400 mt-3 leading-relaxed">
            Send your supportive words, styling compliments, and love to Shubhashree on our live community wall.
          </p>
        </div>

        {/* Live Fan Love Counter Banner */}
        <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#171924] via-[#1d1420] to-[#171924] border border-rose-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shrink-0">
              <Heart className={`w-8 h-8 ${hasSentLove ? 'fill-rose-500 animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="font-syne text-xl font-bold text-white">The Community Love Meter</h3>
              <p className="font-sans text-xs sm:text-sm text-slate-300">
                Tap to send instant positive vibes & hearts to Shubhashree!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <span className="text-[11px] font-sans text-slate-400 font-bold uppercase tracking-wider block">
                HEARTS SENT
              </span>
              <span className="font-syne text-2xl font-extrabold text-white">
                {loveCount.toLocaleString()}
              </span>
            </div>

            <button
              id="send-love-btn"
              onClick={handleSendLove}
              className={`px-6 py-3.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                hasSentLove
                  ? 'bg-rose-600 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white hover:scale-105 shadow-rose-500/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasSentLove ? 'fill-white' : ''}`} />
              <span>{hasSentLove ? 'Love Sent' : 'Send Instant Love'}</span>
            </button>
          </div>
        </div>

        {/* Split Grid: Form & Wall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Message Posting Form / Auth Gate */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Post on Fan Wall</span>
            </div>
            <h3 className="font-syne text-xl font-bold text-white mb-4">Write Your Message</h3>

            {!authReady ? (
              <div className="py-10 text-center text-slate-400 text-sm">Loading…</div>
            ) : !currentUser ? (
              /* ===== NOT SIGNED IN ===== */
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Sign in to share your message on the wall. We keep the community respectful and safe.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authBusy}
                  className="w-full py-3 rounded-2xl bg-white text-slate-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowGuestPrompt(true);
                    setAuthError(null);
                  }}
                  disabled={authBusy}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition disabled:opacity-60"
                >
                  <UserCircle2 className="w-4 h-4" />
                  Continue as Guest
                </button>

                {showGuestPrompt && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <label className="block text-xs font-bold text-slate-300">
                      Pick a display name
                    </label>
                    <input
                      type="text"
                      maxLength={32}
                      placeholder="e.g. PoojaFromBhubaneswar"
                      value={guestNameInput}
                      onChange={(e) => setGuestNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGuestSignIn}
                        disabled={authBusy}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs tracking-wider disabled:opacity-60"
                      >
                        {authBusy ? 'Signing in…' : 'Continue as Guest'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGuestPrompt(false)}
                        className="px-3 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200">
                    {authError}
                  </div>
                )}

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We never post on your behalf. Google users get a verified profile; guest users post with
                  the display name they choose.
                </p>
              </div>
            ) : (
              /* ===== SIGNED IN: FORM ===== */
              <div className="space-y-4">
                {/* Current user chip */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'avatar'}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                        {(currentUser.displayName || 'A').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {currentUser.displayName || 'Anonymous Fan'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {currentUser.isAnonymous ? 'Posting as Guest' : 'Signed in with Google'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-slate-400 hover:text-rose-300 p-2 rounded-lg hover:bg-white/5"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {isSuccess ? (
                  <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-rose-400 mx-auto" />
                    <h4 className="font-syne text-base font-bold text-white">
                      Message Posted on the Wall!
                    </h4>
                    <p className="font-sans text-xs text-slate-300">
                      Thank you for being such an awesome part of our community.
                    </p>
                  </div>
                ) : isRejected ? (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-center space-y-2">
                    <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
                    <h4 className="font-syne text-base font-bold text-white">Message Rejected</h4>
                    <p className="font-sans text-xs text-rose-200 leading-relaxed">
                      {(uiState as { kind: 'rejected'; reason: string }).reason}
                    </p>
                    <button
                      type="button"
                      onClick={() => setUiState({ kind: 'idle' })}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitMessage} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={40}
                        placeholder="Your display name"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Your Message</span>
                        <span
                          className={`text-[10px] font-sans ${
                            charLeft < 50 ? 'text-rose-400' : 'text-slate-500'
                          }`}
                        >
                          {charLeft} left
                        </span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        maxLength={MAX_MESSAGE_LENGTH}
                        placeholder="Express your admiration for her fashion looks, kind smile, and vlogs..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChecking || !message.trim()}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-sans font-bold text-xs tracking-wider shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isChecking ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          <span>Checking your message…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Post Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right: Live Messages Stream */}
          <div className="lg:col-span-7 space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-slate-400 text-sm">
                No messages yet. Be the first to share something kind!
              </div>
            ) : (
              messages.map((msg) => {
                const isLiked = likedMsgIds.has(msg.id);
                const displayName = msg.isAnonymous ? 'Anonymous Fan' : msg.senderName;

                return (
                  <div
                    key={msg.id}
                    id={`fan-message-${msg.id}`}
                    className="glass-panel rounded-2xl border border-white/10 hover:border-rose-500/40 p-5 shadow-xl transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {msg.photoURL && !msg.isAnonymous ? (
                          <img
                            src={msg.photoURL}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-syne font-bold text-sm shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-syne text-sm font-bold text-white truncate max-w-[200px]">
                              {displayName}
                            </h4>
                            {msg.isAnonymous && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans mt-0.5">
                            <span>{formatRelativeTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLikeMessage(msg.id, msg.likes)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                          isLiked
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                        <span>{msg.likes}</span>
                      </button>
                    </div>

                    <p className="font-sans text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words">
                      “{msg.message}”
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
