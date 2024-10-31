import { ServicesWrapper } from './ServicesWrapper';

const serviceIds = Array.from({ length: 29 }, (_, i) => (i + 1).toString());

export default function ServicesPage() {
  return (
    <div className="mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Our Services</h1>
      <ServicesWrapper serviceIds={serviceIds} />
    </div>
  );
}
