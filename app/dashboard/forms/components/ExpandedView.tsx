'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExpandedViewProps {
  product: {
    name: string;
    thumbnail: {
      src: string;
    };
  };
  onClose: () => void;
  children: React.ReactNode;
}

export function ExpandedView({ product, onClose, children }: ExpandedViewProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-background transition-opacity duration-300 ease-in-out">
      <div className="min-h-screen p-4 md:p-8">
        <Button onClick={onClose} className="absolute right-4 top-4" variant="ghost" size="icon">
          <X className="h-6 w-6" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full">
            <Image
              src={product.thumbnail.src}
              alt={product.name}
              width={90}
              height={90}
              className="h-18 w-18 text-primary-foreground"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
