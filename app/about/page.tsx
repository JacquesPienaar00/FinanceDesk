import Header from '@/components/navigation/header';
import Footer from '@/components/navigation/footer';
import AboutLanding from '@/app/about/components/aboutLanding'; // Corrected import path

export default function Home() {
  return (
    <>
      <Header />
      <AboutLanding />
      <Footer />
    </>
  );
}
