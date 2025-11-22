import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // If email is not verified, suggest resending verification
      if (!existingUser.emailVerified) {
        return NextResponse.json(
          { 
            error: "Un compte avec cet email existe déjà mais n'a pas été vérifié.",
            requiresVerification: true,
            resendVerificationUrl: "/resend-verification"
          },
          { status: 400 }
        )
      }
      // If email is verified, account exists
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà. Connectez-vous plutôt." },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Token expires in 24 hours

    // Create user (email not verified yet)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        emailVerified: null, // Email not verified yet
        theme: 'system', // Default theme is system
      },
    })

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, name)
    } catch (emailError) {
      console.error("❌ Erreur lors de l'envoi de l'email de vérification:", emailError)
      // Don't fail the signup if email fails, but log it
      // In production, you might want to handle this differently
    }
    
    // In development, if Resend is not configured, the email URL is logged to console

    return NextResponse.json(
      { 
        message: "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
        requiresVerification: true 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du compte" },
      { status: 500 }
    )
  }
}

