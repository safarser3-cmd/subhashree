import React, { useRef, useEffect } from 'react';
import { applyGSAPMagnetic } from '../hooks/useGSAPAnimations';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.3,
  className = '',
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;
    const cleanup = applyGSAPMagnetic(buttonRef.current, strength);
    return cleanup;
  }, [strength]);

  return (
    <button ref={buttonRef} className={`will-change-transform ${className}`} {...props}>
      {children}
    </button>
  );
};
