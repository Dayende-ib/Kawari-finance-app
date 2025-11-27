# Kawari Finance App

Kawari est un assistant financier mobile pensé pour les petites entreprises du Burkina Faso. Il centralise les ventes, dépenses, factures et fournit un tableau de bord clair pour suivre la trésorerie et préparer des analyses IA.

## Architecture

- `backend/` – API Node.js/Express, MongoDB (transactions, factures, comptes).
- `mobile/` – Application React Native (Expo) avec tableau de bord, saisie ventes/dépenses, suivi factures.
- `web/` – Application web React (Vite) avec les mêmes écrans et connexion à l'API.

## Prérequis

- Node.js 18+ et npm
- MongoDB accessible (local ou Atlas)
- Expo CLI (`npm install -g expo-cli`) pour lancer le mobile

## Lancer l'API (backend)

```bash
cd backend
cp .env.example .env    # renseigner MONGO_URI, JWT_SECRET, PORT
npm install
npm run dev             # démarre sur http://localhost:4000
```

### Endpoints clés

- `POST /api/auth/register` – créer un compte (name, email, password).
- `POST /api/auth/login` – obtenir un token JWT.
- `GET /api/finance/dashboard` – agrégats ventes/dépenses et statut factures.
- `POST /api/finance/sales` – créer une vente (amount, category, description, counterparty, date).
- `POST /api/finance/expenses` – créer une dépense (amount, category, description, counterparty, date).
- `POST /api/finance/invoices` – créer une facture (number, customerName, amount, dueDate, status).
- `GET /api/finance/invoices` – lister les factures de l’utilisateur.

Toutes les routes `api/finance` nécessitent le header `Authorization: Bearer <token>` obtenu à la connexion.

## Lancer l’app mobile (Expo)

```bash
cd mobile
npm install
# Important : pointer l'URL de l'API vers votre machine (ex. IP locale)
EXPO_PUBLIC_API_URL=http://192.168.1.20:4000 npm start
```

Dans l’app :
1) Créer un compte via l’écran de connexion (ou utiliser login existant).  
2) Naviguer par onglets : Dashboard, Ventes, Dépenses, Factures.  
3) Les saisies appellent l’API et le tableau de bord se rafraîchit avec les totaux mensuels et cumulés.

## Notes rapides

- Les icônes/splash fournis sont des placeholders ; remplacez-les dans `mobile/assets/` avant publication.
- Les calculs du tableau de bord couvrent les 6 derniers mois et le mois courant (ventes, dépenses, cashflow, factures par statut).
- La sécurité est volontairement minimale pour la démo (JWT simple). Prévoir rate limiting, validation renforcée et chiffrement au repos pour la production.

## Lancer l'app web

```bash
cd web
npm install
VITE_API_URL=http://localhost:4000 npm run dev  # puis ouvrir http://localhost:5173
```

L'app web reprend les écrans Dashboard, Ventes, Dépenses, Factures. Authentifiez-vous (ou créez un compte) pour générer un token JWT stocké en mémoire puis effectuer les saisies.
