import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignOutButton } from "@/components/auth/signout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { LanguageIndicator } from "@/components/language-indicator"
import { prisma } from "@/lib/prisma"
import { getTranslations } from 'next-intl/server'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations()

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
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <LanguageIndicator />
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
            <h2 className="text-3xl font-bold mb-2">{t('dashboard.myProjects')}</h2>
            <p className="text-muted-foreground">
              {t('dashboard.description')}
            </p>
          </div>
          {projectCount < maxProjects ? (
            <Link href="/dashboard/projects/new">
              <Button>{t('dashboard.newProject')}</Button>
            </Link>
          ) : (
            <Button disabled>
              {t('dashboard.maxProjectsReached', { max: maxProjects })}
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.noProjects.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.noProjects.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/projects/new">
                <Button>{t('dashboard.noProjects.createButton')}</Button>
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
                      {t('dashboard.project.figmaFile', { fileId: project.figmaFileId })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {project._count.tokens === 1 
                          ? t('dashboard.project.tokens', { count: project._count.tokens })
                          : t('dashboard.project.tokensPlural', { count: project._count.tokens })
                        }
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
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

