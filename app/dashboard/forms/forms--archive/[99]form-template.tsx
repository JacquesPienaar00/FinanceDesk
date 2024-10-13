'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  contactNumber: z.string().regex(/^\d{10}$/, {
    message: 'Contact number must be 10 digits.',
  }),
  priorAnnualReturn: z.enum(['yes', 'no'], {
    required_error: 'Please select an option.',
  }),
  annualTurnover: z
    .string()
    .min(1, 'Please enter the turnover amount.')
    .regex(/^\d+$/, 'Please enter a valid number.'),
  fileMoreReturns: z.enum(['yes', 'no'], {
    required_error: 'Please select an option.',
  }),
});

export default function CIPCForm() {
  const [step, setStep] = useState(1);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      priorAnnualReturn: undefined,
      annualTurnover: '',
      fileMoreReturns: undefined,
    },
  });

  useEffect(() => {
    const savedData = Cookies.get('cipcFormDraft');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (status !== 'authenticated') {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to submit the form.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Submitting form with values:', values);
      const response = await fetch('/api/formsSubmissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit form');
      }

      toast({
        title: 'Form submitted',
        description: 'Your CIPC form has been successfully submitted.',
      });

      // Clear the saved draft after successful submission
      Cookies.remove('cipcFormDraft');

      // Remove the item from pfData
      await removeItemFromPfData();

      // Delay the page reload to allow the toast to be displayed
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
    }
  }

  const nextStep = () => {
    form.trigger(['fullName', 'lastName', 'email', 'contactNumber']).then((isValid) => {
      if (isValid) {
        setStep(2);
      }
    });
  };

  const prevStep = () => {
    setStep(1);
  };

  const saveAndContinue = () => {
    const values = form.getValues();
    Cookies.set('cipcFormDraft', JSON.stringify(values), { expires: 7 }); // Expires in 7 days
    toast({
      title: 'Progress saved',
      description: 'Your form data has been saved. You can continue later.',
    });
  };

  const removeItemFromPfData = async () => {
    if (!session?.user?.id) {
      console.error('User ID not found');
      return;
    }

    try {
      const response = await fetch('/api/remove-pf-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          itemName: '1',
          removeOnlyOne: true, // Ensure only one item is removed
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: 'Item not found',
            description: 'No matching items were found in your data.',
            variant: 'destructive',
          });
        } else {
          throw new Error(result.error || 'Failed to remove item from pfData');
        }
      } else {
        console.log('Item removed from pfData:', result.removedItem);
        toast({
          title: 'Success',
          description: `One item "${result.removedItem.name}" with timestamp ${result.removedItem.timestamp} was successfully removed.`,
        });
      }
    } catch (error) {
      console.error('Error removing item from pfData:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Access Denied. Please sign in to submit the form.</p>;
  }

  return (
    <>
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>CIPC Annual Return Filing</CardTitle>
          <CardDescription>
            Step {step} of 2: {step === 1 ? 'Contact information' : 'CIPC'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact number</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button type="button" onClick={saveAndContinue}>
                      Save and Continue
                    </Button>
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="priorAnnualReturn"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you have the prior annual return?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="annualTurnover"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>2024 Annual Turnover Amount in Rands</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fileMoreReturns"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Do you want to file more than one return?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="yes" />
                              </FormControl>
                              <FormLabel className="font-normal">Yes</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="no" />
                              </FormControl>
                              <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" type="button" onClick={prevStep}>
                      Back
                    </Button>
                    <Button type="button" onClick={saveAndContinue}>
                      Save
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
}
