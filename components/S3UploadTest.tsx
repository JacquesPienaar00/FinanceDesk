"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Upload, FileIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Stepper, Step } from "@/components/ui/stepper";

const s3UploadSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  contact: z.string().min(10).max(15),
  file: z.instanceof(File).optional(),
});

type S3UploadFormData = z.infer<typeof s3UploadSchema>;

export function S3UploadTest() {
  const [cookies, setCookie] = useCookies(["s3UploadFormData"]);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<S3UploadFormData>({
    resolver: zodResolver(s3UploadSchema),
  });

  const watchedFields = watch();

  useEffect(() => {
    if (cookies.s3UploadFormData) {
      const { email, username, contact } = cookies.s3UploadFormData;
      setValue("email", email || "");
      setValue("username", username || "");
      setValue("contact", contact || "");
    }
  }, [cookies.s3UploadFormData, setValue]);

  const saveFormData = () => {
    setCookie(
      "s3UploadFormData",
      {
        email: watchedFields.email,
        username: watchedFields.username,
        contact: watchedFields.contact,
      },
      { path: "/" }
    );
  };

  const handleNext = () => {
    saveFormData();
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit: SubmitHandler<S3UploadFormData> = async (data) => {
    console.log("Form submitted with data:", data);
    if (!data.file) {
      setUploadStatus({
        success: false,
        message: "Please select a file to upload.",
      });
      return;
    }

    setUploading(true);
    setUploadStatus(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("contact", data.contact);
      formData.append("file", data.file);

      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to process upload: ${response.statusText}`);
      }

      const { url, fields } = await response.json();

      const s3FormData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        s3FormData.append(key, value as string);
      });
      s3FormData.append("file", data.file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 204) {
          setUploadStatus({
            success: true,
            message: "File uploaded successfully to S3!",
          });
          setCookie("s3UploadFormData", {}, { path: "/" }); // Clear the cookie after successful submission
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        throw new Error("XHR error");
      };

      xhr.open("POST", url, true);
      xhr.send(s3FormData);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        success: false,
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error occurred"
        }`,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("file", file, { shouldValidate: true });
    }
  };

  const steps = [
    {
      label: "Personal Information",
      content: (
        <>
          <div className="space-y-2">
            <Input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="max-w-sm"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              {...register("username")}
              type="text"
              placeholder="Username"
              className="max-w-sm"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Input
              {...register("contact")}
              type="tel"
              placeholder="Contact"
              className="max-w-sm"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm">{errors.contact.message}</p>
            )}
          </div>
        </>
      ),
    },
    {
      label: "File Upload",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG or GIF (MAX. 5MB)
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif"
              />
            </label>
          </div>
          {watchedFields.file && (
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <FileIcon className="w-4 h-4" />
              <span>{watchedFields.file.name}</span>
            </div>
          )}
          {errors.file && (
            <p className="text-red-500 text-sm">
              {errors.file.message as string}
            </p>
          )}
        </div>
      ),
    },
    {
      label: "Review",
      content: (
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {watchedFields.email}
          </p>
          <p>
            <strong>Username:</strong> {watchedFields.username}
          </p>
          <p>
            <strong>Contact:</strong> {watchedFields.contact}
          </p>
          <p>
            <strong>File:</strong>{" "}
            {watchedFields.file?.name || "No file selected"}
          </p>
        </div>
      ),
    },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>S3 Upload Test</CardTitle>
        <CardDescription>
          Submit your information and upload a file to Amazon S3
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Stepper activeStep={currentStep}>
          {steps.map((step, index) => (
            <Step key={index} label={step.label} />
          ))}
        </Stepper>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {steps[currentStep].content}
          {currentStep === steps.length - 1 && (
            <Button type="submit" disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Submit"}
            </Button>
          )}
        </form>
        {uploading && (
          <div className="mt-4 space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500 text-center">
              {Math.round(uploadProgress)}% uploaded
            </p>
          </div>
        )}
        {uploadStatus && (
          <Alert
            variant={uploadStatus.success ? "default" : "destructive"}
            className="mt-4"
          >
            {uploadStatus.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        {currentStep < steps.length - 1 && (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
