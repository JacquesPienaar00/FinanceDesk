
import Footer from '@/components/navigation/footer';
import Header from '@/components/navigation/header';
import ContactForm from '@/app/contact/components/contactForm';
import AccordianFAQ from '@/app/contact/components/accordianFAQ';
export  default function Contact() {  
  return (
    <>
    <Header />
    <ContactForm />
    <AccordianFAQ />
    <Footer />
    </>
  );
}