import { useEffect, useRef } from 'react';
import gsap from 'gsap';

// Hook for GSAP Stagger Entrance Animations
export function useGSAPReveal(selector: string, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(selector);
      if (elements && elements.length > 0) {
        gsap.fromTo(
          elements,
          {
            opacity: 0,
            y: 35,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, deps);

  return containerRef;
}

// Hook for Animated GSAP Number Counter
export function useGSAPCounter(targetValue: number, duration: number = 2) {
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: targetValue,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (elementRef.current) {
            elementRef.current.innerText = Math.floor(obj.val).toLocaleString();
          }
        },
      });
    });

    return () => ctx.revert();
  }, [targetValue, duration]);

  return elementRef;
}

// Magnetic Button Interaction with GSAP
export function applyGSAPMagnetic(element: HTMLElement, strength: number = 0.35) {
  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      rotation: x * 0.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}
