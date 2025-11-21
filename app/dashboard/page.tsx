import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignOutButton } from "@/components/auth/signout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { prisma } from "@/lib/prisma"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/signin")
  }

  const projects = await prisma.project.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { tokens: true },
      },
    },
  })

  const projectCount = projects.length
  const maxProjects = 3

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MetamorphUI</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Mes projets</h2>
            <p className="text-muted-foreground">
              Gérez vos projets Figma et vos tokens de design
            </p>
          </div>
          {projectCount < maxProjects ? (
            <Link href="/dashboard/projects/new">
              <Button>Nouveau projet</Button>
            </Link>
          ) : (
            <Button disabled>
              Limite atteinte ({maxProjects} projets max)
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun projet</CardTitle>
              <CardDescription>
                Créez votre premier projet pour commencer à importer vos tokens Figma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/projects/new">
                <Button>Créer un projet</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      Fichier Figma: {project.figmaFileId}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {project._count.tokens} token{project._count.tokens > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

