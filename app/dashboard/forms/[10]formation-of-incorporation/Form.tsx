'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  businessNameOptions: z.array(z.string()).length(5, 'Please provide 5 business name options'),
  yearEnd: z.string(),
  numberOfShares: z.number().min(100).max(1000),
  businessAddress: z.string().min(1, 'Business address is required'),
  postalAddress: z.string().min(1, 'Postal address is required'),
  emailAddress: z.string().email('Invalid email address').optional().or(z.literal('')),
  directorName: z.string().min(1, 'Director name is required'),
  directorSurname: z.string().min(1, 'Director surname is required'),
  directorIdOrPassport: z.string().min(1, 'ID or passport number is required'),
  directorDateOfBirth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: "That's not a valid date",
  }),
  directorResidentialAddress: z.string().min(1, 'Residential address is required'),
  directorPostalAddress: z.string().min(1, 'Postal address is required'),
  directorContactNumber: z.string().min(1, 'Contact number is required'),
  directorEmail: z.string().email('Invalid email address'),
  directorIdCopy: z
    .any()
    .refine((files) => files?.length > 0, "Director's ID or passport copy is required"),
  incorporationRules: z.enum(['standard', 'custom']),
});

type FormData = z.infer<typeof formSchema>;

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function FormationOfIncorporationForm({
  onSubmissionSuccess,
  collectionName = 'formation-of-incorporation',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('10', async () => {
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
      yearEnd: 'February',
      numberOfShares: 1000,
      incorporationRules: 'standard',
    },
  });

  const incorporationRules = watch('incorporationRules');

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
        if (key === 'businessNameOptions') {
          (value as string[]).forEach((name, index) => {
            formData.append(`businessNameOptions[${index}]`, name);
          });
        } else if (key === 'directorDateOfBirth') {
          formData.append(key, (value as Date).toISOString());
        } else if (key !== 'directorIdCopy') {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }
      if (data.directorIdCopy && data.directorIdCopy.length > 0) {
        formData.append('directorIdCopy', data.directorIdCopy[0]);
      }

      formData.append('collectionName', collectionName);
      formData.append('formId', '10');

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
      title="Formation of Incorporation"
      description="Please provide the required information to form your incorporation"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Label>Business Name Options</Label>
          {[0, 1, 2, 3, 4].map((index) => (
            <Input
              key={index}
              {...register(`businessNameOptions.${index}`)}
              placeholder={`Business Name Option ${index + 1}`}
              className={errors.businessNameOptions?.[index] ? 'border-red-500' : ''}
            />
          ))}
          {errors.businessNameOptions && (
            <p className="text-sm text-red-500">{errors.businessNameOptions.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="yearEnd">Year End</Label>
          <Controller
            name="yearEnd"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year end" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numberOfShares">Number of Shares</Label>
          <Input
            id="numberOfShares"
            type="number"
            {...register('numberOfShares', { valueAsNumber: true })}
            defaultValue={1000}
            min={100}
            max={1000}
            className={errors.numberOfShares ? 'border-red-500' : ''}
          />
          {errors.numberOfShares && (
            <p className="text-sm text-red-500">{errors.numberOfShares.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address</Label>
          <Input
            id="businessAddress"
            {...register('businessAddress')}
            className={errors.businessAddress ? 'border-red-500' : ''}
          />
          {errors.businessAddress && (
            <p className="text-sm text-red-500">{errors.businessAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalAddress">Postal Address</Label>
          <Input
            id="postalAddress"
            {...register('postalAddress')}
            className={errors.postalAddress ? 'border-red-500' : ''}
          />
          {errors.postalAddress && (
            <p className="text-sm text-red-500">{errors.postalAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailAddress">Email Address (Optional)</Label>
          <Input
            id="emailAddress"
            type="email"
            {...register('emailAddress')}
            className={errors.emailAddress ? 'border-red-500' : ''}
          />
          {errors.emailAddress && (
            <p className="text-sm text-red-500">{errors.emailAddress.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Director Information</h3>

          <div className="space-y-2">
            <Label htmlFor="directorName">Name</Label>
            <Input
              id="directorName"
              {...register('directorName')}
              className={errors.directorName ? 'border-red-500' : ''}
            />
            {errors.directorName && (
              <p className="text-sm text-red-500">{errors.directorName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorSurname">Surname</Label>
            <Input
              id="directorSurname"
              {...register('directorSurname')}
              className={errors.directorSurname ? 'border-red-500' : ''}
            />
            {errors.directorSurname && (
              <p className="text-sm text-red-500">{errors.directorSurname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorIdOrPassport">ID or Passport Number</Label>
            <Input
              id="directorIdOrPassport"
              {...register('directorIdOrPassport')}
              className={errors.directorIdOrPassport ? 'border-red-500' : ''}
            />
            {errors.directorIdOrPassport && (
              <p className="text-sm text-red-500">{errors.directorIdOrPassport.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorDateOfBirth">Date of Birth</Label>
            <Controller
              name="directorDateOfBirth"
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
                      disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.directorDateOfBirth && (
              <p className="text-sm text-red-500">{errors.directorDateOfBirth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorResidentialAddress">Residential Address</Label>
            <Input
              id="directorResidentialAddress"
              {...register('directorResidentialAddress')}
              className={errors.directorResidentialAddress ? 'border-red-500' : ''}
            />
            {errors.directorResidentialAddress && (
              <p className="text-sm text-red-500">{errors.directorResidentialAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorPostalAddress">Postal Address</Label>
            <Input
              id="directorPostalAddress"
              {...register('directorPostalAddress')}
              className={errors.directorPostalAddress ? 'border-red-500' : ''}
            />
            {errors.directorPostalAddress && (
              <p className="text-sm text-red-500">{errors.directorPostalAddress.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorContactNumber">Contact Number</Label>
            <Input
              id="directorContactNumber"
              {...register('directorContactNumber')}
              className={errors.directorContactNumber ? 'border-red-500' : ''}
            />
            {errors.directorContactNumber && (
              <p className="text-sm text-red-500">{errors.directorContactNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorEmail">Email Address</Label>
            <Input
              id="directorEmail"
              type="email"
              {...register('directorEmail')}
              className={errors.directorEmail ? 'border-red-500' : ''}
            />
            {errors.directorEmail && (
              <p className="text-sm text-red-500">{errors.directorEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directorIdCopy">Upload Director&apos;s ID or Passport Copy</Label>
            <Input
              id="directorIdCopy"
              type="file"
              {...register('directorIdCopy')}
              className={errors.directorIdCopy ? 'border-red-500' : ''}
            />
            {errors.directorIdCopy && (
              <p className="text-sm text-red-500">
                {errors.directorIdCopy.message as React.ReactNode}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Rules for Incorporation</Label>
          <Controller
            name="incorporationRules"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard Set of Rules</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Customized Set of Rules</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {incorporationRules === 'custom' && (
          <div className="rounded-m d bg-yellow-100 p-4">
            <p className="text-sm text-yellow-800">
              You have selected a customized set of rules. Please note that you will need to make a
              booking to discuss the customized requirements. Our team will contact you to arrange
              this meeting.
            </p>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Submitting...' : 'Submit Formation of Incorporation'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default FormationOfIncorporationForm;
