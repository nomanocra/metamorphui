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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MetamorphUI</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/signup">
              <Button>Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Transformez vos designs Figma en composants React
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Générez automatiquement des tokens de design et des composants React
            à partir de vos fichiers Figma. Exportez vos tokens en CSS et vos
            composants prêts pour la production.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card>
            <CardHeader>
              <CardTitle>🎨 Tokens de Design</CardTitle>
              <CardDescription>
                Importez automatiquement tous vos tokens Figma (couleurs,
                typographie, espacements)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Synchronisez vos variables Figma et exportez-les en CSS custom
                properties pour une intégration facile.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>⚛️ Composants React</CardTitle>
              <CardDescription>
                Générez des composants React à partir de vos composants Figma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transformez vos designs en composants React réutilisables et
                prêts pour la production.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🔄 Synchronisation</CardTitle>
              <CardDescription>
                Restez à jour avec vos designs Figma en un clic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Synchronisez vos tokens et composants à tout moment pour
                refléter les dernières modifications de votre équipe design.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Prêt à commencer ?</CardTitle>
              <CardDescription>
                Créez votre compte gratuitement et connectez votre premier
                projet Figma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button size="lg" className="w-full md:w-auto">
                  Créer un compte gratuit
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 MetamorphUI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
