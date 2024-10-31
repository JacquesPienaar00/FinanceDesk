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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  sarsUsername: z.string().min(1, 'SARS username is required'),
  sarsPassword: z.string().min(1, 'SARS password is required'),
  exampleAttachment: z.any().optional(),
  natureOfIndustry: z.string().min(1, 'Nature of industry is required'),
  turnoverOption: z.enum(['lessThan50k', 'moreThan50k']),
  turnover: z.string().min(1, 'Turnover is required'),
  assessmentPeriod: z.string().min(1, 'Assessment period is required'),
  assessmentTurnover: z.string().min(1, 'Assessment turnover is required'),
  assessmentBankStatements: z
    .any()
    .refine((files) => files?.length > 0, 'Assessment period bank statements are required'),
  cipcDocument: z.any().optional(),
  proofOfBusinessAddress: z
    .any()
    .refine((files) => files?.length > 0, 'Proof of business address is required'),
  customerInvoices: z.any().refine((files) => files?.length > 0, 'Customer invoices are required'),
  makeBooking: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export function VATRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'vat-registration',
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
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      turnoverOption: 'lessThan50k',
      makeBooking: false,
    },
  });

  const turnoverOption = watch('turnoverOption');
  const makeBooking = watch('makeBooking');

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
          key === 'exampleAttachment' ||
          key === 'assessmentBankStatements' ||
          key === 'cipcDocument' ||
          key === 'proofOfBusinessAddress' ||
          key === 'customerInvoices'
        ) {
          if (value && value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (key === 'makeBooking') {
          formData.append(key, value ? 'true' : 'false');
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
      title="VAT Registration"
      description="Please provide the required information for your VAT registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="natureOfIndustry">Nature of Industry</Label>
              <Textarea
                id="natureOfIndustry"
                {...register('natureOfIndustry')}
                placeholder="Describe the nature of your industry"
                className={errors.natureOfIndustry ? 'border-red-500' : ''}
              />
              {errors.natureOfIndustry && (
                <p className="text-sm text-red-500">{errors.natureOfIndustry.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Turnover Option</Label>
              <Controller
                name="turnoverOption"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lessThan50k" id="lessThan50k" />
                      <Label htmlFor="lessThan50k">Less than R50,000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moreThan50k" id="moreThan50k" />
                      <Label htmlFor="moreThan50k">More than R50,000</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turnover">
                {turnoverOption === 'lessThan50k'
                  ? '12 months turnover as per bank statement'
                  : '3-12 months turnover as per bank statement'}
              </Label>
              <Input
                id="turnover"
                {...register('turnover')}
                placeholder="Enter turnover amount"
                className={errors.turnover ? 'border-red-500' : ''}
              />
              <p className="text-sm text-gray-500">
                Please state estimate if bank statements are unavailable
              </p>
              {errors.turnover && <p className="text-sm text-red-500">{errors.turnover.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessmentPeriod">Period of Assessment</Label>
              <Controller
                name="assessmentPeriod"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.assessmentPeriod ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select assessment period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1month">1 Month</SelectItem>
                      <SelectItem value="2months">2 Months</SelectItem>
                      <SelectItem value="3months">3 Months</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="12months">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assessmentPeriod && (
                <p className="text-sm text-red-500">{errors.assessmentPeriod.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assessmentTurnover">Turnover for Selected Assessment Period</Label>
              <Input
                id="assessmentTurnover"
                {...register('assessmentTurnover')}
                placeholder="Enter turnover amount (minimum R50,000)"
                className={errors.assessmentTurnover ? 'border-red-500' : ''}
              />
              {errors.assessmentTurnover && (
                <p className="text-sm text-red-500">{errors.assessmentTurnover.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessmentBankStatements">Assessment Period Bank Statements</Label>
              <Input
                id="assessmentBankStatements"
                type="file"
                {...register('assessmentBankStatements')}
                className={errors.assessmentBankStatements ? 'border-red-500' : ''}
              />
              {errors.assessmentBankStatements && (
                <p className="text-sm text-red-500">
                  {errors.assessmentBankStatements.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cipcDocument">CIPC Document (if not uploaded already)</Label>
              <Input id="cipcDocument" type="file" {...register('cipcDocument')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofOfBusinessAddress">Proof of Business Address</Label>
              <Input
                id="proofOfBusinessAddress"
                type="file"
                {...register('proofOfBusinessAddress')}
                className={errors.proofOfBusinessAddress ? 'border-red-500' : ''}
              />
              {errors.proofOfBusinessAddress && (
                <p className="text-sm text-red-500">
                  {errors.proofOfBusinessAddress.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerInvoices">
                Invoices Issued to Customers for Assessment Period
              </Label>
              <Input
                id="customerInvoices"
                type="file"
                multiple
                {...register('customerInvoices')}
                className={errors.customerInvoices ? 'border-red-500' : ''}
              />
              {errors.customerInvoices && (
                <p className="text-sm text-red-500">
                  {errors.customerInvoices.message as React.ReactNode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2">
          <Controller
            name="makeBooking"
            control={control}
            render={({ field }) => (
              <Switch id="makeBooking" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Label htmlFor="makeBooking">
            I&apos;d like to schedule a call with Shaun to discuss within 24 hours
          </Label>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit VAT Registration'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default VATRegistrationForm;
