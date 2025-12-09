# Kawari Finance – Backend

API Node.js/Express pour un assistant financier destiné aux petites entreprises du Burkina Faso. Elle couvre l’authentification, les clients, les ventes/dépenses, les factures, les notifications et un flux Mobile Money fictif, avec stockage Prisma/SQLite.

## Fonctionnalités
- Authentification JWT (inscription/connexion), mots de passe hachés (bcrypt).
- Gestion des clients (CRUD).
- Transactions : ventes et dépenses, stats globales et mensuelles.
- Facturation (CRUD) avec lignes d’article.
- Notifications (création, lecture, suppression, compteur non lus).
- Simulation de paiements Mobile Money.
- Seed Prisma idempotent (réinitialise les tables avant d’insérer les données de démo).

## Stack
- Node.js + Express 5
- Prisma 5 + SQLite (`backend/prisma/dev.db`)
- JWT + bcryptjs
- CORS, dotenv, nodemon (dev)

## Prérequis
- Node.js ≥ 18
- npm

## Installation
```bash
cd backend
npm install
```

## Environnement (.env)
- Fichier attendu : `backend/.env` (un exemple est fourni dans `env.example` à la racine).
- Variables minimales :
```
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=change_me
```
- Windows : `copy env.example backend/.env` puis ajuster les valeurs.
- Linux/macOS : `cp env.example backend/.env` puis ajuster.

## Base de données
Synchroniser le schéma et remplir la démo :
```bash
npx prisma migrate dev --name init   # ou: npx prisma db push
npx prisma db seed                   # réinitialise les tables, insère les données de démo
```
⚠️ Le seed supprime les données existantes (deleteMany sur toutes les tables).

## Lancement
```bash
node server.js          # lancement simple
npx nodemon server.js   # rechargement auto en dev
```
API par défaut sur `http://localhost:5000`.

## Compte de démo
- Email : `admin@kawari.com`
- Mot de passe : `password123`

## Structure
```
backend/
├─ server.js              # point d’entrée Express
├─ prisma/
│  ├─ schema.prisma       # modèle de données
│  └─ seed.js             # seed idempotent
└─ src/
   ├─ controllers/        # logique métier
   ├─ middlewares/        # authMiddleware (JWT)
   ├─ routes/             # endpoints
   └─ utils/              # hash, jwt
```

## Authentification
Toutes les routes sauf `/api/auth/*` requièrent :
```
Authorization: Bearer <token>
```
Token obtenu via `/api/auth/login` ou `/api/auth/register`.

## Endpoints

### Auth
- `POST /api/auth/register` — `{ name, email, password }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`

### Clients (protégé)
- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`

### Transactions (protégé)
Préfixes `/api/transactions/sales` et `/api/transactions/expenses`.
- `POST /api/transactions/sales`
- `GET /api/transactions/sales`
- `GET /api/transactions/sales/:id`
- `PUT /api/transactions/sales/:id`
- `DELETE /api/transactions/sales/:id`
- `POST /api/transactions/expenses`
- `GET /api/transactions/expenses`
- `GET /api/transactions/expenses/:id`
+- `PUT /api/transactions/expenses/:id`
- `DELETE /api/transactions/expenses/:id`

### Statistiques (protégé)
- `GET /api/stats` — totaux ventes/dépenses, notifications non lues, factures
- `GET /api/transactions/monthly` — stats mensuelles ventes/dépenses

### Factures (protégé)
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `POST /api/invoices` — `{ customerId?, number?, total, issuedAt, status?, items[] }`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id` — supprime aussi les items

### Notifications (protégé)
- `POST /api/notifications`
- `GET /api/notifications`
- `GET /api/notifications/unread`
- `GET /api/notifications/unread/count`
- `PATCH /api/notifications/:id/read`
- `DELETE /api/notifications/:id`

### Mobile Money fictif (protégé)
- `POST /api/mobile-money/mock` — `{ amount, currency, operator, customerId? }`
- `GET /api/mobile-money/history`

## Modèle Prisma
- `User` — id, name, email, passwordHash, createdAt
- `Customer` — clients liés aux transactions et factures
- `Transaction` — type sale/expense, amount, currency, date, paymentMethod, category, userId, customerId?
- `Invoice` & `InvoiceItem` — factures + lignes
- `Notification` — message, type, read, timestamps

## Dépannage
- Erreur JWT : vérifier `JWT_SECRET`.
- Base cassée : `npx prisma migrate dev` (ou `db push`), puis `npx prisma db seed`.
- Inspection base : `npx prisma studio`.
