'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMultiStepForm } from '@/app/dashboard/forms/hooks/useMultiStepForm';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  natureOfTrade: z.string().min(5, 'Nature of trade must be at least 5 characters'),
  directorName: z.string().min(2, 'Director name must be at least 2 characters'),
  directorSurname: z.string().min(2, 'Director surname must be at least 2 characters'),
  directorIdNumber: z
    .string()
    .min(13, 'ID number must be 13 digits')
    .max(13, 'ID number must be 13 digits'),
  numberOfShareholders: z.string().min(1, 'Number of shareholders is required'),
  blackFemaleShareholding: z.string().min(1, 'Black female shareholding percentage is required'),
  blackMaleShareholding: z.string().min(1, 'Black male shareholding percentage is required'),
  otherShareholding: z.string().min(1, 'Other shareholding percentage is required'),
  registrationMethod: z.enum(['cipc', 'upload']),
  cipcRegistrationNumber: z.string().optional(),
  companyRegistrationDocuments: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BBBEEAffidavitForm({
  onSubmissionSuccess,
  collectionName = 'bbbee-affidavits-eme-and-qse',
  pfDataItemToRemove = '4',
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
      watch,
      setValue,
    },
    isSubmitting,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
  } = useMultiStepForm<FormData>({
    formId: '4',
    collectionName,
    schema: formSchema,
    onSubmissionSuccess,
    pfDataItemToRemove,
    steps: ['contactInfo', 'directorDetails', 'shareholdingDetails', 'companyRegistration'],
  });

  const registrationMethod = watch('registrationMethod');

  return (
    <FormWrapper
      title="BBBEE Affidavit Form (EME and QSE)"
      description="Please fill out the form below for your BBBEE Affidavit"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Contact Information" />
        <Step label="Director Details" />
        <Step label="Shareholding Details" />
        <Step label="Company Registration" />
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
            <Textarea
              {...register('natureOfTrade')}
              placeholder="Nature of Trade"
              className={errors.natureOfTrade ? 'border-red-500' : ''}
            />
            {errors.natureOfTrade && (
              <p className="mt-1 text-sm text-red-500">{errors.natureOfTrade.message}</p>
            )}
          </>
        )}

        {currentStep === 1 && (
          <>
            <Input
              {...register('directorName')}
              placeholder="Director Name"
              className={errors.directorName ? 'border-red-500' : ''}
            />
            {errors.directorName && (
              <p className="mt-1 text-sm text-red-500">{errors.directorName.message}</p>
            )}
            <Input
              {...register('directorSurname')}
              placeholder="Director Surname"
              className={errors.directorSurname ? 'border-red-500' : ''}
            />
            {errors.directorSurname && (
              <p className="mt-1 text-sm text-red-500">{errors.directorSurname.message}</p>
            )}
            <Input
              {...register('directorIdNumber')}
              placeholder="Director ID Number"
              className={errors.directorIdNumber ? 'border-red-500' : ''}
            />
            {errors.directorIdNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.directorIdNumber.message}</p>
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <Input
              {...register('numberOfShareholders')}
              placeholder="Number of Shareholders"
              type="number"
              className={errors.numberOfShareholders ? 'border-red-500' : ''}
            />
            {errors.numberOfShareholders && (
              <p className="mt-1 text-sm text-red-500">{errors.numberOfShareholders.message}</p>
            )}
            <Input
              {...register('blackFemaleShareholding')}
              placeholder="% of Black Female Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.blackFemaleShareholding ? 'border-red-500' : ''}
            />
            {errors.blackFemaleShareholding && (
              <p className="mt-1 text-sm text-red-500">{errors.blackFemaleShareholding.message}</p>
            )}
            <Input
              {...register('blackMaleShareholding')}
              placeholder="% of Black Male Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.blackMaleShareholding ? 'border-red-500' : ''}
            />
            {errors.blackMaleShareholding && (
              <p className="mt-1 text-sm text-red-500">{errors.blackMaleShareholding.message}</p>
            )}
            <Input
              {...register('otherShareholding')}
              placeholder="% of Other Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.otherShareholding ? 'border-red-500' : ''}
            />
            {errors.otherShareholding && (
              <p className="mt-1 text-sm text-red-500">{errors.otherShareholding.message}</p>
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            <RadioGroup
              defaultValue="cipc"
              onValueChange={(value) => setValue('registrationMethod', value as 'cipc' | 'upload')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cipc" id="cipc" />
                <Label htmlFor="cipc">Enter CIPC Registration Number</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">Upload Company Registration Documents</Label>
              </div>
            </RadioGroup>
            {registrationMethod === 'cipc' && (
              <Input
                {...register('cipcRegistrationNumber')}
                placeholder="CIPC Registration Number"
                className={errors.cipcRegistrationNumber ? 'border-red-500' : ''}
              />
            )}
            {registrationMethod === 'upload' && (
              <Input
                type="file"
                {...register('companyRegistrationDocuments')}
                className={errors.companyRegistrationDocuments ? 'border-red-500' : ''}
              />
            )}
            {errors.cipcRegistrationNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.cipcRegistrationNumber.message}</p>
            )}
            {errors.companyRegistrationDocuments && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyRegistrationDocuments.message as React.ReactNode}
              </p>
            )}
          </>
        )}

        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 3 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Affidavit'}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}
