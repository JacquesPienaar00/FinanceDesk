'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  natureOfTrade: z.string().min(1, 'Nature of trade is required'),
  descriptionOfServices: z.string().min(10, 'Description must be at least 10 characters long'),
  email: z.string().email('Invalid email address'),
  cellNumber: z.string().min(10, 'Cell number must be at least 10 digits'),
  otpDate: z.date({
    required_error: 'Please select a date for OTP finalization',
  }),
  otpTime: z.string().min(1, 'Please select a time for OTP finalization'),
  registrationMethod: z.enum(['upload', 'number']),
  cipcRegistrationNumber: z.string().min(1, 'CIPC registration number is required').optional(),
  cipcRegistrationDocument: z.any().optional(),
  bankAccountConfirmation: z
    .any()
    .refine((file) => file?.length > 0, 'Bank account confirmation is required'),
  bbbeeAffidavit: z.any().optional(),
  cipcDocument: z
    .any()
    .refine((file) => file?.length > 0, 'CIPC registration document is required'),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export function CSDProfileRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'csd-profile-registration',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('9', async () => {
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
      registrationMethod: 'upload',
    },
  });

  const registrationMethod = watch('registrationMethod');
  const selectedDate = watch('otpDate');

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
        if (key === 'otpDate') {
          formData.append(key, value.toISOString());
        } else if (
          key !== 'cipcRegistrationDocument' &&
          key !== 'bankAccountConfirmation' &&
          key !== 'bbbeeAffidavit' &&
          key !== 'cipcDocument'
        ) {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }
      if (data.registrationMethod === 'upload' && data.cipcRegistrationDocument) {
        formData.append('cipcRegistrationDocument', data.cipcRegistrationDocument[0]);
      }

      if (data.bankAccountConfirmation) {
        formData.append('bankAccountConfirmation', data.bankAccountConfirmation[0]);
      }

      if (data.bbbeeAffidavit) {
        formData.append('bbbeeAffidavit', data.bbbeeAffidavit[0]);
      }

      if (data.cipcDocument) {
        formData.append('cipcDocument', data.cipcDocument[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '9');

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
      title="CSD Profile Registration"
      description="Please provide the required information for your Central Supplier Database profile registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="natureOfTrade">Nature of Trade</Label>
          <Input
            id="natureOfTrade"
            {...register('natureOfTrade')}
            placeholder="Enter the nature of your business"
            className={errors.natureOfTrade ? 'border-red-500' : ''}
          />
          {errors.natureOfTrade && (
            <p className="text-sm text-red-500">
              {errors.natureOfTrade.message as React.ReactNode}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionOfServices">Description of Goods or Services</Label>
          <Textarea
            id="descriptionOfServices"
            {...register('descriptionOfServices')}
            placeholder="Describe the goods or services you offer"
            className={errors.descriptionOfServices ? 'border-red-500' : ''}
          />
          {errors.descriptionOfServices && (
            <p className="text-sm text-red-500">
              {errors.descriptionOfServices.message as React.ReactNode}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter your email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message as React.ReactNode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cellNumber">Cell Number</Label>
          <Input
            id="cellNumber"
            {...register('cellNumber')}
            placeholder="Enter your cell number"
            className={errors.cellNumber ? 'border-red-500' : ''}
          />
          {errors.cellNumber && (
            <p className="text-sm text-red-500">{errors.cellNumber.message as React.ReactNode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>OTP Finalization Date and Time</Label>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
            <div className="flex-1">
              <Controller
                name="otpDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && 'text-muted-foreground'
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div className="flex-1">
              <Controller
                name="otpTime"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
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
          </div>
          {(errors.otpDate || errors.otpTime) && (
            <p className="text-sm text-red-500">
              Please select both date and time for OTP finalization
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>CIPC Registration Method</Label>
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
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload">Upload CIPC Registration Document</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="number" id="number" />
                  <Label htmlFor="number">Enter CIPC Business Registration Number</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {registrationMethod === 'upload' && (
          <div className="space-y-2">
            <Label htmlFor="cipcRegistrationDocument">CIPC Registration Document</Label>
            <Input
              id="cipcRegistrationDocument"
              type="file"
              {...register('cipcRegistrationDocument')}
              className={errors.cipcRegistrationDocument ? 'border-red-500' : ''}
            />
            {errors.cipcRegistrationDocument && (
              <p className="text-sm text-red-500">
                {errors.cipcRegistrationDocument.message as React.ReactNode}
              </p>
            )}
          </div>
        )}

        {registrationMethod === 'number' && (
          <div className="space-y-2">
            <Label htmlFor="cipcRegistrationNumber">CIPC Business Registration Number</Label>
            <Input
              id="cipcRegistrationNumber"
              {...register('cipcRegistrationNumber')}
              placeholder="Enter your CIPC registration number"
              className={errors.cipcRegistrationNumber ? 'border-red-500' : ''}
            />
            {errors.cipcRegistrationNumber && (
              <p className="text-sm text-red-500">
                {errors.cipcRegistrationNumber.message as React.ReactNode}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="bankAccountConfirmation">Confirmation of Bank Account</Label>
          <Input
            id="bankAccountConfirmation"
            type="file"
            {...register('bankAccountConfirmation')}
            className={errors.bankAccountConfirmation ? 'border-red-500' : ''}
          />
          {errors.bankAccountConfirmation && (
            <p className="text-sm text-red-500">
              {errors.bankAccountConfirmation.message as React.ReactNode}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bbbeeAffidavit">BBBEE Affidavit (if available)</Label>
          <Input id="bbbeeAffidavit" type="file" {...register('bbbeeAffidavit')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cipcDocument">CIPC Registration Document</Label>
          <Input
            id="cipcDocument"
            type="file"
            {...register('cipcDocument')}
            className={errors.cipcDocument ? 'border-red-500' : ''}
          />
          {errors.cipcDocument && (
            <p className="text-sm text-red-500">{errors.cipcDocument.message as React.ReactNode}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit CSD Profile Registration'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default CSDProfileRegistrationForm;
