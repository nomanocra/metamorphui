# Configuration Google OAuth pour MetamorphUI

Ce guide vous explique comment configurer l'authentification Google OAuth pour MetamorphUI.

## 📋 Prérequis

- Un compte Google
- Accès à [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Étapes de configuration

### 1. Créer un projet dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur le sélecteur de projet en haut de la page
3. Cliquez sur **"Nouveau projet"**
4. Donnez un nom à votre projet (ex: "MetamorphUI")
5. Cliquez sur **"Créer"**

### 2. Activer l'API Google+ / Google Identity

1. Dans le menu latéral, allez dans **"APIs & Services"** → **"Library"**
2. Recherchez **"Google+ API"** ou **"Google Identity"**
3. Cliquez sur **"Enable"** pour activer l'API

**Note** : Google recommande maintenant d'utiliser directement l'API Google Identity au lieu de Google+ API.

### 3. Créer des identifiants OAuth 2.0

1. Allez dans **"APIs & Services"** → **"Credentials"**
2. Cliquez sur **"+ CREATE CREDENTIALS"** en haut de la page
3. Sélectionnez **"OAuth client ID"**

### 4. Configurer l'écran de consentement OAuth

Si c'est la première fois que vous créez des identifiants OAuth :

1. Vous serez invité à configurer l'écran de consentement OAuth
2. Sélectionnez **"External"** (pour le développement)
3. Remplissez les informations requises :
   - **App name** : MetamorphUI
   - **User support email** : votre email
   - **Developer contact information** : votre email
4. Cliquez sur **"Save and Continue"**
5. Pour les scopes, cliquez sur **"Save and Continue"** (les scopes par défaut suffisent)
6. Pour les test users, vous pouvez ajouter votre email Google si nécessaire
7. Cliquez sur **"Save and Continue"** puis **"Back to Dashboard"**

### 5. Créer l'OAuth Client ID

1. Dans **"Create OAuth client ID"**, sélectionnez :
   - **Application type** : "Web application"
   - **Name** : "MetamorphUI Local" (ou un nom de votre choix)

2. Dans **"Authorized JavaScript origins"**, ajoutez :
   ```
   http://localhost:3000
   ```

3. Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   http://localhost:3000/api/auth/callback/google
   ```

4. Cliquez sur **"Create"**

5. **Important** : Copiez le **Client ID** et le **Client Secret** qui s'affichent

### 6. Configurer les variables d'environnement

Ouvrez votre fichier `.env` à la racine du projet et ajoutez/modifiez :

```env
GOOGLE_CLIENT_ID="votre-client-id-ici.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="votre-client-secret-ici"
```

**⚠️ Important** : Ne partagez jamais votre Client Secret publiquement !

### 7. Redémarrer le serveur

Après avoir modifié le fichier `.env`, redémarrez votre serveur de développement :

```bash
npm run dev
```

Vous devriez voir dans les logs :
```
✅ Google OAuth provider configured
```

## ✅ Vérification

1. Allez sur `http://localhost:3000/signin` ou `http://localhost:3000/signup`
2. Cliquez sur le bouton **"Google"**
3. Vous devriez être redirigé vers la page de connexion Google
4. Après avoir autorisé l'application, vous serez redirigé vers `/dashboard`

## 🔧 Dépannage

### Erreur : "OAuth client not found"
- Vérifiez que le Client ID est correct dans votre `.env`
- Vérifiez que vous avez copié le Client ID complet (avec `.apps.googleusercontent.com`)

### Erreur : "redirect_uri_mismatch"
- Vérifiez que l'URI de redirection dans Google Cloud Console est exactement :
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Assurez-vous qu'il n'y a pas d'espace ou de caractère supplémentaire

### Le bouton Google ne fonctionne pas
- Vérifiez les logs du serveur pour voir si Google OAuth est configuré
- Vérifiez que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont bien définis dans `.env`
- Redémarrez le serveur après avoir modifié `.env`

### Erreur : "Access blocked: This app's request is invalid"
- Vérifiez que vous avez configuré l'écran de consentement OAuth
- Si vous êtes en mode "Testing", ajoutez votre email dans les "Test users"

## 📝 Notes importantes

- Pour la production, vous devrez :
  - Créer un nouveau OAuth Client ID avec les URLs de production
  - Ajouter les URLs de production dans "Authorized JavaScript origins" et "Authorized redirect URIs"
  - Publier votre application dans Google Cloud Console si nécessaire

- Le Client Secret doit rester secret et ne jamais être commité dans Git
- Assurez-vous que votre fichier `.env` est dans `.gitignore`

