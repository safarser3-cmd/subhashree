import React from 'react';
import { ThreeParticleRevealCanvas } from './ThreeParticleRevealCanvas';

interface HeroSectionProps {
  onExploreGallery?: () => void;
  onOpenSubmitModal?: () => void;
  onScrollToFanWall?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section id="home" className="relative w-full overflow-hidden bg-[#090a0f]">
      {/* Full Pure Particle Canvas with Pink, Blue, Yellow Mix that reveals Background Image on Hover */}
      <ThreeParticleRevealCanvas />
    </section>
  );
};
