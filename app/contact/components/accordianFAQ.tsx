import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AccordionFAQPage() {
  return (
    <div className="container mx-auto px-4 py-12" id="FAQ">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="mb-6 text-center text-3xl font-bold">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-semibold">
                1. What services can I purchase through the customer dashboard?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Through our customer dashboard, you can purchase a wide range of accounting
                services, including bookkeeping, tax preparation, financial statement preparation,
                payroll management, and consulting services. The dashboard allows you to select and
                customize the services that best meet your business needs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                2. How do I get started with using the customer portal?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Getting started is easy! Simply sign up for an account on our website, and once
                you&#39;re registered, you&#39;ll have full access to the customer portal. From
                there, you can browse our services, select the ones you need, and securely make your
                purchase online.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                3. Is my financial data secure on your customer portal?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we take your privacy and data security very seriously. Our customer portal uses
                advanced encryption technology to ensure that all your financial information is
                protected. We also comply with all relevant data protection regulations to keep your
                information safe.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                4. Can I manage multiple businesses or accounts through the portal?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! Our customer portal is designed to accommodate multiple services. The
                information gathered is per service and not per entity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg font-semibold">
                5. How can I get support if I encounter issues on the website or with my services?{' '}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                If you need assistance, you can easily reach out to our support team through the
                support desk available in the customer portal. Simply log in, navigate to the
                support section, and submit a ticket detailing your issue. Our team will respond
                promptly to help resolve any concerns.{' '}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg font-semibold">
                6. What is the response time for support requests submitted through the support
                desk?{' '}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We aim to respond to all support requests within 48 hours. For urgent issues, we
                offer a priority support option that ensures faster response times. You can select
                this option when submitting your ticket through the support desk.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger className="text-lg font-semibold">
                7. Can I track the status of my support requests?{' '}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, you can track the status of all your support requests directly through the
                support desk. Once you submit a ticket, you’ll receive updates via email, and you
                can also log in to the customer portal at any time to view the current status and
                history of your requests.{' '}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-lg font-semibold">
                8. What types of issues can I get help with through the support desk?{' '}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our support desk can assist you with a wide range of issues, including technical
                difficulties with the website, questions about your account, billing inquiries, and
                guidance on using the services you&#39;ve purchased. No matter the issue, our team
                is here to help.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-lg font-semibold">
                9. Is there a way to get live support instead of submitting a ticket?{' '}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, in addition to submitting a ticket through the support desk, we offer live chat
                support during business hours. You can access live chat from the customer portal,
                where one of our support agents will assist you in real-time.{' '}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
