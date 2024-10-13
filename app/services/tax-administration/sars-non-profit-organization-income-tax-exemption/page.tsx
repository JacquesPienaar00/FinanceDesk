'use client';

import Footer from '@/components/navigation/footer';
import Header from '@/components/navigation/header';
import Image from 'next/image';
import { Product } from '@/context/CartProvider';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BuyingOptions from '@/components/eCommerce/BuyingOptions';
import { JSX, SVGProps } from 'react';

import productsvg from '@/public/hero_image.svg';
import taxAdministration from '@/public/icons/taxAdministration';

const calculateDiscountPercent = (mrp: number, salePrice: number): number => {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - salePrice) / mrp) * 100);
};

export default function Component() {
  const product: Product = {
    name: taxAdministration[4].text,
    title: taxAdministration[4].text,
    thumbnail: taxAdministration[4].src.src,
    id: taxAdministration[4].id.toString(),
    mrp: Number(taxAdministration[4].mrp),
    salePrice: Number(taxAdministration[4].salePrice),
    category: taxAdministration[4].category,
  };

  const percentOff =
    product?.salePrice > 0 ? calculateDiscountPercent(product.mrp, product.salePrice) : 0;

  return (
       <div className="">
      <Header />
      <main className="mt-44 flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  {product.title}
                </h1>
                <p className="max-w-[600px] text-lg text-gray-600 md:text-xl">
                  Elevate your business to new heights with our comprehensive service. Unlock a
                  world of possibilities and take your success to the next level.
                </p>
              </div>
              <Card className="relative overflow-hidden shadow-lg">
                {percentOff > 0 && (
                  <Badge className="absolute right-3 top-3 bg-primary text-white">
                    {percentOff}% Off
                  </Badge>
                )}
                <CardHeader className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={product?.thumbnail}
                        alt={product?.title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">{product?.title}</h2>
                      <p className="text-sm text-gray-500">{product?.category}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-baseline space-x-3">
                    {percentOff > 0 ? (
                      <>
                        <span className="text-3xl font-bold text-green-600">
                          R{product.salePrice}
                        </span>
                        <span className="text-lg text-gray-500 line-through">R{product.mrp}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-green-600">R{product.mrp}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-6">
                  <BuyingOptions product={product} />
                </CardFooter>
              </Card>
            </div>
            <div className="relative inset-5 overflow-hidden rounded-xl">
              <Image
                src={productsvg}
                alt="Service"
                width={1000}
                height={1000}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0" />
            </div>
          </div>
        </div>
      </main>
      <section className="bg-gray-100 py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-semibold text-secondary">
                Service Details
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Elevate Your Business with Our Premium Service
              </h2>
              <p className="max-w-[600px] text-gray-600 md:text-lg">
                Our premium service is designed to help you achieve your business goals. With a
                comprehensive suite of features and personalized support, we'll work closely with
                you to optimize your operations and drive sustainable growth.
              </p>
            </div>
            <div className="space-y-6">
              {[
                {
                  title: 'Tailored Solutions',
                  description:
                    'Our team will work closely with you to understand your unique needs and develop a customized solution that fits your business.',
                },
                {
                  title: 'Dedicated Support',
                  description:
                    'Enjoy personalized support from our expert team, who will be available to assist you every step of the way.',
                },
                {
                  title: 'Scalable Solutions',
                  description:
                    'Our service can grow with your business, ensuring you have the resources and support you need to achieve your long-term goals.',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="mt-1 rounded-full bg-green-500 p-1">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function CheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
