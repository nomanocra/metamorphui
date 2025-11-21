import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json(
        { error: "Token de vérification manquant" },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token de vérification invalide" },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      })
      return NextResponse.json(
        { error: "Le token de vérification a expiré. Veuillez demander un nouveau lien." },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      )
    }

    // Verify email and delete token
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.delete({
      where: { token },
    })

    return NextResponse.json(
      { message: "Email vérifié avec succès. Vous pouvez maintenant vous connecter." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification de l'email" },
      { status: 500 }
    )
  }
}

