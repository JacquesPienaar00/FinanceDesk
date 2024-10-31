'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface PfDataCounterProps {
  serviceId: string;
}

export function PfDataCounter({ serviceId }: PfDataCounterProps) {
  const { data: session } = useSession();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/dashboard/forms/pfDataCounter', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              serviceId,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setCount(data.count);
          } else {
            console.error('Failed to fetch pfData count');
          }
        } catch (error) {
          console.error('Error fetching pfData count:', error);
        }
      }
    };

    fetchCount();
  }, [session, serviceId]);

  if (count === null || count === 0) {
    return null;
  }

  return <span>x{count}</span>;
}
