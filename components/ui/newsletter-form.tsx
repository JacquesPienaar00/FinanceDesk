'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

export function NewsletterFormComponent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Subscription failed');
      }

      toast({
        title: 'Success!',
        description: 'Thank you for subscribing to our newsletter.',
      });
      setEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="col-span-3">
      <label htmlFor="UserEmail" className="sr-only">
        Email
      </label>
      <div className="rounded-2xl border border-input p-2 sm:flex sm:items-center sm:gap-4">
        <Input
          type="email"
          id="UserEmail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="johndoe@thefinancedesk.co.za"
          className="w-full border-none sm:text-sm"
          required
        />
        <Button type="submit" className="mt-1 w-full sm:mt-0 sm:w-auto" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </div>
    </form>
  );
}
