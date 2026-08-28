import React from 'react';
import { ThreeParticleRevealCanvas } from './ThreeParticleRevealCanvas';

interface HeroSectionProps {
  onExploreGallery: () => void;
  onOpenSubmitModal: () => void;
  onScrollToFanWall: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreGallery,
  onOpenSubmitModal,
  onScrollToFanWall,
}) => {
  return <ThreeParticleRevealCanvas onExploreGallery={onExploreGallery} />;
};
