# Kawari Finance - Backend

API Node.js/Express pour un assistant financier destiné aux petites entreprises du Burkina Faso. Elle gère l’authentification, les clients, les ventes/dépenses, les factures, les notifications et un flux Mobile Money fictif, avec stockage via Prisma/SQLite.

## Périmètre et fonctionnalités
- Authentification JWT (inscription/connexion) avec mots de passe hachés (bcrypt).
- Gestion des clients (CRUD).
- Transactions scindées en ventes et dépenses, avec statistiques globales et mensuelles.
- Facturation (CRUD) incluant les lignes de facture.
- Notifications (création, lecture, suppression, compteur non lus).
- Simulation de paiements Mobile Money.
- Seeding Prisma pour obtenir des données de démo et un compte test.

## Stack technique
- Node.js + Express 5
- Prisma 5 + SQLite (fichier `prisma/dev.db`)
- JWT + bcryptjs
- CORS, dotenv, nodemon (dev)

## Pré-requis
- Node.js ≥ 18 (recommandé)
- npm

## Installation et lancement
```bash
cd backend
npm install

# Créer un fichier .env
copy NUL .env  # sous Windows, sinon: touch .env
```

Contenu recommandé pour `.env` :
```
PORT=5000
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET=change_me
```

Synchroniser la base et insérer les données de démo :
```bash
npx prisma migrate dev --name init      # ou npx prisma db push
npx prisma db seed                      # crée l’admin et les données exemples
```

Lancer l’API :
```bash
# mode simple
node server.js
# ou avec rechargement
npx nodemon server.js
```
L’API écoute par défaut sur `http://localhost:5000`.

## Données de démo (après seed)
- Email : `admin@kawari.com`
- Mot de passe : `password123`

## Structure des dossiers
```
backend/
├─ server.js                 # Point d’entrée Express
├─ prisma/
│  ├─ schema.prisma          # Modèle de données
│  └─ seed.js                # Seeding de la base
└─ src/
   ├─ controllers/           # Logique métier (auth, clients, transactions, etc.)
   ├─ middlewares/           # authMiddleware (JWT)
   ├─ routes/                # Définition des endpoints
   └─ utils/                 # Helpers (hash, jwt)
```

## Authentification
Toutes les routes (sauf `/api/auth/*`) exigent le header :
```
Authorization: Bearer <token>
```
Token obtenu via `/api/auth/login` ou `/api/auth/register`.

## Endpoints principaux

### Auth
- `POST /api/auth/register` — inscription `{ name, email, password }`
- `POST /api/auth/login` — connexion `{ email, password }` → `{ token, user }`

### Clients (protégé)
- `GET /api/customers` — liste
- `GET /api/customers/:id` — détail
- `POST /api/customers` — création `{ name, phone? }`
- `PUT /api/customers/:id` — mise à jour
- `DELETE /api/customers/:id` — suppression

### Ventes & dépenses (protégé)
Préfixes `/api/transactions/sales` et `/api/transactions/expenses`.
- `POST /api/transactions/sales` — créer une vente
- `GET /api/transactions/sales` — lister les ventes
- `GET /api/transactions/sales/:id` — détail vente
- `PUT /api/transactions/sales/:id` — mise à jour
- `DELETE /api/transactions/sales/:id` — suppression
- `POST /api/transactions/expenses` — créer une dépense
- `GET /api/transactions/expenses` — lister les dépenses
- `GET /api/transactions/expenses/:id` — détail dépense
- `PUT /api/transactions/expenses/:id` — mise à jour
- `DELETE /api/transactions/expenses/:id` — suppression

### Statistiques (protégé)
- `GET /api/stats` — agrégats globaux ventes/dépenses, notifications non lues, factures
- `GET /api/transactions/monthly` — stats mensuelles (ventes/dépenses)

### Factures (protégé)
- `GET /api/invoices` — liste (avec items)
- `GET /api/invoices/:id` — détail
- `POST /api/invoices` — création `{ customerId?, number?, total, issuedAt, status?, items[] }`
- `PUT /api/invoices/:id` — mise à jour
- `DELETE /api/invoices/:id` — suppression (supprime aussi les items)

### Notifications (protégé)
- `POST /api/notifications` — créer `{ message, type }`
- `GET /api/notifications` — lister
- `GET /api/notifications/unread` — non lues
- `GET /api/notifications/unread/count` — compteur
- `PATCH /api/notifications/:id/read` — marquer comme lue
- `DELETE /api/notifications/:id` — suppression

### Mobile Money fictif (protégé)
- `POST /api/mobile-money/mock` — crée une transaction Mobile Money `{ amount, currency, operator, customerId? }`
- `GET /api/mobile-money/history` — historique des paiements Mobile Money

## Modèle de données (Prisma)
- `User` — `id, name, email, passwordHash, createdAt`
- `Customer` — clients associés aux transactions et factures.
- `Transaction` — ventes et dépenses (type, amount, currency, date, paymentMethod, category, userId, customerId?).
- `Invoice` & `InvoiceItem` — factures et lignes de facture.
- `Notification` — message, type, lu/non lu, horodatage.

## Points d’attention
- Les validations de montant/date sont faites côté contrôleurs, mais prévoyez des validations côté front.
- Le schéma stocke `currency` en clair (ex. `XOF`), pas d’enum.
- SQLite est pratique pour le dev; passer à Postgres/MySQL en prod en ajustant `DATABASE_URL` et le provider Prisma.

## Dépannage
- Erreur JWT : vérifier `JWT_SECRET`.
- Problème de base : regénérer avec `npx prisma migrate dev` ou `npx prisma db push`, puis `npx prisma db seed`.
- Inspecter la base : `npx prisma studio`.
