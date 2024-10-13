import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import shaun from '@/public/images/Shaun.webp';

export default function RegistrationSection() {
  return (
    <section className="px-8 py-20">
      <div className="flex justify-center p-5 text-primary">
        <div className="flex justify-center p-5 text-primary">
          <h1 className="rounded-full bg-accent px-8 py-2 text-2xl font-bold">Services</h1>
        </div>
      </div>

      <div className="mx-auto flex max-w-screen-2xl justify-center">
        <div className="flex flex-col items-center gap-10 lg:flex-row">
          <div className="flex-1 rounded-2xl border bg-background p-10 shadow-xl lg:ml-32">
            <h2 className="mb-4 text-3xl font-bold">
              Simplify your start-up process with a full suite of compliance and registration
              solutions
            </h2>
            <p className="mb-6 text-muted-foreground">
              Starting a new business can be complex and time-consuming, but it doesn't have to be.
              Our full suite of compliance and registration solutions is designed to simplify your
              start-up process, allowing you to focus on what matters most: growing your business.
            </p>
            <div className="flex items-start space-x-4">
              <CheckCircle className="mt-1 text-primary" />
              <div>
                <span className="font-semibold">Cost Effective</span>
                <p className="text-muted-foreground">
                  We provide high-quality, responsive web design at competitive prices, ensuring you
                  get great value without breaking the bank.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex-1 lg:-ml-[50px] lg:mr-32 lg:mt-0 lg:pl-8">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-background shadow-xl">
              <Image src={shaun} alt="Person" width={900} height={900} className="h-auto w-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
