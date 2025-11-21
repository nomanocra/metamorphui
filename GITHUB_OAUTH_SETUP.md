# Configuration GitHub OAuth pour MetamorphUI

Ce guide vous explique comment configurer l'authentification GitHub OAuth pour MetamorphUI.

## 📋 Prérequis

- Un compte GitHub
- Accès aux paramètres développeur GitHub

## 🚀 Étapes de configuration

### 1. Créer une OAuth App sur GitHub

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Cliquez sur **"OAuth Apps"** dans le menu de gauche
3. Cliquez sur **"New OAuth App"** (ou **"Register a new application"**)

### 2. Remplir les informations de l'application

Remplissez le formulaire avec les informations suivantes :

- **Application name** : `MetamorphUI` (ou un nom de votre choix)
- **Homepage URL** : `http://localhost:3000`
- **Authorization callback URL** : `http://localhost:3000/api/auth/callback/github`

**⚠️ Important** : L'URL de callback doit être exactement :
```
http://localhost:3000/api/auth/callback/github
```

### 3. Enregistrer l'application

1. Cliquez sur **"Register application"**
2. Vous serez redirigé vers la page de votre application OAuth

### 4. Récupérer les credentials

Sur la page de votre application OAuth, vous verrez :

- **Client ID** : Un identifiant public (vous pouvez le partager)
- **Client Secret** : Un secret privé (ne le partagez jamais !)

**⚠️ Important** : Si vous ne voyez pas le Client Secret, cliquez sur **"Generate a new client secret"** pour en créer un.

### 5. Configurer les variables d'environnement

Ouvrez votre fichier `.env` à la racine du projet et ajoutez/modifiez :

```env
GITHUB_CLIENT_ID="votre-client-id-ici"
GITHUB_CLIENT_SECRET="votre-client-secret-ici"
```

**⚠️ Important** : 
- Ne partagez jamais votre Client Secret publiquement !
- Ne commitez jamais votre fichier `.env` dans Git
- Assurez-vous que votre fichier `.env` est dans `.gitignore`

### 6. Redémarrer le serveur

Après avoir modifié le fichier `.env`, redémarrez votre serveur de développement :

```bash
npm run dev
```

Vous devriez voir dans les logs :
```
✅ GitHub OAuth provider configured
```

## ✅ Vérification

1. Allez sur `http://localhost:3000/signin` ou `http://localhost:3000/signup`
2. Cliquez sur le bouton **"GitHub"**
3. Vous devriez être redirigé vers la page d'autorisation GitHub
4. Après avoir autorisé l'application, vous serez redirigé vers `/dashboard`

## 🔧 Dépannage

### Erreur : "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans GitHub est exactement :
  ```
  http://localhost:3000/api/auth/callback/github
  ```
- Assurez-vous qu'il n'y a pas d'espace ou de caractère supplémentaire
- Vérifiez qu'il n'y a pas de `/` à la fin

### Erreur : "Bad credentials"
- Vérifiez que le `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` sont corrects dans votre `.env`
- Vérifiez qu'il n'y a pas d'espaces ou de guillemets supplémentaires
- Assurez-vous que le Client Secret n'a pas expiré (générez-en un nouveau si nécessaire)

### Le bouton GitHub ne fonctionne pas
- Vérifiez les logs du serveur pour voir si GitHub OAuth est configuré
- Vérifiez que `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` sont bien définis dans `.env`
- Redémarrez le serveur après avoir modifié `.env`

### Erreur : "Application suspended"
- Vérifiez que votre application OAuth n'a pas été suspendue sur GitHub
- Assurez-vous que vous respectez les conditions d'utilisation de GitHub

## 📝 Notes importantes

### Pour la production

Quand vous déployez en production, vous devrez :

1. **Créer une nouvelle OAuth App** pour la production (ou modifier l'existante)
2. **Mettre à jour les URLs** :
   - Homepage URL : `https://votre-domaine.com`
   - Authorization callback URL : `https://votre-domaine.com/api/auth/callback/github`
3. **Mettre à jour le `.env`** avec les nouveaux credentials
4. **Redémarrer l'application**

### Scopes GitHub

Par défaut, NextAuth demande les scopes suivants :
- `read:user` : Lire les informations du profil utilisateur
- `user:email` : Accéder à l'email de l'utilisateur

Ces scopes sont suffisants pour l'authentification de base. Si vous avez besoin d'accéder à d'autres ressources GitHub, vous pouvez les ajouter dans la configuration du provider.

## 🔒 Sécurité

- **Ne partagez jamais** votre Client Secret
- **Ne commitez jamais** votre fichier `.env` dans Git
- **Utilisez des secrets différents** pour le développement et la production
- **Régénérez le Client Secret** si vous pensez qu'il a été compromis

