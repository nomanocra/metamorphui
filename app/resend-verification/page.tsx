"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ResendVerificationPage() {
  const router = useRouter()
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
        setMessage(data.message || "Un nouveau lien de vérification a été envoyé.")
      } else {
        setStatus("error")
        setMessage(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Une erreur est survenue lors de l'envoi du lien de vérification")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Renvoyer l'email de vérification</CardTitle>
          <CardDescription>
            Entrez votre adresse email pour recevoir un nouveau lien de vérification
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
                    Vérifiez votre boîte mail (et le dossier spam si nécessaire).
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
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
                  Envoi en cours...
                </>
              ) : (
                "Renvoyer le lien de vérification"
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/signin" className="text-sm text-muted-foreground hover:text-foreground">
            Retour à la connexion
          </Link>
          <Link href="/signup" className="text-sm text-muted-foreground hover:text-foreground">
            Créer un nouveau compte
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}

