'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function ContactForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="isolate mt-4 px-6 py-24 sm:py-32 lg:px-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 left-96 top-[10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[20rem]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
          className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-accent to-primary opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
        />
      </div>
      <Card className="bg-blur-md mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Get in touch today!
          </CardTitle>
          <CardDescription className="mt-2 space-y-4 text-center text-lg leading-8">
            <p>We’d love to hear from you!</p>
            <p>
              {' '}
              Whether you have questions, feedback, or need support, feel free to reach out to us.
              Our team is here to assist you and ensure you have a seamless experience.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="#" method="POST" className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  name="first-name"
                  type="text"
                  autoComplete="given-name"
                  className="mt-2.5"
                />
              </div>
              <div>
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  name="last-name"
                  type="text"
                  autoComplete="family-name"
                  className="mt-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  className="mt-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="mt-2.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone-number">Phone number</Label>
                <div className="relative mt-2.5">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <Label htmlFor="country" className="sr-only">
                      Country
                    </Label>
                    <Select defaultValue="RSA">
                      <SelectTrigger className="w-[80px] border-0 bg-transparent focus:ring-0">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSA">RSA</SelectItem>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="US">US</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    id="phone-number"
                    name="phone-number"
                    type="tel"
                    autoComplete="tel"
                    className="pl-24"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="mt-2.5"
                  placeholder="Your message here..."
                />
              </div>
              <div className="flex items-center space-x-2 sm:col-span-2">
                <Switch id="agree" checked={agreed} onCheckedChange={setAgreed} />
                <Label htmlFor="agree" className="text-sm leading-6">
                  By selecting this, you agree to our{' '}
                  <a href="#" className="font-semibold text-primary">
                    privacy&nbsp;policy
                  </a>
                  .
                </Label>
              </div>
            </div>
            <div className="mt-10">
              <Button type="submit" className="w-full">
                Let&apos;s talk
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
