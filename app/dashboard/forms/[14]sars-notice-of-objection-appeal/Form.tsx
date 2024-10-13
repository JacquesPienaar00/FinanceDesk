"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { FormWrapper } from "@/app/dashboard/forms/components/FormWrapper";
import { useFormSubmission } from "@/app/dashboard/hooks/useFormSubmmisions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const formSchema = z.object({
  contactInfo: z.string().min(1, "Contact information is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  relevantDocuments: z.any().optional(),
  registrationMethod: z.enum(["cipcNumber", "uploadDocument"]),
  cipcNumber: z.string().min(1, "CIPC number is required").optional(),
  registrationDocument: z.any().optional(),
  bookingPreference: z.enum(["scheduleCall", "contact24Hours"]),
  callDate: z.date().optional(),
  callTime: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const availableTimes = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

export function SARSObjectionAppealForm({
  onSubmissionSuccess,
  collectionName = "sars-notice-of-objection-appeal",
}: {
  onSubmissionSuccess: () => void;
  collectionName?: string;
}) {
  const { toast } = useToast();
  const { data: session } = useSession();
  const router = useRouter();

  const { submitForm, isSubmitting } = useFormSubmission("14", async () => {
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
      registrationMethod: "cipcNumber",
      bookingPreference: "scheduleCall",
    },
  });

  const registrationMethod = watch("registrationMethod");
  const bookingPreference = watch("bookingPreference");
  const selectedDate = watch("callDate");

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
        if (key === "callDate") {
          formData.append(key, value ? value.toISOString() : "");
        } else if (key !== "relevantDocuments" && key !== "registrationDocument") {
          formData.append(key, value as string);
        }
      });
      // Add NextAuth email
      if (session.user?.email) {
        formData.append("nextauth", session.user.email);
      }
      if (data.relevantDocuments && data.relevantDocuments.length > 0) {
        for (let i = 0; i < data.relevantDocuments.length; i++) {
          formData.append("relevantDocuments", data.relevantDocuments[i]);
        }
      }

      if (data.registrationMethod === "uploadDocument" && data.registrationDocument) {
        formData.append("registrationDocument", data.registrationDocument[0]);
      }

      formData.append("collectionName", collectionName);
      formData.append("formId", "14");

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
      title="SARS Notice of Objection / Appeal"
      description="Please provide the required information for your SARS objection or appeal"
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
          <Label htmlFor="description">Description of SARS Challenges</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Describe the SARS challenges you're facing and where you would like to object to any SARS return"
            className={errors.description ? "border-red-500" : ""}
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="relevantDocuments">Relevant Documents (Optional)</Label>
          <Input
            id="relevantDocuments"
            type="file"
            {...register("relevantDocuments")}
            multiple
          />
        </div>

        <div className="space-y-4">
          <Label>Registration Method</Label>
          <Controller
            name="registrationMethod"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cipcNumber" id="cipcNumber" />
                  <Label htmlFor="cipcNumber">Enter CIPC Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="uploadDocument" id="uploadDocument" />
                  <Label htmlFor="uploadDocument">Upload Company Registration Documents</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {registrationMethod === "cipcNumber" && (
          <div className="space-y-2">
            <Label htmlFor="cipcNumber">CIPC Number</Label>
            <Input
              id="cipcNumber"
              {...register("cipcNumber")}
              placeholder="Enter CIPC Number"
              className={errors.cipcNumber ? "border-red-500" : ""}
            />
            {errors.cipcNumber && (
              <p className="text-red-500 text-sm">{errors.cipcNumber.message}</p>
            )}
          </div>
        )}

        {registrationMethod === "uploadDocument" && (
          <div className="space-y-2">
            <Label htmlFor="registrationDocument">Company Registration Document</Label>
            <Input
              id="registrationDocument"
              type="file"
              {...register("registrationDocument")}
              className={errors.registrationDocument ? "border-red-500" : ""}
            />
            {errors.registrationDocument && (
              <p className="text-red-500 text-sm">{errors.registrationDocument.message as React.ReactNode}</p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Label>Booking Preference</Label>
          <Controller
            name="bookingPreference"
            control={control}
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scheduleCall" id="scheduleCall" />
                  <Label htmlFor="scheduleCall">Schedule a Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contact24Hours" id="contact24Hours" />
                  <Label htmlFor="contact24Hours">Contact me within 24 hours</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {bookingPreference === "scheduleCall" && (
          <div className="space-y-4">
            <Label>Select Date and Time for Call</Label>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="flex-1">
                <Controller
                  name="callDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </div>
              <div className="flex-1">
                <Controller
                  name="callTime"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
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
              </div>
            </div>
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit SARS Objection / Appeal"}
        </Button>
      </form>
    </FormWrapper>
  );
}

export default SARSObjectionAppealForm;