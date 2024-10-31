'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  currentAddress: z.string().min(1, 'Current address is required'),
  newAddress: z.string().min(1, 'New address is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  cipcDocument: z.any().refine((files) => files?.length > 0, 'CIPC document is required'),
});

type FormData = z.infer<typeof formSchema>;

export function ChangeOfRegisteredAddressForm({
  onSubmissionSuccess,
  collectionName = 'change-of-registered-address',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('11', async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
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
        if (key !== 'cipcDocument') {
          formData.append(key, value as string);
        }
      });

      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

      if (data.cipcDocument && data.cipcDocument.length > 0) {
        formData.append('cipcDocument', data.cipcDocument[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '11');

      const success = await submitForm(formData);

      if (success) {
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
    const fieldsToValidate =
      currentStep === 0
        ? ['companyName', 'registrationNumber', 'currentAddress']
        : ['newAddress', 'effectiveDate', 'cipcDocument'];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormWrapper
      title="Change of Registered Address Form"
      description="Please provide the required information to change your registered address"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Company Information" />
        <Step label="New Address Details" />
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">
                  {errors.companyName.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                {...register('registrationNumber')}
                className={errors.registrationNumber ? 'border-red-500' : ''}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-500">
                  {errors.registrationNumber.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAddress">Current Registered Address</Label>
              <Textarea
                id="currentAddress"
                {...register('currentAddress')}
                className={errors.currentAddress ? 'border-red-500' : ''}
              />
              {errors.currentAddress && (
                <p className="text-sm text-red-500">
                  {errors.currentAddress.message as React.ReactNode}
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="newAddress">New Registered Address</Label>
              <Textarea
                id="newAddress"
                {...register('newAddress')}
                className={errors.newAddress ? 'border-red-500' : ''}
              />
              {errors.newAddress && (
                <p className="text-sm text-red-500">
                  {errors.newAddress.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">Effective Date</Label>
              <Input
                id="effectiveDate"
                type="date"
                {...register('effectiveDate')}
                className={errors.effectiveDate ? 'border-red-500' : ''}
              />
              {errors.effectiveDate && (
                <p className="text-sm text-red-500">
                  {errors.effectiveDate.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cipcDocument">Upload CIPC Document</Label>
              <Input
                id="cipcDocument"
                type="file"
                {...register('cipcDocument')}
                className={errors.cipcDocument ? 'border-red-500' : ''}
              />
              {errors.cipcDocument && (
                <p className="text-sm text-red-500">
                  {errors.cipcDocument.message as React.ReactNode}
                </p>
              )}
            </div>
          </>
        )}

        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 1 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 1 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Change of Address'}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default ChangeOfRegisteredAddressForm;
