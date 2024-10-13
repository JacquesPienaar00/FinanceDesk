"use client";

import { useForm, SubmitHandler, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessRegistrationNumber: z.string().min(1, "Business registration number is required"),
  representativeFullName: z.string().min(1, "Full name is required"),
  representativeSurname: z.string().min(1, "Surname is required"),
  representativeIdNumber: z.string().min(13, "ID number must be at least 13 characters").max(13, "ID number must not exceed 13 characters"),
  representativePosition: z.enum(["publicOfficer", "memberDirector", "accountingOffice", "executor"]),
  registrationDocuments: z.any().optional(),
  representativeIdCopy: z.any().refine((files) => files?.length > 0, "ID copy is required"),
  representativePhotoWithId: z.any().refine((files) => files?.length > 0, "Photo with ID is required"),
  representativeProofOfAddress: z.any().refine((files) => files?.length > 0, "Proof of address is required"),
  dateOfAppointment: z.string().min(1, "Date of appointment is required"),
  remainingDirectorsOption: z.enum(["uploadCertificate", "enterDetails"]),
  certificateCopy: z.any().optional(),
  remainingDirectors: z.array(
    z.object({
      fullName: z.string().min(1, "Full name is required"),
      surname: z.string().min(1, "Surname is required"),
      idNumber: z.string().min(13, "ID number must be at least 13 characters").max(13, "ID number must not exceed 13 characters"),
    })
  ).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function SARSRegisteredRepresentativeForm({
  onSubmissionSuccess,
  collectionName = "sars-registered-representative",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("22", async () => {
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
      representativePosition: "publicOfficer",
      remainingDirectorsOption: "uploadCertificate",
      remainingDirectors: [{ fullName: "", surname: "", idNumber: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "remainingDirectors",
  });

  const remainingDirectorsOption = watch("remainingDirectorsOption");

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
        if (key === "registrationDocuments" || key === "representativeIdCopy" || key === "representativePhotoWithId" || key === "representativeProofOfAddress" || key === "certificateCopy") {
          if (value && value.length > 0) {
            formData.append(key, value[0]);
          }
        } else if (key === "remainingDirectors") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      formData.append("collectionName", collectionName);
      formData.append("formId", "22");
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

  return (
    <FormWrapper
      title="SARS Registered Representative"
      description="Please provide the required information for SARS Registered Representative"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                {...register("businessName")}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm">{errors.businessName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessRegistrationNumber">Business Registration Number</Label>
              <Input
                id="businessRegistrationNumber"
                {...register("businessRegistrationNumber")}
                className={errors.businessRegistrationNumber ? "border-red-500" : ""}
              />
              {errors.businessRegistrationNumber && (
                <p className="text-red-500 text-sm">{errors.businessRegistrationNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationDocuments">Registration Documents (CIPC - COR14.3) (Optional)</Label>
              <Input
                id="registrationDocuments"
                type="file"
                {...register("registrationDocuments")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registered Representative Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="representativeFullName">Full Name(s)</Label>
              <Input
                id="representativeFullName"
                {...register("representativeFullName")}
                className={errors.representativeFullName ? "border-red-500" : ""}
              />
              {errors.representativeFullName && (
                <p className="text-red-500 text-sm">{errors.representativeFullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeSurname">Surname</Label>
              <Input
                id="representativeSurname"
                {...register("representativeSurname")}
                className={errors.representativeSurname ? "border-red-500" : ""}
              />
              {errors.representativeSurname && (
                <p className="text-red-500 text-sm">{errors.representativeSurname.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeIdNumber">ID Number</Label>
              <Input
                id="representativeIdNumber"
                {...register("representativeIdNumber")}
                className={errors.representativeIdNumber ? "border-red-500" : ""}
              />
              {errors.representativeIdNumber && (
                <p className="text-red-500 text-sm">{errors.representativeIdNumber.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Position in Company</Label>
              <Controller
                name="representativePosition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.representativePosition ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publicOfficer">Public Officer</SelectItem>
                      <SelectItem value="memberDirector">Member/Director</SelectItem>
                      <SelectItem value="accountingOffice">Accounting Office</SelectItem>
                      <SelectItem value="executor">Executor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.representativePosition && (
                <p className="text-red-500 text-sm">{errors.representativePosition.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeIdCopy">ID Copy</Label>
              <Input
                id="representativeIdCopy"
                type="file"
                {...register("representativeIdCopy")}
                className={errors.representativeIdCopy ? "border-red-500" : ""}
              />
              {errors.representativeIdCopy && (
                <p className="text-red-500 text-sm">{errors.representativeIdCopy.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativePhotoWithId">Photo with ID</Label>
              <Input
                id="representativePhotoWithId"
                type="file"
                {...register("representativePhotoWithId")}
                className={errors.representativePhotoWithId ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500">Upload a photo of the person holding their ID and a sign that says "update my details". Ensure the information on the ID is clear and visible.</p>
              {errors.representativePhotoWithId && (
                <p className="text-red-500 text-sm">{errors.representativePhotoWithId.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="representativeProofOfAddress">Proof of Residential Address</Label>
              <Input
                id="representativeProofOfAddress"
                type="file"
                {...register("representativeProofOfAddress")}
                className={errors.representativeProofOfAddress ? "border-red-500" : ""}
              />
              {errors.representativeProofOfAddress && (
                <p className="text-red-500 text-sm">{errors.representativeProofOfAddress.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfAppointment">Date of Appointment</Label>
              <Input
                id="dateOfAppointment"
                type="date"
                {...register("dateOfAppointment")}
                className={errors.dateOfAppointment ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500">As per share certificate or registration documents</p>
              {errors.dateOfAppointment && (
                <p className="text-red-500 text-sm">{errors.dateOfAppointment.message as React.ReactNode}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details of Remaining Directors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="remainingDirectorsOption"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="uploadCertificate" id="uploadCertificate" />
                    <Label htmlFor="uploadCertificate">Upload Certificate Copy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="enterDetails" id="enterDetails" />
                    <Label htmlFor="enterDetails">Enter Remaining Directors' Details</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {remainingDirectorsOption === "uploadCertificate" && (
              <div className="space-y-2">
                <Label htmlFor="certificateCopy">Certificate Copy</Label>
                <Input
                  id="certificateCopy"
                  type="file"
                  {...register("certificateCopy")}
                  className={errors.certificateCopy ? "border-red-500" : ""}
                />
                {errors.certificateCopy && (
                  <p className="text-red-500 text-sm">{errors.certificateCopy.message as React.ReactNode}</p>
                )}
              </div>
            )}

            {remainingDirectorsOption === "enterDetails" && (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label htmlFor={`remainingDirectors.${index}.fullName`}>Full Name</Label>
                      <Input
                        {...register(`remainingDirectors.${index}.fullName` as const)}
                        className={errors.remainingDirectors?.[index]?.fullName ? "border-red-500" : ""}
                      />
                      {errors.remainingDirectors?.[index]?.fullName && (
                        <p className="text-red-500 text-sm">{errors.remainingDirectors[index]?.fullName?.message as React.ReactNode}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`remainingDirectors.${index}.surname`}>Surname</Label>
                      <Input
                        {...register(`remainingDirectors.${index}.surname` as const)}
                        className={errors.remainingDirectors?.[index]?.surname ? "border-red-500" : ""}
                      />
                      {errors.remainingDirectors?.[index]?.surname && (
                        <p className="text-red-500 text-sm">{errors.remainingDirectors[index]?.surname?.message as React.ReactNode}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`remainingDirectors.${index}.idNumber`}>ID Number</Label>
                      <Input
                        {...register(`remainingDirectors.${index}.idNumber` as const)}
                        className={errors.remainingDirectors?.[index]?.idNumber ? "border-red-500" : ""}
                      />
                      {errors.remainingDirectors?.[index]?.idNumber && (
                        <p className="text-red-500 text-sm">{errors.remainingDirectors[index]?.idNumber?.message as React.ReactNode}</p>
                      )}
                    </div>
                    {index > 0 && (
                      <Button type="button" variant="destructive" onClick={() => remove(index)}>
                        Remove Director
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({ fullName: "", surname: "", idNumber: "" })}>
                  Add Another Director
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit SARS Registered Representative"}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default SARSRegisteredRepresentativeForm;