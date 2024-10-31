'use client';

import Image from 'next/image';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PfDataCounter } from '@/app/dashboard/forms/components/pfDataCounter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  product: {
    id: number;
    name: string;
    thumbnail: {
      src: string;
    };
  };
  onClick: () => void;
}

export function ServiceCard({ product, onClick }: ServiceCardProps) {
  return (
    <Card
      className="group relative flex h-[300px] w-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary opacity-10 transition-all duration-300 group-hover:scale-150"></div>
      <CardHeader className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <Image
            src={product.thumbnail.src}
            alt={product.name}
            width={60}
            height={60}
            className="h-15 w-15 rounded-full bg-secondary p-2 text-primary-foreground transition-transform duration-300 group-hover:scale-110"
          />
          <div className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            <PfDataCounter serviceId={product.id.toString()} />
          </div>
        </div>
        <CardTitle className="line-clamp-2 text-xl transition-colors duration-300 group-hover:text-primary">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-between">
        <Button
          variant="ghost"
          className="mt-4 w-full justify-between text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground"
        >
          Fill out form
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
