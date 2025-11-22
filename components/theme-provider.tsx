"use client"

import * as React from "react"
import { ThemeProvider as CustomThemeProvider } from "@/lib/theme-context"

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: "light" | "dark" | "system"
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <CustomThemeProvider {...props}>{children}</CustomThemeProvider>
}

