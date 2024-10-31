import { useState } from 'react';
import { useForm, UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UseMultiStepFormProps<T extends FieldValues> {
  formId: string;
  collectionName: string;
  schema: ZodType<T>;
  onSubmissionSuccess: () => void;
  pfDataItemToRemove?: string;
  steps: string[];
  chatbotSubject?: string;
}

export function useMultiStepForm<T extends FieldValues>({
  formId,
  collectionName,
  schema,
  onSubmissionSuccess,
  pfDataItemToRemove,
  steps,
  chatbotSubject,
}: UseMultiStepFormProps<T>) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission(formId, async () => {
    if (pfDataItemToRemove) {
      await removeItemFromPfData();
    }
    onSubmissionSuccess();
  });

  const form: UseFormReturn<T> = useForm<T>({
    resolver: zodResolver(schema),
  });

  const removeItemFromPfData = async () => {
    if (!session?.user?.id || !pfDataItemToRemove) {
      console.error('User ID or pfDataItemToRemove not available');
      return;
    }

    try {
      const response = await fetch('/api/dashboard/forms/remove-pf-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          itemName: pfDataItemToRemove,
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
      toast({
        title: 'Warning',
        description:
          'Form submitted successfully, but there was an issue updating your profile. Please refresh the page.',
        variant: 'destructive',
      });
    }
  };

  const createTicket = async (subject: string, formData: FormData) => {
    try {
      const formDataObj = Object.fromEntries(formData);
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          message: `New form submission for ${collectionName}`,
          formData: formDataObj,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const ticket = await response.json();
      console.log('Ticket created:', ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Warning',
        description: 'Form submitted successfully, but there was an issue creating a ticket.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit: SubmitHandler<T> = async (data) => {
    try {
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to submit the form.',
          variant: 'destructive',
        });
        return;
      }

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      formData.append('collectionName', collectionName);
      formData.append('formId', formId);

      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

      const success = await submitForm(formData);

      if (success) {
        // Create a ticket with the subject as the collection name or chatbotSubject if provided
        await createTicket(chatbotSubject || collectionName, formData);
        router.refresh();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'There was a problem submitting your form. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleNextStep = async () => {
    const isStepValid = await form.trigger(steps[currentStep] as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    currentStep,
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(onSubmit),
    handleNextStep,
    handlePrevStep,
  };
}
