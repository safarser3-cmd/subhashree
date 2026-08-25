import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GSAPMarquee } from './components/GSAPMarquee';
import { AboutSection } from './components/AboutSection';
import { GallerySection } from './components/GallerySection';
import { SocialFeedSection } from './components/SocialFeedSection';
import { FanArtSection } from './components/FanArtSection';
import { FanMessagesSection } from './components/FanMessagesSection';
import { LoveCalculatorSection } from './components/LoveCalculatorSection';
import { SubmitFanArtModal } from './components/SubmitFanArtModal';
import { Footer } from './components/Footer';
import { FanArtSubmission } from './types';
import { subscribeToFanArt, addFanArtToFirestore, likeFanArtInFirestore } from './lib/firestoreService';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Fan Art State synced with Firestore
  const [fanArts, setFanArts] = useState<FanArtSubmission[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToFanArt((fetchedArts) => {
      setFanArts(fetchedArts);
    });
    return () => unsubscribe();
  }, []);

  const [likedArtIds, setLikedArtIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('shubhashree_art_likes_v2');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAddFanArt = async (newArt: FanArtSubmission) => {
    await addFanArtToFirestore(newArt);
  };

  const handleLikeArt = (id: string) => {
    setLikedArtIds((prev) => {
      const next = new Set(prev);
      const isLiked = next.has(id);
      if (isLiked) {
        next.delete(id);
      } else {
        next.add(id);
      }

      const currentArt = fanArts.find(a => a.id === id);
      if (currentArt) {
        likeFanArtInFirestore(id, currentArt.likes + (isLiked ? -1 : 1));
      }

      try {
        localStorage.setItem('shubhashree_art_likes_v2', JSON.stringify(Array.from(next)));
      } catch {
        // Storage fallback
      }
      return next;
    });
  };

  // Scroll spy to update active section in navbar
  useEffect(() => {
    const handleScrollSpy = () => {
      const sections = ['home', 'about', 'gallery', 'social', 'fanart', 'fanwall'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy);
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0b0c10] text-[#e2e8f0] flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200 overflow-x-hidden">
      {/* Top Fixed Modern Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
      />

      {/* Main Fan Portal Modules */}
      <main className="flex-1 w-full overflow-hidden pt-[72px]">
        {/* Hero Influencer Showcase with Three.js & GSAP */}
        <HeroSection
          onExploreGallery={() => handleNavigate('gallery')}
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          onScrollToFanWall={() => handleNavigate('fanwall')}
        />

        {/* GSAP Smooth Infinite Marquee Ribbon */}
        <GSAPMarquee />

        {/* About Shubhashree: Pillars & Story */}
        <AboutSection />

        {/* Curated HD Photo & Lookbook Gallery */}
        <GallerySection />

        {/* Live Social Media Feed Stream */}
        <SocialFeedSection />

        {/* Community Fan Art & Edits Showcase */}
        <FanArtSection
          fanArts={fanArts}
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          onLikeArt={handleLikeArt}
          likedArtIds={likedArtIds}
        />

        {/* Fan Wall of Love & Best Wishes */}
        <FanMessagesSection />

        {/* Compatibility Love Meter with SUBHASHREE */}
        <LoveCalculatorSection />
      </main>

      {/* Modal for Fan Art / Video Edit Submissions */}
      <SubmitFanArtModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmit={handleAddFanArt}
      />

      {/* Modern Fan Club Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

