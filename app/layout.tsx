import type { Metadata } from 'next';

import { Nunito } from 'next/font/google';
import { AuthContext } from '@/context/AutxContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Providers from '@/components/eCommerce/Providers';
import { Toaster } from '@/components/ui/toaster';

import './globals.css';
import { CONFIG } from './config';
import LanguageSwitcher from '@/components/ui/language-switcher';
import BackToTopButton from '@/components/ui/back-to-top';
const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: CONFIG.appTitle,
  description: CONFIG.appDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.className}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <AuthContext>{children}</AuthContext>
          </Providers>
          <LanguageSwitcher />
          <Toaster />
          <BackToTopButton threshold={200} position="bottom-left" className="" />
        </ThemeProvider>
      </body>
    </html>
  );
}
