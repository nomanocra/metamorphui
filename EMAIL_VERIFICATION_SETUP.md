# Configuration de la vérification d'email - MetamorphUI

Ce guide vous explique comment configurer l'envoi d'emails pour la vérification d'email lors de l'inscription.

## 📋 Prérequis

- Un compte [Resend](https://resend.com) (gratuit jusqu'à 100 emails/jour)

## 🚀 Étapes de configuration

### 1. Créer un compte Resend

1. Allez sur [Resend](https://resend.com)
2. Créez un compte gratuit
3. Vérifiez votre email

### 2. Créer une clé API

1. Dans le dashboard Resend, allez dans **"API Keys"**
2. Cliquez sur **"Create API Key"**
3. Donnez un nom à votre clé (ex: "MetamorphUI Development")
4. Copiez la clé API (vous ne pourrez plus la voir après)

### 3. Configurer un domaine (Optionnel pour le développement)

Pour le développement local, vous pouvez utiliser l'email par défaut de Resend (`onboarding@resend.dev`).

Pour la production, vous devrez :
1. Ajouter votre domaine dans Resend
2. Configurer les enregistrements DNS (SPF, DKIM, DMARC)
3. Vérifier le domaine

### 4. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# Email (Resend)
RESEND_API_KEY="re_votre_cle_api_ici"
RESEND_FROM_EMAIL="onboarding@resend.dev"  # Pour le développement
# Pour la production, utilisez : "noreply@votre-domaine.com"
```

### 5. Redémarrer le serveur

Après avoir modifié le `.env`, redémarrez votre serveur :

```bash
npm run dev
```

## ✅ Fonctionnement

### Flux d'inscription avec vérification

1. **Utilisateur s'inscrit** avec email/password
2. **Compte créé** mais `emailVerified` reste `null`
3. **Token de vérification** généré et stocké dans la base de données
4. **Email envoyé** avec un lien de vérification
5. **Utilisateur clique** sur le lien dans l'email
6. **Email vérifié** : `emailVerified` est mis à jour avec la date actuelle
7. **Utilisateur peut se connecter**

### Pages et routes

- **`/signup`** : Formulaire d'inscription (affiche un message après envoi de l'email)
- **`/verify-email?token=...`** : Page de vérification (appelée depuis le lien dans l'email)
- **`/api/auth/verify-email`** : Route API pour vérifier le token et activer le compte

### Sécurité

- Les tokens expirent après **24 heures**
- Les tokens sont supprimés après utilisation
- Les utilisateurs non vérifiés ne peuvent pas se connecter

## 🔧 Dépannage

### L'email n'est pas envoyé

1. Vérifiez que `RESEND_API_KEY` est correct dans votre `.env`
2. Vérifiez les logs du serveur pour voir les erreurs
3. Vérifiez votre quota Resend (100 emails/jour en gratuit)

### Le lien de vérification ne fonctionne pas

1. Vérifiez que le token n'a pas expiré (24h)
2. Vérifiez que `NEXTAUTH_URL` est correct dans votre `.env`
3. Vérifiez les logs du serveur

### Erreur "Email not verified" lors de la connexion

- L'utilisateur doit d'abord vérifier son email en cliquant sur le lien
- Si le lien a expiré, l'utilisateur doit créer un nouveau compte ou demander un nouveau lien

## 📝 Notes importantes

### Pour la production

1. **Ajoutez votre domaine** dans Resend
2. **Configurez les DNS** (SPF, DKIM, DMARC)
3. **Utilisez un email professionnel** : `noreply@votre-domaine.com`
4. **Augmentez le quota** si nécessaire (plans payants disponibles)

### OAuth (Google/GitHub)

Les utilisateurs qui s'inscrivent via OAuth n'ont **pas besoin** de vérifier leur email car :
- Google/GitHub ont déjà vérifié leur email
- Le champ `emailVerified` est automatiquement rempli par NextAuth

### Personnalisation de l'email

Vous pouvez modifier le template d'email dans `lib/email.ts` pour personnaliser :
- Le design
- Le contenu
- Les couleurs
- Le logo

