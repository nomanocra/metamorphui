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
  let resolvedTheme: 'light' | 'dark' | undefined = undefined;
  if (determinedTheme === 'dark') {
    resolvedThemeClass = 'dark';
    resolvedTheme = 'dark';
  } else if (determinedTheme === 'light') {
    resolvedThemeClass = '';
    resolvedTheme = 'light';
  } else if (determinedTheme === 'system') {
    // For system theme, try to detect from header but don't pass resolvedTheme
    // Let the client detect it to avoid mismatch between server and client detection
    const prefersDark = prefersColorScheme?.toLowerCase().includes('dark');
    resolvedThemeClass = prefersDark ? 'dark' : '';
    // Don't set resolvedTheme for system - let client detect it
  }

  return (
    <html lang={locale} suppressHydrationWarning className={resolvedThemeClass}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = '${determinedTheme}';
                  if (theme === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.classList.toggle('dark', prefersDark);
                  } else {
                    const isDark = theme === 'dark';
                    document.documentElement.classList.toggle('dark', isDark);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <LanguageSync />
            <ThemeProvider
              attribute="class"
              defaultTheme={determinedTheme}
              defaultResolvedTheme={resolvedTheme}
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
