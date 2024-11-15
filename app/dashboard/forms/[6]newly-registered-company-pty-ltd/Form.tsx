"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
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

const directorSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(1, "Full name is required"),
  postalAddress: z.string().min(1, "Postal address is required"),
  surname: z.string().min(1, "Surname is required"),
  cellNumber: z.string().min(1, "Cell number is required"),
  dateOfBirth: z.date(),
  idOrPassport: z.string().min(1, "ID or Passport number is required"),
  countryOfOrigin: z.string().min(1, "Country of origin is required"),
  percentageShareholding: z.number().min(0).max(100),
  residentialAddress: z.string().min(1, "Residential address is required"),
  idCopy: z.any()
    .refine((files) => files?.length > 0, "ID copy is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, .png formats are supported."
    ),
});

const formSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  registrationDate: z.date(),
  numberOfDirectors: z.number().min(1, "At least one director is required"),
  directors: z.array(directorSchema),
  memorandumOfIncorporation: z.any()
    .refine((files) => files?.length > 0, "Memorandum of Incorporation is required")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 10MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .pdf, .jpg, .jpeg, .png formats are supported."
    ),
});

type FormData = z.infer<typeof formSchema>;

export function NewlyRegisteredCompanyPtyLtdForm({
  onSubmissionSuccess,
  collectionName = "newly-registered-company-pty-ltd",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("6", async () => {
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
      numberOfDirectors: 1,
      directors: [{}],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "directors",
  });

  const numberOfDirectors = watch("numberOfDirectors");

  useEffect(() => {
    const currentDirectors = fields.length;
    if (numberOfDirectors > currentDirectors) {
      for (let i = currentDirectors; i < numberOfDirectors; i++) {
        append({
          email: "",
          fullName: "",
          postalAddress: "",
          surname: "",
          cellNumber: "",
          dateOfBirth: new Date(),
          idOrPassport: "",
          countryOfOrigin: "",
          percentageShareholding: 0,
          residentialAddress: "",
        });
      }
    } else if (numberOfDirectors < currentDirectors) {
      for (let i = currentDirectors - 1; i >= numberOfDirectors; i--) {
        remove(i);
      }
    }
  }, [numberOfDirectors, fields.length, append, remove]);

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
        if (key === "directors") {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "memorandumOfIncorporation" && key !== "registrationDate") {
          formData.append(key, value as string);
        }
      });

      formData.append("registrationDate", data.registrationDate.toISOString());

      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }

      if (data.memorandumOfIncorporation && data.memorandumOfIncorporation.length > 0) {
        formData.append("memorandumOfIncorporation", data.memorandumOfIncorporation[0]);
      }

      data.directors.forEach((director, index) => {
        if (director.idCopy && director.idCopy.length > 0) {
          formData.append(`directors[${index}].idCopy`, director.idCopy[0]);
        }
      });

      formData.append("collectionName", collectionName);
      formData.append("formId", "6");

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
      ? ["companyName", "registrationNumber", "registrationDate", "numberOfDirectors"]
      : ["directors", "memorandumOfIncorporation"];

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
      title="Newly Registered Company (Pty) Ltd Form"
      description="Please provide the required information for your newly registered company"
    >
      <Stepper activeStep={currentStep}>
        <Step label="Company Information" />
        <Step label="Directors Information" />
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
              <Label htmlFor="registrationDate">Registration Date</Label>
              <Input
                id="registrationDate"
                type="date"
                {...register("registrationDate", { valueAsDate: true })}
                className={errors.registrationDate ? "border-red-500" : ""}
              />
              {errors.registrationDate && (
                <p className="text-red-500 text-sm">{errors.registrationDate.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfDirectors">Number of Directors</Label>
              <Input
                id="numberOfDirectors"
                type="number"
                min="1"
                {...register("numberOfDirectors", { valueAsNumber: true })}
                className={errors.numberOfDirectors ? "border-red-500" : ""}
              />
              {errors.numberOfDirectors && (
                <p className="text-red-500 text-sm">{errors.numberOfDirectors.message as React.ReactNode}</p>
              )}
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 mb-6 p-4 border rounded">
                <h3 className="text-lg font-semibold">Director {index + 1}</h3>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.fullName`}>Full Name</Label>
                  <Input
                    {...register(`directors.${index}.fullName`)}
                    className={errors.directors?.[index]?.fullName ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.fullName && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.fullName?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.surname`}>Surname</Label>
                  <Input
                    {...register(`directors.${index}.surname`)}
                    className={errors.directors?.[index]?.surname ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.surname && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.surname?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.email`}>Email</Label>
                  <Input
                    type="email"
                    {...register(`directors.${index}.email`)}
                    className={errors.directors?.[index]?.email ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.email && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.email?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.cellNumber`}>Cell Number</Label>
                  <Input
                    {...register(`directors.${index}.cellNumber`)}
                    className={errors.directors?.[index]?.cellNumber ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.cellNumber && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.cellNumber?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.dateOfBirth`}>Date of Birth</Label>
                  <Input
                    type="date"
                    {...register(`directors.${index}.dateOfBirth`, { valueAsDate: true })}
                    className={errors.directors?.[index]?.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.dateOfBirth && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.dateOfBirth?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.idOrPassport`}>ID or Passport Number</Label>
                  <Input
                    {...register(`directors.${index}.idOrPassport`)}
                    className={errors.directors?.[index]?.idOrPassport ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.idOrPassport && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.idOrPassport?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.countryOfOrigin`}>Country of Origin</Label>
                  <Input
                    {...register(`directors.${index}.countryOfOrigin`)}
                    className={errors.directors?.[index]?.countryOfOrigin ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.countryOfOrigin && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.countryOfOrigin?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.percentageShareholding`}>Percentage Shareholding</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...register(`directors.${index}.percentageShareholding`, { valueAsNumber: true })}
                    className={errors.directors?.[index]?.percentageShareholding ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.percentageShareholding && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.percentageShareholding?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.residentialAddress`}>Residential Address</Label>
                  <Input
                    {...register(`directors.${index}.residentialAddress`)}
                    className={errors.directors?.[index]?.residentialAddress ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.residentialAddress && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.residentialAddress?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.postalAddress`}>Postal Address</Label>
                  <Input
                    {...register(`directors.${index}.postalAddress`)}
                    className={errors.directors?.[index]?.postalAddress ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.postalAddress && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.postalAddress?.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`directors.${index}.idCopy`}>ID Copy</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    {...register(`directors.${index}.idCopy`)}
                    className={errors.directors?.[index]?.idCopy ? "border-red-500" : ""}
                  />
                  {errors.directors?.[index]?.idCopy && (
                    <p className="text-red-500 text-sm">{errors.directors[index]?.idCopy?.message as React.ReactNode}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="memorandumOfIncorporation">Memorandum of Incorporation</Label>
              <Input
                id="memorandumOfIncorporation"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...register("memorandumOfIncorporation")}
                className={errors.memorandumOfIncorporation ? "border-red-500" : ""}
              />
              {errors.memorandumOfIncorporation && (
                <p className="text-red-500 text-sm">{errors.memorandumOfIncorporation.message as React.ReactNode}</p>
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
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </FormWrapper>
  );
}

export default NewlyRegisteredCompanyPtyLtdForm;