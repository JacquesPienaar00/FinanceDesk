"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  contactInfo: z.string().min(1, "Contact information is required"),
  submissionMethod: z.enum(["sarsCredentials", "appointment"]),
  sarsUsername: z.string().min(1, "SARS username is required").optional(),
  sarsPassword: z.string().min(1, "SARS password is required").optional(),
  exampleAttachment: z.any().optional(),
  incomeTaxCertificates: z.any().refine((files) => files?.length > 0, "Income tax certificates are required"),
  expenseTaxCertificates: z.any().refine((files) => files?.length > 0, "Expense tax certificates are required"),
  otherSupportingDocuments: z.any().optional(),
  agreeToContact: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export function SARSPersonalIncomeTaxReturnsForm({
  onSubmissionSuccess,
  collectionName = "sars-personal-income-tax-returns",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("23", async () => {
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
      submissionMethod: "sarsCredentials",
      agreeToContact: false,
    },
  });

  const submissionMethod = watch("submissionMethod");

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
        if (key === "exampleAttachment" || key === "incomeTaxCertificates" || key === "expenseTaxCertificates" || key === "otherSupportingDocuments") {
          if (value && value.length > 0) {
            for (let i = 0; i < value.length; i++) {
              formData.append(`${key}`, value[i]);
            }
          }
        } else if (key === "agreeToContact") {
          formData.append(key, value ? "true" : "false");
        } else {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }
      formData.append("collectionName", collectionName);
      formData.append("formId", "23");

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
      title="SARS Personal Income Tax Returns"
      description="Please provide the required information for your personal income tax return"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Information</Label>
              <Textarea
                id="contactInfo"
                {...register("contactInfo")}
                placeholder="Enter your contact information"
                className={errors.contactInfo ? "border-red-500" : ""}
              />
              {errors.contactInfo && (
                <p className="text-red-500 text-sm">{errors.contactInfo.message as React.ReactNode}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submission Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="submissionMethod"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sarsCredentials" id="sarsCredentials" />
                    <Label htmlFor="sarsCredentials">Provide SARS Credentials</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="appointment" id="appointment" />
                    <Label htmlFor="appointment">Book an Appointment</Label>
                  </div>
                </RadioGroup>
              )}
            />

            {submissionMethod === "sarsCredentials" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sarsUsername">SARS Username</Label>
                  <Input
                    id="sarsUsername"
                    {...register("sarsUsername")}
                    className={errors.sarsUsername ? "border-red-500" : ""}
                  />
                  {errors.sarsUsername && (
                    <p className="text-red-500 text-sm">{errors.sarsUsername.message as React.ReactNode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sarsPassword">SARS Password</Label>
                  <Input
                    id="sarsPassword"
                    type="password"
                    {...register("sarsPassword")}
                    className={errors.sarsPassword ? "border-red-500" : ""}
                  />
                  {errors.sarsPassword && (
                    <p className="text-red-500 text-sm">{errors.sarsPassword.message as React.ReactNode}</p>
                  )}
                </div>
              </>
            )}

            {submissionMethod === "appointment" && (
              <p className="text-sm text-gray-500">We will contact you to schedule an appointment.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exampleAttachment">Attach Example (Optional)</Label>
              <Input
                id="exampleAttachment"
                type="file"
                {...register("exampleAttachment")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incomeTaxCertificates">Income Tax Certificates</Label>
              <Input
                id="incomeTaxCertificates"
                type="file"
                multiple
                {...register("incomeTaxCertificates")}
                className={errors.incomeTaxCertificates ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500">IRP5's, interest income certificates, etc.</p>
              {errors.incomeTaxCertificates && (
                <p className="text-red-500 text-sm">{errors.incomeTaxCertificates.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expenseTaxCertificates">Expense Tax Certificates</Label>
              <Input
                id="expenseTaxCertificates"
                type="file"
                multiple
                {...register("expenseTaxCertificates")}
                className={errors.expenseTaxCertificates ? "border-red-500" : ""}
              />
              <p className="text-sm text-gray-500">Medical aid tax certificate, retirement annuity certificate, etc.</p>
              {errors.expenseTaxCertificates && (
                <p className="text-red-500 text-sm">{errors.expenseTaxCertificates.message as React.ReactNode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="otherSupportingDocuments">Other Supporting Documents</Label>
              <Input
                id="otherSupportingDocuments"
                type="file"
                multiple
                {...register("otherSupportingDocuments")}
              />
              <p className="text-sm text-gray-500">Any other supporting documentation to be declared</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center space-x-2">
          <Controller
            name="agreeToContact"
            control={control}
            render={({ field }) => (
              <Switch
                id="agreeToContact"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="agreeToContact">
            I agree to be contacted if there are ways to maximize my return or improve tax efficiency
          </Label>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Personal Income Tax Return"}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default SARSPersonalIncomeTaxReturnsForm;