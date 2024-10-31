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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const formSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  registrationMethod: z.enum(['cipc', 'trust', 'other']),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  physicalAddress: z.string().min(1, 'Physical address is required'),
  postalAddress: z.string().min(1, 'Postal address is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  email: z.string().email('Invalid email address'),
  organizationObjectives: z.string().min(1, 'Organization objectives are required'),
  constitutionDocument: z
    .any()
    .refine((files) => files?.length > 0, 'Constitution document is required')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .jpg, .jpeg, .png formats are supported.',
    ),
});

type FormData = z.infer<typeof formSchema>;

export function DepartmentOfSocialDevelopmentRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'department-of-social-development-registration',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('8', async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationMethod: 'cipc',
    },
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
        if (key !== 'constitutionDocument') {
          formData.append(key, value as string);
        }
      });

      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

      if (data.constitutionDocument && data.constitutionDocument.length > 0) {
        formData.append('constitutionDocument', data.constitutionDocument[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '8');

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
        ? [
            'organizationName',
            'registrationMethod',
            'registrationNumber',
            'physicalAddress',
            'postalAddress',
          ]
        : [
            'contactPerson',
            'contactNumber',
            'email',
            'organizationObjectives',
            'constitutionDocument',
          ];

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
      title="Department of Social Development Registration Form"
      description="Please provide the required information to register with the Department of Social Development"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Organization Information" />
        <Step label="Contact Details" />
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                {...register('organizationName')}
                className={errors.organizationName ? 'border-red-500' : ''}
              />
              {errors.organizationName && (
                <p className="text-sm text-red-500">
                  {errors.organizationName.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Registration Method</Label>
              <RadioGroup
                defaultValue="cipc"
                onValueChange={(value) =>
                  setValue('registrationMethod', value as 'cipc' | 'trust' | 'other')
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cipc" id="cipc" />
                  <Label htmlFor="cipc">CIPC Registration Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trust" id="trust" />
                  <Label htmlFor="trust">Trust Registration Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other Registration Number</Label>
                </div>
              </RadioGroup>
              {errors.registrationMethod && (
                <p className="text-sm text-red-500">
                  {errors.registrationMethod.message as React.ReactNode}
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
              <Label htmlFor="physicalAddress">Physical Address</Label>
              <Textarea
                id="physicalAddress"
                {...register('physicalAddress')}
                className={errors.physicalAddress ? 'border-red-500' : ''}
              />
              {errors.physicalAddress && (
                <p className="text-sm text-red-500">
                  {errors.physicalAddress.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalAddress">Postal Address</Label>
              <Textarea
                id="postalAddress"
                {...register('postalAddress')}
                className={errors.postalAddress ? 'border-red-500' : ''}
              />
              {errors.postalAddress && (
                <p className="text-sm text-red-500">
                  {errors.postalAddress.message as React.ReactNode}
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...register('contactPerson')}
                className={errors.contactPerson ? 'border-red-500' : ''}
              />
              {errors.contactPerson && (
                <p className="text-sm text-red-500">
                  {errors.contactPerson.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                {...register('contactNumber')}
                className={errors.contactNumber ? 'border-red-500' : ''}
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-500">
                  {errors.contactNumber.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationObjectives">Organization Objectives</Label>
              <Textarea
                id="organizationObjectives"
                {...register('organizationObjectives')}
                className={errors.organizationObjectives ? 'border-red-500' : ''}
              />
              {errors.organizationObjectives && (
                <p className="text-sm text-red-500">
                  {errors.organizationObjectives.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="constitutionDocument">Constitution Document</Label>
              <Input
                id="constitutionDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...register('constitutionDocument')}
                className={errors.constitutionDocument ? 'border-red-500' : ''}
              />
              {errors.constitutionDocument && (
                <p className="text-sm text-red-500">
                  {errors.constitutionDocument.message as React.ReactNode}
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
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default DepartmentOfSocialDevelopmentRegistrationForm;
