# Kawari Finance App - Refactored

Une application de gestion financière simplifiée avec architecture moderne : **Express.js + MongoDB + React + TypeScript**.

## 🎯 Changements de la Refonte

### Backend
- ✅ **Base de données** : Remplacé Prisma par **Mongoose + MongoDB** (pas de compilation native)
- ✅ **API REST simplifiée** : endpoints légers sans logique complexe
- ✅ **Auth** : JWT + Refresh tokens, hash passwords (bcryptjs)
- ✅ **Modèles** : User, Customer, Transaction, Invoice, Notification, RefreshToken

### Frontend
- ✅ **Client HTTP** : Remplacé Axios + intercepteurs complexes par **fetch simple** (`apiInterceptor.ts`)
- ✅ **Gestion d'état** : TanStack Query pour sync réactive
- ✅ **Stockage token** : localStorage (clé: `token`)

## 📋 Prérequis

- **Node.js** : v20+ (ou v24.12.0)
- **npm** : v10+
- **MongoDB** : local (localhost:27017) ou Atlas
- **Git**

### Installation locale MongoDB (Windows)

1. Téléchargez MongoDB Community : https://www.mongodb.com/try/download/community
2. Installez avec path par défaut
3. Démarrez le service :
   ```powershell
   net start MongoDB  # ou via Services Windows
   ```

Vérifiez : `mongosh --nodb` → connecte-vous à `mongodb://localhost:27017`

## 🚀 Démarrage Rapide

### Terminal 1 : Backend

```powershell
cd backend
npm install
npm run seed:mongo    # Peuple MongoDB avec données test
npm run dev          # Démarre sur http://localhost:5000
```

**Comptes de test (après seed) :**
- Email: `admin@kawari.com` / Password: `Password123!`
- Email: `jean@kawari.com` / Password: `Password123!`
- Email: `marie@kawari.com` / Password: `Password123!`

### Terminal 2 : Frontend

```powershell
cd frontend
npm install
npm run dev          # Démarre sur http://localhost:5173
```

Ouvrez : http://localhost:5173 → Login avec admin@kawari.com / Password123!

## 🔌 Endpoints API

### Auth (Public)

```bash
# Register
POST /api/auth/register
Content-Type: application/json
{"name":"John","email":"john@example.com","password":"Password123!"}

# Login
POST /api/auth/login
{"email":"admin@kawari.com","password":"Password123!"}
# Retour: { user, token }

# Refresh token
POST /api/auth/refresh
(refreshToken en cookie httpOnly)

# Logout
POST /api/auth/logout
```

### Customers (Protégé)

```bash
# List
GET /api/customers
Authorization: Bearer <access_token>

# Create
POST /api/customers
{"name":"Acme Inc","email":"contact@acme.com","phone":"+226123456"}

# Get
GET /api/customers/:id

# Update
PUT /api/customers/:id
{"name":"Updated Name","email":"new@email.com"}

# Delete
DELETE /api/customers/:id
```

### Transactions (Protégé)

```bash
# List
GET /api/transactions
Authorization: Bearer <access_token>

# Create
POST /api/transactions
{
  "userId":"<mongo_id>",
  "customerId":"<mongo_id>",
  "type":"sale",
  "amount":150000,
  "currency":"XOF",
  "date":"2024-12-27T00:00:00Z",
  "description":"Vente",
  "paymentMethod":"Mobile Money",
  "category":"vente"
}

# Get
GET /api/transactions/:id

# Delete
DELETE /api/transactions/:id
```

### Invoices (Protégé)

```bash
# List
GET /api/invoices
Authorization: Bearer <access_token>

# Get (avec items)
GET /api/invoices/:id
```

## 🧪 Test avec cURL / PowerShell

### PowerShell (recommandé)

```powershell
# Register
$body = @{
  name = "TestUser"
  email = "testuser@example.com"
  password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $body

# Login
$body = @{
  email = "admin@kawari.com"
  password = "Password123!"
} | ConvertTo-Json

$resp = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body `
  -ResponseHeadersVariable headers

$token = $resp.token
Write-Host "Token: $token"

# Get customers
Invoke-RestMethod -Uri http://localhost:5000/api/customers `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

### cURL (cmd.exe)

```cmd
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@kawari.com\",\"password\":\"Password123!\"}"
```

## 📁 Architecture

```
backend/
├── src/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Customer.js
│   │   ├── Transaction.js
│   │   ├── Invoice.js
│   │   ├── Notification.js
│   │   └── RefreshToken.js
│   ├── simpleRoutes/        # Simplified REST controllers & routes
│   │   ├── authController.js
│   │   ├── authRoutes.js
│   │   ├── authMiddlewareSimple.js
│   │   ├── customersController.js
│   │   ├── transactionsController.js
│   │   └── invoicesController.js
│   ├── utils/               # JWT, hash, logger, validation
│   └── mongo.js             # MongoDB connection
├── server.js                # Express app
├── seed-mongo.js            # Seed script
└── package.json

frontend/
├── src/
│   ├── lib/
│   │   ├── apiInterceptor.ts    # Fetch-based HTTP client
│   │   ├── queryClient.ts       # TanStack Query setup
│   │   └── api.ts               # (optional Axios, unused now)
│   ├── pages/                   # React pages
│   ├── components/              # Reusable UI components
│   └── context/AuthContext.tsx  # Auth state
├── index.html
├── vite.config.ts
└── package.json
```

## 🔐 Variables d'Environnement

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGO_URI=mongodb://localhost:27017/kawari

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=30d
JWT_REFRESH_MAX_AGE_MS=2592000000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env.local)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🛠 Développement

### Format & Lint

```bash
# Backend : ESLint (optionnel)
cd backend && npm run lint

# Frontend : ESLint + Prettier (optionnel)
cd frontend && npm run lint && npm run format
```

### Hot Reload

- **Backend** : nodemon surveille les changements et redémarre
- **Frontend** : Vite HMR inclus (rechargement instantané)

## 📦 Build & Production

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm install --production
npm run build  # → dist/
npm run preview
```

Servez `frontend/dist/` avec un serveur web statique (Nginx, Vercel, etc.).

## Production

### Backend

1. Copiez `env.example` vers `.env` et ajustez les variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://votre-domaine-frontend` (liste possible: valeurs separees par des virgules)
   - `COOKIE_SAMESITE=none` si front et back sont sur des domaines differents
   - `COOKIE_SECURE=true` si HTTPS est actif (recommande en production)
2. Installez et lancez:
   ```powershell
   cd backend
   npm install
   npm run start
   ```

### Frontend

1. Definissez l'API:
   - `VITE_API_BASE_URL=https://votre-domaine-backend/api`
2. Build et previsualisation locale:
   ```powershell
   cd frontend
   npm install
   npm run build
   npm run preview
   ```

## 🐛 Troubleshooting

| Problème | Solution |
|----------|----------|
| **MongoDB not found** | Vérifiez que MongoDB tourne : `mongosh` sans paramètres |
| **CORS errors** | Vérifiez `FRONTEND_URL` dans `.env` backend (défaut: http://localhost:5173) |
| **Token expired** | Regénérez token via `/api/auth/refresh` (utilise cookie httpOnly) |
| **Validation error (400)** | Vérifiez structure JSON, champs obligatoires (name pour Customer, etc.) |
| **404 sur endpoint** | Endpoint n'existe pas. Consultez section "Endpoints API" ci-dessus. |

## 📚 Stack

- **Backend** : Express.js, Mongoose, bcryptjs, JWT
- **Frontend** : React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, Lucide Icons
- **Database** : MongoDB
- **Auth** : JWT + Refresh tokens (rotation)
- **HTTP** : Fetch API (simple, sans dépendances)

## 📝 Notes

1. **Ancien code Prisma** : Les fichiers `backend/src/routes/`, `backend/src/controllers/` utilisent toujours Prisma et sont ignorés. Routes actives : `backend/src/simpleRoutes/`.
2. **Suggestions, Notifications, Chatbot** : Endpoints stub activés (redirection vers ancien système). Peuvent être implémentés avec Mongoose si nécessaire.
3. **Seed MongoDB** : Crée 3 utilisateurs vendeurs + 6 clients + transactions/factures d'exemple. Exécutez une seule fois au démarrage.

## 🚢 Prochaines Étapes

- [ ] Tests unitaires (Jest + Supertest)
- [ ] CI/CD (GitHub Actions)
- [ ] Déploiement cloud (Vercel/Netlify frontend, Heroku/Railway backend)
- [ ] Implémentation endpoints avancés (reports, analytics)
- [ ] UI améliorations (dark mode, responsive mobile)

## 📧 Support

Pour problèmes ou questions, consultez les logs :
- Backend : console de `npm run dev`
- Frontend : DevTools (F12 → Console)

---

**Refonte complétée le 27 décembre 2025** ✨


## Updates (2025-12)

- Register payload now supports companyName: {"name":"John","companyName":"Acme SARL","email":"john@example.com","password":"Password123!"}
- Invoice versions: GET /api/invoices/:id/versions
- Suggestions endpoints: GET /api/suggestions, GET /api/suggestions/admin
- Chatbot endpoints: GET /api/chatbot/conversation, POST /api/chatbot/message
- Invoice versions stored in DB (v1, v2, v3). UI shows version badge.
- Create invoice from sale directly in Transactions list.

## Troubleshooting (Invoice number index)

If you see E11000 duplicate key error on invoices number: null, restart backend so the index is rebuilt as sparse.
