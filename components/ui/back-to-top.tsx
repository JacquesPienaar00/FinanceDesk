'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToTopButtonProps {
  threshold?: number;
  position?: 'bottom-left' | 'bottom-right';
  className?: string;
}

export default function BackToTopButton({
  threshold = 200,
  position = 'bottom-left',
  className = '',
}: BackToTopButtonProps = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const positionClasses = {
    'bottom-left': 'bottom-4 left-10',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <Button
      className={`fixed ${positionClasses[position]} rounded-full p-2 shadow-lg transition-opacity duration-300 ${className} ${
        isVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={scrollToTop}
      aria-label="Back to top"
      aria-hidden={!isVisible}
    >
      <ArrowUp className="h-6 w-6" />
    </Button>
  );
}
