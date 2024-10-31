'use client';

import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormWrapper } from '@/app/dashboard/forms/components/FormWrapper';
import { Stepper, Step } from '@/components/ui/stepper';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useMultiStepForm } from '@/app/dashboard/forms/hooks/useMultiStepForm';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  consultationDate: z.date({
    required_error: 'Please select a date for your consultation',
  }),
  consultationTime: z.string().min(1, 'Please select a time for your consultation'),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

export default function COIDAROE({
  onSubmissionSuccess,
  collectionName = 'coida-workmens-compensation-return-of-earnings',
  pfDataItemToRemove = '3',
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const {
    currentStep,
    form: {
      register,
      formState: { errors },
      setValue,
      watch,
    },
    isSubmitting,
    handleSubmit,
    handleNextStep,
    handlePrevStep,
  } = useMultiStepForm<FormData>({
    formId: '3',
    collectionName,
    schema: formSchema,
    onSubmissionSuccess,
    pfDataItemToRemove,
    steps: ['personalInfo', 'consultationDetails'],
  });

  const selectedDate = watch('consultationDate');
  const selectedTime = watch('consultationTime');

  return (
    <FormWrapper
      title="Consultation Booking Form"
      description="Please select a date and time for your consultation"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Consultation Details" />
      </Stepper>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {currentStep === 0 && (
          <>
            <Input
              {...register('fullName')}
              placeholder="Full Name"
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
            )}
            <Input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            <Input
              {...register('contactNumber')}
              placeholder="Contact Number"
              className={errors.contactNumber ? 'border-red-500' : ''}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.contactNumber.message}</p>
            )}
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Select Consultation Date
              </label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setValue('consultationDate', date as Date)}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              />
              {errors.consultationDate && (
                <p className="mt-1 text-sm text-red-500">{errors.consultationDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Consultation Time
              </label>
              <RadioGroup
                onValueChange={(value) => setValue('consultationTime', value)}
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
              >
                {availableTimes.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <RadioGroupItem value={time} id={time} />
                    <Label htmlFor={time}>{time}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.consultationTime && (
                <p className="mt-1 text-sm text-red-500">{errors.consultationTime.message}</p>
              )}
            </div>
            {selectedDate && selectedTime && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h3 className="mb-2 text-lg font-semibold">Selected Consultation:</h3>
                  <p>Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
                  <p>Time: {selectedTime}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 1 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 1 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Book Consultation'}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}
