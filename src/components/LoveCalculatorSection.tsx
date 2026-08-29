import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, RefreshCw, Share2, Copy, Check, X, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { toPng } from 'html-to-image';

interface StepRow {
  numbers: number[];
}

export const LoveCalculatorSection: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [steps, setSteps] = useState<StepRow[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [tierMessage, setTierMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const targetName = 'SUBHASHREE';

  // Compute school algorithm steps with authentic digit-splitting reduction
  const calculateSchoolSteps = (name1: string, name2: string) => {
    const combined = (name1.trim().toLowerCase() + name2.toLowerCase()).replace(/[^a-z]/g, '');
    const countsMap: { [key: string]: number } = {};
    
    const uniqueChars: string[] = [];
    for (const char of combined) {
      if (!countsMap[char]) {
        countsMap[char] = 0;
        uniqueChars.push(char);
      }
      countsMap[char]++;
    }

    let currentArr = uniqueChars.map(char => countsMap[char]);
    const allSteps: StepRow[] = [
      { numbers: [...currentArr] }
    ];

    while (currentArr.length > 2) {
      const nextArr: number[] = [];
      const len = currentArr.length;
      for (let i = 0; i < Math.ceil(len / 2); i++) {
        if (i === len - 1 - i) {
          nextArr.push(currentArr[i]);
        } else {
          const sum = currentArr[i] + currentArr[len - 1 - i];
          if (sum >= 10) {
            nextArr.push(Math.floor(sum / 10));
            nextArr.push(sum % 10);
          } else {
            nextArr.push(sum);
          }
        }
      }
      currentArr = nextArr;
      allSteps.push({ numbers: [...currentArr] });
    }

    const score = parseInt(currentArr.join(''), 10) || 85;
    return { steps: allSteps, finalScore: score };
  };

  useEffect(() => {
    if (!stepsContainerRef.current) return;
    const rows = stepsContainerRef.current.querySelectorAll('.step-row-item');
    if (rows.length > 0) {
      const latestRow = rows[rows.length - 1];
      gsap.fromTo(
        latestRow,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
      );

      const numBadges = latestRow.querySelectorAll('.num-badge');
      gsap.fromTo(
        numBadges,
        { scale: 0, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(1.7)' }
      );
    }
  }, [currentStepIndex]);

  const handleStartCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsCalculating(true);
    setFinalScore(null);
    setSteps([]);
    setCurrentStepIndex(0);

    const result = calculateSchoolSteps(userName, targetName);
    setSteps(result.steps);

    // Animate step by step with GSAP rhythmic sequence
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < result.steps.length) {
        setCurrentStepIndex(idx);
      } else {
        clearInterval(interval);
        setIsCalculating(false);
        setFinalScore(result.finalScore);

        if (result.finalScore >= 90) {
          setTierMessage('🔥 Absolute Cosmic Soulmates! Legendary connection with SUBHASHREE!');
        } else if (result.finalScore >= 80) {
          setTierMessage('💖 Incredible Supporter Bond! Pure warmth & admiration!');
        } else {
          setTierMessage('✨ Sparkling Chemistry! True fan dedication!');
        }

        confetti({
          particleCount: 90,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b', '#a855f7', '#38bdf8']
        });
      }
    }, 1100);
  };

  const handleReset = () => {
    setUserName('');
    setSteps([]);
    setFinalScore(null);
    setCurrentStepIndex(0);
    setIsCalculating(false);
    setShowShareModal(false);
  };

  const handleCopyShareCard = () => {
    const text = `✨ My Love Calculator Score with SUBHASHREE is ${finalScore}%! ("${tierMessage}"). Calculate yours too at SUBHASHREE Fan Portal! 💖`;
    navigator.clipboard.writeText(text);
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  const handleTwitterShareCard = () => {
    const text = encodeURIComponent(`✨ My Love Calculator Score with SUBHASHREE is ${finalScore}%! ("${tierMessage}") 💖`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(shareCardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#121520',
        cacheBust: true,
        skipFonts: false,
        fontEmbedCSS: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap'
      });
      const image = dataUrl;
      const link = document.createElement('a');
      link.href = image;
      link.download = `Subhashree-Love-Score-${userName.trim() || 'Fan'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download card:', err);
      alert('Could not download image directly. You can take a screenshot of your card!');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section id="love-calculator" className="py-20 bg-[#0c0e14] relative border-t border-white/5 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-widest mb-3">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse" />
            <span>School Days Math Calculator</span>
          </div>
          <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            SUBHASHREE & You
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base font-sans leading-relaxed">
            Relive childhood memories! Type your name to calculate your exact school-style letter reduction match with SUBHASHREE.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="glass-panel p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent shadow-2xl relative">
          
          <form onSubmit={handleStartCalculation} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              
              {/* Fan Name Input */}
              <div className="flex flex-col gap-2 h-full">
                <label className="block text-xs font-syne uppercase font-bold text-slate-300 tracking-wider h-5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name (e.g. Vivek)"
                  className="w-full h-full min-h-[52px] px-4 py-3.5 rounded-2xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-rose-500 transition-all placeholder:text-slate-500 hover:border-white/25"
                  required
                />
              </div>

              {/* Fixed Target Name */}
              <div className="flex flex-col gap-2 h-full">
                <label className="block text-xs font-syne uppercase font-bold text-rose-300 tracking-wider h-5">
                  Your Celebrity
                </label>
                <div className="relative w-full h-full min-h-[52px] px-4 py-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm font-syne font-bold flex items-center justify-between overflow-hidden group hover:bg-rose-500/20 hover:border-rose-400/50 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-400/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative tracking-wider">SUBHASHREE</span>
                  <Sparkles className="w-4 h-4 text-rose-400 relative animate-pulse" />
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isCalculating || !userName.trim()}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-syne text-xs font-bold uppercase tracking-widest shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Calculating School Steps...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Run School Math Calculation</span>
                  </>
                )}
              </button>

              {finalScore !== null && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white font-syne text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </form>

          {/* Clean Visual Reduction Rows (Connecting Outer Numbers) */}
          {steps.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
              <div className="space-y-2" ref={stepsContainerRef}>
                {steps.slice(0, currentStepIndex + 1).map((step, sIdx) => {
                  const len = step.numbers.length;
                  return (
                    <div
                      key={sIdx}
                      className="step-row-item py-3 px-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center gap-1.5 shadow-lg relative overflow-hidden"
                    >
                      {/* Visual Outer-to-Inner Arc Indicator for active steps */}
                      <div className="flex flex-nowrap items-center justify-center gap-1.5">
                        {step.numbers.map((num, nIdx) => {
                          const isOuter = nIdx === 0 || nIdx === len - 1;
                          const isMiddle = nIdx === Math.floor(len / 2) && len % 2 === 1;
                          return (
                            <div key={nIdx} className="relative flex flex-col items-center group">
                              <div
                                className={`num-badge w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-syne font-extrabold text-xs sm:text-sm shadow-xl transition-all duration-300 ${
                                  isOuter
                                    ? 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white border border-rose-300/65 shadow-rose-500/30'
                                    : isMiddle
                                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border border-purple-300/40'
                                    : 'bg-white/10 text-white border border-white/20'
                                }`}
                              >
                                {num}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Connecting visual cue below row indicating outer pairs adding up */}
                      {sIdx < steps.length - 1 && (
                        <div className="flex items-center gap-1 text-[9px] font-syne uppercase tracking-wider text-rose-300/70 pt-0.5">
                          <span>Combining Outer Edges ⇄</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Final Result Display */}
          {finalScore !== null && !isCalculating && (
            <div className="mt-10 pt-8 border-t border-white/10 text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 p-1 shadow-2xl shadow-rose-500/40 animate-pulse">
                <div className="w-full h-full rounded-full bg-[#0d0f16] flex flex-col items-center justify-center p-2">
                  <span className="text-[10px] font-syne uppercase font-bold text-rose-300 tracking-wider">Match</span>
                  <span className="font-syne text-4xl sm:text-5xl font-extrabold text-white">
                    {finalScore}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-syne text-2xl font-bold text-white">
                  {userName.trim().toUpperCase()} & SUBHASHREE
                </h3>
              </div>

              {/* Share Result Card Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-syne text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Generate & Share Result Card</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Gorgeous Share Card Modal */}
      {showShareModal && finalScore !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-[#161924] to-[#0c0e14] border border-rose-500/30 shadow-2xl space-y-6 overflow-hidden">
            
            {/* Background glowing orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/15 blur-[100px] rounded-full pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                <span className="font-syne text-xs font-bold uppercase tracking-widest text-rose-300">
                  Official Fan Certificate
                </span>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* The Gorgeous Card Preview with ref for downloading */}
            <div
              ref={shareCardRef}
              style={{
                backgroundColor: '#1a0a14',
                backgroundImage: `
                  radial-gradient(circle at 15% 20%, rgba(244,63,94,0.45) 0%, transparent 35%),
                  radial-gradient(circle at 85% 25%, rgba(236,72,153,0.40) 0%, transparent 40%),
                  radial-gradient(circle at 50% 90%, rgba(168,85,247,0.35) 0%, transparent 45%),
                  radial-gradient(circle at 20% 80%, rgba(251,113,133,0.30) 0%, transparent 35%),
                  radial-gradient(circle at 90% 75%, rgba(244,63,94,0.30) 0%, transparent 35%),
                  linear-gradient(180deg, rgba(244,63,94,0.08) 0%, transparent 50%, rgba(168,85,247,0.08) 100%)
                `,
                color: '#ffffff',
                padding: '6px',
                borderRadius: '20px',
                textAlign: 'center',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), inset 0 0 60px rgba(244,63,94,0.08)',
                overflow: 'hidden',
                backgroundClip: 'padding-box'
              }}
            >
              {/* Gradient double border using padding-box trick */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '20px', padding: '3px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 35%, #a855f7 70%, #ec4899 100%)',
                WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor', maskComposite: 'exclude',
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.35))'
              }} />

              {/* Corner sparkles */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'rgba(253,164,175,0.7)' }}>✦</div>
              <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'rgba(253,164,175,0.7)' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'rgba(253,164,175,0.7)' }}>✦</div>
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'rgba(253,164,175,0.7)' }}>✦</div>

              <div style={{
                position: 'relative',
                padding: '16px 18px'
              }}>
                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                  <h4 style={{
                    color: '#ffffff', fontSize: '20px', fontWeight: 800, margin: 0,
                    letterSpacing: '0.04em',
                    fontFamily: '"Playfair Display", "Outfit", serif',
                    fontStyle: 'italic',
                    textShadow: '0 2px 12px rgba(244,63,94,0.35)'
                  }}>
                    {userName.trim().toUpperCase()}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', position: 'relative' }}>
                    <div style={{
                      position: 'relative', width: '28px', height: '28px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <div style={{
                        position: 'absolute', inset: '-6px', borderRadius: '9999px',
                        background: 'radial-gradient(circle, rgba(244,63,94,0.45) 0%, transparent 70%)',
                        filter: 'blur(4px)'
                      }} />
                      <Heart style={{
                        width: '22px', height: '22px',
                        fill: 'url(#heartGrad)', stroke: '#fda4af', strokeWidth: 1.5,
                        filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.7))'
                      }} />
                      <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <defs>
                          <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#fb7185" />
                            <stop offset="50%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  <h4 style={{
                    color: '#fda4af', fontSize: '20px', fontWeight: 800, margin: 0,
                    letterSpacing: '0.04em',
                    fontFamily: '"Playfair Display", "Outfit", serif',
                    fontStyle: 'italic',
                    textShadow: '0 2px 12px rgba(244,63,94,0.35)'
                  }}>
                    SUBHASHREE
                  </h4>
                </div>

                {/* SVG progress ring + score */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
                  <div style={{ position: 'relative', width: '88px', height: '88px' }}>
                    <svg width="88" height="88" viewBox="0 0 88 88" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx="44" cy="44" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="6" fill="none" />
                      <circle cx="44" cy="44" r="38" stroke="url(#ringGrad)" strokeWidth="6" fill="none"
                        strokeDasharray={`${(2 * Math.PI * 38 * (finalScore || 0)) / 100} ${2 * Math.PI * 38}`}
                        strokeLinecap="round" />
                      <defs>
                        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>
                        {finalScore}%
                      </span>
                      <span style={{ color: '#fbcfe8', fontSize: '7px', textTransform: 'uppercase', marginTop: '2px', letterSpacing: '0.1em' }}>Bond</span>
                    </div>
                  </div>
                </div>

                {/* Compact Calculation Steps inside Card */}
                <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '12px', padding: '8px', margin: '8px 0' }}>
                  <div style={{ color: '#fda4af', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Calculation Steps
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {steps.map((st, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap', lineHeight: 0 }}>
                        {st.numbers.map((n, idx) => (
                          <div
                            key={idx}
                            style={{ width: '24px', height: '24px', borderRadius: '5px', backgroundColor: 'rgba(255,255,255,0.15)', flexShrink: 0, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: '24px' }}
                          >
                            <span style={{ display: 'block', width: '24px', height: '24px', lineHeight: '24px', textAlign: 'center', color: '#ffffff', fontSize: '12px', fontWeight: 700, fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif', padding: 0, margin: 0, verticalAlign: 'middle' }}>
                              {n}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '10px', fontStyle: 'italic', margin: '6px 0 2px 0', lineHeight: 1.4, display: 'none' }}>
                  "{tierMessage}"
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadCard}
                disabled={isDownloading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-syne text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Generating Image...' : 'Download Card as Image'}</span>
              </button>

              <button
                type="button"
                onClick={handleTwitterShareCard}
                className="w-full py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-syne text-xs font-bold uppercase tracking-wider shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on Twitter / X</span>
              </button>

              <button
                type="button"
                onClick={handleCopyShareCard}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-syne text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedCard ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied Result & Link!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Share Text</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
