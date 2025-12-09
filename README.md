# Kawari Finance – Backend & Frontend

Suite complète (API + UI) pour un assistant financier destiné aux petites entreprises du Burkina Faso. Backend Node.js/Express/Prisma (SQLite) et frontend React/Vite/TypeScript/Tailwind.

## Fonctionnalités principales
- Auth JWT (inscription/connexion), mots de passe hachés (bcrypt).
- Gestion des clients (CRUD).
- Transactions : ventes et dépenses, statistiques globales et mensuelles.
- Facturation (CRUD) avec lignes.
- Notifications (création, lecture, suppression, compteur non lus).
- Simulation Mobile Money.
- Seed Prisma idempotent (réinitialise les tables avant les données de démo).

## Stack
- Backend : Node.js + Express 5, Prisma 5 + SQLite, Joi (validation), Winston (logs).
- Frontend : React 18 + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, Axios, Recharts.

## Prérequis
- Node.js ≥ 18
- npm

## Installation backend
```bash
cd backend
npm install
```

## Environnement backend
- Fichier attendu : `backend/.env` (exemple dans `env.example` à la racine).
- Variables minimales :
```
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=change_me
FRONTEND_URL=http://localhost:5173
DEBUG_LEVEL=debug
```
- Copier l’exemple :  
  - Windows : `copy env.example backend/.env`  
  - Linux/macOS : `cp env.example backend/.env`

## Base de données (Prisma)
```bash
npx prisma migrate dev --name init   # ou: npx prisma db push
npx prisma db seed                   # réinitialise et insère les données de démo
```
⚠️ Le seed supprime les données existantes (deleteMany sur toutes les tables).

## Lancement backend
```bash
node server.js          # simple
npx nodemon server.js   # avec reload
```
API par défaut : `http://localhost:5000`.

## Compte de démo
- Email : `admin@kawari.com`
- Mot de passe : `Password123!`

## Installation frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend par défaut : `http://localhost:5173`.
- Si le backend n’est pas sur `localhost:5000`, ajuster `frontend/src/lib/api.ts` (`baseURL`).

## Structure
```
backend/
├─ server.js              # Point d’entrée Express
├─ prisma/
│  ├─ schema.prisma       # Modèle de données
│  └─ seed.js             # Seed idempotent
└─ src/
   ├─ controllers/        # Logique métier
   ├─ middlewares/        # authMiddleware, validateRequest
   ├─ routes/             # Endpoints
   ├─ utils/              # hash, jwt, logger
   └─ validators/         # Schémas Joi

frontend/
├─ vite.config.ts
├─ tailwind.config.cjs
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ lib/api.ts          # Axios + baseURL
│  ├─ context/AuthContext.tsx
│  ├─ components/         # Button, Input, Card, Table, StatTile, Toast, etc.
│  └─ pages/              # Login, Dashboard, Customers, Transactions, Invoices, Notifications, MobileMoney
└─ styles/tailwind.css
```

## Authentification (API)
Header requis pour les routes protégées :
```
Authorization: Bearer <token>
```
Token obtenu via `/api/auth/login` ou `/api/auth/register`.
- Mot de passe requis : min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial.

## Endpoints backend (rappel)
- Auth : `POST /api/auth/register`, `POST /api/auth/login` (mot de passe complexe requis)
- Clients : CRUD `/api/customers` (GET paginé `?page=1&limit=20&search=...`)
- Transactions : `/api/transactions` (GET paginé `?type=sale|expense&page=1&limit=50`, POST/PUT avec type via query ou body), stats `/api/stats` ou `/api/transactions/summary`, mensuel `/api/transactions/monthly`, catégories `/api/transactions/categories`
- Factures : CRUD `/api/invoices` (GET paginé `?page=1&limit=20`)
- Notifications : `/api/notifications`, `/api/notifications/unread`, `/api/notifications/unread/count`, `PATCH /api/notifications/:id/read`, `DELETE /api/notifications/:id`
- Mobile Money : `POST /api/mobile-money/mock`, `GET /api/mobile-money/history`

## Points d’attention
- Validations serveur via Joi (montant/date, items, etc.).
- Seed destructif : ne pas l’exécuter si vous devez conserver des données.
- SQLite pratique en dev ; pour prod, changer `DATABASE_URL` et provider Prisma (Postgres/MySQL).

## Dépannage
- Erreur JWT : vérifier `JWT_SECRET`.
- Base cassée : `npx prisma migrate dev` (ou `db push`), puis `npx prisma db seed`.
- Inspection base : `npx prisma studio`.
