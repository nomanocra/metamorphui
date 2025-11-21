"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useTranslations } from 'next-intl'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const processedTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const token = searchParams.get("token")

    if (!token) {
      setStatus("error")
      setMessage(t('auth.verifyEmail.error.missingToken'))
      return
    }

    // Avoid verifying the same token multiple times (StrictMode double render)
    if (processedTokenRef.current === token) {
      return
    }

    processedTokenRef.current = token

    // Verify email
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json()
        if (res.ok) {
          setStatus("success")
          setMessage(data.message || t('auth.verifyEmail.success.message'))
          // Redirect to signin after 3 seconds
          setTimeout(() => {
            router.push("/signin?verified=true")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(data.error || t('auth.verifyEmail.error.verificationError'))
        }
      })
      .catch((error) => {
        console.error("Verification error:", error)
        setStatus("error")
        setMessage(t('auth.verifyEmail.error.generic'))
      })
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle>{t('auth.verifyEmail.loading')}</CardTitle>
              <CardDescription>
                {t('auth.verifyEmail.loadingDescription')}
              </CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-green-600">{t('auth.verifyEmail.success.title')}</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-destructive">{t('auth.verifyEmail.error.title')}</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              {t('auth.verifyEmail.success.redirecting')}
            </p>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t('auth.verifyEmail.error.invalidOrExpired')}
              </p>
              <div className="flex gap-2 justify-center">
                <Link href="/signup">
                  <Button variant="outline">{t('auth.verifyEmail.error.createNewAccount')}</Button>
                </Link>
                <Link href="/signin">
                  <Button>{t('auth.verifyEmail.error.signIn')}</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

