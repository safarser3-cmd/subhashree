import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Calendar,
  MapPin,
  GraduationCap,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  Globe,
  Quote,
  Shield,
  Heart,
  ExternalLink,
  ShieldAlert,
  Users,
  Feather,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { subscribeToBio, updateBioInFirestore, BioContent, DEFAULT_BIO } from '../lib/firestoreService';

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bioData, setBioData] = useState<BioContent>(DEFAULT_BIO);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BioContent>(DEFAULT_BIO);

  useEffect(() => {
    const unsubscribe = subscribeToBio((fetched) => {
      setBioData(fetched);
      setEditForm(fetched);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBioInFirestore(editForm);
    setIsEditing(false);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-about-elem',
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const chapterIcons = [
    <GraduationCap className="w-4 h-4" />,
    <Sparkles className="w-4 h-4" />,
    <TrendingUp className="w-4 h-4" />,
    <HeartHandshake className="w-4 h-4" />,
    <Globe className="w-4 h-4" />
  ];

  const chapterColors = [
    { bg: 'bg-sky-500/20', border: 'border-sky-500/30', text: 'text-sky-400' },
    { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
    { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' }
  ];

  return (
    <section id="about" ref={sectionRef} className="py-20 bg-[#0c0e14] relative border-t border-white/5 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-rose-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-sky-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 gsap-about-elem">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-widest mb-3">
            <Feather className="w-3.5 h-3.5 text-rose-400" />
            <span>Biography & Journey</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {bioData.title}
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              title="Edit Profile Bio in Firestore"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer border border-white/15"
            >
              <Edit3 className="w-4 h-4 text-rose-400" />
            </button>
          </div>
          <p className="mt-3 text-slate-300 text-sm sm:text-base font-sans leading-relaxed">
            {bioData.subtitle}
          </p>
        </div>

        {/* Expandable Unified Biography Card */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent gsap-about-elem shadow-2xl relative transition-all duration-500">
          
          {/* Top Metadata Bar with Read Indicator & Expand Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-8 border-b border-white/10">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold font-syne uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>{bioData.readTime}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>{bioData.chapters.length} Full Chapters</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Synced with Firestore 'bio'</span>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:border-white/30"
            >
              <span>{isExpanded ? 'Collapse Story' : 'Expand Full Bio'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-rose-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-rose-400" />
              )}
            </button>
          </div>

          {/* Content Wrapper with Collapsible Overflow */}
          <div className={`space-y-10 transition-all duration-700 ease-in-out relative ${
            isExpanded ? 'max-h-[3000px]' : 'max-h-[340px] overflow-hidden'
          }`}>
            
            {bioData.chapters.map((ch, idx) => {
              const color = chapterColors[idx % chapterColors.length];
              const icon = chapterIcons[idx % chapterIcons.length];
              return (
                <React.Fragment key={ch.id || idx}>
                  {idx > 0 && <div className="w-full h-px bg-white/10" />}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-9 h-9 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center ${color.text} shrink-0`}>
                        {icon}
                      </span>
                      <div>
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${color.text} block font-syne`}>{ch.chapterNumber}</span>
                        <h3 className="font-syne text-xl sm:text-2xl font-bold text-white">{ch.title}</h3>
                      </div>
                    </div>

                    <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-3 font-sans">
                      {ch.paragraphs.map((para, pIdx) => (
                        <p key={pIdx}>{para}</p>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* Official Links Footer inside expanded view */}
            <div className="pt-4">
              <div className="text-xs font-syne font-bold uppercase tracking-wider text-slate-400 mb-3">Verified Official Portals</div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Instagram (Verified)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Againsubha Facebook Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>

                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>Official X Account</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

          </div>

          {/* Fade-out Gradient Overlay & Call to Action Button when Collapsed */}
          {!isExpanded ? (
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d0f16] via-[#0d0f16]/90 to-transparent rounded-b-3xl flex flex-col items-center justify-end pb-8 pt-12 z-20 pointer-events-auto">
              <button
                onClick={() => setIsExpanded(true)}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-syne text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 shadow-xl shadow-rose-500/25 transition-all cursor-pointer transform hover:scale-105"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Read Full 5-Minute Biography ({bioData.chapters.length} Chapters)</span>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="pt-8 mt-8 border-t border-white/10 flex justify-center">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Collapse Biography</span>
                <ChevronUp className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          )}

        </div>

        {/* Restored Heartfelt Emotional Note on Character & Resilience */}
        <div className="mt-8 glass-panel p-6 sm:p-10 rounded-3xl border border-rose-500/25 bg-gradient-to-r from-rose-950/30 via-[#12141d] to-sky-950/30 relative overflow-hidden gsap-about-elem shadow-2xl">
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-syne font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 fill-rose-400" />
                <span>Resilience in the Face of Online Judgment</span>
              </div>
              <span className="text-xs text-slate-400 font-syne uppercase tracking-wider font-semibold">
                An Emotional Reflection
              </span>
            </div>

            <h3 className="font-syne text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              "{bioData.quote}"
            </h3>

            <div className="text-slate-200 text-sm sm:text-base leading-relaxed space-y-3.5 font-sans">
              <p>
                In the digital era, public judgment is often swift and unforgiving. When private moments 
                or unverified viral narratives circulate across social platforms, the online world frequently rushes to 
                label, mock, and criticize a human being without knowing their reality, the silent battles they fight, 
                or the genuine kindness in their heart.
              </p>
              <p>
                Facing severe cyberbullying, intrusive scrutiny, and instant character judgments, Subhashree demonstrated profound internal resilience. Instead of returning anger with anger, 
                she chose quiet dignity, mental resolve, and steadfast focus on her life, her creativity, and her community.
              </p>
              <p className="text-rose-200 font-medium">
                Her story stands as an enduring reminder to every young person online: you are defined by your genuine 
                compassion, how you treat those around you, and how you rise with grace—never by the fleeting, cruel 
                opinions of strangers.
              </p>
            </div>

            {/* Bottom Quote Strip */}
            <div className="pt-4 mt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Quote className="w-6 h-6 text-rose-400 shrink-0 opacity-80" />
                <p className="text-xs sm:text-sm text-slate-300 italic">
                  "Compassion is understanding that behind every screen is a real beating heart." — {bioData.quoteAuthor}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-syne font-bold text-emerald-400 uppercase tracking-wider">
                  Safe & Respectful Space
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Bio Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl bg-[#12151e] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
              <h3 className="font-syne text-xl font-bold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-400" />
                <span>Edit Biography & Profile (Firestore)</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBio} className="space-y-4">
              <div>
                <label className="block text-xs font-syne uppercase font-bold text-slate-300 mb-1">Main Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-syne uppercase font-bold text-slate-300 mb-1">Subtitle / Summary</label>
                <textarea
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-syne uppercase font-bold text-slate-300 mb-1">Featured Quote</label>
                <input
                  type="text"
                  value={editForm.quote}
                  onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-500/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
