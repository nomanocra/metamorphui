"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function SignOutButton({ variant = "ghost", size = "sm" }: { variant?: "default" | "ghost" | "outline", size?: "default" | "sm" }) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Déconnexion
    </Button>
  )
}

