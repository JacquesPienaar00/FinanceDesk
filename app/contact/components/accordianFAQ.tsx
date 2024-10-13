import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AccordionFAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
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
                Is it accessible?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-semibold">
                How does it work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                It works by following the WAI-ARIA guidelines, making it accessible for everyone.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-semibold">
                Is it customizable?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, you can easily customize the accordion by modifying the styles and content.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-semibold">
                Can I use it with React?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                This accordion component is perfect for React and can be easily integrated.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
