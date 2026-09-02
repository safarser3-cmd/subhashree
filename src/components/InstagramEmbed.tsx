import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Instagram } from 'lucide-react';

interface InstagramEmbedProps {
  postUrl: string;
}

let instagramScriptPromise: Promise<void> | null = null;

const loadInstagramScript = (): Promise<void> => {
  if (window.instgrm?.Embeds?.process) return Promise.resolve();
  if (instagramScriptPromise) return instagramScriptPromise;

  instagramScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="instagram.com/embed.js"]'
    );
    const script = existingScript || document.createElement('script');
    let attempts = 0;

    const checkReady = () => {
      if (window.instgrm?.Embeds?.process) {
        resolve();
        return;
      }
      attempts += 1;
      if (attempts >= 50) {
        reject(new Error('Instagram embed script did not load.'));
        return;
      }
      window.setTimeout(checkReady, 100);
    };

    script.addEventListener('load', checkReady, { once: true });
    script.addEventListener('error', () => reject(new Error('Instagram embed script failed to load.')), { once: true });

    if (!existingScript) {
      script.async = true;
      script.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(script);
    } else {
      checkReady();
    }
  }).catch((error) => {
    instagramScriptPromise = null;
    throw error;
  });

  return instagramScriptPromise;
};

export const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ postUrl }) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    const element = embedRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !embedRef.current) return;

    setIsUnavailable(false);
    const container = embedRef.current;
    const timeoutId = window.setTimeout(() => setIsUnavailable(true), 15000);
    const mutationObserver = new MutationObserver(() => {
      const iframe = container.querySelector('iframe');
      if (!iframe) return;
      iframe.addEventListener('load', () => window.clearTimeout(timeoutId), { once: true });
      mutationObserver.disconnect();
    });
    mutationObserver.observe(container, { childList: true, subtree: true });

    loadInstagramScript()
      .then(() => window.instgrm?.Embeds?.process())
      .catch(() => setIsUnavailable(true));

    return () => {
      window.clearTimeout(timeoutId);
      mutationObserver.disconnect();
    };
  }, [isVisible, postUrl]);

  return (
    <div ref={embedRef} className="w-full bg-white flex items-center justify-center overflow-x-hidden">
      {!isVisible ? (
        <div className="h-16 w-16 rounded-full border-2 border-slate-200 border-t-slate-500 animate-spin" aria-label="Loading Instagram post" />
      ) : isUnavailable ? (
        <div className="p-8 text-center text-slate-600">
          <Instagram className="mx-auto mb-3 h-8 w-8" />
          <p className="font-semibold">This post is unavailable</p>
          <a className="mt-2 inline-flex items-center gap-1 text-sm text-sky-600 hover:underline" href={postUrl} target="_blank" rel="noreferrer">
            Open on Instagram <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={postUrl}
          data-instgrm-version="14"
          style={{ background: '#FFF', border: 0, margin: '0 auto', maxWidth: 540, minWidth: 0, padding: 0, width: '100%' }}
        />
      )}
    </div>
  );
};
