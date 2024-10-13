import Image from 'next/image';
import { Button } from '@/components/ui/button';

// Assuming these images are available in your project
import left from '@/public/images/users-people-get-inspired.svg';
import middle from '@/public/images/cryptowallets.svg';
import right from '@/public/images/marketing-a-b-testing.svg';

interface Service {
  title: string;
  description: string;
  imgSrc: string;
}

const services: Service[] = [
  {
    title: 'Budgeting and Forecasting',
    description:
      "Create accurate budgets and forecasts to guide your non-profit's financial future.",
    imgSrc: left,
  },
  {
    title: 'Tax Planning and Compliance',
    description: 'Expert guidance to ensure your business is tax-efficient and compliant.',
    imgSrc: middle,
  },
  {
    title: 'Financial Reporting and Analysis',
    description: 'Detailed financial reports to help you make informed decisions.',
    imgSrc: right,
  },
];

function ServiceCard({ title, description, imgSrc }: Service) {
  return (
    <div className="rounded-3xl border p-8 transition-all hover:border-gray-300 hover:shadow-xl dark:bg-white/10">
      <Image
        src={imgSrc}
        alt={title}
        width={250}
        height={250}
        className="mx-auto mb-4 rounded-lg bg-white p-4"
      />
      <h3 className="mb-2 text-center text-xl font-semibold">{title}</h3>
      <p className="mb-4 text-center text-muted-foreground">{description}</p>
      <div className="flex justify-center">
        <Button
          variant="secondary"
          className="w-32 rounded-full hover:bg-primary hover:text-primary-foreground"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section className="px-8 py-20">
      <div className="flex justify-center p-5 text-primary">
        <h1 className="rounded-full bg-accent px-8 py-2 text-2xl font-bold">Services</h1>
      </div>
      <div className="mb-12 text-center">
        <h2 className="text-5xl font-extrabold">Easy services for your business</h2>
      </div>
      <div className="mx-auto flex max-w-screen-2xl justify-center">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
