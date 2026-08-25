import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Waves, Gem, Flame, Sun, Wand2, RefreshCw } from 'lucide-react';

interface ParticleRevealProps {
  currentImageIndex?: number;
  onImageChange?: (index: number) => void;
}

export type ParticleMode = 'colorful-dust' | 'stardust' | 'neon-hologram' | 'solar-flame';

export const BACKGROUND_PHOTOS = [
  {
    id: 'saree-heritage',
    name: 'Sambalpuri Silk Ikat',
    tag: 'Traditional Handloom',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'sunset-glamour',
    name: 'Sunset Spotlight',
    tag: 'Editorial Glamour',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'red-carpet-noir',
    name: 'Power Saree Noir',
    tag: 'Red Carpet Gala',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1920&q=90',
  },
  {
    id: 'outdoor-grace',
    name: 'Sanctuary Bloom',
    tag: 'Eco-Green Series',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1920&q=90',
  },
];

// Rich Multi-Tone Color Palettes for Vibrancy
const PALETTES = {
  'colorful-dust': [
    '#ff1493', // Deep Pink
    '#00ffff', // Electric Cyan
    '#ffea00', // Neon Yellow
    '#7b2cbf', // Royal Violet
    '#ff5722', // Sunset Orange
    '#00f5d4', // Bright Teal
    '#ffffff', // Pure Diamond White
  ],
  'stardust': [
    '#ff2a85',
    '#00d2ff',
    '#ffd700',
    '#d946ef',
    '#ffffff',
  ],
  'neon-hologram': [
    '#00f0ff',
    '#7000ff',
    '#ff007b',
    '#00ff66',
    '#ffffff',
  ],
  'solar-flame': [
    '#ff0055',
    '#ff5500',
    '#ffbb00',
    '#ffffff',
    '#ff00aa',
  ],
};

export const ThreeParticleRevealCanvas: React.FC<ParticleRevealProps> = ({
  currentImageIndex = 0,
  onImageChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(currentImageIndex);
  const [mode, setMode] = useState<ParticleMode>('colorful-dust');
  const [revealRadius] = useState(150);

  const activePhoto = BACKGROUND_PHOTOS[activePhotoIdx];

  const handleSelectPhoto = (index: number) => {
    setActivePhotoIdx(index);
    if (onImageChange) onImageChange(index);
  };

  const shockwavesRef = useRef<
    { x: number; y: number; radius: number; maxRadius: number; strength: number; alpha: number; color: string }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Mouse Tracking with smooth interpolation
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isMoving: false,
      lastActive: Date.now(),
    };

    // Grid configuration - dense, multi-colored dust
    const spacing = mode === 'colorful-dust' ? 32 : mode === 'neon-hologram' ? 38 : 42;
    const cols = Math.ceil(width / spacing);
    const rows = Math.ceil(height / spacing);
    const count = cols * rows;

    const currentPalette = PALETTES[mode];
    const paletteLength = currentPalette.length;

    // Pre-render glowing blurred orbs to offscreen canvases for 60FPS fluid rendering
    const orbCanvases = currentPalette.map(hex => {
      const c = document.createElement('canvas');
      const size = 120; // max resolution for the blurred orb
      const center = size / 2;
      c.width = size;
      c.height = size;
      const octx = c.getContext('2d')!;
      
      // Convert HEX to RGB for rgba() usage
      let r = parseInt(hex.slice(1, 3), 16);
      let g = parseInt(hex.slice(3, 5), 16);
      let b = parseInt(hex.slice(5, 7), 16);
      
      const grad = octx.createRadialGradient(center, center, 0, center, center, center);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
      grad.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.5)`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.1)`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      octx.fillStyle = grad;
      octx.fillRect(0, 0, size, size);
      return c;
    });

    // High performance flat typed arrays for 0 GC frame drops
    const posX = new Float32Array(count);
    const posY = new Float32Array(count);
    const originX = new Float32Array(count);
    const originY = new Float32Array(count);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const sizes = new Float32Array(count);
    const baseSizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);
    const colorIndices = new Uint8Array(count);
    const dustRotations = new Float32Array(count);
    const dustRotSpeeds = new Float32Array(count);

    // Initialize liquid vapor particles
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (idx >= count) break;
        // Organic organic jitter
        const jx = (Math.random() - 0.5) * (spacing * 1.5);
        const jy = (Math.random() - 0.5) * (spacing * 1.5);
        const x = c * spacing + spacing / 2 + jx;
        const y = r * spacing + spacing / 2 + jy;

        originX[idx] = x;
        originY[idx] = y;
        posX[idx] = x;
        posY[idx] = y;
        vx[idx] = 0;
        vy[idx] = 0;

        // Massive soft blurred orbs sizes
        const isBokeh = Math.random() < 0.15;
        const sz = isBokeh ? Math.random() * 45 + 25 : Math.random() * 25 + 15;
        sizes[idx] = sz;
        baseSizes[idx] = sz;
        alphas[idx] = Math.random() * 0.4 + 0.3; // Softer initial opacity for liquid look
        phases[idx] = Math.random() * Math.PI * 2;
        colorIndices[idx] = Math.floor(Math.random() * paletteLength);
        dustRotations[idx] = Math.random() * Math.PI * 2;
        dustRotSpeeds[idx] = (Math.random() - 0.5) * 0.05;

        idx++;
      }
    }

    const totalParticles = idx;

    // Interaction Listeners
    const updateMouse = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = clientX - rect.left;
      mouse.targetY = clientY - rect.top;
      mouse.isMoving = true;
      mouse.lastActive = Date.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMouse(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      const randomColor = currentPalette[Math.floor(Math.random() * currentPalette.length)];

      shockwavesRef.current.push({
        x: clickX,
        y: clickY,
        radius: 12,
        maxRadius: 280,
        strength: 32,
        alpha: 0.95,
        color: randomColor,
      });
    };

    const handleMouseLeave = () => {
      mouse.isMoving = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      if (!container) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Main 60FPS Render loop
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // Smooth cursor lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;

      const idleDuration = Date.now() - mouse.lastActive;
      const isIdle = idleDuration > 2000;

      // Organic wandering figure-8 movement during idle
      const curX = isIdle ? width / 2 + Math.sin(time * 0.6) * (width * 0.28) : mouse.x;
      const curY = isIdle ? height / 2 + Math.sin(time * 1.2) * (height * 0.16) : mouse.y;

      const curRadius = revealRadius;
      const curRadiusSq = curRadius * curRadius;

      // 1. Soft Multi-stop Radial Lens Mask revealing background image
      const radialGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, curRadius * 1.38);
      radialGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
      radialGlow.addColorStop(0.45, 'rgba(9, 10, 16, 0.15)');
      radialGlow.addColorStop(0.8, 'rgba(9, 10, 16, 0.85)');
      radialGlow.addColorStop(1, 'rgba(9, 10, 16, 0.98)');

      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Shockwaves Expansion & Colorful Particle Pulses
      const activeShockwaves = shockwavesRef.current;
      for (let s = activeShockwaves.length - 1; s >= 0; s--) {
        const sw = activeShockwaves[s];
        sw.radius += 10.5;
        sw.alpha *= 0.93;

        // Draw luminous chromatic expanding ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha * 0.75;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        if (sw.radius > sw.maxRadius || sw.alpha < 0.02) {
          activeShockwaves.splice(s, 1);
        }
      }

      // 3. Dynamic Liquid Vapor Physics
      for (let i = 0; i < totalParticles; i++) {
        const ox = originX[i];
        const oy = originY[i];
        let px = posX[i];
        let py = posY[i];
        const phase = phases[i];

        dustRotations[i] += dustRotSpeeds[i];

        // Liquid vapor noise field
        const timeScale = time * 0.2;
        const noiseAngle = Math.sin(ox * 0.003 + timeScale) * Math.cos(oy * 0.004 + timeScale) * Math.PI * 2;
        const noiseForce = Math.sin(ox * 0.01 + timeScale) * 35; // Wide sweeping drifts
        
        let floatX = Math.cos(noiseAngle) * noiseForce;
        let floatY = Math.sin(noiseAngle) * noiseForce;

        if (mode === 'solar-flame') {
          floatY -= Math.sin(time * 2 + phase) * 15; // Stronger upward buoyant thermal drift
        }

        const targetX = ox + floatX;
        const targetY = oy + floatY;

        const dx = px - curX;
        const dy = py - curY;
        const distSq = dx * dx + dy * dy;

        // Shockwave impact
        for (let s = 0; s < activeShockwaves.length; s++) {
          const sw = activeShockwaves[s];
          const sdx = px - sw.x;
          const sdy = py - sw.y;
          const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
          const ringDist = Math.abs(sDist - sw.radius);
          if (ringDist < 60) { // Wider shockwave impact
            const shockForce = (1 - ringDist / 60) * sw.strength * sw.alpha * 1.5;
            const sAngle = Math.atan2(sdy, sdx);
            vx[i] += Math.cos(sAngle) * shockForce;
            vy[i] += Math.sin(sAngle) * shockForce;
          }
        }

        // Mouse Fluid Vortex
        if (distSq < curRadiusSq) {
          const dist = Math.sqrt(distSq);
          const forceRatio = 1 - dist / curRadius;
          const force = forceRatio * forceRatio * 8; // Gentle liquid push
          const angle = Math.atan2(dy, dx);

          // Liquid vortex swirling tangent
          const swirlAngle = angle + (Math.PI / 2) * forceRatio;

          vx[i] += Math.cos(swirlAngle) * force;
          vy[i] += Math.sin(swirlAngle) * force;

          const fade = dist / curRadius;
          // Softly pulse opacity up when disturbed
          alphas[i] = alphas[i] * 0.9 + (fade * 0.7) * 0.1;
          sizes[i] = sizes[i] * 0.95 + (baseSizes[i] * 1.3) * 0.05;
        } else {
          // Soft spring return
          vx[i] += (targetX - px) * 0.015;
          vy[i] += (targetY - py) * 0.015;

          const twinkle = Math.sin(time * 1.5 + phase) * 0.2;
          alphas[i] += (0.4 + twinkle - alphas[i]) * 0.05;
          sizes[i] += (baseSizes[i] - sizes[i]) * 0.05;
        }

        vx[i] *= 0.91; // Very fluid, low friction
        vy[i] *= 0.91;

        posX[i] += vx[i];
        posY[i] += vy[i];
      }

      // 4. Render Liquid Orbs with Additive Blending (Screen)
      ctx.globalCompositeOperation = 'screen';
      
      for (let i = 0; i < totalParticles; i++) {
        if (alphas[i] > 0.02) {
          const px = posX[i];
          const py = posY[i];
          const sz = sizes[i];
          const colorIdx = colorIndices[i];
          
          ctx.globalAlpha = alphas[i];
          
          // Draw the pre-rendered glowing orb canvas centered on the particle
          ctx.drawImage(
            orbCanvases[colorIdx], 
            px - sz, 
            py - sz, 
            sz * 2, 
            sz * 2
          );
        }
      }

      // Reset composite operation for the wand cursor
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;

      // 5. Interactive Magnetic Lens Wand Cursor
      if (!isIdle) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(curX, curY, curRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();

        // Multi-chromatic center magic orb
        const cursorGlow = ctx.createRadialGradient(curX, curY, 0, curX, curY, 22);
        cursorGlow.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        cursorGlow.addColorStop(0.3, 'rgba(255, 20, 147, 0.65)');
        cursorGlow.addColorStop(0.65, 'rgba(0, 255, 255, 0.4)');
        cursorGlow.addColorStop(1, 'rgba(255, 234, 0, 0)');

        ctx.fillStyle = cursorGlow;
        ctx.beginPath();
        ctx.arc(curX, curY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [revealRadius, mode]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-72px)] min-h-[640px] overflow-hidden select-none bg-[#08090e]"
    >
      {/* 1. Underlying High-Resolution Shubhashree Sahu Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          key={activePhoto.id}
          src={activePhoto.url}
          alt={activePhoto.name}
          className="w-full h-full object-cover object-center filter brightness-105 contrast-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10]/80 via-transparent to-[#0b0c10]/40 pointer-events-none" />
      </div>

      {/* 2. Interactive Pure Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none"
      />

      {/* 3. Floating Interactive Controls Pill Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 w-[95vw] sm:w-auto rounded-3xl sm:rounded-full glass-panel bg-black/60 backdrop-blur-xl border border-white/15 shadow-2xl">
        
        {/* Effect Mode Selectors */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/5">
          <button
            onClick={() => setMode('colorful-dust')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'colorful-dust'
                ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white shadow-lg shadow-pink-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Colorful Dust</span>
          </button>

          <button
            onClick={() => setMode('neon-hologram')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'neon-hologram'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Neon Hologram</span>
          </button>

          <button
            onClick={() => setMode('solar-flame')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mode === 'solar-flame'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-amber-500/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Solar Ember</span>
          </button>
        </div>

        <div className="hidden sm:block w-px h-5 bg-white/10" />

        {/* Photo Switcher Quick Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {BACKGROUND_PHOTOS.map((photo, i) => (
              <button
                key={photo.id}
                onClick={() => handleSelectPhoto(i)}
                className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                  activePhotoIdx === i
                    ? 'border-rose-400 scale-110 shadow-md shadow-rose-500/40'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
                title={`Portrait: ${photo.name}`}
              >
                <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <span className="hidden lg:inline text-[11px] text-slate-300 font-medium ml-1">
            {activePhoto.name}
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-full bg-white/5 hidden md:inline">
          Tip: Click for color shockwave
        </span>
      </div>
    </div>
  );
};
