'use client';

import React from 'react';

import Hero from './components/hero';
import Header from '@/components/navigation/header';
import RegistrationSection from './components/Registration';
import CTA from './components/CTA';
import Footer from '@/components/navigation/footer';
import Testimonial from './components/testimonial';
import ServicesSection from './components/Services';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <ServicesSection />
      <RegistrationSection />
      <CTA />
      <Testimonial />
      <Footer />
    </>
  );
}
