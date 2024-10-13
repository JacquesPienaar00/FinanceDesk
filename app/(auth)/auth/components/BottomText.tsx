'use client';
import FadeIn from '@/components/animation/FadeIn';
import React from 'react';

const BottomText = () => {
  return (
    <FadeIn delay={0.9} direction="up">
      <div className="border-t pt-12">
        <div className="space-y-2 text-center">
          <span className="block text-sm tracking-wide text-gray-500">
           Sign up or log in to access our dashboard and unlock the full range of features and benefits we offer.
          </span>
        </div>
      </div>
    </FadeIn>
  );
};

export default BottomText;
