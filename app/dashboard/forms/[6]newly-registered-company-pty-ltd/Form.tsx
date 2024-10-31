'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { Label } from '@/components/ui/label';
import { useMultiStepForm } from '@/app/dashboard/forms/hooks/useMultiStepForm';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const directorSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required'),
  postalAddress: z.string().min(1, 'Postal address is required'),
  surname: z.string().min(1, 'Surname is required'),
  cellNumber: z.string().min(1, 'Cell number is required'),
  dateOfBirth: z.date(),
  idOrPassport: z.string().min(1, 'ID or Passport number is required'),
  countryOfOrigin: z.string().min(1, 'Country of origin is required'),
  percentageShareholding: z.number().min(0).max(100),
  residentialAddress: z.string().min(1, 'Residential address is required'),
  idCopy: z
    .any()
    .refine((files) => files?.length > 0, 'ID copy is required')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .jpg, .jpeg, .png formats are supported.',
    ),
});

const formSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  registrationDate: z.date(),
  numberOfDirectors: z.number().min(1, 'At least one director is required'),
  directors: z.array(directorSchema),
  memorandumOfIncorporation: z
    .any()
    .refine((files) => files?.length > 0, 'Memorandum of Incorporation is required')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf, .jpg, .jpeg, .png formats are supported.',
    ),
});

type FormData = z.infer<typeof formSchema>;

export default function NewlyRegisteredCompanyPtyLtdForm({
  onSubmissionSuccess,
  collectionName = 'newly-registered-company-pty-ltd',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numberOfDirectors: 1,
      directors: [{}],
    },
  });

  const { currentStep, isSubmitting, handleSubmit, handleNextStep, handlePrevStep } =
    useMultiStepForm<FormData>({
      formId: '6',
      collectionName,
      schema: formSchema,
      onSubmissionSuccess,
      steps: ['companyInfo', 'directorsInfo'],
    });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'directors',
  });

  const numberOfDirectors = form.watch('numberOfDirectors');

  useEffect(() => {
    const currentDirectors = fields.length;
    if (numberOfDirectors > currentDirectors) {
      for (let i = currentDirectors; i < numberOfDirectors; i++) {
        append({
          email: '',
          fullName: '',
          postalAddress: '',
          surname: '',
          cellNumber: '',
          dateOfBirth: new Date(),
          idOrPassport: '',
          countryOfOrigin: '',
          percentageShareholding: 0,
          residentialAddress: '',
        });
      }
    } else if (numberOfDirectors < currentDirectors) {
      for (let i = currentDirectors - 1; i >= numberOfDirectors; i--) {
        remove(i);
      }
    }
  }, [numberOfDirectors, fields.length, append, remove]);

  return (
    <FormWrapper
      title="Newly Registered Company (Pty) Ltd Form"
      description="Please provide the required information for your newly registered company"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Company Information" />
        <Step label="Directors Information" />
      </Stepper>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...form.register('companyName')}
                className={form.formState.errors.companyName ? 'border-red-500' : ''}
              />
              {form.formState.errors.companyName && (
                <p className="text-sm text-red-500">{form.formState.errors.companyName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                {...form.register('registrationNumber')}
                className={form.formState.errors.registrationNumber ? 'border-red-500' : ''}
              />
              {form.formState.errors.registrationNumber && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.registrationNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                type="date"
                {...form.register('registrationDate', { valueAsDate: true })}
                className={form.formState.errors.registrationDate ? 'border-red-500' : ''}
              />
              {form.formState.errors.registrationDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.registrationDate.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfDirectors">Number of Directors</Label>
              <Input
                id="numberOfDirectors"
                type="number"
                min="1"
                {...form.register('numberOfDirectors', { valueAsNumber: true })}
                className={form.formState.errors.numberOfDirectors ? 'border-red-500' : ''}
              />
              {form.formState.errors.numberOfDirectors && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.numberOfDirectors.message}
                </p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            {fields.map((field, index) => (
              <div key={field.id} className="mb-6 space-y-4 rounded border p-4">
                <h3 className="text-lg font-semibold">Director {index + 1}</h3>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.fullName`}>Full Name</Label>
                  <Input
                    {...form.register(`directors.${index}.fullName`)}
                    className={
                      form.formState.errors.directors?.[index]?.fullName ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.fullName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.fullName?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.surname`}>Surname</Label>
                  <Input
                    {...form.register(`directors.${index}.surname`)}
                    className={
                      form.formState.errors.directors?.[index]?.surname ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.surname && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.surname?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.email`}>Email</Label>
                  <Input
                    type="email"
                    {...form.register(`directors.${index}.email`)}
                    className={
                      form.formState.errors.directors?.[index]?.email ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.email?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.cellNumber`}>Cell Number</Label>
                  <Input
                    {...form.register(`directors.${index}.cellNumber`)}
                    className={
                      form.formState.errors.directors?.[index]?.cellNumber ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.cellNumber && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.cellNumber?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.dateOfBirth`}>Date of Birth</Label>
                  <Input
                    type="date"
                    {...form.register(`directors.${index}.dateOfBirth`, { valueAsDate: true })}
                    className={
                      form.formState.errors.directors?.[index]?.dateOfBirth ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.dateOfBirth && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.dateOfBirth?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.idOrPassport`}>ID or Passport Number</Label>
                  <Input
                    {...form.register(`directors.${index}.idOrPassport`)}
                    className={
                      form.formState.errors.directors?.[index]?.idOrPassport ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.idOrPassport && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.idOrPassport?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.countryOfOrigin`}>Country of Origin</Label>
                  <Input
                    {...form.register(`directors.${index}.countryOfOrigin`)}
                    className={
                      form.formState.errors.directors?.[index]?.countryOfOrigin
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.countryOfOrigin && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.countryOfOrigin?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.percentageShareholding`}>
                    Percentage Shareholding
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...form.register(`directors.${index}.percentageShareholding`, {
                      valueAsNumber: true,
                    })}
                    className={
                      form.formState.errors.directors?.[index]?.percentageShareholding
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.percentageShareholding && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.percentageShareholding?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.residentialAddress`}>
                    Residential Address
                  </Label>
                  <Input
                    {...form.register(`directors.${index}.residentialAddress`)}
                    className={
                      form.formState.errors.directors?.[index]?.residentialAddress
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.residentialAddress && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.residentialAddress?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.postalAddress`}>Postal Address</Label>
                  <Input
                    {...form.register(`directors.${index}.postalAddress`)}
                    className={
                      form.formState.errors.directors?.[index]?.postalAddress
                        ? 'border-red-500'
                        : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.postalAddress && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.postalAddress?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.idCopy`}>ID Copy</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    {...form.register(`directors.${index}.idCopy`)}
                    className={
                      form.formState.errors.directors?.[index]?.idCopy ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.directors?.[index]?.idCopy && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.directors[index]?.idCopy?.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="memorandumOfIncorporation">Memorandum of Incorporation</Label>
              <Input
                id="memorandumOfIncorporation"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...form.register('memorandumOfIncorporation')}
                className={form.formState.errors.memorandumOfIncorporation ? 'border-red-500' : ''}
              />
              {form.formState.errors.memorandumOfIncorporation && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.memorandumOfIncorporation?.message?.toString()}
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
