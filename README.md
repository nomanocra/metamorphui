# MetamorphUI

Application SaaS pour générer des composants et tokens à partir de fichiers Figma.

## Technologies

- Next.js 14 (App Router)
- TypeScript
- PostgreSQL + Prisma
- NextAuth.js (Email/Password + OAuth)
- shadcn/ui
- Tailwind CSS

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

3. Configurer la base de données :
```bash
npm run db:push
npm run db:generate
```

4. Lancer le serveur de développement :
```bash
npm run dev
```

## Structure du projet

- `/app` - Pages et routes Next.js
- `/components` - Composants React réutilisables
- `/lib` - Utilitaires et configurations
- `/prisma` - Schéma de base de données

