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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  directorName: z.string().min(1, 'Director name is required'),
  directorSurname: z.string().min(1, 'Director surname is required'),
  directorIdNumber: z.string().min(13, 'Valid ID number is required').max(13),
  directorCellNumber: z.string().min(10, 'Valid cell number is required'),
  directorEmail: z.string().email('Invalid email address'),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeSurname: z.string().min(1, 'Employee surname is required'),
  employeeIdNumber: z.string().min(13, 'Valid ID number is required').max(13),
  employeeDateOfBirth: z.date({
    required_error: 'Date of birth is required',
    invalid_type_error: "That's not a valid date",
  }),
  employeeStartDate: z.date({
    required_error: 'Employment start date is required',
    invalid_type_error: "That's not a valid date",
  }),
  employeeGrossSalary: z.string().min(1, 'Gross monthly salary is required'),
  employeeAddress: z.string().min(1, 'Employee residential address is required'),
  registrationMethod: z.enum(['cipcNumber', 'uploadDocument']),
  cipcNumber: z.string().min(1, 'CIPC number is required').optional(),
  registrationDocument: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function DOLUIFRegistrationForm({
  onSubmissionSuccess,
  collectionName = 'department-of-labour-uif-registration',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission('16', async () => {
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
    },
  });

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
        if (key === 'employeeDateOfBirth' || key === 'employeeStartDate') {
          formData.append(key, value ? (value as Date).toISOString() : '');
        } else if (key !== 'registrationDocument') {
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

      formData.append('collectionName', collectionName);
      formData.append('formId', '16');

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
      title="Department of Labour UIF Registration"
      description="Please provide the required information for UIF registration"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Main Director/Member Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              <Label htmlFor="directorIdNumber">ID Number</Label>
              <Input
                id="directorIdNumber"
                {...register('directorIdNumber')}
                className={errors.directorIdNumber ? 'border-red-500' : ''}
              />
              {errors.directorIdNumber && (
                <p className="text-sm text-red-500">{errors.directorIdNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="directorCellNumber">Cell Number</Label>
              <Input
                id="directorCellNumber"
                {...register('directorCellNumber')}
                className={errors.directorCellNumber ? 'border-red-500' : ''}
              />
              {errors.directorCellNumber && (
                <p className="text-sm text-red-500">{errors.directorCellNumber.message}</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Details</CardTitle>
            <CardDescription>
              We require at least one employee&apos;s details in order to register
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeName">Name</Label>
              <Input
                id="employeeName"
                {...register('employeeName')}
                className={errors.employeeName ? 'border-red-500' : ''}
              />
              {errors.employeeName && (
                <p className="text-sm text-red-500">{errors.employeeName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeSurname">Surname</Label>
              <Input
                id="employeeSurname"
                {...register('employeeSurname')}
                className={errors.employeeSurname ? 'border-red-500' : ''}
              />
              {errors.employeeSurname && (
                <p className="text-sm text-red-500">{errors.employeeSurname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeIdNumber">ID Number</Label>
              <Input
                id="employeeIdNumber"
                {...register('employeeIdNumber')}
                className={errors.employeeIdNumber ? 'border-red-500' : ''}
              />
              {errors.employeeIdNumber && (
                <p className="text-sm text-red-500">{errors.employeeIdNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeDateOfBirth">Date of Birth</Label>
              <Controller
                name="employeeDateOfBirth"
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
              {errors.employeeDateOfBirth && (
                <p className="text-sm text-red-500">{errors.employeeDateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeStartDate">Employment Start Date</Label>
              <Controller
                name="employeeStartDate"
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
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.employeeStartDate && (
                <p className="text-sm text-red-500">{errors.employeeStartDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeGrossSalary">Gross Monthly Salary</Label>
              <Input
                id="employeeGrossSalary"
                type="number"
                {...register('employeeGrossSalary')}
                className={errors.employeeGrossSalary ? 'border-red-500' : ''}
              />
              {errors.employeeGrossSalary && (
                <p className="text-sm text-red-500">{errors.employeeGrossSalary.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeAddress">Residential Address</Label>
              <Input
                id="employeeAddress"
                {...register('employeeAddress')}
                className={errors.employeeAddress ? 'border-red-500' : ''}
              />
              {errors.employeeAddress && (
                <p className="text-sm text-red-500">{errors.employeeAddress.message}</p>
              )}
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
          {isSubmitting ? 'Submitting...' : 'Submit UIF Registration'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Once a DOL registration is completed, we will guide you through the process toward entering
        in all staff and employees details for UFiling purposes.
      </p>
    </FormWrapper>
  );
}

export default DOLUIFRegistrationForm;
