"use client";

import { useForm, SubmitHandler } from "react-hook-form";
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

const formSchema = z.object({
  contactInfo: z.string().min(1, "Contact information is required"),
  cipcRegistrationNumber: z.string().min(1, "CIPC registration number is required"),
  companyRegDocuments: z.any().refine((files) => files?.length > 0, "Company registration documents are required"),
});

type FormData = z.infer<typeof formSchema>;

export function CIPCIncorporationDocumentsForm({
  onSubmissionSuccess,
  collectionName = "cipc-incorporation-documents-post-2012",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("12", async () => {
    onSubmissionSuccess();
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      formData.append("contactInfo", data.contactInfo);
      formData.append("cipcRegistrationNumber", data.cipcRegistrationNumber);
      
      if (data.companyRegDocuments && data.companyRegDocuments.length > 0) {
        for (let i = 0; i < data.companyRegDocuments.length; i++) {
          formData.append("companyRegDocuments", data.companyRegDocuments[i]);
        }
      }
      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }
      formData.append("collectionName", collectionName);
      formData.append("formId", "12");

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
      title="CIPC Incorporation Documents (Post-2012)"
      description="Please provide the required information and documents for CIPC incorporation"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Information</Label>
          <Input
            id="contactInfo"
            {...register("contactInfo")}
            placeholder="Enter your contact information"
            className={errors.contactInfo ? "border-red-500" : ""}
          />
          {errors.contactInfo && (
            <p className="text-red-500 text-sm">{errors.contactInfo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cipcRegistrationNumber">CIPC Registration Number</Label>
          <Input
            id="cipcRegistrationNumber"
            {...register("cipcRegistrationNumber")}
            placeholder="Enter your CIPC registration number"
            className={errors.cipcRegistrationNumber ? "border-red-500" : ""}
          />
          {errors.cipcRegistrationNumber && (
            <p className="text-red-500 text-sm">{errors.cipcRegistrationNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyRegDocuments">Company Registration Documents</Label>
          <Input
            id="companyRegDocuments"
            type="file"
            {...register("companyRegDocuments")}
            multiple
            className={errors.companyRegDocuments ? "border-red-500" : ""}
          />
          {errors.companyRegDocuments && (
            <p className="text-red-500 text-sm">{errors.companyRegDocuments.message as React.ReactNode}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit CIPC Incorporation Documents"}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default CIPCIncorporationDocumentsForm;