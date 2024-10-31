'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const formSchema = z.object({
  contactInfo: z.string().min(1, 'Contact information is required'),
  sarsUsername: z.string().min(1, 'SARS username is required'),
  sarsPassword: z.string().min(1, 'SARS password is required'),
  registrationMethod: z.enum(['cipcNumber', 'uploadDocument']),
  cipcNumber: z.string().min(1, 'CIPC number is required').optional(),
  registrationDocument: z.any().optional(),
  financialYear: z.string().regex(/^\d{4}$/, 'Invalid year'),
  companyStatus: z.enum(['active', 'dormant']),
  financialStatements: z.any().optional(),
  shareholderDeclaration: z.any().optional(),
  bookingPreference: z.enum(['upload', 'scheduleCall']),
  callDate: z.date().optional(),
  callTime: z.string().optional(),
  callMethod: z.enum(['phone', 'video', 'whatsapp']).optional(),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export function SARSTaxReturnsForm({
  onSubmissionSuccess,
  collectionName = 'sars-company-cc-trust-tax-returns',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('15', async () => {
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
      registrationMethod: 'cipcNumber',
      companyStatus: 'active',
      bookingPreference: 'upload',
      financialYear: currentYear.toString(),
    },
  });

  const registrationMethod = watch('registrationMethod');
  const companyStatus = watch('companyStatus');
  const bookingPreference = watch('bookingPreference');
  const selectedDate = watch('callDate');

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
        if (key === 'callDate') {
          formData.append(key, value ? value.toISOString() : '');
        } else if (
          key !== 'registrationDocument' &&
          key !== 'financialStatements' &&
          key !== 'shareholderDeclaration'
        ) {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }

      if (data.registrationMethod === 'uploadDocument' && data.registrationDocument) {
        formData.append('registrationDocument', data.registrationDocument[0]);
      }

      if (data.companyStatus === 'active' && data.financialStatements) {
        formData.append('financialStatements', data.financialStatements[0]);
      }

      if (data.companyStatus === 'dormant' && data.shareholderDeclaration) {
        formData.append('shareholderDeclaration', data.shareholderDeclaration[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '15');

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
      title="SARS Company/CC/Trust Tax Returns"
      description="Please provide the required information for your tax return submission"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
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

        <div className="space-y-4">
          <Label>Registration Method</Label>
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
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="financialYear">Financial Year</Label>
          <Controller
            name="financialYear"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select financial year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.financialYear && (
            <p className="text-sm text-red-500">{errors.financialYear.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label>Company Status</Label>
          <Controller
            name="companyStatus"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dormant" id="dormant" />
                  <Label htmlFor="dormant">Dormant</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {companyStatus === 'active' && (
          <div className="space-y-2">
            <Label htmlFor="financialStatements">Upload Financial Statements</Label>
            <Input
              id="financialStatements"
              type="file"
              {...register('financialStatements')}
              className={errors.financialStatements ? 'border-red-500' : ''}
            />
            {errors.financialStatements && (
              <p className="text-sm text-red-500">
                {errors.financialStatements.message as React.ReactNode}
              </p>
            )}
          </div>
        )}

        {companyStatus === 'dormant' && (
          <div className="space-y-4">
            <Label>Booking Preference</Label>
            <Controller
              name="bookingPreference"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload" />
                    <Label htmlFor="upload">Upload Shareholder Declaration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduleCall" id="scheduleCall" />
                    <Label htmlFor="scheduleCall">Schedule a Call</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {bookingPreference === 'upload' && (
              <div className="space-y-2">
                <Label htmlFor="shareholderDeclaration">Upload Shareholder Declaration</Label>
                <Input
                  id="shareholderDeclaration"
                  type="file"
                  {...register('shareholderDeclaration')}
                  className={errors.shareholderDeclaration ? 'border-red-500' : ''}
                />
                {errors.shareholderDeclaration && (
                  <p className="text-sm text-red-500">
                    {errors.shareholderDeclaration.message as React.ReactNode}
                  </p>
                )}
              </div>
            )}

            {bookingPreference === 'scheduleCall' && (
              <div className="space-y-4">
                <Label>Select Date and Time for Call</Label>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <div className="flex-1">
                    <Controller
                      name="callDate"
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
                      name="callTime"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
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
                <div className="space-y-2">
                  <Label>Call Method</Label>
                  <Controller
                    name="callMethod"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="phone" />
                          <Label htmlFor="phone">Phone Call</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video">Video Call</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="whatsapp" id="whatsapp" />
                          <Label htmlFor="whatsapp">WhatsApp Chat</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Tax Return Information'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        **Should we find any parts of your return where you are able to maximise your return or be
        more tax efficient, we will contact you directly to discuss.
      </p>
    </FormWrapper>
  );
}

export default SARSTaxReturnsForm;
