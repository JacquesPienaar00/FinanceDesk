'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Quote } from 'lucide-react';

const slides = [
  {
    quote:
      'Shaun is very professional and knowledgeable. Would recommend him for individuals seeking an accountant. What an absolute pleasure to work with like-minded human beings whose knowledge and kindness has proved invaluable.',
    name: 'Judith Black',
    title: 'CEO of Workcation',
  },
  {
    quote:
      "Shaun has solved all my Tax issues in a most professional, dedicated way. I've been in the Real Estate industry for over 30 years and we have a lot of red tape within our industry. But dealing with Shaun has made it so easy and flawless. The best advice and prompt service. No more late submissions or interest charged. I now have the time to focus on running my business and Shaun takes care of all the finances and Taxes. I can recommend them to every small or large enterprise with confidence.",
    name: 'Jane Doe',
    title: 'Founder of ExampleCo',
  },
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative isolate min-h-[450px] overflow-hidden bg-background p-5 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <div className="relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === activeIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Quote className="mx-auto h-8 w-8 text-primary" />
              <figure className="mt-10">
                <blockquote className="text-center text-xl font-semibold leading-8 text-foreground sm:text-2xl sm:leading-9">
                  <p>{slide.quote}</p>
                </blockquote>
                <figcaption className="mt-10">
                  <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                    <div className="font-semibold text-primary">{slide.name}</div>
                    <svg
                      width={3}
                      height={3}
                      viewBox="0 0 2 2"
                      aria-hidden="true"
                      className="fill-current text-muted-foreground"
                    >
                      <circle r={1} cx={1} cy={1} />
                    </svg>
                    <div className="text-muted-foreground">{slide.title}</div>
                  </div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
