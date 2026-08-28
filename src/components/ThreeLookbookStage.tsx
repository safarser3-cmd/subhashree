import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Sparkles, Layers, Eye } from 'lucide-react';

interface LookbookItem {
  id: string;
  title: string;
  tag: string;
  image: string;
  color: string;
}

const R2_BASE = 'https://pub-f5a2d26958f94a9692b716b327178122.r2.dev/Subhashree%20home%20page';

const SPOTLIGHT_LOOKS: LookbookItem[] = [
  {
    id: '1',
    title: 'Sambalpuri Silk Ikat Elegance',
    tag: 'Heritage Drapes',
    image: `${R2_BASE}/hero1.jpg`,
    color: '#f43f5e',
  },
  {
    id: '2',
    title: 'Sunset Velvet Red Carpet',
    tag: 'Glamour Gala',
    image: `${R2_BASE}/hero2.jpg`,
    color: '#fb7185',
  },
  {
    id: '3',
    title: 'Golden Hour Temple Sanctuary',
    tag: 'Spiritual Grace',
    image: `${R2_BASE}/hero3.jpg`,
    color: '#f59e0b',
  },
];

export const ThreeLookbookStage: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  const activeLook = SPOTLIGHT_LOOKS[currentLookIndex];

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // 3D Rotating Card / Hologram Mesh
    const textureLoader = new THREE.TextureLoader();
    const cardTexture = textureLoader.load(activeLook.image);

    const cardGeometry = new THREE.PlaneGeometry(3.2, 4.4, 32, 32);
    const cardMaterial = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });

    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(cardMesh);

    // Glowing rim frame
    const frameGeometry = new THREE.BoxGeometry(3.3, 4.5, 0.08);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x330510,
    });
    const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
    frameMesh.position.z = -0.05;
    scene.add(frameMesh);

    // Surrounding 3D Orbiting Halo Particles
    const haloParticleCount = 180;
    const haloGeo = new THREE.BufferGeometry();
    const haloPos = new Float32Array(haloParticleCount * 3);
    for (let i = 0; i < haloParticleCount; i++) {
      const angle = (i / haloParticleCount) * Math.PI * 2;
      const radius = 2.4 + (Math.random() - 0.5) * 0.4;
      haloPos[i * 3] = Math.cos(angle) * radius;
      haloPos[i * 3 + 1] = Math.sin(angle) * radius * 1.3;
      haloPos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));

    const haloMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xf59e0b,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.8,
    });
    const haloPoints = new THREE.Points(haloGeo, haloMat);
    scene.add(haloPoints);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfb7185, 3, 20);
    pointLight.position.set(3, 3, 4);
    scene.add(pointLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 2, 20);
    goldLight.position.set(-3, -2, 3);
    scene.add(goldLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationY = 0;
    let targetRotationX = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / width - 0.5;
      const y = (e.clientY - rect.top) / height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    mount.addEventListener('mousemove', handlePointerMove);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      if (autoRotate) {
        targetRotationY = Math.sin(time * 0.8) * 0.35 + mouseX * 0.8;
        targetRotationX = Math.cos(time * 0.6) * 0.15 - mouseY * 0.5;
      } else {
        targetRotationY = mouseX * 1.5;
        targetRotationX = -mouseY * 1.2;
      }

      cardMesh.rotation.y += (targetRotationY - cardMesh.rotation.y) * 0.08;
      cardMesh.rotation.x += (targetRotationX - cardMesh.rotation.x) * 0.08;
      frameMesh.rotation.y = cardMesh.rotation.y;
      frameMesh.rotation.x = cardMesh.rotation.x;

      haloPoints.rotation.z = time * 0.4;
      haloPoints.rotation.y = time * 0.2;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mount.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      cardGeometry.dispose();
      cardMaterial.dispose();
      frameGeometry.dispose();
      frameMaterial.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [currentLookIndex, autoRotate]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel-glow border border-rose-500/30 p-6 flex flex-col items-center justify-between">
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-4 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-syne text-xs font-bold text-white uppercase tracking-wider">
            3D Holographic Lookbook
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer ${
              autoRotate ? 'bg-rose-500 text-white' : 'bg-white/10 text-slate-300'
            }`}
            title="Toggle 3D Auto Spin"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">{autoRotate ? 'Spin On' : 'Manual'}</span>
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div ref={mountRef} className="w-full h-80 sm:h-96 relative cursor-grab active:cursor-grabbing" />

      {/* Look Selector Pills */}
      <div className="w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider block">
            {activeLook.tag}
          </span>
          <h4 className="font-syne text-sm font-bold text-white">{activeLook.title}</h4>
        </div>

        <div className="flex items-center gap-1.5">
          {SPOTLIGHT_LOOKS.map((look, idx) => (
            <button
              key={look.id}
              onClick={() => setCurrentLookIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentLookIndex === idx
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-white/5 hover:bg-white/15 text-slate-300'
              }`}
            >
              Look #{idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
