'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  contactInfo: z.string().min(1, 'Contact information is required'),
  fullNames: z.string().min(1, 'Full name(s) are required'),
  surname: z.string().min(1, 'Surname is required'),
  idNumber: z
    .string()
    .min(13, 'ID number must be at least 13 characters')
    .max(13, 'ID number must not exceed 13 characters'),
  cellNumber1: z.string().min(10, 'Cell number must be at least 10 digits'),
  cellNumber2: z.string().min(10, 'Cell number must be at least 10 digits'),
  cellNumber3: z.string().min(10, 'Cell number must be at least 10 digits'),
  email1: z.string().email('Invalid email address'),
  email2: z.string().email('Invalid email address'),
  email3: z.string().email('Invalid email address'),
  idPassportCopy: z.any().refine((files) => files?.length > 0, 'ID/Passport copy is required'),
  photoWithId: z.any().refine((files) => files?.length > 0, 'Photo with ID is required'),
  proofOfAddress: z.any().refine((files) => files?.length > 0, 'Proof of address is required'),
  bankConfirmationLetter: z
    .any()
    .refine((files) => files?.length > 0, 'Bank confirmation letter is required'),
});

type FormData = z.infer<typeof formSchema>;

export function EFilingProfileRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'efiling-profile-registration',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('19', async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        if (
          key === 'idPassportCopy' ||
          key === 'photoWithId' ||
          key === 'proofOfAddress' ||
          key === 'bankConfirmationLetter'
        ) {
          if (value && value.length > 0) {
            formData.append(key, value[0]);
          }
        } else {
          formData.append(key, value as string);
        }
      });

      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '19');

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
      title="eFiling Profile Registration"
      description="Please provide the required information for your eFiling profile registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Textarea
                id="contactInfo"
                {...register('contactInfo')}
                placeholder="Enter your contact information"
                className={errors.contactInfo ? 'border-red-500' : ''}
              />
              {errors.contactInfo && (
                <p className="text-sm text-red-500">{errors.contactInfo.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullNames">Full Name(s)</Label>
              <Input
                id="fullNames"
                {...register('fullNames')}
                placeholder="Enter your full name(s)"
                className={errors.fullNames ? 'border-red-500' : ''}
              />
              {errors.fullNames && (
                <p className="text-sm text-red-500">{errors.fullNames.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                {...register('surname')}
                placeholder="Enter your surname"
                className={errors.surname ? 'border-red-500' : ''}
              />
              {errors.surname && <p className="text-sm text-red-500">{errors.surname.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                {...register('idNumber')}
                placeholder="Enter your ID number"
                className={errors.idNumber ? 'border-red-500' : ''}
              />
              {errors.idNumber && <p className="text-sm text-red-500">{errors.idNumber.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Previous Contact Information</CardTitle>
            <CardDescription>
              Please provide your last 3 known cell numbers and email addresses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cellNumber1">Cell Number 1</Label>
              <Input
                id="cellNumber1"
                {...register('cellNumber1')}
                placeholder="Enter cell number 1"
                className={errors.cellNumber1 ? 'border-red-500' : ''}
              />
              {errors.cellNumber1 && (
                <p className="text-sm text-red-500">{errors.cellNumber1.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellNumber2">Cell Number 2</Label>
              <Input
                id="cellNumber2"
                {...register('cellNumber2')}
                placeholder="Enter cell number 2"
                className={errors.cellNumber2 ? 'border-red-500' : ''}
              />
              {errors.cellNumber2 && (
                <p className="text-sm text-red-500">{errors.cellNumber2.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cellNumber3">Cell Number 3</Label>
              <Input
                id="cellNumber3"
                {...register('cellNumber3')}
                placeholder="Enter cell number 3"
                className={errors.cellNumber3 ? 'border-red-500' : ''}
              />
              {errors.cellNumber3 && (
                <p className="text-sm text-red-500">{errors.cellNumber3.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email1">Email Address 1</Label>
              <Input
                id="email1"
                type="email"
                {...register('email1')}
                placeholder="Enter email address 1"
                className={errors.email1 ? 'border-red-500' : ''}
              />
              {errors.email1 && <p className="text-sm text-red-500">{errors.email1.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email2">Email Address 2</Label>
              <Input
                id="email2"
                type="email"
                {...register('email2')}
                placeholder="Enter email address 2"
                className={errors.email2 ? 'border-red-500' : ''}
              />
              {errors.email2 && <p className="text-sm text-red-500">{errors.email2.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email3">Email Address 3</Label>
              <Input
                id="email3"
                type="email"
                {...register('email3')}
                placeholder="Enter email address 3"
                className={errors.email3 ? 'border-red-500' : ''}
              />
              {errors.email3 && <p className="text-sm text-red-500">{errors.email3.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idPassportCopy">ID/Passport Copy</Label>
              <Input
                id="idPassportCopy"
                type="file"
                {...register('idPassportCopy')}
                className={errors.idPassportCopy ? 'border-red-500' : ''}
              />
              {errors.idPassportCopy && (
                <p className="text-sm text-red-500">
                  {errors.idPassportCopy.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoWithId">Photo with ID and Sign</Label>
              <Input
                id="photoWithId"
                type="file"
                {...register('photoWithId')}
                className={errors.photoWithId ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500">
                Upload a photo of yourself holding your ID and a sign that says &quot;update my
                details&quot;. Ensure the information on the ID is clear and visible.
              </p>
              {errors.photoWithId && (
                <p className="text-sm text-red-500">
                  {errors.photoWithId.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofOfAddress">Proof of Residential Address</Label>
              <Input
                id="proofOfAddress"
                type="file"
                {...register('proofOfAddress')}
                className={errors.proofOfAddress ? 'border-red-500' : ''}
              />
              {errors.proofOfAddress && (
                <p className="text-sm text-red-500">
                  {errors.proofOfAddress.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankConfirmationLetter">Bank Account Confirmation Letter</Label>
              <Input
                id="bankConfirmationLetter"
                type="file"
                {...register('bankConfirmationLetter')}
                className={errors.bankConfirmationLetter ? 'border-red-500' : ''}
              />
              {errors.bankConfirmationLetter && (
                <p className="text-sm text-red-500">
                  {errors.bankConfirmationLetter.message as React.ReactNode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit eFiling Profile Registration'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default EFilingProfileRegistrationForm;
