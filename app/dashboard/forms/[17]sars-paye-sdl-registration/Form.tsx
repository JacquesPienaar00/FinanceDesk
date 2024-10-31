'use client';

import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { useFormSubmission } from '@/app/dashboard/forms/hooks/useFormSubmmisions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  natureOfIndustry: z.string().min(1, 'Nature of industry is required'),
  contactInfo: z.string().min(1, 'Contact information is required'),
  registrationTypes: z.array(z.enum(['PAYE', 'SDL', 'UIF'])).refine((value) => value.length > 0, {
    message: 'At least one registration type must be selected',
  }),
  desiredRegistrationDate: z.date({
    required_error: 'Desired registration date is required',
    invalid_type_error: "That's not a valid date",
  }),
  sarsEfilingUsername: z.string().min(1, 'SARS eFiling username is required'),
  sarsPassword: z.string().min(1, 'SARS password is required'),
  exampleAttachment: z.enum(['attach', 'doNotHave']),
  exampleFile: z.any().optional(),
  registrationMethod: z.enum(['cipcNumber', 'uploadDocument']),
  cipcNumber: z.string().min(1, 'CIPC number is required').optional(),
  otherRegistrationNumber: z.string().min(1, 'Registration number is required').optional(),
  registrationDocument: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SARSPAYESDLRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'sars-paye-sdl-registration',
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
      registrationTypes: ['PAYE'],
      exampleAttachment: 'doNotHave',
      registrationMethod: 'cipcNumber',
    },
  });

  const registrationMethod = watch('registrationMethod');
  const exampleAttachment = watch('exampleAttachment');

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
        if (key === 'registrationTypes') {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'desiredRegistrationDate') {
          formData.append(key, value ? (value as Date).toISOString() : '');
        } else if (key !== 'exampleFile' && key !== 'registrationDocument') {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append('nextauth', session.user.email);
      }
      if (data.exampleAttachment === 'attach' && data.exampleFile) {
        formData.append('exampleFile', data.exampleFile[0]);
      }

      if (data.registrationMethod === 'uploadDocument' && data.registrationDocument) {
        formData.append('registrationDocument', data.registrationDocument[0]);
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
      title="SARS PAYE / SDL Registration"
      description="Please provide the required information for SARS PAYE / SDL registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                className={errors.natureOfIndustry ? 'border-red-500' : ''}
              />
              {errors.natureOfIndustry && (
                <p className="text-sm text-red-500">{errors.natureOfIndustry.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Textarea
                id="contactInfo"
                {...register('contactInfo')}
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
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Registration Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="registrationTypes"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="PAYE"
                        checked={field.value.includes('PAYE')}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, 'PAYE']
                            : field.value.filter((v) => v !== 'PAYE');
                          field.onChange(updatedValue);
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="PAYE">PAYE (Pay as you earn - EMP-201)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="registrationTypes"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="SDL"
                        checked={field.value.includes('SDL')}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, 'SDL']
                            : field.value.filter((v) => v !== 'SDL');
                          field.onChange(updatedValue);
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="SDL">SDL (Skills Development Levy)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="registrationTypes"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="UIF"
                        checked={field.value.includes('UIF')}
                        onCheckedChange={(checked) => {
                          const updatedValue = checked
                            ? [...field.value, 'UIF']
                            : field.value.filter((v) => v !== 'UIF');
                          field.onChange(updatedValue);
                        }}
                      />
                    )}
                  />
                  <Label htmlFor="UIF">UIF (Unemployment Insurance Fund)</Label>
                </div>
              </div>
              {errors.registrationTypes && (
                <p className="text-sm text-red-500">{errors.registrationTypes.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredRegistrationDate">Desired Registration Date</Label>
              <Controller
                name="desiredRegistrationDate"
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
              {errors.desiredRegistrationDate && (
                <p className="text-sm text-red-500">{errors.desiredRegistrationDate.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SARS eFiling Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sarsEfilingUsername">SARS eFiling Username</Label>
              <Input
                id="sarsEfilingUsername"
                {...register('sarsEfilingUsername')}
                className={errors.sarsEfilingUsername ? 'border-red-500' : ''}
              />
              {errors.sarsEfilingUsername && (
                <p className="text-sm text-red-500">{errors.sarsEfilingUsername.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sarsPassword">SARS Password</Label>
              <Input
                id="sarsPassword"
                type="password"
                {...register('sarsPassword')}
                className={errors.sarsPassword ? 'border-red-500' : ''}
              />
              {errors.sarsPassword && (
                <p className="text-sm text-red-500">{errors.sarsPassword.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Example Attachment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="exampleAttachment"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="attach" id="attach" />
                    <Label htmlFor="attach">Attach Example</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doNotHave" id="doNotHave" />
                    <Label htmlFor="doNotHave">Do Not Have</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {exampleAttachment === 'attach' && (
              <div className="space-y-2">
                <Label htmlFor="exampleFile">Example File</Label>
                <Input
                  id="exampleFile"
                  type="file"
                  {...register('exampleFile')}
                  className={errors.exampleFile ? 'border-red-500' : ''}
                />
                {errors.exampleFile && (
                  <p className="text-sm text-red-500">
                    {errors.exampleFile.message as React.ReactNode}
                  </p>
                )}
              </div>
            )}
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
                <Label htmlFor="cipcNumber">
                  CIPC Number (or other relevant registration number)
                </Label>
                <Input
                  id="cipcNumber"
                  {...register('cipcNumber')}
                  placeholder="Enter CIPC number or other registration number"
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
          {isSubmitting ? 'Submitting...' : 'Submit SARS PAYE / SDL Registration'}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default SARSPAYESDLRegistrationForm;
