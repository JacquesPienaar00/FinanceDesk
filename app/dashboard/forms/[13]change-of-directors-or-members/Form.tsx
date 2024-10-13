"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { Stepper, Step } from "@/components/ui/stepper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const directorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  postalAddress: z.string().min(1, "Postal address is required"),
  surname: z.string().min(1, "Surname is required"),
  idNumber: z.string().min(1, "ID number is required"),
  isPassport: z.boolean(),
  homeAddress: z.string().min(1, "Home address is required"),
  cellNumber: z.string().min(1, "Cell number is required"),
  numberOfShares: z.number().optional(),
  dateOfBirth: z.string().optional(),
  dateOfAddition: z.string().optional(),
  dateOfResignation: z.string().optional(),
  shareholdingPercentage: z.number().optional(),
});

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  newDirectorsCount: z.number().min(1, "At least one new director is required"),
  resigningDirectorsCount: z.number().min(0),
  newDirectors: z.array(directorSchema),
  resigningDirectors: z.array(directorSchema),
  cipcDocument: z.any().refine((files) => files?.length > 0, "CIPC document is required"),
});

type FormData = z.infer<typeof formSchema>;

export function ChangeOfDirectorsOrMembersForm({
  onSubmissionSuccess,
  collectionName = "change-of-directors-or-members",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("13", async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newDirectorsCount: 1,
      resigningDirectorsCount: 0,
      newDirectors: [{}],
      resigningDirectors: [],
    },
  });

  const {
    fields: newDirectorsFields,
    append: appendNewDirector,
    remove: removeNewDirector,
  } = useFieldArray({
    control,
    name: "newDirectors",
  });

  const {
    fields: resigningDirectorsFields,
    append: appendResigningDirector,
    remove: removeResigningDirector,
  } = useFieldArray({
    control,
    name: "resigningDirectors",
  });

  const newDirectorsCount = watch("newDirectorsCount");
  const resigningDirectorsCount = watch("resigningDirectorsCount");

  useEffect(() => {
    const difference = newDirectorsCount - newDirectorsFields.length;
    if (difference > 0) {
      for (let i = 0; i < difference; i++) appendNewDirector({
        name: "",
        email: "",
        postalAddress: "",
        surname: "",
        idNumber: "",
        isPassport: false,
        homeAddress: "",
        cellNumber: "",
      });
    } else if (difference < 0) {
      for (let i = 0; i < -difference; i++) removeNewDirector(newDirectorsFields.length - 1);
    }
  }, [newDirectorsCount, newDirectorsFields.length, appendNewDirector, removeNewDirector]);

  useEffect(() => {
    const difference = resigningDirectorsCount - resigningDirectorsFields.length;
    if (difference > 0) {
      for (let i = 0; i < difference; i++) appendResigningDirector({
        name: "",
        email: "",
        postalAddress: "",
        surname: "",
        idNumber: "",
        isPassport: false,
        homeAddress: "",
        cellNumber: "",
      });
    } else if (difference < 0) {
      for (let i = 0; i < -difference; i++) removeResigningDirector(resigningDirectorsFields.length - 1);
    }
  }, [resigningDirectorsCount, resigningDirectorsFields.length, appendResigningDirector, removeResigningDirector]);

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
      Object.entries(data).forEach(([key, value]) => {
        if (key === "newDirectors" || key === "resigningDirectors") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "cipcDocument") {
          formData.append(key, value as string);
        }
      });

      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }

      if (data.cipcDocument && data.cipcDocument.length > 0) {
        formData.append("cipcDocument", data.cipcDocument[0]);
      }

      formData.append("collectionName", collectionName);
      formData.append("formId", "13");

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
      ? ["companyName", "registrationNumber", "newDirectorsCount", "resigningDirectorsCount"]
      : ["newDirectors", "resigningDirectors", "cipcDocument"];

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
      title="Change of Directors or Members Form"
      description="Please provide the required information to change directors or members"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Company Information" />
        <Step label="Directors Details" />
      </Stepper>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-8">
        {currentStep === 0 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                {...register("companyName")}
                className={errors.companyName ? "border-red-500" : ""}
              />
              {errors.companyName && (
                <p className="text-red-500 text-sm">{errors.companyName.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                {...register("registrationNumber")}
                className={errors.registrationNumber ? "border-red-500" : ""}
              />
              {errors.registrationNumber && (
                <p className="text-red-500 text-sm">{errors.registrationNumber.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDirectorsCount">Number of New Directors</Label>
              <Input
                id="newDirectorsCount"
                type="number"
                {...register("newDirectorsCount", { valueAsNumber: true })}
                className={errors.newDirectorsCount ? "border-red-500" : ""}
              />
              {errors.newDirectorsCount && (
                <p className="text-red-500 text-sm">{errors.newDirectorsCount.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resigningDirectorsCount">Number of Resigning Directors</Label>
              <Input
                id="resigningDirectorsCount"
                type="number"
                {...register("resigningDirectorsCount", { valueAsNumber: true })}
                className={errors.resigningDirectorsCount ? "border-red-500" : ""}
              />
              {errors.resigningDirectorsCount && (
                <p className="text-red-500 text-sm">{errors.resigningDirectorsCount.message as React.ReactNode}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h3 className="text-lg font-semibold mb-4">New Directors</h3>
            {newDirectorsFields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-6 p-4 border rounded">
                <h4 className="font-medium">New Director {index + 1}</h4>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.name`}>Name</Label>
                  <Input
                    {...register(`newDirectors.${index}.name`)}
                    className={errors.newDirectors?.[index]?.name ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.name && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.name?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.surname`}>Surname</Label>
                  <Input
                    {...register(`newDirectors.${index}.surname`)}
                    className={errors.newDirectors?.[index]?.surname ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.surname && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.surname?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.email`}>Email</Label>
                  <Input
                    type="email"
                    {...register(`newDirectors.${index}.email`)}
                    className={errors.newDirectors?.[index]?.email ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.email && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.email?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.idNumber`}>ID Number</Label>
                  <Input
                    {...register(`newDirectors.${index}.idNumber`)}
                    className={errors.newDirectors?.[index]?.idNumber ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.idNumber && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.idNumber?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`newDirectors.${index}.isPassport`}
                    {...register(`newDirectors.${index}.isPassport`)}
                  />
                  <Label htmlFor={`newDirectors.${index}.isPassport`}>Is Passport</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.homeAddress`}>Home Address</Label>
                  <Input
                    {...register(`newDirectors.${index}.homeAddress`)}
                    className={errors.newDirectors?.[index]?.homeAddress ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.homeAddress && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.homeAddress?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.postalAddress`}>Postal Address</Label>
                  <Input
                    {...register(`newDirectors.${index}.postalAddress`)}
                    className={errors.newDirectors?.[index]?.postalAddress ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.postalAddress && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.postalAddress?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`newDirectors.${index}.cellNumber`}>Cell Number</Label>
                  <Input
                    {...register(`newDirectors.${index}.cellNumber`)}
                    className={errors.newDirectors?.[index]?.cellNumber ? "border-red-500" : ""}
                  />
                  {errors.newDirectors?.[index]?.cellNumber && (
                    <p className="text-red-500 text-sm">{errors.newDirectors[index]?.cellNumber?.message as React.ReactNode}</p>
                  )}
                </div>
              </div>
            ))}

            <h3 className="text-lg font-semibold mb-4 mt-8">Resigning Directors</h3>
            {resigningDirectorsFields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-6 p-4 border rounded">
                <h4 className="font-medium">Resigning Director {index + 1}</h4>
                <div className="space-y-2">
                  <Label htmlFor={`resigningDirectors.${index}.name`}>Name</Label>
                  <Input
                    {...register(`resigningDirectors.${index}.name`)}
                    className={errors.resigningDirectors?.[index]?.name ? "border-red-500" : ""}
                  />
                  {errors.resigningDirectors?.[index]?.name && (
                    <p className="text-red-500 text-sm">{errors.resigningDirectors[index]?.name?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`resigningDirectors.${index}.surname`}>Surname</Label>
                  <Input
                    {...register(`resigningDirectors.${index}.surname`)}
                    className={errors.resigningDirectors?.[index]?.surname ? "border-red-500" : ""}
                  />
                  {errors.resigningDirectors?.[index]?.surname && (
                    <p className="text-red-500 text-sm">{errors.resigningDirectors[index]?.surname?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`resigningDirectors.${index}.email`}>Email</Label>
                  <Input
                    type="email"
                    {...register(`resigningDirectors.${index}.email`)}
                    className={errors.resigningDirectors?.[index]?.email ? "border-red-500" : ""}
                  />
                  {errors.resigningDirectors?.[index]?.email && (
                    <p className="text-red-500 text-sm">{errors.resigningDirectors[index]?.email?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`resigningDirectors.${index}.idNumber`}>ID Number</Label>
                  <Input
                    {...register(`resigningDirectors.${index}.idNumber`)}
                    className={errors.resigningDirectors?.[index]?.idNumber ? "border-red-500" : ""}
                  />
                  {errors.resigningDirectors?.[index]?.idNumber && (
                    <p className="text-red-500 text-sm">{errors.resigningDirectors[index]?.idNumber?.message as React.ReactNode}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="cipcDocument">Upload CIPC Document</Label>
              <Input
                id="cipcDocument"
                type="file"
                {...register("cipcDocument")}
                className={errors.cipcDocument ? "border-red-500" : ""}
              />
              {errors.cipcDocument && (
                <p className="text-red-500 text-sm">{errors.cipcDocument.message as React.ReactNode}</p>
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
          {currentStep < 1 && (
            <Button type="button" onClick={handleNextStep}>
              Next
            </Button>
          )}
          {currentStep === 1 && (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Change of Directors"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default ChangeOfDirectorsOrMembersForm;