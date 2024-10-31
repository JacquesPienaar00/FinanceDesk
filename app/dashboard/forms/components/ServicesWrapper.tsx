'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Loading from '@/components/ui/Loading';
import { ServiceContainer } from './ServiceContainer';

interface ServicesWrapperProps {
  serviceIds: string[];
}

export function ServicesWrapper({ serviceIds }: ServicesWrapperProps) {
  const { status } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [ordersFound, setOrdersFound] = useState<{ [key: string]: boolean }>({});
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refreshServices = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const checkOrders = async () => {
      if (status === 'authenticated') {
        setLoading(true);
        try {
          const response = await fetch('/api/dashboard/forms/getServices', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch services. Status: ${response.status}`);
          }

          const result = await response.json();

          if (Array.isArray(result.products)) {
            const foundOrders = serviceIds.reduce(
              (acc, id) => {
                acc[id] = result.products.some((product: { id: string }) => product.id === id);
                return acc;
              },
              {} as { [key: string]: boolean },
            );
            setOrdersFound(foundOrders);
          } else {
            console.error('Invalid products structure:', result.products);
            setOrdersFound({});
          }
        } catch (error) {
          console.error('Error fetching services:', error);
          setOrdersFound({});
        } finally {
          setLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setOrdersFound({});
        setLoading(false);
      }
    };

    checkOrders();
  }, [status, serviceIds, refreshKey]);

  if (loading) {
    return <Loading />;
  }

  const availableServices = serviceIds.filter((id) => ordersFound[id]);

  return (
    <div className="flex flex-wrap justify-start gap-6">
      {availableServices.map((serviceId) => (
        <div key={serviceId} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
          <ServiceContainer
            serviceId={serviceId}
            orderFound={true}
            onSubmissionSuccess={refreshServices}
          />
        </div>
      ))}
    </div>
  );
}
