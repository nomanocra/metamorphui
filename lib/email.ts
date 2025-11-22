import { Resend } from "resend"

// Only initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string | null
) {
  // Check if Resend is configured (check at runtime, not just initialization)
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"
  
  // If Resend is not configured, log the verification URL instead (dev mode)
  if (!resend || !apiKey) {
    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`
    console.log("=".repeat(80))
    console.log("📧 EMAIL DE VÉRIFICATION (Mode développement - Resend non configuré)")
    console.log("=".repeat(80))
    console.log(`Pour: ${email}`)
    console.log(`Lien de vérification: ${verifyUrl}`)
    console.log("=".repeat(80))
    console.log("Pour activer l'envoi d'emails, configurez RESEND_API_KEY dans votre .env")
    console.log("   ET redémarrez le serveur!")
    console.log("=".repeat(80))
    return
  }

  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Vérifiez votre email - MetamorphUI",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vérifiez votre email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">MetamorphUI</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Bonjour${name ? ` ${name}` : ""} !</h2>
              <p>Merci de vous être inscrit sur MetamorphUI. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Vérifier mon email</a>
              </div>
              <p style="color: #666; font-size: 14px;">Ou copiez-collez ce lien dans votre navigateur :</p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">Ce lien expirera dans 24 heures.</p>
              <p style="color: #666; font-size: 14px; margin-top: 20px;">Si vous n'avez pas créé de compte sur MetamorphUI, vous pouvez ignorer cet email.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} MetamorphUI. Tous droits réservés.</p>
            </div>
          </body>
        </html>
      `,
    })
    
    if (result.error) {
      console.error("❌ Erreur Resend:", result.error.message)
      if (result.error.statusCode === 403) {
        console.error("   ⚠️  Resend en mode test : vous ne pouvez envoyer qu'à votre email de compte")
        console.error("   💡 Solutions:")
        console.error("      1. Testez avec votre email de compte Resend (dprt.david@gmail.com)")
        console.error("      2. Vérifiez un domaine sur resend.com/domains pour envoyer à d'autres adresses")
        throw new Error(result.error.message)
      }
      throw new Error(result.error.message)
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email:", error)
    if (error instanceof Error) {
      console.error("   - Message:", error.message)
    }
    throw error
  }
}

