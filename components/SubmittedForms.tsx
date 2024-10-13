"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormSubmission {
  _id: string;
  name: string;
  email: string;
  fileUrl: string;
  createdAt: string;
}

export default function SubmittedForms() {
  const { data: session } = useSession();
  const [forms, setForms] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) {
      fetchForms();
    }
  }, [session]);

  const fetchForms = async () => {
    try {
      const response = await fetch("/api/get-forms");
      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }
      const data = await response.json();
      setForms(data.forms);
    } catch (error) {
      setError("An error occurred while fetching forms");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return <p>Please sign in to view submitted forms.</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Submitted Forms</h2>
      {forms.length === 0 ? (
        <p>No forms submitted yet.</p>
      ) : (
        forms.map((form) => (
          <Card key={form._id}>
            <CardHeader>
              <CardTitle>{form.name}</CardTitle>
              <CardDescription>{form.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Submitted on: {new Date(form.createdAt).toLocaleString()}</p>
              <a
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View uploaded file on Amazon S3
              </a>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
