import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { LanguageSync } from '@/components/language-sync';
import { ThemeSync } from '@/components/theme-sync';
import { determineTheme } from '@/lib/theme';
import { headers } from 'next/headers';
import { SessionProvider } from '@/components/session-provider';

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

  // Determine theme with priority: user preference > cookies > system
  const headersList = await headers();
  const prefersColorScheme = headersList.get('prefers-color-scheme');
  const determinedTheme = await determineTheme(prefersColorScheme);

  // Resolve system theme server-side if possible
  // For "system", try to detect from prefers-color-scheme header
  let resolvedThemeClass = '';
  if (determinedTheme === 'dark') {
    resolvedThemeClass = 'dark';
  } else if (determinedTheme === 'light') {
    resolvedThemeClass = '';
  } else if (determinedTheme === 'system') {
    // Try to resolve system theme from header
    const prefersDark = prefersColorScheme?.toLowerCase().includes('dark');
    resolvedThemeClass = prefersDark ? 'dark' : '';
  }

  return (
    <html lang={locale} suppressHydrationWarning className={resolvedThemeClass}>
      <body className={inter.className}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <LanguageSync />
            <ThemeProvider
              attribute="class"
              defaultTheme={determinedTheme}
              enableSystem
              disableTransitionOnChange
            >
              <ThemeSync serverTheme={determinedTheme} />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
