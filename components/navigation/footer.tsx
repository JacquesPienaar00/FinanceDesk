'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Github } from 'lucide-react';
import FloatingChatbot from '@/components/ui/floating-chatbot';
import { NewsletterFormComponent } from '../ui/newsletter-form';

export default function Footer() {
  return (
    <footer className="relative bg-background">
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="mt-8 grid grid-cols-2 gap-8 lg:mt-0 lg:grid-cols-4 lg:gap-y-16">
            <div className="col-span-2">
              <h2 className="text-2xl font-bold">Get the latest news!</h2>
              <p className="mt-4 pr-10">
                Stay informed with the latest financial news, tips, and insights directly to your
                inbox.
              </p>
            </div>

            <NewsletterFormComponent />

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium">Services</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    All Services
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Company Review
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    HR Consulting
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    SEO Optimisation
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium">Company</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="/about" className="transition hover:opacity-75">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Meet the Team
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Accounts Review
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium">Helpful Links</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/contact#FAQ" className="transition hover:opacity-75">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium">Legal</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Returns Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition hover:opacity-75">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <ul className="col-span-2 flex justify-start gap-6 lg:col-span-5 lg:justify-end">
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  <span className="sr-only">Twitter</span>
                  <Twitter className="h-6 w-6" />
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  <span className="sr-only">GitHub</span>
                  <Github className="h-6 w-6" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <div className="sm:flex sm:justify-between">
            <p className="text-xs">&copy; 2024. The Finance Desk. All rights reserved.</p>
            <ul className="mt-8 flex flex-wrap justify-start gap-4 text-xs sm:mt-0 lg:justify-end">
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="transition hover:opacity-75">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <FloatingChatbot />
    </footer>
  );
}
