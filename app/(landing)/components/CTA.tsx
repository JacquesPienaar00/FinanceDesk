import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

export default function HowItWorksSection() {
  return (
    <section className="mx-auto flex max-w-screen-2xl justify-center px-8 py-20">
      <div className="w-full">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Enhance productivity with seamless user access.</h2>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex items-center justify-center rounded-full bg-primary px-8 py-5 text-primary-foreground">
            <h3 className="text-xl font-semibold">1. Create account</h3>
          </div>
          <div className="flex items-center justify-center rounded-full bg-secondary px-8 py-5 text-secondary-foreground">
            <h3 className="text-xl font-semibold">2. Make an order</h3>
          </div>
          <div className="flex items-center justify-center rounded-full bg-secondary px-8 py-5 text-secondary-foreground">
            <h3 className="text-xl font-semibold">3. Fill in the info</h3>
          </div>
        </div>
        <div className="mt-12 text-center">
          <h3 className="mb-4 text-xl font-semibold">Create your account & start your journey</h3>
          <p className="mb-10 text-muted-foreground">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque facilisis eros a
            libero venenatis, sed vehicula ipsum ullamcorper.
          </p>
        </div>
      </div>
    </section>
  );
}
