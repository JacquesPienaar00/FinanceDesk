import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

export function useFormUtilities<T extends Record<string, any>>(
  formName: string,
  initialValues: T,
  itemName: string,
) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<T>(initialValues);

  useEffect(() => {
    const savedData = Cookies.get(`${formName}Draft`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
    }
  }, [formName]);

  const saveAndContinue = (values: T) => {
    Cookies.set(`${formName}Draft`, JSON.stringify(values), { expires: 7 });
    toast({
      title: 'Progress saved',
      description: 'Your form data has been saved. You can continue later.',
    });
  };

  const removeItemFromPfData = async () => {
    if (!session?.user?.id) {
      console.error('User ID not found');
      return;
    }

    try {
      const response = await fetch('/api/dashboard/forms/remove-pf-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          itemName: itemName,
          removeOnlyOne: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove item from pfData');
      }

      console.log('Item removed from pfData:', result.removedItem);
    } catch (error) {
      console.error('Error removing item from pfData:', error);
    }
  };

  const handleSubmit = async (values: T, apiEndpoint: string) => {
    if (status !== 'authenticated') {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit the form.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast({
        title: 'Form submitted',
        description: `Your ${formName} form has been successfully submitted.`,
      });

      Cookies.remove(`${formName}Draft`);
      await removeItemFromPfData();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    formData,
    setFormData,
    saveAndContinue,
    handleSubmit,
    status,
  };
}
