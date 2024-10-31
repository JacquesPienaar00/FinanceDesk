'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  nameChangeType: z.enum(['reserved', 'new']),
  reservedName: z.string().min(1, 'Reserved name is required').optional(),
  reservationNumber: z.string().min(1, 'Reservation number is required').optional(),
  newName: z.string().min(1, 'New name is required').optional(),
  contactInfo: z.string().min(1, 'Contact information is required'),
  currentCompanyName: z.string().min(1, 'Current company name is required'),
  desiredCompanyName: z.string().min(1, 'Desired company name is required'),
  natureOfBusiness: z.string().min(10, 'Business description must be at least 10 characters'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountHolder: z.string().min(1, 'Account holder name is required'),
  registrationMethod: z.enum(['cipc', 'other']),
  cipcRegistrationNumber: z.string().min(1, 'CIPC registration number is required').optional(),
  otherRegistrationNumber: z.string().min(1, 'Registration number is required').optional(),
  companyRegistrationDocuments: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ChangeOfCompanyNameForm({
  onSubmissionSuccess,
  collectionName = 'change-of-company-name',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('7', async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nameChangeType: 'new',
      registrationMethod: 'cipc',
    },
  });

  const nameChangeType = watch('nameChangeType');
  const registrationMethod = watch('registrationMethod');

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
        if (key !== 'companyRegistrationDocuments') {
          formData.append(key, value as string);
        }
      });

      if (data.registrationMethod === 'other' && data.companyRegistrationDocuments) {
        formData.append('companyRegistrationDocuments', data.companyRegistrationDocuments[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '7');
      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

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

  return (
    <FormWrapper
      title="Change of Company Name with CIPC"
      description="Please provide the required information to change your company name"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label>Name Change Type</Label>
          <Controller
            name="nameChangeType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reserved" id="reserved" />
                  <Label htmlFor="reserved">Reserved Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new">New Name</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {nameChangeType === 'reserved' && (
          <div className="space-y-4">
            <Input
              {...register('reservedName')}
              placeholder="Reserved Name"
              className={errors.reservedName ? 'border-red-500' : ''}
            />
            {errors.reservedName && (
              <p className="text-sm text-red-500">{errors.reservedName.message}</p>
            )}
            <Input
              {...register('reservationNumber')}
              placeholder="Reservation Number"
              className={errors.reservationNumber ? 'border-red-500' : ''}
            />
            {errors.reservationNumber && (
              <p className="text-sm text-red-500">{errors.reservationNumber.message}</p>
            )}
          </div>
        )}

        {nameChangeType === 'new' && (
          <div className="space-y-4">
            <Input
              {...register('newName')}
              placeholder="New Company Name"
              className={errors.newName ? 'border-red-500' : ''}
            />
            {errors.newName && <p className="text-sm text-red-500">{errors.newName.message}</p>}
          </div>
        )}

        <Input
          {...register('contactInfo')}
          placeholder="Contact Number / Email"
          className={errors.contactInfo ? 'border-red-500' : ''}
        />
        {errors.contactInfo && <p className="text-sm text-red-500">{errors.contactInfo.message}</p>}

        <Input
          {...register('currentCompanyName')}
          placeholder="Current Company Name"
          className={errors.currentCompanyName ? 'border-red-500' : ''}
        />
        {errors.currentCompanyName && (
          <p className="text-sm text-red-500">{errors.currentCompanyName.message}</p>
        )}

        <Input
          {...register('desiredCompanyName')}
          placeholder="Desired Company Name"
          className={errors.desiredCompanyName ? 'border-red-500' : ''}
        />
        {errors.desiredCompanyName && (
          <p className="text-sm text-red-500">{errors.desiredCompanyName.message}</p>
        )}

        <Textarea
          {...register('natureOfBusiness')}
          placeholder="Nature of Business (Description)"
          className={errors.natureOfBusiness ? 'border-red-500' : ''}
        />
        {errors.natureOfBusiness && (
          <p className="text-sm text-red-500">{errors.natureOfBusiness.message}</p>
        )}

        <div className="space-y-4">
          <Label>Bank Details</Label>
          <Input
            {...register('bankName')}
            placeholder="Bank Name"
            className={errors.bankName ? 'border-red-500' : ''}
          />
          {errors.bankName && <p className="text-sm text-red-500">{errors.bankName.message}</p>}
          <Input
            {...register('accountNumber')}
            placeholder="Account Number"
            className={errors.accountNumber ? 'border-red-500' : ''}
          />
          {errors.accountNumber && (
            <p className="text-sm text-red-500">{errors.accountNumber.message}</p>
          )}
          <Input
            {...register('accountHolder')}
            placeholder="Account Holder"
            className={errors.accountHolder ? 'border-red-500' : ''}
          />
          {errors.accountHolder && (
            <p className="text-sm text-red-500">{errors.accountHolder.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Registration Method</Label>
          <Controller
            name="registrationMethod"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select registration method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cipc">CIPC Registration Number</SelectItem>
                  <SelectItem value="other">Other Registration Number</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {registrationMethod === 'cipc' && (
          <Input
            {...register('cipcRegistrationNumber')}
            placeholder="CIPC Registration Number"
            className={errors.cipcRegistrationNumber ? 'border-red-500' : ''}
          />
        )}

        {registrationMethod === 'other' && (
          <div className="space-y-4">
            <Input
              {...register('otherRegistrationNumber')}
              placeholder="Other Registration Number"
              className={errors.otherRegistrationNumber ? 'border-red-500' : ''}
            />
            <Input
              type="file"
              {...register('companyRegistrationDocuments')}
              className={errors.companyRegistrationDocuments ? 'border-red-500' : ''}
            />
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Change of Company Name'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default ChangeOfCompanyNameForm;
