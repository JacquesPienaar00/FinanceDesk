"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { Stepper, Step } from "@/components/ui/stepper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits"),
  natureOfTrade: z
    .string()
    .min(5, "Nature of trade must be at least 5 characters"),
  directorName: z
    .string()
    .min(2, "Director name must be at least 2 characters"),
  directorSurname: z
    .string()
    .min(2, "Director surname must be at least 2 characters"),
  directorIdNumber: z
    .string()
    .min(13, "ID number must be 13 digits")
    .max(13, "ID number must be 13 digits"),
  numberOfShareholders: z.string().min(1, "Number of shareholders is required"),
  blackFemaleShareholding: z
    .string()
    .min(1, "Black female shareholding percentage is required"),
  blackMaleShareholding: z
    .string()
    .min(1, "Black male shareholding percentage is required"),
  otherShareholding: z
    .string()
    .min(1, "Other shareholding percentage is required"),
  registrationMethod: z.enum(["cipc", "upload"]),
  cipcRegistrationNumber: z.string().optional(),
  companyRegistrationDocuments: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function BBBEEAffidavitForm({
  onSubmissionSuccess,
  collectionName = "bbbee-affidavits-eme-and-qse",
  pfDataItemToRemove = "4",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
  pfDataItemToRemove?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("4", async () => {
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
          removeOnlyOne: true,
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
        description:
          "Form submitted successfully, but there was an issue updating your profile. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      registrationMethod: "cipc",
    },
  });

  const registrationMethod = watch("registrationMethod");

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
      formData.append("natureOfTrade", data.natureOfTrade);
      formData.append("directorName", data.directorName);
      formData.append("directorSurname", data.directorSurname);
      formData.append("directorIdNumber", data.directorIdNumber);
      formData.append("numberOfShareholders", data.numberOfShareholders);
      formData.append("blackFemaleShareholding", data.blackFemaleShareholding);
      formData.append("blackMaleShareholding", data.blackMaleShareholding);
      formData.append("otherShareholding", data.otherShareholding);
      formData.append("registrationMethod", data.registrationMethod);
      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }

      if (data.registrationMethod === "cipc") {
        formData.append(
          "cipcRegistrationNumber",
          data.cipcRegistrationNumber || ""
        );
      } else if (
        data.registrationMethod === "upload" &&
        data.companyRegistrationDocuments
      ) {
        formData.append("file", data.companyRegistrationDocuments[0]);
      }

      formData.append("collectionName", collectionName);
      formData.append("formId", "4");

      const success = await submitForm(formData);

      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNextStep = async () => {
    const fieldsToValidate =
      currentStep === 0
        ? ["fullName", "email", "contactNumber", "natureOfTrade"]
        : currentStep === 1
        ? ["directorName", "directorSurname", "directorIdNumber"]
        : currentStep === 2
        ? [
            "numberOfShareholders",
            "blackFemaleShareholding",
            "blackMaleShareholding",
            "otherShareholding",
          ]
        : ["registrationMethod"];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <FormWrapper
      title="BBBEE Affidavit Form (EME and QSE)"
      description="Please fill out the form below for your BBBEE Affidavit"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Contact Information" />
        <Step label="Director Details" />
        <Step label="Shareholding Details" />
        <Step label="Company Registration" />
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
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
            <Input
              {...register("contactNumber")}
              placeholder="Contact Number"
              className={errors.contactNumber ? "border-red-500" : ""}
            />
            {errors.contactNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contactNumber.message}
              </p>
            )}
            <Textarea
              {...register("natureOfTrade")}
              placeholder="Nature of Trade"
              className={errors.natureOfTrade ? "border-red-500" : ""}
            />
            {errors.natureOfTrade && (
              <p className="text-red-500 text-sm mt-1">
                {errors.natureOfTrade.message}
              </p>
            )}
          </>
        )}

        {currentStep === 1 && (
          <>
            <Input
              {...register("directorName")}
              placeholder="Director Name"
              className={errors.directorName ? "border-red-500" : ""}
            />
            {errors.directorName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.directorName.message}
              </p>
            )}
            <Input
              {...register("directorSurname")}
              placeholder="Director Surname"
              className={errors.directorSurname ? "border-red-500" : ""}
            />
            {errors.directorSurname && (
              <p className="text-red-500 text-sm mt-1">
                {errors.directorSurname.message}
              </p>
            )}
            <Input
              {...register("directorIdNumber")}
              placeholder="Director ID Number"
              className={errors.directorIdNumber ? "border-red-500" : ""}
            />
            {errors.directorIdNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.directorIdNumber.message}
              </p>
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <Input
              {...register("numberOfShareholders")}
              placeholder="Number of Shareholders"
              type="number"
              className={errors.numberOfShareholders ? "border-red-500" : ""}
            />
            {errors.numberOfShareholders && (
              <p className="text-red-500 text-sm mt-1">
                {errors.numberOfShareholders.message}
              </p>
            )}
            <Input
              {...register("blackFemaleShareholding")}
              placeholder="% of Black Female Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.blackFemaleShareholding ? "border-red-500" : ""}
            />
            {errors.blackFemaleShareholding && (
              <p className="text-red-500 text-sm mt-1">
                {errors.blackFemaleShareholding.message}
              </p>
            )}
            <Input
              {...register("blackMaleShareholding")}
              placeholder="% of Black Male Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.blackMaleShareholding ? "border-red-500" : ""}
            />
            {errors.blackMaleShareholding && (
              <p className="text-red-500 text-sm mt-1">
                {errors.blackMaleShareholding.message}
              </p>
            )}
            <Input
              {...register("otherShareholding")}
              placeholder="% of Other Shareholding"
              type="number"
              min="0"
              max="100"
              className={errors.otherShareholding ? "border-red-500" : ""}
            />
            {errors.otherShareholding && (
              <p className="text-red-500 text-sm mt-1">
                {errors.otherShareholding.message}
              </p>
            )}
          </>
        )}

        {currentStep === 3 && (
          <>
            <RadioGroup
              defaultValue="cipc"
              onValueChange={(value) =>
                setValue("registrationMethod", value as "cipc" | "upload")
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cipc" id="cipc" />
                <Label htmlFor="cipc">Enter CIPC Registration Number</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upload" id="upload" />
                <Label htmlFor="upload">
                  Upload Company Registration Documents
                </Label>
              </div>
            </RadioGroup>
            {registrationMethod === "cipc" && (
              <Input
                {...register("cipcRegistrationNumber")}
                placeholder="CIPC Registration Number"
                className={
                  errors.cipcRegistrationNumber ? "border-red-500" : ""
                }
              />
            )}
            {registrationMethod === "upload" && (
              <Input
                type="file"
                {...register("companyRegistrationDocuments")}
                className={
                  errors.companyRegistrationDocuments ? "border-red-500" : ""
                }
              />
            )}
            {errors.cipcRegistrationNumber && (
              <p className="text-red-500 text-sm mt-1">
                {errors.cipcRegistrationNumber.message}
              </p>
            )}
            {errors.companyRegistrationDocuments && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyRegistrationDocuments.message as React.ReactNode}
              </p>
            )}
          </>
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 0 && (
            <Button type="button" onClick={handlePrevStep}>
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 3 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Affidavit"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default BBBEEAffidavitForm;
