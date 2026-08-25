import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeGlamourCanvasProps {
  themeMode?: 'stardust' | 'silk' | 'sparkle';
  interactive?: boolean;
}

export const ThreeGlamourCanvas: React.FC<ThreeGlamourCanvasProps> = ({
  themeMode = 'stardust',
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeEffect, setActiveEffect] = useState<'stardust' | 'silk' | 'sparkle'>(themeMode);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0c10, 0.0018);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Mouse Tracking with Easing
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;
      mouse.targetX = (clientX / width) * 2 - 1;
      mouse.targetY = -(clientY / height) * 2 + 1;
    };

    window.addEventListener('mousemove', onMouseMove);

    // 1. Particle Cloud (Stardust & Floating Rose Gold Orbs)
    const particleCount = 750;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const originalPositions = new Float32Array(particleCount * 3);

    const roseColor = new THREE.Color(0xf43f5e);
    const pinkColor = new THREE.Color(0xfb7185);
    const goldColor = new THREE.Color(0xf59e0b);
    const violetColor = new THREE.Color(0xc084fc);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 260;
      const y = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 200;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Color variation
      const rand = Math.random();
      const chosenColor =
        rand < 0.4 ? roseColor : rand < 0.7 ? pinkColor : rand < 0.9 ? goldColor : violetColor;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;

      scales[i] = Math.random() * 2.5 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Texture for glowing circular particles
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(251, 113, 133, 0.9)');
      gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.4)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 3.2,
      map: createParticleTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      opacity: 0.85,
    });

    const particleSystem = new THREE.Points(geometry, particleMaterial);
    scene.add(particleSystem);

    // 2. 3D Floating Elegant Torus Knot / Silk Ribbon Mesh
    const knotGeometry = new THREE.TorusKnotGeometry(16, 4.2, 120, 20, 2, 3);
    const knotMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf43f5e,
      emissive: 0x4a0e20,
      roughness: 0.15,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.35,
    });

    const knotMesh = new THREE.Mesh(knotGeometry, knotMaterial);
    knotMesh.position.set(45, 5, -20);
    knotMesh.scale.set(0.9, 0.9, 0.9);
    scene.add(knotMesh);

    // 3. Floating Sparkle Rings
    const ringGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(8, 8.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });

    for (let r = 0; r < 4; r++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60
      );
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xf43f5e, 3, 150);
    pointLight1.position.set(40, 30, 40);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf59e0b, 2.5, 150);
    pointLight2.position.set(-40, -20, 30);
    scene.add(pointLight2);

    // Click burst effect
    const handleClick = (e: MouseEvent) => {
      const posAttr = geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        arr[i * 3] += (Math.random() - 0.5) * 35;
        arr[i * 3 + 1] += (Math.random() - 0.5) * 35;
        arr[i * 3 + 2] += (Math.random() - 0.5) * 35;
      }
      posAttr.needsUpdate = true;
    };

    if (interactive) {
      container.addEventListener('click', handleClick);
    }

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Rotate scene & objects with mouse
      scene.rotation.y = mouse.x * 0.25;
      scene.rotation.x = -mouse.y * 0.15;

      // Animate Knot
      knotMesh.rotation.x = elapsedTime * 0.35 + mouse.y * 0.5;
      knotMesh.rotation.y = elapsedTime * 0.45 + mouse.x * 0.5;
      knotMesh.position.y = Math.sin(elapsedTime * 1.2) * 5;

      // Animate Rings
      ringGroup.children.forEach((ring, idx) => {
        ring.rotation.x += 0.01 * (idx + 1);
        ring.rotation.y += 0.015 * (idx + 1);
      });

      // Animate particles wave
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];

        pos[i3] = ox + Math.sin(elapsedTime * 0.8 + oy * 0.05) * 3;
        pos[i3 + 1] = oy + Math.cos(elapsedTime * 0.6 + ox * 0.05) * 3;
        pos[i3 + 2] = oz + Math.sin(elapsedTime * 0.5 + oz * 0.05) * 2;
      }
      geometry.attributes.position.needsUpdate = true;

      // Move lights with time
      pointLight1.position.x = Math.sin(elapsedTime * 0.7) * 50;
      pointLight1.position.y = Math.cos(elapsedTime * 0.5) * 30;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationFrameId);

      // Dispose resources
      geometry.dispose();
      particleMaterial.dispose();
      knotGeometry.dispose();
      knotMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeEffect, interactive]);

  return (
    <div className="absolute inset-0 pointer-events-auto overflow-hidden z-0">
      <div ref={containerRef} className="w-full h-full cursor-crosshair opacity-85" />

      {/* Floating 3D Particle Controls */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 p-1.5 rounded-full bg-[#13151c]/70 backdrop-blur-md border border-white/10 text-[11px] font-sans text-slate-300 shadow-xl">
        <span className="px-2 text-rose-400 font-bold">3D Ambient:</span>
        <button
          onClick={() => setActiveEffect('stardust')}
          className={`px-2.5 py-1 rounded-full font-medium transition-all ${
            activeEffect === 'stardust'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'hover:text-white'
          }`}
        >
          Stardust
        </button>
        <button
          onClick={() => setActiveEffect('silk')}
          className={`px-2.5 py-1 rounded-full font-medium transition-all ${
            activeEffect === 'silk'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'hover:text-white'
          }`}
        >
          Silk Knot
        </button>
        <button
          onClick={() => setActiveEffect('sparkle')}
          className={`px-2.5 py-1 rounded-full font-medium transition-all ${
            activeEffect === 'sparkle'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'hover:text-white'
          }`}
        >
          Nebula
        </button>
      </div>
    </div>
  );
};
