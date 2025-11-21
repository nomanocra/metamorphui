import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { LanguageSync } from '@/components/language-sync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MetamorphUI - Generate Components & Tokens from Figma',
  description:
    'Transform your Figma designs into production-ready components and design tokens',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // getLocale() will call getRequestConfig() which uses our determineLanguage logic
  const locale = await getLocale();

  // Get messages for the determined locale
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LanguageSync />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
