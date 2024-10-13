/*"use client";

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

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  priorAnnualReturn: z.string().min(1, "This field is required"),
  annualTurnover: z.string().min(1, "This field is required"),
  fileMoreReturns: z.string().min(1, "This field is required"),
});

type FormData = z.infer<typeof formSchema>;

export function SimpleRegistrationForm({
  onSubmissionSuccess,
  collectionName = "SimpleRegistrations",
  pfDataItemToRemove = "2",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm } = useFormSubmission("2", async () => {
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
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
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
      formData.append("priorAnnualReturn", data.priorAnnualReturn);
      formData.append("annualTurnover", data.annualTurnover);
      formData.append("fileMoreReturns", data.fileMoreReturns);
      formData.append("collectionName", collectionName);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate = currentStep === 0
      ? ["fullName", "email", "contactNumber"]
      : ["priorAnnualReturn", "annualTurnover", "fileMoreReturns"];

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
      title="Simple Registration Form"
      description="Please fill out the form below to register"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Business Information" />
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
            <Input
              {...register("priorAnnualReturn")}
              placeholder="Prior Annual Return"
              className={errors.priorAnnualReturn ? "border-red-500" : ""}
            />
            {errors.priorAnnualReturn && (
              <p className="text-red-500 text-sm mt-1">{errors.priorAnnualReturn.message}</p>
            )}
            <Input
              {...register("annualTurnover")}
              placeholder="Annual Turnover"
              className={errors.annualTurnover ? "border-red-500" : ""}
            />
            {errors.annualTurnover && (
              <p className="text-red-500 text-sm mt-1">{errors.annualTurnover.message}</p>
            )}
            <Input
              {...register("fileMoreReturns")}
              placeholder="File More Returns"
              className={errors.fileMoreReturns ? "border-red-500" : ""}
            />
            {errors.fileMoreReturns && (
              <p className="text-red-500 text-sm mt-1">{errors.fileMoreReturns.message}</p>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default SimpleRegistrationForm;
*/
