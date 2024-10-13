"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { Stepper, Step } from "@/components/ui/stepper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  consultationDate: z.date({
    required_error: "Please select a date for your consultation",
  }),
  consultationTime: z.string().min(1, "Please select a time for your consultation"),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export function COIDAROE({
  onSubmissionSuccess,
  collectionName = "coida-workmens-compensation-return-of-earnings",
  pfDataItemToRemove = "3",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("3", async () => {
    await removeItemFromPfData();
    onSubmissionSuccess();
    
  });

  const removeItemFromPfData = async () => {
    if (!session?.user?.id) {
      console.error("User ID not available");
      return;
    }

    try {
      const response = await fetch("/api/remove-pf-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: session.user.id, 
          itemName: pfDataItemToRemove,
          removeOnlyOne: true 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove item from pfData");
      }

      console.log("Item removed from pfData:", result.removedItem);
    } catch (error) {
      console.error("Error removing item from pfData:", error);
      toast({
        title: "Warning",
        description: "Form submitted successfully, but there was an issue updating your profile. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedDate = watch("consultationDate");
  const selectedTime = watch("consultationTime");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to submit the form.",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("username", data.fullName);
      formData.append("contact", data.contactNumber);
      formData.append("consultationDate", data.consultationDate.toISOString());
      formData.append("consultationTime", data.consultationTime);
      formData.append("collectionName", collectionName);
      formData.append("formId", "3");

      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }

      const success = await submitForm(formData);

      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 0
      ? ["fullName", "email", "contactNumber"]
      : ["consultationDate", "consultationTime"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 1));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormWrapper
      title="Consultation Booking Form"
      description="Please select a date and time for your consultation"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Consultation Details" />
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        {currentStep === 0 && (
          <>
            <Input
              {...register("fullName")}
              placeholder="Full Name"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
            <Input
              {...register("contactNumber")}
              placeholder="Contact Number"
              className={errors.contactNumber ? "border-red-500" : ""}
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
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
                onSelect={(date) => setValue("consultationDate", date as Date)}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
              />
              {errors.consultationDate && (
                <p className="text-red-500 text-sm mt-1">{errors.consultationDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Consultation Time
              </label>
              <RadioGroup
                onValueChange={(value) => setValue("consultationTime", value)}
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
                <p className="text-red-500 text-sm mt-1">{errors.consultationTime.message}</p>
              )}
            </div>
            {selectedDate && selectedTime && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-2">Selected Consultation:</h3>
                  <p>Date: {format(selectedDate, 'MMMM d, yyyy')}</p>
                  <p>Time: {selectedTime}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <div className="flex justify-between mt-6">
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
              {isSubmitting ? "Submitting..." : "Book Consultation"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default COIDAROE;