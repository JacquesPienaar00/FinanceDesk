import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormWrapperProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function FormWrapper({
  title,
  description,
  children,
}: FormWrapperProps) {
  return (
    <>
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </>
  );
}
