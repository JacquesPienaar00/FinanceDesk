"use client";

import { useState, useRef } from "react";
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
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  priorAnnualReturn: z.string().min(1, "This field is required"),
  annualTurnover: z.string().min(1, "This field is required"),
  fileMoreReturns: z.string().min(1, "This field is required"),
  file: z.any()
    .refine((files) => files?.length > 0, "File is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, .png formats are supported."
    ),
});

type FormData = z.infer<typeof formSchema>;

export function COIDARegistrationForm({
  onSubmissionSuccess,
  collectionName = "cipc-annual-return-filing",
  pfDataItemToRemove = "1",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("1", async () => {
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
      formData.append("formId", "1");

      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }

      if (data.file && data.file[0]) {
        formData.append("file", data.file[0]);
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
      ? ["priorAnnualReturn", "annualTurnover", "fileMoreReturns"]
      : ["file"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormWrapper
      title="COIDA Registration Form"
      description="Please fill out the form below to register for COIDA"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Personal Information" />
        <Step label="Business Information" />
        <Step label="Document Upload" />
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
                <p className="text-red-500 text-sm">{errors.fullName.message as React.ReactNode}</p>
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
                <p className="text-red-500 text-sm">{errors.email.message as React.ReactNode}</p>
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
                <p className="text-red-500 text-sm">{errors.contactNumber.message as React.ReactNode}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="priorAnnualReturn">Prior Annual Return</Label>
              <Input
                id="priorAnnualReturn"
                {...register("priorAnnualReturn")}
                className={errors.priorAnnualReturn ? "border-red-500" : ""}
              />
              {errors.priorAnnualReturn && (
                <p className="text-red-500 text-sm">{errors.priorAnnualReturn.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualTurnover">Annual Turnover</Label>
              <Input
                id="annualTurnover"
                {...register("annualTurnover")}
                className={errors.annualTurnover ? "border-red-500" : ""}
              />
              {errors.annualTurnover && (
                <p className="text-red-500 text-sm">{errors.annualTurnover.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileMoreReturns">File More Returns</Label>
              <Input
                id="fileMoreReturns"
                {...register("fileMoreReturns")}
                className={errors.fileMoreReturns ? "border-red-500" : ""}
              />
              {errors.fileMoreReturns && (
                <p className="text-red-500 text-sm">{errors.fileMoreReturns.message as React.ReactNode}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 2 && (
          <div className="space-y-2">
            <Label htmlFor="file">Upload Document</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              {...register("file")}
              className={errors.file ? "border-red-500" : ""}
            />
            {errors.file && (
              <p className="text-red-500 text-sm">{errors.file.message as React.ReactNode}</p>
            )}
          </div>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default COIDARegistrationForm;