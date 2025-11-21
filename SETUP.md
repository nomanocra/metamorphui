# Guide de Configuration - MetamorphUI

Ce guide vous aidera à configurer votre environnement de développement local.

## Prérequis

- Node.js 18+ installé
- PostgreSQL installé et en cours d'exécution
- Un compte Google/GitHub (optionnel, pour OAuth)

## Étapes de Configuration

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer PostgreSQL

#### Option A : PostgreSQL local

1. Créer une base de données :
```bash
createdb metamorph
```

2. Ou via psql :
```sql
CREATE DATABASE metamorph;
```

#### Option B : Docker (recommandé)

```bash
docker run --name metamorph-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=metamorph \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/metamorph?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-ici"

# OAuth Providers (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Encryption key pour les API Keys Figma
ENCRYPTION_KEY="votre-cle-encryption-ici"
```

#### Générer les secrets

**NEXTAUTH_SECRET** :
```bash
openssl rand -base64 32
```

**ENCRYPTION_KEY** :
```bash
openssl rand -base64 32
```

#### Configuration OAuth (optionnel)

**Google OAuth** :
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+
4. Créez des identifiants OAuth 2.0
5. Ajoutez `http://localhost:3000/api/auth/callback/google` comme URI de redirection
6. Copiez le Client ID et Client Secret dans votre `.env`

**GitHub OAuth** :
1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Définissez l'URL d'autorisation : `http://localhost:3000/api/auth/callback/github`
4. Copiez le Client ID et générez un Client Secret
5. Ajoutez-les dans votre `.env`

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables dans la base de données
npm run db:push
```

### 5. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Vérification

1. ✅ La landing page s'affiche correctement
2. ✅ Vous pouvez créer un compte (email/password)
3. ✅ Vous pouvez vous connecter
4. ✅ Le dashboard s'affiche après connexion

## Prochaines étapes

Une fois la configuration terminée, vous pourrez :
- Créer des projets Figma
- Importer des tokens depuis Figma
- Exporter vos tokens en CSS

## Dépannage

### Erreur de connexion à la base de données

Vérifiez que :
- PostgreSQL est en cours d'exécution
- La `DATABASE_URL` est correcte
- La base de données existe

### Erreur NextAuth

Vérifiez que :
- `NEXTAUTH_SECRET` est défini
- `NEXTAUTH_URL` correspond à votre URL locale

### Erreur OAuth

Si vous n'utilisez pas OAuth, vous pouvez laisser les variables OAuth vides. L'authentification par email/password fonctionnera toujours.

