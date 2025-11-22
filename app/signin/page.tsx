import { SignInForm } from '@/components/auth/signin-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { getTranslations } from 'next-intl/server';

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations();

  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.backToHome')}
          </Button>
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('auth.signIn.title')}</h1>
          <p className="text-muted-foreground">{t('auth.signIn.subtitle')}</p>
        </div>
        <SignInForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            {t('common.noAccount')}{' '}
          </span>
          <Link href="/signup" className="text-primary hover:underline">
            {t('common.createAccount')}
          </Link>
        </div>
      </div>
    </div>
  );
}
