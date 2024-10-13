import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import image from '@/public/hero_image.svg';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Hero() {
  return (
    <div className=":flex mx-auto mt-44 flex max-w-screen-2xl items-center justify-center gap-12 overflow-hidden sm:px-12 md:px-8">
      <div className="max-w-2xl flex-none space-y-5">
        <Link
          href="/services"
          className="inline-flex items-center gap-x-6 rounded-full border p-1 pr-6 text-sm font-medium shadow-md duration-150 hover:bg-secondary hover:text-secondary-foreground"
        >
          <Badge variant="default" className="rounded-full px-3 py-1">
            Services
          </Badge>
          <p className="flex items-center">
            View our services from here
            <ChevronRight className="h-5 w-5" />
          </p>
        </Link>
        <h1 className="text-4xl font-extrabold sm:text-5xl">Registration & Compliance made Easy</h1>
        <p className="text-muted-foreground">
          Streamline your business with our Registration & Compliance services. We simplify the
          process, ensuring you meet all legal requirements effortlessly, so you can focus on
          growing your business.
        </p>
        <div className="flex items-center gap-x-3 sm:text-sm">
          <Button size="lg" className="rounded-full">
            Get started
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
          <Button variant="ghost" size="lg" className="rounded-full">
            Contact sales
            <ChevronRight className="ml-1 h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="hidden xl:block">
        <Image
          className="max-w-xl p-5"
          src={image}
          alt="Concept Logo"
          width={600}
          height={600}
          priority
        />
      </div>
    </div>
  );
}
