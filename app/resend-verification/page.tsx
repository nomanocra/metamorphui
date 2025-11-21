"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function ResendVerificationPage() {
  const router = useRouter()
  const t = useTranslations()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || t('auth.resendVerification.success.message'))
      } else {
        setStatus("error")
        setMessage(data.error || t('auth.resendVerification.error.generic'))
      }
    } catch (error) {
      setStatus("error")
      setMessage(t('auth.resendVerification.error.sendError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('auth.resendVerification.title')}</CardTitle>
          <CardDescription>
            {t('auth.resendVerification.description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="p-3 text-sm bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">{message}</p>
                  <p className="text-green-800 dark:text-green-200 text-xs mt-1">
                    {t('auth.resendVerification.success.checkEmail')}
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-destructive">{message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('auth.resendVerification.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.resendVerification.submitting')}
                </>
              ) : (
                t('auth.resendVerification.submit')
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">
            {t('auth.resendVerification.backToSignIn')}
          </Link>
          <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
            {t('auth.resendVerification.createNewAccount')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

