import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function useFormSubmission(formId: string, onSubmissionSuccess: () => void) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (formData: FormData) => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit the form.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/dashboard/forms/submit-form', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit form');
      }

      toast({
        title: 'Form submitted',
        description: 'Your form has been successfully submitted.',
      });

      onSubmissionSuccess();
      router.refresh();

      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitForm, isSubmitting };
}
