import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost">{t('home.signIn')}</Button>
            </Link>
            <Link href="/signup">
              <Button>{t('home.createAccount')}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            {t('home.hero.title')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('home.hero.description')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">{t('home.hero.startFree')}</Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                {t('home.hero.signInButton')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>{t('home.features.designTokens.title')}</CardTitle>
              <CardDescription>
                {t('home.features.designTokens.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.features.designTokens.details')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('home.features.reactComponents.title')}</CardTitle>
              <CardDescription>
                {t('home.features.reactComponents.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.features.reactComponents.details')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('home.features.synchronization.title')}</CardTitle>
              <CardDescription>
                {t('home.features.synchronization.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t('home.features.synchronization.details')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t('home.cta.title')}</CardTitle>
              <CardDescription>
                {t('home.cta.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button size="lg" className="w-full md:w-auto">
                  {t('home.cta.button')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>{t('common.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
