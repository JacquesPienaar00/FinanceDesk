'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const formSchema = z.object({
  contactInfo: z.string().min(1, 'Contact information is required'),
  registrationType: z.enum(['import', 'export', 'other']),
  sarsUsername: z.string().min(1, 'SARS username is required'),
  sarsPassword: z.string().min(1, 'SARS password is required'),
  exampleAttachment: z.any().optional(),
  registrationMethod: z.enum(['cipcNumber', 'uploadDocument']),
  cipcNumber: z.string().min(1, 'CIPC number is required').optional(),
  registrationDocument: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SARSCustomsRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'sars-customs-registration',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('20', async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationType: 'import',
      registrationMethod: 'cipcNumber',
    },
  });

  const registrationType = watch('registrationType');
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
        if (key === 'exampleAttachment' || key === 'registrationDocument') {
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
      formData.append('formId', '20');

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
      title="SARS Customs Registration (Import/Export)"
      description="Please provide the required information for your SARS Customs registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="registrationType"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="import" id="import" />
                    <Label htmlFor="import">Import</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="export" id="export" />
                    <Label htmlFor="export">Export</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">
                      Other (Excise registrations, Clearing agent registrations, etc.)
                    </Label>
                  </div>
                </RadioGroup>
              )}
            />
            {registrationType === 'other' && (
              <p className="mt-2 text-sm text-gray-500">
                Our team will contact you to discuss your specific requirements.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SARS Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sarsUsername">SARS Username</Label>
              <Input
                id="sarsUsername"
                {...register('sarsUsername')}
                placeholder="Enter your SARS username"
                className={errors.sarsUsername ? 'border-red-500' : ''}
              />
              {errors.sarsUsername && (
                <p className="text-sm text-red-500">{errors.sarsUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sarsPassword">SARS Password</Label>
              <Input
                id="sarsPassword"
                type="password"
                {...register('sarsPassword')}
                placeholder="Enter your SARS password"
                className={errors.sarsPassword ? 'border-red-500' : ''}
              />
              {errors.sarsPassword && (
                <p className="text-sm text-red-500">{errors.sarsPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="exampleAttachment">Attach Example (Optional)</Label>
              <Input id="exampleAttachment" type="file" {...register('exampleAttachment')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="registrationMethod"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cipcNumber" id="cipcNumber" />
                    <Label htmlFor="cipcNumber">Enter CIPC Number</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="uploadDocument" id="uploadDocument" />
                    <Label htmlFor="uploadDocument">Upload Company Registration Documents</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {registrationMethod === 'cipcNumber' && (
              <div className="space-y-2">
                <Label htmlFor="cipcNumber">CIPC Number</Label>
                <Input
                  id="cipcNumber"
                  {...register('cipcNumber')}
                  placeholder="Enter CIPC Number"
                  className={errors.cipcNumber ? 'border-red-500' : ''}
                />
                {errors.cipcNumber && (
                  <p className="text-sm text-red-500">{errors.cipcNumber.message}</p>
                )}
              </div>
            )}

            {registrationMethod === 'uploadDocument' && (
              <div className="space-y-2">
                <Label htmlFor="registrationDocument">Company Registration Document</Label>
                <Input
                  id="registrationDocument"
                  type="file"
                  {...register('registrationDocument')}
                  className={errors.registrationDocument ? 'border-red-500' : ''}
                />
                {errors.registrationDocument && (
                  <p className="text-sm text-red-500">
                    {errors.registrationDocument.message as React.ReactNode}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit SARS Customs Registration'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default SARSCustomsRegistrationForm;
