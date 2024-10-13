import type { Metadata } from 'next';

import { Nunito } from 'next/font/google';
import { AuthContext } from '@/context/AutxContext';
import { ThemeProvider } from '@/components/theme-provider';
import Providers from '@/components/eCommerce/Providers';

import './globals.css';
import { CONFIG } from './config';

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
        </ThemeProvider>
      </body>
    </html>
  );
}
