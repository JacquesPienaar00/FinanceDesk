import { useState, useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Cookies from 'js-cookie';
import { useToast } from '@/hooks/use-toast';

export function useFormManagement<T extends z.ZodType<any, any>>(
  formSchema: T,
  formId: string,
  initialValues: z.infer<T>,
): UseFormReturn<z.infer<T>> & {
  saveAndContinue: () => void;
  step: number;
  setStep: (step: number) => void;
} {
  const [step, setStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    const savedData = Cookies.get(`${formId}FormDraft`);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
    }
  }, [form, formId]);

  const saveAndContinue = () => {
    const values = form.getValues();
    Cookies.set(`${formId}FormDraft`, JSON.stringify(values), { expires: 7 });
    toast({
      title: 'Progress saved',
      description: 'Your form data has been saved. You can continue later.',
    });
  };

  return {
    ...form,
    saveAndContinue,
    step,
    setStep,
  };
}
