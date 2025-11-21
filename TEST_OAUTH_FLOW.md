# Comment tester le flux OAuth complet

## Comportement normal

Quand vous vous connectez avec GitHub (ou Google) pour la première fois, vous devriez voir :
1. Redirection vers GitHub/Google
2. Page de confirmation/autorisation
3. Redirection vers votre application
4. Connexion au dashboard

**Si vous avez déjà autorisé l'application**, GitHub/Google peut vous rediriger automatiquement sans redemander la confirmation. C'est un comportement normal pour améliorer l'expérience utilisateur.

## Pour tester le flux complet

### Option 1 : Révoquer l'autorisation GitHub

1. Allez sur [GitHub Settings > Applications > Authorized OAuth Apps](https://github.com/settings/applications)
2. Trouvez votre application "MetamorphUI" (ou le nom que vous avez donné)
3. Cliquez sur l'application
4. Cliquez sur **"Revoke"** (Révoquer)
5. Testez à nouveau la connexion - vous devriez voir la page de confirmation

### Option 2 : Utiliser un compte GitHub différent

Créez un compte de test GitHub ou utilisez un autre compte pour tester le flux complet.

### Option 3 : Utiliser la navigation privée

Ouvrez une fenêtre de navigation privée (Incognito) et testez la connexion. Cela forcera GitHub à demander à nouveau l'autorisation.

## Vérifier que tout fonctionne

Même si vous ne voyez pas la page de confirmation (car déjà autorisé), vous pouvez vérifier que tout fonctionne :

1. ✅ La connexion GitHub fonctionne
2. ✅ Vous êtes redirigé vers le dashboard
3. ✅ Votre session est créée
4. ✅ Vous pouvez accéder aux fonctionnalités protégées

## Comportement attendu

- **Première connexion** : Page de confirmation GitHub/Google → Autorisation → Redirection vers dashboard
- **Connexions suivantes** : Redirection automatique vers dashboard (si déjà autorisé)

C'est le comportement standard d'OAuth pour une meilleure expérience utilisateur.

