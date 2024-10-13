"use client";

import { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { Stepper, Step } from "@/components/ui/stepper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format, addBusinessDays } from "date-fns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  trustName: z.string().min(2, "Trust name must be at least 2 characters"),
  trustPurpose: z.string().min(10, "Please provide more details about the trust purpose"),
  consultationDate: z.date({
    required_error: "Please select a date for your consultation",
  }),
  consultationTime: z.string().min(1, "Please select a time for your consultation"),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
];

export function TrustFormationForm({
  onSubmissionSuccess,
  collectionName = "formation-of-trust",
  
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("5", async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedDate = watch("consultationDate");

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
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("contactNumber", data.contactNumber);
      formData.append("trustName", data.trustName);
      formData.append("trustPurpose", data.trustPurpose);
      formData.append("consultationDate", data.consultationDate.toISOString());
      formData.append("consultationTime", data.consultationTime);
      formData.append("collectionName", collectionName);
      formData.append("formId", "5");

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
      : currentStep === 1
      ? ["trustName", "trustPurpose"]
      : ["consultationDate", "consultationTime"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const maxDate = addBusinessDays(new Date(), 21);

  return (
    <FormWrapper
      title="Trust Formation Booking Form"
      description="Please provide your details and select a consultation date within 21 working days"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Contact Information" />
        <Step label="Trust Details" />
        <Step label="Consultation Booking" />
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                {...register("fullName")}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                {...register("contactNumber")}
                className={errors.contactNumber ? "border-red-500" : ""}
              />
              {errors.contactNumber && (
                <p className="text-red-500 text-sm">{errors.contactNumber.message}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="trustName">Trust Name</Label>
              <Input
                id="trustName"
                {...register("trustName")}
                className={errors.trustName ? "border-red-500" : ""}
              />
              {errors.trustName && (
                <p className="text-red-500 text-sm">{errors.trustName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="trustPurpose">Trust Purpose</Label>
              <Textarea
                id="trustPurpose"
                {...register("trustPurpose")}
                className={errors.trustPurpose ? "border-red-500" : ""}
                rows={4}
              />
              {errors.trustPurpose && (
                <p className="text-red-500 text-sm">{errors.trustPurpose.message}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <div className="space-y-4">
              <Label>Select Consultation Date (Within 21 Working Days)</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setValue("consultationDate", date as Date)}
                className="rounded-md border"
                disabled={(date) => 
                  date < new Date() || 
                  date > maxDate || 
                  date.getDay() === 0 || 
                  date.getDay() === 6
                }
              />
              {errors.consultationDate && (
                <p className="text-red-500 text-sm">{errors.consultationDate.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationTime">Select Consultation Time</Label>
              <Controller
                name="consultationTime"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className={errors.consultationTime ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a time" />
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
              {errors.consultationTime && (
                <p className="text-red-500 text-sm">{errors.consultationTime.message}</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 2 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Book Consultation"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default TrustFormationForm;