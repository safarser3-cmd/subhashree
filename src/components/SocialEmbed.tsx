import React, { useEffect, useRef, useState } from 'react';
import { SocialPost } from '../types';
import { Instagram, Youtube, ExternalLink, RefreshCw } from 'lucide-react';

interface SocialEmbedProps {
  post: SocialPost;
}

// Global script loader for Instagram embed.js
let isInstagramScriptLoaded = false;
let isInstagramScriptLoading = false;

function loadInstagramScript(onLoaded: () => void) {
  if (typeof window === 'undefined') return;

  if (window.instgrm) {
    isInstagramScriptLoaded = true;
    onLoaded();
    return;
  }

  if (isInstagramScriptLoaded) {
    onLoaded();
    return;
  }

  // Check if script element is already in DOM
  const existingScript = document.querySelector('script[src*="instagram.com/embed.js"]');
  if (existingScript) {
    existingScript.addEventListener('load', () => {
      isInstagramScriptLoaded = true;
      onLoaded();
    });
    return;
  }

  if (!isInstagramScriptLoading) {
    isInstagramScriptLoading = true;
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isInstagramScriptLoaded = true;
      isInstagramScriptLoading = false;
      onLoaded();
    };
    script.onerror = () => {
      isInstagramScriptLoading = false;
    };
    document.body.appendChild(script);
  }
}

export const SocialEmbed: React.FC<SocialEmbedProps> = ({ post }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedProcessed, setEmbedProcessed] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isInstagram = post.platform === 'instagram';
  const isYouTube = post.platform === 'youtube';

  // Helper to extract YouTube video ID
  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('embed/')) return url;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube-nocookie.com/embed/${match[2]}`
      : null;
  };

  // Helper to extract Instagram permalink from URL or raw blockquote HTML
  const getInstagramPermalink = (content: string): string => {
    if (!content) return '';
    // If it's a URL
    if (content.startsWith('http://') || content.startsWith('https://')) {
      return content.split('?')[0];
    }
    // If it's a blockquote with data-instgrm-permalink
    const permalinkMatch = content.match(/data-instgrm-permalink=["']([^"']+)["']/i);
    if (permalinkMatch && permalinkMatch[1]) {
      return permalinkMatch[1];
    }
    // If it's a blockquote with href
    const hrefMatch = content.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1];
    }
    return content;
  };

  // Process Instagram Embed
  useEffect(() => {
    if (!isInstagram || post.mediaType !== 'video_embed' || !post.mediaUrl) {
      return;
    }

    setEmbedProcessed(false);
    setHasError(false);

    const triggerProcess = () => {
      if (typeof window !== 'undefined' && window.instgrm?.Embeds) {
        try {
          window.instgrm.Embeds.process();
          if (containerRef.current) {
            window.instgrm.Embeds.process(containerRef.current);
          }
          setEmbedProcessed(true);
        } catch (e) {
          console.warn('Instagram Embeds.process error:', e);
        }
      }
    };

    loadInstagramScript(() => {
      triggerProcess();
    });

    // Schedule retries for dynamic React mounts
    const timers = [
      setTimeout(triggerProcess, 100),
      setTimeout(triggerProcess, 500),
      setTimeout(triggerProcess, 1500),
      setTimeout(triggerProcess, 3000)
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [post.id, post.mediaUrl, isInstagram, post.mediaType]);

  // If post has an image
  if (post.mediaType === 'image' && post.mediaUrl) {
    return (
      <div className="relative h-80 w-full bg-black overflow-hidden group">
        <img
          src={post.mediaUrl}
          alt={post.caption || 'Social Media Post'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // If post is YouTube
  if (isYouTube && post.mediaUrl) {
    const embedUrl = getYouTubeEmbedUrl(post.mediaUrl);
    if (embedUrl) {
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src={embedUrl}
            title={post.caption || 'YouTube Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }
  }

  // If post is Instagram Embed
  if (isInstagram && post.mediaType === 'video_embed' && post.mediaUrl) {
    const rawContent = post.mediaUrl.trim();
    let permalink = getInstagramPermalink(rawContent);
    
    // Clean permalink and ensure it ends with /embed/
    if (permalink) {
      permalink = permalink.split('?')[0]; // Remove query params
      if (!permalink.endsWith('/')) {
        permalink += '/';
      }
      permalink += 'embed/';
    }

    return (
      <div className="relative w-full flex flex-col items-center justify-center p-0 bg-black/40 rounded-2xl border border-white/5 overflow-hidden">
        {permalink ? (
          <iframe
            src={permalink}
            className="w-full h-[400px] border-0"
            frameBorder="0"
            scrolling="no"
            allowTransparency={true}
            allowFullScreen={true}
          />
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Instagram className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Invalid Instagram Link</p>
          </div>
        )}

        {/* Fallback Direct Link Action Bar */}
        <div className="w-full p-3 bg-[#13151c] border-t border-white/5 flex items-center justify-between text-xs text-slate-400 px-4">
          <div className="flex items-center gap-1.5 text-pink-400 font-medium">
            <Instagram className="w-4 h-4" />
            <span>Instagram Post</span>
          </div>
          {permalink && (
            <a
              href={permalink.replace('/embed/', '/')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white text-xs font-bold py-1.5 px-3 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 transition-colors"
            >
              <span>View on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // Fallback for custom / other embeds
  if (post.mediaType === 'video_embed' && post.mediaUrl) {
    return (
      <div 
        ref={containerRef}
        className="relative w-full bg-black/20 p-4 rounded-2xl flex items-center justify-center overflow-hidden" 
        dangerouslySetInnerHTML={{ __html: post.mediaUrl }} 
      />
    );
  }

  return null;
};
