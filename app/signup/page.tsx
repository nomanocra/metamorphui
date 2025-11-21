import { SignUpForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Créer un compte</h1>
          <p className="text-muted-foreground">
            Commencez à transformer vos designs Figma
          </p>
        </div>
        <SignUpForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <Link href="/signin" className="text-primary hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}

