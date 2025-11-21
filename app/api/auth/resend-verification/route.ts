import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendVerificationEmail } from "@/lib/email"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "Si un compte existe avec cet email, un nouveau lien de vérification a été envoyé." },
        { status: 200 }
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Cet email est déjà vérifié. Vous pouvez vous connecter." },
        { status: 200 }
      )
    }

    // Delete old verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // Token expires in 24 hours

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken, user.name)
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "Un nouveau lien de vérification a été envoyé à votre adresse email." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi du lien de vérification" },
      { status: 500 }
    )
  }
}

