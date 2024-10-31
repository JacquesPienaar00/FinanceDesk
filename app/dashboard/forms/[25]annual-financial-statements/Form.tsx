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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  contactInfo: z.string().min(1, 'Contact information is required'),
  bankConfirmationLetter: z
    .any()
    .refine((files) => files?.length > 0, 'Bank confirmation letter is required'),
  businessRegistrationDocument: z
    .any()
    .refine((files) => files?.length > 0, 'Business registration document is required'),
  businessRegistrationNumber: z.string().min(1, 'Business registration number is required'),
  usesAccountingSoftware: z.enum(['yes', 'no']),
  accountingSoftwareName: z.string().optional(),
  hasPriorYearFinancialStatements: z.enum(['yes', 'no']),
  priorYearFinancialStatements: z.any().optional(),
  bookingDate: z.date(),
  bookingTime: z.string().min(1, 'Booking time is required'),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export function AnnualFinancialStatementsForm({
  onSubmissionSuccess,
  collectionName = 'annual-financial-statements',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('25', async () => {
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
      usesAccountingSoftware: 'no',
      hasPriorYearFinancialStatements: 'no',
    },
  });

  const usesAccountingSoftware = watch('usesAccountingSoftware');
  const hasPriorYearFinancialStatements = watch('hasPriorYearFinancialStatements');
  const selectedDate = watch('bookingDate');

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
          key === 'bankConfirmationLetter' ||
          key === 'businessRegistrationDocument' ||
          key === 'priorYearFinancialStatements'
        ) {
          if (value && value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (key === 'bookingDate') {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value as string);
        }
      });

      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }
      formData.append('collectionName', collectionName);
      formData.append('formId', '25');

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
      title="Annual Financial Statements"
      description="Please provide the required information for your Annual Financial Statements"
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
                <p className="text-sm text-red-500">
                  {errors.contactInfo.message as React.ReactNode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankConfirmationLetter">Bank Confirmation Letter</Label>
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
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationDocument">
                CIPC Business Registration Document
              </Label>
              <Input
                id="businessRegistrationDocument"
                type="file"
                {...register('businessRegistrationDocument')}
                className={errors.businessRegistrationDocument ? 'border-red-500' : ''}
              />
              {errors.businessRegistrationDocument && (
                <p className="text-sm text-red-500">
                  {errors.businessRegistrationDocument.message as React.ReactNode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
              <Input
                id="businessRegistrationNumber"
                {...register('businessRegistrationNumber')}
                placeholder="Enter your business registration number"
                className={errors.businessRegistrationNumber ? 'border-red-500' : ''}
              />
              {errors.businessRegistrationNumber && (
                <p className="text-sm text-red-500">
                  {errors.businessRegistrationNumber.message as React.ReactNode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounting Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Do you currently make use of accounting software?</Label>
              <Controller
                name="usesAccountingSoftware"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="accounting-yes" />
                      <Label htmlFor="accounting-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="accounting-no" />
                      <Label htmlFor="accounting-no">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {usesAccountingSoftware === 'yes' && (
              <div className="space-y-2">
                <Label htmlFor="accountingSoftwareName">Accounting Software Name</Label>
                <Input
                  id="accountingSoftwareName"
                  {...register('accountingSoftwareName')}
                  placeholder="Enter the name of your accounting software"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Do you have prior year financial statements?</Label>
              <Controller
                name="hasPriorYearFinancialStatements"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="prior-statements-yes" />
                      <Label htmlFor="prior-statements-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="prior-statements-no" />
                      <Label htmlFor="prior-statements-no">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>
            {hasPriorYearFinancialStatements === 'yes' && (
              <div className="space-y-2">
                <Label htmlFor="priorYearFinancialStatements">
                  Upload Prior Year Financial Statements
                </Label>
                <Input
                  id="priorYearFinancialStatements"
                  type="file"
                  {...register('priorYearFinancialStatements')}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book a Discussion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Date and Time for Discussion</Label>
              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Controller
                  name="bookingDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={`w-[280px] justify-start text-left font-normal ${
                            !field.value && 'text-muted-foreground'
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                <Controller
                  name="bookingTime"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {errors.bookingDate && (
                <p className="text-sm text-red-500">
                  {errors.bookingDate.message as React.ReactNode}
                </p>
              )}
              {errors.bookingTime && (
                <p className="text-sm text-red-500">
                  {errors.bookingTime.message as React.ReactNode}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Annual Financial Statements Form'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default AnnualFinancialStatementsForm;
