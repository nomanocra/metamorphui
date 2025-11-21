# Guide de Test - MetamorphUI

## 🎯 Ce qui est fonctionnel MAINTENANT

### 1. **Landing Page** (`/`)
✅ **Fonctionnel sans configuration**
- Page d'accueil avec présentation
- Navigation vers signin/signup
- Design responsive
- **Test** : Ouvrez `http://localhost:3000` (même sans DB)

### 2. **Pages d'Authentification**
✅ **Partiellement fonctionnel**

#### `/signin` - Page de connexion
- ✅ Interface complète
- ✅ OAuth Google/GitHub (nécessite config OAuth)
- ❌ Email/Password (nécessite DB)

#### `/signup` - Page d'inscription
- ✅ Interface complète
- ✅ OAuth Google/GitHub (nécessite config OAuth)
- ❌ Email/Password (nécessite DB)

### 3. **Dashboard** (`/dashboard`)
❌ **Nécessite authentification + DB**
- Redirige vers `/signin` si non connecté
- Affiche les projets une fois connecté

---

## 🚀 Pour tester COMPLÈTEMENT

### Configuration minimale requise :

1. **Base de données PostgreSQL**
   ```bash
   # Créer la DB
   createdb metamorph
   ```

2. **Fichier `.env`** (à créer à la racine)
   ```env
   DATABASE_URL="postgresql://votre_user:votre_password@localhost:5432/metamorph?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="générez-avec-openssl-rand-base64-32"
   ENCRYPTION_KEY="générez-avec-openssl-rand-base64-32"
   ```

3. **Initialiser Prisma**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Lancer l'app**
   ```bash
   npm run dev
   ```

---

## ✅ Tests possibles SANS configuration

### Test 1 : Landing Page
```bash
npm run dev
# Ouvrir http://localhost:3000
```
**Résultat attendu** : Page d'accueil s'affiche correctement

### Test 2 : Navigation
- Cliquer sur "Se connecter" → `/signin`
- Cliquer sur "Créer un compte" → `/signup`
- Navigation fonctionnelle

### Test 3 : Pages d'authentification (UI uniquement)
- Vérifier que les formulaires s'affichent
- Vérifier le design responsive
- Tester la validation des champs (frontend)

---

## ⚠️ Tests nécessitant configuration

### Test 4 : Inscription Email/Password
**Nécessite** : DB configurée
1. Aller sur `/signup`
2. Remplir le formulaire
3. Créer un compte
4. Redirection vers `/dashboard`

### Test 5 : Connexion Email/Password
**Nécessite** : DB configurée + compte créé
1. Aller sur `/signin`
2. Se connecter
3. Accéder au dashboard

### Test 6 : OAuth (Google/GitHub)
**Nécessite** : 
- DB configurée
- Credentials OAuth configurés dans `.env`
- Redirections configurées dans les providers

### Test 7 : Dashboard
**Nécessite** : DB + authentification
1. Se connecter
2. Voir la liste des projets (vide au début)
3. Voir le bouton "Nouveau projet"

---

## 🎨 Ce qui fonctionne visuellement

- ✅ Design system shadcn/ui
- ✅ Thème clair/sombre (variables CSS)
- ✅ Responsive design
- ✅ Animations et transitions
- ✅ Formulaires avec validation visuelle

---

## 📝 Checklist de test rapide

### Sans configuration
- [ ] Landing page s'affiche
- [ ] Navigation fonctionne
- [ ] Pages signin/signup s'affichent
- [ ] Design responsive

### Avec DB seulement
- [ ] Création de compte fonctionne
- [ ] Connexion fonctionne
- [ ] Dashboard s'affiche après connexion
- [ ] Déconnexion fonctionne

### Avec DB + OAuth
- [ ] Connexion Google fonctionne
- [ ] Connexion GitHub fonctionne
- [ ] Redirection après OAuth fonctionne

---

## 🔧 Commandes utiles

```bash
# Générer les secrets
openssl rand -base64 32  # Pour NEXTAUTH_SECRET
openssl rand -base64 32  # Pour ENCRYPTION_KEY

# Vérifier la connexion DB
psql -d metamorph -c "SELECT 1;"

# Voir les tables créées
npm run db:studio  # Interface graphique Prisma
```

