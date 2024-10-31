'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { useMultiStepForm } from '@/app/dashboard/forms/hooks/useMultiStepForm';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  priorAnnualReturn: z.string().min(1, 'This field is required'),
  annualTurnover: z.string().min(1, 'This field is required'),
  fileMoreReturns: z.string().min(1, 'This field is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function SimpleRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'coida-workmens-compensation-registration',
  pfDataItemToRemove = '2',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const {
    currentStep,
    form: {
      register,
      formState: { errors },
    },
    isSubmitting,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
  } = useMultiStepForm<FormData>({
    formId: '2',
    collectionName,
    schema: formSchema,
    onSubmissionSuccess,
    pfDataItemToRemove,
    steps: ['personalInfo', 'businessInfo'],
  });

  return (
    <FormWrapper
      title="Simple Registration Form"
      description="Please fill out the form below to register"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Business Information" />
      </Stepper>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <Input
              {...register('fullName')}
              placeholder="Full Name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
            <Input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            <Input
              {...register('contactNumber')}
              placeholder="Contact Number"
              className={errors.contactNumber ? 'border-red-500' : ''}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.contactNumber.message}</p>
            )}
          </>
        )}

        {currentStep === 1 && (
          <>
            <Input
              {...register('priorAnnualReturn')}
              placeholder="Prior Annual Return"
              className={errors.priorAnnualReturn ? 'border-red-500' : ''}
            />
            {errors.priorAnnualReturn && (
              <p className="mt-1 text-sm text-red-500">{errors.priorAnnualReturn.message}</p>
            )}
            <Input
              {...register('annualTurnover')}
              placeholder="Annual Turnover"
              className={errors.annualTurnover ? 'border-red-500' : ''}
            />
            {errors.annualTurnover && (
              <p className="mt-1 text-sm text-red-500">{errors.annualTurnover.message}</p>
            )}
            <Input
              {...register('fileMoreReturns')}
              placeholder="File More Returns"
              className={errors.fileMoreReturns ? 'border-red-500' : ''}
            />
            {errors.fileMoreReturns && (
              <p className="mt-1 text-sm text-red-500">{errors.fileMoreReturns.message}</p>
            )}
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
