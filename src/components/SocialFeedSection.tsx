import React, { useState, useEffect } from 'react';
import { SOCIAL_POSTS } from '../data/shubhashreeData';
import { SocialPost } from '../types';
import {
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Heart,
  Share2,
  Send,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Users,
  Activity,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface SocialProfileCard {
  platform: 'instagram' | 'twitter' | 'youtube';
  name: string;
  handle: string;
  avatar: string;
  verified: boolean;
  badgeTitle: string;
  statusHighlight: string;
  followers?: number;
  followersDisplay?: string;
  following?: string;
  postsCount?: string;
  growth?: string;
  bio: string;
  category: string;
  profileUrl: string;
  themeGradient: string;
  badgeBg: string;
  borderHover: string;
  isApifyLive?: boolean;
  isXLive?: boolean;
}

const INITIAL_PROFILES: SocialProfileCard[] = [
  {
    platform: 'instagram',
    name: 'Shubhashree Sahu',
    handle: '@subhaslyf',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Instagram Creator',
    statusHighlight: 'Live Audience Sync',
    followers: 1559122,
    followersDisplay: '1.56M',
    following: '2',
    postsCount: '253',
    growth: 'Apify Actor Ready',
    bio: 'Turning reels into real stories✨\nOdisha📍\nEmail 📧 : Collabs@subhashreesocials.in',
    category: 'Fashion & Visual Creator',
    profileUrl: 'https://www.instagram.com/subhaslyf/',
    themeGradient: 'from-pink-500 via-rose-500 to-amber-400',
    badgeBg: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-rose-300 border-rose-500/30',
    borderHover: 'hover:border-rose-500/50 hover:shadow-rose-500/10'
  },
  {
    platform: 'twitter',
    name: 'Shubhashree Sahu',
    handle: '@againsubha',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Official X Profile',
    statusHighlight: 'Direct Updates & Thoughts',
    bio: 'Official X (formerly Twitter) profile of Shubhashree Sahu. Follow @againsubha for direct thoughts, official announcements, and community interactions.',
    category: 'Official X Profile',
    profileUrl: 'https://x.com/againsubha',
    themeGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    badgeBg: 'bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
    borderHover: 'hover:border-sky-500/50 hover:shadow-sky-500/10'
  },
  {
    platform: 'youtube',
    name: 'Shubhashree Sahu',
    handle: '@subhaback',
    avatar: '/assets/avatar.jpg',
    verified: true,
    badgeTitle: 'Official YouTube Channel',
    statusHighlight: 'Video Content & Vlogs',
    bio: 'Official YouTube home of Shubhashree Sahu. Subscribe to @subhaback for fashion lookbooks, personal vlogs, and 4K video diaries.',
    category: 'Official YouTube Channel',
    profileUrl: 'https://www.youtube.com/@subhaback',
    themeGradient: 'from-red-500 via-rose-600 to-amber-500',
    badgeBg: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30',
    borderHover: 'hover:border-red-500/50 hover:shadow-red-500/10'
  }
];

export const SocialFeedSection: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [profiles, setProfiles] = useState<SocialProfileCard[]>(INITIAL_PROFILES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfilesLoading, setIsProfilesLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [apifyStatus, setApifyStatus] = useState<{ isConfigured: boolean; isLive: boolean } | null>(null);

  const fetchLiveMetrics = async (force = false) => {
    try {
      const res = await fetch(`/api/social-metrics${force ? '?force=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setApifyStatus({
          isConfigured: data.isApifyConfigured,
          isLive: data.isLiveFromApify
        });

        if (data.profiles) {
          setProfiles((prev) =>
            prev.map((p) => {
              const remote = data.profiles[p.platform];
              if (!remote) return p;
              return {
                ...p,
                followers: remote.followers ?? p.followers,
                followersDisplay: remote.followersDisplay ?? p.followersDisplay,
                following: remote.following ?? p.following,
                postsCount: remote.postsCount ?? p.postsCount,
                bio: remote.bio ?? p.bio,
                growth: remote.growth ?? p.growth,
                avatar: remote.avatar ? remote.avatar : p.avatar,
                isApifyLive: p.platform === 'instagram' ? data.isLiveFromApify : false,
                isXLive: p.platform === 'twitter' ? data.isLiveFromTwitter : false
              };
            })
          );
          if (data.isLiveFromApify || data.isLiveFromTwitter) {
            setLastUpdated('Live synced from official APIs');
          } else {
            setLastUpdated('Synced live');
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchLiveMetrics(false).finally(() => setIsProfilesLoading(false));
    
    // Simulate initial post loading
    const timer = setTimeout(() => setIsPostsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const [posts, setPosts] = useState<SocialPost[]>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_social_posts');
      return saved ? JSON.parse(saved) : SOCIAL_POSTS;
    } catch {
      return SOCIAL_POSTS;
    }
  });

  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_social_likes');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const refreshLiveStats = async () => {
    setIsRefreshing(true);
    await fetchLiveMetrics(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const togglePostLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      const isAlreadyLiked = next.has(postId);

      if (isAlreadyLiked) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      // Update post likes in state
      const updated = posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likesCount: p.likesCount + (isAlreadyLiked ? -1 : 1)
          };
        }
        return p;
      });

      setPosts(updated);
      try {
        localStorage.setItem('shubhashree_social_posts', JSON.stringify(updated));
        localStorage.setItem('shubhashree_social_likes', JSON.stringify(Array.from(next)));
      } catch {
        // Fallback
      }

      return next;
    });
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const author = userName.trim() || 'Shubhashree Fan';
    const newComment = {
      id: `comm-${Date.now()}`,
      user: author,
      avatar: '/assets/avatar.jpg',
      text: newCommentText.trim(),
      time: 'Just now'
    };

    const updated = posts.map((p) => {
      if (p.id === postId) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...p.comments]
        };
      }
      return p;
    });

    setPosts(updated);
    try {
      localStorage.setItem('shubhashree_social_posts', JSON.stringify(updated));
    } catch {
      // Fallback
    }

    setNewCommentText('');
  };

  const filteredPosts = posts.filter(
    (p) => selectedPlatform === 'all' || p.platform === selectedPlatform
  );

  const getPlatformIcon = (platform: SocialPost['platform']) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <section id="social" className="py-20 bg-[#0b0c10] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header & Live Sync Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>OFFICIAL CHANNELS & PROFILES</span>
            </div>
            <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Live Social Connect
            </h2>
            <p className="font-sans text-slate-400 text-base mt-2 max-w-xl">
              Verified official profiles across Instagram, X (Twitter), and YouTube with real-time audience metrics, bios, and direct updates.
            </p>
          </div>

          {/* Real-time Indicator & Refresh Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-medium">{lastUpdated}</span>
            </div>
            <button
              onClick={refreshLiveStats}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
              title="Sync Live Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Live Counts'}</span>
            </button>
          </div>
        </div>

        {/* 3 BEAUTIFUL SOCIAL MEDIA PROFILE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {isProfilesLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl bg-[#11131a]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-7 flex flex-col justify-between h-[420px]">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full bg-white/5 animate-pulse shrink-0" />
                      <div>
                        <div className="h-4 w-32 bg-white/10 animate-pulse rounded mb-2" />
                        <div className="h-3 w-20 bg-white/5 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/5 animate-pulse" />
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-4">
                    <div className="h-4 w-24 bg-white/10 animate-pulse rounded" />
                    <div className="h-8 w-32 bg-white/10 animate-pulse rounded" />
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      <div className="h-6 w-full bg-white/5 animate-pulse rounded" />
                      <div className="h-6 w-full bg-white/5 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="mb-6 space-y-2">
                    <div className="h-3 w-20 bg-white/10 animate-pulse rounded mb-2" />
                    <div className="h-3 w-full bg-white/5 animate-pulse rounded" />
                    <div className="h-3 w-5/6 bg-white/5 animate-pulse rounded" />
                    <div className="h-3 w-4/6 bg-white/5 animate-pulse rounded" />
                  </div>
                </div>
                <div className="w-full h-12 bg-white/5 animate-pulse rounded-xl" />
              </div>
            ))
          ) : (
            profiles.map((prof) => (
            <div
              key={prof.platform}
              id={`profile-card-${prof.platform}`}
              className={`group relative rounded-3xl bg-[#11131a]/90 backdrop-blur-xl border border-white/10 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl ${prof.borderHover} hover:-translate-y-1`}
            >
              {/* Subtle Platform Background Glow */}
              <div
                className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${prof.themeGradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
              />

              <div>
                {/* Profile Card Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3.5">
                    {/* Ring Avatar */}
                    <div className={`w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr ${prof.themeGradient} shadow-md shrink-0`}>
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-full h-full rounded-full object-cover bg-black"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-syne text-base font-bold text-white leading-tight">
                          {prof.name}
                        </h3>
                        {prof.verified && (
                          <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-sans text-rose-400/90 font-medium">
                        {prof.handle}
                      </p>
                    </div>
                  </div>

                  {/* Platform Icon Badge */}
                  <div className={`p-2 rounded-2xl ${prof.badgeBg} border`}>
                    {prof.platform === 'instagram' && <Instagram className="w-5 h-5" />}
                    {prof.platform === 'twitter' && <Twitter className="w-5 h-5" />}
                    {prof.platform === 'youtube' && <Youtube className="w-5 h-5" />}
                  </div>
                </div>

                {/* Card Middle Box */}
                {prof.platform === 'instagram' ? (
                  /* Instagram Live Follower Count Highlight (Apify Scraper Integration) */
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-sans flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-400" />
                        <span>Followers</span>
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <TrendingUp className="w-3 h-3" />
                        <span>{prof.growth || 'Live Sync'}</span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-syne text-3xl font-extrabold text-white tracking-tight">
                        {prof.followersDisplay || '2.43M'}
                      </span>
                      {prof.followers && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({prof.followers.toLocaleString()})
                        </span>
                      )}
                      {prof.isApifyLive && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Apify Actor</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Posts</span>
                        <span className="font-bold text-white">{prof.postsCount || '628'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Following</span>
                        <span className="font-bold text-white">{prof.following || '412'}</span>
                      </div>
                    </div>
                  </div>
                ) : prof.platform === 'twitter' ? (
                  /* Official X / Twitter Card */
                  prof.isXLive && prof.followers !== undefined ? (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-sans flex items-center gap-1.5">
                          <Twitter className="w-3.5 h-3.5 text-sky-400" />
                          <span>Followers</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Official X API v2</span>
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-syne text-3xl font-extrabold text-white tracking-tight">
                          {prof.followersDisplay}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({prof.followers.toLocaleString()})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tweets</span>
                          <span className="font-bold text-white">{prof.postsCount}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Following</span>
                          <span className="font-bold text-white">{prof.following}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-sky-400 font-sans flex items-center gap-1.5 font-medium">
                          <Twitter className="w-3.5 h-3.5" />
                          <span>Official X Profile</span>
                        </span>
                        <span className="text-[10px] font-bold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          Live Hub
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="font-syne text-2xl font-bold text-white tracking-tight block">
                          @againsubha
                        </span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          Official updates, thoughts & announcements
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          <span className="text-slate-400 block text-[10px]">Platform</span>
                          <span className="font-semibold text-sky-300">X (Twitter)</span>
                        </div>
                        <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          <span className="text-slate-400 block text-[10px]">Channel Status</span>
                          <span className="font-semibold text-emerald-400">Verified</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  /* Official YouTube Card (No fake numbers) */
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-red-400 font-sans flex items-center gap-1.5 font-medium">
                        <Youtube className="w-3.5 h-3.5" />
                        <span>Official Channel</span>
                      </span>
                      <span className="text-[10px] font-bold text-red-300 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                        4K Video Hub
                      </span>
                    </div>

                    <div className="pt-1">
                      <span className="font-syne text-2xl font-bold text-white tracking-tight block">
                        @subhaback
                      </span>
                      <span className="text-[11px] text-slate-400 font-sans">
                        Vlogs, GRWM & Fashion Lookbooks
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                      <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Content</span>
                        <span className="font-semibold text-red-300">Videos & Shorts</span>
                      </div>
                      <div className="bg-white/[0.02] p-2 rounded-lg border border-white/5">
                        <span className="text-slate-400 block text-[10px]">Channel Status</span>
                        <span className="font-semibold text-emerald-400">Verified</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Bio */}
                <div className="mb-6">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Official Bio</span>
                  </div>
                  <p className="font-sans text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-white/[0.03] p-3.5 rounded-xl border border-white/10 shadow-inner">
                    {prof.bio}
                  </p>
                </div>
              </div>

              {/* Follow / Open CTA Button */}
              <a
                href={prof.profileUrl}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3 px-4 rounded-xl font-syne text-xs font-bold text-white flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${prof.themeGradient} hover:opacity-90 shadow-lg active:scale-98`}
              >
                <span>
                  {prof.platform === 'twitter'
                    ? 'Follow on X (@againsubha)'
                    : prof.platform === 'youtube'
                    ? 'Subscribe on YouTube (@subhaback)'
                    : 'Visit @subhaslyf on Instagram'}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          ))
          )}
        </div>

        {/* Section Divider & Feed Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 pb-8 border-t border-white/10">
          <div>
            <h3 className="font-syne text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-rose-400" />
              <span>Latest Posts & Interactive Timeline</span>
            </h3>
            <p className="font-sans text-xs text-slate-400 mt-1">
              Filter feeds by channel, read recent posts, like and post fan comments directly.
            </p>
          </div>

          {/* Platform Filter Buttons (3 platforms only: Instagram, YouTube, X) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedPlatform('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedPlatform === 'all'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              All Feeds
            </button>
            <button
              onClick={() => setSelectedPlatform('instagram')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedPlatform === 'instagram'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram (@subhaslyf)</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('youtube')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedPlatform === 'youtube'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube (@subhaback)</span>
            </button>
            <button
              onClick={() => setSelectedPlatform('twitter')}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedPlatform === 'twitter'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'glass-panel text-slate-300 hover:text-white'
              }`}
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>X / Twitter (@againsubha)</span>
            </button>
          </div>
        </div>

        {/* Social Feed 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isPostsLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel rounded-3xl overflow-hidden border border-white/10 flex flex-col h-[600px]">
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/5 animate-pulse" />
                    <div>
                      <div className="h-4 w-24 bg-white/10 animate-pulse rounded mb-1" />
                      <div className="h-3 w-32 bg-white/5 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/5 animate-pulse" />
                </div>
                <div className="h-80 w-full bg-white/5 animate-pulse" />
                <div className="p-5 space-y-3 flex-1">
                  <div className="h-4 w-full bg-white/10 animate-pulse rounded" />
                  <div className="h-4 w-4/5 bg-white/10 animate-pulse rounded" />
                  <div className="h-4 w-3/5 bg-white/10 animate-pulse rounded" />
                </div>
                <div className="p-4 bg-[#13151c] border-t border-white/5 flex items-center justify-between h-14">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-4 bg-white/5 animate-pulse rounded" />
                    <div className="w-12 h-4 bg-white/5 animate-pulse rounded" />
                  </div>
                  <div className="w-16 h-4 bg-white/5 animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : (
            filteredPosts.map((post) => {
              const isLiked = likedPosts.has(post.id);
              const isCommentOpen = activeCommentPostId === post.id;

              return (
              <div
                key={post.id}
                id={`social-post-${post.id}`}
                className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between"
              >
                {/* Post Author Header */}
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src="/assets/avatar.jpg"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://iili.io/CmQCdAl.jpg';
                        }}
                        alt={post.authorName}
                        className="w-11 h-11 rounded-full object-cover border border-rose-500/40"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0b0c10] border border-white/10">
                        {getPlatformIcon(post.platform)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-syne text-sm font-bold text-white">
                          {post.authorName}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                      </div>
                      <p className="text-xs text-slate-400 font-sans">
                        {post.handle} • {post.publishedAt}
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Open on Platform"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Media or Text Content */}
                <div>
                  {post.mediaUrl && (
                    <div className="relative h-80 w-full bg-black overflow-hidden">
                      <img
                        src={post.mediaUrl}
                        alt="Social Media Post Media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    <p className="font-sans text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {post.caption}
                    </p>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-semibold text-rose-400 hover:underline cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions & Metrics */}
                <div className="p-4 bg-[#13151c] border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        onClick={() => togglePostLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount.toLocaleString()}</span>
                      </button>

                      {/* Comment Toggle */}
                      <button
                        onClick={() =>
                          setActiveCommentPostId(isCommentOpen ? null : post.id)
                        }
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.commentsCount.toLocaleString()}</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 font-sans">
                      {post.sharesCount.toLocaleString()} shares
                    </span>
                  </div>

                  {/* Comments Drawer */}
                  {isCommentOpen && (
                    <div className="pt-3 border-t border-white/10 space-y-3 animate-fade-in">
                      {/* Add Comment Input Form */}
                      <form
                        onSubmit={(e) => handleAddComment(post.id, e)}
                        className="space-y-2"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Your Name (optional)"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-1/3 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Write a sweet comment..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                          />
                          <button
                            type="submit"
                            className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>

                      {/* Existing Comments List */}
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {post.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-2.5 rounded-xl bg-white/5 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="font-bold text-rose-300">{c.user}</span>
                              <span className="text-[10px]">{c.time}</span>
                            </div>
                            <p className="text-slate-200">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </div>
    </section>
  );
};
