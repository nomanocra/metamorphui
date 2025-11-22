import { SignUpForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { getTranslations } from 'next-intl/server'

export default async function SignUpPage() {
  const t = await getTranslations()
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
          <h1 className="text-3xl font-bold mb-2">{t('auth.signUp.title')}</h1>
          <p className="text-muted-foreground">
            {t('auth.signUp.subtitle')}
          </p>
        </div>
        <SignUpForm />
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t('common.alreadyHaveAccount')} </span>
          <Link href="/signin" className="text-primary hover:underline">
            {t('common.signIn')}
          </Link>
        </div>
      </div>
    </div>
  )
}

