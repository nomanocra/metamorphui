"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export function SignOutButton({ variant = "ghost", size = "sm" }: { variant?: "default" | "ghost" | "outline", size?: "default" | "sm" }) {
  const t = useTranslations()
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      {t('common.logout')}
    </Button>
  )
}

