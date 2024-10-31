import { z } from 'zod';

export const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  country: z.enum(['RSA', 'EU', 'US']),
  message: z.string().min(1, 'Message is required'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
