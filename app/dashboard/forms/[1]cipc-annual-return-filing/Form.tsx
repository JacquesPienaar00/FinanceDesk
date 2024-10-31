'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { Label } from '@/components/ui/label';
import { useMultiStepForm } from '@/app/dashboard/forms/hooks/useMultiStepForm';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  priorAnnualReturn: z.string().min(1, 'This field is required'),
  annualTurnover: z.string().min(1, 'This field is required'),
  fileMoreReturns: z.string().min(1, 'This field is required'),
  file: z
    .any()
    .refine((files) => files?.length > 0, 'File is required')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .jpg, .jpeg, .png formats are supported.',
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function COIDARegistrationForm({
  onSubmissionSuccess,
  collectionName = 'cipc-annual-return-filing',
  pfDataItemToRemove = '1',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const { currentStep, form, isSubmitting, handleSubmit, handleNextStep, handlePrevStep } =
    useMultiStepForm<FormData>({
      formId: '1',
      collectionName,
      schema: formSchema,
      onSubmissionSuccess,
      pfDataItemToRemove,
      steps: ['personalInfo', 'businessInfo', 'documentUpload'],
    });

  const {
    register,
    formState: { errors },
  } = form;

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    handleSubmit({
      preventDefault: () => {},
      target: { elements: data },
    } as unknown as React.BaseSyntheticEvent);
  };

  return (
    <FormWrapper
      title="COIDA Registration Form"
      description="Please fill out the form below to register for COIDA"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Business Information" />
        <Step label="Document Upload" />
      </Stepper>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register('fullName')}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName.message as React.ReactNode}</p>
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
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="priorAnnualReturn">Prior Annual Return</Label>
              <Input
                id="priorAnnualReturn"
                {...register('priorAnnualReturn')}
                className={errors.priorAnnualReturn ? 'border-red-500' : ''}
              />
              {errors.priorAnnualReturn && (
                <p className="text-sm text-red-500">
                  {errors.priorAnnualReturn.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualTurnover">Annual Turnover</Label>
              <Input
                id="annualTurnover"
                {...register('annualTurnover')}
                className={errors.annualTurnover ? 'border-red-500' : ''}
              />
              {errors.annualTurnover && (
                <p className="text-sm text-red-500">
                  {errors.annualTurnover.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileMoreReturns">File More Returns</Label>
              <Input
                id="fileMoreReturns"
                {...register('fileMoreReturns')}
                className={errors.fileMoreReturns ? 'border-red-500' : ''}
              />
              {errors.fileMoreReturns && (
                <p className="text-sm text-red-500">
                  {errors.fileMoreReturns.message as React.ReactNode}
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-2">
            <Label htmlFor="file">Upload Document</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register('file')}
              className={errors.file ? 'border-red-500' : ''}
            />
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file.message as React.ReactNode}</p>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 2 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}
