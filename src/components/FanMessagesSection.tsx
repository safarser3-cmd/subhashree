import React, { useState, useEffect } from 'react';
import { FanMessage } from '../types';
import { Heart, Send, Sparkles, MapPin, Award, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  subscribeToFanMessages, 
  addFanMessageToFirestore, 
  likeFanMessageInFirestore, 
  subscribeToLoveCount, 
  incrementLoveCountInFirestore 
} from '../lib/firestoreService';

export const FanMessagesSection: React.FC = () => {
  const [messages, setMessages] = useState<FanMessage[]>([]);
  const [loveCount, setLoveCount] = useState<number>(18450);
  const [hasSentLove, setHasSentLove] = useState(false);

  // Subscribe to Firestore fan messages & love count in real-time
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

  // Form State
  const [senderName, setSenderName] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [badge, setBadge] = useState<FanMessage['badge']>('Superfan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [likedMsgIds, setLikedMsgIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_msg_likes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const badgesList: Array<{ label: FanMessage['badge']; color: string }> = [
    { label: 'Superfan', color: '#f43f5e' },
    { label: 'VIP Fan', color: '#ec4899' },
    { label: 'Devoted Supporter', color: '#8b5cf6' },
    { label: 'Art Enthusiast', color: '#f59e0b' },
    { label: 'Style Lover', color: '#06b6d4' }
  ];

  const handleSendLove = () => {
    if (!hasSentLove) {
      incrementLoveCountInFirestore();
      setHasSentLove(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#38bdf8']
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
        // Fallback
      }

      return next;
    });
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !message.trim()) return;

    setIsSubmitting(true);

    const badgeColors: Record<string, string> = {
      Superfan: '#f43f5e',
      'VIP Fan': '#ec4899',
      'Devoted Supporter': '#8b5cf6',
      'Art Enthusiast': '#f59e0b',
      'Style Lover': '#06b6d4'
    };

    const newMsg = {
      senderName: senderName.trim(),
      location: location.trim() || 'Global Fan Family',
      message: message.trim(),
      badge,
      avatarColor: badgeColors[badge] || '#f43f5e',
      createdAt: 'Just now',
      likes: 1
    };

    await addFanMessageToFirestore(newMsg);

    setIsSubmitting(false);
    setShowSuccess(true);

    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#ec4899', '#f59e0b']
    });

    setSenderName('');
    setLocation('');
    setMessage('');

    setTimeout(() => setShowSuccess(false), 3000);
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
              <h3 className="font-syne text-xl font-bold text-white">
                The Community Love Meter
              </h3>
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
              <span>{hasSentLove ? 'Love Sent ❤️' : 'Send Instant Love'}</span>
            </button>
          </div>
        </div>

        {/* Split Grid: Form & Wall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Message Posting Form */}
          <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Post on Fan Wall</span>
            </div>
            <h3 className="font-syne text-xl font-bold text-white mb-4">
              Write Your Message
            </h3>

            {showSuccess ? (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="font-syne text-base font-bold text-white">
                  Message Posted on the Wall!
                </h4>
                <p className="font-sans text-xs text-slate-300">
                  Thank you for being such an awesome part of our community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Name / Fan Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pooja & Kolkata Fan Club"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your City / Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bhubaneswar, Odisha or Toronto, Canada"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Select Your Fan Badge
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {badgesList.map((b) => (
                      <button
                        key={b.label}
                        type="button"
                        onClick={() => setBadge(b.label)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          badge === b.label
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Your Message / Compliment *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Express your admiration for her fashion looks, kind smile, positivity, and vlogs..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-sans font-bold text-xs tracking-wider shadow-lg shadow-rose-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Posting...' : 'Post Message to Fan Wall'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Live Messages Stream */}
          <div className="lg:col-span-7 space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {messages.map((msg) => {
              const isLiked = likedMsgIds.has(msg.id);

              return (
                <div
                  key={msg.id}
                  id={`fan-message-${msg.id}`}
                  className="glass-panel rounded-2xl border border-white/10 hover:border-rose-500/40 p-5 shadow-xl transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-syne font-bold text-sm shadow-md"
                        style={{ backgroundColor: msg.avatarColor || '#f43f5e' }}
                      >
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-syne text-sm font-bold text-white">
                            {msg.senderName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-rose-300">
                            {msg.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans mt-0.5">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{msg.location}</span>
                          <span>•</span>
                          <span>{msg.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLikeMessage(msg.id, msg.likes)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      <span>{msg.likes}</span>
                    </button>
                  </div>

                  <p className="font-sans text-sm text-slate-200 leading-relaxed">
                    “{msg.message}”
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
