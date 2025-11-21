import { SignInForm } from "@/components/auth/signin-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function SignInPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect("/dashboard")
  }

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
          <h1 className="text-3xl font-bold mb-2">Connexion</h1>
          <p className="text-muted-foreground">
            Connectez-vous à votre compte MetamorphUI
          </p>
        </div>
        <SignInForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Pas encore de compte ? </span>
          <Link href="/signup" className="text-primary hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  )
}

