# Roadmap - Implémentation Multi-langue (i18n)

## Vue d'ensemble

Implémentation d'un système de gestion de langue avec priorité: préférence utilisateur (DB) > cookies > langue système/navigateur. Support FR/EN uniquement pour le moment.

---

## Étapes d'exécution

### Étape 1: Configuration de base et schéma DB

- [x] Ajouter le champ `language` (String, nullable) au modèle `User` dans `prisma/schema.prisma`
- [x] Créer et exécuter la migration Prisma
- [x] Générer le client Prisma

**Fichiers modifiés:**

- `prisma/schema.prisma`

**Validation requise:** Migration créée et appliquée avec succès

**Status:** ✅ TERMINÉ

---

### Étape 2: Installation et configuration de next-intl

- [x] Installer `next-intl` via npm
- [x] Créer la structure de fichiers de traduction (`messages/fr.json`, `messages/en.json`)
- [x] Configurer `next-intl` **sans routing par locale** (pas de `/fr`/`/en` dans l'URL)
- [x] Configurer le middleware pour détection de langue via cookies/headers uniquement
- [x] Créer `i18n.ts` pour la configuration centralisée (mode "as-needed" sans locale dans l'URL)

**Fichiers créés:**

- `messages/fr.json`
- `messages/en.json`
- `i18n.ts`
- `i18n/routing.ts`
- `middleware.ts` (ou modification si existe déjà)

**Fichiers modifiés:**

- `package.json`
- `next.config.js` (si nécessaire)

**Validation requise:** Configuration fonctionnelle, middleware actif, pas de redirection vers `/fr`/`/en`

**Status:** ✅ TERMINÉ

---

### Étape 3: Logique de récupération de langue (server-side)

- [x] Créer `lib/language.ts` avec fonctions utilitaires:
  - [x] `getUserLanguage(userId)` - récupère depuis DB
  - [x] `getLanguageFromCookies()` - récupère depuis cookies
  - [x] `getSystemLanguage()` - détecte langue navigateur
  - [x] `determineLanguage(session)` - logique de priorité complète
  - [x] `determineLanguageInMiddleware(request)` - version pour middleware
  - [x] `saveLanguagePreference()` - sauvegarde préférence
- [x] Créer route API `app/api/user/preferences/language/route.ts` pour mise à jour

**Fichiers créés:**

- `lib/language.ts`
- `app/api/user/preferences/language/route.ts`

**Validation requise:** Logique de priorité testée et fonctionnelle

**Status:** ✅ TERMINÉ

---

### Étape 4: Composant LanguageToggle

- [x] Créer `components/language-toggle.tsx` (similaire à `theme-toggle.tsx`)
- [x] Intégrer dans le header/navigation existant
- [x] Gérer la sauvegarde (DB si connecté, cookies sinon)
- [x] Appel API pour mise à jour préférence utilisateur
- [x] Utiliser icône Globe au lieu de Languages

**Fichiers créés:**

- `components/language-toggle.tsx`

**Fichiers modifiés:**

- `app/page.tsx`
- `app/dashboard/page.tsx`
- `app/signin/page.tsx`
- `app/signup/page.tsx`

**Validation requise:** Composant fonctionnel, changement de langue opérationnel

**Status:** ✅ TERMINÉ

---

### Étape 5: Intégration dans le layout et pages

- [x] Modifier `app/layout.tsx` pour utiliser `next-intl` et appliquer la langue déterminée
- [x] **Important:** Pas de modification de structure de routes (pas de `[locale]` dans les paths)
- [x] Mettre à jour l'attribut `lang` du `<html>` dynamiquement selon la langue détectée
- [x] Utiliser `next-intl` en mode "as-needed" sans préfixe de locale dans l'URL

**Fichiers modifiés:**

- `app/layout.tsx`

**Validation requise:** Langue appliquée correctement au chargement, URLs restent sans `/fr`/`/en`

**Status:** ✅ TERMINÉ

---

### Étape 6: Traduction des textes existants

- [x] Identifier tous les textes à traduire dans l'application
- [x] Créer les clés de traduction dans `messages/fr.json` et `messages/en.json`
- [x] Remplacer les textes hardcodés par des appels `useTranslations()` ou `getTranslations()`

**Pages à traduire:**

- [x] `app/page.tsx` (landing)
- [x] `app/signin/page.tsx`
- [x] `app/signup/page.tsx`
- [x] `app/dashboard/page.tsx`
- [x] `app/verify-email/page.tsx`
- [x] `app/resend-verification/page.tsx`
- [x] Composants d'authentification
- [x] Messages d'erreur et de succès

**Fichiers modifiés:**

- Tous les fichiers de pages et composants contenant du texte
- `messages/fr.json`
- `messages/en.json`

**Validation requise:** Tous les textes traduits et fonctionnels

**Status:** ✅ TERMINÉ

---

### Étape 7: Tests et validation finale

- [ ] Tester le flux complet: utilisateur connecté/non connecté
- [ ] Vérifier la persistance des préférences
- [ ] Tester le changement de langue en temps réel
- [ ] Valider la détection automatique de langue

**Validation requise:** Tous les scénarios fonctionnent correctement

**Status:** ⏳ EN ATTENTE

---

## Décisions techniques

- **Bibliothèque:** `next-intl` (recommandée pour Next.js 14 App Router)
- **Routing:** **Aucun préfixe de locale dans l'URL** (`/fr`/`/en` non souhaité)
- **Mode:** `next-intl` en mode "as-needed" sans routing par locale
- **Stockage:** Champ `language` dans modèle `User` (nullable)
- **Cookies:** Nom du cookie `NEXT_LOCALE` (ou similaire)
- **Langues supportées:** `fr`, `en` (extensible plus tard)
- **Détection système:** Via `Accept-Language` header ou `navigator.language`

## Notes importantes

- La logique de priorité doit être appliquée à chaque requête (server-side)
- Les cookies doivent être accessibles côté serveur et client
- Le changement de langue doit déclencher une mise à jour immédiate de l'UI
- Gérer les cas edge: utilisateur se connecte avec préférence cookie existante
