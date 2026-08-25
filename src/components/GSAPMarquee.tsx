import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Heart, Star, Flame, Crown } from 'lucide-react';

const MARQUEE_ITEMS = [
  { text: 'Odisha Handloom Icon', icon: Crown, color: 'text-amber-400' },
  { text: '2.4M+ Global Fam', icon: Heart, color: 'text-rose-400' },
  { text: 'Traditional Saree Art', icon: Sparkles, color: 'text-pink-400' },
  { text: 'Green Earth Initiative', icon: Star, color: 'text-emerald-400' },
  { text: 'Authentic Grace', icon: Flame, color: 'text-amber-300' },
];

export const GSAPMarquee: React.FC = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    const totalWidth = track.scrollWidth / 2;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -totalWidth,
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    }, marqueeRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={marqueeRef}
      className="relative w-full overflow-hidden bg-white/[0.02] border-y border-white/5 py-3 backdrop-blur-md z-10"
    >
      <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-[#0b0c10] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-[#0b0c10] to-transparent z-10 pointer-events-none" />

      <div ref={trackRef} className="flex whitespace-nowrap gap-10 items-center will-change-transform">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center gap-2.5">
              <Icon className={`w-3 h-3 ${item.color}`} />
              <span className="font-syne text-[11px] font-bold text-slate-300 tracking-widest uppercase">
                {item.text}
              </span>
              <span className="w-1 h-1 rounded-full bg-rose-500/40 ml-6" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
